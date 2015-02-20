var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Proposals Model
 * ==========
 */

var Proposal = new keystone.List('Proposal', {
  map: { name: 'topic' },
});

Proposal.add({
  topic: { type: String, required: true, intial: true },
  added: { type: Types.Datetime, default: Date.now, noedit: true },
  status: { type: Types.Select, default: 'N', options: [
    { value: 'N', label: 'New' },
    { value: 'P', label: 'Pending' },
    { value: 'A', label: 'Accepted' },
    { value: 'D', label: 'Declined' }]},
  source: { type: Types.Select, required: true, default: 'C', options: [
    { value: 'C', label: 'Call' },
    { value: 'I', label: 'Internal' },]},
  type: { type: Types.Select, required: true, default: 'T', options: [
    { value: 'K', label: 'Key Note' },
    { value: 'T', label: 'Talk' },
    { value: 'W', label: 'Workshop' },]},
  summary: { type: Types.Textarea},
  coasted: { type: Types.Boolean, required: true, intial: true, default: false },
  name: { type: String },
  email: { type: Types.Email },
  residence: { type: String },
  biography: { type: Types.Textarea },
  notes: { type: Types.Markdown },
  tags: { type: Types.Relationship, ref: 'Tag', many: true },
});

Proposal.relationship({ ref: 'Tag', path: 'tags' });
Proposal.defaultColumns = 'topic, name, residence, coasted, type, source, tags, status, added';
Proposal.register();
