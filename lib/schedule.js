var keystone = require('keystone')
var Slot = keystone.list('Slot')

exports.getTimetable = function (callback) {
  var timetable = []
  Slot.model.find({}).populate('day track workshop talk').sort('sortOrder').exec(function (err, slots) {
    if (err) return callback(timetable)
    // *** IMPORTANT ***: The slots should be ordered by start time
    // Initiate
    slots.forEach(function (slot) {
      if (timetable.indexOf(slot.day) < 0) {
        slot.day.tracks = []
        slot.day.times = []
        slot.day.slots = null
        slot.day.next = slot.day.start.getTime()
        timetable.push(slot.day)
      }
      if (slot.track && slot.day.tracks.indexOf(slot.track) < 0) {
        slot.track.next = slot.day.next
        slot.track.gaps = []
        slot.day.tracks.push(slot.track)
      }
    })
    // TODO: Add empty full slot for each day
    // Calculate times
    var gaps = []
    slots.forEach(function (slot) {
      slot.start = slot.track ? slot.track.next : slot.day.next
      slot.end = slot.start + (slot.duration * 60 * 1000)
      // Save next time
      slot.day.next = Math.max(slot.day.next, slot.end)
      if (slot.track) {
        slot.track.next = Math.max(slot.track.next, slot.end)
      } else {
        slot.day.tracks.forEach(function (track) {
          if (track.next > slot.start) {
            // TODO: error!
          } else {
            if (track.next < slot.start) {
              gaps.push({
                kind: 'empty',
                day: slot.day,
                track: track,
                start: track.next,
                end: slot.start
              })
            }
            track.next = slot.end
          }
        })
      }

      // Insert and sort
      if (slot.day.times.indexOf(slot.start) < 0) slot.day.times.push(slot.start)
      if (slot.day.times.indexOf(slot.end) < 0) slot.day.times.push(slot.end)
      slot.day.times.sort()

    })
    slots = slots.concat(gaps)
    slots.forEach(function (slot) {
      if (!slot.day.slots) {
        slot.day.slots = []
        slot.day.times.forEach(function (start) {
          var empty = []
          slot.day.tracks.forEach(function () {
            empty.push(null)
          })
          slot.day.slots.push({start: start, slots: empty})
        })
      }
      slot.rowspan = slot.day.times.indexOf(slot.end) - slot.day.times.indexOf(slot.start)
      if (slot.track) {
        slot.colspan = 1
        slot.day.slots[slot.day.times.indexOf(slot.start)].slots[slot.day.tracks.indexOf(slot.track)] = slot
      } else {
        slot.colspan = slot.day.tracks.length
        slot.day.slots[slot.day.times.indexOf(slot.start)].slots = [slot]
      }
    })
    callback(timetable)
  })
}
