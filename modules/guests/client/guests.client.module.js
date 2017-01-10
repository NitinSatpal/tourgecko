(function (app) {
  'use strict';

  app.registerModule('guests', ['core', 'ngSanitize']);
  app.registerModule('guests.services');
  app.registerModule('guests.routes', ['ui.router', 'core.routes', 'guests.services']);
}(ApplicationConfiguration));
