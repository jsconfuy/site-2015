var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Orders Model
 * ============
 */

var Order = new keystone.List('Order', {
  map: { name: 'id' },
});

Order.add({
  name: { type: String, required: true, initial: true },
  email: { type: Types.Email, required: true, initial: true },
  ticket: { type: Types.Relationship, ref: 'Ticket', index: true, required: true, initial: true },
  quantity: { type: Types.Number, required: true, default: 1, intial: true },
  reserved: { type: Types.Datetime, default: Date.now, noedit: true },
  paid: { type: Types.Datetime },
  payment_id: { type: Types.String },
  payment_name: { type: Types.String },
});

// The order should be paid before 15 minutes.
// We should check the created and paid fields to reserve

Order.defaultColumns = 'id, name, email, reserved, paid';
Order.register();
