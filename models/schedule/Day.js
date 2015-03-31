var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * Day Model
 * =========
 */

var Day = new keystone.List('Day', {
  map: {name: 'name'},
  sortable: true,
  track: {createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
})

Day.add({
  name: {type: String, required: true, initial: true},
  start: { type: Types.Datetime, required: true, initial: true }
})

Day.defaultColumns = 'name, start'
Day.register()
