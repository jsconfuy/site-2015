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
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true },
});

Organizer.add({
  name: { type: String, required: true },
  email: { type: Types.Email },
  twitter: { type: String, required: true, initial: true },
  picture: { type: Types.CloudinaryImage },
  biography: { type: Types.Markdown },
  published: { type: Types.Datetime },
});

Organizer.defaultColumns = 'name, twitter, email, published';
Organizer.register();
