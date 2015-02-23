var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Tags Model
 * ==========
 */

var Tag = new keystone.List('Tag', {
  map: { name: 'name'},
  autokey: { path: 'slug', from: 'name', unique: true },
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true },
});

Tag.add({
  name: { type: String, required: true },
  color: { type: Types.Color },
});

Tag.relationship({ ref: 'Sponsor', refPath: 'tags', path: 'sponsors' });
Tag.relationship({ ref: 'Speaker', refPath: 'tags', path: 'speakers' });
Tag.relationship({ ref: 'Proposal', refPath: 'tags', path: 'proposals' });
Tag.relationship({ ref: 'Talk', refPath: 'tags', path: 'talks' });
Tag.relationship({ ref: 'Workshop', refPath: 'tags', path: 'workshops' });

Tag.defaultColumns = 'name, slug, color';
Tag.register();
