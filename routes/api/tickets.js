var keystone = require('keystone'),
  async = require('async'),
  Ticket = keystone.list('Ticket'),
  Discount = keystone.list('Discount'),
  Order = keystone.list('Order'),
  Twocheckout = require('2checkout-node');

var USER_RESERVATION = 12; // Minutes
var CHECK_RESERVATION = USER_RESERVATION + 2;

var available = function(ticket, discount, callback) {
  async.waterfall([
    // Get valid tickets
    function(next) {
      var messages = {};
      var query = Ticket.model.find();
      if (ticket) {
        query = query.where('code', ticket);
      } else {
        query = query.where('secret', false);
      }
      query = query.where('sale.from').lte(Date.now());
      query = query.where('sale.until').gte(Date.now());
      query.exec(function(err, results) {
        if (err) return next(err);
        if (!results.length) return next(null, [], messages);
        var tickets = results.map(function(ticket) {
          return {
            id: ticket._id,
            code: ticket.code,
            name: ticket.name,
            price: ticket.price,
            available: ticket.limit || 10000000,
          }
        });
        next(null, tickets, messages);
      });
    },
    // Check if the discount exists or if it is valid
    function(tickets, messages, next) {
      if (!discount) return next(null, tickets, null, messages);
      Discount.model.findOne().where('code', discount).where('valid.from').lte(Date.now()).where('valid.until').gte(Date.now()).exec(function(err, result) {
        if (err) return next(err);
        if (!result) {
          messages.invalid_discount = true;
          return next(null, tickets, null, messages);
        }
        var discount = {
          id: result._id,
          code: result.code,
          flat: result.flat,
          percentage: result.percentage,
          limit: result.limit,
        };
        tickets = tickets.filter(function(ticket) {
          return result.tickets.indexOf(ticket.id) >= 0;
        });
        if (tickets.length) return next(null, tickets, discount, messages);
        messages.invalid_discount = true;
        next(null, [], null, messages);
      });
    },
    // Tickets Availabilty
    function(tickets, discount, messages, next) {
      Order.model.aggregate([
        {
          $match: {
            ticket: {$in: tickets.map(function(ticket) { return ticket.id; })},
            canceled: null,
            $or: [
              {paid: {$ne: null}},
              {reserved: {$gte: new Date(Date.now() - CHECK_RESERVATION * 60000)}}
            ]
          }
        },{
          $group: {
            _id: '$ticket',
            total: { $sum: '$quantity'}}
        }
      ]).exec(function(err, result) {
        if (err) return next(err);
        result.forEach(function(reserved){
          ticket = tickets.filter(function(t) { return t.id.equals(reserved._id); })[0];
          ticket.available -= reserved.total;
        });
        next(null, tickets, discount, messages);
      });
    },
    // TODO: Discounts Availabilty
    function(tickets, discount, messages, next) {
      next(null, tickets, discount, messages);
    },
    function(tickets, discount, messages, next) {
      tickets = tickets.filter(function(ticket) {
        return ticket.available > 0;
      });
      tickets.forEach(function(ticket) {
        ticket.price = discount ? (ticket.price - discount.flat) * (1 - discount.percentage / 100)  : ticket.price;
      });
      next(null, tickets, discount, messages);
    },
  ], function(err, tickets, discount, messages) {
    callback(err, tickets, discount, messages);
  });
};

var select = function(ticket, discount, quantity, callback) {
  async.waterfall([
    function(next) {
      available(ticket, discount, next);
    },
    function(tickets, discount, messages, next) {
      // TODO: check tickets
      // TODO: check discount
      var ticket = tickets[0];
      var price = discount ? (ticket.price - discount.flat) * (1 - discount.percentage / 100)  : ticket.price;
      var order = Order.model({
        ticket: ticket.id,
        discount: discount && discount.id,
        paid: null,
        reserved: null,
        canceled: null,
        quantity: 0,
        price: price,
        total: price * quantity,
      });
      order.save(function(err) {
        if (err) return next(err);
        next(null, order, messages);
      });
    },
    function(order, messages, next) {
      // FIXME: We cannot use Timestamp in mongoose.
      // We need to $set almost one field to get $currentDate works properly.
      order.update({$set: {quantity: quantity}, $currentDate: {reserved: true}}, {}, function(err){
        if (err) return next(err);
        Order.model.findOne({_id: order._id}).populate('ticket discount').exec(function(err, order){
          if (err) return next(err);
          next(null, order, messages);
        });
      });
    },
    // Check ticket availability
    function(order, messages, next) {
      Order.model.aggregate([
        {
          $match: {
            ticket: order.ticket._id,
            canceled: null,
            $or: [
              {paid: {$ne: null}},
              {reserved: {
                $gte: new Date(Date.now() - CHECK_RESERVATION * 60000),
                $lt: order.reserved,
              }}
            ]
          }
        },{
          $group: {
            _id: '$ticket',
            total: { $sum: '$quantity'}}
        }
      ]).exec(function(err, result) {
        if (err) return next(err);
        var available = {}
        var total = 0;
        if (result.length) {
          total = result[0].total;
        }
        if (order.ticket.total > 0 && order.ticket.total < total + order.quantity) {
          messages.less_available = true;
          quantity = order.ticket.total - total;
          if (quantity <= 0) {
            messages.sold_out = true;
            quantity = 0;
            // TODO: mark as canceled
          }
          order.update({$set: {quantity: quantity}}, {}, function(err){
            next(null, order, messages);
          });
        } else {
          next(null, order, messages);
        }
      });
    },
  ], function(err, order, messages) {
    callback(err, order, messages);
  });
};

var checkout = function(data, callback) {
  async.waterfall([
    // Get and validate ticket
    function(next) {
      var messages = {};
      Order.model.findOne({
        _id: data.order,
        canceled: null,
        $or: [
          {paid: {$ne: null}},
          {reserved: {$gte: new Date(Date.now() - USER_RESERVATION * 60000)}}
        ]
      }).populate('ticket discount').exec(function(err, result){
        if (err) return next(err);
        next(null, result, messages);
      });
    },
    // Make purchase
    function(order, messages, next) {
      var tco = new Twocheckout({
        sellerId: process.env.TWOCO_SELLER_ID,
        privateKey: process.env.TWOCO_PRIVATE_KEY,
        sandbox: process.env.TWOCO_ENV == 'sandbox' ? true : false,
      });
      var params = {
        'merchantOrderId': order._id,
        'token': data.token,
        'currency': 'USD',
        'total': order.total,
        'lineItems': [{
          'type': 'product',
          'name': order.ticket.name + (order.discount ? ' (CODE: ' + order.discount.name  + ')' : ''),
          'productId': order.ticket._id,
          'tangible': 'N',
          'quantity': order.quantity,
          'price': order.price,
        }],
        'billingAddr': {
          'name': data.name,
          'email': data.email,
          'addrLine1': data.address1,
          'addrLine2': data.address2,
          'city': data.city,
          'state': data.state,
          'zipCode': data.postcode,
          'country': data.country,
        }
      };
      tco.checkout.authorize(params, function (error, data) {
        if (error) {
          return next(error.message);
        } else {
          // TODO: mark as paid
          // response.send(data.response.responseMsg);
          next(null, order, messages);
        }
      });
    },
    // TODO: Send email!
    function(order, messages, next) {
      next(null, order, messages);
    },
  ], function(err, order, messages) {
    callback(err, order, messages);
  });
};


exports = module.exports = {
  available: function(req, res) {
    available(req.query.ticket, req.query.discount, function(err, tickets, discount, messages) {
      // TODO: Check err
      tickets = tickets.map(function(ticket) {
        return {
          code: ticket.code,
          name: ticket.name,
          price: ticket.price,
        };
      });
      if (discount) {
        discount = {
          code: discount.code
        }
      }
      return res.apiResponse({tickets: tickets, discount: discount, messages: messages});
    });
  },
  select: function(req, res) {
    select(req.body.ticket, req.body.discount, req.body.quantity, function(err, order, messages) {
      // TODO: Check err
      if (order) {
        order = {
          id: order._id,
          ticket: order.ticket.name,
          quantity: order.quantity,
          price: order.price,
          total: order.total
        }
      }
      return res.apiResponse({order: order, messages: messages});
    });
  },
  checkout: function(req, res) {
    checkout(req.body, function(err, order, messages) {
      // TODO: Check err
      if (order) {
        order = {id: order._id}
      }
      return res.apiResponse({order: order, messages: messages});
    });
  }
};
