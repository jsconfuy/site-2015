var keystone = require('keystone'),
  async = require('async'),
  Ticket = keystone.list('Ticket'),
  Discount = keystone.list('Discount'),
  Order = keystone.list('Order');

var USER_RESERVATION = 15; // Minutes
var CHECK_RESERVATION = USER_RESERVATION + 2;

var getAvailables = function(ticket, discount, callback) {
  var data = {tickets: []};
  async.series([
    function(next) {
      // Get valid tickets
      var query = Ticket.model.find();
      if (ticket) {
        query = query.where('_id', ticket);
      } else {
        query = query.where('secret', false);
      }
      query = query.where('sale.from').lte(Date.now());
      query = query.where('sale.until').gte(Date.now());
      query.exec(function(err, results) {
        if (err || !results.length) return next();
        data.tickets = results.map(function(ticket) {
          return {
            id: ticket._id,
            name: ticket.name,
            price: ticket.price,
            available: ticket.limit || 10000000,
          }
        });
        return next();
      });
    },
    function(next) {
      // Check if the discount exists or if it is valid
      if (!discount || !data.tickets.length) return next();
      Discount.model.findOne().where('code', discount).where('valid.from').lte(Date.now()).where('valid.until').gte(Date.now()).exec(function(err, result) {
        if (result) {
          data.discount = {
            id: result._id,
            code: result.code,
            flat: result.flat,
            percentage: result.percentage,
            limit: result.limit,
          };
          tickets = data.tickets.filter(function(ticket) {
            return result.tickets.indexOf(ticket.id) >= 0;
          });
          if (tickets.length) {
            data.tickets = tickets;
            return next();
          }
        }
        data.discount = { invalid: true, code: discount };
        return next();
      });
    },
    function(next) {
      // Tickets Availabilty
      Order.model.aggregate([
        {
          $match: {
            ticket: {$in: data.tickets.map(function(ticket) { return ticket.id; })},
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
        result.forEach(function(reserved){
          ticket = data.tickets.filter(function(t) { return t.id.equals(reserved._id); })[0];
          ticket.available -= reserved.total;
        });
        return next();
      });
    },
    function(next) {
      // TODO: Discounts Availabilty
      return next();
    },
  ], function(err) {
    callback(err, data);
  });
};

exports = module.exports = {
  available: function(req, res) {
    getAvailables(req.query.ticket, req.query.discount, function(err, data) {
      data.tickets = data.tickets.filter(function(ticket) {
        return ticket.available > 0;
      }).map(function(ticket) {
        return {
          id: ticket.id,
          name: ticket.name,
          price: data.discount && !data.discount.invalid ? (ticket.price - data.discount.flat) * (1 - data.discount.percentage / 100)  : ticket.price,
        };
      });
      return res.apiResponse(data);
    });
  },
  reserve: function(req, res) {
    return res.apiResponse({});
  },
  checkout: function(req, res) {
    return res.apiResponse({});
  }
};
