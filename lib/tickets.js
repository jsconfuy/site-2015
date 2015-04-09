var keystone = require('keystone')
var async = require('async')
var request = require('request')
var Ticket = keystone.list('Ticket')
var Discount = keystone.list('Discount')
var Attendee = keystone.list('Attendee')
var Order = keystone.list('Order')
var ApiError = require('./apierror')

var USER_RESERVATION = process.env.TICKET_RESERVATION // Minutes
var AVAILABLE_RESERVATION = USER_RESERVATION + 2
var PURCHASE_RESERVATION = AVAILABLE_RESERVATION + 2

var validate = function (ticket_code, discount_code, callback) {
  async.waterfall([
    // Get valid tickets
    function (next) {
      var messages = {}
      var query = Ticket.model.find()
      if (ticket_code) {
        query = query.where('code', ticket_code)
      } else {
        query = query.where('secret', false)
      }
      query = query.where('sale.from').lte(Date.now())
      query = query.where('sale.until').gte(Date.now())
      query.exec(function (err, results) {
        if (err) return next(new ApiError(err.message, 'DB', true))
        if (!results.length) return next(null, [], messages)
        var tickets = results.map(function (ticket) {
          return {
            id: ticket._id,
            code: ticket.code,
            name: ticket.name,
            price: Math.round(ticket.price * 100) / 100,
            limit: ticket.limit || 10000000,
            available: ticket.limit || 10000000,
            min: ticket.min,
            max: ticket.max
          }
        })
        next(null, tickets, messages)
      })
    },
    // Check if the discount exists or if it is valid
    function (tickets, messages, next) {
      if (!discount_code) return next(null, tickets, null, messages)
      Discount.model.findOne().where('code', discount_code).where('valid.from').lte(Date.now()).where('valid.until').gte(Date.now()).exec(function (err, discount) {
        if (err) return next(new ApiError(err.message, 'DB', true))
        if (!discount) {
          messages.invalid_discount = true
          return next(null, tickets, null, messages)
        }
        tickets = tickets.filter(function (ticket) {
          return discount.tickets.indexOf(ticket.id) >= 0
        })
        if (tickets.length === 0) {
          messages.invalid_discount = true
          return next(null, [], null, messages)
        }
        discount = {
          id: discount._id,
          code: discount.code,
          flat: discount.flat,
          percentage: discount.percentage,
          limit: discount.limit || 10000000,
          available: discount.limit || 10000000,
          min: discount.min,
          max: discount.max
        }
        next(null, tickets, discount, messages)
      })
    }
  ], function (err, tickets, discount, messages) {
    callback(err, tickets, discount, messages)
  })
}

exports.available = function (ticket_code, discount_code, callback) {
  async.waterfall([
    // Get valid tickets and discount
    function (next) {
      validate(ticket_code, discount_code, next)
    },
    // Tickets Availabilty
    function (tickets, discount, messages, next) {
      Order.model.aggregate([
        {
          $match: {
            ticket: {$in: tickets.map(function (ticket) { return ticket.id })},
            canceled: null,
            $or: [
              {paid: {$ne: null}},
              {reserved: {$gte: new Date(Date.now() - AVAILABLE_RESERVATION * 60000)}}
            ]
          }
        }, {
          $group: {
            _id: '$ticket',
            total: { $sum: '$quantity'}}
        }
      ]).exec(function (err, result) {
        if (err) return next(new ApiError(err.message, 'DB', true))
        result.forEach(function (reserved) {
          var ticket = tickets.filter(function (t) { return t.id.equals(reserved._id) })[0]
          ticket.available -= reserved.total
          ticket.max = Math.min(ticket.available, ticket.max)
        })
        next(null, tickets, discount, messages)
      })
    },
    // Discounts Availabilty
    function (tickets, discount, messages, next) {
      if (!discount || discount.limit === 0) return next(null, tickets, discount, messages)
      Order.model.aggregate([
        {
          $match: {
            discount: discount.id,
            canceled: null,
            $or: [
              {paid: {$ne: null}},
              {reserved: {$gte: new Date(Date.now() - AVAILABLE_RESERVATION * 60000)}}
            ]
          }
        }, {
          $group: {
            _id: '$discount',
            total: { $sum: '$quantity'}}
        }
      ]).exec(function (err, result) {
        if (err) return next(new ApiError(err.message, 'DB', true))
        if (result.length) {
          discount.available -= result[0].total
          discount.max = Math.min(discount.available, discount.max)
        }
        next(null, tickets, discount, messages)
      })
    }
  ], function (err, tickets, discount, messages) {
    callback(err, tickets, discount, messages)
  })
}

exports.select = function (ticket_code, discount_code, quantity, callback) {
  async.waterfall([
    function (next) {
      validate(ticket_code, discount_code, next)
    },
    // Create order
    function (tickets, discount, messages, next) {
      if (tickets.length === 0) return next({code: 'INVALID_TICKET', message: 'Invalid ticket: ' + ticket_code})
      if (discount_code && !discount) return next({code: 'INVALID_DISCOUNT', message: 'Invalid discount: ' + discount_code})
      var ticket = tickets[0]
      var order = Order.model({
        ticket: ticket.id,
        discount: discount && discount.id,
        paid: null,
        reserved: null,
        canceled: null,
        quantity: 0
      })
      quantity = Math.max(Math.min(quantity, ticket.max, discount ? discount.max : ticket.max), ticket.min, discount ? discount.min : ticket.min)
      order.save(function (err) {
        if (err) return next(new ApiError(err.message, 'DB', true))
        next(null, order, messages)
      })
    },
    // Reserve order
    function (order, messages, next) {
      // FIXME: We cannot use Timestamp in mongoose.
      // We need to $set almost one field to get $currentDate works properly.
      order.update({$set: {quantity: quantity}, $currentDate: {reserved: true}}, {}, function (err) {
        if (err) return next(new ApiError(err.message, 'DB', true))
        Order.model.findOne({_id: order._id}).populate('ticket discount').exec(function (err, order) {
          if (err) return next(err)
          next(null, order, messages)
        })
      })
    },
    // Check ticket availability if applied
    function (order, messages, next) {
      if (order.ticket.limit === 0) return next(null, order, messages)
      Order.model.aggregate([
        {
          $match: {
            ticket: order.ticket._id,
            canceled: null,
            $or: [
              {paid: {$ne: null}},
              {reserved: {
                $gte: new Date(Date.now() - AVAILABLE_RESERVATION * 60000),
                $lte: order.reserved
              }}
            ]
          }
        }, {
          $group: {
            _id: '$ticket',
            total: { $sum: '$quantity'}}
        }
      ]).exec(function (err, result) {
        if (err) return next(new ApiError(err.message, 'DB', true))
        var total = 0
        if (result.length) total = result[0].total
        if (total > order.ticket.limit) {
          messages.less_available = true
          quantity = order.quantity - (total - order.ticket.limit)
          if (quantity <= 0) {
            messages.sold_out = true
            quantity = 0
          }
          order.quantity = quantity
          order.canceled = quantity === 0 ? order.canceled : Date.now()
          order.update({$set: {quantity: order.quantity, canceled: order.canceled}}, {}, function (err) {
            if (err) return next(new ApiError(err.message, 'DB', true))
            next(null, order, messages)
          })
        } else {
          next(null, order, messages)
        }
      })
    },
    // Check discount availability
    function (order, messages, next) {
      if (!order.discount || order.discount.limit === 0) return next(null, order, messages)
      Order.model.aggregate([
        {
          $match: {
            discount: order.discount._id,
            canceled: null,
            $or: [
              {paid: {$ne: null}},
              {reserved: {
                $gte: new Date(Date.now() - AVAILABLE_RESERVATION * 60000),
                $lte: order.reserved
              }}
            ]
          }
        }, {
          $group: {
            _id: '$discount',
            total: { $sum: '$quantity'}}
        }
      ]).exec(function (err, result) {
        if (err) return next(new ApiError(err.message, 'DB', true))
        var total = 0
        if (result.length) total = result[0].total
        if (total > order.discount.limit) {
          messages.less_available = true
          quantity = order.quantity - (total - order.discount.limit)
          if (quantity <= 0) {
            messages.sold_out = true
            quantity = 0
          }
          order.quantity = quantity
          order.canceled = quantity === 0 ? order.canceled : Date.now()
          order.update({$set: {quantity: order.quantity, canceled: order.canceled}}, {}, function (err) {
            if (err) return next(new ApiError(err.message, 'DB', true))
            next(null, order, messages)
          })
        } else {
          next(null, order, messages)
        }
      })
    },
    // Set price
    function (order, messages, next) {
      var priceTicket = Math.round(order.ticket.price * 100) / 100
      var priceDiscount = Math.round(Ticket.calculateDiscount(order.ticket, order.discount) * 100) / 100
      order.price.ticket = priceTicket
      order.price.discount = priceDiscount
      order.total = (priceTicket - priceDiscount) * order.quantity
      order.paid = order.total > 0 ? order.paid : Date.now()
      order.update({$set: {'price.ticket': order.price.ticket, 'price.discount': order.price.discount, 'total': order.total, paid: order.paid}}, {}, function (err) {
        if (err) return next(new ApiError(err.message, 'DB', true))
        if (order.paid) {
          // Send email if paid
          order.sendOrderConfirmation(function (err) {
            if (err) return next(new ApiError(err.message, 'EMAIL', true))
            next(null, order, messages)
          })
        } else {
          next(null, order, messages)
        }
      })
    }
  ], function (err, order, messages) {
    callback(err, order, messages)
  })
}

exports.assign = function (order_id, callback) {
  async.waterfall([
    function (next) {
      var messages = []
      Order.model.findOne({_id: order_id, paid: {$ne: null}}).populate('ticket discount').exec(function (err, order) {
        if (err) return next(new ApiError(err.message, 'DB', true))
        if (!order) return next(new ApiError('Invalid order.', 'INVALID_ORDER', false))
        Attendee.model.find({order: order._id}).exec(function (err, attendees) {
          if (err) return next(err)
          next(null, order, attendees, messages)
        })
      })
    },
    function (order, attendees, messages, next) {
      var remaining = order.quantity - attendees.length
      var create = function () {
        if (remaining <= 0) return next(null, order, attendees, messages)
        var attendee = Attendee.model({
          order: order._id,
          ticket: order.ticket._id,
          discount: order.discount ? order.discount._id : null,
          price: order.price.ticket - order.price.discount
        })
        attendee.save(function (err) {
          if (err) return next(new ApiError(err.message, 'DB', true))
          attendees.push(attendee)
          remaining -= 1
          create()
        })
      }
      create()
    }
  ], function (err, order, attendees, messages) {
    callback(err, order, attendees, messages)
  })
}

exports.save = function (order_id, fill, callback) {
  async.waterfall([
    function (next) {
      var messages = []
      Order.model.findOne({_id: order_id, paid: {$ne: null}}).populate('ticket discount').exec(function (err, order) {
        if (err) return next(new ApiError(err.message, 'DB', true))
        if (!order) return next(new ApiError('Invalid order.', 'INVALID_ORDER', false))
        Attendee.model.find({order: order._id}).exec(function (err, attendees) {
          if (err) return next(new ApiError(err.message, 'DB', true))
          next(null, order, attendees, messages)
        })
      })
    },
    function (order, attendees, messages, next) {
      var saveAll = function () {
        if (attendees.length === 0) return next(null, messages)
        var attendee = attendees.pop()
        fill(attendee)
        attendee.save(function (err) {
          if (err) return next(new ApiError(err.message, 'DB', true))
          saveAll()
        })
      }
      saveAll()
    }
  ], function (err, messages) {
    callback(err, messages)
  })
}

exports.purchase = function (order_id, query, callback) {
  if (order_id) { // Intentional purchase
    Order.model.findOne({
      _id: order_id,
      canceled: null
    }).populate('ticket discount').exec(function (err, order) {
      if (err) return callback(new ApiError(err.message, 'DB', true))
      if (!order) return callback(new ApiError('Invalid order.', 'INVALID_ORDER', false))
      var processed = !!order.paid
      var valid_date = (new Date(Date.now() - USER_RESERVATION * 60000)) < order.reserved
      if (valid_date || order.paid) {
        callback(null, order, processed)
      } else {
        callback(new ApiError('Expired reservation. We\'ll contact you by email.', 'EXPIRED_RESERVATION', false))
      }
    })
  } else if (process.env.GATEWWAY === 'twoco' && query.key) { // Back from 2CO
    Order.model.findOne({
      _id: query.merchant_order_id,
      canceled: null
    }).populate('ticket discount').exec(function (err, order) {
      if (err) return callback(new ApiError(err.message, 'DB', true))
      if (!order) return callback(new ApiError('Invalid order.', 'INVALID_ORDER', false))
      var processed = true
      var key = process.env.TWOCO_SECRET_WORD + '' + process.env.TWOCO_SELLER_ID + '' + query.order_number + order.total.toFixed(2)
      var hash = require('crypto').createHash('md5').update(key).digest('hex').toUpperCase()
      var valid_date = (new Date(Date.now() - PURCHASE_RESERVATION * 60000)) < order.reserved
      if (!valid_date) {
        callback(new ApiError('Expired reservation.', 'EXPIRED_PURCHASE', false))
      } else if (query.key === hash) {
        order.name = query.first_name + ' ' + query.last_name
        order.email = query.email
        order.paid = Date.now()
        order.payment.gateway = '2checkout'
        order.payment.order = query.order_number
        order.payment.invoice = query.invoice_id
        order.payment.data = query
        order.save(function (err) {
          if (err) return callback(new ApiError(err.message, 'DB', true))
          order.sendOrderConfirmation(function (err) {
            if (err) return callback(new ApiError(err.message, 'Email', true))
            callback(null, order, processed)
          })
        })
      } else {
        callback(new ApiError('Invalid authorization from 2Checkout. We\'ll contact you by email.', 'INVALID_PURCHASE', false))
      }
    })
  } else if (process.env.GATEWAY === 'paypal' && query.tx) { // Back from PayPal
    var url = process.env.PAYPAL_ENV === 'sandbox' ? 'https://www.sandbox.paypal.com/cgi-bin/webscr' : 'https://www.paypal.com/cgi-bin/webscr'
    request.post({url: url, formData: {'cmd': '_notify-synch', 'tx': query.tx, 'at': process.env.PAYPAL_TOKEN}}, function (err, response, body) {
      if (err) return callback(new ApiError(err.message, 'PAYPAL', true))
      var result = {}
      body.split('\n').forEach(function (item) {
        var kv = item.split('=', 2)
        if (kv[0]) {
          if (kv.length === 2) {
            result[kv[0]] = kv[1]
          } else {
            result['status'] = kv[0]
          }
        }
      })
      var processed = true
      Order.model.findOne({
        _id: result.invoice,
        canceled: null
      }).populate('ticket discount').exec(function (err, order) {
        if (err) return callback(new ApiError(err.message, 'DB', true))
        if (!order) return callback(new ApiError('Invalid order.', 'INVALID_ORDER', false))
        order.name = result.first_name + ' ' + result.last_name
        order.email = result.payer_email
        order.paid = result.payment_status === 'Completed' ? Date.now() : null
        order.payment.gateway = 'paypal'
        order.payment.invoice = null
        order.payment.order = result.txn_id
        order.payment.data = result
        order.save(function (err) {
          if (err) return callback(new ApiError(err.message, 'DB', true))
          order.sendOrderConfirmation(function (err) {
            if (err) return callback(new ApiError(err.message, 'Email', true))
            callback(null, order, processed)
          })
        })
      })
    })
  } else { // ERROR!
    callback(new ApiError('Invalid data', 'INVALID_PURCHASE', false))
  }
}

exports.USER_RESERVATION = USER_RESERVATION
exports.AVAILABLE_RESERVATION = AVAILABLE_RESERVATION
exports.PURCHASE_RESERVATION = PURCHASE_RESERVATION
