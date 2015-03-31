var keystone = require('keystone')
var tickets = require('../../lib/tickets')
var ApiError = require('../../lib/apierror')
var Ticket = keystone.list('Ticket')

module.exports.available = function (req, res, next) {
  tickets.available(req.query.ticket, req.query.discount, function (err, tickets, discount, messages) {
    if (err) return next(err)
    tickets = tickets.filter(function (ticket) {
      return ticket.available > 0 && (!discount || discount.available > 0)
    }).map(function (ticket) {
      return {
        code: ticket.code,
        name: ticket.name,
        available: Math.min(ticket.available, discount ? discount.available : ticket.available),
        min: Math.max(ticket.min, discount ? discount.min : ticket.min),
        max: Math.min(ticket.max, discount ? discount.max : ticket.max),
        price: (Math.round(ticket.price * 100) / 100) - (Math.round(Ticket.calculateDiscount(ticket, discount) * 100) / 100)
      }
    })
    if (discount) {
      discount = {
        code: discount.code
      }
    }
    res.apiResponse({tickets: tickets, discount: discount, messages: messages})
  })
}

module.exports.select = function (req, res, next) {
  tickets.select(req.body.ticket, req.body.discount, req.body.quantity, function (err, order, messages) {
    if (err) return next(err)
    order = {
      id: order._id,
      ticket: order.ticket.name,
      quantity: order.quantity,
      paid: !!order.paid,
      price: order.price.ticket - order.price.discount,
      total: order.total
    }
    res.apiResponse({order: order, messages: messages})
  })
}

module.exports.assign = function (req, res, next) {
  tickets.assign(req.query.order, function (err, order, attendees, messages) {
    if (err) return next(err)
    order = {
      id: order._id,
      paid: !!order.paid
    }
    attendees = attendees.map(function (attendee) {
      return {
        id: attendee._id,
        name: attendee.name,
        email: attendee.email,
        tshirt: attendee.tshirt,
        extra: attendee.extra
      }
    })
    res.apiResponse({order: order, attendees: attendees, messages: messages})
  })
}

module.exports.save = function (req, res, next) {
  var fill = function (attendee) {
    attendee.name = req.body[attendee._id + '_name']
    attendee.email = req.body[attendee._id + '_email']
    attendee.tshirt = req.body[attendee._id + '_tshirt']
    attendee.extra = req.body[attendee._id + '_extra']
  }
  tickets.save(req.body.order, fill, function (err, messages) {
    if (err) return next(ApiError(err.message, 'DB', true))
    res.apiResponse({messages: messages})
  })
}
