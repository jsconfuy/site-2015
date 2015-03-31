var keystone = require('keystone')
var Proposal = keystone.list('Proposal')

exports = module.exports = function (done) {
  Proposal.model.find({}).exec(function (err, proposals) {
    if (err) return
    var save = function () {
      var proposal = proposals.pop()
      if (!proposal) return done()
      proposal.extra = proposal.notes
      proposal.notes = proposal.comments
      proposal.save(function (err) {
        if (err) return save()
        save()
      })
    }
    save()
  })
}
