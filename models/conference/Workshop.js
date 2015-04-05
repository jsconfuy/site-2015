var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * Workshops Model
 * ===============
 */

var Workshop = new keystone.List('Workshop', {
  map: { name: 'title' },
  perPage: 200,
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
})

Workshop.add({
  assignee: { type: Types.Relationship, ref: 'Organizer', index: true },
  title: { type: String, required: true },
  speakers: { type: Types.Relationship, ref: 'Speaker', many: true },
  description: { type: Types.Markdown },
  language: { type: Types.Select, default: 'E', options: [
    { value: 'E', label: 'English' },
    { value: 'S', label: 'Spanish' }]},
  status: { type: Types.Select, default: 'P', options: [
    { value: 'P', label: 'Pending' },
    { value: 'W', label: 'Waiting' },
    { value: 'C', label: 'Confirmed' },
    { value: 'D', label: 'Declined' }]},
  hours: { type: Types.Number },
  instructions: { type: Types.Markdown },
  tags: { type: Types.Relationship, ref: 'Tag', many: true },
  notes: { type: Types.Markdown }
})

Workshop.relationship({ ref: 'Speaker', path: 'speakers' })
Workshop.relationship({ ref: 'Tag', path: 'tags' })

Workshop.defaultColumns = 'title, speakers, tags, status, hours, assignee, language'
Workshop.register()
