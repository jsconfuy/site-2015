var keystone = require('keystone')
var tickets = require('../../lib/tickets')
var logger = require('../../lib/logger')

exports = module.exports = function (req, res) {
  var view = new keystone.View(req, res)
  var locals = res.locals

  tickets.purchase(req.params.order, req.query, function (err, order, processed) {
    locals.error = err
    locals.error_json = 'null'
    if (err) {
      if (!err.internal) {
        locals.error_json = JSON.stringify({message: err.message, internal: false, code: err.code})
      } else {
        locals.error_json = JSON.stringify({message: 'Internal server error.', code: 'INTERNAL', internal: true})
      }
    }
    locals.processed = !!err || processed
    locals.order = order
    if (err) {
      err.order = req.params.order
      err.query = req.query
      logger.log(err, function () {
        view.render('purchase')
      })
    } else {
      view.render('purchase')
    }
  })
}
