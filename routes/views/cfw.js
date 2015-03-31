// var keystone = require('keystone')
// var  Proposal = keystone.list('Proposal')

exports = module.exports = function (req, res) {
  /*
  var view = new keystone.View(req, res)
  var locals = res.locals

  locals.cfw = {}
  locals.cfw.data = req.body || {}
  locals.cfw.errors = {}
  locals.cfw.submitted = false

  view.on('post', { action: 'submit' }, function(next) {
    var proposal = new Proposal.model(),
      updater = proposal.getUpdateHandler(req)

    proposal.type = 'W'
    proposal.coasted = true

    updater.process(req.body, {
      flashErrors: true,
      required: 'topic, summary, name, email',
      fields: 'topic, summary, name, email, extra',
      errorMessage: 'There was a problem submitting your workshop proposal:'
    }, function(err) {
      if (err) {
        locals.cfw.errors = err.errors
      } else {
        locals.cfw.submitted = true
      }
      next()
    })

  })

  view.render('cfw')
  */
  res.redirect('/')

}
