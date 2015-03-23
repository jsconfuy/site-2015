var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Orders Model
 * ============
 */

var Order = new keystone.List('Order', {
  map: { name: 'id' },
  nocreate: true,
  noedit: true,
});

Order.add({
  name: { type: String },
  email: { type: Types.Email },
  ticket: { type: Types.Relationship, ref: 'Ticket', index: true },
  discount: { type: Types.Relationship, ref: 'Discount', index: true },
  price: {
    ticket: { type: Types.Money },
    discount: { type: Types.Money, default: 0 },
  },
  quantity: { type: Types.Number, default: 1 },
  total: { type: Types.Money },
  reserved: { type: Types.Datetime },
  paid: { type: Types.Datetime },
  canceled: { type: Types.Datetime },
  payment: {
    order: { type: String },
    invoice: { type: String },
  }
});

Order.relationship({ ref: 'Attendee', refPath: 'order', path: 'attendees' });

// The order should be paid before 15 minutes.
// We should check the created and paid fields to reserve

Order.defaultColumns = 'id, name, email, reserved, paid';
Order.register();
