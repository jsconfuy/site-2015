var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  // Set locals
  locals.section = 'talks';
  locals.filters = {
    proposal: req.params.proposal
  };
  locals.data = {
    proposals: []
  };

  // Load the current proposal
  view.on('init', function(next) {

    var q = keystone.list('Proposal').model.findOne({
      state: 'published',
      slug: locals.filters.proposal
    }).populate('author categories');

    q.exec(function(err, result) {
      locals.data.proposal = result;
      next(err);
    });

  });

  // Load other proposals
  view.on('init', function(next) {

    var q = keystone.list('Proposal').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');

    q.exec(function(err, results) {
      locals.data.proposals = results;
      next(err);
    });

  });

  // Render the view
  view.render('proposal');

};
