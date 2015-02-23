var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Discounts Model
 * ===============
 */

var Discount = new keystone.List('Discount', {
  map: { name: 'code' },
});

Discount.add({
  code: { type: String, required: true, unique: true },
  valid: {
    from: { type: Types.Datetime },
    until: { type: Types.Datetime },
  },
  percentage: { type: Types.Number, required: true, default: 0},
  flat: { type: Types.Money, required: true, default: 0 },
  limit: { type: Types.Number, note: '0 for no limit.' },
  logo: { type: Types.CloudinaryImage },
  tickets: { type: Types.Relationship, ref: 'Ticket', many: true },
});

Discount.defaultColumns = 'code, valid.from, valid.until, percentage, flat, limit, tickets';
Discount.register();
