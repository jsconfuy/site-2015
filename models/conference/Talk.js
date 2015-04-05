var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * Talks Model
 * ===========
 */

var Talk = new keystone.List('Talk', {
  autokey: { path: 'slug', from: 'name', unique: true },
  perPage: 200,
  map: { name: 'title' },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
})

Talk.add({
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
  tags: { type: Types.Relationship, ref: 'Tag', many: true },
  notes: { type: Types.Markdown }
})

Talk.relationship({ ref: 'Speaker', path: 'speakers' })
Talk.relationship({ ref: 'Tag', path: 'tags' })

Talk.defaultColumns = 'title, speakers, tags, status, assignee, language'
Talk.register()
