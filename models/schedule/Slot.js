var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * Slot Model
 * ==========
 */

var Slot = new keystone.List('Slot', {
  map: { name: 'name' },
  sortable: true,
  perPage: 200,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
})

Slot.add({
  name: {type: Types.Text, required: true, initial: true},
  day: {type: Types.Relationship, ref: 'Day', index: true, required: true, initial: true},
  track: {type: Types.Relationship, ref: 'Track', note: 'Left empty for show in all tracks.'},
  kind: {
    label: 'Kind', type: Types.Select, options: [
      {value: 'registration', label: 'Registraion'},
      {value: 'opening', label: 'Opening'},
      {value: 'close', label: 'Close'},
      {value: 'keynote', label: 'KeyNote'},
      {value: 'talk', label: 'Talk'},
      {value: 'workshop', label: 'Workshop'},
      {value: 'break', label: 'Break' },
      {value: 'lunch', label: 'Lunch'},
      {value: 'after', label: 'After' },
      {value: 'empty', label: 'Empty' }
    ]},
  duration: {type: Number, initial: true, required: true, note: 'Duration in minutes'},
  content: {type: Types.Text},
  talk: {type: Types.Relationship, ref: 'Talk'},
  workshop: {type: Types.Relationship, ref: 'Workshop'}
})

Slot.defaultColumns = 'name, day, track, duration, kind, content, talk, workshop'
Slot.register()
