var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Organizers Model
 * ================
 */

var Organizer = new keystone.List('Organizer', {
  map: { name: 'name' },
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true,
});

Organizer.add({
  name: { type: String, required: true },
  added: { type: Types.Datetime, default: Date.now, noedit: true },
  email: { type: Types.Email },
  picture: { type: Types.CloudinaryImage },
  biography: { type: Types.Markdown },
  published: { type: Types.Datetime },
});

Organizer.defaultColumns = 'name, email';
Organizer.register();
