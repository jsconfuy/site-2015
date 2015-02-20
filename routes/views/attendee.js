var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  // Set locals
  locals.section = 'talks';
  locals.filters = {
    attendee: req.params.attendee
  };
  locals.data = {
    attendees: []
  };

  // Load the current attendee
  view.on('init', function(next) {

    var q = keystone.list('attendee').model.findOne({
      state: 'published',
      slug: locals.filters.attendee
    }).populate('author categories');

    q.exec(function(err, result) {
      locals.data.attendee = result;
      next(err);
    });

  });

  // Load other attendees
  view.on('init', function(next) {

    var q = keystone.list('attendee').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');

    q.exec(function(err, results) {
      locals.data.attendees = results;
      next(err);
    });

  });

  // Render the view
  view.render('attendee');

};
