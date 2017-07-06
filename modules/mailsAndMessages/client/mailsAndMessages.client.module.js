(function (app) {
  'use strict';
  app.registerModule('mailsAndMessages');
  app.registerModule('mailsAndMessages.services');
  app.registerModule('mailsAndMessages.routes', ['ui.router', 'core.routes', 'mailsAndMessages.services']);
}(ApplicationConfiguration));
