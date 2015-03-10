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
  locals.sponsorLevels = [];

  view.on('init', function(next) {
    var Sponsor = keystone.list('Sponsor');

    var q = Sponsor.model.find({}).where('published').lte(Date.now()).where('status', Sponsor.STATUS_CONFIRMED).sort('sortOrder').populate('level');

    q.exec(function (err, results) {

      if (err) console.error(err);

      results.forEach(function (sponsor) {
        if (!sponsor.level) return undefined;

        // Insert level ordered
        var found = false;
        for (var index=0; index<locals.sponsorLevels.length; index++) {
          var sponsorLevel = locals.sponsorLevels[index];
          if (sponsorLevel._id == sponsor.level._id) {
            found = true;
            break;
          } else if (sponsorLevel.sortOrder > sponsor.level.sortOrder) {
            break;
          }
        }
        if (!found) {
          locals.sponsorLevels.splice(index, 0, sponsor.level);
        }

        // Add sponsor to level
        var sponsorLevel = locals.sponsorLevels[index];
        sponsorLevel.sponsors = sponsorLevel.sponsors || [];
        sponsorLevel.sponsors.push(sponsor);
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
