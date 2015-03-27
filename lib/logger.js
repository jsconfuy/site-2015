var loggly = require('loggly')

console.log(process.env.LOGGLY_TOKEN)
console.log(process.env.LOGGLY_SUBDOMAIN)
module.exports = exports = loggly.createClient({
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    tags: ['NodeJS'],
    json:true
})

