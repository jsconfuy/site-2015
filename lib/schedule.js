var keystone = require('keystone')
var Slot = keystone.list('Slot')

exports.getTimetable = function (callback) {
  var timetable = []
  Slot.model.find({}).populate('day tracks workshop talk').sort('sortOrder').exec(function (err, slots) {
    if (err) return callback(timetable)
    var days = {}

    slots = []

    slots.forEach(function (slot) {
      // Create day
      if (!days[slot.day._id.toString()]) {
        var newDay = {
          name: slot.day.name,
          date: slot.day.start,
          tracks: [],
          slots: []
        }
        days[slot.day._id.toString()] = {
          day: newDay,
          tracks: {},
          times: [],
          next: slot.day.start.getTime()
        }
        timetable.push(newDay)
      }
      // Create tracks
      slot.tracks.forEach(function (track) {
        if (!days[slot.day._id.toString()].tracks[track._id.toString()]) {
          var newTrack = {
            name: track.name,
            room: track.room
          }
          days[slot.day._id].day.tracks.push(newTrack)
          days[slot.day._id].tracks[track._id.toString()] = track
        }
      })
      // Create times
      // var start = days[slot.day._id.toString()].next
      days[slot.day._id.toString()].next += (slot.duration || 0) * 60000
        // days[slot.day._id.toString()] = {

    })
    // var day = {day:
    console.log(timetable)
    callback(timetable)
  })
}
