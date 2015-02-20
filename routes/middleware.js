/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */

var _ = require('underscore');


exports.initLocals = function(req, res, next) {

  var locals = res.locals;

  locals.links = [
    { label: 'Home', key: 'home', href: '/' },
    { label: 'Venue', key: 'venue', href: '/venue' },
    { label: 'Code of Conduct', key: 'coc', href: '/code-of-conduct' },
    { label: 'Call for Proposals', key: 'cfp', href: '/call-for-proposals' },
    { label: 'Last Year', key: 'last', href: 'http://2014.jsconf.uy/' },
    { label: 'Blog', key: 'blog', href: '/blog' },
  ];

  locals.user = req.user;

  next();

};


/**
  Fetches and clears the flashMessages before a view is rendered
*/

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


/**
  Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function(req, res, next) {

  if (!req.user) {
    req.flash('error', 'Please sign in to access this page.');
    res.redirect('/keystone/signin');
  } else {
    next();
  }

};
