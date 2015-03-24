require('dotenv').load()

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

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
  _: require('underscore'),
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable
})

// Load your project's Routes
keystone.set('routes', require('./routes'))

if (keystone.get('env') !== 'production') {
  keystone.set('sass options', { force: true })
}
keystone.set('cloudinary secure', true)

// Setup common locals for your emails. The following are required by Keystone's
// default email templates, you may remove them if you're using your own.
keystone.set('email locals', {
  logo_src: '/images/logo-email.gif',
  logo_width: 194,
  logo_height: 76,
  theme: {
    email_bg: '#f9f9f9',
    link_color: '#2697de',
    buttons: {
      color: '#fff',
      background_color: '#2697de',
      border_color: '#1a7cb7'
    }
  }
})

// Be sure to update this rule to include your site's actual domain, and add
// other rules your email templates require.
keystone.set('email rules', [{
  find: '/images/',
  replace: (keystone.get('env') === 'production') ? 'https://jsconf.uy/images/' : 'http://localhost:3000/images/'
}, {
  find: '/keystone/',
  replace: (keystone.get('env') === 'production') ? 'https://jsconf.uy/keystone/' : 'http://localhost:3000/keystone/'
}])

// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
  'conference': ['proposals', 'speakers', 'talks', 'workshops', 'organizers'],
  'sales': ['tickets', 'orders', 'attendees', 'discounts', 'sponsors', 'sponsor-levels'],
  'blog': ['posts', 'post-categories'],
  'others': ['users', 'tags', 'galleries']
})

keystone.start()
