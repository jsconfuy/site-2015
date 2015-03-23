var keystone = require('keystone'),
  async = require('async'),
  Ticket = keystone.list('Ticket'),
  Discount = keystone.list('Discount'),
  Attendee = keystone.list('Attendee'),
  Order = keystone.list('Order');

var USER_RESERVATION = 12; // Minutes
var CHECK_RESERVATION = USER_RESERVATION + 2;


var validate = function(ticket_code, discount_code, callback) {
  async.waterfall([
    // Get valid tickets
    function(next) {
      var messages = {};
      var query = Ticket.model.find();
      if (ticket_code) {
        query = query.where('code', ticket_code);
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
            price: Math.round(ticket.price * 100) / 100,
            limit: ticket.limit || 10000000,
            available: ticket.limit || 10000000,
            min: ticket.min,
            max: ticket.max,
          }
        });
        next(null, tickets, messages);
      });
    },
    // Check if the discount exists or if it is valid
    function(tickets, messages, next) {
      if (!discount_code) return next(null, tickets, null, messages);
      Discount.model.findOne().where('code', discount_code).where('valid.from').lte(Date.now()).where('valid.until').gte(Date.now()).exec(function(err, discount) {
        if (err) return next(err);
        if (!discount) {
          messages.invalid_discount = true;
          return next(null, tickets, null, messages);
        }
        tickets = tickets.filter(function(ticket) {
          return discount.tickets.indexOf(ticket.id) >= 0;
        });
        if (tickets.length == 0) {
          messages.invalid_discount = true;
          return next(null, [], null, messages);
        }
        var discount = {
          id: discount._id,
          code: discount.code,
          flat: discount.flat,
          percentage: discount.percentage,
          limit: discount.limit || 10000000,
          available: discount.limit || 10000000,
          min: discount.min,
          max: discount.max,
        };
        next(null, tickets, discount, messages);
      });
    },
  ], function(err, tickets, discount, messages) {
    callback(err, tickets, discount, messages);
  });
};

var available = function(ticket_code, discount_code, callback) {
  async.waterfall([
    // Get valid tickets and discount
    function(next) {
      validate(ticket_code, discount_code, next);
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
          ticket.max = Math.min(ticket.available, ticket.max);
        });
        next(null, tickets, discount, messages);
      });
    },
    // Discounts Availabilty
    function(tickets, discount, messages, next) {
      if (!discount || discount.limit == 0) return next(null, tickets, discount, messages);
      Order.model.aggregate([
        {
          $match: {
            discount: discount.id,
            canceled: null,
            $or: [
              {paid: {$ne: null}},
              {reserved: {$gte: new Date(Date.now() - CHECK_RESERVATION * 60000)}}
            ]
          }
        },{
          $group: {
            _id: '$discount',
            total: { $sum: '$quantity'}}
        }
      ]).exec(function(err, result) {
        if (err) return next(err);
        if (result.length) {
          discount.available -= result[0].total;
          discount.max = Math.min(discount.available, discount.max);
        }
        next(null, tickets, discount, messages);
      });
    },
  ], function(err, tickets, discount, messages) {
    callback(err, tickets, discount, messages);
  });
};

var select = function(ticket_code, discount_code, quantity, callback) {
  async.waterfall([
    function(next) {
      validate(ticket_code, discount_code, next);
    },
    // Create order
    function(tickets, discount, messages, next) {
      if (tickets.length == 0) return next({code: 'INVALID_TICKET', message: 'Invalid ticket: ' + ticket_code});
      if (discount_code && !discount) return next({code: 'INVALID_DISCOUNT', message: 'Invalid discount: ' + discount_code});
      var ticket = tickets[0];
      var order = Order.model({
        ticket: ticket.id,
        discount: discount && discount.id,
        paid: null,
        reserved: null,
        canceled: null,
        quantity: 0,
      });
      quantity = Math.max(Math.min(quantity, ticket.max, discount ? discount.max : ticket.max), ticket.min, discount ? discount.min : ticket.min);
      order.save(function(err) {
        if (err) return next(err);
        next(null, order, messages);
      });
    },
    // Reserve order
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
    // Check ticket availability if applied
    function(order, messages, next) {
      if (order.ticket.limit == 0) return next(null, order, messages);
      Order.model.aggregate([
        {
          $match: {
            ticket: order.ticket._id,
            canceled: null,
            $or: [
              {paid: {$ne: null}},
              {reserved: {
                $gte: new Date(Date.now() - CHECK_RESERVATION * 60000),
                $lte: order.reserved,
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
        var total = 0;
        if (result.length) total = result[0].total;
        if (total > order.ticket.limit) {
          messages.less_available = true;
          quantity = order.quantity - (total - order.ticket.limit);
          if (quantity <= 0) {
            messages.sold_out = true;
            quantity = 0;
          }
          order.quantity = quantity;
          order.canceled = quantity == 0 ? order.canceled : Date.now();
          order.update({$set: {quantity: order.quantity, canceled: order.canceled}}, {}, function(err) {
            if (err) return next(err);
            next(null, order, messages);
          });
        } else {
          next(null, order, messages);
        }
      });
    },
    // Check discount availability
    function(order, messages, next) {
      if (!order.discount || order.discount.limit == 0) return next(null, order, messages);
      Order.model.aggregate([
        {
          $match: {
            discount: order.discount._id,
            canceled: null,
            $or: [
              {paid: {$ne: null}},
              {reserved: {
                $gte: new Date(Date.now() - CHECK_RESERVATION * 60000),
                $lte: order.reserved,
              }}
            ]
          }
        },{
          $group: {
            _id: '$discount',
            total: { $sum: '$quantity'}}
        }
      ]).exec(function(err, result) {
        if (err) return next(err);
        var total = 0;
        if (result.length) total = result[0].total;
        if (total > order.discount.limit) {
          messages.less_available = true;
          quantity = order.quantity - (total - order.discount.limit);
          if (quantity <= 0) {
            messages.sold_out = true;
            quantity = 0;
          }
          order.quantity = quantity;
          order.canceled = quantity == 0 ? order.canceled : Date.now();
          order.update({$set: {quantity: order.quantity, canceled: order.canceled}}, {}, function(err) {
            if (err) return next(err);
            next(null, order, messages);
          });
        } else {
          next(null, order, messages);
        }
      });
    },
    // Set price
    function(order, messages, next) {
      var priceTicket = Math.round(order.ticket.price * 100) / 100;
      var priceDiscount = Math.round(Ticket.calculateDiscount(order.ticket, order.discount) * 100) / 100;
      order.price.ticket = priceTicket;
      order.price.discount = priceDiscount;
      order.total = (priceTicket - priceDiscount) * order.quantity;
      order.paid = order.total > 0 ? order.paid : Date.now();
      order.update({$set: {'price.ticket': order.price.ticket, 'price.discount': order.price.discount, 'total': order.total, paid: order.paid}}, {}, function(err) {
        if (err) return next(err);
        if (order.paid) {
          // Send email if paid
          order.sendOrderConfirmation(function(err){
            if (err) return next(err);
            next(null, order, messages);
          });
        } else {
          next(null, order, messages);
        }
      });
    },
  ], function(err, order, messages) {
    console.log(err);
    callback(err, order, messages);
  });
};

var assign = function(order_id, callback) {
  async.waterfall([
    function(next) {
      var messages = [];
      Order.model.findOne({_id: order_id, paid: {$ne: null}}).populate('ticket discount').exec(function(err, order){
        if (err) return next(err);
        // TODO: check order!
        Attendee.model.find({order: order._id}).exec(function(err, attendees){
          if (err) return next(err);
          next(null, order, attendees, messages);
        });
      });
    },
    function(order, attendees, messages, next) {
      var remaining = order.quantity - attendees.length;
      var create = function() {
        if (remaining <= 0) return next(null, order, attendees, messages);
        var attendee = Attendee.model({
          order: order._id,
          ticket: order.ticket._id,
          discount: order.discount ? order.discount._id : null,
          price: order.price.ticket - order.price.discount,
        });
        attendee.save(function(err) {
          if (err) return next(err);
          attendees.push(attendee);
          remaining -= 1;
          create();
        });
      }
      create();
    },
  ], function(err, order, attendees, messages) {
    console.log(err);
    callback(err, order, attendees, messages);
  });
};

var save = function(data, callback) {
  async.waterfall([
    function(next) {
      var messages = [];
      Order.model.findOne({_id: data.order, paid: {$ne: null}}).populate('ticket discount').exec(function(err, order){
        if (err) return next(err);
        // TODO: check order!
        Attendee.model.find({order: order._id}).exec(function(err, attendees){
          if (err) return next(err);
          next(null, order, attendees, messages);
        });
      });
    },
    function(order, attendees, messages, next) {
      var saveAll = function(){
        if (attendees.length == 0) return next(null, messages);
        var attendee = attendees.pop();
        attendee.name = data[attendee._id + '_name'];
        attendee.email = data[attendee._id + '_email'];
        attendee.tshirt = data[attendee._id + '_tshirt'];
        attendee.comments = data[attendee._id + '_comments'];
        attendee.save(function(err){
          if (err) return next(err);
          saveAll();
        })
      }
      saveAll();
    },
  ], function(err, messages) {
    console.log(err);
    callback(err, messages);
  });
};

exports = module.exports = {
  available: function(req, res) {
    available(req.query.ticket, req.query.discount, function(err, tickets, discount, messages) {
      if (err) return res.apiResponse({error: err});
      tickets = tickets.filter(function(ticket) {
        return ticket.available > 0 && (!discount || discount.available > 0);
      }).map(function(ticket) {
        return {
          code: ticket.code,
          name: ticket.name,
          available: Math.min(ticket.available, discount ? discount.available : ticket.available),
          min: Math.max(ticket.min, discount ? discount.min : ticket.min),
          max: Math.min(ticket.max, discount ? discount.max : ticket.max),
          price: (Math.round(ticket.price * 100) / 100) - (Math.round(Ticket.calculateDiscount(ticket, discount) * 100) / 100),
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
      if (err) return res.apiResponse({error: err});
      order = {
        id: order._id,
        ticket: order.ticket.name,
        quantity: order.quantity,
        paid: !!order.paid,
        price: order.price.ticket - order.price.discount,
        total: order.total
      }
      return res.apiResponse({order: order, messages: messages});
    });
  },
  assign: function(req, res) {
    assign(req.query.order, function(err, order, attendees, messages) {
      if (err) return res.apiResponse({error: err});
      order = {
        id: order._id,
        paid: !!order.paid,
      }
      attendees = attendees.map(function(attendee) {
        return {
          id: attendee._id,
          name: attendee.name,
          email: attendee.email,
          tshirt: attendee.tshirt,
          comments: attendee.comments,
        };
      });
      return res.apiResponse({order: order, attendees: attendees, messages: messages});
    });
  },
  save: function(req, res) {
    save(req.body, function(err,  messages) {
      if (err) return res.apiResponse({error: err});
      return res.apiResponse({messages: messages});
    });
  }
};
