var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Tickets Model
 * =============
 */

var Ticket = new keystone.List('Ticket', {
  map: { name: 'name' },
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true},
});

Ticket.add({
  name: { type: String, required: true },
  description: { type: Types.Markdown },
  saleFrom: { type: Types.Datetime },
  saleUntil: { type: Types.Datetime },
  price: { type: Types.Money },
  limit: { type: Types.Number, default: 0, note: '0 for no limit.' },
  sold: { type: Types.Number, default: 0, noedit: true },
  secret: { type: Types.Boolean, default: true, indent: true },
});

Ticket.schema.virtual('total').get(function() {
  return this.limit || '∞';
}).depends = 'limit';

Ticket.defaultColumns = 'name, saleFrom, saleUntil, price, sold, total, secret';
Ticket.register();
