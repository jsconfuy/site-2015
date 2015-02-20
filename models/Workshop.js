var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Workshops Model
 * ===========
 */

var Workshop = new keystone.List('Workshop', {
  map: { name: 'title' },
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true,
});

Workshop.add({
  title: { type: String, required: true },
  speakers: { type: Types.Relationship, ref: 'User', many: true },
  added: { type: Types.Datetime, default: Date.now, noedit: true },
  status: { type: Types.Select, default: 'P', options: [
    { value: 'P', label: 'Pending' },
    { value: 'W', label: 'Waiting' },
    { value: 'A', label: 'Accepted' },
    { value: 'D', label: 'Declined' }]},
  notes: { type: Types.Markdown },
  tags: { type: Types.Relationship, ref: 'Tag', many: true },
});

Workshop.relationship({ ref: 'Speaker', path: 'speakers' });
Workshop.relationship({ ref: 'Tag', path: 'tags' });

Workshop.defaultColumns = 'title, speakers, tags, status, added';
Workshop.register();
