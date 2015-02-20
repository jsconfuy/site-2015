var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Discounts Model
 * ============
 */

var Discount = new keystone.List('Discount', {
  map: { name: 'code' },
});

Discount.add({
  code: { type: String, required: true, unique: true },
  validFrom: { type: Types.Datetime, required: false},
  validUntil: { type: Types.Datetime, required: false},
  percentage: { type: Types.Number, required: true, default: 0},
  flat: { type: Types.Money, required: true, default: 0 },
  limit: { type: Types.Number },
  tickets: { type: Types.Relationship, ref: 'Ticket', many: true },
});

Discount.relationship({ ref: 'Ticket', path: 'tickets' });

Discount.defaultColumns = 'code, validFrom, validUntil, percentage, flat, limit, tickets';
Discount.register();
