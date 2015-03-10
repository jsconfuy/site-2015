var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Sponsors Model
 * ==============
 */

var Sponsor = new keystone.List('Sponsor', {
  map: { name: 'name' },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true},
});

Sponsor.STATUS_CONFIRMED = 'C';

Sponsor.add({
  name: { type: String, required: true },
  assignee: { type: Types.Relationship, ref: 'Organizer', index: true },
  status: { type: Types.Select, options: [
    { value: 'P', label: 'Pending' },
    { value: 'W', label: 'Waiting' },
    { value: Sponsor.STATUS_CONFIRMED, label: 'Confirmed' },
    { value: 'D', label: 'Declined' }]},
  level: { type: Types.Relationship, ref: 'SponsorLevel', index: true },
  description: { type: Types.Markdown },
  logo: { type: Types.CloudinaryImage },
  url: { type: Types.Url },
  contact: {
    name: { type: String },
    email: { type: Types.Email },
  },
  price: { type: Types.Money, required: true, default: 0 },
  paid: { type: Types.Datetime },
  published: { type: Types.Datetime },
  notes: { type: Types.Markdown },
  tags: { type: Types.Relationship, ref: 'Tag', many: true },
});

Sponsor.defaultColumns = 'name, paid, level, tags, status, assignee, published';
Sponsor.register();
