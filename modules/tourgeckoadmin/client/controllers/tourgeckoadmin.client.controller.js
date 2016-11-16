(function () {
  'use strict';

  angular
    .module('tourgeckoadmin', [])
    .controller('TourgeckoAdminController', TourgeckoAdminController);

  TourgeckoAdminController.$inject = ['$scope', '$http', '$filter', '$state', 'Authentication', 'AdminService', 'HostService', 'ThemeService', 'ActivityService'];

  function TourgeckoAdminController($scope, $http, $filter, $state, Authentication, AdminService, HostService, ThemeService, ActivityService) {
    var vm = this;
    vm.userGuide = true;
    vm.authentication = Authentication;
    // variables for rich data addition
    vm.themesAdded;
    vm.activitiesAdded;
    vm.languagesAdded

    // Vriables and function calls for browse and modify data
    vm.pagedItemsForUsers = [];
    vm.pagedItemsForHosts = [];
    vm.pagedItemsForThemes = [];
    vm.pagedItemsForActivities = [];
    vm.buildPager = buildPager;
    vm.figureOutItemsToDisplayForUsers = figureOutItemsToDisplayForUsers;
    vm.figureOutItemsToDisplayForHosts = figureOutItemsToDisplayForHosts;
    vm.figureOutItemsToDisplayForThemes = figureOutItemsToDisplayForThemes;
    vm.figureOutItemsToDisplayForActivities = figureOutItemsToDisplayForActivities;
    vm.pageChanged = pageChanged;

    // For showing the appropriate options as per the butoon clicked
    vm.showOptions = function(tabId) {
      vm.browseAndModifyData = false;
      vm.addRichData = false;
      vm.analysis = false;
      vm.userGuide = false;
      if (tabId === 'browseAndModifyData')
        vm.browseAndModifyData = true;
      else if (tabId === 'addRichData')
        vm.addRichData = true;
      else
        vm.analysis = true;
    };

    // Functions for rich data addition
    vm.addThemes = function() {
      vm.commitThemes = [];
      for (var index = 0; index < vm.themesAdded.split(',').length; index++)
        vm.commitThemes.push({ 'themeName': vm.themesAdded.split(',')[index].trim() });
      vm.themesAdded = '';
      $http.post('/api/admin/themes', vm.commitThemes)
        .success(function (response) {
          $state.reload();
        })
        .error(function (error) {
          console.log(error);
        });
    };

    vm.addActivities = function() {
      vm.commitActivities = [];
      for (var index = 0; index < vm.activitiesAdded.split(',').length; index++)
        vm.commitActivities.push({ 'activityName': vm.activitiesAdded.split(',')[index].trim() });

      vm.activitiesAdded = '';
      $http.post('/api/admin/activities', vm.commitActivities)
        .success(function (response) {
          $state.reload();
        })
        .error(function (error) {
          console.log(error);
        });
    };

    vm.addLanguages = function() {
      vm.commitLanguages = [];
      for (var index = 0; index < vm.languagesAdded.split(',').length; index++) {
        var language = vm.languagesAdded.split(',')[index].trim();
        vm.commitLanguages.push(language);
      }
      
      var newLanguagesAdded = {'supportedLanguages': vm.commitLanguages}
      vm.languagesAdded = '';
      $http.post('/api/admin/languages', newLanguagesAdded)
        .success(function (response) {
          $state.reload();
        })
        .error(function (error) {
          console.log(error);
        });
    };
    // Rich data addition ends here


    // Functions and queries for browse and modify data

    AdminService.query(function (data) {
      vm.users = data;
      vm.buildPager('users');
    });

    HostService.query(function (data) {
      vm.hosts = data;
      vm.buildPager('hosts');
    });

    ThemeService.query(function (data) {
      vm.themes = data;
      vm.buildPager('themes');
    });

    ActivityService.query(function (data) {
      vm.activities = data;
      vm.buildPager('activities');
    });

    function buildPager(condition) {
      vm.itemsPerPageForUsers = 15;
      vm.itemsPerPageForHosts = 15;
      vm.itemsPerPageForThemes = 15;
      vm.itemsPerPageForActivities = 15;
      vm.currentPageForUsers = 1;
      vm.currentPageForHosts = 1;
      vm.currentPageForThemes = 1;
      vm.currentPageForActivities = 1;
      if (condition === 'users')
        vm.figureOutItemsToDisplayForUsers();
      else if (condition === 'hosts')
        vm.figureOutItemsToDisplayForHosts();
      else if (condition === 'themes')
        vm.figureOutItemsToDisplayForThemes();
      else if (condition === 'activities')
        vm.figureOutItemsToDisplayForActivities();
    }

    function figureOutItemsToDisplayForUsers() {
      vm.filteredItemsForUsers = $filter('filter')(vm.users, {
        $: vm.search
      });
      vm.filterLengthForUsers = vm.filteredItemsForUsers.length;
      var begin = ((vm.currentPageForUsers - 1) * vm.itemsPerPageForUsers);
      var end = begin + vm.itemsPerPageForUsers;
      vm.pagedItemsForUsers = vm.filteredItemsForUsers.slice(begin, end);
    }

    function figureOutItemsToDisplayForHosts() {
      vm.filteredItemsForHosts = $filter('filter')(vm.hosts, {
        $: vm.search
      });
      vm.filterLengthForHosts = vm.filteredItemsForHosts.length;
      var begin = ((vm.currentPageForHosts - 1) * vm.itemsPerPageForHosts);
      var end = begin + vm.itemsPerPageForHosts;
      vm.pagedItemsForHosts = vm.filteredItemsForHosts.slice(begin, end);
    }

    function figureOutItemsToDisplayForThemes() {
      vm.filteredItemsForThemes = $filter('filter')(vm.themes, {
        $: vm.search
      });
      vm.filterLengthForThemes = vm.filteredItemsForThemes.length;
      var begin = ((vm.currentPageForThemes - 1) * vm.itemsPerPageForThemes);
      var end = begin + vm.itemsPerPageForThemes;
      vm.pagedItemsForThemes = vm.filteredItemsForThemes.slice(begin, end);
    }

    function figureOutItemsToDisplayForActivities() {
      vm.filteredItemsForActivities = $filter('filter')(vm.activities, {
        $: vm.search
      });
      vm.filterLengthForActivities = vm.filteredItemsForActivities.length;
      var begin = ((vm.currentPageForActivities - 1) * vm.itemsPerPageForActivities);
      var end = begin + vm.itemsPerPageForActivities;
      vm.pagedItemsForActivities = vm.filteredItemsForActivities.slice(begin, end);
    }

    function pageChanged(condition) {
      if (condition === 'users')
        vm.figureOutItemsToDisplayForUsers();
      else if (condition === 'hosts')
        vm.figureOutItemsToDisplayForHosts();
      else if (condition === 'themes')
        vm.figureOutItemsToDisplayForThemes();
      else if (condition === 'activities')
        vm.figureOutItemsToDisplayForActivities();
    }
    // Browse and modification section ends here
  }
}());
