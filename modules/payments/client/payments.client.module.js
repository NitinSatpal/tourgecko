(function (app) {
  'use strict';
  app.registerModule('payments');
  app.registerModule('payments.services');
  app.registerModule('payments.routes', ['ui.router', 'core.routes', 'payments.services']);
}(ApplicationConfiguration));
