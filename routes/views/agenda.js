var keystone = require('keystone')
var schedule = require('../../lib/schedule')

exports = module.exports = function (req, res) {
  var view = new keystone.View(req, res)
  schedule.getTimetable(function (timetable) {
    view.render('agenda')
  })
}
