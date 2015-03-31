var keystone = require('keystone')
var Attendee = keystone.list('Attendee')

exports = module.exports = function (done) {
  Attendee.model.find({}).exec(function (err, attendees) {
    if (err) return
    var save = function () {
      var attendee = attendees.pop()
      if (!attendee) return done()
      attendee.extra = attendee.comments
      attendee.save(function (err) {
        if (err) return save()
        save()
      })
    }
    save()
  })
}
