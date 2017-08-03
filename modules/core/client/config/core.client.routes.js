(function () {
  'use strict';

  angular
    .module('core.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.rule(function ($injector, $location) {
      var path = $location.path();
      var hasTrailingSlash = path.length > 1 && path[path.length - 1] === '/';

      if (hasTrailingSlash) {
        // if last character is a slash, return the same url without the slash
        var newPath = path.substr(0, path.length - 1);
        $location.replace().path(newPath);
      }
    });

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    $stateProvider
      .state('abstractHome', {
        url: '/',
        templateUrl: 'modules/core/client/views/abstractHome.client.view.html',
        controller: 'AbstractHomeController',
        controllerAs: 'vm'
      })
      .state('abstractHome.toursite', {
        url: '',
        templateUrl: 'modules/hosts/client/views/toursite/toursite.client.view.html',
        controller: 'ToursiteController',
        controllerAs: 'vm',
        params: {
          toursite: null
        }
      })
      .state('hostToursite-toursite-tours', {
        url: '/tours',
        templateUrl: 'modules/hosts/client/views/toursite/tours.client.view.html',
        controller: 'ToursiteController',
        controllerAs: 'vm',
        params: {
          toursite: null
        },
        data: {
          pageTitle: 'Contact-US'
        }
      })
      .state('hostToursite-about-us', {
        url: '/about-us',
        templateUrl: 'modules/hosts/client/views/toursite/about-us.client.view.html',
        controller: 'ToursiteCommonController',
        controllerAs: 'vm',
        params: {
          toursite: null
        },
        data: {
          pageTitle: 'Contact-US'
        }
      })
      .state('hostToursite-contact-us', {
        url: '/contact-us',
        templateUrl: 'modules/hosts/client/views/toursite/contact-us.client.view.html',
        controller: 'ToursiteCommonController',
        controllerAs: 'vm',
        params: {
          toursite: null
        },
        data: {
          pageTitle: 'Contact-US'
        }
      })
      .state('abstractHome.home', {
        url: '',
        templateUrl: 'modules/core/client/views/home.client.view.html',
        controller: 'HomeController',
        controllerAs: 'vm'
      })
      .state('tourgeckoAdmin-pricing', {
        url: '/pricing',
        templateUrl: 'modules/core/client/views/pricing.client.view.html',
        controller: 'ToursiteController',
        controllerAs: 'vm',
        params: {
          toursite: null
        },
        data: {
          pageTitle: 'Contact-US'
        }
      })
      .state('tourgeckoAdmin-about-us', {
        url: '/about',
        templateUrl: 'modules/core/client/views/tourgeckoAdmin-about-us.client.view.html',
        controller: 'ToursiteController',
        controllerAs: 'vm',
        params: {
          toursite: null
        },
        data: {
          pageTitle: 'Contact-US'
        }
      })
      .state('legal', {
        url: '/legal',
        templateUrl: 'modules/core/client/views/security.client.view.html',
        controller: '',
        controllerAs: ''
      })
      .state('legal.privacypolicy', {
        url: '/privacy-policy',
        templateUrl: 'modules/core/client/views/privacy-policy.client.view.html',
        controller: 'LegalController',
        controllerAs: 'vm'
      })
      .state('legal.terms-of-use', {
        url: '/terms-of-use',
        templateUrl: 'modules/core/client/views/terms-of-use.client.view.html',
        controller: 'LegalController',
        controllerAs: 'vm'
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/client/views/404.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Not-Found'
        }
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: 'modules/core/client/views/400.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Bad-Request'
        }
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: 'modules/core/client/views/403.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Forbidden'
        }
      });
  }
}());
