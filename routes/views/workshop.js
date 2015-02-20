var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  // Set locals
  locals.section = 'talks';
  locals.filters = {
    workshop: req.params.workshop
  };
  locals.data = {
    workshops: []
  };

  // Load the current workshop
  view.on('init', function(next) {

    var q = keystone.list('workshop').model.findOne({
      state: 'published',
      slug: locals.filters.workshop
    }).populate('author categories');

    q.exec(function(err, result) {
      locals.data.workshop = result;
      next(err);
    });

  });

  // Load other workshops
  view.on('init', function(next) {

    var q = keystone.list('workshop').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');

    q.exec(function(err, results) {
      locals.data.workshops = results;
      next(err);
    });

  });

  // Render the view
  view.render('workshop');

};
