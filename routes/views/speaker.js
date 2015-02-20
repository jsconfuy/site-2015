var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  // Set locals
  locals.section = 'talks';
  locals.filters = {
    speaker: req.params.speaker
  };
  locals.data = {
    speakers: []
  };

  // Load the current speaker
  view.on('init', function(next) {

    var q = keystone.list('Speaker').model.findOne({
      state: 'published',
      slug: locals.filters.speaker
    }).populate('author categories');

    q.exec(function(err, result) {
      locals.data.speaker = result;
      next(err);
    });

  });

  // Load other speakers
  view.on('init', function(next) {

    var q = keystone.list('Speaker').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');

    q.exec(function(err, results) {
      locals.data.speakers = results;
      next(err);
    });

  });

  // Render the view
  view.render('speaker');

};
