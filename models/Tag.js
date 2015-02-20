var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Tags Model
 * ==========
 */

var Tag = new keystone.List('Tag', {
  map: { name: 'name'},
  autokey: { path: 'slug', from: 'name', unique: true },
});

Tag.add({
  name: { type: String, required: true },
  color: { type: Types.Color },
});

Tag.relationship({ ref: 'Sponsor', path: 'tags' });
Tag.relationship({ ref: 'Speaker', path: 'tags' });
Tag.relationship({ ref: 'Proposal', path: 'tags' });

Tag.defaultColumns = 'name, slug, color';
Tag.register();
