var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * Attendees Model
 * ===============
 */

var Attendee = new keystone.List('Attendee', {
  map: { name: 'name' },
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true }
})

Attendee.add({
  name: { type: String },
  email: { type: Types.Email },
  tshirt: {
    label: 'T-Shirt', type: Types.Select, options: [
      { value: 'XS', label: 'XS' },
      { value: 'S', label: 'S' },
      { value: 'M', label: 'M' },
      { value: 'L', label: 'L' },
      { value: 'XL', label: 'XL' },
      { value: 'XXL', label: 'XXL' }
    ]},
  comments: { type: Types.Textarea },
  order: { type: Types.Relationship, ref: 'Order', index: true, noedit: true },
  ticket: { type: Types.Relationship, ref: 'Ticket', index: true },
  discount: { type: Types.Relationship, ref: 'Discount', index: true },
  price: { type: Types.Money }
})

Attendee.defaultColumns = 'name, email, tshirt, ticket, discount, order'
Attendee.register()
