(function (app) {
  'use strict';

  app.registerModule('tourgeckoadmin', ['core', 'ngSanitize']);
  app.registerModule('tourgeckoadmin.services');
  app.registerModule('tourgeckoadmin.routes', ['ui.router', 'core.routes', 'tourgeckoadmin.services']);
}(ApplicationConfiguration));
