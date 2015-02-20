var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  // Set locals
  locals.section = 'talks';
  locals.filters = {
    talk: req.params.talk
  };
  locals.data = {
    talks: []
  };

  // Load the current talk
  view.on('init', function(next) {

    var q = keystone.list('talk').model.findOne({
      state: 'published',
      slug: locals.filters.talk
    }).populate('author categories');

    q.exec(function(err, result) {
      locals.data.talk = result;
      next(err);
    });

  });

  // Load other talks
  view.on('init', function(next) {

    var q = keystone.list('talk').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');

    q.exec(function(err, results) {
      locals.data.talks = results;
      next(err);
    });

  });

  // Render the view
  view.render('talk');

};
