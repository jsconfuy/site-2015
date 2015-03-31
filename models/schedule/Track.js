var keystone = require('keystone')

/**
 * Track Model
 * ===========
 */

var Track = new keystone.List('Track', {
  autokey: {path: 'slug', from: 'name', unique: true},
  map: {name: 'name'},
  sortable: true,
  track: {createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
})

Track.add({
  name: {type: String, required: true, initial: true},
  room: {type: String, required: true, initial: true}
})

Track.defaultColumns = 'name'
Track.register()
