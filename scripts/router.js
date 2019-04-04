app.factory("routingService", function($q) {
    return {
        "auth": function ($window, $location, direct) {
            if ($window.sessionStorage.getItem('position') != "null") { $location.path(direct); }
            else { window.location.href = '../'; }
        }
    }
});

app.config(function($routeProvider, $locationProvider){
	'use strict';
	$locationProvider.hashPrefix('');
	$routeProvider
	.when('/', {
        resolve: {
            "check": function (routingService, $window, $location) {
                if ($window.sessionStorage.getItem('position') == "manager")
                    return routingService.auth($window, $location, '/dashboard-manager');
                else if ($window.sessionStorage.getItem('position') == "officer")
                    return routingService.auth($window, $location, '/dashboard-officer');
            }
        }
	})
    .when('/dashboard-manager', {
        templateUrl: '/dashboard-manager'
    })
    .when('/dashboard-officer', {
        templateUrl: '/dashboard-officer'
    })
    .when('/account-management', {
        templateUrl: '/account-management'
    })
    .when('/account/:userID', {
        templateUrl: function(params) {
            return '/account/' + params.userID;
        }
    })
    .when('/truck-management', {
        templateUrl: '/truck-management'
    })
    .when('/truck/:truckID', {
        templateUrl: function(params) {
            return '/truck/' + params.truckID;
        }
    })
    .when('/area-management', {
        templateUrl: '/area-management'
    })
    .when('/area-management', {
        templateUrl: '/area-management'
    })
    .when('/acr-management', {
        templateUrl: '/acr-management'
    })
    .when('/notification', {
        templateUrl: '/notification'
    })
    .when('/daily-report', {
        templateUrl: '/daily-report',
        controller: 'dailyController',
        controllerAs: 'daily'
    })
    .otherwise({
        templateUrl: '/error',
        controller: 'errorController',
        controllerAs: 'error'
    });
});