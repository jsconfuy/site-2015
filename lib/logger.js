var loggly = require('loggly')

module.exports = exports = loggly.createClient({
  token: process.env.LOGGLY_TOKEN,
  subdomain: process.env.LOGGLY_SUBDOMAIN,
  tags: ['NodeJS'],
  json: true
})
