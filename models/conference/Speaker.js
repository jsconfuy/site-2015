var keystone = require('keystone')
var Types = keystone.Field.Types
var countries = require('country-list')()

/**
 * Speakers Model
 * ==============
 */

var Speaker = new keystone.List('Speaker', {
  map: { name: 'name' },
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
})

Speaker.STATUS_CONFIRMED = 'C'

Speaker.add({
  assignee: { type: Types.Relationship, ref: 'Organizer', index: true },
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
  status: { type: Types.Select, default: 'P', options: [
    { value: 'P', label: 'Pending' },
    { value: 'W', label: 'Waiting' },
    { value: 'C', label: 'Confirmed' },
    { value: 'D', label: 'Declined' }]},
  picture: { type: Types.CloudinaryImage },
  biography: {
    short: { type: Types.Markdown },
    full: { type: Types.Markdown }
  },
  twitter: { type: String },
  residence: { type: String },
  published: { type: Types.Datetime },
  notes: { type: Types.Markdown },
  tags: { type: Types.Relationship, ref: 'Tag', many: true }
})

Speaker.relationship({ ref: 'Talk', refPath: 'speakers', path: 'talks' })
Speaker.relationship({ ref: 'Workshop', refPath: 'speakers', path: 'workshops' })

Speaker.defaultColumns = 'name, email, gender, tshirt, country, tags, status, assignee, published'
Speaker.register()
