var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * Discounts Model
 * ===============
 */

var Discount = new keystone.List('Discount', {
  map: { name: 'name' },
  sortable: true,
  autokey: { path: 'code', from: 'name', unique: true },
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
})

Discount.add({
  name: { type: String, required: true },
  logo: { type: Types.CloudinaryImage },
  valid: {
    from: { type: Types.Datetime },
    until: { type: Types.Datetime }
  },
  percentage: { type: Types.Number, default: 0},
  flat: { type: Types.Money, default: 0 },
  limit: { type: Types.Number, note: '0 for no limit.' },
  min: { type: Types.Number, default: 1, note: 'Minimun per purchase' },
  max: { type: Types.Number, default: 5, note: 'Maximun per purchase' },
  tickets: { type: Types.Relationship, ref: 'Ticket', many: true }
})

Discount.defaultColumns = 'name, code, valid.from, valid.until, percentage, flat, limit, tickets'
Discount.register()
