var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * Discounts Model
 * ===============
 */

var Discount = new keystone.List('Discount', {
  map: { name: 'name' },
  autokey: { path: 'code', from: 'name', unique: true },
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true}
})

Discount.add({
  name: { type: String, required: true },
  valid: {
    from: { type: Types.Datetime },
    until: { type: Types.Datetime }
  },
  percentage: { type: Types.Number, required: true, default: 0},
  flat: { type: Types.Money, required: true, default: 0 },
  limit: { type: Types.Number, note: '0 for no limit.' },
  min: { type: Types.Number, default: 1, note: 'Minimun per purchase' },
  max: { type: Types.Number, default: 5, note: 'Maximun per purchase' },
  logo: { type: Types.CloudinaryImage },
  tickets: { type: Types.Relationship, ref: 'Ticket', many: true }
})

Discount.defaultColumns = 'code, name, valid.from, valid.until, percentage, flat, limit, tickets'
Discount.register()
