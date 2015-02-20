var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Tickets Model
 * ==========
 */

var Ticket = new keystone.List('Ticket', {
  map: { name: 'name' },
});

Ticket.add({
  name: { type: String, required: true },
  description: { type: Types.Markdown, required: false },
  saleFrom: { type: Types.Datetime, required: false},
  saleUntil: { type: Types.Datetime, required: false},
  price: { type: Types.Money, required: false},
  total: { type: Types.Number, default: 0, note: '0 for no limit.'},
  sold: { type: Types.Number, default: 0, noedit: true},
  secret: { type: Types.Boolean, default: true},
});

Ticket.defaultColumns = 'name, saleFrom, saleUntil, price, sold, total, secret';
Ticket.register();
