var keystone = require('keystone'),
  Order = keystone.list('Order'),
  Attendee = keystone.list('Attendee');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  locals.processed = false;
  locals.order = null;

  if (req.params.order) {
    Order.model.findOne({
      _id: req.params.order
    }).populate('ticket discount').exec(function(err, order) {
      locals.order = order;
      view.render('purchase');
    });
  } else if (req.query.key) {
    Order.model.findOne({
      _id: req.query.merchant_order_id
    }).populate('ticket discount').exec(function(err, order) {
      locals.order = order;
      locals.processed = true;
      var key = process.env.TWOCO_SECRET_WORD + '' + process.env.TWOCO_SELLER_ID + '' + req.query.order_number  + order.total.toFixed(2);
      var hash = require('crypto').createHash('md5').update(key).digest('hex').toUpperCase();
      if (req.query.key == hash) {
        order.name = req.query.first_name + ' ' + req.query.last_name;
        order.email = req.query.email;
        order.paid = Date.now();
        order.payment.order = req.query.order_number;
        order.payment.invoice = req.query.invoice_id;
        order.save(function(err){
          view.render('purchase');
        });
      } else {
        view.render('purchase');
      }
    });
  } else {
    view.render('purchase');
  }

  // <?php
  // $hashSecretWord = 'tango'; //2Checkout Secret Word
  // $hashSid = 1303908; //2Checkout account number
  // $hashTotal = '1.00'; //Sale total to validate against
  // $hashOrder = $_REQUEST['order_number']; //2Checkout Order Number
  // $StringToHash = strtoupper(md5($hashSecretWord . $hashSid . $hashOrder . $hashTotal));
  // if ($StringToHash != $_REQUEST['key']) {
  //   $result = 'Fail - Hash Mismatch';
  // } else {
  //   $result = 'Success - Hash Matched';
  // }
  // echo $result;

  // locals.cfp = {};
  // locals.cfp.data = req.body || {};
  // locals.cfp.errors = {};
  // locals.cfp.submitted = false;

  /*
  view.on('post', { action: 'submit' }, function(next) {
    var proposal = new Proposal.model(),
      updater = proposal.getUpdateHandler(req);

    updater.process(req.body, {
      flashErrors: true,
      required: 'topic, summary, name, email, residence',
      fields: 'topic, summary, name, email, residence, notes, coasted',
      errorMessage: 'There was a problem submitting your proposal:'
    }, function(err) {
      if (err) {
        console.log(err);
        locals.cfp.errors = err.errors;
      } else {
        locals.cfp.submitted = true;
      }
      next();
    });

  });

  view.render('cfp');
  */
  // res.redirect('/');
  //
  // async.waterfall([
  //   // Get and validate ticket
  //   function(next) {
  //     var messages = {};
  //     Order.model.findOne({
  //       _id: data.order,
  //       canceled: null,
  //       $or: [
  //         {paid: {$ne: null}},
  //         {reserved: {$gte: new Date(Date.now() - USER_RESERVATION * 60000)}}
  //       ]
  //     }).populate('ticket discount').exec(function(err, result){
  //       // TODO: check error
  //       if (err) return next(err);
  //       next(null, result, messages);
  //     });
  //   },
  //   // Make purchase
  //   function(order, messages, next) {
  //     var tco = new Twocheckout({
  //       sellerId: process.env.TWOCO_SELLER_ID,
  //       privateKey: process.env.TWOCO_PRIVATE_KEY,
  //       sandbox: process.env.TWOCO_ENV == 'sandbox' ? true : false,
  //     });
  //     var params = {
  //       'merchantOrderId': order._id,
  //       'token': data.token,
  //       'currency': 'USD',
  //       // 'total': order.total,
  //       'lineItems': [{
  //         'type': 'product',
  //         'name': order.ticket.name + (order.discount ? ' (CODE: ' + order.discount.name  + ')' : ''),
  //         'productId': order.ticket._id,
  //         'tangible': 'N',
  //         'quantity': order.quantity,
  //         'price': order.price,
  //       }],
  //       'billingAddr': {
  //         'name': data.name,
  //         'email': data.email,
  //         'addrLine1': data.address1,
  //         'addrLine2': data.address2,
  //         'city': data.city,
  //         'state': data.state,
  //         'zipCode': data.postcode,
  //         'country': data.country,
  //       }
  //     };
  //     tco.checkout.authorize(params, function (error, data) {
  //       if (error) {
  //         return next(error.message);
  //       } else {
  //         // TODO: mark as paid
  //         // response.send(data.response.responseMsg);
  //         next(null, order, messages);
  //       }
  //     });
  //   },
  //   // TODO: Send email!
  //   function(order, messages, next) {
  //     next(null, order, messages);
  //   },
  // ], function(err, order, messages) {
  //   callback(err, order, messages);
  // });

};
