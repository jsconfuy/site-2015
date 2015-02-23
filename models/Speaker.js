var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Speakers Model
 * ==============
 */

var Speaker = new keystone.List('Speaker', {
  map: { name: 'name' },
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true},
});

Speaker.STATUS_CONFIRMED = 'C';

Speaker.add({
  name: { type: String, required: true },
  assignee: { type: Types.Relationship, ref: 'Organizer', index: true },
  status: { type: Types.Select, default: 'P', options: [
    { value: 'P', label: 'Pending' },
    { value: 'W', label: 'Waiting' },
    { value: 'C', label: 'Confirmed' },
    { value: 'D', label: 'Declined' }]},
  email: { type: Types.Email },
  residence: { type: String },
  picture: { type: Types.CloudinaryImage },
  biography: {
    short: { type: Types.Markdown },
    full: { type: Types.Markdown },
  },
  published: { type: Types.Datetime },
  notes: { type: Types.Markdown },
  tags: { type: Types.Relationship, ref: 'Tag', many: true },
});

Speaker.relationship({ ref: 'Talk', refPath: 'speakers', path: 'talks' });
Speaker.relationship({ ref: 'Workshop', refPath: 'speakers', path: 'workshops' });

Speaker.defaultColumns = 'name, email, residence, tags, status, assignee, published';
Speaker.register();
