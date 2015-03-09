var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  //
  // Speakers.
  //
  locals.speakers = [];
  view.on('init', function(next) {
    var list = keystone.list('Speaker');
    var q = list.model.find().where('published').lte(Date.now()).where('status', list.STATUS_CONFIRMED).sort('sortOrder');
    q.exec(function(err, results) {
      locals.speakers = results;
      next(err);
    });
  });

  //
  // Sponsors.
  //

  // Initialize the sponsorsLevels table.
  locals.sponsorsLevels = {};

  view.on('init', function(next) {
    var Sponsor = keystone.list('Sponsor').model;

    // TODO Clean the query
    // var q = Sponsor.find({}).populate('level').where('published').lte(Date.now()).where('status', SponsorList.STATUS_CONFIRMED).sort('sortOrder');

    // Get the sponsors that are confirmed and published.
    var q = Sponsor.find({
        status: Sponsor.STATUS_CONFIRMED
    });

    // Populate the sponsors with thier levels.
    q.populate('level');

    q.exec(function (err, results) {

      if (err) console.error(err);

      results.forEach(function (sponsor) {
        // Check if the current sponsor does not have a level.
        if (!sponsor.level) return undefined;

        // Check if the level has been initialized.
        if (!Array.isArray(locals.sponsorsLevels[sponsor.level.name])) {
          // Initialize the array for the level.
          locals.sponsorsLevels[sponsor.level.name] = sponsor.level;
          locals.sponsorsLevels[sponsor.level.name].sponsors = [];
        }

        // Append the current sponsor to his sponsor level list.
        locals.sponsorsLevels[sponsor.level.name].sponsors.push(sponsor);
      });

      next(err);
    });
  });

  //
  // Organizers.
  //
  locals.organizers = [];
  view.on('init', function(next) {
    var list = keystone.list('Organizer');
    var q = list.model.find().sort('sortOrder');
    q.exec(function(err, results) {
      locals.organizers = results;
      next(err);
    });
  });


  //
  // Render the template for the home page.
  //
  view.render('home');

};
