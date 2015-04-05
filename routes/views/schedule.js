var keystone = require('keystone')
var schedule = require('../../lib/schedule')
var moment = require('moment-timezone')

exports = module.exports = function (req, res) {
  var view = new keystone.View(req, res)
  schedule.getTimetable(function (timetable) {
    if (req.query.test === '') {
      res.locals.timetable = timetable
    } else {
      res.locals.timetable = []
    }
    res.locals.moment = moment
    view.render('schedule')
  })
}
