var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * SponsorLevel Model
 * ==================
 */

var SponsorLevel = new keystone.List('SponsorLevel', {
  map: { name: 'name' },
  autokey: { path: 'slug', from: 'name', unique: true },
  sortable: true,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
})

SponsorLevel.add({
  name: { type: String, required: true },
  summary: { type: Types.Markdown },
  size: { type: Types.Number, required: true, default: 230 },
  max: { type: Types.Number, required: true, default: 20 },
  price: { type: Types.Money, required: true, default: 0 }
})

SponsorLevel.relationship({ ref: 'Sponsor', refPath: 'level', path: 'sponsors' })

SponsorLevel.defaultColumns = 'name, slug, max, size, price'
SponsorLevel.register()
