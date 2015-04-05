var keystone = require('keystone')
var Types = keystone.Field.Types
var countries = require('country-list')()

/**
 * Speakers Model
 * ==============
 */

var Speaker = new keystone.List('Speaker', {
  map: { name: 'name' },
  perPage: 200,
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
})

Speaker.STATUS_CONFIRMED = 'C'

Speaker.add(
  {
    assignee: { type: Types.Relationship, ref: 'Organizer', index: true },
    status: { type: Types.Select, default: 'P', options: [
      { value: 'P', label: 'Pending' },
      { value: 'W', label: 'Waiting' },
      { value: 'C', label: 'Confirmed' },
      { value: 'D', label: 'Declined' }]},
    published: { type: Types.Datetime },
    name: { type: String, required: true },
    email: { type: Types.Email },
    tshirt: {
      label: 'T-Shirt', type: Types.Select, options: [
        { value: 'XS', label: 'XS' },
        { value: 'S', label: 'S' },
        { value: 'M', label: 'M' },
        { value: 'L', label: 'L' },
        { value: 'XL', label: 'XL' },
        { value: 'XXL', label: 'XXL' }
      ]},
    gender: {
      label: 'Gender', type: Types.Select, options: [
        { value: 'F', label: 'Female' },
        { value: 'M', label: 'Male' }
      ]},
    country: {
      label: 'Country', type: Types.Select, options: countries.getData().map(function (country) {
        return {label: country.name, value: country.code}
      })},
    picture: { type: Types.CloudinaryImage },
    biography: {
      short: { type: Types.Markdown },
      full: { type: Types.Markdown }
    },
    company: { type: String },
    twitter: { type: String },
    residence: { type: String },
    tags: {type: Types.Relationship, ref: 'Tag', many: true},
    notes: {type: Types.Markdown}
  },
  'Transport & Accommodation',
  {
    accommodation: {
      nights: {type: Types.Number},
      notes: {type: Types.Textarea}
    },
    arrival: {
      date: {type: Types.Datetime},
      assignee: {type: Types.Relationship, ref: 'Organizer', index: true},
      notes: {type: Types.Textarea}
    },
    departure: {
      date: {type: Types.Datetime},
      assignee: {type: Types.Relationship, ref: 'Organizer', index: true},
      notes: {type: Types.Textarea}
    }
  }
)

Speaker.relationship({ ref: 'Talk', refPath: 'speakers', path: 'talks' })
Speaker.relationship({ ref: 'Workshop', refPath: 'speakers', path: 'workshops' })

Speaker.defaultColumns = 'name, tags, status, assignee'
Speaker.register()
