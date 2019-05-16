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
                if ($window.sessionStorage.getItem('position') == "Manager")
                    return routingService.auth($window, $location, '/dashboard-manager');
                else if ($window.sessionStorage.getItem('position') == "Reporting Officer")
                    return routingService.auth($window, $location, '/dashboard-officer');
            }
        }
	})
    .when('/dashboard-manager', {
        templateUrl: '/dashboard-manager',
        controller: 'managerController',
        controllerAs: 'manager'
    })
    .when('/dashboard-officer', {
        templateUrl: '/dashboard-officer',
        controller: 'officerController',
        controllerAs: 'officer'
    })
    .when('/account-management', {
        templateUrl: '/account-management',
        controller: 'accountController',
        controllerAs: 'account'
    })
    .when('/account/:userID', {
        templateUrl: function(params) {
            return '/account/' + params.userID;
        },
        controller: 'specificAccController',
        controllerAs: 'specificAcc'
    })
    .when('/role-management', {
        templateUrl: '/role-management',
        controller: 'roleController',
        controllerAs: 'role'
    })
    .when('/auth/:auth', {
        templateUrl: function(params) {
            return '/auth/' + params.auth;
        },
        controller: 'specificAuthController',
        controllerAs: 'specificAuth'
    })
    .when('/driver-management', {
        templateUrl: '/driver-management',
        controller: 'driverController',
        controllerAs: 'driver'
    })
    .when('/truck-management', {
        templateUrl: '/truck-management',
        controller: 'truckController',
        controllerAs: 'truck'
    })
    .when('/truck/:truckID', {
        templateUrl: function(params) {
            return '/truck/' + params.truckID;
        }
    })
    .when('/zone-management', {
        templateUrl: '/zone-management',
        controller: 'zoneController',
        controllerAs: 'zone'
    })
    .when('/area-management', {
        templateUrl: '/area-management',
        controller: 'areaController',
        controllerAs: 'area'
    })
//    .when('/area-management', {
//        templateUrl: '/area-management'
//    })
    .when('/reporting', {
        templateUrl: '/reporting.html',
        controller: 'reportingController',
        controllerAs: 'reporting'
    })
    .when('/datavisualization', {
        templateUrl: '/data-visualization.html',
        controller: 'visualizationController',
        controllerAs: 'visualization'
    })
    .when('/acr-management', {
        templateUrl: '/acr-management'
    })
    .when('/notification', {
        templateUrl: '/notification'
    })
    .when('/daily-report/:areaCode', {
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