(function () {
  'use strict';

  // Setting up route
  angular
    .module('tourgeckoadmin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.home', {
        url: '/home',
        templateUrl: 'modules/tourgeckoadmin/client/views/tourgecko-admin/adminHome.client.view.html',
        controller: 'TourgeckoAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/tourgeckoadmin/client/views/tourgecko-admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Users List'
        }
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/tourgeckoadmin/client/views/tourgecko-admin/view-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'Edit {{ userResolve.displayName }}'
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/tourgeckoadmin/client/views/tourgecko-admin/edit-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'Edit User {{ userResolve.displayName }}'
        }
      })
      .state('admin.hosts', {
        url: '/hosts',
        templateUrl: 'modules/tourgeckoadmin/client/views/tourgecko-admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Hosts List'
        }
      })
      .state('admin.host', {
        url: '/hosts/:userId',
        templateUrl: 'modules/tourgeckoadmin/client/views/tourgecko-admin/view-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'Edit {{ userResolve.displayName }}'
        }
      });
      /* .state('admin.host-edit', {
        url: '/hosts/:userId/edit',
        templateUrl: 'modules/tourgeckoadmin/client/views/tourgecko-admin/edit-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'Edit User {{ userResolve.displayName }}'
        }
      });*/

    getUser.$inject = ['$stateParams', 'AdminService'];

    function getUser($stateParams, AdminService) {
      return AdminService.get({
        userId: $stateParams.userId
      }).$promise;
    }
  }
}());
