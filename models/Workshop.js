var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * Workshops Model
 * ===============
 */

var Workshop = new keystone.List('Workshop', {
  map: { name: 'title' },
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
})

Workshop.add({
  title: { type: String, required: true },
  assignee: { type: Types.Relationship, ref: 'Organizer', index: true },
  speakers: { type: Types.Relationship, ref: 'Speaker', many: true },
  status: { type: Types.Select, default: 'P', options: [
    { value: 'P', label: 'Pending' },
    { value: 'W', label: 'Waiting' },
    { value: 'C', label: 'Confirmed' },
    { value: 'D', label: 'Declined' }]},
  published: { type: Types.Datetime },
  notes: { type: Types.Markdown },
  hours: { type: Types.Number },
  tags: { type: Types.Relationship, ref: 'Tag', many: true }
})

Workshop.relationship({ ref: 'Speaker', path: 'speakers' })
Workshop.relationship({ ref: 'Tag', path: 'tags' })

Workshop.defaultColumns = 'title, speakers, tags, status, hours, assignee'
Workshop.register()
