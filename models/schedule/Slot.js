var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * Slot Model
 * ==========
 */

var Slot = new keystone.List('Slot', {
  map: { name: 'name' },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
})

Slot.add({
  name: {type: Types.Text, required: true, initial: true},
  day: {type: Types.Relationship, ref: 'Day', index: true, required: true, initial: true},
  kind: {
    label: 'Kind', type: Types.Select, options: [
      {value: 'registration', label: 'Registraion' },
      {value: 'open', label: 'Open' },
      {value: 'keynote', label: 'KeyNote'},
      {value: 'talk', label: 'Talk'},
      {value: 'workshop', label: 'Workshop'},
      {value: 'break', label: 'Break' },
      {value: 'lunch', label: 'Lunch'},
      {value: 'empty', label: 'Empty' },
    ]},
  duration: {type: Number, initial: true, required: true, note: 'Duration in minutes'},
  content: {type: Types.Text},
  talk: {type: Types.Relationship, ref: 'Talk'},
  workshop: {type: Types.Relationship, ref: 'Workshop'},
  tracks: { type: Types.Relationship, ref: 'Track', many: true },
})

Slot.defaultColumns = 'name, day, kind, duration, content, talk, workshop, tracks'
Slot.register()
