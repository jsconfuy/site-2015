var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  // Speakers
  locals.speakers = [];
  view.on('init', function(next) {
    var list = keystone.list('Speaker');
    var q = list.model.find().where('published').lte(Date.now()).where('status', list.STATUS_CONFIRMED).sort('sortOrder');
    q.exec(function(err, results) {
      locals.speakers = results;
      next(err);
    });
  });

  // Sponsors
  locals.sponsors = [];
  view.on('init', function(next) {
    var list = keystone.list('Sponsor');
    var q = list.model.find().populate('level').where('published').lte(Date.now()).where('status', list.STATUS_CONFIRMED).sort('sortOrder');
    q.exec(function(err, results) {
      locals.sponsors = results;
      next(err);
    });
  });

  // Organizers
  locals.organizers = [];
  view.on('init', function(next) {
    var list = keystone.list('Organizer');
    var q = list.model.find().sort('sortOrder');
    q.exec(function(err, results) {
      locals.organizers = results;
      next(err);
    });
  });

  view.render('home');

};
