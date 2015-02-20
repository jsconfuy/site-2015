var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  // Set locals
  locals.section = 'sales';
  locals.filters = {
    ticket: req.params.ticket
  };
  locals.data = {
    tickets: []
  };

  // Load the current ticket
  view.on('init', function(next) {

    var q = keystone.list('Ticket').model.findOne({
      state: 'published',
      slug: locals.filters.ticket
    }).populate('author categories');

    q.exec(function(err, result) {
      locals.data.ticket = result;
      next(err);
    });

  });

  // Load other tickets
  view.on('init', function(next) {

    var q = keystone.list('Ticket').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');

    q.exec(function(err, results) {
      locals.data.tickets = results;
      next(err);
    });

  });

  // Render the view
  view.render('ticket');

};
