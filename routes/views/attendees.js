var keystone = require('keystone'),
  Order = keystone.list('Order'),
  Attendee = keystone.list('Attendee');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  // locals.cfp = {};
  // locals.cfp.data = req.body || {};
  // locals.cfp.errors = {};
  // locals.cfp.submitted = false;

  /*
  view.on('post', { action: 'submit' }, function(next) {
    var proposal = new Proposal.model(),
      updater = proposal.getUpdateHandler(req);

    updater.process(req.body, {
      flashErrors: true,
      required: 'topic, summary, name, email, residence',
      fields: 'topic, summary, name, email, residence, notes, coasted',
      errorMessage: 'There was a problem submitting your proposal:'
    }, function(err) {
      if (err) {
        console.log(err);
        locals.cfp.errors = err.errors;
      } else {
        locals.cfp.submitted = true;
      }
      next();
    });

  });

  view.render('cfp');
  */
  // res.redirect('/');
  view.render('attendees');

};
