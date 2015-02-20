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
});

Speaker.add({
  name: { type: String, required: true },
  added: { type: Types.Datetime, default: Date.now, noedit: true },
  assignee: { type: Types.Relationship, ref: 'User', index: true },
  status: { type: Types.Select, default: 'P', options: [
    { value: 'P', label: 'Pending' },
    { value: 'W', label: 'Waiting' },
    { value: 'A', label: 'Accepted' },
    { value: 'D', label: 'Declined' }]},
  email: { type: Types.Email },
  residence: { type: String },
  picture: { type: Types.CloudinaryImage },
  biography: { type: Types.Markdown },
  published: { type: Types.Datetime },
  notes: { type: Types.Markdown },
  tags: { type: Types.Relationship, ref: 'Tag', many: true },
});

Speaker.relationship({ ref: 'Tag', path: 'tags' });
Speaker.relationship({ ref: 'Talk', path: 'talks' });
Speaker.relationship({ ref: 'Workshop', path: 'workshops' });

Speaker.defaultColumns = 'name, email, residence, tags, status, assignee, added';
Speaker.register();
