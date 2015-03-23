var keystone = require('keystone'),
  Order = keystone.list('Order'),
  Attendee = keystone.list('Attendee');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  locals.processed = false;
  locals.order = null;
  locals.error = null;

  if (req.params.order) { // Intentional purchase
    Order.model.findOne({
      _id: req.params.order,
      canceled: null,
    }).populate('ticket discount').exec(function(err, order) {
      locals.order = order;
      if (order.paid) {
        locals.processed = true;
        view.render('purchase');
        return;
      }
      // TODO: check reserved!
      // {reserved: {$gte: new Date(Date.now() - USER_RESERVATION * 60000)}}
      view.render('purchase');
    });
  } else if (req.query.key) { // Back from 2CO
    Order.model.findOne({
      _id: req.query.merchant_order_id,
      canceled: null,
    }).populate('ticket discount').exec(function(err, order) {
      // TODO: err
      locals.order = order;
      locals.processed = true;
      var key = process.env.TWOCO_SECRET_WORD + '' + process.env.TWOCO_SELLER_ID + '' + req.query.order_number  + order.total.toFixed(2);
      var hash = require('crypto').createHash('md5').update(key).digest('hex').toUpperCase();
      // TODO: check reserved!
      // {reserved: {$gte: new Date(Date.now() - USER_RESERVATION * 60000)}}
      if (req.query.key == hash) {
        order.name = req.query.first_name + ' ' + req.query.last_name;
        order.email = req.query.email;
        order.paid = Date.now();
        order.payment.order = req.query.order_number;
        order.payment.invoice = req.query.invoice_id;
        order.save(function(err){
          // TODO: err
          order.sendOrderConfirmation(function(err){
            // TODO: err
            view.render('purchase');
          });
        });
      } else {
        // TODO: hacker!!!!
        view.render('purchase');
      }
    });
  } else { // ERROR!
    locals.processed = true;
    locals.error = {code: 'INVALID_PURCHASE', message: 'Invalid parameters for purchase.'};
    view.render('purchase');
  }

};
