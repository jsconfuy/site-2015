var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Talks Model
 * ===========
 */

var Talk = new keystone.List('Talk', {
  map: { name: 'title' },
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true,
});

Talk.add({
  title: { type: String, required: true },
  speakers: { type: Types.Relationship, ref: 'Speaker', many: true },
  added: { type: Types.Datetime, default: Date.now, noedit: true },
  status: { type: Types.Select, default: 'P', options: [
    { value: 'P', label: 'Pending' },
    { value: 'W', label: 'Waiting' },
    { value: 'C', label: 'Confirmed' },
    { value: 'D', label: 'Declined' }]},
  notes: { type: Types.Markdown },
  tags: { type: Types.Relationship, ref: 'Tag', many: true },
});

Talk.relationship({ ref: 'Speaker', path: 'speakers' });
Talk.relationship({ ref: 'Tag', path: 'tags' });

Talk.defaultColumns = 'title, speakers, tags, status, added';
Talk.register();
