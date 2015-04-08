// Load .env for development environments
require('dotenv').load()

exports.initLocals = function (req, res, next) {
  var locals = res.locals

  locals.user = req.user
  locals.buy = {
    ticket: req.query.ticket,
    discount: req.query.discount,
    order: req.query.order
  }
  locals.ticketReservation = process.env.TICKET_RESERVATION
  locals.baseUrl = process.env.BASE_URL

  locals.gateway = process.env.GATEWAY
  locals.twocoEnv = process.env.TWOCO_ENV
  locals.twocoSellerId = process.env.TWOCO_SELLER_ID
  locals.paypalEnv = process.env.PAYPAL_ENV
  locals.paypalBusiness = process.env.PAYPAL_BUSINESS

  locals.gold = req.query.g === '' ? 'gold' : ''

  next()
}

exports.requireUser = function (req, res, next) {
  if (!req.user) {
    res.redirect('/keystone/signin')
  } else {
    next()
  }
}
