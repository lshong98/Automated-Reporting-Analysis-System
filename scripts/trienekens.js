/*
jshint: white
global angular, document, google, Highcharts
*/
var app = angular.module('trienekens', ['ngRoute', 'ui.bootstrap', 'ngSanitize', 'ngCsv', 'easypiechart']);

var socket = io.connect();
var flag = false;
//var socket = io.connect('ws://trienekens-deploy.appspot.com:3000', {transports: ['websocket']});
socket.on('connect', function() {
    if (flag === true) {
        angular.element('body').overhang({
            type: 'success',
            message: 'Network Connected.'
        });
        flag = false;
    }
    
    var sessionID = socket.io.engine.id;
    socket.emit('socketID', {
        "socketID": sessionID,
        "user": window.sessionStorage.getItem('owner'),
        "position": window.sessionStorage.getItem('position')
    });

    if (window.sessionStorage.getItem('position') == "Manager" || window.sessionStorage.getItem('position') == "Administrator") {
        socket.emit('room', "manager");
    }

    socket.on('receive authorize action', function(data) {
        $('.authorization').addClass("badge badge-danger").html(data.num);
    });

    socket.on('receive authorize action', function(data) {
        if(data.unread != 0){
            $('.satisfaction').addClass("badge badge-danger").html(data.unread);
        }
    });

    socket.on('receive report notification', function(data) {
        Lobibox.notify('info', {
            pauseDelayOnHover: true,
            continueDelayOnInactiveTab: false,
            title: 'Daily Report',
            msg: data.name + ' have submitted a new report ' + data.id,
            img: data.avatar
        });
    });
});

socket.on('disconnect', function() {
    angular.element('body').overhang({
        type: 'error',
        message: 'Network Disconnected.',
        closeConfirm: true
    });
    flag = true;
});

/*
    -Pagination
*/
app.filter('offset', function() {
    'use strict';
    return function(input, start) {
        if (!input || !input.length) {
            return;
        }
        start = +start; //parse to int
        return input.slice(start);
    };
});

/*
    -Upload Image
*/
app.directive('appFilereader', function($q) {
    'use strict';
    var slice = Array.prototype.slice;

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
                if (!ngModel) { return; }

                ngModel.$render = function() {};

                element.bind('change', function(e) {
                    var element;
                    element = e.target;

                    function readFile(file) {
                        var deferred = $q.defer(),
                            reader = new FileReader();

                        reader.onload = function(e) {
                            deferred.resolve(e.target.result);
                        };
                        reader.onerror = function(e) {
                            deferred.reject(e);
                        };
                        reader.readAsDataURL(file);

                        return deferred.promise;
                    }

                    $q.all(slice.call(element.files, 0).map(readFile))
                        .then(function(values) {
                            if (element.multiple) { ngModel.$setViewValue(values); } else { ngModel.$setViewValue(values.length ? values[0] : null); }
                        });

                }); //change

            } //link
    }; //return
});

/*
    -Sharing Data
*/
app.service('storeDataService', function() {
    'use strict';
    var globalList;

    globalList = {
        "login": {
            "username": '',
            "password": '',
            "rememberMe": '',
            "role": ''
        },
        "truck": {
            "id": '',
            "no": '',
            "transporter": '',
            "ton": '',
            "roadtax": '',
            "status": ''
        },
        "zone": {
            "id": '',
            "name": '',
            "status": ''
        },
        "bin": {
            "id": '',
            "name": '',
            "location": '',
            "area": ''
        },
        "collection": {
            "id": '',
            "address": ''
        },
        "collectionSchedule": {
            "id": '',
            "mon": '',
            "tue": '',
            "wed": '',
            "thur": '',
            "fri": '',
            "sat": ''
        },
        "binRequest": {
            "id": '',
            "status": ''
        },
        "databaseBin": {
            "date": '',
            "name": '',
            "icNo": '',
            "serialNo": '',
            "rcDwell": '',
            "houseNo": '',
            "tmnKpg": '',
            "areaCode": '',
            "status": '',
            "comment": '',
            "binSize": '',
            "address": '',
            "companyName": '',
            "acrfSerialNo": '',
            "itemType": '',
            "path": ''
        },
        "task": {
            "taskId": '',
            "date": '',
            "staff": '',
            "action": '',
            "page": '',
            "rowId": '',
            "query": '',
            "authorize": ''
        },
        "positionID": {
            "driverPosition": 'DRV',
            "generalWorkerPosition": 'GWK'
        },
        "show": {
            "account": {
                "create": 'I',
                "edit": 'I',
                "view": 'I'
            },
            "driver": {
                "create": 'I',
                "edit": 'I',
                "view": 'I'
            },
            "truck": {
                "create": 'I',
                "edit": 'I',
                "view": 'I'
            },
            "zone": {
                "create": 'I',
                "edit": 'I',
                "view": 'I'
            },
            "area": {
                "create": 'I',
                "edit": 'I',
                "view": 'I',
                "collection": {
                    "add": 'I',
                    "edit": 'I'
                }
            },
            "bin": {
                "create": 'I',
                "edit": 'I',
                "view": 'I'
            },
            "acr": {
                "create": 'I',
                "edit": 'I',
                "view": 'I',
                "lgview": 'I',
                "bdview": 'I'
            },
            "database": {
                "create": 'I',
                "edit": 'I',
                "view": 'I'
            },
            "inventory": {
                "edit": 'I',
                "view": 'I'
            },
            "authorization": {
                "view": 'I'
            },
            "formAuthorization": {
                "view": 'I'
            },
            "complaintlist": {
                "view": 'I'
            },
            "transactionLog": {
                "view": 'I'
            },
            "dcsDetails": {
                "view": 'I',
                "edit": 'I',
                "create": 'I'
            },
            "bdafDetails": {
                "view": 'I',
                "edit": 'I',
                "create": 'I'
            },
            "dbdDetails": {
                "view": 'I',
                "edit": 'I',
                "create": 'I'
            },
            "blostDetails": {
                "view": 'I',
                "edit": 'I',
                "create": 'I'
            },
            "reporting": {
                "view": 'I',
                "edit": 'I',
                "create": 'I',
                "export": 'I'
            },
            "delivery": {
                "create": 'I',
                "edit": 'I',
                "view": 'I'
            },
            "damagedlost": {
                "create": 'I',
                "edit": 'I',
                "view": 'I'
            },
            "banner": {
                "upload": 'I'
            }
        },
        "pagination": {
            "currentPage": 1, //Initial current page to 1
            "itemsPerPage": 8, //Record number each page
            "maxSize": 10 //Show the number in page
        }
    };

    return globalList;
});

/*
    -Table Row Editable
*/
app.directive('editable', function($compile, $http, $filter, storeDataService) {
    'use strict';
    return function(scope) {
        scope.showTruck = true;
        scope.showZone = true;
        scope.showProfile = true;
        scope.showBin = true;
        scope.showCollection = true;
        scope.showBinRequest = true;
        scope.deleteCollection = true;
        scope.showDatabaseBin = true;
        scope.showNewMgb = true;
        scope.showReusableMgb = true;
        scope.showDcsDetails = true;
        scope.showDelivery = true;
        scope.showBdafDetails = true;
        scope.showDbdDetails = true;
        scope.showBlostDetails = true;
        scope.showCollectionSchedule = true;
        scope.thisTruck = {
            "id": '',
            "no": '',
            "transport": '',
            "ton": '',
            "roadtax": '',
            "status": ''
        };
        scope.thisZone = {
            "id": '',
            "name": '',
            "status": ''
        };
        scope.thisBin = {
            "id": '',
            "name": '',
            "location": '',
            "area": '',
            "areaCode": '',
            "status": ''
        };
        scope.thisCollection = {
            "id": '',
            "address": ''
        };
        scope.collection = {
            "id": ''
        };

        scope.thisCollectionSchedule = {
            "id": '',
            "mon": '',
            "tue": '',
            "wed": '',
            "thur": '',
            "fri": '',
            "sat": ''
        };

        scope.thisBinRequest = {
            "id": '',
            "status": ''
        };

        scope.thisDatabaseBin = {
            "date": '',
            "name": '',
            "icNo": '',
            "serialNo": '',
            "rcDwell": '',
            "houseNo": '',
            "tmnKpg": '',
            "areaCode": '',
            "status": '',
            "comment": '',
            "binSize": '',
            "address": '',
            "companyName": '',
            "acrfSerialNo": '',
            "itemType": '',
            "path": ''
        }
        scope.thisNewMgb = {
            "date": '',
            "doNo": '',

            "inNew120": 0,
            "inNew240": 0,
            "inNew660": 0,
            "inNew1000": 0,
            "outNew120": 0,
            "outNew240": 0,
            "outNew660": 0,
            "outNew1000": 0
        }
        scope.thisReusableMgb = {
            "date": '',

            "inReusable120": 0,
            "inReusable240": 0,
            "inReusable660": 0,
            "inReusable1000": 0,
            "outReusable120": 0,
            "outReusable240": 0,
            "outReusable660": 0,
            "outReusable1000": 0
        }



        scope.notify = function(stat, mes) {
            angular.element('body').overhang({
                type: stat,
                message: mes
            });
        };

        scope.editTruck = function(id, no, transporter, ton, tax, status) {
            scope.showTruck = !scope.showTruck;
            scope.thisTruck = { "id": id, "no": no, "transporter": transporter, "ton": ton, "roadtax": tax, "status": status };
        };
        scope.saveTruck = function() {
            scope.showTruck = !scope.showTruck;
            scope.t.iam = window.sessionStorage.getItem('owner');
            $http.post('/editTruck', scope.t).then(function(response) {
                scope.t = angular.copy(scope.thisTruck);
                var data = response.data;
                scope.notify(data.status, data.message);

//                $.each(storeDataService.truck, function(index, value) {
//                    if (storeDataService.truck[index].id == scope.thisTruck.id) {
//                        if (data.status == "success") {
//                            storeDataService.truck[index] = angular.copy(scope.t);
//                        } else {
//                            scope.t = angular.copy(storeDataService.truck[index]);
//                        }
//                    }
//                });
                var existActive = false,
                    existInactive = false;
                $.each(scope.truckListActive, function(index, value) {
                    if (scope.truckListActive[index].id == scope.thisTruck.id) {
                        existActive = true;
                    }
                });
                $.each(scope.truckListInactive, function(index, value) {
                    if (scope.truckListInactive[index].id == scope.thisTruck.id) {
                        existInactive = true;
                    }
                });
                $.each(scope.truckList, function(index, value) {
                    if (scope.thisTruck.id == value.id) {
                        if (scope.t.status == 'ACTIVE' && existInactive) {
                            scope.truckListActive.push(scope.t);
                            scope.truckListInactive.splice(index, 1);
                            scope.$parent.truckList = angular.copy(scope.truckListInactive);
                        } else if (scope.t.status == 'INACTIVE' && existActive) {
                            scope.truckListInactive.push(scope.t);
                            scope.truckListActive.splice(index, 1);
                            scope.$parent.truckList = angular.copy(scope.truckListActive);
                        }
                    }
                });
            });
        };
        scope.cancelTruck = function() {
            scope.showTruck = !scope.showTruck;

            $.each(storeDataService.truck, function(index, value) {
                if (storeDataService.truck[index].id == scope.thisTruck.id) {
                    scope.t = angular.copy(storeDataService.truck[index]);
                }
            });

        };

        scope.editZone = function(id, code, name, status) {
            scope.showZone = !scope.showZone;
            scope.thisZone = { "id": id, "code": code, "name": name, "status": status };
        };
        scope.saveZone = function() {
            scope.showZone = !scope.showZone;
            scope.z.iam = window.sessionStorage.getItem('owner');
            $http.post('/editZone', scope.z).then(function(response) {
                scope.z = angular.copy(scope.thisZone);
                var data = response.data;
                scope.notify(data.status, data.message);

//                $.each(storeDataService.zone, function(index, value) {
//                    if (storeDataService.zone[index].id == scope.thisZone.id) {
//                        if (data.status == "success") {
//                            storeDataService.zone[index] = angular.copy(scope.z);
//                        } else {
//                            scope.z = angular.copy(storeDataService.zone[index]);
//                        }
//                    }
//                });
//
//                var existActive = false,
//                    existInactive = false;
//                $.each(scope.zoneListActive, function(index, value) {
//                    if (scope.zoneListActive[index].id == scope.thisZone.id) {
//                        existActive = true;
//                    }
//                });
//                $.each(scope.zoneListInactive, function(index, value) {
//                    if (scope.zoneListInactive[index].id == scope.thisZone.id) {
//                        existInactive = true;
//                    }
//                });
//                $.each(scope.zoneList, function(index, value) {
//                    if (scope.thisZone.id == value.id) {
//                        if (scope.z.status == 'ACTIVE' && existInactive) {
//                            scope.zoneListActive.push(scope.z);
//                            scope.zoneListInactive.splice(index, 1);
//                            scope.$parent.zoneList = angular.copy(scope.zoneListInactive);
//                        } else if (scope.z.status == 'INACTIVE' && existActive) {
//                            scope.zoneListInactive.push(scope.z);
//                            scope.zoneListActive.splice(index, 1);
//                            scope.$parent.zoneList = angular.copy(scope.zoneListActive);
//                        }
//                    }
//                });
            });
        };
        scope.cancelZone = function() {
            scope.showZone = !scope.showZone;

            $.each(storeDataService.zone, function(index, value) {
                if (storeDataService.zone[index].id == scope.thisZone.id) {
                    scope.z = angular.copy(storeDataService.zone[index]);
                }
            });
        };

        scope.editProfile = function() {
            scope.showProfile = !scope.showProfile;
            scope.originalData = angular.copy(scope.thisAccount);
        };
        scope.saveProfile = function() {
            scope.showProfile = !scope.showProfile;
            scope.thisAccount.dob = $filter('date')(scope.thisAccount.dob, 'dd MMM yyyy');
            scope.thisAccount.bindDob = $filter('date')(scope.thisAccount.dob, 'dd MMM yyyy');
            $http.post('/updateProfile', scope.thisAccount).then(function(response) {
                var data = response.data;
                scope.notify(data.status, data.message);
            });
        };
        scope.cancelProfile = function() {
            scope.showProfile = !scope.showProfile;
            scope.thisAccount = angular.copy(scope.originalData);
        };

        scope.editBin = function(id, name, location, area, areaCode, status) {
            scope.showBin = !scope.showBin;
            scope.b.area = area;
            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');
            scope.thisBin = { "id": id, "name": name, "location": location, "area": area, "areaCode": areaCode, "status": status };
        };
        scope.saveBin = function() {
            scope.showBin = !scope.showBin;
            var areaFullString = (scope.b.areacode).split(',');
            scope.b.area = areaFullString[0];
            scope.b.areaCode = areaFullString[1];
            scope.b.iam = window.sessionStorage.getItem('owner');
            $http.post('/editBinCenter', scope.b).then(function(response) {
                var data = response.data;

                scope.notify(data.status, data.message);
                scope.thisBin.areaCode = (scope.thisBin.areaCode).split(',')[1];
                scope.b = angular.copy(scope.thisBin);

//                $.each(storeDataService.bin, function(index, value) {
//                    if (storeDataService.bin[index].id == scope.thisBin.id) {
//                        if (data.status == "success") {
//                            storeDataService.bin[index] = angular.copy(scope.b);
//                        } else {
//                            scope.z = angular.copy(storeDataService.bin[index]);
//                        }
//                        return false;
//                    }
//                });

                // ----------------------------------------------------------------------------------------------------
                //                var existActive = false, existInactive = false;
                //                $.each(scope.binListActive, function(index, value){
                //                   if(scope.binListActive[index].id == scope.thisBin.id) {
                //                       existActive = true;
                //                   }
                //                });
                //                $.each(scope.binListInactive, function(index, value){
                //                   if(scope.binListInactive[index].id == scope.thisBin.id) {
                //                       existInactive = true;
                //                   }
                //                });
                // ----------------------------------------------------------------------------------------------------
//                $.each(scope.binList, function(index, value) {
//                    if (scope.thisBin.id == value.id) {
//                        if (scope.b.status == 'ACTIVE') {
//                            if (scope.$parent.statusList !== true) {
//                                scope.binListActive.push(scope.b);
//                                scope.binListInactive.splice(index, 1);
//                                scope.$parent.binList = angular.copy(scope.binListInactive);
//                            }
//                        } else {
//                            if (scope.$parent.statusList !== false) {
//                                scope.binListInactive.push(scope.b);
//                                scope.binListActive.splice(index, 1);
//                                scope.$parent.binList = angular.copy(scope.binListActive);
//                            }
//                        }
//                    }
//                    return false;
//                });
            });
        };
        scope.cancelBin = function() {
            scope.showBin = !scope.showBin;

            $.each(storeDataService.bin, function(index, value) {
                if (storeDataService.bin[index].id == scope.thisBin.id) {
                    scope.b = angular.copy(storeDataService.bin[index]);
                    return false;
                }
            });

        };

        scope.editCollection = function(id, address) {
            scope.showCollection = !scope.showCollection;
            scope.thisCollection = { "id": id, "address": address };
        };
        scope.saveCollection = function() {
            scope.showCollection = !scope.showCollection;
            scope.c.iam = window.sessionStorage.getItem('owner');
            $http.post('/updateCollection', scope.c).then(function(response) {
                var data = response.data;

                scope.notify(data.status, data.message);
                if (data.status == "success") {
                    scope.c = angular.copy(scope.thisCollection);
//                    $.each(storeDataService.collection, function(index, value) {
//                        if (storeDataService.collection[index].id = scope.thisCollection.id) {
//                            storeDataService.collection[index] = angular.copy(scope.c);
//                            return false;
//                        }
//                    });
                } else {
                    scope.c = angular.copy(storeDataService.collection[index]);
                }
            });
        };
        scope.cancelCollection = function() {
            scope.showCollection = !scope.showCollection;
            $.each(storeDataService.collection, function(index, value) {
                if (storeDataService.collection[index].id == scope.thisCollection.id) {
                    scope.c = angular.copy(storeDataService.collection[index]);
                    return false;
                }
            });
        };
        scope.deleteCollection = function(id) {
            scope.collection.id = id;
            scope.collection.iam = window.sessionStorage.getItem('owner');
            $http.post('/deleteCollection', scope.collection).then(function(response) {
                var data = response.data;
                scope.notify(data.status, data.message);
                if (data.status == "success") {
//                    $.each(storeDataService.collection, function(index, value) {
//                        if (storeDataService.collection[index].id == scope.collection.id) {
//                            scope.deleteCollection = !scope.deleteCollection;
//                            storeDataService.collection.splice(index, 1);
//                            return false;
//                        }
//                    });
                }
            });
        };

        scope.editCollectionSchedule = function() {
            scope.showCollectionSchedule = !scope.showCollectionSchedule;

            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');
        };

        scope.saveCollectionSchedule = function(id, mon, tue, wed, thur, fri, sat) {
            scope.showCollectionSchedule = !scope.showCollectionSchedule;

            scope.thisCollectionSchedule = { "id": id, "mon": mon, "tue": tue, "wed": wed, "thur": thur, "fri": fri, "sat": sat };

            $http.post('/editCollectionSchedule', scope.thisCollectionSchedule).then(function(response) {
                var data = response.data;
                console.log(data);
            }, function(error) {
                console.log(error);
            });
        };

        scope.cancelCollectionSchedule = function() {
            scope.showCollectionSchedule = !scope.showCollectionSchedule;

            $.each(storeDataService.collectionSchedule, function(index, value) {
                if (storeDataService.collectionSchedule[index].id == scope.thisCollectionSchedule.id) {
                    scope.x = angular.copy(storeDataService.collectionSchedule[index]);
                }
            });
        };

        scope.editBinRequestStatus = function() {
            scope.showBinRequest = !scope.showBinRequest;

            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');
        };

        scope.saveBinRequestStatus = function(status, id) {
            scope.showBinRequest = !scope.showBinRequest;

            scope.thisBinRequest = { "status":status, "id":id };

            $http.post('/updateBinRequest', scope.thisBinRequest).then(function(response) {
                var data = response.data;
                console.log(data);
            }, function(error) {
                console.log(error);
            });
        };

        scope.cancelBinRequestStatus = function() {
            scope.showBinRequest = !scope.showBinRequest;

            $.each(storeDataService.binRequest, function(index, value) {
                if (storeDataService.binRequest[index].id == scope.thisBinRequest.id) {
                    scope.x = angular.copy(storeDataService.binRequest[index]);
                }
            });
        };

        //BIN INVENTORY MODULE EDITABLE TABLES
        scope.editDatabaseBin = function() {
            scope.showDatabaseBin = !scope.showDatabaseBin;
            //scope.b.area = area;


            console.log("hello from editDatabaseBin");
            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');

        };
        scope.saveDatabaseBin = function(id, date, customerID, areaCode, serialNo, acrfSerialNo, status, rcDwell, comment, itemType, path) {
            scope.showDatabaseBin = !scope.showDatabaseBin;

            scope.thisDatabaseBin = { "idNo": id, "date": date, "customerID": customerID, "areaCode": areaCode, "serialNo": serialNo, "acrID": acrfSerialNo, "activeStatus": status, "rcDwell": rcDwell, "comment": comment, "itemType": itemType, "path": path };
            console.log("The databasebin thing: ");
            console.log(scope.thisDatabaseBin);

            $http.put('/editDatabaseBin', scope.thisDatabaseBin).then(function(response) {
                var data = response.data;

                scope.notify(data.status, data.message);

                $.each(storeDataService.databaseBin, function(index, value) {
                    // if (storeDataService.databaseBin[index].serialNo == scope.thisDatabaseBin.serialNo) {
                    //     if (data.status == "success") {
                    //         storeDataService.bin[index] = angular.copy(scope.b);
                    //     } else {
                    //         scope.z = angular.copy(storeDataService.bin[index]);
                    //     }
                    //     return false;
                    // }
                });
            });
        };
        scope.cancelDatabaseBin = function() {
            scope.showDatabaseBin = !scope.showDatabaseBin;

            $.each(storeDataService.bin, function(index, value) {
                if (storeDataService.databaseBin[index].id == scope.thisDatabaseBin.id) {
                    scope.b = angular.copy(storeDataService.databaseBin[index]);
                    return false;
                }
            });

        };
        scope.deleteDatabaseBin = function() {
            $http.post('/deleteDatabaseBin', scope.b).then(function(response) {
                var data = response.data;

                scope.notify(data.status, data.message);

            });
        };
        scope.editNewMgb = function() {
            scope.showNewMgb = !scope.showNewMgb;

            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');
        };
        scope.saveNewMgb = function(date, doNo, inNew120, inNew240, inNew660, inNew1000, outNew120, outNew240, outNew660, outNew1000) {
            scope.showNewMgb = !scope.showNewMgb;
            scope.calculateBalance(scope.nb.date);

            scope.thisNewMgb = { "date": date, "doNo": doNo, "inNew120": inNew120, "inNew240": inNew240, "inNew660": inNew660, "inNew1000": inNew1000, "outNew120": outNew120, "outNew240": outNew240, "outNew660": outNew660, "outNew1000": outNew1000 };

            $http.post('/editNewMgbStock', scope.thisNewMgb).then(function(response) {
                var data = response.data;

                scope.notify(data.status, data.message);

                $.each(storeDataService.databaseBin, function(index, value) {
                    // if (storeDataService.databaseBin[index].serialNo == scope.thisDatabaseBin.serialNo) {
                    //     if (data.status == "success") {
                    //         storeDataService.bin[index] = angular.copy(scope.b);
                    //     } else {
                    //         scope.z = angular.copy(storeDataService.bin[index]);
                    //     }
                    //     return false;
                    // }
                });
            });
        };
        scope.cancelNewMgb = function() {
            scope.showNewMgb = !scope.showNewMgb;

            $.each(storeDataService.bin, function(index, value) {
                if (storeDataService.databaseBin[index].id == scope.thisDatabaseBin.id) {
                    scope.b = angular.copy(storeDataService.databaseBin[index]);
                    return false;
                }
            });

        };
        scope.editReusableMgb = function() {
            scope.showReusableMgb = !scope.showReusableMgb;

            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');
        };
        scope.saveReusableMgb = function(date, inReusable120, inReusable240, inReusable660, inReusable1000, outReusable120, outReusable240, outReusable660, outReusable1000) {
            scope.showReusableMgb = !scope.showReusableMgb;
            scope.calculateBalance(scope.rb.date);

            scope.thisReusableMgb = { "date": date, "inReusable120": inReusable120, "inReusable240": inReusable240, "inReusable660": inReusable660, "inReusable1000": inReusable1000, "outReusable120": outReusable120, "outReusable240": outReusable240, "outReusable660": outReusable660, "outReusable1000": outReusable1000 };



            $http.post('/editReusableMgbStock', scope.thisReusableMgb).then(function(response) {
                var data = response.data;

                scope.notify(data.status, data.message);

                $.each(storeDataService.databaseBin, function(index, value) {
                    // if (storeDataService.databaseBin[index].serialNo == scope.thisDatabaseBin.serialNo) {
                    //     if (data.status == "success") {
                    //         storeDataService.bin[index] = angular.copy(scope.b);
                    //     } else {
                    //         scope.z = angular.copy(storeDataService.bin[index]);
                    //     }
                    //     return false;
                    // }
                });
            });
        };
        scope.cancelReusableMgb = function() {
            scope.showReusableMgb = !scope.showReusableMgb;

            $.each(storeDataService.bin, function(index, value) {
                if (storeDataService.databaseBin[index].id == scope.thisDatabaseBin.id) {
                    scope.b = angular.copy(storeDataService.databaseBin[index]);
                    return false;
                }
            });

        };
        //DCS DETAILS
        scope.editDcsDetails = function(id, name, location, area, status) {
            scope.showDcsDetails = !scope.showDcsDetails;


            scope.thisBin = { "id": id, "name": name, "location": location, "area": area, "status": status };
            console.log("EDIT DCS DETAILS");
        };

        scope.saveDcsDetails = function() {
            scope.showDcsDetails = !scope.showDcsDetails;

            $http.post('/editDcsDetails', scope.b).then(function(response) {
                var data = response.data;

                scope.notify(data.status, data.message);

                $.each(storeDataService.bin, function(index, value) {
                    if (storeDataService.bin[index].id == scope.thisBin.id) {
                        if (data.status == "success") {
                            storeDataService.bin[index] = angular.copy(scope.b);
                        } else {
                            scope.z = angular.copy(storeDataService.bin[index]);
                        }
                        return false;
                    }
                });
            });
        };
        scope.cancelDcsDetails = function() {
            scope.showDcsDetails = !scope.showDcsDetails;

            $.each(storeDataService.bin, function(index, value) {
                if (storeDataService.bin[index].id == scope.thisBin.id) {
                    scope.b = angular.copy(storeDataService.bin[index]);
                    return false;
                }
            });

        };

    };
});

app.directive('dateNow', ['$filter', function($filter) {
    'use strict';
    return {
        link: function($scope, $elem, $attrs) {
            $elem.text($filter('date')(new Date(), $attrs.dateNow));
        }
    };
}]);

app.directive("fileInput", function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attribute) {
            element.bind("change", function() {
                scope.$apply(function() {
                    $parse(attribute.fileInput).assign(scope, element[0].files)
                });
            });
        }
    }
});

/*
    -Sharing Function
*/
app.run(function($rootScope) {
    $rootScope.notify = function(stat, mes) {
        angular.element('body').overhang({
            type: stat,
            message: mes
        });
    };
    $rootScope.loadDetails = function(key, value) {
        var to = "";
        switch (key) {
            case "account":
                to = '#/account/';
                break;
            case "area":
                to = '#/area/';
                break;
        }
        window.location.href = to + value;
    };
    $rootScope.geocodeLink = function(place) {
        var area = place.area.replace(" ", "+");
        var zone = place.zone.replace(" ", "+");
        var concat = area + '+' + zone;

        return "https://maps.googleapis.com/maps/api/geocode/json?address=" + concat + "&key=<APIKEY>";
    };
});

//Customer Service Pages Controller
app.controller('custServiceCtrl', function($scope, $rootScope, $location, $http, $window) {
    $scope.loggedUser = localStorage.getItem('user');
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 5; //Record number each page
    $scope.maxSize = 8; //Show the number in page

    $scope.sendNotifToDevice = function(){
        $scope.data = {
            'target' : $scope.notifTarget,
            'title' : $scope.notifTitle,
            'message' : $scope.notifMessage
        };

        $http.post('/sendNotifToDevice', $scope.data).then(function(response){
            console.log(response.data);
        }, function(error) {
            console.log(error);
        });

        $http.post('/insertAnnouncement', $scope.data).then(function(response){
            console.log(response.data);
        }, function(error){
            console.log(error);
        });
    };

    $scope.uploadImg = function() {
        var fd = new FormData();
        angular.forEach($scope.files, function(file) {
            fd.append('file[]', file);
        });

        // console.log(fd);
        // $http.post("upload.php", fd, {
        //     transformRequest: angular.identity,
        //     headers:{'Content-Type': undefined}
        // }).then(function(response){
        //     alert(response.data);
        //     $scope.displayImg();
        // }, function(error){
        //     console.log(error);
        // });
        console.log($scope.files);
        $http.post('/uploadCarouselImg').then(function(response) {
            console.log(response.data);
        }, function(error) {
            console.log(error);
        });
    };

    $scope.displayImg = function() {
        $http.get('/fetchCarouselImg').then(function(response) {
            console.log(response.data.output);
            $scope.imgs = response.data.output;
        }, function(error) {
            console.log(error);
        });
    };

    $scope.deleteImg = function(id, name) {
        $scope.delCarouselImg = { "id": id, "name": name };

        $http.post('/deleteCarouselImg', $scope.delCarouselImg).then(function(response) {
            alert(response.data);
            $scope.displayImg();
        }, function(error) {
            console.log(error);
        });
    };

    $scope.getSchedule = function() {
        $http.get('/getAllSchedule').then(function(response) {
            console.log(response.data);
            $scope.schedule = response.data;
        }, function(error) {
            console.log(error);
        });
    };

    $scope.getPendingUser = function() {
        $http.get('/getPendingUser').then(function(response) {
            console.log(response.data);
            $scope.pendingUsers = response.data;
        }, function(error) {
            console.log(error);
        });
    };

    // $scope.updatePendingUser = function(id, status){
    //     $http.put('updatePendingUser.php?id='+id+"&status="+status).then(function(response){
    //         alert(response.data);
    //         $scope.getPendingUser();
    //     }, function(error){
    //         console.log(error);
    //     });
    // };

    $scope.updatePendingUser = function(id, status, email, pass) {
        $scope.pUsers = { "pendingID": id, "status": status, "email":email, "pass":pass };

        $http.post('/updatePendingUser', $scope.pUsers).then(function(response) {
            alert(response.data);
            $scope.getPendingUser();
        }, function(error) {
            console.log(error);
        });
    };

    $scope.getPendingBinRequest = function() {
        $http.get('/getPendingBinRequest').then(function(response) {
            console.log(response.data);
            $scope.pendingBinRequests = response.data;
        }, function(error) {
            console.log(error);
        });
    };

    $scope.updateBinRequest = function(id, status) {
        $scope.pReqs = { "reqID": id, "status": status };

        $http.post('/updateBinRequest', $scope.pReqs).then(function(response) {
            alert(response.data);
            $scope.getPendingBinRequest();
        }, function(error) {
            console.log(error);
        });
    };

    $scope.getAreas = function(){
        $http.get('/getAreas').then(function(response){
            console.log(response.data);
            $scope.areaList = response.data;
        }, function(error){
            console.log(error);
        });
    };

    $scope.getCustFeedback = function(){
        $http.get('/customerFeedback').then(function(response){
            console.log(response.data);
            $scope.reviews = response.data;
            $scope.totalItems = response.data.length;
            $scope.collPrompt = (response.data.collPrompt/3)*100;
            $scope.compRate = (response.data.compRate/3)*100;
            $scope.teamEff = (response.data.teamEff/3)*100;
            $scope.binHand = (response.data.binHand/3)*100;
            $scope.spillCtrl = (response.data.spillCtrl/3)*100;
            $scope.qryResp = (response.data.qryResp/3)*100;

            $scope.options = {
                animate: {
                    duration: 0,
                    enabled: false
                },
                barColor:'#2C3E50',
                scaleColor:false,
                lineWidth:20,
                lineCap:'circle'
            };

            $http.get('/readSatisfaction').then(function(repsonse){
                console.log(response.data);
            }, function(err){
                console.log(err);
            });
        }, function(err){
            console.log(err);
        });
    };


});

app.controller('navigationController', function($scope, $http, $window, storeDataService) {
    'use strict';

    var position = $window.sessionStorage.getItem('position');

    $scope.navigation = {
        "name": position,
        "manager": false,
        "officer": false
    };

    $scope.show = angular.copy(storeDataService.show);

    if (position == "Manager" || position == "Administrator") {
        $scope.navigation["manager"] = true;
    } else if (position == "Reporting Officer") {
        $scope.navigation["officer"] = true;
    }

    $http.post('/getAllAuth', $scope.navigation).then(function(response) {
        $.each(response.data, function(index, value) {
            $.each($scope.show, function(bigKey, bigValue) {
                $.each(bigValue, function(smallKey, smallValue) {
                    if (smallKey == "collection") {
                        $.each(smallValue, function(xsmallKey, xsmallValue) {
                            $scope.show[bigKey][smallKey][xsmallKey] = value.status;
                        });
                    } else {
                        if (value.name.indexOf(smallKey) != -1) {
                            if (value.name.indexOf(bigKey) != -1) {
                                $scope.show[bigKey][smallKey] = value.status;
                            }
                        }
                    }
                });
            });
        });
        storeDataService.show = angular.copy($scope.show);
    });
    socket.emit('authorize request', { "action": "create user" });

    $http.post('/loadMenu', { "position": position }).then(function(response) {
        $('ul.menu__level').html(response.data.content);
    });
});

app.controller('managerController', function($scope, $http, $filter) {
    'use strict';

    $scope.markerList = [];

    //date configuration
    var currentDate = new Date();
    var startDate = new Date();
    startDate.setDate(currentDate.getDate() - 7);
    $scope.visualdate = {
        "dateStart": '',
        "dateEnd": '',
        "zoneID": ''
    }
    $scope.visualdate.dateStart = $filter('date')(startDate, 'yyyy-MM-dd');
    $scope.visualdate.dateEnd = $filter('date')(currentDate, 'yyyy-MM-dd');
    var stringToTime = function(string) {
            var strArray = string.split(":");
            var d = new Date();
            d.setHours(strArray[0], strArray[1], strArray[2]);

            return d;
        }
        //function to reshape data for fit into charts
    var getElementList = function(element, data) {
        var objReturn = [];
        var i, j;
        var exist;
        for (i = 0; i < data.length; i += 1) {
            if (element === "reportCollectionDate") {
                exist = false;
                var formattedDate = $filter('date')(data[i].reportCollectionDate, 'EEEE, MMM d');
                for (j = 0; j < objReturn.length; j += 1) {
                    if (objReturn[j] === formattedDate) {
                        exist = true;
                    }
                }
                if (!exist) {
                    objReturn.push(formattedDate);
                }
            } else if (element === "garbageAmount") {
                objReturn.push(parseInt(data[i].garbageAmount));
            } else if (element === "duration") {
                var duration = (data[i].operationTimeEnd - data[i].operationTimeStart) / 1000;
                objReturn.push(duration);
            } else if (element === "amountGarbageOnArea") {
                exist = false;
                for (j = 0; j < objReturn.length; j += 1) {
                    if (objReturn[j].name === data[i].areaName) {
                        objReturn[j].y += parseInt(data[i].garbageAmount);
                        exist = true;
                    }
                }
                if (!exist) {
                    objReturn.push({
                        "name": data[i].areaName,
                        "y": parseInt(data[i].garbageAmount)
                    });
                }
            } else if (element === "timeSeries") {
                var date = new Date(data[i].reportCollectionDate);
                exist = false;
                for (j = 0; j < objReturn.length; j += 1) {
                    if (objReturn[j][0] === date.getTime()) {
                        objReturn[j][1] += parseInt(data[i].garbageAmount);
                        exist = true;
                    }
                }
                if (!exist) {
                    objReturn.push([date.getTime(), parseInt(data[i].garbageAmount)]);
                }
            }
        }

        return objReturn;
    }
    var dateobj = new Date();
    var getday = dateobj.getDay();
    $scope.day = "";

    if (getday == 1) {
        $scope.day = "mon";
    } else if (getday == 2) {
        $scope.day = "tue";
    } else if (getday == 3) {
        $scope.day = "wed";
    } else if (getday == 4) {
        $scope.day = "thu";
    } else if (getday == 5) {
        $scope.day = "fri";
    } else if (getday == 6) {
        $scope.day = "sat";
    } else if (getday == 7) {
        $scope.day = "sun";
    }

    $http.post('/getTodayAreaCount', { "day": $scope.day }).then(function(response) {
        $scope.todayAreaCount = response.data[0].todayAreaCount;
    });
    $http.get('/getCount').then(function(response) {
        //console.log(response.data);
        var data = response.data;

        $scope.zoneCount = data.zone;
        $scope.areaCount = data.area;
        $scope.acrCount = data.acr;
        $scope.binCount = data.bin;
        $scope.truckCount = data.truck;
        $scope.userCount = data.staff - 1;
        $scope.complaintCount = data.complaint;
        $scope.reportCompleteCount = data.completeReport;
        $scope.reportIncompleteCount = data.incompleteReport;
        $scope.unsubmittedCount = $scope.todayAreaCount - $scope.reportCompleteCount + $scope.reportIncompleteCount;
    });

    $http.post('/getUnsubmitted', { "day": $scope.day }).then(function(response) {
        if (response.data.length > 0) {
            $scope.unsubmitted = response.data;
        } else {
            $scope.unsubmitted = [];
        }
    });
    $http.post('/getSubmitted', { "day": $scope.day }).then(function(response) {
        if (response.data.length > 0) {
            $scope.submitted = response.data;
        } else {
            $scope.submitted = [];
        }
    });

    $http.post('/getDataVisualization', $scope.visualdate).then(function(response) {
        console.log(response.data)
        if (response.data.length > 0) {
            $scope.visualObject = response.data;
        } else {
            $scope.visualObject = [];
        }
    });
    $http.post('/getDataVisualizationGroupByDate', $scope.visualdate).then(function(response) {
        console.log(response.data);
        if (response.data.length > 0) {
            $scope.reportListGroupByDate = response.data;

        } else {
            $scope.reportListGroupByDate = [];
        }
        displayChart();
    });
    var displayChart = function() {
        //chart-combine-durvol-day
        Highcharts.chart('chart-combine-durvol-day', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Comparison between Duration and Volume of Garbage Collection'
            },
            subtitle: {
                text: 'Trienekens'
            },
            xAxis: [{
                categories: getElementList("reportCollectionDate", $scope.reportListGroupByDate),
                crosshair: true
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}minutes',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: 'Duration',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }, { // Secondary yAxis
                title: {
                    text: 'Garbage Amount',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value} ton',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                opposite: true
            }],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 120,
                verticalAlign: 'top',
                y: 100,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || 'rgba(255,255,255,0.25)'
            },
            series: [{
                name: 'Garbage Amount',
                type: 'column',
                yAxis: 1,
                data: getElementList("garbageAmount", $scope.reportListGroupByDate),
                tooltip: {
                    valueSuffix: ' ton'
                }

            }, {
                name: 'Duration',
                type: 'spline',
                data: getElementList("duration", $scope.reportListGroupByDate),
                tooltip: {
                    valueSuffix: ' minutes'
                }
            }]
        });

        //chart-pie-volume-area
        Highcharts.chart('chart-pie-volume-area', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Garbage Amount based on Area'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                name: 'Percentage',
                colorByPoint: true,
                data: getElementList("amountGarbageOnArea", $scope.visualObject)
            }]
        });

        //chart-line-volume-day
        Highcharts.chart('chart-line-volume-day', {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Garbage Amount over time'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                    'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Garbage Amount'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'area',
                name: 'Garbage Amount',
                data: getElementList("timeSeries", $scope.visualObject)
            }]
        });
    }

    var $googleMap, visualizeMap, map;

    $googleMap = document.getElementById('googleMap');
    visualizeMap = {
        center: new google.maps.LatLng(1.5503052, 110.3394602),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false,
        disableDefaultUI: true,
        editable: false,
        zoom: 13
    };
    map = new google.maps.Map($googleMap, visualizeMap);

    //    $http.get('/getLngLat').then(function(response) {
    //        $scope.lnglatlist = response.data;
    //
    //        var rd = {
    //            url: '../styles/mapmarkers/rd.png'
    //        };
    //
    //        for (var i = 0; i < $scope.lnglatlist.length; i++) {
    //            var myLatLng = { lat: $scope.lnglatlist[i].latitude, lng: $scope.lnglatlist[i].longitude };
    //
    //            var marker = new google.maps.Marker({
    //                position: myLatLng,
    //                icon: rd
    //            });
    //            marker.setMap(map);
    //        }
    //    });
    //
    //    $http.get('/getCollectedLngLat').then(function(response) {
    //        $scope.collectedlnglatlist = response.data;
    //        console.log($scope.lnglatlist);
    //        var gd = {
    //            url: '../styles/mapmarkers/gd.png'
    //
    //        };
    //        for (var i = 0; i < $scope.collectedlnglatlist.length; i++) {
    //
    //            var myLatLng = { lat: $scope.collectedlnglatlist[i].latitude, lng: $scope.collectedlnglatlist[i].longitude };
    //
    //            var marker = new google.maps.Marker({
    //                position: myLatLng,
    //                icon: gd
    //            });
    //            marker.setMap(map);
    //        }
    //    });

    $http.get('/livemap').then(function(response) {
        var data = response.data,
            coordinate = { "lat": '', "lng": '' },
            dot = { "url": '' },
            marker;

        $.each(data, function(key, value) {
            coordinate.lat = value.latitude;
            coordinate.lng = value.longitude;
            dot.url = value.status === "NOT COLLECTED" ? '../styles/mapmarkers/rd.png' : '../styles/mapmarkers/gd.png';

            marker = new google.maps.Marker({
                id: value.serialNo,
                position: coordinate,
                icon: dot
            });
            marker.setMap(map);
            $scope.markerList.push(marker);
        });
    });

    socket.on('synchronize map', function(data) {
        $.each($scope.markerList, function(key, value) {
            if (value.id == data.serialNumber) {

                value.icon.url = "../styles/mapmarkers/shining.gif";

                var marker = new google.maps.Marker({
                    position: value.position,
                    icon: value.icon
                });
                marker.setMap(map);

                setTimeout(function() {
                    marker.setMap(null);

                    value.icon.url = "../styles/mapmarkers/gd.png";
                    marker = new google.maps.Marker({
                        position: value.position,
                        icon: value.icon
                    });
                    marker.setMap(map);
                }, 3000);
            }
        });
    });

    // Demo Insert Tag
    //    setTimeout(function () {
    //        $http.post('/insertTag', {"data": "example data"}).then(function (response) {
    //        });
    //    }, 10000);
});

app.controller('officerController', function($scope, $filter, $http, $window) {
    'use strict';

    $scope.areaList = [];
    $scope.passAreaList = [];
    $scope.reportingOfficerId = {
        "officerid": $window.sessionStorage.getItem('owner'),
        "day": $filter('date')(new Date(), 'EEE').toLowerCase()
    };
    
    var passdate1 = new Date();
    passdate1.setDate(passdate1.getDate() - 1);
    var passdate2 = new Date();
    passdate2.setDate(passdate2.getDate() - 2);
    
    $scope.getPassReport = {
        "officerid": $window.sessionStorage.getItem('owner'),
        "day1": $filter('date')(passdate1, 'EEE').toLowerCase(),
        "day2": $filter('date')(passdate2, 'EEE').toLowerCase(),
        "date2": $filter('date')(passdate2, 'yyyy-MM-dd').toLowerCase()
    }
    
    $http.post('/getReportingAreaList', $scope.reportingOfficerId).then(function(response) {
        $.each(response.data, function(index, value) {
            var areaID = value.id.split(",");
            var areaName = value.name.split(",");
            var areaCode = value.areaCode.split(",");
            var area = [];
            $.each(areaID, function(index, value) {
                area.push({
                    "id": areaID[index],
                    "name": areaName[index],
                    "code": areaCode[index]
                });
            });
            $scope.areaList.push({ "zone": { "id": value.zoneID, "name": value.zoneName }, "area": area });
        });
    });
    
    $http.post('/getPassReportingAreaList', $scope.getPassReport).then(function(response){
        $.each(response.data, function(index, value) {
            var passAreaID = value.id.split(",");
            var passAreaName = value.name.split(",");
            var passAreaCode = value.areaCode.split(",");
            var passArea = [];
            $.each(passAreaID, function(index, value) {
                passArea.push({
                    "id": passAreaID[index],
                    "name": passAreaName[index],
                    "code": passAreaCode[index]
                });
            });
            $scope.passAreaList.push({ "zone": { "id": value.zoneID, "name": value.zoneName }, "area": passArea });
        });
    });
    

    $scope.thisArea = function(areaID, areaName) {
        window.location.href = '#/daily-report/' + areaID + '/' + areaName;
    };
});

app.controller('areaController', function($scope, $http, $filter, storeDataService) {
    'use strict';
    $scope.showCreateBtn = true;
    var asc = true;
    $scope.newArea = {
        "areaCode": ''
    };

    $scope.area = {
        "zone": '',
        "staff": '',
        "iam": ''
    };
    
    $scope.pagination = angular.copy(storeDataService.pagination);
    $scope.show = angular.copy(storeDataService.show.area);

    $scope.statusList = true;
    $scope.updateStatusList = function() {
        if ($scope.statusList) {
            $scope.areaList = angular.copy($scope.areaListActive);
        } else {
            $scope.areaList = angular.copy($scope.areaListInactive);
        }
        $scope.totalItems = $scope.filterAreaList.length;
    }

    $http.get('/getAllArea').then(function(response) {
        $scope.searchAreaFilter = '';
        $scope.areaList = response.data;
        $scope.filterAreaList = [];

        $.each($scope.areaList, function(index, value) {
            value.code = value.zoneCode + value.code;
        });

        $scope.searchArea = function(area) {
            return (area.code + area.name + area.staffName + area.status).toUpperCase().indexOf($scope.searchAreaFilter.toUpperCase()) >= 0;
        }

        $scope.areaListActive = [];
        $scope.areaListInactive = [];
        for (var i = 0; i < $scope.areaList.length; i++) {
            if ($scope.areaList[i].status == 'ACTIVE') {
                $scope.areaListActive.push($scope.areaList[i]);
            } else {
                $scope.areaListInactive.push($scope.areaList[i]);
            }
        }
        $scope.areaList = angular.copy($scope.areaListActive);

        $scope.filterAreaList = angular.copy($scope.areaList);

        $scope.totalItems = $scope.filterAreaList.length;

        $scope.getData = function() {
            return $filter('filter')($scope.filterAreaList, $scope.searchAreaFilter);
        };

        $scope.$watch('searchAreaFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.pagination.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);
    });

    $http.get('/getZoneList').then(function(response) {
        $scope.zoneList = response.data;
        $scope.area.zone = $scope.zoneList[0];
        for (var i = 0; i < (response.data).length; i++) {
            $scope.zoneList[i].zoneidname = response.data[i].code + ' - ' + response.data[i].name;
        }
    });

    $http.get('/getStaffList').then(function(response) {
        $scope.staffList = response.data;
        $scope.area.staff = $scope.staffList[0];
        for (var i = 0; i < (response.data).length; i++) {
            $scope.staffList[i].staffidname = response.data[i].name + ' - ' + response.data[i].id;
        }
    });

    $http.get('/getDriverList').then(function(response) {
        $scope.driverList = response.data;
        $scope.area.driver = $scope.driverList[0];
        for (var i = 0; i < $scope.driverList.length; i++) {
            $scope.driverList[i].driveridname = response.data[i].name + ' - ' + response.data[i].id;
        }
    });

    $scope.addArea = function() {
        $scope.showCreateBtn = false;
        if($scope.area.code == null || $scope.area.code == "" || $scope.area.name == null || $scope.area.name == "" || $scope.area.zone == null || $scope.area.zone == "" || $scope.area.staff == null || $scope.area.staff == "" || $scope.area.driver == null || $scope.area.driver == ""){
            $scope.notify("error","There Has Blank Column.");
            $scope.showCreateBtn = true;
        }else{
            $scope.area.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $scope.area.iam = window.sessionStorage.getItem('owner');
            $http.post('/addArea', $scope.area).then(function(response) {
                var data = response.data;
                $scope.notify(data.status, data.message);
                
                if (data.status === "success") {
//                    $scope.areaList.push({
//                        "code": $scope.area.zone.code + $scope.area.code,
//                        "name": $scope.area.name,
//                        "status": 'ACTIVE',
//                        "zoneName": $scope.area.zone.code + ' - ' + $scope.area.zone.name,
//                        "staffName": $scope.area.staff.id + ' - ' + $scope.area.staff.name
//                    });
//                    $scope.filterAreaList = angular.copy($scope.areaList);
                    angular.element('#createArea').modal('toggle');
//                    $scope.totalItems = $scope.filterAreaList.length;
                }
                $scope.showCreateBtn = true;
            });            
        }

        //
        //        $http.post('/addArea', $scope.area).then(function(response) {
        //            var data = response.data;
        //            var newAreaID;
        //
        //            $scope.notify(data.status, data.message);
        //            
        //            if (data.status === "success") {
        //                newAreaID = data.details.areaID;
        //                $scope.newArea.areaCode = newAreaID;
        //                $scope.areaList.push({
        //                    "id": newAreaID,
        //                    "name": $scope.area.name,
        //                    "status": 'ACTIVE',
        //                    "zoneName": $scope.area.zone.code + ' - ' + $scope.area.zone.name,
        //                    "staffName": $scope.area.staff.id + ' - ' + $scope.area.staff.name
        //                });
        //                $scope.area.id = newAreaID;
        //                $scope.area.zoneName = $scope.area.zone.code + ' - ' + $scope.area.zone.name;
        //                $scope.area.staffName = $scope.area.staff.id + ' - ' + $scope.area.staff.name;
        //                socket.emit('create new area', $scope.area);
        //                $scope.filterAreaList = angular.copy($scope.areaList);
        //                angular.element('#createArea').modal('toggle');
        //                $scope.totalItems = $scope.filterAreaList.length;
        //            
        //                var $googleMap, visualizeMap, map, lat = 0,
        //                    lng = 0,
        //                    myPlace, address;
        //
        //                $http.post('/getGoogleLocation', $scope.newArea).then(function(response) {
        //                    address = $scope.geocodeLink(response.data[0]);
        //
        //                    $http.get(address).then(function(response) {
        //                        if(response.data.status == "ZERO_RESULTS"){
        //                            angular.element('body').overhang({
        //                                type: "error",
        //                                message: "Cant obtain area's Longitude and Latitude."
        //                            });
        //                            
        //                        }else{
        //                        // JSON data returned by API above
        //                            var myPlace = response.data;
        //
        //                            $scope.newArea.lng = myPlace.results[0].geometry.location.lng;
        //                            $scope.newArea.lat = myPlace.results[0].geometry.location.lat;
        //                            $http.post('/updateAreaLngLat', $scope.newArea).then(function(response) {
        //                                angular.element('body').overhang({
        //                                    type: response.data.type,
        //                                    message: response.data.msg
        //                                });                                
        //                            });
        //                        }
        //
        //                    });
        //                });
        //            }
        //        });
    }

    socket.on('append area list', function(data) {
        $scope.areaList.push({
            "id": data.id,
            "name": data.name,
            "zoneName": data.zoneName,
            "staffName": data.staffName,
            "status": data.status
        });
        $scope.filterAreaList = angular.copy($scope.areaList);
        $scope.totalItems = $scope.filterAreaList.length;
        $scope.$apply();
    });

    $scope.orderBy = function(property, property2) {
        $scope.areaList = $filter('orderBy')($scope.areaList, ['' + property + '', '' + property2 + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('thisAreaController', function($scope, $http, $routeParams, storeDataService) {
    'use strict';

    var areaID = $routeParams.areaID;

    $scope.area = {
        "id": areaID,
        "code": '',
        "name": '',
        "zone": '',
        "staff": '',
        "driver": '',
        "status": '',
        "days": {
            "mon": '',
            "tue": '',
            "wed": '',
            "thu": '',
            "fri": '',
            "sat": '',
            "sun": ''
        },
        "frequency": '',
        "iam": ''
    };
    $scope.days = {
        "mon": '',
        "tue": '',
        "wed": '',
        "thu": '',
        "fri": '',
        "sat": '',
        "sun": ''
    };
    $scope.collection = {
        "area": areaID,
        "address": ''
    };

    $scope.show = angular.copy(storeDataService.show.area);

    //in area-management.js
    $http.get('/getZoneList').then(function(response) {
        var data = response.data;
        $scope.zoneList = data;
    });

    $http.get('/getStaffList').then(function(response) {
        var data = response.data;
        $scope.staffList = data;
    });

    $http.get('/getDriverList').then(function(response) {
        var data = response.data;
        $scope.driverList = data;

    });

    $http.post('/thisArea', $scope.area).then(function(response) {
        var data = response.data[0];
        $scope.area = data;
        if ($scope.area.frequency != null) {
            $scope.daysArray = $scope.area.frequency.split(',');
            $.each($scope.daysArray, function(index, value) {
                $scope.days[value] = 'A';
            });
        }
//        $http.post('/thisAreaDriver', { "id": areaID }).then(function(response) {
//            $scope.area.driver = response.data[0].driver;
//        });
    });

    $http.post('/getCollection', $scope.area).then(function(response) {
        $scope.collectionList = response.data;
        storeDataService.collection = angular.copy($scope.collectionList);
    });

    $scope.addCollection = function() {
        if ($scope.collection.address == "") {
            //            angular.element('body').overhang({
            //                "type": "error",
            //                "message": "Address Cannot Be Blank"
            //            });
            $scope.notify("error", "Address Cannot Be Blank");
        } else {
            if ($scope.collection.add != "") {
                $scope.collection.iam = window.sessionStorage.getItem('owner');
                $http.post('/addCollection', $scope.collection).then(function(response) {
                    var data = response.data;
                    $scope.notify(data.status, data.message);
                    if (data.status == "success") {
                        //$scope.collectionList.push({ "id": data.details.id, "address": $scope.collection.address });
                        //storeDataService.collection = angular.copy($scope.collectionList);
                        $scope.collection.address = "";
                    }
                    //                    angular.element('body').overhang({
                    //                        "status": data.status,
                    //                        "message": data.message
                    //                    });
                });
            }
        }
    };


    $scope.updateArea = function() {
        var concatDays = "";
        $scope.area.iam = window.sessionStorage.getItem('owner');
        $.each($scope.days, function(index, value) {
            if (value == "A") {
                concatDays += index + ',';
            }
        });
        concatDays = concatDays.slice(0, -1);
        $scope.area.frequency = concatDays;
        //console.log($scope.collectionList.length);
        if ($scope.area.frequency == "" || $scope.collectionList.length == 0) {
            if ($scope.area.frequency == "" && $scope.collectionList.length == 0) {
                angular.element('body').overhang({
                    "type": "error",
                    "message": "Please Fill In Collection Frequency And Area Collection "
                });
            } else if ($scope.area.frequency == "") {
                angular.element('body').overhang({
                    "type": "error",
                    "message": "Please Fill In Collection Frequency"
                });
            } else if ($scope.collectionList.length == 0) {
                angular.element('body').overhang({
                    "type": "error",
                    "message": "Please Fill In Area Collection"
                });
            }
        } else {
            $http.post('/updateArea', $scope.area).then(function(response) {
                var data = response.data;
                if (data.status === "success") {
                    angular.element('body').overhang({
                        type: data.status,
                        message: data.message
                    });
                    window.location.href = '#/area-management';
                }

            });
        }


        //        var tamanArray = $scope.taman.split(',');
        //        $scope.updateTamanObj = {
        //            "taman": tamanArray,
        //            "length" : tamanArray.length,
        //            "area" : areaID
        //        }
        //        $http.post("/updateTamanSet", $scope.updateTamanObj).then(function(response){
        //            window.location.href = '#/area-management';
        //        });
        //        console.log($scope.taman);
        //        console.log($scope.updateTamanObj);
    };

    $scope.areaEditBoundaries = function() {
        window.location.href = '#/boundary/' + $scope.area.id;
    }

});

app.controller('accountController', function($scope, $http, $filter, $window, storeDataService) {
    'use strict';

    var asc = true;
    $scope.filterStaffList = [];
    $scope.searchStaffFilter = '';
    $scope.staffList = [];
    $scope.showCreateBtn = true;
    
    $scope.pagination = angular.copy(storeDataService.pagination);
    $scope.show = angular.copy(storeDataService.show.account);

    $scope.initializeStaff = function() {
        $scope.staff = {
            "name": '',
            "position": $scope.positionList[0],
            "username": '',
            "password": ''
        };
    };

    $http.get('/getPositionList').then(function(response) {
        $scope.positionList = response.data;
        $scope.initializeStaff();
    });

    $scope.statusList = true;

    $scope.updateStatusList = function() {
        if ($scope.statusList) {
            $scope.staffList = angular.copy($scope.staffListActive);
        } else {
            $scope.staffList = angular.copy($scope.staffListInactive);
        }

        $scope.filterStaffList = angular.copy($scope.staffList);
        $scope.totalItems = $scope.filterStaffList.length;
    }

    $http.get('/getAllUser').then(function(response) {
        $scope.staffList = response.data;
        $scope.searchStaff = function(staff) {
            return (staff.id + staff.name + staff.username + staff.position + staff.status).toUpperCase().indexOf($scope.searchStaffFilter.toUpperCase()) >= 0;
        }

        $scope.staffListActive = [];
        $scope.staffListInactive = [];
        for (var i = 0; i < $scope.staffList.length; i++) {
            if ($scope.staffList[i].status == 'ACTIVE') {
                $scope.staffListActive.push($scope.staffList[i]);
            } else {
                $scope.staffListInactive.push($scope.staffList[i]);
            }
        }
        $scope.staffList = angular.copy($scope.staffListActive);
        $scope.filterStaffList = angular.copy($scope.staffList);

        $scope.totalItems = $scope.filterStaffList.length;

        $scope.getData = function() {
            return $filter('filter')($scope.filterStaffList, $scope.searchStaffFilter);
        };

        $scope.$watch('searchStaffFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.pagination.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);
    });

    $scope.addUser = function() {
        $scope.showCreateBtn = false;
        $scope.sendRequest = false;
        $scope.staff.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.staff.owner = $window.sessionStorage.getItem('owner');
        
        if($scope.staff.name==""){
            $scope.notify("error", "Staff Name Cannot Be Blank");
            $scope.showCreateBtn = true;
            $scope.sendRequest = false;
        }else{
            if($scope.staff.position.name == "Driver"){
                $scope.showCreateBtn = false;
                $scope.sendRequest = true;
            }else{
                if($scope.staff.username == "" || $scope.staff.password == ""){
                    $scope.notify("error", "Staff User Name and Password Cannot Be Blank");
                    $scope.showCreateBtn = true;
                    $scope.sendRequest = false;
                }else{
                    $scope.showCreateBtn = false;
                    $scope.sendRequest = true;
                }
            }
        }
        
        if($scope.sendRequest == true){
            
            //create variables in json object
            $http.post('/addUser', $scope.staff).then(function(response) {
                var data = response.data;

                if (data.status === "success") {
                    socket.emit('authorize request', { "action": "create user" });
                    var rowId = 1;
                }

                $scope.notify(data.status, data.message);
                angular.element('#createAccount').modal('toggle');
                $scope.initializeStaff();
                $scope.showCreateBtn = true;
            });
        }
    };

    socket.on('append user list', function(data) {
        $scope.staffList.push({
            "id": data.id,
            "name": data.name,
            "username": data.username,
            "position": data.position,
            "status": data.status
        });
        $scope.filterStaffList = angular.copy($scope.staffList);
        $scope.totalItems = $scope.filterStaffList.length;
        $scope.$apply();
    });

    $scope.orderBy = function(property) {
        $scope.staffList = $filter('orderBy')($scope.staffList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };

});

app.controller('specificAccController', function($scope, $http, $routeParams, $filter, storeDataService) {
    'use strict';

    $scope.thisAccount = {
        "id": $routeParams.userID,
        "avatar": '',
        "name": '',
        "ic": '',
        "gender": '',
        "dob": '',
        "bindDob": '',
        "position": '',
        "status": '',
        "email": '',
        "handphone": '',
        "phone": '',
        "address": '',
        "iam": window.sessionStorage.getItem('owner')
    };

    $scope.password = {
        "id": $routeParams.userID,
        "password": '',
        "again": '',
        "iam": window.sessionStorage.getItem('owner')
    };

    $scope.show = angular.copy(storeDataService.show.account);

    $http.get('/getPositionList').then(function(response) {
        $scope.positionList = response.data;
    });

    $http.post('/loadSpecificAccount', $scope.thisAccount).then(function(response) {
        $.each(response.data[0], function(index, value) {
            if (index == "dob") {
                $scope.thisAccount[index] = new Date(value);
                $scope.thisAccount["bindDob"] = $scope.thisAccount["bindDob"] == "null" ? "" : $filter('date')($scope.thisAccount[index], 'dd MMM yyyy');
            } else {
                $scope.thisAccount[index] = value == "null" ? "" : value;
            }
        });
    });

    $scope.updatePassword = function() {
        $http.post('/updatePassword', $scope.password).then(function(response) {
            var data = response.data;
            $scope.notify(data.status, data.message);
            if (data.status === "success") {
                $scope.password.password = '';
                $scope.password.again = '';
            }
        });
    };

    $scope.backPage = function() {
        window.location.href = "#/account-management"
    }
});

app.controller('errorController', function($scope, $window) {
    'use strict';
    angular.element('.error-page [data-func="go-back"]').click(function() {
        $window.history.back();
    });
});

app.controller('truckController', function($scope, $http, $filter, storeDataService) {
    'use strict';

    var asc = true;
    $scope.areaList = [];
    $scope.filterTruckList = [];
    
    $scope.initializeTruck = function() {
        $scope.truck = {
            "no": '',
            "driver": '',
            "area": '',
            "iam": window.sessionStorage.getItem('owner')
        };
    };
    $scope.initializeTruck();
    $scope.showCreateBtn = true;

    $scope.pagination = angular.copy(storeDataService.pagination);
    $scope.show = angular.copy(storeDataService.show.truck);

    $scope.statusList = true;
    $scope.updateStatusList = function() {
        if ($scope.statusList) {
            $scope.truckList = angular.copy($scope.truckListActive);
        } else {
            $scope.truckList = angular.copy($scope.truckListInactive);
        }

        $scope.filterTruckList = angular.copy($scope.truckList);
        $scope.totalItems = $scope.filterTruckList.length;
    }

    $http.get('/getAllTruck').then(function(response) {
        $scope.searchTruckFilter = '';
        $scope.truckList = response.data;
        $.each($scope.truckList, function(index, value) {
            $scope.truckList[index].roadtax = $filter('date')($scope.truckList[index].roadtax, 'yyyy-MM-dd');
        });

        $scope.searchTruck = function(truck) {
            return (truck.id + truck.no + truck.transporter + truck.ton + truck.roadtax + truck.status).toUpperCase().indexOf($scope.searchTruckFilter.toUpperCase()) >= 0;
        }

        $scope.truckListActive = [];
        $scope.truckListInactive = [];
        for (var i = 0; i < $scope.truckList.length; i++) {
            if ($scope.truckList[i].status == 'ACTIVE') {
                $scope.truckListActive.push($scope.truckList[i]);
            } else {
                $scope.truckListInactive.push($scope.truckList[i]);
            }
        }
        $scope.truckList = angular.copy($scope.truckListActive);


        $scope.filterTruckList = angular.copy($scope.truckList);
        $scope.totalItems = $scope.filterTruckList.length;

        $scope.getData = function() {
            return $filter('filter')($scope.filterTruckList, $scope.searchTruckFilter);
        };

        $scope.$watch('searchTruckFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.pagination.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);
    });


    function renderSltPicker() {
        angular.element('.selectpicker').selectpicker('refresh');
        angular.element('.selectpicker').selectpicker('render');
    }

    $http.get('/getDriverList').then(function(response) {
        $scope.driverList = response.data;
        $scope.truck.driver = $scope.driverList[0];
    });
    $http.get('/getAreaList').then(function(response) {
        renderSltPicker();
        $.each(response.data, function(index, value) {
            var areaID = value.id.split(",");
            var areaName = value.name.split(",");
            var area = [];
            $.each(areaID, function(index, value) {
                area.push({
                    "id": areaID[index],
                    "name": areaName[index]
                });
            });
            $scope.areaList.push({
                "zone": {
                    "id": value.zoneID,
                    "name": value.zoneName
                },
                "area": area
            });
        });
        $('.selectpicker').on('change', function() {
            renderSltPicker();
        });
    });

    $scope.addTruck = function() {
        $scope.showCreateBtn = false;
        if($scope.truck.no == null || $scope.truck.transporter == null || $scope.truck.ton == null || $scope.truck.roadtax == null ||  $scope.truck.no == "" || $scope.truck.transporter == "" || $scope.truck.ton == "" || $scope.truck.roadtax == "" ){
            $scope.notify("error", "There Has Blank Column");
            $scope.showCreateBtn = true;
        }else{       
        
            $scope.truck.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $scope.truck.roadtax = $filter('date')($scope.truck.roadtax, 'yyyy-MM-dd');
            $scope.truck.iam = window.sessionStorage.getItem('owner');
            $http.post('/addTruck', $scope.truck).then(function(response) {
                var data = response.data;
//                var newTruckID = data.details.truckID;

                $scope.notify(data.status, data.message);
                if (data.status === "success") {
//                    $scope.truckList.push({
//                        "id": newTruckID,
//                        "no": $scope.truck.no,
//                        "transporter": $scope.truck.transporter,
//                        "ton": $scope.truck.ton,
//                        "roadtax": $scope.truck.roadtax,
//                        "status": 'Active'
//                    });
//                    $scope.truck.id = newTruckID;
//                    socket.emit('create new truck', $scope.truck);
//                    storeDataService.truck = angular.copy($scope.truckList);
//                    $scope.filterTruckList = angular.copy($scope.truckList);
//                    $scope.totalItems = $scope.filterTruckList.length;
                    angular.element('#createTruck').modal('toggle');
                    $scope.initializeTruck();
                    
                }
                $scope.showCreateBtn = true; 
            });
            
        }
    };

    socket.on('append truck list', function(data) {
        $scope.truckList.push({
            "id": data.id,
            "no": data.no,
            transporter: data.transporter,
            ton: data.ton,
            roadtax: data.roadtax,
            status: data.status
        });
        $scope.filterTruckList = angular.copy($scope.truckList);
        $scope.totalItems = $scope.filterTruckList.length;
        $scope.$apply();
    });

    $scope.orderBy = function(property) {
        $scope.truckList = $filter('orderBy')($scope.truckList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('zoneController', function($scope, $http, $filter, storeDataService) {
    'use strict';

    var asc = true;
    $scope.filterZoneList = [];
    $scope.showCreateBtn = true;

    $scope.initializeZone = function() {
        $scope.zone = {
            "code": '',
            "name": '',
            "creationDate": '',
            "iam": window.sessionStorage.getItem('owner')
        };
    };
    $scope.initializeZone();
    $scope.pagination = angular.copy(storeDataService.pagination);
    $scope.show = angular.copy(storeDataService.show.zone);

    $scope.statusList = true;
    $scope.updateStatusList = function() {
        if ($scope.statusList) {
            $scope.zoneList = angular.copy($scope.zoneListActive);
        } else {
            $scope.zoneList = angular.copy($scope.zoneListInactive);
        }

        $scope.filterZoneList = angular.copy($scope.zoneList);
        $scope.totalItems = $scope.filterZoneList.length;
    }

    $http.get('/getAllZone').then(function(response) {
        storeDataService.zone = angular.copy(response.data);
        $scope.searchZoneFilter = '';
        $scope.zoneList = response.data;

        $scope.searchZone = function(zone) {
            return (zone.id + zone.code + zone.name + zone.status).toUpperCase().indexOf($scope.searchZoneFilter.toUpperCase()) >= 0;
        }

        $scope.zoneListActive = [];
        $scope.zoneListInactive = [];
        for (var i = 0; i < $scope.zoneList.length; i++) {
            if ($scope.zoneList[i].status == 'ACTIVE') {
                $scope.zoneListActive.push($scope.zoneList[i]);
            } else {
                $scope.zoneListInactive.push($scope.zoneList[i]);
            }
        }
        $scope.zoneList = angular.copy($scope.zoneListActive);

        $scope.filterZoneList = angular.copy($scope.zoneList);

        $scope.totalItems = $scope.filterZoneList.length;

        $scope.getData = function() {
            return $filter('filter')($scope.filterZoneList, $scope.searchZoneFilter);
        };

        $scope.$watch('searchZoneFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.pagination.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);

    });

    $scope.addZone = function() {
        $scope.showCreateBtn = false;
        if($scope.zone.code == null || $scope.zone.code == "" || $scope.zone.name == null || $scope.zone.code == ""){
            $scope.notify("error", "There Has Blank Column");
            $scope.showCreateBtn = true;
        }else{
            $scope.zone.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $scope.zone.iam = window.sessionStorage.getItem('owner');
            $http.post('/addZone', $scope.zone).then(function(response) {
                var data = response.data;
                //var newZoneID = data.details.zoneID;

                $scope.notify(data.status, data.message);
                if (data.status === "success") {
//                    $scope.zoneList.push({
//                        "id": newZoneID,
//                        "code": $scope.zone.code,
//                        "name": $scope.zone.name,
//                        "status": 'ACTIVE'
//                    });
//                    $scope.zone.id = newZoneID;
//                    socket.emit('create new zone', $scope.zone);
//                    $scope.filterZoneList = angular.copy($scope.zoneList);
//                    storeDataService.zone = angular.copy($scope.zoneList);
//                    $scope.totalItems = $scope.filterZoneList.length;
                    angular.element('#createZone').modal('toggle');
                    $scope.initializeZone();
                    $scope.showCreateBtn = true;
                }
            });            
            
        }

    }

    socket.on('append zone list', function(data) {
        $scope.zoneList.push({
            "id": data.id,
            "name": data.name,
            "status": data.status
        });
        $scope.filterZoneList = angular.copy($scope.zoneList);
        $scope.totalItems = $scope.filterZoneList.length;
        $scope.$apply();
    });

    $scope.orderBy = function(property) {
        $scope.zoneList = $filter('orderBy')($scope.zoneList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('roleController', function($scope, $http, $filter) {
    'use strict';
    $scope.showCreateBtn = true;
    $scope.role = {
        "name": "",
        "creationDate": ""
    };
    
    $scope.initializeRole = function() {
        $scope.role = {
            "name": "",
            "creationDate": ""
        };
    };

    $http.get('/getAllRole').then(function(response) {
        $scope.roleList = response.data;
    });

    $scope.editAuth = function(role) {
        window.location.href = '#/auth/' + role;
    };

    $scope.addRole = function() {
        $scope.showCreateBtn = false;
        $scope.role.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        if($scope.role.name == null || $scope.role.name == ""){
            $scope.notify("error","Role Name Cannot be Blank.");
            $scope.showCreateBtn = true;
        }
        else{
            $http.post('/addRole', $scope.role).then(function(response) {
                var data = response.data;
                $scope.notify(data.status, data.message);
                if (data.status == "success") {
                    $scope.roleList.push({ "id": data.details.roleID, "name": $scope.role.name, "status": "ACTIVE" });
                    angular.element('#createRole').modal('toggle');
                    $scope.initializeRole();
                    $scope.showCreateBtn = true;
                }
            });
        }
    };

});

app.controller('specificAuthController', function($scope, $http, $routeParams, storeDataService, $location) {
    $scope.role = {
        "name": $routeParams.auth,
        "oriname": $routeParams.auth
    };
    $scope.showSaveBtn = true;
    $scope.showCheckBtn = true;
    $scope.checkall = false;
    $scope.auth = {
        "account": {
            "create": 'I',
            "edit": 'I',
            "view": 'I'
        },
        "driver": {
            "create": 'I',
            "edit": 'I',
            "view": 'I'
        },
        "truck": {
            "create": 'I',
            "edit": 'I',
            "view": 'I'
        },
        "zone": {
            "create": 'I',
            "edit": 'I',
            "view": 'I'
        },
        "area": {
            "create": 'I',
            "edit": 'I',
            "view": 'I',
            "collection": {
                "add": 'I',
                "edit": 'I'
            }
        },
        "bin": {
            "create": 'I',
            "edit": 'I',
            "view": 'I'
        },
        "acr": {
            "create": 'I',
            "edit": 'I',
            "view": 'I',
            "lgview": 'I',
            "bdview": 'I'
        },
        "database": {
            "create": 'I',
            "edit": 'I',
            "view": 'I'
        },
        "inventory": {
            "edit": 'I',
            "view": 'I'
        },
        "authorization": {
            "view": 'I'
        },
        "formAuthorization": {
            "view": 'I'
        },
        "complaintlist": {
            "view": 'I'
        },
        "transactionLog": {
            "view": 'I'
        },
        "reporting": {
            "view": 'I',
            "edit": 'I',
            "create": 'I',
            "export": 'I'
        },
        "delivery": {
            "view": 'I',
            "edit": 'I',
            "create": 'I'
        },
        "damagedlost": {
            "view": 'I',
            "edit": 'I',
            "create": 'I'
        },
        "custService": {
            "upload": 'I',
            "send": 'I',
            "approve": 'I',
            "view": 'I'
        }
    };

    $http.post('/getAllAuth', $scope.role).then(function(response) {
        var splitName, flag = false,
            key;

        $.each(response.data, function(index, value) {
            $.each(value, function(bigKey, bigValue) {
                if (bigKey == 'name') {
                    splitName = bigValue.split(' ');
                    if (bigValue == "add collection") {
                        flag = true;
                        key = "add";
                    }
                    if (bigValue == "edit collection") {
                        flag = true;
                        key = "edit";
                    }
                }
                if (bigKey == "status") { 
                    if (flag == false) {
                        console.log($scope.auth[splitName[1]][splitName[0]]);
                        $scope.auth[splitName[1]][splitName[0]] = bigValue;
                    } else {
                        $scope.auth["area"]["collection"][key] = bigValue;
                        flag = false;
                    }
                }
            });  
        });
        //storeDataService.show = angular.copy($scope.auth);
    });

    $scope.changeValue = function(value, key) {

        $scope.thisAuth = {
            "name": $scope.role.name,
            "management": key,
            "access": value
        };

        $http.post('/setAuth', $scope.thisAuth).then(function(response) {
            var data = response.data;
            $scope.notify(data.status, data.message);
            storeDataService.show = angular.copy($scope.auth);
        });
    }

    $scope.updateRoleName = function() {
        $scope.showSaveBtn = false;
        if($scope.role.name == null || $scope.role.name == ""){
            $scope.notify("error","Role Name Cannot be Blank.");
            $scope.showSaveBtn = true;
        }
        else{
            
            
            $http.post('/updateRoleName', $scope.role).then(function(response) {
                $scope.showSaveBtn = true;
                if (response.data.status == "success") {
                    $scope.role.oriname = $scope.role.name;
                    
                    var url = "/auth/" + $scope.role.name;
                    $location.path(url);
                    
                    angular.element('body').overhang({
                        "type": response.data.status,
                        "message": response.data.message
                    });
                } else {
                    angular.element('body').overhang({
                        "type": response.data.status,
                        "message": response.data.message
                    });
                    
                    $scope.role.name = $scope.role.oriname;
                }
            });
        }
    }

    $scope.checkAllAuth = function() {
        if ($scope.checkall == false) {
            $scope.showCheckBtn = false;
            $scope.checkall = true;
            $scope.allAuth = {
                "name": $scope.role.oriname,
                "value": $scope.checkall
            }
            $http.post('/setAllAuth', $scope.allAuth).then(function(response) {
                $scope.showCheckBtn = true;
                if (response.data.status == "success") {
                    $scope.auth = {
                        "account": {
                            "create": 'A',
                            "edit": 'A',
                            "view": 'A'
                        },
                        "driver": {
                            "create": 'A',
                            "edit": 'A',
                            "view": 'A'
                        },
                        "truck": {
                            "create": 'A',
                            "edit": 'A',
                            "view": 'A'
                        },
                        "zone": {
                            "create": 'A',
                            "edit": 'A',
                            "view": 'A'
                        },
                        "area": {
                            "create": 'A',
                            "edit": 'A',
                            "view": 'A',
                            "collection": {
                                "add": 'A',
                                "edit": 'A'
                            }
                        },
                        "bin": {
                            "create": 'A',
                            "edit": 'A',
                            "view": 'A'
                        },
                        "acr": {
                            "create": 'A',
                            "edit": 'A',
                            "view": 'A',
                            "lgview": 'A',
                            "bdview": 'A'
                        },
                        "database": {
                            "create": 'A',
                            "edit": 'A',
                            "view": 'A'
                        },
                        "inventory": {
                            "edit": 'A',
                            "view": 'A'
                        },
                        "authorization": {
                            "view": 'A'
                        },
                        "formAuthorization": {
                            "view": 'A'
                        },
                        "complaintlist": {
                            "view": 'A'
                        },
                        "transactionLog": {
                            "view": 'A'
                        },
                        "reporting": {
                            "view": 'A',
                            "edit": 'A',
                            "create": 'A',
                            "export": 'A'
                        },
                        "delivery": {
                            "view": 'A',
                            "edit": 'A',
                            "create": 'A'
                        },
                        "damagedlost": {
                            "view": 'A',
                            "edit": 'A',
                            "create": 'A'
                        },
                        "custService": {
                            "upload": 'A',
                            "send": 'A',
                            "approve": 'A',
                            "view": 'A'
                        }
                    };
                }
            });
        }
        else if ($scope.checkall == true) {
            $scope.showCheckBtn = false;
            $scope.checkall = false;
            $scope.allAuth = {
                "name": $scope.role.oriname,
                "value": $scope.checkall
            }
            $http.post('/setAllAuth', $scope.allAuth).then(function(response) {
                $scope.showCheckBtn = true;
                if (response.data.status == "success") {
                    $scope.auth = {
                        "account": {
                            "create": 'I',
                            "edit": 'I',
                            "view": 'I'
                        },
                        "driver": {
                            "create": 'I',
                            "edit": 'I',
                            "view": 'I'
                        },
                        "truck": {
                            "create": 'I',
                            "edit": 'I',
                            "view": 'I'
                        },
                        "zone": {
                            "create": 'I',
                            "edit": 'I',
                            "view": 'I'
                        },
                        "area": {
                            "create": 'I',
                            "edit": 'I',
                            "view": 'I',
                            "collection": {
                                "add": 'I',
                                "edit": 'I'
                            }
                        },
                        "bin": {
                            "create": 'I',
                            "edit": 'I',
                            "view": 'I'
                        },
                        "acr": {
                            "create": 'I',
                            "edit": 'I',
                            "view": 'I',
                            "lgview": 'I',
                            "bdview": 'I'
                        },
                        "database": {
                            "create": 'I',
                            "edit": 'I',
                            "view": 'I'
                        },
                        "inventory": {
                            "edit": 'I',
                            "view": 'I'
                        },
                        "authorization": {
                            "view": 'I'
                        },
                        "formAuthorization": {
                            "view": 'I'
                        },
                        "complaintlist": {
                            "view": 'I'
                        },
                        "transactionLog": {
                            "view": 'I'
                        },
                        "reporting": {
                            "view": 'I',
                            "edit": 'I',
                            "create": 'I',
                            "export": 'I'
                        },
                        "delivery": {
                            "view": 'I',
                            "edit": 'I',
                            "create": 'I'
                        },
                        "damagedlost": {
                            "view": 'I',
                            "edit": 'I',
                            "create": 'I'
                        },
                        "custService": {
                            "upload": 'I',
                            "send": 'I',
                            "approve": 'I',
                            "view": 'I'
                        }
                    };
                }
            });
        }

    }

});

app.controller('binController', function($scope, $http, $filter, storeDataService) {
    'use strict';
    var asc = true;
    $scope.showCreateBtn = true;
    $scope.areaList = [];

    $scope.bin = {
        "id": '',
        "name": '',
        "location": '',
        "area": '',
        "areaCode": '',
        "areacode": '',
        "iam": ''
    };

    $scope.pagination = angular.copy(storeDataService.pagination);
    $scope.show = angular.copy(storeDataService.show.bin);

    $scope.statusList = true;
    $scope.updateStatusList = function() {
        if ($scope.statusList) {
            $scope.binList = angular.copy($scope.binListActive);
        } else {
            $scope.binList = angular.copy($scope.binListInactive);
        }

        $scope.filterAreaList = angular.copy($scope.binList);
        $scope.totalItems = $scope.filterAreaList.length;
    }

    $http.get('/getAllBinCenter', $scope.currentStatus).then(function(response) {
        $scope.searchBinFilter = '';
        $scope.binList = response.data;

        $.each($scope.binList, function(index, value) {
            $scope.binList[index].areacode = $scope.binList[index].area + ',' + $scope.binList[index].areaCode;
        });

        storeDataService.bin = angular.copy($scope.binList);
        $scope.filterBinList = [];

        $scope.searchBin = function(bin) {
            return (bin.id + bin.name + bin.location + bin.areaCode + bin.status).toUpperCase().indexOf($scope.searchBinFilter.toUpperCase()) >= 0;
        };

        $scope.binListActive = [];
        $scope.binListInactive = [];
        for (var i = 0; i < $scope.binList.length; i++) {
            if ($scope.binList[i].status == 'ACTIVE') {
                $scope.binListActive.push($scope.binList[i]);
            } else {
                $scope.binListInactive.push($scope.binList[i]);
            }
        }
        $scope.binList = angular.copy($scope.binListActive);

        $scope.filterBinList = angular.copy($scope.binList);

        $scope.totalItems = $scope.filterBinList.length;

        $scope.getData = function() {
            return $filter('filter')($scope.filterBinList, $scope.searchBinFilter);
        };

        $scope.$watch('searchBinFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.pagination.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);
    });

    $http.get('/getAreaList').then(function(response) {
        renderSltPicker();
        $.each(response.data, function(index, value) {
            var areaID = value.id.split(",");
            var areaName = value.name.split(",");
            var code = value.code.split(",");
            var area = [];
            $.each(areaID, function(index, value) {
                area.push({
                    "id": areaID[index],
                    "name": areaName[index],
                    "code": code[index]
                });
            });
            $scope.areaList.push({ "zone": { "id": value.zoneID, "name": value.zoneName }, "area": area });
        });
        $('.selectpicker').on('change', function() {
            renderSltPicker();
        });
    });
 

    function renderSltPicker() {
        angular.element('.selectpicker').selectpicker('refresh');
        angular.element('.selectpicker').selectpicker('render');
    }

    $scope.addBin = function() {
        $scope.showCreateBtn = false;
        if ($scope.bin.name == "" || $scope.bin.name == null || $scope.bin.location == "" || $scope.bin.location == null || $scope.bin.areaconcat == "" || $scope.bin.areaconcat == null) {
            $scope.notify("error", "Cannot Be Blank");
            $scope.showCreateBtn = true;
        } else {
            $scope.bin.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $scope.bin.iam = window.sessionStorage.getItem('owner');
            var area = $scope.bin.areaconcat;
            var aid = area.split(",")[0];
            var acode = area.split(",")[1];
            $scope.bin.area = aid;
            $scope.bin.areaCode = acode;
            console.log($scope.bin);
            $http.post('/addBinCenter', $scope.bin).then(function(response) {
                var data = response.data;
                //var newBinID = data.details.binID;

                $scope.notify(data.status, data.message);
                if (data.status === "success") {
//                    $scope.binList.push({
//                        "id": newBinID,
//                        "name": $scope.bin.name,
//                        "location": $scope.bin.location,
//                        "area": $scope.bin.area,
//                        "areaCode": $scope.bin.areaCode,
//                        "status": 'ACTIVE'
//                    });
                    //$scope.bin.id = newBinID;
                    //socket.emit('create new bin', $scope.bin);
                    //storeDataService.bin = angular.copy($scope.binList);
                    //$scope.filterBinList = angular.copy($scope.binList);
                    angular.element('#createBin').modal('toggle');
                    //$scope.totalItems = $scope.filterBinList.length;
                }
                $scope.showCreateBtn = true;
            });
        }
    }

    socket.on('append bin list', function(data) {
        $scope.binList.push({
            "id": data.id,
            "name": data.name,
            "location": data.location,
            "area": data.area,
            "areaCode": $scope.bin.areaCode,
            "status": data.status
        });
        $scope.filterBinList = angular.copy($scope.binList);
        $scope.totalItems = $scope.filterBinList.length;
        $scope.$apply();
    });

    $scope.orderBy = function(property) {
        $scope.binList = $filter('orderBy')($scope.binList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('boundaryController', function($scope, $http, $filter, $routeParams, storeDataService) {
    'use strict';
    
    var areaID = $routeParams;

    $http.post('/getAreaCode', $routeParams).then(function(response) {
        $scope.areaCode = response.data[0].code;
    });

    var geocoder, map, all_overlays = [],
        polygons = [],
        polygonID = 1,
        selectedShape, removedPolygons = [],
        myPolygons = [];

    jscolor.installByClassName("jscolor");

    function clearSelection() {
        if (selectedShape) {
            selectedShape.setEditable(false);
            selectedShape = null;
            $('#resetPolygon').hide();
        }
    }

    function setSelection(shape) {
        var newPoint = [];

        clearSelection();
        selectedShape = shape;
        shape.setEditable(true);
        $('#resetPolygon').show();

        selectedShape.getPaths().forEach(function(path, index) {
            google.maps.event.addListener(path, 'insert_at', function() {
                for (var i = 0; i < selectedShape.getPath().length; i++) {
                    newPoint.push({ "lat": selectedShape.getPath().getAt(i).lat(), "lng": selectedShape.getPath().getAt(i).lng() });
                }

                for (var j = 0; j < polygons.length; j++) {
                    if (polygons[j].id === selectedShape.id) {
                        polygons[j].latLngs = newPoint;
                    }
                }
                newPoint = [];
            });

            google.maps.event.addListener(path, 'remove_at', function() {
                alert('remove a point');
                for (var i = 0; i < selectedShape.getPath().length; i++) {
                    console.log({ "lat": selectedShape.getPath().getAt(i).lat(), "lng": selectedShape.getPath().getAt(i).lng() });
                }

                for (var j = 0; j < polygons.length; j++) {
                    if (polygons[j].id === selectedShape.id) {
                        polygons[j].latLngs = newPoint;
                    }
                }
            });

            google.maps.event.addListener(path, 'set_at', function() {
                alert('call set');
                for (var i = 0; i < selectedShape.getPath().length; i++) {
                    newPoint.push({ "lat": selectedShape.getPath().getAt(i).lat(), "lng": selectedShape.getPath().getAt(i).lng() });
                }

                for (var j = 0; j < polygons.length; j++) {
                    if (polygons[j].id === selectedShape.id) {
                        polygons[j].latLngs = newPoint;
                    }
                }
                newPoint = [];
            });
        });
    }

    function setColor(color) {
        color = '#' + color;
        polyOptions.fillColor = color;
        polyOptions.strokeColor = color;
    }

    map = new google.maps.Map(
        document.getElementById("map_canvas"), {
            center: new google.maps.LatLng(1.5503052, 110.3394602),
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            panControl: false,
            zoomControl: false,
            streetViewControl: false,
            disableDefaultUI: true,
            editable: false
        });

    var polyOptions = {
        id: polygonID,
        strokeWeight: 2,
        strokeColor: '#FF1493',
        fillColor: '#FF1493',
        fillOpacity: 0.45,
        editable: true
    };

    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        markerOptions: {
            draggable: true
        },
        polygonOptions: polyOptions
    });

    $('.jscolor').on('blur', function(e) {
        setColor(e.target.value);
    });

    $('#enablePolygon').click(function() {
        setColor($('.jscolor').val());
        drawingManager.setMap(map);
        polyOptions.id = polygonID;
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    });

    $('#resetPolygon').click(function() {
        if (selectedShape) {
            selectedShape.setMap(null);
            $.each(polygons, function(index, value) {
                if (value.id === selectedShape.id) {
                    removedPolygons.push(value);
                    polygons.splice(index, 1);
                    return false;
                }
            });
        }
        drawingManager.setMap(null);
        $('#showonPolygon').hide();
        $('#resetPolygon').hide();
        console.log(polygons);
    });

    $('#clearSelection').click(function() {
        clearSelection();
    });

    google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
        var latLngs = [];
        var color = $('#boundaryColor').val();
        //        var area = google.maps.geometry.spherical.computeArea(selectedShape.getPath());
        //        $('#areaPolygon').html(area.toFixed(2)+' Sq meters');
        $('#resetPolygon').show();

        var polygonBounds = polygon.getPath();

        for (var i = 0; i < polygonBounds.length; i++) {
            latLngs.push({ "lat": polygonBounds.getAt(i).lat(), "lng": polygonBounds.getAt(i).lng() });
        }

        polygons.push({ "id": polygon.id, "color": color, "areaID": areaID.areaID, "area": $scope.areaCode, "latLngs": latLngs });
        polygonID += 1;
        myPolygons.push(polygon);
        console.log(polygons);
    });

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
        all_overlays.push(e);
        if (e.type != google.maps.drawing.OverlayType.MARKER) {
            // Switch back to non-drawing mode after drawing a shape.
            drawingManager.setDrawingMode(null);

            // Add an event listener that selects the newly-drawn shape when the user
            // mouses down on it.
            var newShape = e.overlay;
            newShape.type = e.type;
            google.maps.event.addListener(newShape, 'click', function() {
                setSelection(newShape);
            });
            setSelection(newShape);
        }
    });

    $('#btnSaveBoundary').click(function(e) {
        var existingPolygons = [];
        for (var i = 0; i < polygons.length; i++) {
            if (typeof(polygons[i].id) !== typeof(0)) {
                existingPolygons.push(polygons[i]);
            }
        }
        for (var j = 0; j < existingPolygons.length; j++) {
            polygons.splice(existingPolygons[j], 1);
        }

        $http.post('/createBoundary', { "polygons": polygons }).then(function(response) {
            $http.post('/updateBoundary', { "polygons": existingPolygons }).then(function(response) {

                if (removedPolygons.length > 0) {
                    $http.post('/removeBoundary', { "polygons": removedPolygons }).then(function(response) {
                        console.log(response.data);
                    });
                }
                polygons = [];
                existingPolygons = [];

                for (var i = 0; i < myPolygons.length; i++) {
                    myPolygons[i].setMap(null);
                }
                myPolygons = [];
                loadBoundary();
            });
        });
    });

    function loadBoundary() {
        $http.get('/loadBoundary').then(function(response) {
            var data = response.data;
            var boundaries = [];

            for (var i = 0; i < data.length; i++) {
                if (i === 0) {
                    boundaries.push({ "id": data[i].id, "color": data[i].color, "areaID": data[i].areaID, "area": (data[i].zone + data[i].area), "latLngs": [], "coordinate": [] });
                } else if (i > 0 && data[i - 1].id !== data[i].id) {
                    boundaries.push({ "id": data[i].id, "color": data[i].color, "areaID": data[i].areaID, "area": (data[i].zone + data[i].area), "latLngs": [], "coordinate": [] });
                }
            }

            for (var j = 0; j < data.length; j++) {

                for (var k = 0; k < boundaries.length; k++) {
                    if (data[j].id === boundaries[k].id) {
                        boundaries[k].coordinate.push(new google.maps.LatLng(data[j].lat, data[j].lng));
                        boundaries[k].latLngs.push({ "lat": data[j].lat, "lng": data[j].lng });
                    }
                }
            }

            console.log(boundaries);
            $.each(boundaries, function(index, value) {
                var sumOfCoLat = 0;
                var sumOfCoLng = 0;
                for (var i = 0; i < value.latLngs.length; i++) {
                    sumOfCoLat += value.latLngs[i].lat;
                    sumOfCoLng += value.latLngs[i].lng;
                    //console.log(value.latLngs[i]);
                }

                var avgOfCoLat = sumOfCoLat / value.latLngs.length;
                var avgOfCoLng = sumOfCoLng / value.latLngs.length;

                var myPolygon = new google.maps.Polygon({
                    id: value.id,
                    paths: value.coordinate,
                    strokeColor: '#' + value.color,
                    strokeWeight: 2,
                    fillColor: '#' + value.color,
                    fillOpacity: 0.45,
                    content: value.area,
                    centercoordinate: new google.maps.LatLng(avgOfCoLat, avgOfCoLng)
                });
                myPolygon.setMap(map);
                myPolygons.push(myPolygon);

                var infoWindow = new google.maps.InfoWindow;


                google.maps.event.addListener(myPolygon, 'click', function() {
                    if (value.area === $scope.areaCode) {
                        setSelection(myPolygon);
                    }
                    infoWindow.setContent(this.content);
                    infoWindow.setPosition(this.centercoordinate);
                    infoWindow.open(map);
                });
                polygons.push({ "id": value.id, "color": value.color, "areaID": value.areaID, "area": value.area, "latLngs": value.latLngs });
            });
        });
    }

    loadBoundary();
    $scope.backToArea = function() {
        window.history.go(-1);
    };
});

app.controller('historyController', function ($scope, $http, storeDataService) {
    'use strict';
    
    $scope.pagination = angular.copy(storeDataService.pagination);
    
    $http.get('/historyList').then(function (response) {
        $scope.historyList = response.data;
        $scope.totalItems = $scope.historyList.length;
    });
});

//-----------Check Line------------------
//acr controller
app.controller('acrController', function($scope, $http, $filter, storeDataService) {
    'use strict';
    $scope.areaList = [];
    $scope.dcsList = [];
    $scope.driverList = [];
    $scope.areaList = [];
    $scope.acrList = [];
    $scope.filteredCustomerList = [];



    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;


    $scope.viewdcs = function(dcsID) {
        window.location.href = '#/dcs-details/' + dcsID;
    }

    function initializeDcs() {
        $scope.dcs = {
            "id": '',
            "creationDateTime": '',
            "driver": '',
            "periodFrom": '',
            "periodTo": '',
            "replacementDriver": '',
            "replacementPeriodFrom": '',
            "replacementPeriodTo": ''
        };
    }

    $scope.show = angular.copy(storeDataService.show.acr);
    var driverPosition = angular.copy(storeDataService.positionID.driverPosition);

    function renderSltPicker() {
        angular.element('.selectpicker').selectpicker('refresh');
        angular.element('.selectpicker').selectpicker('render');
    }

    var today = new Date();

    $scope.currentStatus = {
        "status": true,
        "date": formatDateDash(today)
    }

    function getAllDcs() {
        $http.post('/completeDcs', $scope.currentStatus).then(function(response) {

        }); 

        $http.post('/getAllAcr', $scope.currentStatus).then(function(response) {
            $scope.searchAcrFilter = '';
            $scope.acrList = response.data;

            console.log("ACR retrieved!");  
            console.log(response.data);
        });

        $http.get('/getCustomerList', $scope.dcsID).then(function(response) {
            $scope.customerList = response.data;
        });
    
        $http.post('/getAreaList').then(function(response) {
    
            $scope.areaList = response.data;
        });

        $http.post('/getAllDcs', $scope.currentStatus).then(function(response) {
            $scope.dcsList = response.data;

            console.log("DCS data received by controller");
        });

        $http.post('/getStaffList', { "position": 'Driver' }).then(function(response) {
            $scope.driverList = response.data;
        });


    }
    getAllDcs(); //call

    $scope.filterArea = function() {

        $scope.enableArea();
        console.log($scope.dcs);
        $http.post('/filterArea', $scope.dcs).then(function(response) {

            $scope.areaList = response.data;
            console.log($scope.areaList);
        });
    }

    $scope.statusList = true;
    $scope.updateStatusList = function() {
        if ($scope.statusList) {
            $scope.currentStatus.status = true;
        } else {
            $scope.currentStatus.status = false;
        }
        getAllDcs(); //call
    }

    angular.element('.datepicker').datepicker();

    $scope.addDcs = function() {
        $scope.dcs.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.dcs.preparedBy = window.sessionStorage.getItem('owner');

        console.log($scope.dcs.preparedBy);
        $http.post('/addDcs', $scope.dcs).then(function(response) {
            var returnedData = response.data;
            var newDcsID = returnedData.details.dcsID;
            var today = new Date();

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "DCS added successfully!"
                });

                //     var area = $('.selectpicker option:selected').text();
                //    var areastr = area.split(" ")[2];
                //                console.log(areastr); 
                $scope.dcsList.push({ "id": newDcsID, "creationDateTime": today, "driverID": $scope.dcs.driverID, "periodFrom": $scope.dcs.periodFrom, "periodTo": $scope.dcs.periodTo, "replacementDriver": $scope.dcs.replacementDriver, "replacementPeriodFrom": $scope.dcs.replacementPeriodFrom, "replacementPeriodTo": $scope.dcs.replacementPeriodTo, "status": 'ACTIVE' });
                // $scope.filterAcrList = angular.copy($scope.acrList);
                angular.element('#createDCS').modal('toggle');
                // $scope.totalItems = $scope.filterAcrList.length;
            }
        });
    }

 
    $scope.addAcr = function() {

        if($scope.acr.mon){
            $scope.acr.mon = 1;
        } else {
            $scope.acr.mon = 0;
        }
 
        if($scope.acr.tue){
            $scope.acr.tue = 1;
        } else {
            $scope.acr.tue = 0;
        }

        if($scope.acr.wed){
            $scope.acr.wed = 1;
        } else {
            $scope.acr.wed = 0;
        }

        if($scope.acr.thu){
            $scope.acr.thu = 1;
        } else {
            $scope.acr.thu = 0;
        }

        if($scope.acr.fri){
            $scope.acr.fri = 1;
        } else {
            $scope.acr.fri = 0;
        }

        if($scope.acr.sat){
            $scope.acr.sat = 1;
        } else {
            $scope.acr.sat = 0;
        }

        $http.post('/addAcr', $scope.acr).then(function(response) {

            var returnedData = response.data;
  
            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "DCS Entry added successfully!"
                });
                
                getAllDcs(); //REFRESH DETAILS

                angular.element('#createAcr').modal('toggle');
            }
        });
    }

    $scope.deleteAcr = function(a,index) {
        
        $http.post('/deleteAcr', a).then(function(response) {

            if (response.data.status === "success") {
                angular.element('body').overhang({
                    type: "danger",
                    "message": "ACR deleted!"
                });

                $scope.acrList.splice(index,1);
            };
        });
    }

    $scope.resetForm = function() {
        $scope.acr.companyName = '';
        $scope.acr.customerID = '';
        $scope.acr.beBins = '';
        $scope.acr.acrBins = '';
        $scope.acr.mon = '';
        $scope.acr.tue = '';
        $scope.acr.wed = '';
        $scope.acr.thu = '';
        $scope.acr.fri = '';
        $scope.acr.sat = '';
        $scope.acr.remarks = '';

        $scope.disableAddress();
    }

    $scope.disableAddress = function() {
        document.getElementById("txtAddress").disabled = true;
    }

    $scope.enableAddress = function() {
        document.getElementById("txtAddress").disabled = false;
    }

    $scope.filterAddress = function() {

        $scope.enableAddress();
        console.log($scope.acr);
        $http.post('/filterAddress', $scope.acr).then(function(response) {

            $scope.filteredCustomerList = response.data;
        });
    }

    $scope.editAcr = function(acrID) {
        $scope.disableAddress();

        var i = 0;

        for (i = 0; i < $scope.acrList.length; i++) {
            if ($scope.acrList[i].acrID == acrID) {

                $scope.acr.acrID = $scope.acrList[i].acrID;
                $scope.acr.from = $scope.acrList[i].from;
                $scope.acr.to = $scope.acrList[i].to;
                $scope.acr.company = $scope.acrList[i].companyName;
                $scope.acr.beBins = $scope.acrList[i].beBins;
                $scope.acr.acrBins = $scope.acrList[i].acrBins;

                if($scope.acrList[i].mon == 1){
                    document.getElementById("mon").checked = true;
                    $scope.acr.mon = true;
                }else{
                    document.getElementById("mon").checked = false;
                    $scope.acr.mon = false;
                }
                if($scope.acrList[i].tue == 1){
                    document.getElementById("tue").checked = true;
                    $scope.acr.tue = true;
                }else{
                    document.getElementById("tue").checked = false;
                    $scope.acr.tue = false;
                }
                if($scope.acrList[i].wed == 1){
                    document.getElementById("wed").checked = true;
                    $scope.acr.wed = true;
                }else{
                    document.getElementById("wed").checked = false;
                    $scope.acr.wed = false;
                }
                if($scope.acrList[i].thu == 1){
                    document.getElementById("thu").checked = true;
                    $scope.acr.thu = true;
                }else{
                    document.getElementById("thu").checked = false;
                    $scope.acr.thu = false;
                }
                if($scope.acrList[i].fri == 1){
                    document.getElementById("fri").checked = true;
                    $scope.acr.fri = true;
                }else{
                    document.getElementById("fri").checked = false;
                    $scope.acr.fri = false;
                }
                if($scope.acrList[i].sat == 1){
                    document.getElementById("sat").checked = true;
                    $scope.acr.sat = true;
                }else{
                    document.getElementById("sat").checked = false;
                    $scope.acr.sat = false;
                }

                $scope.acr.remarks = $scope.acrList[i].remarks;
            }
        }

    }

    $scope.saveAcr = function() {

        console.log($scope.acr.customerID);
        if($scope.acr.customerID != null || $scope.acr.from != null || $scope.acr.to != null){
            $http.post('/updateAcr', $scope.acr).then(function(response) {

                getAllDcs();
            });
    
            angular.element('#editAcr').modal('toggle');
        }else{
            window.alert("Please fill all fields."); 
        }
        
    }

    

});

app.controller('dcsDetailsController', function($scope, $http, $filter, storeDataService, $routeParams) {

    $scope.status = '';

    $scope.requestAuthorization = function() {
        sendFormForAuthorization($routeParams.dcsID, "dcs");
        $scope.status = 'PENDING';
    };

    $scope.confirm = function(request) {
        if (request == 'approve') {
            $scope.approveForm();
        } else if (request == 'reject') {
            $scope.rejectForm();
        }
    };

    $scope.approveForm = function() {
        $scope.status = 'APPROVED';
        approveForm($routeParams.dcsID, "dcs");

        angular.element('#approveConfirmation').modal('toggle');
    }

    $scope.rejectForm = function() {
        $scope.status = 'CORRECTION REQUIRED';
        rejectForm($routeParams.dcsID, "dcs");

 
        angular.element('#rejectConfirmation').modal('toggle');
    }




    $scope.pagination = angular.copy(storeDataService.pagination);
    $scope.pagination.itemsPerPage = 11;

    $scope.authorize = angular.copy(storeDataService.show.formAuthorization);
    $scope.show = angular.copy(storeDataService.show.dcsDetails);


    $scope.dcsDetailsList = [];
    $scope.dcs = [];
    $scope.customerList = [];
    $scope.filteredCustomerList = [];
    $scope.dcsID = {};
    $scope.editAddress = {};
    $scope.dcsID.id = $routeParams.dcsID;
    $scope.dcsEntry = {};
    $scope.areaList = {};
    

    $scope.test = {
        "id": "sdfs",
        "info": "info"
    }

    //$scope.initializeDcsDetails = function(){
    $scope.dcsDetails = {
            "dcsID": '',
            "acrID": '',
            "areaID": '',
            "customerID": '',
            "beBins": '',
            "acrBins": '',
            "mon": '',
            "tue": '',
            "wed": '',
            "thu": '',
            "fri": '',
            "sat": '',
            "remarks": ''
        }   


    $scope.editDcsEntry = function(acrID) {

        var i = 0;

        for (i = 0; i < $scope.dcsDetailsList.length; i++) {
            if ($scope.dcsDetailsList[i].acrID == acrID) {


                $scope.dcsEntry.acrID = $scope.dcsDetailsList[i].acrID
                $scope.dcsEntry.companyName = $scope.dcsDetailsList[i].companyName;
                $scope.filterAddress();
                $scope.dcsEntry.customerID = $scope.dcsDetailsList[i].customerID;
                $scope.dcsEntry.beBins = $scope.dcsDetailsList[i].beBins;
                $scope.dcsEntry.acrBins = $scope.dcsDetailsList[i].acrBins;

                if($scope.dcsDetailsList[i].mon == 1){
                    document.getElementById("mon").checked = true;
                    $scope.dcsEntry.mon = true;
                }else{
                    document.getElementById("mon").checked = false;
                    $scope.dcsEntry.mon = false;
                }
                if($scope.dcsDetailsList[i].tue == 1){
                    document.getElementById("tue").checked = true;
                    $scope.dcsEntry.tue = true;
                }else{
                    document.getElementById("tue").checked = false;
                    $scope.dcsEntry.tue = false;
                }
                if($scope.dcsDetailsList[i].wed == 1){
                    document.getElementById("wed").checked = true;
                    $scope.dcsEntry.wed = true;
                }else{
                    document.getElementById("wed").checked = false;
                    $scope.dcsEntry.wed = false;
                }
                if($scope.dcsDetailsList[i].thu == 1){
                    document.getElementById("thu").checked = true;
                    $scope.dcsEntry.thu = true;
                }else{
                    document.getElementById("thu").checked = false;
                    $scope.dcsEntry.thu = false;
                }
                if($scope.dcsDetailsList[i].fri == 1){
                    document.getElementById("fri").checked = true;
                    $scope.dcsEntry.fri = true;
                }else{
                    document.getElementById("fri").checked = false;
                    $scope.dcsEntry.fri = false;
                }
                if($scope.dcsDetailsList[i].sat == 1){
                    document.getElementById("sat").checked = true;
                    $scope.dcsEntry.sat = true;
                }else{
                    document.getElementById("sat").checked = false;
                    $scope.dcsEntry.sat = false;
                }

                $scope.dcsEntry.remarks = $scope.dcsDetailsList[i].remarks;

                console.log($scope.dcsDetailsList[i]); 
            }
        }

    }

    $scope.deleteDcsEntry = function(d,index) {
        
        $http.post('/deleteDcsEntry', d).then(function(response) {

            if (response.data.status === "success") {
                angular.element('body').overhang({
                    type: "danger",
                    "message": "DCS Entry deleted!"
                });

                $scope.dcsDetailsList.splice(index,1);
            };
        });
    }

    $scope.filterAddress = function() {

        console.log($scope.dcsEntry);
        $http.post('/filterAddress', $scope.dcsEntry).then(function(response) {

            $scope.filteredCustomerList = response.data;
        });
    }

    $scope.saveDcsEntry = function() {

        console.log($scope.dcsEntry.customerID);
        if($scope.dcsEntry.customerID != null){
            $http.post('/updateDcsEntry', $scope.dcsEntry).then(function(response) {

                $scope.getDcsDetails();
            });
    
            angular.element('#editDcsEntry').modal('toggle');
        }else{
            window.alert("Please select customer address"); 
        }
        
    }


    $scope.period = {};
    $scope.getDcsInfo = function() {
        $http.post('/getDcsInfo', $scope.dcsID).then(function(response) {
    
            $scope.dcs = response.data;
            console.log($scope.dcs); 
    
    
            if ($scope.dcs[0].status == 'G') {
                $scope.status = 'APPROVED';
            } else if ($scope.dcs[0].status == 'P') {
                $scope.status = 'PENDING';
            } else if ($scope.dcs[0].status == 'R') {
                $scope.status = 'CORRECTION REQUIRED';
            } else if ($scope.dcs[0].status == 'A') {
                $scope.status = 'ACTIVE';
            } else if ($scope.dcs[0].status == 'C') {
                $scope.status = 'COMPLETE';
                $scope.show.edit = 'I';
            }

            $scope.period.periodFrom = $scope.dcs[0].periodFrom;
            $scope.period.periodTo = $scope.dcs[0].periodTo;
            
        console.log($scope.period);

        $http.post('/getDcsDetails', $scope.period).then(function(response) {
 
            $scope.dcsDetailsList = response.data;
            console.log($scope.dcsDetailsList);

            $scope.totalItems = $scope.dcsDetailsList.length;
        });
            
        });

        
    }

    $scope.getDcsDetails = function() {
        $scope.getDcsInfo();

        $http.get('/getCustomerList', $scope.dcsID).then(function(response) {
            $scope.customerList = response.data;
        });

        $http.post('/getAreaList').then(function(response) {

            $scope.areaList = response.data;
        });

        
    }
 
    $scope.getDcsDetails();

    $scope.resetForm = function() {
        $scope.dcsEntry.companyName = '';
        $scope.dcsEntry.customerID = '';
        $scope.dcsEntry.beBins = '';
        $scope.dcsEntry.acrBins = '';
        $scope.dcsEntry.mon = '';
        $scope.dcsEntry.tue = '';
        $scope.dcsEntry.wed = '';
        $scope.dcsEntry.thu = '';
        $scope.dcsEntry.fri = '';
        $scope.dcsEntry.sat = '';
        $scope.dcsEntry.remarks = '';

        $scope.disableAddress();
    }

    

    $scope.addDcsEntry = function() {
        $scope.dcsEntry.dcsID = $routeParams.dcsID;

        $scope.dcsEntry.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');

        if($scope.dcsEntry.mon){
            $scope.dcsEntry.mon = 1;
        } else {
            $scope.dcsEntry.mon = 0;
        }

        if($scope.dcsEntry.tue){
            $scope.dcsEntry.tue = 1;
        } else {
            $scope.dcsEntry.tue = 0;
        }

        if($scope.dcsEntry.wed){
            $scope.dcsEntry.wed = 1;
        } else {
            $scope.dcsEntry.wed = 0;
        }

        if($scope.dcsEntry.thu){
            $scope.dcsEntry.thu = 1;
        } else {
            $scope.dcsEntry.thu = 0;
        }

        if($scope.dcsEntry.fri){
            $scope.dcsEntry.fri = 1;
        } else {
            $scope.dcsEntry.fri = 0;
        }

        if($scope.dcsEntry.sat){
            $scope.dcsEntry.sat = 1;
        } else {
            $scope.dcsEntry.sat = 0;
        }

        console.log("DCS ENTRY: " + $scope.dcsEntry.mon); 

        $http.post('/addDcsEntry', $scope.dcsEntry).then(function(response) {

            var returnedData = response.data;
  
            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "DCS Entry added successfully!"
                });
                

                //$scope.dcsDetailsList.push({ "acrID": returnedData.details.acrID, "companyName": $scope.dcsEntry.companyName, "address": returnedData.details.address, "beBins": $scope.dcsEntry.beBins, "acrBins": $scope.dcsEntry.acrBins, "areaCode": $scope.dcsEntry.areaCode, "mon": $scope.dcsEntry.mon, "tue": $scope.dcsEntry.tue, "wed": $scope.dcsEntry.wed, "thu": $scope.dcsEntry.thu, "fri": $scope.dcsEntry.fri, "sat": $scope.dcsEntry.sat, "remarks": $scope.dcsEntry.remarks });
                
                $scope.getDcsDetails(); //REFRESH DETAILS

                angular.element('#createDcsEntry').modal('toggle');
            }
        });
    }


});

app.controller('databaseBinController', function($scope, $http, $filter, storeDataService) {
    'use strict';
    var asc = true;
    $scope.areaList = [];
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8;
     //Record number each page
    $scope.maxSize = 10;


    $scope.databaseBin = {
        "date": '',
        "name": '',
        "icNo": '',
        "houseNo": '',
        "tmnkpg": '',
        "areaCode": '',
        "binSize": '',
        "address": '',
        "companyName": '',
        "customerID": '', 
        "areaID": '',
        "serialNo": '',
        "acrID": '',
        "activeStatus": '',
        "rcDwell": '',
        "comment": '',
        "itemType": '',
        "path": '' 
    };

    //Customer details
    $scope.initializeCustomer = function() {
        $scope.customer = {
            "customerID": '',
            "username": '',
            "password": '',
            "contactNumber": '',
            "ic": '',
            "tradingLicense": '',
            "name": '',
            "companyName": '',
            "houseNo": '',
            "streetNo": '',
            "tamanID": '',
            "postCode": '',
            "city": '',
            "status": '',
            "creationDateTime": ''
        };
    }

    //Bin details
    $scope.initializeBin = function() {
        $scope.bin = {
            "serialNo": '',
            "size": '',
            "status": '',
            "longitude": '',
            "latitude": '',
        };
    }

    //Taman details
    $scope.initializeTaman = function() {
        $scope.taman = {
            "tamanID": "",
            "areaID": "",
            "tamanName": "",
            "longitude": "",
            "latitude": "",
            "areaCollStatus": ""
        }
    }


    $scope.show = angular.copy(storeDataService.show.database);

    //Retrieve all taman entries and store them in tamanList
    $http.get('/getAllTaman').then(function(response) {
        $scope.tamanList = response.data;
        //console.log($scope.tamanList);
        //console.log("Hello from taman controller");
    })

    //Retrieve all Area entries and store them in areaList
    $http.get('/getAllArea').then(function(response) {
        $scope.areaList = response.data;
        console.log($scope.areaList);
        console.log("Hello from area controller");
    })

    //Retrieve all Customer entries and store them in customerList
    $http.get('/getAllCustomer').then(function(response) {
        $scope.customerList = response.data;
        //console.log($scope.customerList);
        //console.log("Hello from customer controller");
    })

    //Retrieve all Bin entries and store them in binList
    $http.get('/getAllBins').then(function(response) {
        $scope.binList = response.data;
        //console.log($scope.binList);
        //console.log("Hello from bin controller");
    })

    //Retrieve all ACR entries and store them in binList
    $http.get('/getAllAcr').then(function(response) {
        $scope.acrList = response.data;
        //console.log($scope.acrList);
        //console.log("Hello from acr controller");
    })

    $http.get('/getAllDatabaseBin').then(function(response) {

        $scope.databaseBinList = response.data;
        //console.log($scope.databaseBinList);
        storeDataService.databaseBin = angular.copy($scope.databaseBinList);
    });

    $scope.databaseBinList = [];
    $scope.customerList = [];
    $scope.tamanList = [];
    $scope.areaList = [];
    $scope.binList = [];
    $scope.acrList = [];


    //get bin size
    $scope.binSize = ['120L', '240L', '660L', '1000L'];

    $scope.addDatabaseBin = function() {
        // $scope.databaseBin.date = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        // console.log($scope.databaseBin);
        //console.log($scope.customer);


        //$scope.databaseBinList.push({"date": $scope.databaseBin.date, "name": $scope.databaseBin.name, "icNo": $scope.databaseBin.icNo, "serialNo": $scope.databaseBin.serialNo, "rcDwell": $scope.databaseBin.rcDwell, "houseNo": $scope.databaseBin.houseNo, "tmnKpg": $scope.databaseBin.tmnKpg, "areaCode": $scope.databaseBin.areaCode, "status": $scope.databaseBin.status, "comment": $scope.databaseBin.comment, "binSize": $scope.databaseBin.binSize, "address": $scope.databaseBin.address, "companyName": $scope.databaseBin.companyName, "acrfSerialNo": $scope.databaseBin.acrfSerialNo, "itemType": $scope.databaseBin.itemType, "path": $scope.databaseBin.path });
        //$scope.totalItems = $scope.filterDatabaseBinList.length;
        //console.log("Database Bin Created");
        //console.log($scope.databaseBinList);
        //console.log($scope.customer);


        //var query = "INSERT INTO table tblWheelBinDatabase (idNo, date, customerId, areaId, serialNo, acrId, activeStatus) value (" + null + ", \"" + $scope.databaseBin.date + "\", \"" + customerId + "\", \"" + $scope.databaseBin.areaCode + "\", \"" + $scope.databaseBin.acrfSerialNo + "\", " + "\"A\")";

        //console.log(query);
        $http.post('/addDatabaseBin', $scope.databaseBin).then(function(response) {
            //var returnedData = response.data;
            //var newBinID = returnedData.details.binID;

            $scope.notify(response.data.status, response.data.message);
            if (response.data.status === 'success') {
                angular.element('body').overhang({
                    type: "success",
                    "message": "New Entry added successfully!"
                });
                //console.log("Hello from addDatabaseBin serverside!");
                $scope.databaseBinList.push({ "date": $scope.databaseBin.date, "name": $scope.databaseBin.name, "icNo": $scope.databaseBin.ic, "serialNo": $scope.databaseBin.serialNo, "rcDwell": $scope.databaseBin.rcDwell, "houseNo": $scope.databaseBin.houseNo, "tmnKpg": $scope.databaseBin.tmnkpg, "areaCode": $scope.databaseBin.areaCode, "status": $scope.databaseBin.status, "comment": $scope.databaseBin.comment, "binSize": $scope.databaseBin.binSize, "address": concat($scope.databaseBin.houseNo, $scope.databaseBin.streetNo, $scope.databaseBin.tmgkpg), "companyName": $scope.databaseBin.companyName, "acrfSerialNo": $scope.databaseBin.acrID, "itemType": $scope.databaseBin.itemType, "path": $scope.databaseBin.path });
                //storeDataService.databaseBin = angular.copy($scope.databaseBinList);
                //$scope.filterDatabaseBinList = angular.copy($scope.databaseBinList);
                angular.element('#createDatabaseBin').modal('toggle');
                //$scope.totalItems = $scope.filterDatabaseBinList.length;
                $scope.initializeBinDatabase();
            }
        });
        /*$http.post('/addTaskAuthorization', today, ).then(function(response) {
            var returnedData = response.data;
            //var newBinID = returnedData.details.binID;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "New Bin added successfully!"
                });

                //log task
                var today = new Date();
                var staffId = window.sessionStorage.getItem('owner');
                var action = "add";
                var description = "Added New Bin to bin Database";
                var approvedBy = "null";
                var rowId = $scope.databaseBin.binId;

                query = "insert into tblLog (dateTime, staffId, action, description, approvedBy, rowId) values (\"" + today + "\", \"" + staffId + "\", \"" + action + "\", \"" + description + +"\", \"" + approvedBy + +"\", \"" + rowId + "\")";
                logTask(query);
                $scope.databaseBinList.push({ "date": $scope.databaseBin.date, "name": $scope.databaseBin.name, "icNo": $scope.databaseBin.icNo, "serialNo": $scope.databaseBin.serialNo, "rcDwell": $scope.databaseBin.rcDwell, "houseNo": $scope.databaseBin.houseNo, "tmnKpg": $scope.databaseBin.tmnKpg, "areaCode": $scope.databaseBin.areaCode, "status": $scope.databaseBin.status, "comment": $scope.databaseBin.comment, "binSize": $scope.databaseBin.binSize, "address": $scope.databaseBin.address, "companyName": $scope.databaseBin.companyName, "acrfSerialNo": $scope.databaseBin.acrfSerialNo, "itemType": $scope.databaseBin.itemType, "path": $scope.databaseBin.path });
                storeDataService.databaseBin = angular.copy($scope.databaseBinList);
                $scope.filterDatabaseBinList = angular.copy($scope.databaseBinList);
                angular.element('#createDatabaseBin').modal('toggle');
                $scope.totalItems = $scope.filterDatabaseBinList.length;

                $scope.initializeBinDatabase();
            }
        });*/

        // $http.post('/addDatabaseBin', $scope.databaseBin).then(function (response) {
        //     var returnedData = response.data;
        //     //var newBinID = returnedData.details.binID;

        //     if (returnedData.status === "success") {
        //         angular.element('body').overhang({
        //             type: "success",
        //             "message": "New Bin added successfully!"
        //         });
        //         $scope.databaseBinList.push({"date": $scope.databaseBin.date, "name": $scope.databaseBin.name, "icNo": $scope.databaseBin.icNo, "serialNo": $scope.databaseBin.serialNo, "rcDwell": $scope.databaseBin.rcDwell, "houseNo": $scope.databaseBin.houseNo, "tmnKpg": $scope.databaseBin.tmnKpg, "areaCode": $scope.databaseBin.areaCode, "status": $scope.databaseBin.status, "comment": $scope.databaseBin.comment, "binSize": $scope.databaseBin.binSize, "address": $scope.databaseBin.address, "companyName": $scope.databaseBin.companyName, "acrfSerialNo": $scope.databaseBin.acrfSerialNo, "itemType": $scope.databaseBin.itemType, "path": $scope.databaseBin.path });
        //         storeDataService.databaseBin = angular.copy($scope.databaseBinList);
        //         $scope.filterDatabaseBinList = angular.copy($scope.databaseBinList);
        //         angular.element('#createDatabaseBin').modal('toggle');
        //         $scope.totalItems = $scope.filterDatabaseBinList.length;
        //     }
        // });
    }

    // Adds new customer to the customer database
    $scope.addCustomer = function() {
        //console.log($scope.customer.tamanID);
        //console.log("Customer Created");
        $scope.customer.creationDateTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');

        //$scope.customer.customerID = f.makeID('customer',$filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'));
        //console.log($scope.customer.customeriD);
        //console.log($scope.customer);

        $http.post('/addCustomer', $scope.customer).then(function(response) {
            //var returnedData = response.data;
            //var newBinID = returnedData.details.binID;

            $scope.notify(response.data.status, response.data.message);
            //console.log("Hello 1");
            if (response.data.status === 'success') {
                angular.element('body').overhang({
                    type: "success",
                    "message": "New Customer added successfully!"
                });
                //console.log("Hello from addCustomer serverside!");
                $scope.customerList.push({ "name": $scope.customer.name, "ic": $scope.customer.ic, "companyName": $scope.customer.companyName });
                //storeDataService.databaseBin = angular.copy($scope.databaseBinList);
                //$scope.filterDatabaseBinList = angular.copy($scope.databaseBinList);
                angular.element('#createCustomer').modal('toggle');
                //$scope.totalItems = $scope.filterDatabaseBinList.length;
                $scope.initializeCustomer();
            }
        });

    }

    //Adds new bin to the database
    $scope.addBin = function() {
        //console.log($scope.customer.tamanID);
        //console.log("Bin Created");
        //console.log($scope.customer);

        $http.post('/addBin', $scope.bin).then(function(response) {
            //var returnedData = response.data;
            //var newBinID = returnedData.details.binID;

            $scope.notify(response.data.status, response.data.message);
            if (response.data.status === 'success') {
                angular.element('body').overhang({
                    type: "success",
                    "message": "New Bin added successfully!"
                });
                //console.log("Hello from addBin serverside!");
                $scope.binList.push({ "serialNo": $scope.bin.serialNo });
                //storeDataService.databaseBin = angular.copy($scope.databaseBinList);
                //$scope.filterDatabaseBinList = angular.copy($scope.databaseBinList);
                angular.element('#createBin').modal('toggle');
                //$scope.totalItems = $scope.filterDatabaseBinList.length;
                $scope.initializeBin();
            }
        });

    }

    //Adds new Taman to the database
    $scope.addTaman = function() {
        //console.log($scope.customer.tamanID);
        //console.log("Taman Created");
        //console.log($scope.taman);

        $http.post('/addTaman', $scope.taman).then(function(response) {
            //var returnedData = response.data;
            //var newBinID = returnedData.details.binID;

            $scope.notify(response.data.status, response.data.message);
            if (response.data.status === 'success') {
                angular.element('body').overhang({
                    type: "success",
                    "message": "New Taman added successfully!"
                });
                //console.log("Hello from addTaman serverside!");
                $scope.tamanList.push({ "tamanName": $scope.taman.tamanName });
                //storeDataService.databaseBin = angular.copy($scope.databaseBinList);
                //$scope.filterDatabaseBinList = angular.copy($scope.databaseBinList);
                angular.element('#createTaman').modal('toggle');
                //$scope.totalItems = $scope.filterDatabaseBinList.length;
                $scope.initializeTaman();
            }
        });

    }

    $scope.orderBy = function(property) {
        $scope.databaseBinList = $filter('orderBy')($scope.databaseBinList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };

    $scope.date = $scope.date || {
        from: '1900-01-01',
        to: '3000-01-01'
    };

    $(function() {
        var start = moment().subtract(7, 'days');
        var end = moment();

        function putRange(start, end) {
            $('#databaserange span').html(start.format('MMM D, YYYY') + ' - ' + end.format('MMM D, YYYY'));
        }

        $('#databaserange').daterangepicker({
            startDate: start,
            endDate: end,
            opens: 'right'
        }, function(start, end, label) {
            putRange(start, end);
            $scope.date.from = start.format('YYYY-MM-DD');
            $scope.date.to = end.format('YYYY-MM-DD');
            //console.log($scope.date.from + ' ' + $scope.date.to);

        });
        putRange(start, end);
    });



});
app.filter("dateFilter", function() {
    return function(binDatabase, dateFrom, dateTo) {
        var filtered = [];

        var from_date = Date.parse(dateFrom);
        var to_date = Date.parse(dateTo) + 86400000;


        angular.forEach(binDatabase, function(bin) {
            if (Date.parse(bin.date) > from_date && Date.parse(bin.date) < to_date) {
                filtered.push(bin);
            }
        });
        return filtered;
    };
});
app.filter("yearMonthFilter", function() {
    return function(inventoryRecordList, yearMonth) {
        var filtered = [];

        var strYearMonth = yearMonth.split("-");

        var year = strYearMonth[0];
        var month = strYearMonth[1];

        var fromDate = new Date(year, month - 1, 1);
        var toDate = new Date(year, month, 1);

        var from_Date = Date.parse(fromDate);
        var to_Date = Date.parse(toDate);

        angular.forEach(inventoryRecordList, function(bin) {
            if (Date.parse(bin.date) >= from_Date && Date.parse(bin.date) < to_Date) {
                filtered.push(bin);
            }
        });

        return filtered;
    };
});

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('');
}

function formatDateDash(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

app.controller('inventoryBinController', function($scope, $http, $filter, storeDataService) {
    'use strict';
    var asc = true;
    $scope.areaList = [];
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;

    var today = formatDate(new Date());

    //ng-csv
    $scope.separator = ",";
    $scope.decimalSeparator = ".";
    $scope.filename = today + "_wheelstock.csv"
    $scope.getDataHeader = function() {
        return ["Date", "DO No", "New 120 IN", "New 240 IN", "New 660 IN", "New 1000 IN", "New 120 Out", "New 240 Out", "New 660 Out", "New 1000 Out", "Reusable 120 IN", "Reusable 240 IN", "Reusable 660 IN", "Reusable 1000 IN", "Reusable 120 Out", "Reusable 240 Out", "Reusable 660 Out", "Reusable 1000 Out", "New 120 Balance", "New 240 Balance", "New 660 Balance", "New 1000 Balance", "Reusable 120 Balance", "Reusable 240 Balance", "Reusable 660 Balance", "Reusable 1000 Balance"];
    }


    $scope.yearMonths = [];
    $scope.stock = $scope.stock || {
        new120: 0,
        new240: 0,
        new660: 0,
        new1000: 0,
        reusable120: 0,
        reusable240: 0,
        reusable660: 0,
        reusable1000: 0,
        overall120: 0,
        overall240: 0,
        overall660: 0,
        overall1000: 0
    };

    $scope.inventoryRecord = {
        "date": '',
        "doNo": '',

        "inNew120": 0,
        "inNew240": 0,
        "inNew660": 0,
        "inNew1000": 0,
        "outNew120": 0,
        "outNew240": 0,
        "outNew660": 0,
        "outNew1000": 0,

        "inReusable120": 0,
        "inReusable240": 0,
        "inReusable660": 0,
        "inReusable1000": 0,
        "outReusable120": 0,
        "outReusable240": 0,
        "outReusable660": 0,
        "outReusable1000": 0,

        "newBalance120": 0,
        "newBalance240": 0,
        "newBalance660": 0,
        "newBalance1000": 0,
        "reusableBalance120": 0,
        "reusableBalance240": 0,
        "reusableBalance660": 0,
        "reusableBalance1000": 0,
        "overallBalance120": 0,
        "overallBalance240": 0,
        "overallBalance660": 0,
        "overallBalance1000": 0
    };



    $scope.show = angular.copy(storeDataService.show.inventory);





    $scope.calculateBalance = function(date) {

        var i = 0;

        //Check if record is first record in Database
        if ($scope.getRecordIndex(date) !== 0) {

            for (i = $scope.getRecordIndex(date); i < $scope.inventoryRecordList.length; i++) {

                //Calculate Daily New Bin Balance
                $scope.inventoryRecordList[i].newBalance120 = parseInt($scope.inventoryRecordList[i - 1].newBalance120) + parseInt($scope.inventoryRecordList[i].inNew120) - parseInt($scope.inventoryRecordList[i].outNew120);
                $scope.inventoryRecordList[i].newBalance240 = parseInt($scope.inventoryRecordList[i - 1].newBalance240) + parseInt($scope.inventoryRecordList[i].inNew240) - parseInt($scope.inventoryRecordList[i].outNew240);
                $scope.inventoryRecordList[i].newBalance660 = parseInt($scope.inventoryRecordList[i - 1].newBalance660) + parseInt($scope.inventoryRecordList[i].inNew660) - parseInt($scope.inventoryRecordList[i].outNew660);
                $scope.inventoryRecordList[i].newBalance1000 = parseInt($scope.inventoryRecordList[i - 1].newBalance1000) + parseInt($scope.inventoryRecordList[i].inNew1000) - parseInt($scope.inventoryRecordList[i].outNew1000);

                //Calculate Daily Reusable Bin Balance
                $scope.inventoryRecordList[i].reusableBalance120 = parseInt($scope.inventoryRecordList[i - 1].reusableBalance120) + parseInt($scope.inventoryRecordList[i].inReusable120) - parseInt($scope.inventoryRecordList[i].outReusable120);
                $scope.inventoryRecordList[i].reusableBalance240 = parseInt($scope.inventoryRecordList[i - 1].reusableBalance240) + parseInt($scope.inventoryRecordList[i].inReusable240) - parseInt($scope.inventoryRecordList[i].outReusable240);
                $scope.inventoryRecordList[i].reusableBalance660 = parseInt($scope.inventoryRecordList[i - 1].reusableBalance660) + parseInt($scope.inventoryRecordList[i].inReusable660) - parseInt($scope.inventoryRecordList[i].outReusable660);
                $scope.inventoryRecordList[i].reusableBalance1000 = parseInt($scope.inventoryRecordList[i - 1].reusableBalance1000) + parseInt($scope.inventoryRecordList[i].inReusable1000) - parseInt($scope.inventoryRecordList[i].outReusable1000);
            }


        } else {
            $scope.inventoryRecordList[$scope.getRecordIndex(date)].newBalance120 = parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].inNew120) - parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].outNew120);
            $scope.inventoryRecordList[$scope.getRecordIndex(date)].newBalance240 = parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].inNew240) - parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].outNew240);
            $scope.inventoryRecordList[$scope.getRecordIndex(date)].newBalance660 = parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].inNew660) - parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].outNew660);
            $scope.inventoryRecordList[$scope.getRecordIndex(date)].newBalance1000 = parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].inNew1000) - parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].outNew1000);

            $scope.inventoryRecordList[$scope.getRecordIndex(date)].reusableBalance120 = parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].inReusable120) - parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].outReusable120);
            $scope.inventoryRecordList[$scope.getRecordIndex(date)].reusableBalance240 = parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].inReusable240) - parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].outReusable240);
            $scope.inventoryRecordList[$scope.getRecordIndex(date)].reusableBalance660 = parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].inReusable660) - parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].outReusable660);
            $scope.inventoryRecordList[$scope.getRecordIndex(date)].reusableBalance1000 = parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].inReusable1000) - parseInt($scope.inventoryRecordList[$scope.getRecordIndex(date)].outReusable1000);

            for (i = $scope.getRecordIndex(date) + 1; i < $scope.inventoryRecordList.length; i++) {

                //Calculate Daily New Bin Balance
                $scope.inventoryRecordList[i].newBalance120 = parseInt($scope.inventoryRecordList[i - 1].newBalance120) + parseInt($scope.inventoryRecordList[i].inNew120) - parseInt($scope.inventoryRecordList[i].outNew120);
                $scope.inventoryRecordList[i].newBalance240 = parseInt($scope.inventoryRecordList[i - 1].newBalance240) + parseInt($scope.inventoryRecordList[i].inNew240) - parseInt($scope.inventoryRecordList[i].outNew240);
                $scope.inventoryRecordList[i].newBalance660 = parseInt($scope.inventoryRecordList[i - 1].newBalance660) + parseInt($scope.inventoryRecordList[i].inNew660) - parseInt($scope.inventoryRecordList[i].outNew660);
                $scope.inventoryRecordList[i].newBalance1000 = parseInt($scope.inventoryRecordList[i - 1].newBalance1000) + parseInt($scope.inventoryRecordList[i].inNew1000) - parseInt($scope.inventoryRecordList[i].outNew1000);

                //Calculate Daily Reusable Bin Balance
                $scope.inventoryRecordList[i].reusableBalance120 = parseInt($scope.inventoryRecordList[i - 1].reusableBalance120) + parseInt($scope.inventoryRecordList[i].inReusable120) - parseInt($scope.inventoryRecordList[i].outReusable120);
                $scope.inventoryRecordList[i].reusableBalance240 = parseInt($scope.inventoryRecordList[i - 1].reusableBalance240) + parseInt($scope.inventoryRecordList[i].inReusable240) - parseInt($scope.inventoryRecordList[i].outReusable240);
                $scope.inventoryRecordList[i].reusableBalance660 = parseInt($scope.inventoryRecordList[i - 1].reusableBalance660) + parseInt($scope.inventoryRecordList[i].inReusable660) - parseInt($scope.inventoryRecordList[i].outReusable660);
                $scope.inventoryRecordList[i].reusableBalance1000 = parseInt($scope.inventoryRecordList[i - 1].reusableBalance1000) + parseInt($scope.inventoryRecordList[i].inReusable1000) - parseInt($scope.inventoryRecordList[i].outReusable1000);
            }
        }

        $scope.calculateStock();
    }

    $scope.calculateStock = function() {
        $scope.calculateNewStock();
        $scope.calculateReusableStock();
        $scope.calculateOverallStock();
    };

    //CALCULATE STOCK
    $scope.calculateOverallStock = function() {
        $scope.stock.overall120 = 0;
        $scope.stock.overall240 = 0;
        $scope.stock.overall660 = 0;
        $scope.stock.overall1000 = 0;

        //Calculate Overall Stock
        $scope.stock.overall120 = $scope.stock.new120 + $scope.stock.reusable120;
        $scope.stock.overall240 = $scope.stock.new240 + $scope.stock.reusable240;
        $scope.stock.overall660 = $scope.stock.new660 + $scope.stock.reusable660;
        $scope.stock.overall1000 = $scope.stock.new1000 + $scope.stock.reusable1000;
    };

    $scope.calculateReusableStock = function() {
        $scope.stock.reusable120 = 0;
        $scope.stock.reusable240 = 0;
        $scope.stock.reusable660 = 0;
        $scope.stock.reusable1000 = 0;

        var i = 0;
        for (i = 0; i < $scope.inventoryRecordList.length; i++) {

            //Calculate Reusable Stock
            $scope.stock.reusable120 += parseInt($scope.inventoryRecordList[i].inReusable120);
            $scope.stock.reusable120 -= parseInt($scope.inventoryRecordList[i].outReusable120);

            $scope.stock.reusable240 += parseInt($scope.inventoryRecordList[i].inReusable240);
            $scope.stock.reusable240 -= parseInt($scope.inventoryRecordList[i].outReusable240);

            $scope.stock.reusable660 += parseInt($scope.inventoryRecordList[i].inReusable660);
            $scope.stock.reusable660 -= parseInt($scope.inventoryRecordList[i].outReusable660);

            $scope.stock.reusable1000 += parseInt($scope.inventoryRecordList[i].inReusable1000);
            $scope.stock.reusable1000 -= parseInt($scope.inventoryRecordList[i].outReusable1000);
        }
    };

    $scope.calculateNewStock = function() {
        $scope.stock.new120 = 0;
        $scope.stock.new240 = 0;
        $scope.stock.new660 = 0;
        $scope.stock.new1000 = 0;


        var i = 0;
        for (i = 0; i < $scope.inventoryRecordList.length; i++) {

            //Calculate New Stock
            $scope.stock.new120 += parseInt($scope.inventoryRecordList[i].inNew120);
            $scope.stock.new120 -= parseInt($scope.inventoryRecordList[i].outNew120);

            $scope.stock.new240 += parseInt($scope.inventoryRecordList[i].inNew240);
            $scope.stock.new240 -= parseInt($scope.inventoryRecordList[i].outNew240);

            $scope.stock.new660 += parseInt($scope.inventoryRecordList[i].inNew660);
            $scope.stock.new660 -= parseInt($scope.inventoryRecordList[i].outNew660);

            $scope.stock.new1000 += parseInt($scope.inventoryRecordList[i].inNew1000);
            $scope.stock.new1000 -= parseInt($scope.inventoryRecordList[i].outNew1000);
        }
    };

    /*Get index of inventoryRecordList record based on date*/
    $scope.getRecordIndex = function(date) {
        var i = 0;
        for (i = 0; i < $scope.inventoryRecordList.length; i++) {
            if ($scope.inventoryRecordList[i].date == date) {
                return i;
            }
        }
    };

    function getMonthNum(monthname) {
        var month = months.indexOf(monthname);
        return month + 1;

        // ? month + 1 : 0
    }

    var months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May',
        'Jun', 'Jul', 'Aug', 'Sep',
        'Oct', 'Nov', 'Dec'
    ];

    $http.get('/getAllInventoryRecords').then(function(response) {
        $scope.inventoryRecordList = response.data;
        storeDataService.inventoryRecord = angular.copy($scope.inventoryRecord);

        // $scope.searchDatabaseBin = function (bin) {
        //     return (bin.id + bin.name + bin.location + bin.status).toUpperCase().indexOf($scope.searchBinFilter.toUpperCase()) >= 0;
        // };

        $scope.filterInventoryRecordList = angular.copy($scope.inventoryRecordList);

        $scope.totalItems = $scope.filterInventoryRecordList.length;

        $scope.getData = function() {
            return $filter('filter')($scope.filterNewMgbList, $scope.searchNewMgbFilter);
        };

        $scope.$watch('searchDatabaseBinFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);


        var date = new Date();

        var firstDate = Date.parse($scope.inventoryRecordList[0].date);
        var startMonth = getMonthNum(new Date(firstDate).toString().split(" ")[1]);
        var startYear = new Date(firstDate).toString().split(" ")[3];

        var lastDate = Date.parse($scope.inventoryRecordList[$scope.inventoryRecordList.length - 1].date);
        var endMonth = getMonthNum(new Date(lastDate).toString().split(" ")[1]);
        var endYear = new Date(lastDate).toString().split(" ")[3];

        var startDate = "'" + startYear + "-" + startMonth + "-01'";
        var endDate = "'" + endYear + "-" + endMonth + "-01'";

        //TEST DATA
        // var endMonth = '9';
        // var endYear = '2021';
        // var endDate = "2020-04-30";

        // var i, j = 0;

        $scope.yearMonths.length = 0;

        if ((endYear - startYear) == 0) {
            for (var k = startMonth; k < Number(endMonth) + 1; k++) {

                if (k < 10) {
                    $scope.yearMonths.push("" + startYear + "-0" + k + "-" + "01");
                } else {
                    $scope.yearMonths.push("" + startYear + "-" + k + "-" + "01");
                }
            }
        } else {
            for (var x = startMonth; x < 13; x++) {
                console.log(startYear + '-' + x + '-' + '01');

                if (x < 10) {

                    $scope.yearMonths.push("" + startYear + "-0" + x + "-" + "01");
                } else {

                    $scope.yearMonths.push("" + startYear + "-" + x + "-" + "01");
                }
            }

            for (var i = Number(startYear) + 1; i < Number(endYear); i++) {

                for (var j = 1; j < 13; j++) {
                    console.log(i + '-' + j + '-' + '01');

                    if (j < 10) {

                        $scope.yearMonths.push("" + i + "-0" + j + "-" + "01");
                    } else {

                        $scope.yearMonths.push("" + i + "-" + j + "-" + "01");
                    }
                }
            }

            for (var y = 1; y < Number(endMonth) + 1; y++) {
                console.log(endYear + '-' + y + '-' + '01');

                if (y < 10) {

                    $scope.yearMonths.push("" + endYear + "-0" + y + "-" + "01");
                } else {

                    $scope.yearMonths.push("" + endYear + "-" + y + "-" + "01");
                }
            }

        }


        $scope.calculateBalance($scope.inventoryRecordList[0].date);
        $scope.calculateStock();

        $scope.yearMonth = startMonth;
    });




    var headers = {
        doNo: 'DO No.',
        date: 'Date',
        inNew120: 'New 120L In',
        inNew240: 'New 240L In',
        inNew660: 'New 660L In',
        inNew1000: 'New 1000L In',
        inReusable120: 'Reusable 120L In',
        inReusable240: 'Reusable 240L In',
        inReusable660: 'Reusable 660L In',
        inReusable1000: 'Reusable 1000L In',
        outNew120: 'New 120L Out',
        outNew240: 'New 240L Out',
        outNew660: 'New 660L Out',
        outNew1000: 'New 1000L Out',
        outReusable120: 'Reusable 120L Out',
        outReusable240: 'Reusable 240L Out',
        outReusable660: 'Reusable 660L Out',
        outReusable1000: 'Reusable 1000L Out',
        newBalance120: 'New 120L Balance',
        newBalance240: 'New 240L Balance',
        newBalance660: 'New 660L Balance',
        newBalance1000: 'New 1000L Balance',
        reusableBalance120: 'Reusable 120L Balance',
        reusableBalance240: 'Reusable 240L Balance',
        reusableBalance660: 'Reusable 660L Balance',
        reusableBalance1000: 'Reusable 1000L Balance',
        overallBalance120: 'Overall 120L balance',
        overallBalance240: 'Overall 240L balance',
        overallBalance660: 'Overall 660L balance',
        overallBalance1000: 'Overall 1000L balance'
    };

    var itemsFormatted = $scope.inventoryRecordList;

    var itemsFormatted = [];

    // format the data
    // itemsNotFormatted.forEach((item) => {
    //     itemsFormatted.push({
    //         doNo: item.doNo,
    //         date: item.date,
    //         inNew120: item.inNew120,
    //         inNew240: item.inNew240,
    //         inNew660: item.inNew660,
    //         inNew1000: item.inNew1000,
    //         inReusable120: item.inReusable120,
    //         inReusable240: item.inReusable240,
    //         inReusable660: item.inReusable660,
    //         inReusable1000: item.inReusable1000,
    //         outNew120: item.outNew120,
    //         outNew240: item.outNew240,
    //         outNew660: item.outNew660,
    //         outNew1000: item.outNew1000,
    //         outReusable120: item.outReusable120,
    //         outReusable240: item.outReusable240,
    //         outReusable660: item.outReusable660,
    //         outReusable1000: item.outReusable1000,
    //         newBalance120: item.newBalance120,
    //         newBalance240: item.newBalance240,
    //         newBalance660: item.newBalance660,
    //         newBalance1000: item.newBalance1000,
    //         reusableBalance120: item.reusableBalance120,
    //         reusableBalance240: item.reusableBalance240,
    //         reusableBalance660: item.reusableBalance660,
    //         reusableBalance1000: item.reusableBalance1000,
    //         overallBalance120: item.overallBalance120,
    //         overallBalance240: item.overallBalance240,
    //         overallBalance660: item.overallBalance660,
    //         overallBalance1000: item.overallBalance1000
    //     });
    // });

    var fileTitle = 'wheelstock'; // or 'my-unique-title'

    $scope.exportCSVFile = function() {
        exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download

    }


});

function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

app.controller('taskAuthorizationController', function($scope, $window, $http, $filter, storeDataService) {
    'use strict';
    $http.get('/getAllTasks').then(function(response) {
        storeDataService.task = angular.copy(response.data);
        $scope.taskList = response.data;
    });

    $scope.approveTask = function(taskId, query) {
        $scope.task = {
            "id": taskId,
            "query": query,
            "approvedBy": $window.sessionStorage.getItem('owner')
        }

        $http.post('/approveTask', $scope.task).then(function(response) {
            var data = response.data;
            angular.element('body').overhang({
                type: data.status,
                "message": data.message
            });
            $scope.notify(data.status, data.message);

            socket.emit('create new user');
        });
        $http.get('/getAllTasks').then(function(response) {
            storeDataService.task = angular.copy(response.data);
            $scope.taskList = response.data;
        });

    }

    $scope.rejectTask = function(taskId) {
        $scope.taskId = {
            "id": taskId,
            "rejectedBy": $window.sessionStorage.getItem('owner')
        }
        $http.post('/rejectTask', $scope.taskId).then(function(response) {

            console.log(response.data);
        });

        $http.get('/getAllTasks').then(function(response) {
            storeDataService.task = angular.copy(response.data);
            $scope.taskList = response.data;
        });
    }
    var asc = true;
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 8; //Record number each page
    $scope.maxSize = 10; //Show the number in page


    $scope.show = angular.copy(storeDataService.show.authorization);



    $scope.orderBy = function(property) {
        $scope.taskList = $filter('orderBy')($scope.taskList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('formAuthorizationController', function($scope, $window, $http, $filter, storeDataService) {
    'use strict';

    $scope.getForm = function(formID, formType) {

        if (formType == 'dcs') {
            window.location.href = '#/dcs-details/' + formID;
        } else {
            window.location.href = '#/' + formType + '-details/' + formID;
        }
    }

    $http.get('/getAllForms').then(function(response) {
        // storeDataService.task = angular.copy(response.data);
        $scope.formList = response.data;

        console.log($scope.formList);

        for (var i = 0; i < $scope.formList.length; i++) {
            $scope.formList[i].formType = $scope.formList[i].formID.match(/[a-zA-Z]+/g)[0].toLowerCase();
        }
    });


    var asc = true;
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 8; //Record number each page
    $scope.maxSize = 10; //Show the number in page


    $scope.show = angular.copy(storeDataService.show.formAuthorization);



    $scope.orderBy = function(property) {
        $scope.taskList = $filter('orderBy')($scope.taskList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('complaintController', function($scope, $http, $filter, $window, storeDataService) {
    'use strict';
    var asc = true;
    $scope.complaintList = [];
    $scope.complaintLocList = [];
    //pagination
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 3; //Record number each page
    $scope.maxSize = 8; //Show the number in page

    $http.get('/getComplaintList').then(function(response) {
        $scope.searchComplaintFilter = '';
        $scope.filterComplaintList = [];
        $scope.complaintList = response.data;

        for (var i = 0; i < $scope.complaintList.length; i++) {
            $scope.complaintList[i].date = $filter('date')($scope.complaintList[i].date, 'yyyy-MM-dd');
        }

        $scope.filterComplaintList = angular.copy($scope.complaintList);

        $scope.searchComplaint = function(complaint) {
            return (complaint.date + complaint.title + complaint.customer + complaint.type + complaint.code).toUpperCase().indexOf($scope.searchComplaintFilter.toUpperCase()) >= 0;
        }

        $scope.totalItems = $scope.filterComplaintList.length;

        $scope.getData = function() {
            return $filter('filter')($scope.filterComplaintList, $scope.searchComplaintFilter);

            $scope.$watch('searchComplaintFilter', function(newVal, oldVal) {
                var vm = this;
                if (oldVal !== newVal) {
                    $scope.currentPage = 1;
                    $scope.totalItems = $scope.getData().length;
                }
                return vm;
            }, true);

        }

        $scope.showbadge = "{'badge badge-danger': c.status == 'Pending', 'badge badge-warning': c.status == 'In progress', 'badge badge-primary': c.status == 'Confirmation', 'badge badge-success': c.status == 'Done'}";
    });

    $scope.complaintDetail = function(complaintCode) {
        window.location.href = '#/complaint-detail/' + complaintCode;

    };

    var $googleMap = document.getElementById('googleMap');

    var visualizeMap = {
        center: new google.maps.LatLng(1.5503052, 110.3394602),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false,
        disableDefaultUI: true,
        editable: false,
        zoom: 13
    };

    var map = new google.maps.Map($googleMap, visualizeMap);

    $http.get('/getComplaintLoc').then(function(response) {
        $scope.complaintLocList = response.data
        var myLatLng = [];
        var marker = [];
        var complaintInfo = [];
        //        
        //        for(var i =0; i <$scope.complaintLocList.length; i++){
        //        
        //            myLatLng[i] = {lat: $scope.complaintLocList[i].latitude, lng: $scope.complaintLocList[i].longitude};
        //
        //            marker[i] = new google.maps.Marker({
        //                position: myLatLng[i],
        //                title: $scope.complaintLocList.area
        //            });
        //
        //            marker[i].setMap(map);
        //
        //        }
        console.log($scope.complaintLocList);
        $.each($scope.complaintLocList, function(index, value) {
            myLatLng[index] = { lat: value.latitude, lng: value.longitude };

            value.date = $filter('date')(value.date, 'yyyy-MM-dd');

            complaintInfo[index] = value.customer + ',' + value.date + ',' + value.code + '-' + value.taman + ',' + 'View Detail.'.link('#/complaint-detail/' + value.complaintID);

            marker[index] = new google.maps.Marker({
                position: myLatLng[index],
                title: value.area
            });

            marker[index].setMap(map);

            marker[index].addListener('click', function() {
                var infowindow = new google.maps.InfoWindow({
                    content: complaintInfo[index]
                });
                infowindow.open(marker[index].get('map'), marker[index]);

            });
        });
    });

    $scope.orderBy = function(property) {
        $scope.complaintList = $filter('orderBy')($scope.complaintList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };



});
//complaint detail controller
app.controller('complaintDetailController', function($scope, $http, $filter, $window, $routeParams) {
    'use strict';
    $scope.showUpdateBtn = true;
    $scope.req = {
        'id': $routeParams.complaintCode
    };
    $scope.message = {
        "id": $routeParams.complaintCode,
        "content": '',
        "sender": window.sessionStorage.getItem('owner')
    };
    var chatContent = '';

    $scope.emailobj = {
        "id": "",
        "status": "",
        "subject": "",
        "text": "",
        "email": "lshong9899@gmail.com"
    };

    //get complaint detail refers on complaint id
    $http.post('/getComplaintDetail', $scope.req).then(function(response) {
        var complaint = response.data;
        $scope.comDetail = {
            'ctype': complaint[0].premiseType,
            'title': complaint[0].complaint,
            'content': complaint[0].remarks,
            'date': $filter('date')(complaint[0].complaintDate, 'medium'),
            'customer': complaint[0].name,
            'address': complaint[0].address,
            'areaID': complaint[0].areaID,
            'area': complaint[0].areaName,
            'status': complaint[0].status,
            'code': complaint[0].code,
            'id': complaint[0].complaintID
        };

        //get report dates for certain area id
        $scope.reportList = [];
        $scope.req2 = {
            'id': $scope.comDetail.areaID
        };
        $http.post('/getDateListForComplaint', $scope.req2).then(function(response) {
            $scope.reportList = response.data;
            $scope.showReference = ($scope.reportList.length == 0 ? false : true);
        });

        $scope.sendMessage = function() {
            $scope.message.content = $scope.mymsg;
            $http.post('/messageSend', $scope.message).then(function(response) {
                chatContent += '<div class="message right"><div class="message-text">' + $scope.message.content + '<div class="message-time text-right"><small class="text-muted"><i class="fa fa-clock"></i> ' + $filter('date')(new Date(), 'HH:mm') + '</small></div></div></div>';
                angular.element('.chat-box').html(chatContent);
            });
        };

        $http.post('/chatList', $scope.req).then(function(response) {
            var data = response.data;
            var position = '';

            $.each(data, function(key, value) {
                position = window.sessionStorage.getItem('owner') === value.sender ? "right" : "left";

                chatContent += '<div class="message ' + position + '"><div class="message-text">' + value.content + '<div class="message-time text-right"><small class="text-muted"><i class="fa fa-clock"></i> ' + value.date + '</small></div></div></div>';
            });
            angular.element('.chat-box').html(chatContent);
        });

        socket.on('new message', function (data) {
            var content = data.content,
                sender = data.sender,
                recipient = data.recipient,
                date = data.date;

            chatContent += '<div class="message left"><div class="message-text">' + $scope.message.content + '<div class="message-time text-right"><small class="text-muted"><i class="fa fa-clock"></i> ' + $filter('date')(new Date(), 'HH:mm') + '</small></div></div></div>';
            angular.element('.chat-box').html(chatContent);
        });


        //initialize email subject and text
        $scope.emailobj.id = $routeParams.complaintCode;
        if ($scope.comDetail.status == "Pending") {
            $scope.emailobj.subject = "Complaint received.";
            $scope.emailobj.text = "Your complaint has been received and pending for review. \nThank You. \n(Please wait patiently and do not reply to this email). ";
        } else if ($scope.comDetail.status == "In progress") {
            $scope.emailobj.subject = "";
            $scope.emailobj.text = "";
        } else if ($scope.comDetail.status == "Confirmation") {
            $scope.emailobj.subject = "Problem Solved.";
            $scope.emailobj.text = "This will send an confirmation email to customer, in order to inform customer the current problem has been solved. (After email sent, this complaint will count as complete and cannot be moved back.)";
        } else if ($scope.comDetail.status == "Done") {
            $scope.emailobj.subject = "";
            $scope.emailobj.text = "";
        }

        $scope.updateStatus = function() {
            $scope.showUpdateBtn = false;
            $http.post('/updateComplaintStatus', $scope.comDetail).then(function(response) {
                if(response.data.status = "success"){
                    $scope.notify("success","Status Has Been Updated");
                    $scope.showUpdateBtn = true;
                }else{
                    $scope.notify("error","Update Status Error");
                    $scope.showUpdateBtn = true;                    
                }
            });
        }

    });

    $scope.viewReport = function(reportCode) {
        //window.location.href = '#/view-report/' + reportCode;    
        $scope.report = {
            "reportID": reportCode
        };



        $http.post('/getReportForComplaint', $scope.report).then(function(response) {
            $('div.report_reference').html(response.data.content);
            $scope.thisReport = response.data.result[0];

            $scope.area = {
                "areaID": $scope.thisReport.area
            };
            $http.post('/loadSpecificBoundary', $scope.area).then(function(response) {
                var $googleMap, map;

                if (response.data.length != 0) {
                    var sumOfCoLat = 0;
                    var sumOfCoLng = 0;
                    for (var i = 0; i < response.data.length; i++) {
                        sumOfCoLat += response.data[i].lat;
                        sumOfCoLng += response.data[i].lng;
                    }
                    var avgOfCoLat = sumOfCoLat / response.data.length;
                    var avgOfCoLng = sumOfCoLng / response.data.length;
                    var data = response.data;
                    var boundary = [];

                    for (var i = 0; i < response.data.length; i++) {
                        boundary.push(new google.maps.LatLng(data[i].lat, data[i].lng));

                    }
                    var polygonColorCode = "#" + response.data[0].color;
                    var myPolygon = new google.maps.Polygon({
                        paths: boundary,
                        strokeColor: polygonColorCode,
                        strokeWeight: 2,
                        fillColor: polygonColorCode,
                        fillOpacity: 0.45
                    });

                    $googleMap = document.getElementById('googleMap');
                    var visualizeMap = {
                        center: new google.maps.LatLng(avgOfCoLat, avgOfCoLng),
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        mapTypeControl: false,
                        panControl: false,
                        zoomControl: false,
                        streetViewControl: false,
                        disableDefaultUI: true,
                        editable: false
                    };

                    map = new google.maps.Map($googleMap, visualizeMap);
                    myPolygon.setMap(map);

                    $window.setTimeout(function() {
                        map.panTo(new google.maps.LatLng(avgOfCoLat, avgOfCoLng));
                        map.setZoom(12);
                    }, 1000);
                } else {
                    $scope.notify("warn", "Certain area has no draw boundary yet! Map can't be shown");
                }
            });
        });
    }

    $scope.sendEmail = function(actioncode) {

        if (actioncode == "ack") {

            swal({
                    title: "Acknowledgement",
                    text: "This will send an acknowledgement email to customer, and move to next status, are you want to do it? (cannot be move back in next status)",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonClass: "btn-warning",
                    confirmButtonText: "Send email",
                    cancelButtonText: "Cancel",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        swal("Acknowledge", "Acknowledgement email has been sent.", "success");
                        $scope.emailobj.status = "i";
                        $http.post('/emailandupdate', $scope.emailobj).then(function(response) {
                            if (response.data.status == "success") {
                                console.log(response.data);
                                swal("Email Sent Successfully!", "", "success");
                                $scope.comDetail.status = "In progress";
                                $scope.emailobj.subject = "";
                                $scope.emailobj.text = "";
                            } else {
                                swal("Email has not been sent successfully!", "", "error");
                            }

                        });

                    } else {
                        swal("Cancelled", "Acknowledgement email has not been sent.", "error");
                    }
                });

        }
        if (actioncode == "rpy") {

            swal({
                    title: "Reply email",
                    text: "This will send an information email to customer, and move to next status, are you want to do it? (cannot be move back in next status)",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonClass: "btn-warning",
                    confirmButtonText: "Send email",
                    cancelButtonText: "Cancel",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function(isConfirm) {

                    if (isConfirm) {
                        swal("Information", "Email has been sent.", "success");
                        $scope.emailobj.status = "c";

                        $http.post('/emailandupdate', $scope.emailobj).then(function(response) {
                            if (response.data.status == "success") {
                                swal("Email Sent Successfully!", "", "success");
                                $scope.comDetail.status = "Confirmation";
                                $scope.emailobj.subject = "Problem Solved.";
                                $scope.emailobj.text = "This will send an confirmation email to customer, in order to inform customer the current problem has been solved. (After email sent, this complaint will count as complete and cannot be moved back.)";
                            } else {
                                swal("Email has not been sent successfully!", "", "error");
                            }

                        });

                    } else {
                        swal("Cancelled", "Email has not been sent.", "error");
                    }
                });


        }
        if (actioncode == "slv") {

            swal({
                    title: "Solved",
                    text: "This will send an confirmation email to customer, in order to inform customer the current problem has been solved. (After email sent, this complaint will count as complete and cannot be moved back.)",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonClass: "btn-warning",
                    confirmButtonText: "Send email",
                    cancelButtonText: "Cancel",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        swal("Complete", "Confirmation email has been sent.", "success");
                        $scope.emailobj.status = "d";

                        $http.post('/emailandupdate', $scope.emailobj).then(function(response) {
                            if (response.data.status == "success") {
                                swal("Confirmation email Sent Successfully!", "", "success");
                                $scope.comDetail.status = "Done";
                                $scope.emailobj.subject = "";
                                $scope.emailobj.text = "";
                            } else {
                                swal("Confirmation email has not been sent successfully!", "", "error");
                            }

                        });
                    } else {
                        swal("Cancelled", "Confirmation email has not been sent.", "error");
                    }
                });

        }
    }
});

// //LOG TASk
// var logTask = function(action, description, rowId) {

//     var today = new Date();
//     var staffId = window.sessionStorage.getItem('owner');
//     var authorizedBy = window.sessionStorage.getItem('owner');

//     var logVar = {
//         "taskID": null,
//         "date": today,
//         "staffId": 'ACC201906260002',
//         "action": action,
//         "description": description,
//         "authroizedBy": null,
//         tblName: '',
//         "rowID": rowId
//     }

//     $.ajax({
//         method: 'POST',
//         url: '/addLog',
//         data: $.param(logVar)
//     }).then(function (response) {
//             console.log(response.data);
//     });

//         // $http.post('/addLog', logVar).then(function (response) {
//         //     var returnedData = response.data;

//         //     console.log(returnedData);
//         // }).catch(function (response) {
//         //     console.error('error');
//         // });

//     console.log("test");
// };

app.controller('transactionLogController', function($scope, $http, $filter, storeDataService) {
    'use strict';

    var asc = true;

    $scope.initializeTransaction = function() {
        $scope.transaction = {
            "date": "",
            "description": "",
            "staff": "",
            "authorizedBy": ""
        };
    };
    
    $scope.pagination = angular.copy(storeDataService.pagination);

    $scope.show = angular.copy(storeDataService.show.zone);
    $scope.transactionList = [];

    $http.get('/getAllTransaction').then(function(response) {
        $scope.transactionList = response.data;
        $scope.totalItems = $scope.transactionList.length;
    });


    $scope.orderBy = function(property) {
        $scope.transactionList = $filter('orderBy')($scope.transactionList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('deliveryController', function($scope, $http, $filter, storeDataService) {
    'use strict';

    $scope.bdafList = [];
    $scope.driverList = [];
    $scope.generalWorkerList = [];
    var driverPosition = angular.copy(storeDataService.positionID.driverPosition);
    var generalWorkerPosition = angular.copy(storeDataService.positionID.generalWorkerPosition);

    console.log("DELIVERY MANAGEMENT ACTIVATED!!");


    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;


    $scope.viewbdaf = function(bdafID) {
        window.location.href = '#/bdaf-details/' + bdafID;
    }

    function initializeBdaf() {
        $scope.bdaf = {
            "id": '',
            "date": '',
            "driver": '',
            "generalWorker": '',
            "status": ''
        };
    }

    $scope.show = angular.copy(storeDataService.show.delivery);


    $scope.currentStatus = {
        "status": true
    }

    function getAllBdaf() {
        $http.post('/getAllBdaf', $scope.currentStatus).then(function(response) {

            $scope.bdafList = response.data;

            console.log("BDAF data received by controller");
            console.log(response.data);
        });

        $http.post('/getStaffList', { "position": 'Driver' }).then(function(response) {
            $scope.searchAcrFilter = '';
            $scope.driverList = response.data;

        });

        $http.post('/getStaffList', { "position": 'General Worker' }).then(function(response) {
            $scope.searchAcrFilter = '';
            $scope.generalWorkerList = response.data;

        });


    }
    getAllBdaf(); //call

    $scope.statusList = true;
    $scope.updateStatusList = function() {
        if ($scope.statusList) {
            $scope.currentStatus.status = true;
        } else {
            $scope.currentStatus.status = false;
        }
        getAllDcs(); //call
    }

    $scope.addBdaf = function() {
        $scope.bdaf.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');

        $http.post('/addBdaf', $scope.bdaf).then(function(response) {
            var returnedData = response.data;
            var newBdafID = returnedData.details.bdafID;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "BDAF added successfully!"
                });

                $scope.bdafList.push({ "id": newBdafID, "date": $scope.bdaf.date, "driver": $scope.bdaf.driverID, "generalWorker": $scope.bdaf.generalWorkerID, "authorizedBy": "", "authorizedDate": "", "status": 'ACTIVE' });

                angular.element('#createBDAF').modal('toggle');

            }
        });
    }
});

app.controller('bdafDetailsController', function($scope, $http, $filter, storeDataService, $routeParams) {

    $scope.status = '';

    $scope.requestAuthorization = function() {
        sendFormForAuthorization($routeParams.dcsID, "bdaf");
        $scope.status = 'PENDING';
    };

    $scope.confirm = function(request) {
        if (request == 'approve') {
            $scope.approveForm();
        } else if (request == 'reject') {
            $scope.rejectForm();
        }
    };

    $scope.approveForm = function() {
        $scope.status = 'APPROVED';
        approveForm($routeParams.dcsID, "bdaf");

        angular.element('#approveConfirmation').modal('toggle');
    }

    $scope.rejectForm = function() {
        $scope.status = 'CORRECTION REQUIRED';
        rejectForm($routeParams.dcsID, "bdaf");


        angular.element('#rejectConfirmation').modal('toggle');
    }

    $scope.authorize = angular.copy(storeDataService.show.formAuthorization);
    $scope.show = angular.copy(storeDataService.show.bdafDetails);
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;

    //$scope.showDcsDetails = true;

    $scope.bdafDetailsList = [];
    $scope.bdaf = [];
    $scope.customerList = [];
    $scope.acrList = [];
    $scope.binList = [];
    $scope.bdafID = {};
    $scope.bdafID.id = $routeParams.bdafID;


    //$scope.initializeDcsDetails = function(){
    $scope.bdafDetails = {
            "dcsID": '',
            "acrID": '',
            "areaID": '',
            "customerID": '',
            "beBins": '',
            "acrBins": '',
            "mon": '',
            "tue": '',
            "wed": '',
            "thu": '',
            "fri": '',
            "sat": '',
            "remarks": ''
        }
        //}


    $http.post('/getBdafInfo', $scope.bdafID).then(function(response) {

        $scope.bdaf = response.data;
        console.log($scope.bdaf);

        if ($scope.bdaf[0].status == 'G') {
            $scope.status = 'APPROVED';
        } else if ($scope.bdaf[0].status == 'P') {
            $scope.status = 'PENDING';
        } else if ($scope.bdaf[0].status == 'R') {
            $scope.status = 'CORRECTION REQUIRED';
        } else if ($scope.bdaf[0].status == 'A') {
            $scope.status = 'ACTIVE';
        } else if ($scope.bdaf[0].status == 'C') {
            $scope.status = 'COMPLETE';
            $scope.show.edit = 'I';
        }
    });

    $scope.saveDcsEntry = function() {

        $http.post('/updateBdafEntry', $scope.bdafEntry).then(function(response) {

            $scope.getBdafDetails();
        });

        angular.element('#editDcsEntry').modal('toggle');
    }


    $scope.getBdafDetails = function() {
        $http.post('/getBdafDetails', $scope.bdafID).then(function(response) {

            $scope.bdafDetailsList = response.data;
            console.log($scope.bdafDetailsList);
        });

        $http.get('/getCustomerList', $scope.bdafID).then(function(response) {
            $scope.customerList = response.data;
        });

        $http.get('/getAcrList', $scope.bdafID).then(function(response) {
            $scope.acrList = response.data;
        });

        $http.get('/getBinList', $scope.bdafID).then(function(response) {
            $scope.binList = response.data;
        });
    }

    $scope.getBdafDetails();




    $scope.addBdafEntry = function() {
        $scope.bdafEntry.bdafID = $routeParams.bdafID;

        console.log($scope.bdafEntry.binDelivered);
        console.log($scope.bdafEntry.binPulled);
        console.log($scope.bdafEntry.serialNo);

        if ($scope.bdafEntry.binPulled != '') {
            $scope.bdafEntry.serialNo = $scope.bdafEntry.binPulled;

            if ($scope.bdafEntry.binDelivered != '') {
                $scope.bdafEntry.serialNo = $scope.bdafEntry.binDelivered;
            } else {
                $scope.bdafEntry.binDelivered = 'null';
            };

        } else {
            $scope.bdafEntry.serialNo = $scope.bdafEntry.binDelivered;
            $scope.bdafEntry.binPulled = 'null';
        };

        console.log($scope.bdafEntry.binDelivered);
        console.log($scope.bdafEntry.binPulled);
        console.log($scope.bdafEntry.serialNo);

        $http.post('/addBdafEntry', $scope.bdafEntry).then(function(response) {

            var returnedData = response.data;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "BDAF Entry added successfully!"
                });


                $scope.bdafDetailsList.push({ "location": $scope.bdafEntry.location, "contactPerson": $scope.bdafEntry.contactPerson, "contactNo": $scope.bdafEntry.contactNo, "acrSticker": $scope.bdafEntry.acrSticker, "acrfNo": $scope.bdafEntry.acrfNo, "jobDesc": $scope.bdafEntry.jobDesc, "binSize": $scope.bdafEntry.binSize, "unit": $scope.bdafEntry.unit, "remarks": $scope.bdafEntry.remarks, "binDelivered": $scope.bdafEntry.binDelivered, "binPulled": $scope.bdafEntry.binPulled, "completed": $scope.bdafEntry.completed });

                angular.element('#createBdafEntry').modal('toggle');
            }
        });
    }


});

app.controller('damagedLostController', function($scope, $http, $filter, storeDataService) {
    'use strict';

    $scope.blostList = [];
    console.log("DAMAGED & LOST BIN MANAGEMENT ACTIVATED!!");


    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;


    $scope.viewDbd = function(dbdID) {
        window.location.href = '#/dbd-details/' + dbdID;
    }

    $scope.viewBlost = function(blostID) {
        window.location.href = '#/blost-details/' + blostID;
    }

    function initializeBdaf() {
        $scope.bdaf = {
            "id": '',
            "creationDateTime": '',
            "driver": '',
            "periodFrom": '',
            "periodTo": '',
            "replacementDriver": '',
            "replacementPeriodFrom": '',
            "replacementPeriodTo": ''
        };
    }

    $scope.show = angular.copy(storeDataService.show.damagedlost);


    $scope.currentStatus = {
        "status": true
    }

    function getAllDbd() {
        $http.post('/getAllDbd', $scope.currentStatus).then(function(response) {
            $scope.searchAcrFilter = '';
            $scope.dcsList = response.data;

            console.log("DCS data received by controller");
            console.log(response.data);
        });
    }

    function getAllBlost() {
        $http.post('/getAllBlost', $scope.currentStatus).then(function(response) {
            $scope.searchAcrFilter = '';
            $scope.blostList = response.data;

            console.log("BLOST data received by controller");
            console.log(response.data);
        });
    }
    //getAllDbd(); //call
    getAllBlost();

    $scope.statusList = true;
    $scope.updateStatusList = function() {
        if ($scope.statusList) {
            $scope.currentStatus.status = true;
        } else {
            $scope.currentStatus.status = false;
        }
        getAllDcs(); //call
    }

    $scope.addBlost = function() {
        var position = window.sessionStorage.getItem('owner');
        console.log(position);
        $scope.blost.preparedBy = position;
        $scope.blost.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addBlost', $scope.blost).then(function(response) {
            var returnedData = response.data;
            var newBlostID = returnedData.details.blostID;
            var today = new Date();

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "BLOST added successfully!"
                });

                //     var area = $('.selectpicker option:selected').text();
                //    var areastr = area.split(" ")[2];
                //                console.log(areastr);
                $scope.blostList.push({ "id": newBlostID, "creationDateTime": today, "preparedBy": $scope.blost.preparedBy, "authorizedBy": $scope.blost.authorizedBy, "authorizedDate": $scope.blost.authorizedDate, "status": 'ACTIVE' });
                // $scope.filterAcrList = angular.copy($scope.acrList);
                angular.element('#createBLOST').modal('toggle');
                // $scope.totalItems = $scope.filterAcrList.length;
            }
        });
    }
});

app.controller('dbdDetailsController', function($scope, $http, $filter, storeDataService, $routeParams) {

    $scope.show = angular.copy(storeDataService.show.dcsDetails);
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;

    $scope.showDcsDetails = true;

    $scope.dcsDetailsList = [];
    $scope.dcs = [];
    $scope.customerList = [];
    $scope.dcsID = {};
    $scope.dcsID.id = $routeParams.dcsID;

    $scope.test = {
        "id": "sdfs",
        "info": "info"
    }

    //$scope.initializeDcsDetails = function(){
    $scope.dcsDetails = {
            "dcsID": '',
            "acrID": '',
            "areaID": '',
            "customerID": '',
            "beBins": '',
            "acrBins": '',
            "mon": '',
            "tue": '',
            "wed": '',
            "thu": '',
            "fri": '',
            "sat": '',
            "remarks": ''
        }
        //}

    $http.post('/getDcsInfo', $scope.dcsID).then(function(response) {

        $scope.dcs = response.data;
        console.log($scope.dcs);
    });

    $http.post('/getDcsDetails', $scope.dcsID).then(function(response) {

        $scope.dcsDetailsList = response.data;
        console.log($scope.dcsDetailsList);
        console.log("Hello dcsdetails");
    });

    $http.get('/getCustomerList', $scope.dcsID).then(function(response) {
        $scope.customerList = response.data;
    });

    $scope.addDcsEntry = function() {
        $scope.dcsEntry.dcsID = $routeParams.dcsID;

        $http.post('/addDcsEntry', $scope.dcsEntry).then(function(response) {

            var returnedData = response.data;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "DCS Entry added successfully!"
                });


                $scope.dcsDetailsList.push({ "acrfNo": $scope.dcsEntry.acrfNo, "company": $scope.dcsEntry.companyName, "address": $scope.dcsEntry.customerID, "beBins": $scope.dcsEntry.beBins, "acrBins": $scope.dcsEntry.acrBins, "areaCode": $scope.dcsEntry.areaCode, "mon": $scope.dcsEntry.mon, "tue": $scope.dcsEntry.tue, "wed": $scope.dcsEntry.wed, "thu": $scope.dcsEntry.thu, "fri": $scope.dcsEntry.fri, "sat": $scope.dcsEntry.sat, "remarks": $scope.dcsDetails.remarks });

                angular.element('#createDcsEntry').modal('toggle');
            }
        });
    }


});

app.controller('blostDetailsController', function($scope, $http, $filter, storeDataService, $routeParams) {

    $scope.status = '';

    $scope.requestAuthorization = function() {
        sendFormForAuthorization($routeParams.dcsID, "blost");
        $scope.status = 'PENDING';
    };

    $scope.confirm = function(request) {
        if (request == 'approve') {
            $scope.approveForm();
        } else if (request == 'reject') {
            $scope.rejectForm();
        }
    };

    $scope.approveForm = function() {
        $scope.status = 'APPROVED';
        approveForm($routeParams.dcsID, "blost");

        angular.element('#approveConfirmation').modal('toggle');
    }

    $scope.rejectForm = function() {
        $scope.status = 'CORRECTION REQUIRED';
        rejectForm($routeParams.dcsID, "blost");


        angular.element('#rejectConfirmation').modal('toggle');
    }


    $scope.authorize = angular.copy(storeDataService.show.formAuthorization);
    $scope.show = angular.copy(storeDataService.show.dcsDetails);
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;

    $scope.showDcsDetails = true;

    $scope.blostDetailsList = [];
    $scope.blost = [];
    $scope.customerList = [];
    $scope.blostID = {};
    $scope.blostID.id = $routeParams.blostID;

    $scope.test = {
        "id": "sdfs",
        "info": "info"
    }

    //$scope.initializeDcsDetails = function(){
    $scope.blostDetails = {
            "dcsID": '',
            "acrID": '',
            "areaID": '',
            "customerID": '',
            "beBins": '',
            "acrBins": '',
            "mon": '',
            "tue": '',
            "wed": '',
            "thu": '',
            "fri": '',
            "sat": '',
            "remarks": ''
        }
        //}

    $http.post('/getBlostInfo', $scope.blostID).then(function(response) {

        $scope.blost = response.data;
        console.log($scope.blost);


        if ($scope.blost[0].status == 'G') {
            $scope.status = 'APPROVED';
        } else if ($scope.blost[0].status == 'P') {
            $scope.status = 'PENDING';
        } else if ($scope.blost[0].status == 'R') {
            $scope.status = 'CORRECTION REQUIRED';
        } else if ($scope.blost[0].status == 'A') {
            $scope.status = 'ACTIVE';
        } else if ($scope.blost[0].status == 'C') {
            $scope.status = 'COMPLETE';
            $scope.show.edit = 'I';
        }
    });

    $http.post('/getBlostDetails', $scope.blostID).then(function(response) {

        $scope.dcsDetailsList = response.data;
        console.log($scope.blostDetailsList);
        console.log("Hello blostdetails");
    });

    $http.get('/getCustomerList', $scope.blostID).then(function(response) {
        $scope.customerList = response.data;
    });

    $scope.addBlostEntry = function() {
        $scope.dcsEntry.blostID = $routeParams.blostID;

        $http.post('/addBlostEntry', $scope.blostEntry).then(function(response) {

            var returnedData = response.data;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "BLOST Entry added successfully!"
                });


                $scope.blostDetailsList.push({ "acrfNo": $scope.dcsEntry.acrfNo, "company": $scope.dcsEntry.companyName, "address": $scope.dcsEntry.customerID, "beBins": $scope.dcsEntry.beBins, "acrBins": $scope.dcsEntry.acrBins, "areaCode": $scope.dcsEntry.areaCode, "mon": $scope.dcsEntry.mon, "tue": $scope.dcsEntry.tue, "wed": $scope.dcsEntry.wed, "thu": $scope.dcsEntry.thu, "fri": $scope.dcsEntry.fri, "sat": $scope.dcsEntry.sat, "remarks": $scope.dcsDetails.remarks });

                angular.element('#createBlostEntry').modal('toggle');
            }
        });
    }
});

function approveForm(formID, formType) {
    $http = angular.injector(["ng"]).get("$http");

    var formDetails = {
        "formID": formID,
        "formType": formType,
        "authorizedBy": window.sessionStorage.getItem('owner')
    }

    console.log("authorizedBy:" + formDetails.authorizedBy);


    $http.post('/approveForm', formDetails).then(function(response) {

        returnedData = response.data;

        if (returnedData.status === "success") {
            angular.element('body').overhang({
                type: "success",
                "message": "Form approved!"
            });
        }
    });
}

function rejectForm(formID, formType) {
    $http = angular.injector(["ng"]).get("$http");

    var formDetails = {
        "formID": formID,
        "formType": formType,
        "authorizedBy": window.sessionStorage.getItem('owner')
    }

    $http.post('/rejectForm', formDetails).then(function(response) {

        if (returnedData.status === "success") {
            angular.element('body').overhang({
                type: "success",
                "message": "Form rejected!"
            });
        }
    });

}

function sendFormForAuthorization(formID, formType) {

    var today = new Date();
    $http = angular.injector(["ng"]).get("$http");
    var formDetails = {
        "formID": formID,
        "formType": formType,
        "preparedBy": window.sessionStorage.getItem('owner'),
        "date": today
    }

    var status = '';

    $http.post('/getFormStatus', formDetails).then(function(response) {

        status = response.data[0].status;
        console.log("STATUS: " + status);

        if (status == 'P') {

            window.alert("Form is already pending authorization");
        } else {
            $http.post('/getFormDetails', formDetails).then(function(response) {

                var preparedBy = response.data;
                formDetails.preparedBy = preparedBy[0].preparedBy;
                formDetails.date = preparedBy[0].creationDateTime;
                console.log(formDetails);

                $http.post('/sendFormForAuthorization', formDetails).then(function(response) {

                    var returnedData = response.data;

                    if (returnedData.status === "success") {
                        angular.element('body').overhang({
                            type: "success",
                            "message": "Form sent for authorization!"
                        });
                    }
                });
            });
        }



    });











}