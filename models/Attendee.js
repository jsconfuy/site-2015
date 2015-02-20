var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Attendees Model
 * ===============
 */

var Attendee = new keystone.List('Attendee', {
  map: { name: 'name' },
});

Attendee.add({
  order: { type: Types.Relationship, ref: 'Order', index: true, noedit: true },
  ticket: { type: Types.Relationship, ref: 'Ticket', index: true },
  name: { type: String, required: true },
  email: { type: Types.Email },
  price: { type: Types.Money, required: false},
  tshirt: { type: Types.Select, options: [
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' },]},
});

Attendee.defaultColumns = 'name, tshirt, ticket, email, order';
Attendee.register();
