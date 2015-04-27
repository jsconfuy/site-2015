var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * Volunteers Model
 * ================
 */

var Volunteer = new keystone.List('Volunteer', {
  map: { name: 'name' },
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true }
})

Volunteer.add({
  name: { type: String, required: true },
  email: { type: Types.Email },
  twitter: { type: String, required: true, initial: true },
  picture: { type: Types.CloudinaryImage },
  biography: { type: Types.Markdown },
  published: { type: Types.Datetime }
})

Volunteer.defaultColumns = 'name, twitter, email, published'
Volunteer.register()
