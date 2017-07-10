(function () {
  'use strict';

  angular
    .module('tourgeckoadmin', [])
    .controller('TourgeckoAdminController', TourgeckoAdminController)
    .constant('pinBoardConstants', {
      "Upload your logo and complete 'About your business'" : "logoAndAboutUs",
      "Update inquiry and social contacts" : 'inquiryAndSocial',
      "Add a tour to tour inventory" : 'tourAdd'
    });

  TourgeckoAdminController.$inject = ['$scope', '$http', '$filter', '$state', 'Authentication', 'AdminService', 'HostService', 'ThemeService', 'ActivityService', 'PinboardGoalAdminService', 'pinBoardConstants'];

  function TourgeckoAdminController($scope, $http, $filter, $state, Authentication, AdminService, HostService, ThemeService, ActivityService, PinboardGoalAdminService, pinBoardConstants) {
    var vm = this;
    vm.userGuide = true;
    vm.authentication = Authentication;
    // variables for rich data addition
    vm.themesAdded;
    vm.activitiesAdded;
    vm.languagesAdded;

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
      vm.addGoals = false;
      vm.addPins = false;
      if (tabId == 'browseAndModifyData')
        vm.browseAndModifyData = true;
      else if (tabId == 'addRichData')
        vm.addRichData = true;
      else if (tabId == 'addGoals')
        vm.addGoals = true;
      else if (tabId == 'addPins')
        vm.addPins = true;
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

    // Add goals
    vm.goalToUsers = [];
    vm.addGoalsForPinboard = function () {
      var toUsersForGoals = [];
      for (var index = 0; index < vm.goalToUsers.length; index++)
        toUsersForGoals.push(nameToId.get(vm.goalToUsers[index]));

      vm.goal.to = toUsersForGoals;

      $http.post('/api/admin/pinboardGoals', vm.goal)
        .success(function (response) {
          $state.reload();
        })
        .error(function (error) {
          console.log(error);
        });
    }
    // Add goals, ends here

    // Add pins
    vm.pinToUsers = [];
    vm.pinType;
    vm.pin = {};
    vm.addPinsToPinboard = function () {
      vm.pin.type = vm.pinType[0];
      var toUsersForPins = []
      for (var index = 0; index < vm.pinToUsers.length; index++)
        toUsersForPins.push(nameToId.get(vm.pinToUsers[index]));

      vm.pin.to = toUsersForPins;
      if (vm.goalForThisPin)
        vm.goal = goalToId.get(vm.goalForThisPin[0]);
      else
        vm.goal = false;
      var pinDetails = {pinData: vm.pin, goal: vm.goal}
      $http.post('/api/admin/pinboardPins', pinDetails)
        .success(function (response) {
          $state.reload();
        })
        .error(function (error) {
          console.log(error);
        });
    }
    // Add pins ends here


    // Functions and queries for browse and modify data

    AdminService.query(function (data) {
      vm.users = data;
      vm.buildPager('users');
    });

    HostService.query(function (data) {
      vm.hosts = data;
      createUSersSelect2ForPinsAndGoals(data);
    });

    var nameToId = new Map();
    function createUSersSelect2ForPinsAndGoals (users) {
      var select2Data = [];
      nameToId.set('all', 'all');
      for (var index = 0; index < users.length; index++) {
        var temp = users[index].firstName + ' ' + users[index].lastName;
        nameToId.set(temp, users[index]._id);
        select2Data.push(temp);
      }
      $('#pinsFor').select2({
        placeholder: "Select users to whom pin has to sent",
        width: '100%',
        data: select2Data
      });

      $('#goalFor').select2({
        placeholder: "Select users to whom goal has to be set",
        width: '100%',
        data: select2Data
      });
    }

    PinboardGoalAdminService.query(function (data) {
      createGoalSelect2ForPins(data);
    });


    var goalToId = new Map();
    function createGoalSelect2ForPins (goals) {
      var select2Data = [];
      for (var index = 0; index < goals.length; index++) {
        var temp = goals[index].goalText;
        goalToId.set(temp, goals[index]._id);
        select2Data.push(temp);
      }

      $('#pinGoal').select2({
        placeholder: "Select the goal to which this pin belongs",
        width: '100%',
        data: select2Data
      });
    }

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
        figureOutItemsToDisplayForUsers();
      else if (condition === 'hosts')
        figureOutItemsToDisplayForHosts();
      else if (condition === 'themes')
        figureOutItemsToDisplayForThemes();
      else if (condition === 'activities')
        figureOutItemsToDisplayForActivities();
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
        figureOutItemsToDisplayForUsers();
      else if (condition === 'hosts')
        figureOutItemsToDisplayForHosts();
      else if (condition === 'themes')
        figureOutItemsToDisplayForThemes();
      else if (condition === 'activities')
        figureOutItemsToDisplayForActivities();
    }
    // Browse and modification section ends here
  }
}());
