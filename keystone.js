require('dotenv').load()

process.env.TZ = process.env.TZ || 'America/Montevideo'
process.env.TICKET_RESERVATION = process.env.TICKET_RESERVATION || 8

var keystone = require('keystone')

require('./lib/patchs')

keystone.init({

  'name': 'JSConfUY',
  'brand': 'JSConfUY',

  'sass': 'public',
  'static': 'public',
  'favicon': 'public/favicon.ico',
  'views': 'templates/views',
  'view engine': 'jade',

  'emails': 'templates/emails',

  'auto update': true,
  'session': true,
  'auth': true,
  'user model': 'User',
  'cookie secret': '^v]|AGh(!xqsSq>OUl%<vSwxEh6WzFyN&v"Si0auh<xW1.6p_>lt>u8N"m.Q_Hzu'

})

keystone.import('models')

keystone.set('locals', {
  _: require('underscore'),
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable
})

keystone.set('routes', require('./routes'))

if (keystone.get('env') !== 'production') {
  keystone.set('sass options', { force: true })
}
keystone.set('cloudinary secure', true)

keystone.set('email locals', {
  base_url: process.env.BASE_URL
})

keystone.set('nav', {
  'conference': ['proposals', 'speakers', 'talks', 'workshops', 'organizers', 'attendees', 'sponsors', 'sponsor-levels'],
  'schedule': ['days', 'tracks', 'slots'],
  'sales': ['tickets', 'discounts', 'orders'],
  'blog': ['posts', 'post-categories'],
  'others': ['users', 'tags', 'galleries']
})

keystone.start()
