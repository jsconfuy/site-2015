var keystone = require('keystone')
var Slot = keystone.list('Slot')
var Speaker = keystone.list('Speaker')

exports.getTimetable = function (callback) {
  var timetable = []
  Speaker.model.find({}).exec(function (err, speakers) { // Mongoose doesn't support populate > 1.
    if (err) return callback(timetable)
    Slot.model.find({}).populate('day track workshop talk').sort('sortOrder').exec(function (err, slots) {
      if (err) return callback(timetable)
      // IMPORTANT: The slots should be ordered by start time
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
          slot.track.days = slot.track.days || []
          slot.track.days[slot.day] = {next: slot.day.next}
          slot.day.tracks.push(slot.track)
        }
        slot.day.last = slot
        var setSpeakers = function (item) {
          for (var i = 0; i < item.speakers.length; i++) {
            var found = false
            for (var j = 0; j < speakers.length; j++) {
              if (item.speakers[i] == speakers[j]._id.toString()) {
                found = true
                item.speakers[i] = speakers[j]
              }
            }
            if (!found) item.speakers.splice(i, 1);
          }
        }
        if (slot.talk) setSpeakers(slot.talk)
        if (slot.workshop) setSpeakers(slot.workshop)
      })
      // Add final full slot (if not exists)
      timetable.forEach(function (day) {
        if (day.last.track) {
          slots.push({
            kind: 'empty',
            day: day,
            track: null,
            duration: 0
          })
        }
      })
      // Calculate times
      var gaps = []
      slots.forEach(function (slot) {
        slot.start = slot.track ? slot.track.days[slot.day].next : slot.day.next
        slot.end = slot.start + (slot.duration * 60 * 1000)
        // Save next time
        slot.day.next = Math.max(slot.day.next, slot.end)
        if (slot.track) {
          slot.track.days[slot.day].next = Math.max(slot.track.days[slot.day].next, slot.end)
        } else {
          slot.day.tracks.forEach(function (track) {
            if (track.days[slot.day].next > slot.start) {
              // TODO: error!
            } else {
              if (track.days[slot.day].next < slot.start) {
                gaps.push({
                  kind: 'empty',
                  day: slot.day,
                  track: track,
                  start: track.days[slot.day].next,
                  end: slot.start
                })
              }
              track.days[slot.day].next = slot.end
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
            slot.day.slots.push({start: start, slots: Array.apply(null, Array(slot.day.tracks.length)).map(function () { return null })})
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
      // Remove last slot if null
      timetable.forEach(function (day) {
        var empty = true
        day.slots[day.slots.length - 1].slots.forEach(function (slot) {
          empty = empty && !slot
        })
        if (empty) day.slots.splice(day.slots.length - 1, 1)
      })
      callback(timetable)
    })
  })
}
