var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * Orders Model
 * ============
 */

var Order = new keystone.List('Order', {
  map: { name: 'id' },
  perPage: 200,
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true },
  nocreate: true,
  noedit: true
})

Order.add({
  name: { type: String },
  email: { type: Types.Email },
  ticket: { type: Types.Relationship, ref: 'Ticket', index: true },
  discount: { type: Types.Relationship, ref: 'Discount', index: true },
  price: {
    ticket: { type: Types.Money },
    discount: { type: Types.Money, default: 0 }
  },
  quantity: { type: Types.Number, default: 1 },
  total: { type: Types.Money },
  reserved: { type: Types.Datetime },
  paid: { type: Types.Datetime },
  canceled: { type: Types.Datetime },
  payment: {
    gateway: {
      label: 'Gateway', type: Types.Select, options: [
        {value: '2checkout', label: '2Checkout'},
        {value: 'paypal', label: 'PayPal'}
      ]},
    order: { type: String },
    invoice: { type: String }
  }
})

Order.relationship({ ref: 'Attendee', refPath: 'order', path: 'attendees' })

Order.schema.methods.sendOrderConfirmation = function (callback) {
  if (typeof callback !== 'function') {
    callback = function () {}
  }
  var order = this
  if (!order.email) return callback()

  new keystone.Email('order-confirmation').send({
    to: order.email,
    from: {
      name: 'JSConfUY',
      email: 'hola@jsconfuy.com'
    },
    subject: 'Thank you!',
    order: order
  }, callback)
}

Order.defaultColumns = 'id, name, email, reserved, canceled, paid, ticket, discount, quantity'
Order.register()
