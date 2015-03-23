var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Tickets Model
 * =============
 */

var Ticket = new keystone.List('Ticket', {
  map: { name: 'name' },
  autokey: { path: 'code', from: 'name', unique: true },
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true},
});

Ticket.add({
  name: { type: String, required: true },
  description: { type: Types.Markdown },
  sale: {
    from: { type: Types.Datetime },
    until: { type: Types.Datetime },
  },
  price: { type: Types.Money },
  limit: { type: Types.Number, default: 0, note: '0 for no limit.' },
  min: { type: Types.Number, default: 1, note: 'Minimun per purchase' },
  max: { type: Types.Number, default: 5, note: 'Maximun per purchase' },
  sold: { type: Types.Number, default: 0, noedit: true },
  secret: { type: Types.Boolean, default: true, indent: true },
});

Ticket.schema.virtual('total').get(function() {
  return this.limit || '∞';
}).depends = 'limit';

Ticket.calculateDiscount = function(ticket, discount) {
  var value = discount ? discount.flat + (discount.percentage / 100 * ticket.price) : 0;
  if (value > ticket.price) {
    return ticket.price;
  }
  return value;
};

Ticket.defaultColumns = 'code, name, saleFrom, saleUntil, price, sold, total, secret';
Ticket.register();
