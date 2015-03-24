// var keystone = require('keystone')
// var Proposal = keystone.list('Proposal')

exports = module.exports = function (req, res) {
  // var view = new keystone.View(req, res)
  var locals = res.locals
  locals.cfp = {}
  locals.cfp.data = req.body || {}
  locals.cfp.errors = {}
  locals.cfp.submitted = false

  /*
  view.on('post', { action: 'submit' }, function (next) {
    var proposal = new Proposal.model()
    var updater = proposal.getUpdateHandler(req)

    updater.process(req.body, {
      required: 'topic, summary, name, email, residence',
      fields: 'topic, summary, name, email, residence, notes, coasted',
      errorMessage: 'There was a problem submitting your proposal:'
    }, function (err) {
      if (err) {
        locals.cfp.errors = err.errors
      } else {
        locals.cfp.submitted = true
      }
      next()
    })
  })
  view.render('cfp')
  */

  res.redirect('/')
}
