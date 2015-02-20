var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  // Set locals
  locals.section = 'talks';
  locals.filters = {
    discount: req.params.discount
  };
  locals.data = {
    discounts: []
  };

  // Load the current discount
  view.on('init', function(next) {

    var q = keystone.list('discount').model.findOne({
      state: 'published',
      slug: locals.filters.discount
    }).populate('author categories');

    q.exec(function(err, result) {
      locals.data.discount = result;
      next(err);
    });

  });

  // Load other discounts
  view.on('init', function(next) {

    var q = keystone.list('discount').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');

    q.exec(function(err, results) {
      locals.data.discounts = results;
      next(err);
    });

  });

  // Render the view
  view.render('discount');

};
