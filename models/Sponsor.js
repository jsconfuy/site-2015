var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Sponsors Model
 * ==========
 */

var Sponsor = new keystone.List('Sponsor', {
  map: { name: 'name' },
  sortable: true,
});

Sponsor.add({
  name: { type: String, required: true },
  added: { type: Types.Datetime, default: Date.now, noedit: true },
  assignee: { type: Types.Relationship, ref: 'User', index: true },
  status: { type: Types.Select, options: [
    { value: 'P', label: 'Pending' },
    { value: 'W', label: 'Waiting' },
    { value: 'C', label: 'Confirmed' },
    { value: 'D', label: 'Declined' }]},
  level: { type: Types.Relationship, ref: 'SponsorLevel', index: true, required: false },
  description: { type: Types.Markdown },
  logo: { type: Types.CloudinaryImage },
  contact: {
    name: { type: String },
    email: { type: Types.Email },
  },
  paid: { type: Types.Datetime },
  published: { type: Types.Datetime },
  notes: { type: Types.Markdown },
  tags: { type: Types.Relationship, ref: 'Tag', many: true },
});

Sponsor.relationship({ ref: 'Tag', path: 'tags' });

Sponsor.defaultColumns = 'name, paid, level, tags, status, assignee, added';
Sponsor.register();
