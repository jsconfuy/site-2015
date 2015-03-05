var keystone = require('keystone'),
  middleware = require('./middleware'),
  importRoutes = keystone.importer(__dirname);

keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

var routes = {
  views: importRoutes('./views'),
  api: importRoutes('./api'),
};

exports = module.exports = function(app) {

  app.get('/', routes.views.home);
  app.get('/venue', routes.views.venue);
  app.get('/hotels', routes.views.hotels);
  app.get('/agenda', routes.views.agenda);
  app.get('/code-of-conduct', routes.views.coc);
  app.all('/contact', routes.views.contact);
  app.all('/proposals', routes.views.cfp);
  app.all('/workshops', routes.views.cfw);
  app.get('/blog/:category?', routes.views.blog);
  app.get('/blog/post/:post', routes.views.post);

  // API
  app.all('/api*', keystone.middleware.api);
  app.get('/api/tickets/available', routes.api.tickets.available);
  app.post('/api/tickets/reserve', routes.api.tickets.reserve);
  app.post('/api/tickets/checkout', routes.api.tickets.checkout);

  // app.get('/protected', middleware.requireUser, routes.views.protected);

};
