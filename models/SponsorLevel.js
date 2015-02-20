var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * SponsorLevel Model
 * ==================
 */

var SponsorLevel = new keystone.List('SponsorLevel', {
  map: { name: 'name' },
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true,
});

SponsorLevel.add({
  name: { type: String, required: true },
  summary: { type: Types.Markdown },
  cost: { type: Types.Money, required: true, default: 0 }
});

SponsorLevel.defaultColumns = 'name, slug, order, cost';
SponsorLevel.register();
