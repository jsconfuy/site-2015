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
  validFrom: { type: Types.Datetime },
  validUntil: { type: Types.Datetime },
  percentage: { type: Types.Number, required: true, default: 0},
  flat: { type: Types.Money, required: true, default: 0 },
  limit: { type: Types.Number },
  logo: { type: Types.CloudinaryImage },
  tickets: { type: Types.Relationship, ref: 'Ticket', many: true },
});

Discount.relationship({ ref: 'Ticket', path: 'tickets' });

Discount.defaultColumns = 'code, validFrom, validUntil, percentage, flat, limit, tickets';
Discount.register();
