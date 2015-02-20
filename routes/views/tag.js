var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  // Set locals
  locals.section = 'talks';
  locals.filters = {
    tag: req.params.tag
  };
  locals.data = {
    tags: []
  };

  // Load the current tag
  view.on('init', function(next) {

    var q = keystone.list('Tag').model.findOne({
      state: 'published',
      slug: locals.filters.tag
    }).populate('author categories');

    q.exec(function(err, result) {
      locals.data.tag = result;
      next(err);
    });

  });

  // Load other tags
  view.on('init', function(next) {

    var q = keystone.list('Tag').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');

    q.exec(function(err, results) {
      locals.data.tags = results;
      next(err);
    });

  });

  // Render the view
  view.render('tag');

};
