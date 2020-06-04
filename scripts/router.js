app.factory("routingService", function($q) {
    return {
        "auth": function ($window, $location, direct) {
            if ($window.sessionStorage.length > 0) {
                if ($window.sessionStorage.getItem('position') != "null") {
                    $location.path(direct);
                }
                else { window.location.href = '../'; }
            } else {
                window.location.href = '../';
            }
        }, 
        "clear": function ($window, $location, direct, $sessionStorage) {
            $window.sessionStorage.clear();
            window.location.href = '../';
        },
        "accessToken": function () {
            console.log('ok');
            return false;
        }
    }
});

app.config(function($routeProvider, $locationProvider){
	'use strict';
	$locationProvider.hashPrefix('');
	$routeProvider
	.when('/', {
        resolve: {
            "check": function (routingService, $window, $location, $http) {
                //get all role with reporting officer
                $http.get('/getAllRoleWithReportingOfficer').then(function (response) {
                    var result = response.data;
                    var isReportingOfficer = false;
                    
                    for(var i=0; i<result.length; i++){
                        if(result[i].positionName == $window.sessionStorage.getItem('position')){
                            isReportingOfficer = true;
                            break;
                        }
                    }
                    
                    if (isReportingOfficer)
                        return routingService.auth($window, $location, '/dashboard-officer');
                    
                });
                
                //get all role with manager dashboard
                $http.get('/getAllRoleWithManagerDashboard').then(function (response) {
                    var result = response.data;
                    var viewManagerDashboard = false;
                    
                    for(var i=0; i<result.length; i++){
                        if(result[i].positionName == $window.sessionStorage.getItem('position')){
                            viewManagerDashboard = true;
                            break;
                        }
                    }
                    
                    
                    if (viewManagerDashboard)
                        return routingService.auth($window, $location, '/dashboard-manager');
                });
//                else if ($window.sessionStorage.getItem('position') == "Officer")
//                        return routingService.auth($window, $location, '/zone-management');
            }
        }
	})
    .when('/dashboard-manager', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/dashboard-manager');
            }
        },
        templateUrl: '/dashboard-manager',
        controller: 'managerController',
        controllerAs: 'manager'
    })
    .when('/dashboard-officer', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/dashboard-officer');
            }
        },
        templateUrl: '/dashboard-officer',
        controller: 'officerController',
        controllerAs: 'officer'
    })
    .when('/overall-report', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/overall-report');
            }
        },
        templateUrl: '/overall-report',
        controller: 'overallReportController',
        controllerAs: 'overallReport'
    })
    .when('/account-management', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/account-management');
            }
        },
        templateUrl: '/account-management',
        controller: 'accountController',
        controllerAs: 'account'
    })
    .when('/wbd-history/:serialNo', { 
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/wbd-history/', $route.current.params.serialNo);
            }
        },
        templateUrl: function(params) {
            return '/wbd-history/' + params.serialNo;
        },
        controller: 'binHistoryController'
    })
    .when('/bin-stock', { 
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/bin-stock');
            }
        }, 
        templateUrl: '/bin-stock',
        controller: 'binStockController',
        controllerAs: 'binStock'
    })
    .when('/new-business', { 
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/new-business');
            }
        },
        templateUrl: '/new-business',
        controller: 'newBusinessController',
        controllerAs: 'newBusiness'
    })
    .when('/account/:userID', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/account/' + $route.current.params.userID);
            }
        },
        templateUrl: function(params) {
            return '/account/' + params.userID;
        },
        controller: 'specificAccController',
        controllerAs: 'specificAcc'
    })
    .when('/role-management', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/role-management');
            }
        },
        templateUrl: '/role-management',
        controller: 'roleController',
        controllerAs: 'role'
    })
    .when('/auth/:auth', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/auth/' + $route.current.params.auth);
            }
        },
        templateUrl: function(params) {
            return '/auth/' + params.auth;
        },
        controller: 'specificAuthController',
        controllerAs: 'specificAuth'
    })
//    .when('/driver-management', {
//        templateUrl: '/driver-management',
//        controller: 'driverController',
//        controllerAs: 'driver'
//    })
    .when('/truck-management', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/truck-management');
            }
        },
        templateUrl: '/truck-management',
        controller: 'truckController',
        controllerAs: 'truck'
    })
//    .when('/truck/:truckID', {
//        templateUrl: function(params) {
//            return '/truck/' + params.truckID;
//        }
//    })
    .when('/zone-management', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/zone-management');
            }
        },
        templateUrl: '/zone-management',
        controller: 'zoneController',
        controllerAs: 'zone'
    })
    .when('/area-management', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/area-management');
            }
        },
        templateUrl: '/area-management',
        controller: 'areaController',
        controllerAs: 'area'
    })
    .when('/area/:areaID', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/area/' + $route.current.params.areaID);
            }
        },
        templateUrl: function (params) {
            return '/area/' + params.areaID
        },
        controller: 'thisAreaController',
        controllerAs: 'thisArea'
    })
    .when('/reporting', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/reporting');
            }
        },
        templateUrl: '/reporting',
        controller: 'reportingController',
        controllerAs: 'reporting'
    })
    .when('/data-visualization', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/data-visualization');
            }
        },
        templateUrl: '/data-visualization',
        controller: 'visualizationController',
        controllerAs: 'visualization'
    })
    .when('/acr-management', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/acr-management');
            }
        },
        templateUrl: '/acr-management',
        controller: 'acrController',
        controllerAs:'acr'
    })
    .when('/notification', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/notification');
            }
        },
        templateUrl: '/notification',
        controller: 'transactionLogController',
        controllerAs: 'transactionLog'
    })
    .when('/daily-report/:areaCode/:areaName', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/daily-report/' + $route.current.params.areaCode + '/' +$route.current.params.areaName);
            }
        },
        templateUrl: '/daily-report',
        controller: 'dailyController',
        controllerAs: 'daily'
    })
    .when('/bin-management',{
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/bin-management');
            }
        },
        templateUrl: '/bin-management',
        controller: 'binController',
        controllerAs: 'bin'
    })
    .when('/view-report/:reportCode', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/view-report/' + $route.current.params.reportCode);
            }
        },
        templateUrl: function (params) {
            return '/view-report/' + params.reportCode;
        },
        controller:'viewReportController',
        controllerAs:'report'
    })
    .when('/edit-report/:reportCode',{
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/edit-report/' + $route.current.params.reportCode);
            }
        },
        templateUrl: function (params) {
            return '/edit-report/' + params.reportCode;
        },
        controller:'editReportController',
        controllerAs:'editReport'
    })
    .when('/export-report-list',{
        resolve:{
            "check": function(routingService, $window, $location){
                 return routingService.auth($window, $location, '/export-report-list');
            }
        },
        templateUrl: '/export-report-list',
        controller: 'exportReportListController',
        controllerAs: 'exportReportList'
    })
    .when('/dcs-details/:dcsID', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/dcs-details/' + $route.current.params.dcsID);
            }
        },
        templateUrl: function (params) {
            return '/dcs-details/' + params.dcsID;
        },
        controller:'dcsDetailsController',
        controllerAs:'dcs'
    })
    .when('/bdaf-details/:bdafID', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/bdaf-details/' + $route.current.params.bdafID);
            }
        },
        templateUrl: function (params) {
            return '/bdaf-details/' + params.bdafID;
        },
        controller:'bdafDetailsController',
        controllerAs:'bdaf'
    })
    .when('/dbd-details/:dbdID', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/dbd-details/' + $route.current.params.dbdID);
            }
        },
        templateUrl: function (params) {
            return '/dbd-details/' + params.dbdID;
        },
        controller:'dbdDetailsController',
        controllerAs:'dbd'
    })
    .when('/dbr-details/:dbrID', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/dbr-details/' + $route.current.params.dbrID);
            }
        },
        templateUrl: function (params) {
            return '/dbr-details/' + params.dbrID;
        },
        controller:'dbrDetailsController',
        controllerAs:'dbr'
    })
    .when('/blost-details/:blostID', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/blost-details/' + $route.current.params.blostID);
            }
        },
        templateUrl: function (params) {
            return '/blost-details/' + params.blostID;
        },
        controller:'blostDetailsController',
        controllerAs:'blost'
    })
    .when('/bin-database', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/bin-database');
            }
        },
        templateUrl: '/bin-database',
        controller: 'databaseBinController',
        controllerAs:'databaseBin'
    })
    .when('/bin-inventory', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/bin-inventory');
            }
        },
        templateUrl: '/bin-inventory', 
        controller: 'inventoryBinController',
        controllerAs:'inventoryBin'
    })
    .when('/authorization', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/authorization');
            }
        },
        templateUrl: '/authorization',
        controller: 'taskAuthorizationController',
        controllerAs:'taskAuthorization'
    })
    .when('/form-authorization', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/form-authorization');
            }
        },
        templateUrl: '/form-authorization',
        controller: 'formAuthorizationController',
        controllerAs:'formAuthorization'
    })
    .when('/complaint-module', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/complaint-module');
            }
        },
        templateUrl: '/complaint-module',
        controller: 'complaintController',
        controllerAs:'complaint'
    })
    .when('/complaint-export',{
        resolve: {
            "check": function (routingService, $window, $location){
                return routingService.auth($window, $location, '/complaint-export');
            }
        },
        templateUrl: '/complaint-export',
        controller: 'complaintExportController',
        controllerAs: 'complaintexport'
    })
    .when('/complaint-officer', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/complaint-officer');
            }
        },
        templateUrl: '/complaint-officer',
        controller: 'complaintOfficerController',
        controllerAs:'complaintOfficer'
    })
    .when('/complaint-officer-create', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/complaint-officer-create');
            }
        },
        templateUrl: '/complaint-officer-create',
        controller: 'complaintOfficercreateController',
        controllerAs:'complaintOfficercreate'
    })
    .when('/complaint-officer-detail/:coID', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/complaint-officer-detail/' + $route.current.params.coID);
            }
        },
        templateUrl: function(params){
            return '/complaint-officer-detail/' + params.coID;
        },
        controller: 'complaintOfficerdetailController',
        controllerAs:'complaintOfficerdetail'
    })
    .when('/complaint-officer-edit/:coID', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/complaint-officer-edit/' + $route.current.params.coID);
            }
        },
        templateUrl: function(params){
            return '/complaint-officer-edit/' + params.coID;
        },
        controller: 'complaintOfficereditController',
        controllerAs:'complaintOfficeredits'
    })      
    .when('/complaint-detail/:complaintCode', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/complaint-detail/' + $route.current.params.complaintCode);
            }
        },
        templateUrl: function (params) {
            return '/complaint-detail/' + params.complaintCode;
        },
        controller: 'complaintDetailController',
        controllerAs: 'complaintDetail'
    })
    .when('/complaint-logistics-detail/:complaintCode', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/complaint-logistics-detail/' + $route.current.params.complaintCode);
            }
        },
        templateUrl: function (params) {
            return '/complaint-logistics-detail/' + params.complaintCode;
        },
        controller: 'complaintLogisticsDetailController',
        controllerAs: 'complaintLogisticsDetail'
    })
    .when('/delivery-management', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/delivery-management');
            }
        },
        templateUrl: '/delivery-management',
        controller: 'deliveryController',
        controllerAs:'delivery'
    })
    .when('/damaged-bin', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/damaged-bin');
            }
        },
        templateUrl: '/damaged-bin',
        controller: 'damagedBinController',
        controllerAs:'damagedBin'
    })
    .when('/lost-bin', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/lost-bin');
            }
        },
        templateUrl: '/lost-bin',
        controller: 'lostBinController',
        controllerAs:'lostBin'
    })
    .when('/post-announcement', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/post-announcement');
            }
        },
        templateUrl: '/post-announcement',
        controller: 'custServiceCtrl',
        controllerAs:'custService'
    })
    .when('/upload-image-carousel', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/upload-image-carousel');
            }
        },
        templateUrl: '/upload-image-carousel',
        controller: 'custServiceCtrl',
        controllerAs:'custService'
    })
    .when('/bin-collection-schedule', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/bin-collection-schedule');
            }
        },
        templateUrl: '/bin-collection-schedule',
        controller: 'custServiceCtrl',
        controllerAs:'custService'
    })
    .when('/manage-bin-request', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/manage-bin-request');
            }
        },
        templateUrl: '/manage-bin-request',
        controller: 'custServiceCtrl',
        controllerAs:'custService'
    })
    .when('/bin-request-detail/:reqID', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/bin-request-detail/' + $route.current.params.reqID);
            }
        },
        templateUrl: function (params) {
            return '/bin-request-detail/' + params.reqID;
        },
        controller: 'binReqDetailCtrl',
        controllerAs: 'binReqDetail'
    })
    .when('/customer-feedback', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/customer-feedback');
            }
        },
        templateUrl: '/customer-feedback',
        controller: 'custServiceCtrl',
        controllerAs:'custService'
    })
    .when('/boundary/:areaID', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/boundary/' + $route.current.params.areaID);
            }
        },
        templateUrl: function(params){
            return '/boundary/' + params.areaID;
        },
        controller: 'boundaryController',
        controllerAs: 'boundary'
    })
    .when('/history', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/history');
            }
        },
        templateUrl: function () {
            return '/history'
        },
        controller : 'historyController'
    })
    .when('/history/:historyID', {
        resolve: {
            "check": function (routingService, $window, $location, $route) {
                return routingService.auth($window, $location, '/history/' + $route.current.params.historyID);
            }
        },
        templateUrl: function (params) {
            return '/history/' + params.historyID;
        },
        controller: 'historyDetailController'
    })
    .when('/customer-enquiry', {
        resolve: {
            "check": function (routingService, $window, $location) {
                return routingService.auth($window, $location, '/customer-enquiry');
            }
        },
        templateUrl: '/customer-enquiry',
        controller: 'custServiceCtrl',
        controllerAs:'custService'
    })
    .when('/logout', {
        resolve: {
            "clear": function (routingService, $window, $location) {
                return routingService.clear($window, $location, '/');
            }
        }
    })
    .otherwise({
        templateUrl: '/error',
        controller: 'errorController',
        controllerAs: 'error'
    });
});