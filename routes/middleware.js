var _ = require('underscore');

// Load .env for development environments
require('dotenv').load();

exports.initLocals = function(req, res, next) {

  var locals = res.locals;

  locals.user = req.user;
  locals.buy = {
    ticket: req.query.ticket,
    discount: req.query.discount,
  };
  locals.twoco_env = process.env.TWOCO_ENV;
  locals.twoco_seller_id = process.env.TWOCO_SELLER_ID;
  locals.twoco_public_key = process.env.TWOCO_PUBLIC_KEY;
  locals.gold = req.query.r == '' ? (Math.random() > 0.5 ? 'gold' : '') : '';
  locals.gold = req.query.g == '' ? 'gold' : locals.gold;
  locals.gold = req.query.b == '' ? '' : locals.gold;


  next();

};

exports.flashMessages = function(req, res, next) {

  var flashMessages = {
    info: req.flash('info'),
    success: req.flash('success'),
    warning: req.flash('warning'),
    error: req.flash('error')
  };

  res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;

  next();

};

exports.requireUser = function(req, res, next) {

  if (!req.user) {
    req.flash('error', 'Please sign in to access this page.');
    res.redirect('/keystone/signin');
  } else {
    next();
  }

};
