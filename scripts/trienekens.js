/*
jshint: white
global angular, document, google, Highcharts
*/
var app = angular.module('trienekens', ['ngRoute', 'ui.bootstrap', 'ngSanitize', 'ngCsv', 'easypiechart']);

var socket = io.connect();
var flag = false;

function lobi_notify(type, title, content, avatar) {
    var icon = false;
    icon = avatar !== '' ? true : false;

    Lobibox.notify(type, {
        pauseDelayOnHover: true,
        continueDelayOnInactiveTab: false,
        title: title,
        msg: content,
        img: avatar,
        icon: icon
    });
}

function isOpen(ws) {
    var ping = { "type": "ping" };
    ws.send(JSON.stringify(ping));
    //return ws.io.readyState === "open";
}

window.setInterval(function() {
    isOpen(socket);
}, 10000);

//var socket = io.connect('wss://trienekens.appspot.com:3000', {transports: ['websocket'], 'force new connection': true});
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

    //    socket.emit('room', window.sessionStorage.getItem('owner'));

    if (window.sessionStorage.getItem('position') == "Manager" || window.sessionStorage.getItem('position') == "Administrator" || window.sessionStorage.getItem('position') == "Developer") {
        socket.emit('room', "manager");
    }
});

socket.on('receive authorize action', function(data) {
    if (data.num > 0) {
        $('.authorization').addClass("badge badge-danger").html(data.num);
    }
});

socket.on('receive form authorize action', function(data) {
    if (data.num > 0) {
        $('.form-authorization').addClass("badge badge-danger").html(data.num);
    }
});

socket.on('new satisfaction', function(data) {
    if (data.unread > 0) {
        $('.satisfaction').addClass("badge badge-danger").html(data.unread);
    }
});

socket.on('new enquiry', function(data) {
    if (data.unread > 0) {
        $('.enquiry').addClass("badge badge-danger").html(data.unread);
    }
});

socket.on('new binrequest', function(data) {
    if (data.unread > 0) {
        $('.binrequest').addClass("badge badge-danger").html(data.unread);
    }
});

socket.on('read municipal', function(data) {
    if (data.unread > 0) {
        var unread = $('.satisfaction').html();
        console.log(unread);
        if (unread > 0) {
            var remaining = parseInt(unread) - parseInt(data.unread);
            console.log(remaining);
            $('.satisfaction').addClass("badge badge-danger").html(remaining);
        }
    }
});

socket.on('read commercial', function(data) {
    if (data.unread > 0) {
        var unread = $('.satisfaction').html();
        if (unread > 0) {
            var remaining = parseInt(unread) - parseInt(data.unread);
            console.log(remaining);
            $('.satisfaction').addClass("badge badge-danger").html(remaining);
        }
    }
});

socket.on('read scheduled', function(data) {
    if (data.unread > 0) {
        var unread = $('.satisfaction').html();
        if (unread > 0) {
            var remaining = parseInt(unread) - parseInt(data.unread);
            console.log(remaining);
            $('.satisfaction').addClass("badge badge-danger").html(remaining);
        }
    }
});

socket.on('read enquiry', function(data) {
    $('.enquiry').addClass("badge badge-danger").html(data.unread);
});

socket.on('read binrequest', function(data) {
    $('.binrequest').addClass("badge badge-danger").html(data.unread);
});

socket.on('new complaint', function(data) {
    if (data.unread != 0) {
        $('.complaint').addClass("badge badge-danger").html(data.unread);
    }
});

socket.on('read complaint', function(data) {
    $('.complaint').addClass("badge badge-danger").html(data.unread);
});

socket.on('receive report notification', function(data) {
    var content = data.name + ' have submitted a new report ' + data.id;
    lobi_notify('info', 'Daily Report', content, data.avatar);
});

socket.on('new complaint to web', function(data) {
    var content = data.premise;
    lobi_notify('info', 'New Complaint', content, '');
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

app.filter('trustHtml', function($sce) {
    return function(html) {
        return $sce.trustAsHtml(html)
    }
});

// WBD Filters
app.filter('serialNoFilter', function() {
    'use strict';
    return function(serialNo, input) {
        if (input == serialNo) {
            return serialNo;
        }
        return serialNo;
    }
})

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
                if (!ngModel) {
                    return;
                }

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
                            if (element.multiple) {
                                ngModel.$setViewValue(values);
                            } else {
                                ngModel.$setViewValue(values.length ? values[0] : null);
                            }
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
        "acr": {
            "areaCode": ''
        },
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
        "enquiry": {
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
                "view": 'I',
                "checkView": 'I',
                "verifyView": 'I'
            },
            "transactionLog": {
                "view": 'I'
            },
            "dcsDetails": {
                "view": 'I',
                "edit": 'I',
                "create": 'I',
                "checkView": 'I',
                "verifyView": 'I'
            },
            "bdafDetails": {
                "view": 'I',
                "edit": 'I',
                "create": 'I',
                "checkView": 'I',
                "verifyView": 'I'
            },
            "dbdDetails": {
                "view": 'I',
                "edit": 'I',
                "create": 'I',
                "checkView": 'I',
                "verifyView": 'I'
            },
            "dbrDetails": {
                "view": 'I',
                "edit": 'I',
                "create": 'I',
                "checkView": 'I',
                "verifyView": 'I'
            },
            "blostDetails": {
                "view": 'I',
                "edit": 'I',
                "create": 'I',
                "checkView": 'I',
                "verifyView": 'I'
            },
            "reporting": {
                "view": 'I',
                "edit": 'I',
                "create": 'I',
                "export": 'I',
                "check": 'I',
                "feedback": 'I'
            },
            "delivery": {
                "create": 'I',
                "edit": 'I',
                "view": 'I'
            },
            "damagedBin": {
                "create": 'I',
                "edit": 'I',
                "view": 'I'
            },
            "lostBin": {
                "create": 'I',
                "edit": 'I',
                "view": 'I'
            },
            // "custService": {
            //     "upload": 'I',
            //     "send": 'I',
            //     "approve": 'I',
            //     "view": 'I'
            // }
            "banner": {
                "upload": 'A'
            },
            "notif": {
                "send": 'A'
            },
            "binrequest": {
                "approve": 'A'
            },
            "feedback": {
                "view": 'A'
            },
            "enquiry": {
                "view": 'A'
            },
            "newBusiness": {
                "view": 'I',
                "create": 'I',
                "edit": 'I'
            },
            "binStock": {
                "view": 'I',
                "create": 'I',
                "edit": 'I'
            },
            "role": {
                "view": 'I'
            },
            "user": {
                "approve": 'I'
            },
            "damagedBin": {
                "view": 'I',
                "edit": 'I',
                "create": 'I'
            },
            "lostBin": {
                "view": 'I',
                "edit": 'I',
                "create": 'I'
            },
            "complaintapp": {
                "view": 'I'
            },            
            "complaintweb": {
                "view": 'I',
                "create": 'I',
                "hist": 'I',
                "editcms": 'I'
            },
            "complaintlogs":{
                "view": 'I'
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
        scope.showAcr = true;
        scope.showDbr = true;
        scope.showTruck = true;
        scope.showZone = true;
        scope.showProfile = true;
        scope.showBin = true;
        scope.showCollection = true;
        scope.showBinRequest = true;
        scope.deleteCollection = true;
        scope.showDatabaseBin = true;
        scope.showCustomer = true;
        scope.showTaman = true;
        scope.showBinHistory = true;
        scope.showBinStock = true;
        scope.showNewMgb = true;
        scope.showReusableMgb = true;
        scope.showDcsDetails = true;
        scope.showDelivery = true;
        scope.showBdafDetails = true;
        scope.showDbdDetails = true;
        scope.showBlostDetails = true;
        scope.showCollectionSchedule = true;
        scope.showEnquiry = true;
        scope.thisAcr = {
            "areaCode": ''
        };
        scope.thisDbr = {
            "areaCode": '',
            "damageCode": '',
            "unit": '',
            "binSize": '',
            "serialNo": '',
            "damageReason": ''
        }
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

        scope.thisEnquiry = {
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

        scope.editAcr = function(acr) {

            if (acr.mon == 1) {
                document.getElementById("mon").checked = true;
                acr.mon = true;
            } else {
                document.getElementById("mon").checked = false;
                acr.mon = false;
            }
            if (acr.tue == 1) {
                document.getElementById("tue").checked = true;
                acr.tue = true;
            } else {
                document.getElementById("tue").checked = false;
                acr.tue = false;
            }
            if (acr.wed == 1) {
                document.getElementById("wed").checked = true;
                acr.wed = true;
            } else {
                document.getElementById("wed").checked = false;
                acr.wed = false;
            }
            if (acr.thu == 1) {
                document.getElementById("thu").checked = true;
                acr.thu = true;
            } else {
                document.getElementById("thu").checked = false;
                acr.thu = false;
            }
            if (acr.fri == 1) {
                document.getElementById("fri").checked = true;
                acr.fri = true;
            } else {
                document.getElementById("fri").checked = false;
                acr.fri = false;
            }
            if (acr.sat == 1) {
                document.getElementById("sat").checked = true;
                acr.sat = true;
            } else {
                document.getElementById("sat").checked = false;
                acr.sat = false;
            }

            scope.showAcr = !scope.showAcr;
        };

        scope.saveAcr = function(acr) {
            scope.showAcr = !scope.showAcr;

            if (acr.mon) {
                acr.mon = 1;
            } else {
                acr.mon = 0;
            }

            if (acr.tue) {
                acr.tue = 1;
            } else {
                acr.tue = 0;
            }

            if (acr.wed) {
                acr.wed = 1;
            } else {
                acr.wed = 0;
            }

            if (acr.thu) {
                acr.thu = 1;
            } else {
                acr.thu = 0;
            }

            if (acr.fri) {
                acr.fri = 1;
            } else {
                acr.fri = 0;
            }

            if (acr.sat) {
                acr.sat = 1;
            } else {
                acr.sat = 0;
            }

            scope.thisAcr = acr;
            console.log(scope.thisAcr);

            // Change Date Format
            scope.thisAcr.from = $filter('date')(scope.thisAcr.from, 'yyyy-MM-dd HH:mm:ss');
            scope.thisAcr.to = $filter('date')(scope.thisAcr.to, 'yyyy-MM-dd HH:mm:ss');

            $http.post('/getAreaID', scope.thisAcr).then(function(response) {

                console.log(response.data);
                scope.thisAcr.areaID = response.data[0].areaID;
                console.log(scope.thisAcr);
                $http.post('/editAcr', scope.thisAcr).then(function(response) {
                    var data = response.data[0];

                    if (data === 'error') {
                        window.alert("DCS Doesn't Exist!");
                    }
                });
            });




        };

        scope.saveAcrDays = function(acr) {
            scope.showAcr = !scope.showAcr;

            if (acr.mon) {
                acr.mon = 1;
            } else {
                acr.mon = 0;
            }

            if (acr.tue) {
                acr.tue = 1;
            } else {
                acr.tue = 0;
            }

            if (acr.wed) {
                acr.wed = 1;
            } else {
                acr.wed = 0;
            }

            if (acr.thu) {
                acr.thu = 1;
            } else {
                acr.thu = 0;
            }

            if (acr.fri) {
                acr.fri = 1;
            } else {
                acr.fri = 0;
            }

            if (acr.sat) {
                acr.sat = 1;
            } else {
                acr.sat = 0;
            }

            scope.thisAcr = acr;
            $http.post('/editAcrDays', scope.thisAcr).then(function(response) {
                var data = response.data;

            });




        };
        scope.cancelAcr = function() {
            scope.showAcr = !scope.showAcr;

            $.each(storeDataService.acr, function(index, value) {
                if (storeDataService.acr[index].id == scope.acr.id) {
                    scope.b = angular.copy(storeDataService.acr[index]);
                    return false;
                }
            });

        };

        scope.editDbrEntry = function(dbr) {
            scope.showDbr = !scope.showDbr;
            scope.thisDbr = {
                "areaCode": dbr.areaCode,
                "damageCode": dbr.damageCode,
                "unit": dbr.unit,
                "binSize": dbr.binSize,
                "serialNo": dbr.serialNo,
                "damageReason": dbr.damageReason
            };

            console.log(scope.thisDbr);
        }

        scope.saveDbrEntry = function(dbr) {
            scope.showDbr = !scope.showDbr;

            scope.thisDbr = {
                "areaCode": dbr.areaCode,
                "damageCode": dbr.damageCode,
                "unit": dbr.unit,
                "binSize": dbr.binSize,
                "serialNo": dbr.serialNo,
                "damageReason": dbr.damageReason,
                "id": dbr.id
            };
            scope.thisDbr.dbrID = dbr.dbrID;
            // $scope.thisDbr.areaCode = dbr.areaCode;
            // $scope.thisDbr.damageCode = dbr.damageCode;
            // $scope.thisDbr.unit = dbr.unit;
            // $scope.thisDbr.binSize = dbr.binSize;
            // $scope.thisDbr.serialNo = dbr.serialNo;
            // $scope.thisDbr.damageReason = dbr.damageReason;
            console.log(scope.thisDbr);

            $http.post('/editDbr', scope.thisDbr).then(function(response) {
                var data = response.data;

                scope.notify(data.status, data.message);
            });
        }

        scope.cancelDbrEntry = function() {
            scope.showDbr = !scope.showDbr;
            $.each(storeDataService.dbr, function(index, value) {
                if (storeDataService.dbr[index].id == scope.dbr.id) {
                    scope.b = angular.copy(storeDataService.dbr[index]);
                    return false;
                }
            });

        }

        scope.editTruck = function(id, no, transporter, ton, tax, status) {
            scope.showTruck = !scope.showTruck;
            scope.thisTruck = {
                "id": id,
                "no": no,
                "transporter": transporter,
                "ton": ton,
                "roadtax": tax,
                "status": status
            };
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
            scope.thisZone = {
                "id": id,
                "code": code,
                "name": name,
                "status": status
            };
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
            scope.thisBin = {
                "id": id,
                "name": name,
                "location": location,
                "area": area,
                "areaCode": areaCode,
                "status": status
            };
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
            scope.thisCollection = {
                "id": id,
                "address": address
            };
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

            scope.thisCollectionSchedule = {
                "id": id,
                "mon": mon,
                "tue": tue,
                "wed": wed,
                "thur": thur,
                "fri": fri,
                "sat": sat
            };

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

        // scope.editBinRequestStatus = function () {
        //     scope.showBinRequest = !scope.showBinRequest;

        //     angular.element('.selectpicker').selectpicker('refresh');
        //     angular.element('.selectpicker').selectpicker('render');
        // };

        // scope.saveBinRequestStatus = function (status, id) {
        //     scope.showBinRequest = !scope.showBinRequest;

        //     scope.thisBinRequest = {
        //         "status": status,
        //         "id": id
        //     };

        //     $http.post('/updateBinRequest', scope.thisBinRequest).then(function (response) {
        //         var data = response.data;
        //         console.log(data);
        //     }, function (error) {
        //         console.log(error);
        //     });
        // };

        scope.cancelBinRequestStatus = function() {
            scope.showBinRequest = !scope.showBinRequest;

            $.each(storeDataService.binRequest, function(index, value) {
                if (storeDataService.binRequest[index].id == scope.thisBinRequest.id) {
                    scope.x = angular.copy(storeDataService.binRequest[index]);
                }
            });
        };

        scope.editEnquiryStatus = function() {
            scope.showEnquiry = !scope.showEnquiry;

            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');
        };

        scope.saveEnquiryStatus = function(status, id) {
            scope.showEnquiry = !scope.showEnquiry;

            scope.thisEnquiry = {
                "status": status,
                "id": id
            };

            $http.post('/updateEnquiry', scope.thisEnquiry).then(function(response) {
                var data = response.data;
                if (data == "Enquiry Updated") {
                    alert(data);
                }
                console.log(data);
            }, function(error) {
                console.log(error);
            });
        };

        scope.cancelEnquiryStatus = function() {
            scope.showEnquiry = !scope.showEnquiry;

            $.each(storeDataService.enquiry, function(index, value) {
                if (storeDataService.enquiry[index].id == scope.thisEnquiry.id) {
                    scope.x = angular.copy(storeDataService.enquiry[index]);
                }
            });
        };

        //TAMAN MODULE EDITABLE TABLES
        scope.editTaman = function() {
            scope.showTaman = !scope.showTaman;


            console.log("hello from editTaman");
            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');

        };
        scope.saveTaman = function(tamanID, areaID, tamanName, longitude, latitude, areaCollStatus) {
            scope.showTaman = !scope.showTaman;

            scope.thisTaman = {
                "tamanID": tamanID,
                "areaID": areaID,
                "tamanName": tamanName,
                "longitude": longitude,
                "latitude": latitude,
                "areaCollStatus": areaCollStatus
            };

            $http.put('/editTaman', scope.thisTaman).then(function(response) {
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
        scope.cancelTaman = function() {
            scope.showTaman = !scope.showTaman;

            $.each(storeDataService.bin, function(index, value) {
                if (storeDataService.databaseBin[index].id == scope.thisDatabaseBin.id) {
                    scope.b = angular.copy(storeDataService.databaseBin[index]);
                    return false;
                }
            });

        };
        scope.deleteTaman = function(tamanID) {
            scope.tamanIDJSON = {
                "tamanID": tamanID
            };
            $http.post('/deleteTaman', scope.tamanIDJSON).then(function(response) {
                //var data = response.data;
                scope.message = {
                    "status": "success",
                    "message": "Taman deleted successfully!"
                }

                scope.notify(scope.message.status, scope.message.message);

            });
        };

        //CUSTOMER MODULE EDITABLE TABLES
        scope.editCustomer = function() {
            scope.showCustomer = !scope.showCustomer;

            console.log("hello from editCustomer");
            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');

        };
        scope.saveCustomer = function(customerID, creationDateTime, name, ic, contactNumber, tradingLicense, city, imgPath, status, houseNo, streetNo, companyName) {
            scope.showCustomer = !scope.showCustomer;

            scope.thisCustomer = {
                "customerID": customerID,
                "creationDateTime": creationDateTime,
                "name": name,
                "ic": ic,
                "contactNumber": contactNumber,
                "tradingLicense": tradingLicense,
                "city": city,
                "imgPath": imgPath,
                "status": status,
                "houseNo": houseNo,
                "streetNo": streetNo,
                "companyName": companyName
            };

            console.log(scope.thisCustomer);

            $http.put('/editCustomer', scope.thisCustomer).then(function(response) {
                var data = response.data;

                console.log("hello from editCustomer");
                console.log(response.data);

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
        scope.cancelCustomer = function() {
            scope.showCustomer = !scope.showCustomer;

            $.each(storeDataService.bin, function(index, value) {
                if (storeDataService.customer[index].id == scope.thisCustomer.id) {
                    scope.b = angular.copy(storeDataService.customer[index]);
                    return false;
                }
            });

        };
        scope.deleteCustomer = function(customerID) {
            //scope.customerIDTemp = customerID;

            $http.post('/deleteCustomer', customerID).then(function(response) {
                var data = response.data;

                scope.notify(data.status, data.message);

            });
        };

        //BIN STOCK MODULE EDITABLE TABLES
        scope.editBinStock = function() {
            scope.showBinStock = !scope.showBinStock;
            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');

        };

        scope.saveBinStock = function(serialNo, size, status) {
            scope.showBinStock = !scope.showBinStock;

            scope.thisBinStock = {
                "serialNo": serialNo,
                "size": size,
                "status": status
            }

            $http.put('/editBinStock', scope.thisBinStock).then(function(response) {
                var data = response.data;

                scope.notify(data.status, data.message);
            });
        };

        scope.cancelBinStock = function() {
            scope.showBinStock = !scope.showBinStock;

            $.each(storeDataService.bin, function(index, value) {
                if (storeDataService.databaseBin[index].id == scope.thisDatabaseBin.id) {
                    scope.b = angular.copy(storeDataService.databaseBin[index]);
                    return false;
                }
            });

        };
        scope.deleteBinStock = function(serialNo) {
            $http.post('/deleteBinStock', scope.b).then(function(response) {
                //var data = response.data;
                console.log('Delete bin stock trienekens.js');

                //scope.notify(data.status, data.message);

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

            scope.thisDatabaseBin = {
                "idNo": id,
                "date": date,
                "customerID": customerID,
                "areaCode": areaCode,
                "serialNo": serialNo,
                "acrID": acrfSerialNo,
                "activeStatus": status,
                "rcDwell": rcDwell,
                "comment": comment,
                "itemType": itemType,
                "path": path
            };
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
                $http.get('/getAllDatabaseBin').then(function(response) {

                    $scope.databaseBinList = response.data;
                    storeDataService.databaseBin = angular.copy($scope.databaseBinList);
                });

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

            scope.thisNewMgb = {
                "date": date,
                "doNo": doNo,
                "inNew120": inNew120,
                "inNew240": inNew240,
                "inNew660": inNew660,
                "inNew1000": inNew1000,
                "outNew120": outNew120,
                "outNew240": outNew240,
                "outNew660": outNew660,
                "outNew1000": outNew1000
            };

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

            scope.thisReusableMgb = {
                "date": date,
                "inReusable120": inReusable120,
                "inReusable240": inReusable240,
                "inReusable660": inReusable660,
                "inReusable1000": inReusable1000,
                "outReusable120": outReusable120,
                "outReusable240": outReusable240,
                "outReusable660": outReusable660,
                "outReusable1000": outReusable1000
            };



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


            scope.thisBin = {
                "id": id,
                "name": name,
                "location": location,
                "area": area,
                "status": status
            };
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
    $rootScope.renderSltPicker = function() {
        angular.element('.selectpicker').selectpicker('refresh');
        angular.element('.selectpicker').selectpicker('render');
    };
    $rootScope.geocodeLink = function(place) {
        var area = place.area.replace(" ", "+");
        var zone = place.zone.replace(" ", "+");
        var concat = area + '+' + zone;

        return "https://maps.googleapis.com/maps/api/geocode/json?address=" + concat + "&key=<APIKEY>";
    };
});

//Customer Service Pages Controller
app.controller('custServiceCtrl', function($scope, $rootScope, $location, $http, $window, $filter) {
    $scope.loggedUser = localStorage.getItem('user');
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 3; //Record number each page
    $scope.itemsPerPageBinReq = 10;
    $scope.itemsPerPageEnquiry = 10;
    $scope.itemsPerPageAnnouncement = 10;
    $scope.maxSize = 8; //Show the number in page
    $scope.m = {};
    $scope.c = {};
    $scope.s = {};

    $scope.sendNotifToDevice = function() {
        $scope.data = {
            //'target': $scope.notifTarget,
            'target': "TriAllUsers",
            'title': $scope.notifTitle,
            'message': $scope.notifMessage,
            'link': $scope.notifLink
        };

        if (confirm("Poset Announcement?")) {
            $http.post('/sendNotifToDevice', $scope.data).then(function(response) {
                console.log(response.data);
            }, function(error) {
                console.log(error);
            });

            $http.post('/insertAnnouncement', $scope.data).then(function(response) {
                console.log(response.data);
            }, function(error) {
                console.log(error);
            });
            alert("Announcement posted!");
        };
    };

    $scope.uploadImg = function() {
        var fd = new FormData();
        angular.forEach($scope.files, function(file) {
            fd.append('file[]', file);
        });

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
        $scope.delCarouselImg = {
            "id": id,
            "name": name
        };

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

    $scope.getPendingBinRequest = function() {
        $http.get('/getPendingBinRequest').then(function(response) {
            console.log(response.data);
            $scope.pendingBinRequests = response.data;
            $scope.totalItemsBinReq = response.data.length;
            $scope.searchRequestFilter = '';
        }, function(error) {
            console.log(error);
        });
        $http.post('/readBinRequest').then(function(response) {
            console.log(response.data);
            if (response.data == "Binrequest Read") {
                socket.emit('binrequest read');
            }
        }, function(err) {
            console.log(err);
        });
    };

    $scope.updateBinRequest = function(id, status) {
        $scope.pReqs = {
            "reqID": id,
            "status": status
        };

        $http.post('/updateBinRequest', $scope.pReqs).then(function(response) {
            alert(response.data);
            $scope.getPendingBinRequest();
        }, function(error) {
            console.log(error);
        });
    };

    $scope.binReqDetail = function(reqID) {
        window.location.href = '#/bin-request-detail/' + reqID;

    };

    $scope.getAnnouncements = function() {
        $http.get('/getAnnouncements').then(function(response) {
            console.log(response.data);
            $scope.announcements = response.data;
            $scope.totalItemsAnnouncement = response.data.length;
        }, function(error) {
            console.log(error);
        });
    };

    $scope.getAreas = function() {
        $http.get('/getAreas').then(function(response) {
            console.log(response.data);
            $scope.areaList = response.data;
        }, function(error) {
            console.log(error);
        });
    };

    $scope.getEnquiry = function() {
        $http.get('/getEnquiry').then(function(response) {
            console.log(response.data);
            $scope.enquiry = response.data;
            $scope.totalItemsEnquiry = response.data.length;
            $scope.searchRequestFilter = '';
        }, function(error) {
            console.log(error);
        });
        $http.post('/readEnquiry').then(function(response) {
            console.log(response.data);
            if (response.data == "Enquiry Read") {
                socket.emit('enquiry read');
            }
        }, function(err) {
            console.log(err);
        });
    };

    // $scope.getMunicipalFeedback = function () {
    //     socket.emit('municipal satisfaction');
    //     $http.get('/customerFeedbackMunicipal').then(function (response) {
    //         console.log(response.data);
    //         $scope.reviews = response.data;
    //         $scope.totalItems = response.data.length;
    //         $scope.collPrompt = (response.data.collPrompt / 3) * 100;
    //         $scope.compRate = (response.data.compRate / 3) * 100;
    //         $scope.teamEff = (response.data.teamEff / 3) * 100;
    //         $scope.binHand = (response.data.binHand / 3) * 100;
    //         $scope.spillCtrl = (response.data.spillCtrl / 3) * 100;
    //         $scope.qryResp = (response.data.qryResp / 3) * 100;

    //         $scope.options = {
    //             animate: {
    //                 duration: 0,
    //                 enabled: false
    //             },
    //             barColor: '#2C3E50',
    //             scaleColor: false,
    //             lineWidth: 20,
    //             lineCap: 'circle'
    //         };

    //         $http.get('/readSatisfactionMunicipal').then(function (repsonse) {
    //             console.log(response.data);
    //         }, function (err) {
    //             console.log(err);
    //         });
    //     }, function (err) {
    //         console.log(err);
    //     });

    //     $http.get('/unreadSatisfaction').then(function(response){
    //         $scope.unreadMunicipal = response.data.municipal;
    //         $scope.unreadCommercial = response.data.commercial;
    //         $scope.unreadScheduled = response.data.scheduled;
    //     });
    // };

    //ng-csv
    $scope.separator = ",";
    $scope.getDataHeaderMunicipal = function() {
        return ["Collection Promptness Unsatisfied", "Collection Promptness Satisfied", "Collection Promptness Very Satisfied", "Team Efficiency Unsatisfied", "Team Efficiency Satisfied", "Team Efficiency Very Satisfied", "Company Rating Unsatisfied", "Company Rating Satisfied", "Company Rating Very Satisfied", "Bin Handling Unsatisfied", "Bin Handling Satisfied", "Bin Handling Very Satisfied", "Spillage Control Unsatisfied", "Spillage Control Satisfied", "Spillage Control Very Satisfied", "Query Response Unsatisfied", "Query Response Satisfied", "Query Response Very Satisfied"];
    };
    $scope.getDataHeaderCommercial = function() {
        return ["Collection Promptness Unsatisfied", "Collection Promptness Satisfied", "Collection Promptness Very Satisfied", "Team Efficiency Unsatisfied", "Team Efficiency Satisfied", "Team Efficiency Very Satisfied", "Company Rating Unsatisfied", "Company Rating Satisfied", "Company Rating Very Satisfied", "Cleanliness Unsatisfied", "Cleanliness Satisfied", "Cleanliness Very Satisfied", "Physical Condition Unsatisfied", "Physical Condition Satisfied", "Physical Condition Very Satisfied", "Query Response Unsatisfied", "Query Response Satisfied", "Query Response Very Satisfied"];
    };
    $scope.getDataHeaderScheduled = function() {
        return ["Team Efficiency Unsatisfied", "Team Efficiency Satisfied", "Team Efficiency Very Satisfied", "Company Rating Unsatisfied", "Company Rating Satisfied", "Company Rating Very Satisfied", "Health Adherence Unsatisfied", "Health Adherence Satisfied", "Health Adherence Very Satisfied", "Regulations Adherence Unsatisfied", "Regulations Adherence Satisfied", "Regulations Adherence Very Satisfied", "Query Response Unsatisfied", "Query Response Satisfied", "Query Response Very Satisfied"];
    };

    //Filter cust satisfaction
    $scope.filterFunction = function() {
        var currentYear = (new Date()).getFullYear();
        $scope.yearOptions = [];
        $scope.filters = {};

        for (var i = currentYear; i >= 2018; i--) {
            $scope.yearKV = { "name": i, "value": i };
            $scope.yearOptions.push($scope.yearKV);
        }
        var year = document.getElementById("year");
        var selectedYear = year.options[year.selectedIndex].value;
        //console.log(selectedYear);
        var month = document.getElementById("month");
        var selectedMonth = month.options[month.selectedIndex].value;

        $scope.filters.year = selectedYear.value;
        $scope.filters.month = selectedMonth.value;
    }

    $scope.getMunicipalFeedback = function() {
        socket.emit('municipal satisfaction');

        console.log($scope.filters);
        $http.post('/customerFeedbackMunicipal', $scope.filters).then(function(response) {
            console.log(response.data);
            $scope.reviews = response.data;
            $scope.totalItems = response.data.comments.length;
            $scope.totalUnsatisfied = $scope.reviews.compRateUS + $scope.reviews.teamEffUS + $scope.reviews.collPromptUS + $scope.reviews.binHandUS + $scope.reviews.spillCtrlUS + $scope.reviews.qryRespUS;
            $scope.totalSatisfied = $scope.reviews.compRateAvg + $scope.reviews.teamEffAvg + $scope.reviews.collPromptAvg + $scope.reviews.binHandAvg + $scope.reviews.spillCtrlAvg + $scope.reviews.qryRespAvg;
            $scope.totalVSatisfied = $scope.reviews.compRateS + $scope.reviews.teamEffS + $scope.reviews.collPromptS + $scope.reviews.binHandS + $scope.reviews.spillCtrlS + $scope.reviews.qryRespS;

            var data = {...response.data };
            delete data.comments;
            $scope.municipalData = [];
            $scope.municipalData.push(data);
            console.log($scope.municipalData);

            //ng-csv filename
            if ($scope.filters.month == undefined) {
                $scope.filename = $scope.filters.year.value + "_custsatisfaction_municipal.xls";
            } else {
                $scope.filename = $scope.filters.year.value.toString() + "_" + $scope.filters.month.toString() + "_custsatisfaction_municipal.xls";
            }

            console.log(document.getElementById('feedback-summary').innerHTML);
            $scope.downloadxls = function () {
                var blob = new Blob([document.getElementById('feedback-summary').innerHTML], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
                });
                saveAs(blob, $scope.filename);
            };
            

            var collPromptUS = parseInt(response.data.collPromptUS);
            var collPromptAvg = parseInt(response.data.collPromptAvg);
            var collPromptS = parseInt(response.data.collPromptS);

            var teamEffUS = parseInt(response.data.teamEffUS);
            var teamEffAvg = parseInt(response.data.teamEffAvg);
            var teamEffS = parseInt(response.data.teamEffS);

            var compRateUS = parseInt(response.data.compRateUS);
            var compRateAvg = parseInt(response.data.compRateAvg);
            var compRateS = parseInt(response.data.compRateS);

            var binHandUS = parseInt(response.data.binHandUS);
            var binHandAvg = parseInt(response.data.binHandAvg);
            var binHandS = parseInt(response.data.binHandS);

            var spillCtrlUS = parseInt(response.data.spillCtrlUS);
            var spillCtrlAvg = parseInt(response.data.spillCtrlAvg);
            var spillCtrlS = parseInt(response.data.spillCtrlS);

            var qryRespUS = parseInt(response.data.qryRespUS);
            var qryRespAvg = parseInt(response.data.qryRespAvg);
            var qryRespS = parseInt(response.data.qryRespS);

            Highcharts.chart('municipal-coll-prompt', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [collPromptUS, collPromptAvg, collPromptS]
                }]
            });

            Highcharts.chart('municipal-comp-rate', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [compRateUS, compRateAvg, compRateS]
                }]
            });

            Highcharts.chart('municipal-team-eff', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [teamEffUS, teamEffAvg, teamEffS]
                }]
            });

            Highcharts.chart('municipal-bin-hand', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [binHandUS, binHandAvg, binHandS]
                }]
            });

            Highcharts.chart('municipal-spill-ctrl', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [spillCtrlUS, spillCtrlAvg, spillCtrlS]
                }]
            });

            Highcharts.chart('municipal-qry-resp', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [qryRespUS, qryRespAvg, qryRespS]
                }]
            });

            $http.get('/readSatisfactionMunicipal').then(function(response) {
                console.log(response.data);
            }, function(err) {
                console.log(err);
            });
        }, function(err) {
            console.log(err);
        });

        $http.post('/countSatisfaction', $scope.filters).then(function(response) {
            console.log(response.data);
            $scope.unreadMunicipal = response.data.municipal;
            $scope.unreadCommercial = response.data.commercial;
            $scope.unreadScheduled = response.data.scheduled;
        });
    };

    // $scope.getCommercialFeedback = function () {
    //     socket.emit('commercial satisfaction');
    //     $http.get('/customerFeedbackCommercial').then(function (response) {
    //         console.log(response.data);
    //         $scope.reviewsCommercial = response.data;
    //         $scope.totalItemsCommercial = response.data.length;
    //         $scope.collPromptCommercial = (response.data.collPrompt / 3) * 100;
    //         $scope.compRateCommercial = (response.data.compRate / 3) * 100;
    //         $scope.teamEffCommercial = (response.data.teamEff / 3) * 100;
    //         $scope.cleanliness = (response.data.cleanliness / 3) * 100;
    //         $scope.physicalCond = (response.data.physicalCond / 3) * 100;
    //         $scope.qryRespCommercial = (response.data.qryResp / 3) * 100;

    //         $scope.options = {
    //             animate: {
    //                 duration: 0,
    //                 enabled: false
    //             },
    //             barColor: '#2C3E50',
    //             scaleColor: false,
    //             lineWidth: 20,
    //             lineCap: 'circle'
    //         };

    //         $http.get('/readSatisfactionCommercial').then(function (repsonse) {
    //             console.log(response.data);
    //         }, function (err) {
    //             console.log(err);
    //         });
    //     }, function (err) {
    //         console.log(err);
    //     });

    //     $http.get('/unreadSatisfaction').then(function(response){
    //         $scope.unreadMunicipal = response.data.municipal;
    //         $scope.unreadCommercial = response.data.commercial;
    //         $scope.unreadScheduled = response.data.scheduled;
    //     });
    // };

    $scope.getCommercialFeedback = function() {
        socket.emit('commercial satisfaction');
        $http.post('/customerFeedbackCommercial', $scope.filters).then(function(response) {
            console.log(response.data);
            $scope.reviewsCommercial = response.data;
            $scope.totalItemsCommercial = response.data.comments.length;
            $scope.totalUnsatisfiedCom = $scope.reviewsCommercial.compRateUS + $scope.reviewsCommercial.teamEffUS + $scope.reviewsCommercial.collPromptUS + $scope.reviewsCommercial.cleanlinessUS + $scope.reviewsCommercial.physicalCondUS + $scope.reviewsCommercial.qryRespUS;
            $scope.totalSatisfiedCom = $scope.reviewsCommercial.compRateAvg + $scope.reviewsCommercial.teamEffAvg + $scope.reviewsCommercial.collPromptAvg + $scope.reviewsCommercial.cleanlinessAvg + $scope.reviewsCommercial.physicalCondAvg + $scope.reviewsCommercial.qryRespAvg;
            // $scope.totalSatisfiedCom = function(cr,te,cp,c,pc,qr){
            //     // console.log(cr);
            //     // console.log(te);
            //     // console.log(cp);
            //     // console.log(c);
            //     // console.log(pc);
            //     // console.log(qr);
            //     return cr+te+cp+c+pc+qr;
            // };
            $scope.totalVSatisfiedCom = $scope.reviewsCommercial.compRateS + $scope.reviewsCommercial.teamEffS + $scope.reviewsCommercial.collPromptS + $scope.reviewsCommercial.cleanlinessS + $scope.reviewsCommercial.physicalCondS + $scope.reviewsCommercial.qryRespS;
            
            var data = {...response.data };
            delete data.comments;
            $scope.commercialData = [];
            $scope.commercialData.push(data);

            //ng-csv filename
            if ($scope.filters.month == undefined) {
                $scope.filename = $scope.filters.year.value + "_custsatisfaction_commercial.xls";
            } else {
                $scope.filename = $scope.filters.year.value.toString() + "_" + $scope.filters.month.toString() + "_custsatisfaction_commercial.xls";
            }

            $scope.downloadxlsCommercial = function () {
                var blob = new Blob([document.getElementById('feedback-summary-commercial').innerHTML], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
                });
                saveAs(blob, $scope.filename);
            };

            var collPromptUS = parseInt(response.data.collPromptUS);
            var collPromptAvg = parseInt(response.data.collPromptAvg);
            var collPromptS = parseInt(response.data.collPromptS);

            var teamEffUS = parseInt(response.data.teamEffUS);
            var teamEffAvg = parseInt(response.data.teamEffAvg);
            var teamEffS = parseInt(response.data.teamEffS);

            var compRateUS = parseInt(response.data.compRateUS);
            var compRateAvg = parseInt(response.data.compRateAvg);
            var compRateS = parseInt(response.data.compRateS);

            var cleanlinessUS = parseInt(response.data.cleanlinessUS);
            var cleanlinessAvg = parseInt(response.data.cleanlinessAvg);
            var cleanlinessS = parseInt(response.data.cleanlinessS);

            var physicalCondUS = parseInt(response.data.physicalCondUS);
            var physicalCondAvg = parseInt(response.data.physicalCondAvg);
            var physicalCondS = parseInt(response.data.physicalCondS);

            var qryRespUS = parseInt(response.data.qryRespUS);
            var qryRespAvg = parseInt(response.data.qryRespAvg);
            var qryRespS = parseInt(response.data.qryRespS);

            Highcharts.chart('commercial-coll-prompt', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [collPromptUS, collPromptAvg, collPromptS]
                }]
            });

            Highcharts.chart('commercial-comp-rate', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [compRateUS, compRateAvg, compRateS]
                }]
            });

            Highcharts.chart('commercial-team-eff', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [teamEffUS, teamEffAvg, teamEffS]
                }]
            });

            Highcharts.chart('commercial-cleanliness', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [cleanlinessUS, cleanlinessAvg, cleanlinessS]
                }]
            });

            Highcharts.chart('commercial-physical-cond', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [physicalCondUS, physicalCondAvg, physicalCondS]
                }]
            });

            Highcharts.chart('commercial-qry-resp', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [qryRespUS, qryRespAvg, qryRespS]
                }]
            });

            $http.get('/readSatisfactionCommercial').then(function(response) {
                console.log(response.data);
            }, function(err) {
                console.log(err);
            });
        }, function(err) {
            console.log(err);
        });

        $http.post('/countSatisfaction', $scope.filters).then(function(response) {
            console.log(response.data);
            $scope.unreadMunicipal = response.data.municipal;
            $scope.unreadCommercial = response.data.commercial;
            $scope.unreadScheduled = response.data.scheduled;
        });
    };

    // $scope.getScheduledFeedback = function () {
    //     socket.emit('scheduled satisfaction');
    //     $http.get('/customerFeedbackScheduled').then(function (response) {
    //         console.log(response.data);
    //         $scope.reviewsScheduled = response.data;
    //         $scope.totalItemsScheduled = response.data.length;
    //         $scope.compRateScheduled = (response.data.compRate / 3) * 100;
    //         $scope.teamEffScheduled = (response.data.teamEff / 3) * 100;
    //         $scope.healthAdh = (response.data.healthAdh / 3) * 100;
    //         $scope.regAdh = (response.data.regAdh / 3) * 100;
    //         $scope.qryRespScheduled = (response.data.qryResp / 3) * 100;

    //         $scope.options = {
    //             animate: {
    //                 duration: 0,
    //                 enabled: false
    //             },
    //             barColor: '#2C3E50',
    //             scaleColor: false,
    //             lineWidth: 20,
    //             lineCap: 'circle'
    //         };

    //         $http.get('/readSatisfactionScheduled').then(function (repsonse) {
    //             console.log(response.data);
    //         }, function (err) {
    //             console.log(err);
    //         });
    //     }, function (err) {
    //         console.log(err);
    //     });

    //     $http.get('/unreadSatisfaction').then(function(response){
    //         $scope.unreadMunicipal = response.data.municipal;
    //         $scope.unreadCommercial = response.data.commercial;
    //         $scope.unreadScheduled = response.data.scheduled;
    //     });
    // };

    $scope.getScheduledFeedback = function() {
        socket.emit('scheduled satisfaction');
        $http.post('/customerFeedbackScheduled', $scope.filters).then(function(response) {
            console.log(response.data);
            $scope.reviewsScheduled = response.data;
            $scope.totalItemsScheduled = response.data.comments.length;
            $scope.totalUnsatisfiedS = $scope.reviewsScheduled.compRateUS + $scope.reviewsScheduled.teamEffUS + $scope.reviewsScheduled.regAdhUS + $scope.reviewsScheduled.healthAdhUS + $scope.reviewsScheduled.qryRespUS;
            $scope.totalSatisfiedS = $scope.reviewsScheduled.compRateAvg + $scope.reviewsScheduled.teamEffAvg + $scope.reviewsScheduled.regAdhAvg + $scope.reviewsScheduled.healthAdhAvg + $scope.reviewsScheduled.qryRespAvg;
            $scope.totalVSatisfiedS = $scope.reviewsScheduled.compRateS + $scope.reviewsScheduled.teamEffS + $scope.reviewsScheduled.regAdhS + $scope.reviewsScheduled.healthAdhS + $scope.reviewsScheduled.qryRespS;

            var data = {...response.data };
            delete data.comments;
            $scope.scheduledData = [];
            $scope.scheduledData.push(data);

            //ng-csv filename
            if ($scope.filters.month == undefined) {
                $scope.filename = $scope.filters.year.value + "_custsatisfaction_scheduled.xls";
            } else {
                $scope.filename = $scope.filters.year.value.toString() + "_" + $scope.filters.month.toString() + "_custsatisfaction_scheduled.xls";
            }

            $scope.downloadxlsScheduled = function () {
                var blob = new Blob([document.getElementById('feedback-summary-scheduled').innerHTML], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
                });
                saveAs(blob, $scope.filename);
            };

            var compRateUS = parseInt(response.data.compRateUS);
            var compRateAvg = parseInt(response.data.compRateAvg);
            var compRateS = parseInt(response.data.compRateS);

            var teamEffUS = parseInt(response.data.teamEffUS);
            var teamEffAvg = parseInt(response.data.teamEffAvg);
            var teamEffS = parseInt(response.data.teamEffS);

            var healthAdhUS = parseInt(response.data.healthAdhUS);
            var healthAdhAvg = parseInt(response.data.healthAdhAvg);
            var healthAdhS = parseInt(response.data.healthAdhS);

            var regAdhUS = parseInt(response.data.regAdhUS);
            var regAdhAvg = parseInt(response.data.regAdhAvg);
            var regAdhS = parseInt(response.data.regAdhS);

            var qryRespUS = parseInt(response.data.qryRespUS);
            var qryRespAvg = parseInt(response.data.qryRespAvg);
            var qryRespS = parseInt(response.data.qryRespS);

            Highcharts.chart('scheduled-comp-rate', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [compRateUS, compRateAvg, compRateS]
                }]
            });

            Highcharts.chart('scheduled-team-eff', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [teamEffUS, teamEffAvg, teamEffS]
                }]
            });

            Highcharts.chart('scheduled-health-adh', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [healthAdhUS, healthAdhAvg, healthAdhS]
                }]
            });

            Highcharts.chart('scheduled-reg-adh', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [regAdhUS, regAdhAvg, regAdhS]
                }]
            });

            Highcharts.chart('scheduled-qry-resp', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Not Satisfied',
                        'Satisfied',
                        'Very Satisfied'
                    ]
                },
                series: [{
                    name: 'Customer Satisfaction',
                    data: [qryRespUS, qryRespAvg, qryRespS]
                }]
            });

            $http.get('/readSatisfactionScheduled').then(function(response) {
                console.log(response.data);
            }, function(err) {
                console.log(err);
            });
        }, function(err) {
            console.log(err);
        });

        $http.post('/countSatisfaction', $scope.filters).then(function(response) {
            console.log(response.data);
            $scope.unreadMunicipal = response.data.municipal;
            $scope.unreadCommercial = response.data.commercial;
            $scope.unreadScheduled = response.data.scheduled;
        });
    };

    //auto-fill satisfaction form date
    console.log(today);
    var today = new Date();
    $scope.m.date = today;
    $scope.c.date = today;
    $scope.s.date = today;

    $scope.m.formattedDate = $filter('date')($scope.m.date, 'yyyy-MM-dd HH:mm:ss');
    $scope.c.formattedDate = $filter('date')($scope.c.date, 'yyyy-MM-dd HH:mm:ss');;
    $scope.s.formattedDate = $filter('date')($scope.s.date, 'yyyy-MM-dd HH:mm:ss');;

    $scope.resetFormM = function() {
        $scope.m.date = today;
        $scope.m.name = '';
        $scope.m.company = '';
        $scope.m.address = '';
        $scope.m.number = '';
        $scope.m.compRate = '';
        $scope.m.teamEff = '';
        $scope.m.collPrompt = '';
        $scope.m.binHand = '';
        $scope.m.spillCtrl = '';
        $scope.m.qryResp = '';
        $scope.m.extraComment = '';
    }

    $scope.resetFormC = function() {
        $scope.c.date = today;
        $scope.c.name = '';
        $scope.c.company = '';
        $scope.c.address = '';
        $scope.c.number = '';
        $scope.c.compRate = '';
        $scope.c.teamEff = '';
        $scope.c.collPrompt = '';
        $scope.c.cleanliness = '';
        $scope.c.physicalCond = '';
        $scope.c.qryResp = '';
        $scope.c.extraComment = '';
    }

    $scope.resetFormS = function() {
        $scope.s.date = today;
        $scope.s.name = '';
        $scope.s.company = '';
        $scope.s.address = '';
        $scope.s.number = '';
        $scope.s.compRate = '';
        $scope.s.teamEff = '';
        $scope.s.healthAdh = '';
        $scope.s.regAdh = '';
        $scope.s.qryResp = '';
        $scope.s.extraComment = '';
    }

    $scope.addFeedback = function(type) {
        console.log($scope.m);
        if (type == "municipal") {
            $http.post('/addMunicipal', $scope.m).then(function(response) {
                var returnedData = response.data;

                if (returnedData === "success") {
                    angular.element('body').overhang({
                        type: "success",
                        "message": "Feedback added successfully!"
                    });

                    $scope.getMunicipalFeedback(); //REFRESH DETAILS

                    angular.element('#municipal-form').modal('toggle');
                }
            });
        } else if (type == "commercial") {
            $http.post('/addCommercial', $scope.c).then(function(response) {
                var returnedData = response.data;

                if (returnedData === "success") {
                    angular.element('body').overhang({
                        type: "success",
                        "message": "Feedback added successfully!"
                    });

                    $scope.getCommercialFeedback(); //REFRESH DETAILS

                    angular.element('#commercial-form').modal('toggle');
                }
            });
        } else {
            $http.post('/addScheduled', $scope.s).then(function(response) {
                var returnedData = response.data;

                if (returnedData === "success") {
                    angular.element('body').overhang({
                        type: "success",
                        "message": "Feedback added successfully!"
                    });

                    $scope.getScheduledFeedback(); //REFRESH DETAILS

                    angular.element('#scheduled-form').modal('toggle');
                }
            });
        }
    };
});

app.controller('binReqDetailCtrl', function($scope, $filter, $http, $routeParams) {
    'use strict';
    $scope.entry = {};
    $scope.req = {
        'id': $routeParams.reqID
    };

    $http.post('/getBinReqDetail', $scope.req).then(function(response) {
        var request = response.data;
        $scope.reqDetail = {
            'name': request[0].name,
            'companyName': request[0].companyName,
            'address': request[0].requestAddress,
            'companyAddress': request[0].companyAddress,
            'reason': request[0].reason,
            'remarks': request[0].remarks,
            'type': request[0].type,
            'contactNumber': request[0].contactNumber,
            'status': request[0].status,
            'icImg': request[0].icImg,
            'binImg': request[0].binImg,
            'utilityImg': request[0].utilityImg,
            'assessmentImg': request[0].assessmentImg,
            'tradingImg': request[0].tradingImg,
            'policeImg': request[0].policeImg,
            'reqDate': request[0].dateRequest,
            'reqID': request[0].reqID
        };

        $scope.entry.acrBin = 'no';
    });

    $scope.saveBinRequestStatus = function(status, id) {
        //scope.showBinRequest = !scope.showBinRequest;

        $scope.thisBinRequest = {
            "status": status,
            "id": id
        };

        if (status == 'Approved') {
            angular.element('#confirmStatus').modal('toggle');
        } else {
            $scope.thisBinRequest.from = $filter('date')($scope.thisBinRequest.from, 'yyyy-MM-dd');
            $scope.thisBinRequest.to = $filter('date')($scope.thisBinRequest.to, 'yyyy-MM-dd');

            console.log($scope.thisBinRequest);
            $http.post('/updateBinRequest', $scope.thisBinRequest).then(function(response) {
                var data = response.data;
                angular.element('body').overhang({
                    type: 'success',
                    message: 'Status Updated!'
                });


                console.log(data);
            }, function(error) {
                console.log(error);
            });
        }


    };

    $scope.confirmStatus = function() {
        $scope.entry.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.entry.status = "Approved";
        $scope.entry.id = $routeParams.reqID;

        $scope.entry.formattedFrom = $filter('date')($scope.entry.from, 'yyyy-MM-dd');
        $scope.entry.formattedTo = $filter('date')($scope.entry.to, 'yyyy-MM-dd');
        $http.post('/updateBinRequest', $scope.entry).then(function(response) {
            var data = response.data;
            angular.element('body').overhang({
                type: 'success',
                message: 'Status Updated!'
            });

            angular.element('#confirmStatus').modal('toggle');
            console.log(data);
        }, function(error) {
            console.log(error);
        });
    }

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

    if (position == "Manager" || position == "Administrator" || position == "Developer") {
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
    socket.emit('authorize request');
    // socket.emit('satisfaction form');

    // socket.emit('binrequest');

    // socket.emit('enquiry');

    // socket.emit('complaint');

    $http.post('/loadMenu', {
        "position": position
    }).then(function(response) {

        //        console.log(response.data);
        $('ul.menu__level').html(response.data.content);
    });

    $http.get('/unreadCustFeedbackCount').then(function(response){
        if(response.data != 0){
            $('.satisfaction').addClass("badge badge-danger").html(response.data);
        }
    });

    $http.get('/unreadEnquiryCount').then(function(response){
        if(response.data != 0){
            $('.enquiry').addClass("badge badge-danger").html(response.data);
        }
    });

    $http.get('/unreadBinRequestCount').then(function(response){
        if(response.data != 0){
            $('.binrequest').addClass("badge badge-danger").html(response.data);   
        }
    });

    $http.get('/unreadComplaintCount').then(function(response){
        if(response.data != 0){
            $('.complaint').addClass("badge badge-danger").html(response.data);   
        }
    });
});

app.controller('managerController', function($scope, $http, $filter) {
    'use strict';

    $scope.markerList = [];
    var daily_time = [24, 0, 0];
    var cur_time = $filter('date')(new Date(), 'HH:mm:ss');
    var cur_time_in_arr = cur_time.split(':');
    var diff_hour, diff_min, diff_sec;
    var flag_hour, flag_min, flag_sec;
    var seconds, mili_sec;

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

        if (data.length > 0) {
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
        }

        return objReturn;
    }
    var dateobj = new Date();
    var getday = dateobj.getDay();
    $scope.day = "";
    $scope.ytd = "";

    if (getday == 1) {
        $scope.day = "mon";
        $scope.ytd = "sun";
    } else if (getday == 2) {
        $scope.day = "tue";
        $scope.ytd = "mon";
    } else if (getday == 3) {
        $scope.day = "wed";
        $scope.ytd = "tue";
    } else if (getday == 4) {
        $scope.day = "thu";
        $scope.ytd = "wed";
    } else if (getday == 5) {
        $scope.day = "fri";
        $scope.ytd = "thu";
    } else if (getday == 6) {
        $scope.day = "sat";
        $scope.ytd = "fri";
    } else if (getday == 0) {
        $scope.day = "sun";
        $scope.ytd = "sat";
    }

    $http.post('/getTodayAreaCount', {
        "day": $scope.day
    }).then(function(response) {
        $scope.todayAreaCount = response.data[0].todayAreaCount;
    });

    $http.post('/getTodayAreaCount', {
        "day": $scope.ytd
    }).then(function(response) {
        $scope.ytdAreaCount = response.data[0].todayAreaCount;
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
        $scope.lgTotal = data.lgTotal;
        $scope.lgOpen = data.lgOpen;
        $scope.lgPending = data.lgPending;
        $scope.lgClosed = data.lgClosed;
        $scope.bdTotal = data.bdTotal;
        $scope.bdOpen = data.bdOpen;
        $scope.bdPending = data.bdPending;
        $scope.bdClosed = data.bdClosed;
        $scope.complaintCount = data.complaint;
        $scope.reportCompleteCount = data.completeReport;
        $scope.reportIncompleteCount = data.incompleteReport;
        $scope.unsubmittedCount = $scope.todayAreaCount - ($scope.reportCompleteCount + $scope.reportIncompleteCount);
        $scope.ytdReportCompleteCount = data.ytdCompleteReport;
        $scope.ytdReportIncompleteCount = data.ytdIncompleteReport;
        $scope.ytdUnsubmittedCount = $scope.ytdAreaCount - ($scope.ytdReportCompleteCount + $scope.ytdReportIncompleteCount);
    });

    $http.post('/getUnsubmitted', {
        "day": $scope.day
    }).then(function(response) {
        if (response.data.length > 0) {
            $scope.unsubmitted = response.data;
        } else {
            $scope.unsubmitted = [];
        }
    });
    $http.post('/getSubmitted', {
        "day": $scope.day
    }).then(function(response) {
        if (response.data.length > 0) {
            $scope.submitted = response.data;
        } else {
            $scope.submitted = [];
        }
    });

    $http.post('/getDataVisualization', $scope.visualdate).then(function(response) {
        //        console.log(response.data)
        if (response.data.length > 0) {
            $scope.visualObject = response.data;
        } else {
            $scope.visualObject = [];
        }
    });
    $http.post('/getDataVisualizationGroupByDate', $scope.visualdate).then(function(response) {
        //        console.log(response.data);
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
    //    var src = '../KUCHING_COLLECTION_ZONE DIGITAL_MAP.kml',
    //        kmlLayer;
    //    var src = '../split.kml', kmlLayer;

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

    //    var myParser = new geoXML3.parser({
    //        map: map
    //    });
    //    myParser.parse(src);

    //--------------------------------------------------------
    //    fetch(src)
    //    .then(function (resp) {
    //        return resp.text();
    //    })
    //    .then(function (data) {
    //        var parser = new DOMParser(),
    //            xmlDoc = parser.parseFromString(data, 'text/xml'),
    //            read_placemark = xmlDoc.getElementsByTagName("Placemark"),
    //            read_name = xmlDoc.getElementsByTagName("name"),
    //            read_color = xmlDoc.getElementsByTagName("styleUrl"),
    //            read_coordinates = xmlDoc.getElementsByTagName("coordinates"),
    //            boundary = [],
    //            coordinateSpliter,
    //            thisColor,
    //            thisName,
    //            thisCoordinate = [],
    //            formattedBoundary = [],
    //            _prev,
    //            _this;
    //
    //        for (var i = 0; i < read_placemark.length; i++) {
    //            thisName = (read_placemark[i].querySelector("name").textContent).split(" ")[0];
    //            thisColor = (read_placemark[i].querySelector("styleUrl").textContent).split("-")[1];
    //            coordinateSpliter = (read_placemark[i].querySelector("coordinates").textContent).split(",");
    //            boundary.push({"name": thisName, "color": thisColor, "coordinates": coordinateSpliter});
    //        }
    //
    //        for (var i = 0; i < boundary.length; i++) {
    //            for (var j = 0; j < boundary[i].coordinates.length; j++) {
    //                _this = (boundary[i].coordinates[j]).replace(/ +/g, "");
    //                _this = _this.replace(/^0+/, "");
    //                _this = parseFloat(_this).toFixed(7);
    //                if (j !== 0) {
    //                    _prev = (boundary[i].coordinates[j - 1]).replace(/ +/g, "");
    //                    _prev = _prev.replace(/^0+/, "");
    //                    _prev = parseFloat(_prev).toFixed(7);
    //                }
    //                if (_this !== "NaN") {
    //                    if (j % 2 !== 0) {
    //                        thisCoordinate.push({"lng": _prev, "lat": _this});
    //                    }
    //                }
    //            }
    //            formattedBoundary.push({"id": (i + 1), "area": boundary[i].name, "areaID": '', "color": boundary[i].color, "latLngs": thisCoordinate});
    //            thisCoordinate = [];
    //        }
    //
    //        $http.get('/bounArea').then(function (response) {
    //            var bounArea = response.data;
    //
    //            for (var i = 0; i < formattedBoundary.length; i++) {
    //                for (var j = 0; j < bounArea.length; j++) {
    //                    if (formattedBoundary[i].area === bounArea[j].area) {
    //                        formattedBoundary[i].areaID = bounArea[j].areaID;
    //                    }
    //                }
    //            }
    //        }).then(function () {
    //            for (var i = 0; i < formattedBoundary.length; i++) {
    //                if (formattedBoundary[i].areaID === '') {
    //                    formattedBoundary[i].areaID = 'ARE201911100003';
    //                }
    //            }
    //            //cc();
    //        });
    //
    //        function cc() {
    //            $http.post('/createBoundary', {polygons: formattedBoundary}).then(function (response) {
    //                console.log('ok');
    //            });
    //        }
    //    });
    //--------------------------------------------------------

    $http.get('/livemap').then(function(response) {
        var data = response.data,
            coordinate = {
                "lat": '',
                "lng": ''
            },
            dot = {
                "url": ''
            },
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

        diff_hour = (daily_time[0] - parseInt(cur_time_in_arr[0], 10));
        diff_min = (daily_time[1] - parseInt(cur_time_in_arr[1], 10));
        diff_sec = (daily_time[2] - parseInt(cur_time_in_arr[2], 10));

        seconds = (+diff_hour) * 60 * 60 + (+diff_min) * 60 + (+diff_sec);
        mili_sec = (seconds * 1000);

        var noti_mili_sec = (mili_sec - 30000);

        setTimeout(function() {
            lobi_notify('info', 'Reset Live Map', 'Live Map Indicator is going to reset after 30 seconds.', '');
        }, noti_mili_sec);

        setTimeout(function() {
            $.each(data, function(key, value) {
                coordinate.lat = value.latitude;
                coordinate.lng = value.longitude;
                dot.url = '../styles/mapmarkers/rd.png';

                marker = new google.maps.Marker({
                    id: value.serialNo,
                    position: coordinate,
                    icon: dot
                });
                marker.setMap(map);
                $scope.markerList.push(marker);
            });
        }, mili_sec);

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
                    "code": areaCode[index],
                    "submit": 'false'
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
        //        console.log($scope.areaList);
    });

    $http.post('/getPassReportingAreaList', $scope.getPassReport).then(function(response) {
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
            $scope.passAreaList.push({
                "zone": {
                    "id": value.zoneID,
                    "name": value.zoneName
                },
                "area": passArea
            });
        });
    });

    $http.post('/getReportOfficerTodayUnsubmitted', $scope.reportingOfficerId).then(function(response) {
        $scope.getROUnsubmitted = response.data;
    });
    $http.post('/getReportOfficerTodaySubmitted', $scope.reportingOfficerId).then(function(response) {
        $scope.getROSubmitted = response.data;
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
        if ($scope.area.code == null || $scope.area.code == "" || $scope.area.name == null || $scope.area.name == "" || $scope.area.zone == null || $scope.area.zone == "" || $scope.area.staff == null || $scope.area.staff == "" || $scope.area.driver == null || $scope.area.driver == "") {
            $scope.notify("error", "There Has Blank Column.");
            $scope.showCreateBtn = true;
        } else {
            $scope.area.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $scope.area.iam = window.sessionStorage.getItem('owner');
            $http.post('/addArea', $scope.area).then(function(response) {
                var data = response.data;
                $scope.notify(data.status, data.message);

                if (data.status === "success") {
                    socket.emit('authorize request');
                    angular.element('#createArea').modal('toggle');
                }
                $scope.showCreateBtn = true;
            });
        }
    }

    socket.on('append area list', function(data) {
        $scope.areaList.push({
            "id": data.id,
            "code": (data.zoneCode + data.code),
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

    $http.get('/getReportingOfficerList').then(function(response) {
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
        if ($scope.area.frequency == "") {
            angular.element('body').overhang({
                "type": "error",
                "message": "Please Fill In Collection Frequency"
            });
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

app.controller('overallReportController', function($scope, $http, $filter, $window, storeDataService) {
    'use strict';

    var dateobj = new Date();
    var getday = dateobj.getDay();
    $scope.day = "";
    $scope.todayDate = new Date();

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
    } else if (getday == 0) {
        $scope.day = "sun";
    }

    $http.post('/getTodayAreaCount', {
        "day": $scope.day
    }).then(function(response) {
        $scope.todayAreaCount = response.data[0].todayAreaCount;
    });

    setTimeout(function() {
        $http.get('/getCount').then(function(response) {
            var data = response.data;

            $scope.reportCompleteCount = data.completeReport;
            $scope.reportIncompleteCount = data.incompleteReport;
            $scope.unsubmittedCount = $scope.todayAreaCount - ($scope.reportCompleteCount + $scope.reportIncompleteCount);

            $scope.progressBarFormat = ($scope.reportCompleteCount + $scope.reportIncompleteCount).toString() + " / " + $scope.todayAreaCount.toString();
            $scope.progressBarPercent = Math.round(($scope.reportCompleteCount + $scope.reportIncompleteCount) / $scope.todayAreaCount * 100) / 100;

            $scope.email_params = {
                "receivers": "",
                "todayDate": $filter('date')($scope.todayDate, 'mediumDate'),
                "submittedCount": ($scope.reportCompleteCount + $scope.reportIncompleteCount).toString(),
                "completeReport": $scope.reportCompleteCount.toString(),
                "incompleteReport": $scope.reportIncompleteCount.toString(),
                "unsubmittedCount": $scope.unsubmittedCount.toString(),
                "imageSource": "imageSource_value"
            }
        });
    }, 500);


    $http.post('/getUnsubmittedToday', {
        "day": $scope.day
    }).then(function(response) {
        if (response.data.length > 0) {
            $scope.unsubmittedReport = response.data;
        } else {
            $scope.unsubmittedReport = [];
        }
    });
    $http.post('/getSubmittedReportDetail', {
        "day": $scope.day
    }).then(function(response) {
        if (response.data.length > 0) {
            $scope.submittedReport = response.data;
        } else {
            $scope.submittedReport = [];
        }
    });

    $http.get('/external/email_settings.json').then(function(response) {

        var time = new Date();
        time.setHours(response.data.time.split(":")[0]);
        time.setMinutes(response.data.time.split(":")[1]);
        time.setSeconds(0);
        time.setMilliseconds(0);

        $scope.emailSettings = response.data;
        $scope.emailSettings.time = time;
    });
    $scope.saveSettings = function() {
        $scope.emailSettings.time = $filter('date')($scope.emailSettings.time, 'HH:mm:ss');
        $http.post('/saveExternalEmailSettings', $scope.emailSettings).then(function(response) {
            console.log(response.data);
        });
        $('#emailSettings').modal('toggle');
    }

    //    $scope.exportImg = function(){
    //        var filename = 'OverallReport.jpeg';
    //
    //        html2canvas(document.querySelector('#exportPDF'), {
    //        }).then(function(canvas) {
    //            var img = new Image();
    //            img.setAttribute('crossOrigin', 'anonymous');
    //            img.src = canvas.toDataURL("image/jpeg");            
    //            var link = document.createElement('a');
    //            link.download = filename;
    //            link.href = img.src
    //            link.click();           
    //        });
    //    }

    $scope.sendEmail = function() {
        html2canvas(document.querySelector('#exportPDF'), {}).then(function(canvas) {
            var img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.src = canvas.toDataURL("image/jpeg");
            var imageSource = {
                "imgSrc": img.src
            }
            $http.post('/sendEmailImageToBucket', imageSource).then(function(response) {

                //send email
                emailjs.init("user_kYs7EdKvcyVAmXd0IUZau");
                $scope.email_params.receivers = $scope.emailSettings.receivers;
                $scope.email_params.imageSource = response.data;
                console.log($scope.email_params);
                var service_id = "gmail";
                var template_id = "overall_report";
                emailjs.send(service_id, template_id, $scope.email_params);
                alert("email sent!");
            });
        });

        $('#emailSettings').modal('toggle');
    }

    setTimeout(function() {


        var chart = new Highcharts.Chart({
            title: {
                text: 'Report Submission Progress Bar',
                align: 'left',
                margin: 0,
            },
            chart: {
                renderTo: 'progressBar',
                type: 'bar',
                height: 90,
            },
            credits: false,
            tooltip: false,
            legend: false,
            navigation: {
                buttonOptions: {
                    enabled: false
                }
            },
            xAxis: {
                visible: false,
            },
            yAxis: {
                visible: false,
                min: 0,
                max: 100,
            },
            series: [{
                data: [100],
                grouping: false,
                animation: false,
                enableMouseTracking: false,
                showInLegend: false,
                color: 'lightskyblue',
                pointWidth: 50,
                borderWidth: 0,
                borderRadiusTopLeft: '5px',
                borderRadiusTopRight: '5px',
                borderRadiusBottomLeft: '5px',
                borderRadiusBottomRight: '5px',
                dataLabels: {
                    className: 'highlight',
                    format: $scope.progressBarFormat,
                    enabled: true,
                    align: 'right',
                    style: {
                        color: 'white',
                        textOutline: false,
                    }
                }
            }, {
                enableMouseTracking: false,
                data: $scope.progressBarPercent,
                borderRadiusBottomLeft: '4px',
                borderRadiusBottomRight: '4px',
                color: 'lightgreen',
                borderWidth: 0,
                pointWidth: 50,
                animation: {
                    duration: 250,
                },
                dataLabels: {
                    enabled: true,
                    inside: true,
                    align: 'left',
                    format: '{point.y}%',
                    style: {
                        color: 'white',
                        textOutline: false,
                    }
                }
            }]
        });
    }, 1200);



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

        if ($scope.staff.name == "") {
            $scope.notify("error", "Staff Name Cannot Be Blank");
            $scope.showCreateBtn = true;
            $scope.sendRequest = false;
        } else {
            if ($scope.staff.position.name == "Driver") {
                $scope.showCreateBtn = false;
                $scope.sendRequest = true;
            } else {
                if ($scope.staff.username == "" || $scope.staff.password == "") {
                    $scope.notify("error", "Staff User Name and Password Cannot Be Blank");
                    $scope.showCreateBtn = true;
                    $scope.sendRequest = false;
                } else {
                    $scope.showCreateBtn = false;
                    $scope.sendRequest = true;
                }
            }
        }

        if ($scope.sendRequest == true) {

            //create variables in json object
            $http.post('/addUser', $scope.staff).then(function(response) {
                var data = response.data;

                if (data.status === "success") {
                    socket.emit('authorize request');
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

        storeDataService.truck = angular.copy($scope.truckList);

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

    $http.get('/getDriverList').then(function(response) {
        $scope.driverList = response.data;
        $scope.truck.driver = $scope.driverList[0];
    });
    $http.get('/getAreaList').then(function(response) {
        $scope.renderSltPicker();
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
            $scope.renderSltPicker();
        });
    });

    $scope.addTruck = function() {
        $scope.showCreateBtn = false;
        if ($scope.truck.no == null || $scope.truck.transporter == null || $scope.truck.ton == null || $scope.truck.roadtax == null || $scope.truck.no == "" || $scope.truck.transporter == "" || $scope.truck.ton == "" || $scope.truck.roadtax == "") {
            $scope.notify("error", "There Has Blank Column");
            $scope.showCreateBtn = true;
        } else {

            $scope.truck.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $scope.truck.roadtax = $filter('date')($scope.truck.roadtax, 'yyyy-MM-dd');
            $scope.truck.iam = window.sessionStorage.getItem('owner');
            $http.post('/addTruck', $scope.truck).then(function(response) {
                var data = response.data;
                //                var newTruckID = data.details.truckID;

                $scope.notify(data.status, data.message);
                if (data.status === "success") {
                    socket.emit('authorize request');
                    angular.element('#createTruck').modal('toggle');
                    $scope.initializeTruck();
                }
                $scope.showCreateBtn = true;
            });

        }
    };

    socket.on('append truck list', function(data) {
        data.roadtax = $filter('date')(data.roadtax, 'yyyy-MM-dd');
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
        if ($scope.zone.code == null || $scope.zone.code == "" || $scope.zone.name == null || $scope.zone.code == "") {
            $scope.notify("error", "There Has Blank Column");
            $scope.showCreateBtn = true;
        } else {
            $scope.zone.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $scope.zone.iam = window.sessionStorage.getItem('owner');
            $http.post('/addZone', $scope.zone).then(function(response) {
                var data = response.data;

                $scope.notify(data.status, data.message);
                if (data.status === "success") {
                    socket.emit('authorize request');
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
            "code": data.code,
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
        if ($scope.role.name == null || $scope.role.name == "") {
            $scope.notify("error", "Role Name Cannot be Blank.");
            $scope.showCreateBtn = true;
        } else {
            $http.post('/addRole', $scope.role).then(function(response) {
                var data = response.data;
                $scope.notify(data.status, data.message);
                if (data.status == "success") {
                    $scope.roleList.push({
                        "id": data.details.roleID,
                        "name": $scope.role.name,
                        "status": "ACTIVE"
                    });
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
        "managerDashboard": {
            "show": 'I',
        },
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
            "view": 'I',
            "checkView": 'I',
            "verifyView": 'I'
        },
        "transactionLog": {
            "view": 'I'
        },
        "dcsDetails": {
            "view": 'I',
            "edit": 'I',
            "create": 'I',
            "checkView": 'I',
            "verifyView": 'I'
        },
        "bdafDetails": {
            "view": 'I',
            "edit": 'I',
            "create": 'I',
            "checkView": 'I',
            "verifyView": 'I'
        },
        "dbdDetails": {
            "view": 'I',
            "edit": 'I',
            "create": 'I',
            "checkView": 'I',
            "verifyView": 'I'
        },
        "dbrDetails": {
            "view": 'I',
            "edit": 'I',
            "create": 'I',
            "checkView": 'I',
            "verifyView": 'I'
        },
        "blostDetails": {
            "view": 'I',
            "edit": 'I',
            "create": 'I',
            "checkView": 'I',
            "verifyView": 'I'
        },
        "reporting": {
            "view": 'I',
            "edit": 'I',
            "create": 'I',
            "export": 'I',
            "check": 'I',
            "feedback": 'I'
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
        // "custService": {
        //     "upload": 'I',
        //     "send": 'I',
        //     "approve": 'I',
        //     "view": 'I'
        // }
        "banner": {
            "upload": 'I'
        },
        "notif": {
            "send": 'I'
        },
        "binrequest": {
            "approve": 'I'
        },
        "feedback": {
            "view": 'I'
        },
        "enquiry": {
            "view": 'I'
        },
        "newBusiness": {
            "view": 'I',
            "create": 'I',
            "edit": 'I'
        },
        "binStock": {
            "view": 'I',
            "create": 'I',
            "edit": 'I'
        },
        "role": {
            "view": 'I'
        },
        "user": {
            "approve": 'I'
        },
        "damagedBin": {
            "view": 'I',
            "edit": 'I',
            "create": 'I'
        },
        "lostBin": {
            "view": 'I',
            "edit": 'I',
            "create": 'I'
        },
        "complaintapp": {
            "view": 'I'
        },            
        "complaintweb": {
            "view": 'I',
            "create": 'I',
            "hist": 'I',
            "editcms": 'I'
        },
        "complaintlogs":{
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

        console.log($scope.thisAuth);

        $http.post('/setAuth', $scope.thisAuth).then(function(response) {
            var data = response.data;
            console.log(data);
            $scope.notify(data.status, data.message);
            storeDataService.show = angular.copy($scope.auth);
        });
    }

    $scope.updateRoleName = function() {
        $scope.showSaveBtn = false;
        if ($scope.role.name == null || $scope.role.name == "") {
            $scope.notify("error", "Role Name Cannot be Blank.");
            $scope.showSaveBtn = true;
        } else {


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
                        "managerDashboard": {
                            "show": 'A'
                        },
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
                            "bdview": 'A',
                            "checkView": 'A',
                            "verifyView": 'A'
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
                            "view": 'A',
                            "checkView": 'A',
                            "verifyView": 'A'
                        },
                        "transactionLog": {
                            "view": 'A'
                        },
                        "dcsDetails": {
                            "view": 'A',
                            "edit": 'A',
                            "create": 'A',
                            "checkView": 'A',
                            "verifyView": 'A'
                        },
                        "bdafDetails": {
                            "view": 'A',
                            "edit": 'A',
                            "create": 'A',
                            "checkView": 'A',
                            "verifyView": 'A'
                        },
                        "dbdDetails": {
                            "view": 'A',
                            "edit": 'A',
                            "create": 'A',
                            "checkView": 'A',
                            "verifyView": 'A'
                        },
                        "dbrDetails": {
                            "view": 'A',
                            "edit": 'A',
                            "create": 'A',
                            "checkView": 'A',
                            "verifyView": 'A'
                        },
                        "blostDetails": {
                            "view": 'A',
                            "edit": 'A',
                            "create": 'A',
                            "checkView": 'A',
                            "verifyView": 'A'
                        },
                        "reporting": {
                            "view": 'A',
                            "edit": 'A',
                            "create": 'A',
                            "export": 'A',
                            "check": 'A',
                            "feedback": 'A'
                        },
                        "delivery": {
                            "view": 'A',
                            "edit": 'A',
                            "create": 'A'
                        },
                        // "custService": {
                        //     "upload": 'I',
                        //     "send": 'I',
                        //     "approve": 'I',
                        //     "view": 'I'
                        // }
                        "banner": {
                            "upload": 'A'
                        },
                        "notif": {
                            "send": 'A'
                        },
                        "binrequest": {
                            "approve": 'A'
                        },
                        "feedback": {
                            "view": 'A'
                        },
                        "enquiry": {
                            "view": 'A'
                        },
                        "newBusiness": {
                            "view": 'I',
                            "create": 'I',
                            "edit": 'I'
                        },
                        "binStock": {
                            "view": 'I',
                            "create": 'I',
                            "edit": 'I'
                        },
                        "role": {
                            "view": 'I'
                        },
                        "user": {
                            "approve": 'A'
                        },
                        "damagedBin": {
                            "view": 'A',
                            "edit": 'A',
                            "create": 'A'
                        },
                        "lostBin": {
                            "view": 'A',
                            "edit": 'A',
                            "create": 'A'
                        },
                        "complaintapp": {
                            "view": 'A'
                        },            
                        "complaintweb": {
                            "view": 'A',
                            "create": 'A',
                            "hist": 'A',
                            "editcms": 'A'
                        },
                        "complaintlogs":{
                            "view": 'A'
                        }
                    };
                }
            });

        } else if ($scope.checkall == true) {
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
                        "managerDashboard": {
                            "show": 'I'
                        },
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
                            "view": 'I',
                            "checkView": 'I',
                            "verifyView": 'I'
                        },
                        "transactionLog": {
                            "view": 'I'
                        },
                        "dcsDetails": {
                            "view": 'I',
                            "edit": 'I',
                            "create": 'I',
                            "checkView": 'I',
                            "verifyView": 'I'
                        },
                        "bdafDetails": {
                            "view": 'I',
                            "edit": 'I',
                            "create": 'I',
                            "checkView": 'I',
                            "verifyView": 'I'
                        },
                        "dbdDetails": {
                            "view": 'I',
                            "edit": 'I',
                            "create": 'I',
                            "checkView": 'I',
                            "verifyView": 'I'
                        },
                        "dbrDetails": {
                            "view": 'I',
                            "edit": 'I',
                            "create": 'I',
                            "checkView": 'I',
                            "verifyView": 'I'
                        },
                        "blostDetails": {
                            "view": 'I',
                            "edit": 'I',
                            "create": 'I',
                            "checkView": 'I',
                            "verifyView": 'I'
                        },
                        "reporting": {
                            "view": 'I',
                            "edit": 'I',
                            "create": 'I',
                            "export": 'I',
                            "check": 'I'
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
                        // "custService": {
                        //     "upload": 'I',
                        //     "send": 'I',
                        //     "approve": 'I',
                        //     "view": 'I'
                        // }
                        "banner": {
                            "upload": 'I'
                        },
                        "notif": {
                            "send": 'I'
                        },
                        "binrequest": {
                            "approve": 'I'
                        },
                        "feedback": {
                            "view": 'I'
                        },
                        "enquiry": {
                            "view": 'I'
                        },
                        "role": {
                            "view": 'I'
                        },
                        "user": {
                            "approve": 'I'
                        },
                        "damagedBin": {
                            "view": 'I',
                            "edit": 'I',
                            "create": 'I'
                        },
                        "lostBin": {
                            "view": 'I',
                            "edit": 'I',
                            "create": 'I'
                        },
                        "complaintapp": {
                            "view": 'I'
                        },            
                        "complaintweb": {
                            "view": 'I',
                            "create": 'I',
                            "hist": 'I',
                            "editcms": 'I'
                        },
                        "complaintlogs":{
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
    $scope.areaList = [];
    $scope.showCreateBtn = true;
    $scope.statusList = true;

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

    $scope.updateStatusList = function() {
        $scope.binList = $scope.statusList == true ? angular.copy($scope.binListActive) : angular.copy($scope.binListInactive);
        $scope.totalItems = $scope.binList.length;

        //        //$scope.filterAreaList = angular.copy($scope.binList);
        //        //$scope.totalItems = $scope.filterAreaList.length;
    }

    $http.get('/getAllBinCenter', $scope.currentStatus).then(function(response) {
        $scope.searchBinFilter = '';
        $scope.binList = response.data;
        $scope.filterBinList = [];
        $scope.binListActive = [];
        $scope.binListInactive = [];

        $.each($scope.binList, function(index, value) {
            $scope.binList[index].areacode = $scope.binList[index].area + ',' + $scope.binList[index].areaCode;
        });

        storeDataService.bin = angular.copy($scope.binList);

        $scope.searchBin = function(bin) {
            return (bin.id + bin.name + bin.location + bin.areaCode + bin.status).toUpperCase().indexOf($scope.searchBinFilter.toUpperCase()) >= 0;
        };

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
        $scope.renderSltPicker();
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
            $scope.areaList.push({
                "zone": {
                    "id": value.zoneID,
                    "name": value.zoneName
                },
                "area": area
            });
        });
        $('.selectpicker').on('change', function() {
            $scope.renderSltPicker();
        });
    });

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
            $http.post('/addBinCenter', $scope.bin).then(function(response) {
                var data = response.data;
                //var newBinID = data.details.binID;

                $scope.notify(data.status, data.message);
                if (data.status === "success") {
                    socket.emit('authorize request');
                    angular.element('#createBin').modal('toggle');
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
                    newPoint.push({
                        "lat": selectedShape.getPath().getAt(i).lat(),
                        "lng": selectedShape.getPath().getAt(i).lng()
                    });
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
                    console.log({
                        "lat": selectedShape.getPath().getAt(i).lat(),
                        "lng": selectedShape.getPath().getAt(i).lng()
                    });
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
                    newPoint.push({
                        "lat": selectedShape.getPath().getAt(i).lat(),
                        "lng": selectedShape.getPath().getAt(i).lng()
                    });
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
            latLngs.push({
                "lat": polygonBounds.getAt(i).lat(),
                "lng": polygonBounds.getAt(i).lng()
            });
        }

        polygons.push({
            "id": polygon.id,
            "color": color,
            "areaID": areaID.areaID,
            "area": $scope.areaCode,
            "latLngs": latLngs
        });
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

        $http.post('/createBoundary', {
            "polygons": polygons
        }).then(function(response) {
            $http.post('/updateBoundary', {
                "polygons": existingPolygons
            }).then(function(response) {

                if (removedPolygons.length > 0) {
                    $http.post('/removeBoundary', {
                        "polygons": removedPolygons
                    }).then(function(response) {
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
                    boundaries.push({
                        "id": data[i].id,
                        "color": data[i].color,
                        "areaID": data[i].areaID,
                        "area": (data[i].zone + data[i].area),
                        "latLngs": [],
                        "coordinate": []
                    });
                } else if (i > 0 && data[i - 1].id !== data[i].id) {
                    boundaries.push({
                        "id": data[i].id,
                        "color": data[i].color,
                        "areaID": data[i].areaID,
                        "area": (data[i].zone + data[i].area),
                        "latLngs": [],
                        "coordinate": []
                    });
                }
            }

            for (var j = 0; j < data.length; j++) {
                for (var k = 0; k < boundaries.length; k++) {
                    if (data[j].id === boundaries[k].id) {
                        boundaries[k].coordinate.push(new google.maps.LatLng(data[j].lat, data[j].lng));
                        boundaries[k].latLngs.push({
                            "lat": data[j].lat,
                            "lng": data[j].lng
                        });
                    }
                }
            }

            //console.log(boundaries);
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
                polygons.push({
                    "id": value.id,
                    "color": value.color,
                    "areaID": value.areaID,
                    "area": value.area,
                    "latLngs": value.latLngs
                });
            });
        });
    }

    loadBoundary();
    $scope.backToArea = function() {
        window.history.go(-1);
    };
});

app.controller('historyController', function($scope, $http, storeDataService) {
    'use strict';

    $scope.pagination = angular.copy(storeDataService.pagination);

    $http.get('/historyList').then(function(response) {
        $scope.historyList = response.data;
        $scope.totalItems = $scope.historyList.length;
    });
});

app.controller('historyDetailController', function($scope, $http, $routeParams) {
    'use strict';

    $http.post('/historyDetail', { "id": $routeParams.historyID }).then(function(response) {
        $scope.content = response.data[0].content;
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
            "driverID": '',
            "periodFrom": '',
            "periodTo": '',
            "replacementDriverID": '',
            "replacementPeriodFrom": '',
            "replacementPeriodTo": ''
        };
    }
    initializeDcs();

    $scope.show = angular.copy(storeDataService.show.acr);
    var driverPosition = angular.copy(storeDataService.positionID.driverPosition);

    var today = new Date();

    $scope.currentStatus = {
        "status": true,
        "date": formatDateDash(today)
    }

    var getAreaList = function() {
        $http.post('/getAreaList').then(function(response) {
            $scope.areaList = response.data;
            console.log($scope.areaList);

            $scope.areaButton = true;
            $scope.dcsList.areaCode = [];
        });
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

        $http.post('/getAllDcs', $scope.currentStatus).then(function(response) {
            $scope.dcsList = response.data;

            console.log("DCS data received by controller");
        });

        $http.post('/getStaffList', {
            "position": 'Driver'
        }).then(function(response) {
            $scope.driverList = response.data;
        });

        getAreaList();

    }
    getAllDcs(); //call



    $scope.area = '';
    $scope.areaCode = '';
    $scope.assignArea = function(areaCode, index) {
        $scope.areaButton = false;

        //$scope.dcsList.areaCode.push(areaCode.areaID);
        $scope.areaList.splice(index, 1);

        if ($scope.area == '') {
            $scope.area = areaCode.areaID;
            $scope.areaCode = areaCode.areaCode;
        } else {
            $scope.area = $scope.area.concat(", ", areaCode.areaID);
            $scope.areaCode = $scope.areaCode.concat(", ", areaCode.areaCode);
        }

        console.log($scope.area);
    }

    $scope.clearArea = function() {
        $scope.generalWorkerButton = true;

        $scope.dcsList.areaList = [];
        $scope.area = '';


        getAreaList();
    }

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
        $scope.dcs.formattedPeriodFrom = $filter('date')($scope.dcs.periodFrom, 'yyyy-MM-dd');
        $scope.dcs.formattedPeriodTo = $filter('date')($scope.dcs.periodTo, 'yyyy-MM-dd');
        $scope.dcs.formattedReplacementPeriodFrom = $filter('date')($scope.dcs.replacementPeriodFrom, 'yyyy-MM-dd');
        $scope.dcs.formattedReplacementPeriodTo = $filter('date')($scope.dcs.replacementPeriodTo, 'yyyy-MM-dd');
        $scope.dcs.preparedBy = window.sessionStorage.getItem('owner');
        $scope.dcs.areaID = $scope.area;

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
                $scope.dcsList.push({
                    "id": newDcsID,
                    "creationDateTime": today,
                    "driverID": $scope.dcs.driverID,
                    "periodFrom": $scope.dcs.periodFrom,
                    "periodTo": $scope.dcs.periodTo,
                    "replacementDriver": $scope.dcs.replacementDriver,
                    "replacementPeriodFrom": $scope.dcs.replacementPeriodFrom,
                    "replacementPeriodTo": $scope.dcs.replacementPeriodTo,
                    "status": 'ACTIVE'
                });
                // $scope.filterAcrList = angular.copy($scope.acrList);
                angular.element('#createDcs').modal('toggle');
                // $scope.totalItems = $scope.filterAcrList.length;
            }
        });
    }


    $scope.addAcr = function() {

        if ($scope.acr.mon) {
            $scope.acr.mon = 1;
        } else {
            $scope.acr.mon = 0;
        }

        if ($scope.acr.tue) {
            $scope.acr.tue = 1;
        } else {
            $scope.acr.tue = 0;
        }

        if ($scope.acr.wed) {
            $scope.acr.wed = 1;
        } else {
            $scope.acr.wed = 0;
        }

        if ($scope.acr.thu) {
            $scope.acr.thu = 1;
        } else {
            $scope.acr.thu = 0;
        }

        if ($scope.acr.fri) {
            $scope.acr.fri = 1;
        } else {
            $scope.acr.fri = 0;
        }

        if ($scope.acr.sat) {
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

    $scope.deleteAcr = function(a, index) {

        $http.post('/deleteAcr', a).then(function(response) {

            if (response.data.status === "success") {
                angular.element('body').overhang({
                    type: "danger",
                    "message": "ACR deleted!"
                });

                $scope.acrList.splice(index, 1);
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

                if ($scope.acrList[i].mon == 1) {
                    document.getElementById("mon").checked = true;
                    $scope.acr.mon = true;
                } else {
                    document.getElementById("mon").checked = false;
                    $scope.acr.mon = false;
                }
                if ($scope.acrList[i].tue == 1) {
                    document.getElementById("tue").checked = true;
                    $scope.acr.tue = true;
                } else {
                    document.getElementById("tue").checked = false;
                    $scope.acr.tue = false;
                }
                if ($scope.acrList[i].wed == 1) {
                    document.getElementById("wed").checked = true;
                    $scope.acr.wed = true;
                } else {
                    document.getElementById("wed").checked = false;
                    $scope.acr.wed = false;
                }
                if ($scope.acrList[i].thu == 1) {
                    document.getElementById("thu").checked = true;
                    $scope.acr.thu = true;
                } else {
                    document.getElementById("thu").checked = false;
                    $scope.acr.thu = false;
                }
                if ($scope.acrList[i].fri == 1) {
                    document.getElementById("fri").checked = true;
                    $scope.acr.fri = true;
                } else {
                    document.getElementById("fri").checked = false;
                    $scope.acr.fri = false;
                }
                if ($scope.acrList[i].sat == 1) {
                    document.getElementById("sat").checked = true;
                    $scope.acr.sat = true;
                } else {
                    document.getElementById("sat").checked = false;
                    $scope.acr.sat = false;
                }

                $scope.acr.remarks = $scope.acrList[i].remarks;
            }
        }

    }

    $scope.saveAcr = function(acr) {

        console.log(acr);
        if ($scope.acr.customerID != null || $scope.acr.from != null || $scope.acr.to != null) {
            $http.post('/updateAcr', acr).then(function(response) {

                getAllDcs();
            });

            //angular.element('#editAcr').modal('toggle');
        } else {
            window.alert("Please fill all fields.");
        }

    }



});

app.controller('dcsDetailsController', function($scope, $http, $filter, storeDataService, $routeParams) {

    $scope.status = '';
    $scope.pagination = angular.copy(storeDataService.pagination);
    $scope.pagination.itemsPerPage = 11;

    //$scope.authorize = angular.copy(storeDataService.show.formAuthorization);
    $scope.show = angular.copy(storeDataService.show.dcsDetails);
    console.log($scope.show);

    $scope.dcsDetailsList = [];
    $scope.dcs = [];
    $scope.customerList = [];
    $scope.filteredCustomerList = [];
    $scope.dcsID = {};
    $scope.editAddress = {};
    $scope.dcsID.id = $routeParams.dcsID;
    $scope.dcsEntry = {};
    $scope.areaList = {};
    $scope.driverButton;
    $scope.replacementDriverButton;
    $scope.areaCodeButton = [];
    $scope.dcs = {};

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

                if ($scope.dcsDetailsList[i].mon == 1) {
                    document.getElementById("mon").checked = true;
                    $scope.dcsEntry.mon = true;
                } else {
                    document.getElementById("mon").checked = false;
                    $scope.dcsEntry.mon = false;
                }
                if ($scope.dcsDetailsList[i].tue == 1) {
                    document.getElementById("tue").checked = true;
                    $scope.dcsEntry.tue = true;
                } else {
                    document.getElementById("tue").checked = false;
                    $scope.dcsEntry.tue = false;
                }
                if ($scope.dcsDetailsList[i].wed == 1) {
                    document.getElementById("wed").checked = true;
                    $scope.dcsEntry.wed = true;
                } else {
                    document.getElementById("wed").checked = false;
                    $scope.dcsEntry.wed = false;
                }
                if ($scope.dcsDetailsList[i].thu == 1) {
                    document.getElementById("thu").checked = true;
                    $scope.dcsEntry.thu = true;
                } else {
                    document.getElementById("thu").checked = false;
                    $scope.dcsEntry.thu = false;
                }
                if ($scope.dcsDetailsList[i].fri == 1) {
                    document.getElementById("fri").checked = true;
                    $scope.dcsEntry.fri = true;
                } else {
                    document.getElementById("fri").checked = false;
                    $scope.dcsEntry.fri = false;
                }
                if ($scope.dcsDetailsList[i].sat == 1) {
                    document.getElementById("sat").checked = true;
                    $scope.dcsEntry.sat = true;
                } else {
                    document.getElementById("sat").checked = false;
                    $scope.dcsEntry.sat = false;
                }

                $scope.dcsEntry.remarks = $scope.dcsDetailsList[i].remarks;

                console.log($scope.dcsDetailsList[i]);
            }
        }

    }

    $scope.deleteDcsEntry = function(d, index) {

        $http.post('/deleteDcsEntry', d).then(function(response) {

            if (response.data.status === "success") {
                angular.element('body').overhang({
                    type: "danger",
                    "message": "DCS Entry deleted!"
                });

                $scope.dcsDetailsList.splice(index, 1);
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
        if ($scope.dcsEntry.customerID != null) {
            $http.post('/updateDcsEntry', $scope.dcsEntry).then(function(response) {

                $scope.getDcsDetails();
            });

            angular.element('#editDcsEntry').modal('toggle');
        } else {
            window.alert("Please select customer address");
        }

    }


    $scope.period = {};
    $scope.getDcsInfo = function() {
        $http.post('/getDcsInfo', $scope.dcsID).then(function(response) {

            $scope.dcs = response.data;
            console.log($scope.dcs);


            if ($scope.dcs[0].status == 'A') {
                $scope.status = 'ACTIVE';
            } else if ($scope.dcs[0].status == 'I') {
                $scope.status = 'INACTIVE';
            } else if ($scope.dcs[0].status == 'R') {
                $scope.status = 'CORRECTION REQUIRED';
            } else if ($scope.dcs[0].status == 'P') {
                $scope.status = 'PENDING';
            } else if ($scope.dcs[0].status == 'K') {
                $scope.status = 'CHECKED';
            } else if ($scope.dcs[0].status == 'C') {
                $scope.status = 'COMPLETE';
                $scope.show.edit = 'I';
            }

            if ($scope.show.checkView || $scope.show.verifyView) {
                $scope.permission = true;
            }
            $scope.period.periodFrom = $scope.dcs[0].periodFrom;
            $scope.period.periodTo = $scope.dcs[0].periodTo;
            $scope.period.areaID = '';
            $scope.period.dcsID = $routeParams.dcsID;
            console.log($scope.period);

            $scope.dcsEntry.dcsID = $routeParams.dcsID
            var areaIDArr = $scope.dcs[0].areaID.split(", ");
            console.log(areaIDArr);
            for (var x = 0; x < areaIDArr.length; x++) {
                console.log(areaIDArr[x]);
                if (x == areaIDArr.length - 1) {
                    $scope.period.areaID += ("'" + areaIDArr[x] + "'")
                } else {

                    $scope.period.areaID += ("'" + areaIDArr[x] + "',")
                }
            }

            console.log($scope.period.areaID);


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

        $http.post('/getStaffList', {
            "position": 'Driver'
        }).then(function(response) {
            $scope.driverList = response.data;
        });
        $scope.driverButton = true;
        $scope.replacementDriverButton = true;



    }

    $scope.getDcsDetails();





    $scope.assignDriver = function(d) {
        $scope.driverButton = false;

        $scope.dcs.driver = d.staffName;
    }

    $scope.assignReplacementDriver = function(d) {
        $scope.replacementDriverButton = false;

        $scope.dcs.replacementDriver = d.staffName;
        $scope.replacementPeriodFrom = true;
        $scope.replacementPeriodTo = true;
    }

    $scope.clearDriver = function() {
        $scope.driverButton = true;

        $scope.dcs.driver = '';
    }

    $scope.clearReplacementDriver = function() {
        $scope.replacementDriverButton = true;

        $scope.dcs.replacementDriver = '';

        $scope.replacementPeriodFrom = false;
        $scope.replacementPeriodTo = false;
        $scope.dcs.replacementPeriodFrom = '';
        $scope.dcs.replacementPeriodTo = '';
    }

    $scope.setReplacementPeriodFrom = function() {
        $scope.replacementPeriodFrom = false;
    }

    $scope.setReplacementPeriodTo = function() {
        $scope.replacementPeriodTo = false;
    }

    $scope.resetReplacementPeriodFrom = function() {
        $scope.replacementPeriodFrom = true;
        $scope.dcs.replacementPeriodFrom = '';
    }

    $scope.resetReplacementPeriodTo = function() {
        $scope.replacementPeriodTo = true;
        $scope.dcs.replacementPeriodTo = '';
    }


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

        if ($scope.dcsEntry.mon) {
            $scope.dcsEntry.mon = 1;
        } else {
            $scope.dcsEntry.mon = 0;
        }

        if ($scope.dcsEntry.tue) {
            $scope.dcsEntry.tue = 1;
        } else {
            $scope.dcsEntry.tue = 0;
        }

        if ($scope.dcsEntry.wed) {
            $scope.dcsEntry.wed = 1;
        } else {
            $scope.dcsEntry.wed = 0;
        }

        if ($scope.dcsEntry.thu) {
            $scope.dcsEntry.thu = 1;
        } else {
            $scope.dcsEntry.thu = 0;
        }

        if ($scope.dcsEntry.fri) {
            $scope.dcsEntry.fri = 1;
        } else {
            $scope.dcsEntry.fri = 0;
        }

        if ($scope.dcsEntry.sat) {
            $scope.dcsEntry.sat = 1;
        } else {
            $scope.dcsEntry.sat = 0;
        }


        $scope.dcsEntry.dcsID = $routeParams.dcsID;

        $http.post('/addDcsEntry', $scope.dcsEntry).then(function(response) {

            var returnedData = response.data;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "DCS Entry added successfully!"
                });


                $scope.dcsDetailsList.push({
                    "acrfNo": $scope.dcsEntry.acrfNo,
                    "company": $scope.dcsEntry.companyName,
                    "address": $scope.dcsEntry.customerID,
                    "beBins": $scope.dcsEntry.beBins,
                    "acrBins": $scope.dcsEntry.acrBins,
                    "areaCode": $scope.dcsEntry.areaCode,
                    "mon": $scope.dcsEntry.mon,
                    "tue": $scope.dcsEntry.tue,
                    "wed": $scope.dcsEntry.wed,
                    "thu": $scope.dcsEntry.thu,
                    "fri": $scope.dcsEntry.fri,
                    "sat": $scope.dcsEntry.sat,
                    "remarks": $scope.dcsDetails.remarks
                });

                angular.element('#createDcsEntry').modal('toggle');
            }
        });

    }

    //AUTHORIZATION MODULE
    //CHECKED BY
    $scope.requestAuthorization = function() {
        sendFormForAuthorization($routeParams.dcsID, "dcs");
        angular.element('#checkConfirmation').modal('toggle');
        $scope.status = 'PENDING';
    };
    $scope.checkForm = function() {
        $scope.status = 'CHECKED';

        //UPDATE DBR WITH BD INPUT
        console.log($scope.dcs);
        checkForm($routeParams.dcsID, "dcs");



        angular.element('#approveCheck').modal('toggle');
    }
    $scope.rejectForm = function() {
        $scope.status = 'CORRECTION REQUIRED';
        rejectForm($routeParams.dcsID, "dcs", $scope.dcs[0].feedback);

        angular.element('#rejectForm').modal('toggle');
    }

    //VERIFIED BY
    $scope.requestVerification = function() {
        sendFormForVerification($routeParams.dcsID, "dcs");
        angular.element('#completeConfirmation').modal('toggle');
        $scope.status = 'PENDING';
    };


    $scope.verifyForm = function() {
        $scope.status = 'COMPLETE';
        verifyForm($routeParams.dcsID, "dcs");
        angular.element('#approveVerification').modal('toggle');
    }

});

app.controller('newBusinessController', function($scope, $http, $filter) {
    'use strict';
    $scope.customerList = [];
    $scope.tamanList = [];
    $scope.areaList = [];
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 20; //Record number each page
    $scope.maxSize = 8; //Show the number in page

    //Customer Details
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

    $http.get('/getAllCustomers').then(function(response) {
        $scope.customerList = response.data;
        console.log($scope.customerList);

    })

    $http.get('/getAllTaman').then(function(response) {
        $scope.tamanList = response.data;
        console.log($scope.tamanList);

    })

    $http.get('/getAllArea').then(function(response) {
        $scope.areaList = response.data;
        console.log($scope.areaList);

    })

    $scope.addTaman = function() {
        $scope.customer.creationDateTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');

        //$scope.customer.customerID = f.makeID('customer',$filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'));
        //console.log($scope.customer.customeriD);
        //console.log($scope.customer);

        $http.post('/addTaman', $scope.taman).then(function(response) {

            $scope.notify(response.data.status, response.data.message);
            if (response.data.status === 'success') {
                angular.element('body').overhang({
                    type: "success",
                    "message": "New Taman added successfully!"
                });

                $http.get('/getAllTaman').then(function(response) {
                    $scope.tamanList = response.data;
                    console.log($scope.tamanList);

                })

                /*$scope.customerList.push({
                    "name": $scope.customer.name,
                    "ic": $scope.customer.ic,
                    "companyName": $scope.customer.companyName
                });*/
                angular.element('#createTaman').modal('toggle');
                $scope.initializeTaman();
            }
        });

    }

    $scope.addCustomer = function() {
        $scope.customer.creationDateTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');

        //$scope.customer.customerID = f.makeID('customer',$filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'));
        //console.log($scope.customer.customeriD);
        //console.log($scope.customer);

        $http.post('/addCustomer', $scope.customer).then(function(response) {

            $scope.notify(response.data.status, response.data.message);
            if (response.data.status === 'success') {
                angular.element('body').overhang({
                    type: "success",
                    "message": "New Customer added successfully!"
                });

                $http.get('/getAllCustomers').then(function(response) {
                    $scope.customerList = response.data;
                    console.log($scope.customerList);

                })

                $scope.customerList.push({
                    "name": $scope.customer.name,
                    "ic": $scope.customer.ic,
                    "companyName": $scope.customer.companyName
                });
                angular.element('#createCustomer').modal('toggle');
                $scope.initializeCustomer();
            }
        });

    }
})

app.controller('binHistoryController', function($scope, $http, $filter, storeDataService, $routeParams) {
    'use strict';
    $scope.binHistoryList = [];

    $scope.serialNo = $routeParams.serialNo;

    console.log("This is from the wbdHistory function in the binHistoryController: ");
    console.log($scope.serialNo);
    //window.location.href = '#/wbd-history/' + $scope.serialNo;

    $http.get('/getBinHistory', $scope.serialNo).then(function(response) {
        $scope.binHistoryList = response.data;
        console.log($scope.binHistoryList);

    })

    //wbdHistory function
    $scope.wbdHistory = function(serialNo) {
        console.log("This is from the wbdHistory function in the binHistoryController: ");
        console.log(serialNo);
        window.location.href = '#/wbd-history/' + serialNo;

        $http.get('/getBinHistory', serialNo).then(function(response) {
            $scope.binHistoryList = response.data;
            console.log($scope.binHistoryList);

        })

    }
})

app.controller('binStockController', function($scope, $http) {
    'use strict';
    $scope.binStockList = [];

    //Retrieve all Bin entries and store them in binList
    $http.get('/getAllBins').then(function(response) {
        $scope.binStockList = response.data;
    })

    $scope.addBin = function() {

        $http.post('/addBin', $scope.bin).then(function(response) {

            $scope.notify(response.data.status, response.data.message);
            if (response.data.status === 'success') {
                angular.element('body').overhang({
                    type: "success",
                    "message": "New Bin added successfully!"
                });

                $http.get('/getAllBins').then(function(response) {
                    console.log("Get all bins worked");
                    $scope.binStockList = response.data;
                })

                $scope.binList.push({
                    "serialNo": $scope.bin.serialNo
                });
                angular.element('#createBin').modal('toggle');
                $scope.initializeBin();

            }
        });

    }
})

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
        //console.log($scope.areaList);
        //console.log("Hello from area controller");
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

                $http.get('/getAllDatabaseBin').then(function(response) {

                    $scope.databaseBinList = response.data;
                    storeDataService.databaseBin = angular.copy($scope.databaseBinList);
                });

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
                $scope.customerList.push({
                    "name": $scope.customer.name,
                    "ic": $scope.customer.ic,
                    "companyName": $scope.customer.companyName
                });
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
                $scope.binList.push({
                    "serialNo": $scope.bin.serialNo
                });

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
                $scope.tamanList.push({
                    "tamanName": $scope.taman.tamanName
                });
                //storeDataService.databaseBin = angular.copy($scope.databaseBinList);
                //$scope.filterDatabaseBinList = angular.copy($scope.databaseBinList);
                angular.element('#createTaman').modal('toggle');
                //$scope.totalItems = $scope.filterDatabaseBinList.length;
                $scope.initializeTaman();
            }
        });



    }

    $scope.wbdHistory = function(serialNo) {
        console.log("This is from the wbdHistory function in the wbd controller: ");
        console.log(serialNo);
        window.location.href = '#/wbd-history/' + serialNo;
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
    $scope.dateList = [];

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

    function getDates(mySQLDate, endDate) {

        var dateParts = mySQLDate.split("-");
        var startDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0, 2));

        startDate.setDate(startDate.getDate() + 2)
        endDate.setDate(endDate.getDate() + 1);


        var dates = [],
            currentDate = startDate,
            addDays = function(days) {
                var date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            };
        while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = addDays.call(currentDate, 1);
        }

        var i = 0;
        var date = '';

        console.log(dates);
        for (i = 0; i <= dates.length; i++) {

            $scope.date = {};
            date = dates[i].toISOString().slice(0, 19).replace('T', ' ');
            $scope.date.date = date;
            console.log($scope.date.date);


            $http.post('/insertDate', $scope.date).then(function(response) {


            });


        }
    };


    $http.get('/getAllDates').then(function(response) {
        $scope.dateList = response.data;
        console.log($scope.dateList)


        var today = new Date();
        getDates($scope.dateList[$scope.dateList.length - 1].date, today);

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

    var blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;'
    });
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

            //socket.emit('create new user');
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
    var asc = true;
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 8; //Record number each page
    $scope.maxSize = 10; //Show the number in page
    $scope.show = angular.copy(storeDataService.show.formAuthorization);
    $scope.bdafList = [];
    $scope.dcsList = [];
    $scope.dbrList = [];
    $scope.blostList = [];
    $scope.dbdList = [];




    $scope.orderBy = function(property) {
        $scope.taskList = $filter('orderBy')($scope.taskList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };

    $scope.getForm = function(formID) {

        var formType = formID.substring(0, 3);

        if (formType == 'DCS') {
            window.location.href = '#/dcs-details/' + formID;
        } else if (formType == 'BDF') {
            window.location.href = '#/bdaf-details/' + formID;
        } else if (formType == 'BST') {
            window.location.href = '#/blost-details/' + formID;
        }
    }

    function getAllForms() {
        $http.post('/getAllBdaf').then(function(response) {
            // storeDataService.task = angular.copy(response.data);
            $scope.bdafList = response.data;

            console.log($scope.bdafList);

            // for (var i = 0; i < $scope.formList.length; i++) {
            //     $scope.formList[i].formType = $scope.formList[i].formID.match(/[a-zA-Z]+/g)[0].toLowerCase();
            // }
        });
        $http.post('/getAllDcs').then(function(response) {
            $scope.dcsList = response.data;

            console.log($scope.dcsList);
        });
        $http.post('/getAllBlost').then(function(response) {
            $scope.blostList = response.data;

            console.log($scope.blostList);
        });
        $http.post('/getAllDbr').then(function(response) {
            $scope.dbrList = response.data;

            console.log($scope.dbrList);
        });
        $http.post('/getAllDbd').then(function(response) {
            $scope.dbdList = response.data;

            console.log($scope.dbdList);
        });


    }


    getAllForms();


});



app.controller('complaintController', function($scope, $http, $filter, $window, storeDataService) {
    'use strict';
    var asc = true;
    $scope.complaintList = [];
    $scope.complaintOfficerList = [];
    $scope.logisticsComplaintList = [];
    $scope.nowModule = 'web';
    
    //show control
    $scope.showweb = angular.copy(storeDataService.show.complaintweb);
    $scope.showapp = angular.copy(storeDataService.show.complaintapp);
    $scope.showlogs = angular.copy(storeDataService.show.complaintlogs);
    
    $scope.unreadWebComplaintCount = 0;
    $scope.unreadAppComplaintCount = 0;
    $scope.unreadLogComplaintCount = 0;
    
    //pagination
    $scope.paginationWebComp = angular.copy(storeDataService.pagination);
    $scope.paginationAppComp = angular.copy(storeDataService.pagination);
    $scope.paginationLogComp = angular.copy(storeDataService.pagination);
    //    $scope.currentPage = 1; //Initial current page to 1
    //    $scope.itemsPerPage = 7; //Record number each page
    //    $scope.maxSize = 8; //Show the number in page

    //get verified complaint list
    $http.get('/getComplaintOfficerList').then(function(response) {

        $scope.complaintOfficerList = response.data;
        $scope.searchWebComplaintFilter = '';
        $scope.filterWebComplaintList = [];

        for (var i = 0; i < $scope.complaintOfficerList.length; i++) {
            
            if($scope.complaintOfficerList[i].readState == 'u'){
                $scope.unreadWebComplaintCount++;
            }
            
            $scope.complaintOfficerList[i].complaintDate = $filter('date')($scope.complaintOfficerList[i].complaintDate, 'yyyy-MM-dd');

            if ($scope.complaintOfficerList[i].step == 1) {
                $scope.complaintOfficerList[i].department = "Logistics";
            } else {
                $scope.complaintOfficerList[i].department = "Customer Services";
            }

            if ($scope.complaintOfficerList[i].services == 1) {
                $scope.complaintOfficerList[i].serviceType = "Compactor";
            } else if ($scope.complaintOfficerList[i].services == 2) {
                $scope.complaintOfficerList[i].serviceType = "Hooklift";
            } else if ($scope.complaintOfficerList[i].services == 3) {
                $scope.complaintOfficerList[i].serviceType = "Hazardous waste";
            }

            if ($scope.complaintOfficerList[i].status == null) {
                $scope.complaintOfficerList[i].status = "N/A";
            }
        }

        $scope.filterWebComplaintList = angular.copy($scope.complaintOfficerList);

        $scope.searchWebComplaint = function(complaint) {
            return (complaint.complaintDate + complaint.customerDateTime + complaint.logisticsDateTime + complaint.name + complaint.company + complaint.serviceType + complaint.department + complaint.status).toUpperCase().indexOf($scope.searchWebComplaintFilter.toUpperCase()) >= 0;
        }

        $scope.webComptotalItems = $scope.filterWebComplaintList.length;

        $scope.getWebData = function() {
            return $filter('filter')($scope.filterWebComplaintList, $scope.searchWebComplaintFilter);
        }

        $scope.$watch('searchWebComplaintFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.paginationWebComp.currentPage = 1;
                $scope.webComptotalItems = $scope.getWebData().length;
            }
            return vm;
        }, true);
        
        $scope.unreadWebRowControl = "{'table-active': c.readState == 'u'}";        
        
    });

    //get app complaint list
    $http.get('/getComplaintList').then(function(response) {
        $scope.searchComplaintFilter = '';
        $scope.filterComplaintList = [];
        $scope.complaintList = response.data;
        var splitType = "";
        var splitTypeContent = "";
        var splitTypeSpecialContent = "";

        for (var i = 0; i < $scope.complaintList.length; i++) {
            
            if($scope.complaintList[i].readStat == 'u'){
                $scope.unreadAppComplaintCount++;
            }
            
            $scope.complaintList[i].date = $filter('date')($scope.complaintList[i].date, 'yyyy-MM-dd');

            var splitType = $scope.complaintList[i].title.split(":,:");
            $scope.complaintList[i].detailType = "";
            for (var j = 0; j < splitType.length; j++) {

                if (splitType[j].length > 3) {
                    splitTypeSpecialContent = splitType[j].split(":::::");
                    if (splitTypeSpecialContent[0] == '1') {
                        splitTypeSpecialContent[2] = "Waste not collected (days)";
                    } else if (splitTypeSpecialContent[0] == '12') {
                        splitTypeSpecialContent[2] = "Others(compactor)";
                    } else if (splitTypeSpecialContent[0] == '13') {
                        splitTypeSpecialContent[2] = "Others(hooklift)";
                    } else if (splitTypeSpecialContent[0] == '14') {
                        splitTypeSpecialContent[2] = "Others(hazardous waste)";
                    }

                    $scope.complaintList[i].detailType += splitTypeSpecialContent[2] + ': ' + splitTypeSpecialContent[1];

                } else {
                    if (splitType[j] == '2') {
                        splitTypeContent = "Bin not pushed back to its original location";
                    } else if (splitType[j] == '3') {
                        splitTypeContent = "Spillage of waste";
                    } else if (splitType[j] == '4') {
                        splitTypeContent = "Spillage of leachate water";
                    } else if (splitType[j] == '5') {
                        splitTypeContent = "RoRo not send";
                    } else if (splitType[j] == '6') {
                        splitTypeContent = "RoRo not exchanged";
                    } else if (splitType[j] == '7') {
                        splitTypeContent = "RoRo not pulled";
                    } else if (splitType[j] == '8') {
                        splitTypeContent = "RoRo not emptied";
                    } else if (splitType[j] == '9') {
                        splitTypeContent = "Waste not collected on time";
                    } else if (splitType[j] == '10') {
                        splitTypeContent = "Spillage during collection";
                    } else if (splitType[j] == '11') {
                        splitTypeContent = "Incomplete documents";
                    }
                    $scope.complaintList[i].detailType += splitTypeContent;
                }

                //                if(j < (splitType.length - 1)){
                //                    $scope.complaintList[i]detailType += ", ";
                //                }

                if ($scope.complaintList[i].type == 1) {
                    $scope.complaintList[i].serviceType = "Compactor";
                } else if ($scope.complaintList[i].type == 2) {
                    $scope.complaintList[i].serviceType = "Hooklift";
                } else if ($scope.complaintList[i].type == 3) {
                    $scope.complaintList[i].serviceType = "Hazardous waste";
                }
            }



        }

        $scope.filterComplaintList = angular.copy($scope.complaintList);

        $scope.searchComplaint = function(complaint) {
            return (complaint.date + complaint.detailType + complaint.customer + complaint.serviceType + complaint.code + complaint.status).toUpperCase().indexOf($scope.searchComplaintFilter.toUpperCase()) >= 0;
        }

        $scope.appComptotalItems = $scope.filterComplaintList.length;

        $scope.getData = function() {
            return $filter('filter')($scope.filterComplaintList, $scope.searchComplaintFilter);
        }

        $scope.$watch('searchComplaintFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.paginationAppComp.currentPage = 1;
                $scope.appComptotalItems = $scope.getData().length;
            }
            return vm;
        }, true);

        $scope.showbadge = "{'badge badge-danger': c.status == 'Invalid', 'badge badge-warning': c.status == 'Pending', 'badge badge-primary': c.status == 'Open', 'badge badge-success': c.status == 'Closed'}";
        
        $scope.unreadAppRowControl = "{'table-active': c.readStat == 'u'}";
    });

    //get logistics complaint list
    $http.get('/getLogisticsComplaintList').then(function(response) {


        $scope.logisticsComplaintList = response.data;
        $scope.searchLogComplaintFilter = '';
        $scope.filterLogComplaintList = [];

        if ($scope.logisticsComplaintList.length != 0) {
            for (var i = 0; i < $scope.logisticsComplaintList.length; i++) {
                
                if($scope.logisticsComplaintList[i].logsReadState == 'u'){
                    $scope.unreadLogComplaintCount++;
                }  
                
                $scope.logisticsComplaintList[i].complaintDate = $filter('date')($scope.logisticsComplaintList[i].complaintDate, 'yyyy-MM-dd');

                if ($scope.logisticsComplaintList[i].services == 1) {
                    $scope.logisticsComplaintList[i].serviceType = "Compactor";
                } else if ($scope.logisticsComplaintList[i].services == 2) {
                    $scope.logisticsComplaintList[i].serviceType = "Hooklift";
                } else if ($scope.logisticsComplaintList[i].services == 3) {
                    $scope.logisticsComplaintList[i].serviceType = "Hazardous waste";
                }

                if ($scope.logisticsComplaintList[i].status == null) {
                    $scope.logisticsComplaintList[i].status = "N/A";
                }

                if ($scope.logisticsComplaintList[i].step == 1) {
                    $scope.logisticsComplaintList[i].department = "Logistics";
                } else {
                    $scope.logisticsComplaintList[i].department = "Customer Services";
                }
            }
        }
        

        $scope.filterLogComplaintList = angular.copy($scope.logisticsComplaintList);

        $scope.searchLogComplaint = function(complaint) {
            return (complaint.complaintDate + complaint.name + complaint.company + complaint.serviceType + complaint.staff + complaint.department + complaint.status).toUpperCase().indexOf($scope.searchLogComplaintFilter.toUpperCase()) >= 0;
        }

        $scope.logComptotalItems = $scope.filterLogComplaintList.length;

        $scope.getLogData = function() {
            return $filter('filter')($scope.filterLogComplaintList, $scope.searchLogComplaintFilter);
        }

        $scope.$watch('searchLogComplaintFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.paginationLogComp.currentPage = 1;
                $scope.logComptotalItems = $scope.getWebData().length;
            }
            return vm;
        }, true);
        
        $scope.unreadLogRowControl = "{'table-active': l.logsReadState == 'u'}";
    });

//    $scope.readComplaint = function() {
//        $http.post('/readComplaint').then(function(response) {
//            if (response.data == "Complaint Read") {
//                socket.emit('complaint read');
//            }
//        }, function(err) {
//            console.log(err);
//        });
//    };

    //view app complaint
    $scope.complaintDetail = function(complaintCode) {
        window.location.href = '#/complaint-detail/' + complaintCode;

    };

    //create verified complaint
    $scope.createComp = function() {
        window.location.href = '#/complaint-officer-create';
    };
    
    //route to export complaint
    $scope.exportComp = function() {
        window.location.href = '#/complaint-export';
    };

    //view verified complaint
    $scope.viewComp = function(coID) {
        setTimeout(function() {
            window.location.href = '#/complaint-officer-detail/' + coID;
        }, 500);
    };

    //view logistics complaint
    $scope.viewLogComp = function(coID) {
        setTimeout(function() {
            window.location.href = '#/complaint-logistics-detail/' + coID;
        }, 500);
    }

    $scope.orderBy = function(property) {

        $scope.complaintList = $filter('orderBy')($scope.complaintList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };

    $scope.webOrderBy = function(property) {
        $scope.complaintOfficerList = $filter('orderBy')($scope.complaintOfficerList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };

    $scope.logsOrderBy = function(property) {

        $scope.logisticsComplaintList = $filter('orderBy')($scope.logisticsComplaintList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };

    $scope.tabClick = function(module) {
        $scope.nowModule = module;
    }


});

//complaint export controller
app.controller('complaintExportController', function($scope, $http, $window){
    'use strict';
    
    var datevar = new Date();
    $scope.startDate = new Date(datevar.getFullYear(),datevar.getMonth(), 1);
    $scope.endDate = new Date(datevar.getFullYear(),datevar.getMonth() + 1, 0);
    
    $scope.complaintExportList = [];
    $scope.filterComplaintExportList = [];
    
    $http.get('/getComplaintExportList').then(function(response){
        $scope.complaintExportList = response.data;
        
        var filterAddCount = 0;
        
        for(var i = 0; i < response.data.length; i++){
        
            //calculation for lg kpi
            if($scope.complaintExportList[i].logisticsDateTime != null && $scope.complaintExportList[i].customerDateTime != null){

                var lgDateFormat = new Date($scope.complaintExportList[i].logisticsDateTime.split(" ")[0]);
                var complaintDateFormat = new Date($scope.complaintExportList[i].complaintDate.split(" ")[0]);

                var lkBetweenDay = lgDateFormat - complaintDateFormat;
                lkBetweenDay = lkBetweenDay / 60 / 60 / 24 / 1000;

                var lkBetweenTime = "";

                var lgTimeFormat =  new Date(2000,0,1,$scope.complaintExportList[i].logisticsDateTime.split(" ")[1].split(":")[0],$scope.complaintExportList[i].logisticsDateTime.split(" ")[1].split(":")[1]);

                var complaintTimeFormat = new Date(2000,0,1,$scope.complaintExportList[i].complaintDate.split(" ")[1].split(":")[0],$scope.complaintExportList[i].complaintDate.split(" ")[1].split(":")[1]);

                var operationStartTime = new Date(2000,0,1, 8, 30);
                var operationEndTime = new Date(2000,0,1, 17, 30);

                if(lkBetweenDay == 0){
                    lkBetweenTime = lgTimeFormat - complaintTimeFormat;

                    lkBetweenTime = lkBetweenTime / 60 / 60 / 1000;
                    lkBetweenTime = lkBetweenTime.toFixed(2);

                }else if(lkBetweenDay >= 1){

                    lkBetweenTime = (operationEndTime - complaintTimeFormat) + (lgTimeFormat - operationStartTime);
                    lkBetweenTime = lkBetweenTime / 60 / 60 / 1000;

                    for(var dayCounter =  1; dayCounter < lkBetweenDay; dayCounter++){
                        lkBetweenTime += 9;
                    }
                    lkBetweenTime = lkBetweenTime.toFixed(2);
                }else{
                    lkBetweenTime = "Error Data";
                }
                
                $scope.complaintExportList[i].lgkpi = lkBetweenTime;
            }
            
            
            //calculation for bd kpi
            if($scope.complaintExportList[i].customerDateTime != null && $scope.complaintExportList[i].complaintDate != null){

                var bdDateFormat = new Date($scope.complaintExportList[i].customerDateTime.split(" ")[0]);
                var complaintDateFormat = new Date($scope.complaintExportList[i].complaintDate.split(" ")[0]);
                var dateFlag = new Date($scope.complaintExportList[i].complaintDate.split(" ")[0]);
                
                var bkBetweenDay = bdDateFormat - complaintDateFormat;
                bkBetweenDay = bkBetweenDay / 60 / 60 / 24 / 1000;

                var bkBetweenTime = "";

                var bdTimeFormat =  new Date(2000,0,1,$scope.complaintExportList[i].customerDateTime.split(" ")[1].split(":")[0],$scope.complaintExportList[i].customerDateTime.split(" ")[1].split(":")[1]);

                var complaintTimeFormat = new Date(2000,0,1,$scope.complaintExportList[i].complaintDate.split(" ")[1].split(":")[0],$scope.complaintExportList[i].complaintDate.split(" ")[1].split(":")[1]);

                var operationStartTime = new Date(2000,0,1, 8, 30);
                var operationEndTime = new Date(2000,0,1, 17, 30);

                if(bkBetweenDay == 0){
                    bkBetweenTime = bdTimeFormat - complaintTimeFormat;

                    bkBetweenTime = bkBetweenTime / 60 / 60 / 1000;
                    bkBetweenTime = bkBetweenTime.toFixed(2);
                    
                }else if(bkBetweenDay >= 1){

                    bkBetweenTime = (operationEndTime - complaintTimeFormat) + (bdTimeFormat - operationStartTime);
                    bkBetweenTime = bkBetweenTime / 60 / 60 / 1000;

                    for(var dayCounter =  1; dayCounter < bkBetweenDay; dayCounter++){
                        bkBetweenTime += 9;
//                        console.log("daycounter" + dayCounter);
//                        console.log("bkbetweenDay" + bkBetweenDay);

//                        console.log(dateFlag);
//                        console.log(dateFlag.getDay());
//                        if(dateFlag.getDay() == 0){
//                            bkBetweenTime -= 9;
//                        }
//                        dateFlag.setDate(dateFlag.getDate() + 1);
//                        console.log(dateFlag);
                    }

                    bkBetweenTime = bkBetweenTime.toFixed(2);
                }else{
                    bkBetweenTime = "Error Data";
                }
                
                $scope.complaintExportList[i].bdkpi = bkBetweenTime;
            }   
            
            var compDate = new Date($scope.complaintExportList[i].complaintDate);

            if(compDate >= $scope.startDate && compDate <= $scope.endDate){
                $scope.filterComplaintExportList[filterAddCount] = $scope.complaintExportList[i];
                filterAddCount += 1;

            }
        }
    

    });
    
    $scope.dateRangeChange = function(){
        if($scope.startDate != undefined && $scope.endDate != undefined && $scope.startDate <= $scope.endDate ){

            var filterAddCount = 0;
            $scope.filterComplaintExportList = [];
            for(var n=0; n<$scope.complaintExportList.length; n++){
                var compDate = new Date($scope.complaintExportList[n].complaintDate);
                if(compDate >= $scope.startDate && compDate <= $scope.endDate){
                    $scope.filterComplaintExportList[filterAddCount] = $scope.complaintExportList[n];
                    filterAddCount += 1;
                }                
            }
        }
        
    }
    
    $scope.exportCompReport = function(module){
        console.log($scope.startDate);
        console.log($scope.endDate);
    }
    
});

//complaint detail controller
app.controller('complaintDetailController', function($scope, $http, $filter, $window, $routeParams, $route) {
    'use strict';
    $scope.showInchargeBtn = true;
    $scope.showUninchargeBtn  = false;
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
    var splitType = "";
    var splitTypeContent = "";
    var splitTypeSpecialContent = "";
    $scope.detailType = "";
    $scope.title = "";

    //get complaint detail refers on complaint id
    $http.post('/getComplaintDetail', $scope.req).then(function(response) {
        var complaint = response.data;
        $scope.comDetail = {
            'ctype': complaint[0].complaint,
            'title': complaint[0].premiseType,
            'content': complaint[0].remarks,
            'date': $filter('date')(complaint[0].complaintDate, 'medium'),
            'customer': complaint[0].name,
            'contactNumber': complaint[0].contactNumber,
            'address': complaint[0].address,
            'areaID': complaint[0].areaID,
            'area': complaint[0].areaName,
            'status': complaint[0].status,
            'code': complaint[0].code,
            'id': complaint[0].complaintID,
            'img': complaint[0].complaintImg,
            'staffID': complaint[0].staffID,
            'telNo': complaint[0].contactNumber
        };

        $scope.verify = {
            'source': "Mobile App",
            'refNo': $scope.comDetail.id,
            'name': $scope.comDetail.customer,
            'telNo': $scope.comDetail.telNo,
            'address': $scope.comDetail.address,
            'img': '', //$scope.comDetail.img, //incomplete
            'type': $scope.comDetail.ctype,
            'services': $scope.comDetail.title,
            'date': $filter('date')(new Date(), 'yyyy-MM-dd'),
            'time': $filter('date')(new Date(), 'HH:mm:ss'),
            "forwardLogisticsDate": $filter("date")(new Date(), 'yyyy-MM-dd'),
            "forwardLogisticsTime": $filter('date')(new Date(), 'HH:mm:ss'),
            "forwardLogisticsBy": $window.sessionStorage.getItem('owner'),
            "creationDate": $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
        };

        if ($scope.comDetail.title == 1) {
            $scope.title = "Compactor";
        } else if ($scope.comDetail.title == 2) {
            $scope.title = "Hooklift";
        } else if ($scope.comDetail.title == 3) {
            $scope.title = "Hazardous waste";
        }

        splitType = $scope.comDetail.ctype.split(":,:");
        for (var i = 0; i < splitType.length; i++) {
            if (splitType[i].length > 3) {
                splitTypeSpecialContent = splitType[i].split(":::::");
                if (splitTypeSpecialContent[0] == '1') {
                    splitTypeSpecialContent[2] = "Waste not collected (days)";
                } else if (splitTypeSpecialContent[0] == '12') {
                    splitTypeSpecialContent[2] = "Others(compactor)";
                } else if (splitTypeSpecialContent[0] == '13') {
                    splitTypeSpecialContent[2] = "Others(hooklift)";
                } else if (splitTypeSpecialContent[0] == '14') {
                    splitTypeSpecialContent[2] = "Others(hazardous waste)";
                }
                $scope.detailType += splitTypeSpecialContent[2] + ': ' + splitTypeSpecialContent[1];
            } else {
                if (splitType[i] == '2') {
                    splitTypeContent = "Bin not pushed back to its original location";
                } else if (splitType[i] == '3') {
                    splitTypeContent = "Spillage of waste";
                } else if (splitType[i] == '4') {
                    splitTypeContent = "Spillage of leachate water";
                } else if (splitType[i] == '5') {
                    splitTypeContent = "RoRo not send";
                } else if (splitType[i] == '6') {
                    splitTypeContent = "RoRo not exchanged";
                } else if (splitType[i] == '7') {
                    splitTypeContent = "RoRo not pulled";
                } else if (splitType[i] == '8') {
                    splitTypeContent = "RoRo not emptied";
                } else if (splitType[i] == '9') {
                    splitTypeContent = "Waste not collected on time";
                } else if (splitType[i] == '10') {
                    splitTypeContent = "Spillage during collection";
                } else if (splitType[i] == '11') {
                    splitTypeContent = "Incomplete documents";
                }
                $scope.detailType += splitTypeContent;
            }

            if (i < (splitType.length - 1)) {
                $scope.detailType += ", ";
            }

        }

        //get report dates for certain area id
        $scope.reportList = [];
        $scope.req2 = {
            'id': $scope.comDetail.areaID
        };
        $http.post('/getDateListForComplaint', $scope.req2).then(function(response) {
            $scope.reportList = response.data;
            $scope.showReference = ($scope.reportList.length == 0 ? false : true);
        });

        $http.post('/chatList', $scope.req).then(function(response) {
            var data = response.data;
            var position = '';

            $.each(data, function(key, value) {
                position = window.sessionStorage.getItem('owner') === value.sender ? "right" : "left";
                chatContent += '<div class="message ' + position + '"><div class="message-text">' + value.content + '<div class="message-time text-right"><small class="text-muted"><i class="fa fa-clock"></i> ' + value.date + '</small></div></div></div>';
            });
            angular.element('.chat-box').html(chatContent);
            $('.chat-box').animate({
                scrollTop: $('.chat-box')[0].scrollHeight
            }, 0);
        });

        $scope.sendMessage = function() {
            $scope.message.content = $scope.mymsg;
            $scope.message.creationDateTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            console.log($scope.message);
            $http.post('/messageSend', $scope.message).then(function(response) {
                chatContent += '<div class="message right"><div class="message-text">' + $scope.message.content + '<div class="message-time text-right"><small class="text-muted"><i class="fa fa-clock"></i> ' + $filter('date')(new Date(), 'HH:mm') + '</small></div></div></div>';
                angular.element('.chat-box').html(chatContent);
                $('.chat-box').animate({
                    scrollTop: $('.chat-box')[0].scrollHeight
                }, 1000);
            });
        };

        socket.on('new message', function(data) {
            var content = data.content,
                sender = data.sender,
                recipient = data.recipient,
                date = data.date;

            chatContent += '<div class="message left"><div class="message-text">' + content + '<div class="message-time text-right"><small class="text-muted"><i class="fa fa-clock"></i> ' + $filter('date')(new Date(), 'HH:mm') + '</small></div></div></div>';
            angular.element('.chat-box').html(chatContent);
            $('.chat-box').animate({
                scrollTop: $('.chat-box')[0].scrollHeight
            }, 1000);
            lobi_notify('info', 'You received a new message.', 'from complaint', '');
        });

        //        //initialize email subject and text
        //        $scope.emailobj.id = $routeParams.complaintCode;
        //        if ($scope.comDetail.status == "Pending") {
        //            $scope.emailobj.subject = "Complaint received.";
        //            $scope.emailobj.text = "Your complaint has been received and pending for review. \nThank You. \n(Please wait patiently and do not reply to this email). ";
        //        } else if ($scope.comDetail.status == "In progress") {
        //            $scope.emailobj.subject = "";
        //            $scope.emailobj.text = "";
        //        } else if ($scope.comDetail.status == "Confirmation") {
        //            $scope.emailobj.subject = "Problem Solved.";
        //            $scope.emailobj.text = "This will send an confirmation email to customer, in order to inform customer the current problem has been solved. (After email sent, this complaint will count as complete and cannot be moved back.)";
        //        } else if ($scope.comDetail.status == "Done") {
        //            $scope.emailobj.subject = "";
        //            $scope.emailobj.text = "";
        //        }

        $scope.updateStatus = function() {
            $scope.showUpdateBtn = false;
            $http.post('/updateComplaintStatus', $scope.comDetail).then(function(response) {
                if (response.data.status = "success") {
                    $scope.notify("success", "Status Has Been Updated");
                    $scope.showUpdateBtn = true;
                } else {
                    $scope.notify("error", "Update Status Error");
                    $scope.showUpdateBtn = true;
                }
            });
        }

        if($scope.comDetail.staffID == null){
            $scope.showInchargeBtn = true;
            $scope.showUninchargeBtn = false;
        }else if ($scope.comDetail.staffID == window.sessionStorage.getItem('owner') || $scope.comDetail.staffID == null || window.sessionStorage.getItem('position') == "Administrator") {
            $scope.showInchargeBtn = false;
            $scope.showUninchargeBtn = true;
        } else {
            $scope.showInchargeBtn = false;
        }

        $scope.inchargeChat = function () {
            var staffID = {
                "staffID": window.sessionStorage.getItem('owner')
            };
            $http.post('/setIncharge', staffID).then(function(response) {
                if (response.data.status = "success") {
                    $scope.notify("success", "Updated Incharged Staff");
                    $scope.showInchargeBtn = true;
                    $route.reload();
                } else {
                    $scope.notify("error", "Update Status Error");
                    $scope.showInchargeBtn = true;
                }
            });
        }
        
        $scope.uninchargeChat = function () {
            var staffID = {
                "staffID": null
            };
            $http.post('/setIncharge', staffID).then(function (response) {
                if (response.data.status = "success") {
                    $scope.notify("success", "Updated Incharged Staff");
                    $scope.showInchargeBtn = true;
                    $route.reload();
                } else {
                    $scope.notify("error", "Update Status Error");
                    $scope.showInchargeBtn = true;
                }
            });
        }        
        
        if ($scope.comDetail.staffID == window.sessionStorage.getItem('owner')) {
            $scope.allowChat = true;
        } else {
            $scope.allowChat = false;
        }

        $scope.verifyComp = function() {

            $http.post('/verifyAppComp', $scope.verify).then(function(response) {
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                } else {
                    $scope.notify("error", "There has some ERROR!");
                }
            });
        }
    });

    $scope.viewReport = function(reportCode) {
        //window.location.href = '#/view-report/' + reportCode;
        $scope.report = {
            "reportID": reportCode
        };
        var map;

        $http.post('/getReportForComplaint', $scope.report).then(function(response) {

            $scope.thisReport = response.data.result[0];

            $scope.area = {
                "areaID": $scope.thisReport.area
            };

            var htmlscripts = response.data.content;

            $http.post('/getReportBinCenter', $scope.area).then(function(binresponse) {
                var bindataset = binresponse.data;
                var bin = "";

                var row = Object.keys(bindataset).length;
                $.each(bindataset, function(index, value) {
                    bin += value.name;
                    if ((index + 1) != row) {
                        bin += ', ';
                    }
                });

                if (bin.length != 0) {
                    htmlscripts = htmlscripts.replace("programReplaceBinHere", bin);
                } else {
                    htmlscripts = htmlscripts.replace("programReplaceBinHere", "(no bin centre information)");
                }

                $scope.forGetAcrInfo = {
                    "area": response.data.result[0].area
                };
                $scope.forGetAcrInfo.todayday = "";
                var d = new Date(response.data.result[0].date);
                var n = d.getDay();
                if (n == 1) {
                    $scope.forGetAcrInfo.todayday = "mon";
                } else if (n == 2) {
                    $scope.forGetAcrInfo.todayday = "tue";
                } else if (n == 3) {
                    $scope.forGetAcrInfo.todayday = "wed";
                } else if (n == 4) {
                    $scope.forGetAcrInfo.todayday = "thu";
                } else if (n == 5) {
                    $scope.forGetAcrInfo.todayday = "fri";
                } else if (n == 6) {
                    $scope.forGetAcrInfo.todayday = "sat";
                } else if (n == 0) {
                    $scope.forGetAcrInfo.todayday = "sun";
                }

                $http.post('/getReportACR', $scope.forGetAcrInfo).then(function(acrresponse) {
                    if (acrresponse.data !== null) {
                        if (acrresponse.data.length > 0) {
                            var acrset = acrresponse.data;
                        } else {
                            var acrset = [];
                        }
                        var acrRow = Object.keys(acrset).length;
                        var acr = "";
                        $.each(acrset, function(index, value) {
                            acr += value.name;
                            if ((index + 1) != acrRow) {
                                acr += ', ';
                            }
                        });
                        htmlscripts = htmlscripts.replace("programReplaceACRHere", acr);
                    } else {
                        htmlscripts = htmlscripts.replace("programReplaceACRHere", "(no acr information)");
                    }
                    $('div.report_reference').html(htmlscripts);
                });


            });


            //            $http.post('/loadSpecificBoundary', $scope.area).then(function (response) {
            //                var $googleMap;
            //
            //                if (response.data.length != 0) {
            //                    var sumOfCoLat = 0;
            //                    var sumOfCoLng = 0;
            //                    for (var i = 0; i < response.data.length; i++) {
            //                        sumOfCoLat += response.data[i].lat;
            //                        sumOfCoLng += response.data[i].lng;
            //                    }
            //                    var avgOfCoLat = sumOfCoLat / response.data.length;
            //                    var avgOfCoLng = sumOfCoLng / response.data.length;
            //                    var data = response.data;
            //                    var boundary = [];
            //
            //                    for (var i = 0; i < response.data.length; i++) {
            //                        boundary.push(new google.maps.LatLng(data[i].lat, data[i].lng));
            //
            //                    }
            //                    var polygonColorCode = "#" + response.data[0].color;
            //                    var myPolygon = new google.maps.Polygon({
            //                        paths: boundary,
            //                        strokeColor: polygonColorCode,
            //                        strokeWeight: 2,
            //                        fillColor: polygonColorCode,
            //                        fillOpacity: 0.45
            //                    });
            //
            //                    $googleMap = document.getElementById('googleMap');
            //                    var visualizeMap = {
            //                        center: new google.maps.LatLng(avgOfCoLat, avgOfCoLng),
            //                        mapTypeId: google.maps.MapTypeId.ROADMAP,
            //                        mapTypeControl: false,
            //                        panControl: false,
            //                        zoomControl: false,
            //                        streetViewControl: false,
            //                        disableDefaultUI: true,
            //                        editable: false
            //                    };
            //
            //                    map = new google.maps.Map($googleMap, visualizeMap);
            //                    myPolygon.setMap(map);
            //
            //                    $window.setTimeout(function () {
            //                        map.panTo(new google.maps.LatLng(avgOfCoLat, avgOfCoLng));
            //                        map.setZoom(12);
            //                    }, 1000);
            //                } else {
            //                    $scope.notify("warn", "Certain area has no draw boundary yet! Map can't be shown");
            //                }
            //            });

            //            $http.post('/getReportCircle', $scope.report).then(function (response) {
            //                var data = response.data;
            //                $window.setTimeout(function () {
            //                    $.each(data, function (index, value) {
            //                        var circle = new google.maps.Circle({
            //                            map: map,
            //                            center: new google.maps.LatLng(data[index].cLat, data[index].cLong),
            //                            radius: parseFloat(data[index].radius),
            //                            fillColor: 'transparent',
            //                            strokeColor: 'red',
            //                            editable: false,
            //                            draggable: false
            //                        });
            //                    });
            //                }, 1000);
            //            });

            //            $http.post('/getReportRect', $scope.report).then(function (response) {
            //                var data = response.data;
            //                $window.setTimeout(function () {
            //                    $.each(data, function (index, value) {
            //                        var rect = new google.maps.Rectangle({
            //                            map: map,
            //                            bounds: new google.maps.LatLngBounds(
            //                                new google.maps.LatLng(data[index].swLat, data[index].swLng),
            //                                new google.maps.LatLng(data[index].neLat, data[index].neLng),
            //                            ),
            //                            fillColor: 'transparent',
            //                            strokeColor: 'red',
            //                            editable: false,
            //                            draggable: false
            //                        });
            //                    })
            //                }, 1000);
            //            });
        });
    }


});

app.controller('complaintLogisticsDetailController', function($scope, $http, $filter, $window, $routeParams, $route) {

    $scope.coIDobj = {
        'coID': $routeParams.complaintCode
    };


    $scope.detailObj = {};
    $scope.areaList = [];
    $scope.logistics = {
        'areaUnder': '',
        'areaCouncil': '',
        'sub': '',
        'subDate': null,
        'subTime': null,
        'by': $window.sessionStorage.getItem('owner'),
        'status': 'open',
        'statusDate': '',
        'statusTime': '',
        'remark': '',
        'logsImg': 'undefined|undefined|undefined',
        'coID': $routeParams.complaintCode,
        'driver': ''
    };
    $scope.complaintImages = {
        'image01': "",
        'image02': "",
        'image03': ""
    }
    $scope.showComplaintImages = {
        'image01': false,
        'image02': false,
        'image03': false
    }
    $scope.editImages = false;
    $scope.showSubmitBtn = true;
    $scope.showCompImg = true;
    $scope.showForm = false;
    $scope.showInfo = false;
    $scope.showBDInfo = false;
    $scope.showCompImg = true;
    $scope.showLogsImg = true;
    $scope.showAreaLogistics = false;

    $http.post('/getLogisticsComplaintDetail', $scope.coIDobj).then(function(response) {
        $scope.detailObj = response.data.data[0];
        $scope.detailType = "";

        var splitType = "";
        var splitTypeContent = "";
        var splitTypeSpecialContent = "";

        //init images
        $scope.complaintImages.image01 = $scope.detailObj.compImg.split("|")[0];
        $scope.complaintImages.image02 = $scope.detailObj.compImg.split("|")[1];
        $scope.complaintImages.image03 = $scope.detailObj.compImg.split("|")[2];
        
        if($scope.complaintImages.image01 !== 'undefined'){
            $scope.showComplaintImages.image01 = true;
        }else{
            $scope.complaintImages.image01 = "";
        }
        if($scope.complaintImages.image02 !== 'undefined'){
            $scope.showComplaintImages.image02 = true;
        }else{
            $scope.complaintImages.image02 = "";
        }
        if($scope.complaintImages.image03 !== 'undefined'){
            $scope.showComplaintImages.image03 = true;
        }else{
            $scope.complaintImages.image03 = "";
        }
        
        if($scope.detailObj.services === "1"){ //Compactor
            $scope.showAreaLogistics = true;
            $scope.areaUnderList = ["Trienekens", "Mega Power", "TAK"];
        }else if($scope.detailObj.services === "2"){ //Hooklift
            $scope.showAreaLogistics = false;
            $scope.areaUnderList = ["Trienekens", "Mega Power", "TAK"];
        }else if($scope.detailObj.services === "3"){ //Hazardous Waste
            $scope.showAreaLogistics = false;
            $scope.areaUnderList = ["Trienekens", "Inna Tech", "Petro Jadi", "Others"];
        }
        
        $scope.detailObj.complaintDate = $filter('date')($scope.detailObj.complaintDate, 'yyyy-MM-dd');
        $scope.detailObj.logisticsDate = $filter('date')($scope.detailObj.logisticsDate, 'yyyy-MM-dd');

        $scope.statusDate = new Date($filter("date")(Date.now(), 'yyyy-MM-dd'));

        $scope.subTimeChange = function(time) {
            $scope.logistics.subTime = time == undefined ? "" : time;
        };
        $scope.statusTimeChange = function(time) {
            $scope.logistics.statusTime = time == undefined ? "" : time;
        };

        if ($scope.detailObj.step == 1) {
            $scope.showForm = true;
            $scope.showInfo = false;
            $scope.showBDInfo = false;
        } else if ($scope.detailObj.step == 2) {
            $scope.showForm = false;
            $scope.showInfo = true;
            $scope.showBDInfo = false;
        } else if($scope.detailObj.step == 3){
            $scope.showForm = false;
            $scope.showInfo = true;
            $scope.showBDInfo = true;                  
        }

        splitType = $scope.detailObj.type.split(":,:");
        for (var i = 0; i < splitType.length; i++) {
            if (splitType[i].length > 3) {
                splitTypeSpecialContent = splitType[i].split(":::::");
                if (splitTypeSpecialContent[0] == '1') {
                    splitTypeSpecialContent[2] = "Waste not collected (days)";
                } else if (splitTypeSpecialContent[0] == '12') {
                    splitTypeSpecialContent[2] = "Others(compactor)";
                } else if (splitTypeSpecialContent[0] == '13') {
                    splitTypeSpecialContent[2] = "Others(hooklift)";
                } else if (splitTypeSpecialContent[0] == '14') {
                    splitTypeSpecialContent[2] = "Others(hazardous waste)";
                }
                $scope.detailType += splitTypeSpecialContent[2] + ': ' + splitTypeSpecialContent[1];
            } else {
                if (splitType[i] == '2') {
                    splitTypeContent = "Bin not pushed back to its original location";
                } else if (splitType[i] == '3') {
                    splitTypeContent = "Spillage of waste";
                } else if (splitType[i] == '4') {
                    splitTypeContent = "Spillage of leachate water";
                } else if (splitType[i] == '5') {
                    splitTypeContent = "RoRo not send";
                } else if (splitType[i] == '6') {
                    splitTypeContent = "RoRo not exchanged";
                } else if (splitType[i] == '7') {
                    splitTypeContent = "RoRo not pulled";
                } else if (splitType[i] == '8') {
                    splitTypeContent = "RoRo not emptied";
                } else if (splitType[i] == '9') {
                    splitTypeContent = "Waste not collected on time";
                } else if (splitType[i] == '10') {
                    splitTypeContent = "Spillage during collection";
                } else if (splitType[i] == '11') {
                    splitTypeContent = "Incomplete documents";
                }
                $scope.detailType += splitTypeContent;
            }

            if (i < (splitType.length - 1)) {
                $scope.detailType += ", ";
            }

        }

        if ($scope.detailObj.compImg == "" || $scope.detailObj.compImg == null) {
            $scope.showCompImg = false;
        }

        if ($scope.showInfo == true) {
            $scope.logsImages = {
                'image01': "",
                'image02': "",
                'image03': ""
            }
            $scope.showLogsImages = {
                'image01': false,
                'image02': false,
                'image03': false
            }
            $http.post('/getLogisticsFullComplaintDetail', $scope.coIDobj).then(function(response) {
                if (response.data.status == "success") {
                    $scope.fullComplaintDetail = response.data.data[0];
                
                    $scope.areaCode = $scope.fullComplaintDetail.area.split(",")[1];
                    $scope.fullComplaintDetail.subDate = $filter('date')($scope.fullComplaintDetail.subDate, 'yyyy-MM-dd');
                    $scope.fullComplaintDetail.statusDate = $filter('date')($scope.fullComplaintDetail.statusDate, 'yyyy-MM-dd');
                    $scope.fullComplaintDetail.custDate = $filter('date')($scope.fullComplaintDetail.custDate, 'yyyy-MM-dd');

                    $scope.remarksCol = $scope.fullComplaintDetail.remarks;
                    $scope.remarksEditBtn = true;
                    $scope.remarksUpdateCancelBtn = false;
                    $scope.recordremarks = $scope.fullComplaintDetail.remarks;

                    //init images
                    $scope.logsImages.image01 = $scope.fullComplaintDetail.logsImg.split("|")[0];
                    $scope.logsImages.image02 = $scope.fullComplaintDetail.logsImg.split("|")[1];
                    $scope.logsImages.image03 = $scope.fullComplaintDetail.logsImg.split("|")[2];

                    if($scope.logsImages.image01 !== 'undefined'){
                        $scope.showLogsImages.image01 = true;
                    }else{
                        $scope.logsImages.image01 = "";
                    }
                    if($scope.logsImages.image02 !== 'undefined'){
                        $scope.showLogsImages.image02 = true;
                    }else{
                        $scope.logsImages.image02 = "";
                    }
                    if($scope.logsImages.image03 !== 'undefined'){
                        $scope.showLogsImages.image03 = true;
                    }else{
                        $scope.logsImages.image03 = "";
                    }
                    
                    if ($scope.detailObj.compImg == "undefined|undefined|undefined") {
                        $scope.showCompImg = false;
                    }

                    if ($scope.detailObj.logsImg === "undefined|undefined|undefined") {
                        $scope.showLogsImg = false;
                    }
                    
//                    review
                    if($scope.fullComplaintDetail.logisticsReview !== null){
                        var staffID = {
                            'id': $scope.fullComplaintDetail.logisticsReview
                        };
                        $http.post('/getStaffName', staffID).then(function(response) {
                            $scope.complaintReview = "LG Reviewed by " + response.data[0].staffName;
                        });
                    }
                    
                    
                    var custByID = {
                        'id': $scope.fullComplaintDetail.custBy
                    };
                    
                    var driverID = {
                        'id': $scope.fullComplaintDetail.driver
                    };
                    
                    $http.post('/getStaffName', custByID).then(function(response) {
                        if (response.data.length > 0) {
                            $scope.informCustStaffName = response.data[0].staffName;
                        } else {
                            $scope.informCustStaffName = '';
                        }
                    }); 
                    
                    
                    $http.post('/getStaffName', driverID).then(function(response) {
                        if (response.data.length > 0) {
                            $scope.driverName = response.data[0].staffName;
                        } else {
                            $scope.driverName = '';
                        }
                    });

                    $scope.checkCMSStatus = function() {
                        //set cms status to closed if lg and bd status are closed
                        if ($scope.fullComplaintDetail.status == 'closed' && $scope.fullComplaintDetail.custStatus == 'closed') {
                            $scope.fullComplaintDetail.cmsStatus = "3";
                        }
                        if($scope.fullComplaintDetail.cmsStatus == null){
                            $scope.fullComplaintDetail.cmsStatus = "";
                        }
                        
                    }

                    $scope.updateStatus = function() {
                        var time = new Date();
                        $scope.status = {
                            'status': $scope.fullComplaintDetail.status,
                            'coID': $routeParams.complaintCode,
                            'statusdate' : $filter('date')(Date.now(), 'yyyy-MM-dd'),
                            'statustime': time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
                        }
                        
//                        $scope.cmsUpdateRequest = {
//                            "cmsstatus" : $scope.fullComplaintDetail.cmsStatus,
//                            "coID" : $routeParams.complaintCode,
//                            "cmsdate" : $filter('date')(Date.now(), 'yyyy-MM-dd'),
//                            "cmstime": time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
//                        };                         

                        //                        $scope.status.statusDate = $filter('date')(Date.now(), 'yyyy-MM-dd'); 
                        //                        var time = new Date();
                        //                        $scope.status.statusTime = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();

              
                        $http.post('/updateComplaintDetailsStatus', $scope.status).then(function(response) {
                            if (response.data.status == "success") {
                                $scope.notify(response.data.status, "Status has been updated");
                                $route.reload();
//                                $http.post('/updateCMSStatus', $scope.cmsUpdateRequest).then(function(response) {
//                                    if (response.data.status == "success") {
//                                        $scope.notify(response.data.status, "Status has been updated");
//                                        $route.reload();
//                                    } else {
//                                        $scope.notify("error", "There are some ERROR!");
//                                    }
//                                });                                 
                                
                            } else {
                                $scope.notify("error", "There are some ERROR!");
                            }
                        });                        

                    }

                } else {
                    $scope.showInfo = false;
                    console.log("ERROR!");
                }

            });
        }
    });

    $http.get('/getAreaList').then(function(response) {
        $scope.renderSltPicker();
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
            $scope.areaList.push({
                "zone": {
                    "id": value.zoneID,
                    "name": value.zoneName
                },
                "area": area
            });
        });
        $('.selectpicker').on('change', function() {
            $scope.renderSltPicker();
        });
    });
    
    $http.get('/getDriverList').then(function(response){
        $scope.driverList = response.data;
    });


    function retrieveImageFromClipboardAsBlob(pasteEvent, callback) {
        if (pasteEvent.clipboardData == false) {
            if (typeof(callback) == "function") {
                callback(undefined);
            }
        };

        var items = pasteEvent.clipboardData.items;

        if (items == undefined) {
            if (typeof(callback) == "function") {
                callback(undefined);
            }
        };

        for (var i = 0; i < items.length; i++) {
            // Skip content if not image
            if (items[i].type.indexOf("image") == -1) continue;
            // Retrieve image on clipboard as blob
            var blob = items[i].getAsFile();

            if (typeof(callback) == "function") {
                callback(blob);
            }
        }
    }

    var img01, img02, img03;
    $(".target").on("click", function() {
        var $this = $(this);
        $scope.imgPasteID = $this.attr("id");
        $(".active").removeClass("active");
		$this.addClass("active");
        window.addEventListener("paste", function(e) {

            // Handle the event
            retrieveImageFromClipboardAsBlob(e, function(imageBlob) {
                // If there's an image, display it in the canvas
                if (imageBlob) {
                    var canvas = document.getElementById($scope.imgPasteID);
                    var ctx = canvas.getContext('2d');

                    // Create an image to render the blob on the canvas
                    var img = new Image();

                    // Once the image loads, render the img on the canvas
                    img.onload = function() {
                        // Update dimensions of the canvas with the dimensions of the image
                        canvas.width = this.width;
                        canvas.height = this.height;

                        // Draw the image
                        ctx.drawImage(img, 0, 0);
                    };

                    // Crossbrowser support for URL
                    var URLObj = window.URL || window.webkitURL;

                    // Creates a DOMString containing a URL representing the object given in the parameter
                    // namely the original Blob
                    img.src = URLObj.createObjectURL(imageBlob);
                    var reader = new FileReader();
                    reader.readAsDataURL(imageBlob);
                    reader.onloadend = function() {
                        var base64data = reader.result;
                        if($scope.imgPasteID == "uploadImg01"){
                            img01 = base64data;
                        }else if($scope.imgPasteID == "uploadImg02"){
                            img02 = base64data;
                        }else if($scope.imgPasteID == "uploadImg03"){
                            img03 = base64data;
                        }else if($scope.imgPasteID == "uploadImg04"){
                            $scope.logsImages.image01 = base64data;
                        }else if($scope.imgPasteID == "uploadImg05"){
                            $scope.logsImages.image02 = base64data;
                        }else if($scope.imgPasteID == "uploadImg06"){
                            $scope.logsImages.image03 = base64data;
                        }
                        $scope.logistics.logsImg = img01 + "|" + img02 + "|" + img03;
                    }
                }
            });
        }, false);
    });
    
    $scope.editLogsImages = function(){
        $scope.editImages = true;
        var images = [$scope.logsImages.image01, $scope.logsImages.image02, $scope.logsImages.image03];
        images.forEach(function(image, index){
            var isEmpty = true;
            if(image !== "" && index === 0){
                var canvas = document.getElementById("uploadImg04")
                isEmpty = false;
            }else if(image !== "" && index === 1){
                var canvas = document.getElementById("uploadImg05")
                isEmpty = false;
            }else if(image !== "" && index === 2){
                var canvas = document.getElementById("uploadImg06")
                isEmpty = false;
            }
            
            if(!isEmpty){
                var ctx = canvas.getContext('2d');
                var img = new Image();
                img.src = image;

                // Once the image loads, render the img on the canvas
                img.onload = function() {
                    // Update dimensions of the canvas with the dimensions of the image
                    canvas.width = this.width;
                    canvas.height = this.height;

                    // Draw the image
                    ctx.drawImage(img, 0, 0);
                };
            }
        });
    }
    
    $scope.clearImage = function(imgID){
        if(imgID === "uploadImg04"){
            $scope.logsImages.image01 = "";
        }else if(imgID === "uploadImg05"){
            $scope.logsImages.image02 = "";
        }else if(imgID === "uploadImg06"){
            $scope.logsImages.image03 = "";
        }
        var canvas = document.getElementById(imgID);
        var ctx = canvas.getContext('2d');        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    $scope.updateLogsImages = function(){
        $scope.editImages = false;
        
        var updateImages = {
            'coID': $routeParams.complaintCode,
            'department': "BD",
            'images': $scope.logsImages.image01 + "|" + $scope.logsImages.image02 + "|" + $scope.logsImages.image03
        }
        
        $http.post('/updateComplaintImages', updateImages).then(function(response) {
            if (response.data.status == "success") {
                $scope.notify(response.data.status, response.data.message);
                $route.reload();
            } else {
                $scope.notify("error", "There are some ERROR updating the images");
            }
        });
    }
    
    $scope.cancelCreate = function(){
        window.history.back();
    }

    $scope.submit = function() {
        $scope.logistics.statusDate = $filter('date')(Date.now(), 'yyyy-MM-dd');
        $scope.logistics.statusTime = $filter('date')(Date.now(), 'HH:mm:ss');

        if ($scope.logistics.sub == "Mega Power" || $scope.logistics.sub == "TAK") {
            if ($scope.logsSubDate == null || $scope.logsSubTime == null) {
                $scope.notify("error", "Please Fill In Sub-Contractor Date and Time");
                $scope.showSubmitBtn = true;
            } else {
                $scope.logistics.subDate = $filter('date')($scope.logsSubDate, 'yyyy-MM-dd');
                $scope.logistics.subTime = $filter('date')($scope.logsSubTime, 'HH:mm:ss');
            }
        } else {
            $scope.logistics.subDate = null;
            $scope.logistics.subTime = null;
        }




        if ($scope.logistics.sub == "" || $scope.logistics.status == "" || $scope.logistics.statusDate == "" || $scope.logistics.statusTime == "" || $scope.logistics.remarks == "") {

            $scope.notify("error", "There has some blank column");
            $scope.showSubmitBtn = true;
        } else {

            $http.post('/submitLogisticsComplaint', $scope.logistics).then(function(response) {
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    window.location.href = '#/complaint-module';
                } else {
                    $scope.notify("error", "There has some ERROR!");
                }
            });
            console.log($scope.logistics);
        }
    };

    $scope.logsOfficerUpdateRemarks = function() {
        $http.post('/logsOfficerUpdateRemarks', { 'recordremarks': $scope.recordremarks, 'coID': $routeParams.complaintCode }).then(function(response) {
            if (response.data.status == "success") {
                $scope.notify(response.data.status, "Remarks Updates");
                $route.reload();
            } else {
                $scope.notify("error", "There has some ERROR!");
            }
        })
    };

    $scope.backList = function() {
        window.location.href = '#/complaint-module';
    };
    
    $scope.reviewComplaintLG = function(){
        if (confirm("Are you sure you want to review this complaint?")) {
            var reviewComplaint = {
                'coID': $routeParams.complaintCode,
                'department': "LG",
                'staffID': window.sessionStorage.getItem('owner')
            }

            $http.post('/updateComplaintReview', reviewComplaint).then(function(response) {
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    $route.reload();
                } else {
                    $scope.notify("error", "There are some ERROR reviewing the complaint");
                }
            });
        }
    }

});
//
//app.controller('complaintOfficerController', function ($scope, $http, $filter) {
//    $scope.currentPage = 1; //Initial current page to 1
//    $scope.itemsPerPage = 8; //Record number each page
//    $scope.maxSize = 10; //Show the number in page
//
//    $http.get('/getComplaintOfficerList').then(function (response) {
//        $scope.complaintOfficerList = response.data;
//        for (var i = 0; i < $scope.complaintOfficerList.length; i++) {
//            $scope.complaintOfficerList[i].complaintDate = $filter('date')($scope.complaintOfficerList[i].complaintDate, 'yyyy-MM-dd');
//        }
//
//        $scope.totalItems = $scope.complaintOfficerList.length;
//    });
//
//    $scope.createComp = function () {
//        window.location.href = '#/complaint-officer-create';
//    }
//
//    $scope.viewComp = function (coID) {
//        setTimeout(function () {
//            window.location.href = '#/complaint-officer-detail/' + coID;
//        }, 500);
//    };
//
//});
app.controller('complaintOfficercreateController', function($scope, $http, $filter, $window) {
    $scope.showSubmitBtn = true;
    $scope.showTypeOption = 0;
    $scope.comp = {
        "compDate": '',
        "compTime": '',
        "compSource": '',
        "compRefNo": '',
        "compName": '',
        "compCompany": '',
        "compPhone": '',
        "compAddress": '',
        "compImg": 'undefined|undefined|undefined',
        "compType": '',
        "compLogDate": '',
        "compLogTime": '',
        "compLogBy": $window.sessionStorage.getItem('owner'),
        "creationDate": '',
        "services": ''
    };

    $scope.tc1 = false;
    $scope.tc2 = false;
    $scope.tc3 = false;
    $scope.tc4 = false;
    $scope.tc5 = false;
    $scope.tc6 = false;
    $scope.tc7 = false;
    $scope.tc8 = false;

    $scope.compDate = new Date($filter("date")(Date.now(), 'yyyy-MM-dd'));
    $scope.compLogDate = new Date($filter("date")(Date.now(), 'yyyy-MM-dd'));

    $scope.compTimeChange = function(time) {
        $scope.comp.compTime = time == undefined ? "" : time;
    };
    $scope.logTimeChange = function(time) {
        $scope.comp.compLogTime = time == undefined ? "" : time;
    };

    function retrieveImageFromClipboardAsBlob(pasteEvent, callback) {
        if (pasteEvent.clipboardData == false) {
            if (typeof(callback) == "function") {
                callback(undefined);
            }
        };

        var items = pasteEvent.clipboardData.items;

        if (items == undefined) {
            if (typeof(callback) == "function") {
                callback(undefined);
            }
        };

        for (var i = 0; i < items.length; i++) {
            // Skip content if not image
            if (items[i].type.indexOf("image") == -1) continue;
            // Retrieve image on clipboard as blob
            var blob = items[i].getAsFile();

            if (typeof(callback) == "function") {
                callback(blob);
            }
        }
    }
    var img01, img02, img03;
    $(".target").on("click", function() {
        var $this = $(this);
        $scope.imgPasteID = $this.attr("id");
        $(".active").removeClass("active");
		$this.addClass("active");
        window.addEventListener("paste", function(e) {
            
            // Handle the event
            retrieveImageFromClipboardAsBlob(e, function(imageBlob) {
                // If there's an image, display it in the canvas
                if (imageBlob) {
                    var canvas = document.getElementById($scope.imgPasteID);
                    var ctx = canvas.getContext('2d');

                    // Create an image to render the blob on the canvas
                    var img = new Image();

                    // Once the image loads, render the img on the canvas
                    img.onload = function() {
                        // Update dimensions of the canvas with the dimensions of the image
                        canvas.width = this.width;
                        canvas.height = this.height;

                        // Draw the image
                        ctx.drawImage(img, 0, 0);
                    };

                    // Crossbrowser support for URL
                    var URLObj = window.URL || window.webkitURL;

                    // Creates a DOMString containing a URL representing the object given in the parameter
                    // namely the original Blob
                    img.src = URLObj.createObjectURL(imageBlob);
                    var reader = new FileReader();
                    reader.readAsDataURL(imageBlob);
                    reader.onloadend = function() {
                        var base64data = reader.result;
                        if($scope.imgPasteID == "uploadImg01"){
                            img01 = base64data;
                        }else if($scope.imgPasteID == "uploadImg02"){
                            img02 = base64data;
                        }else if($scope.imgPasteID == "uploadImg03"){
                            img03 = base64data;
                        }
                        $scope.comp.compImg = img01 + "|" + img02 + "|" + img03;
                        
                    }
                }
            });
        }, false);
    });
    
    $scope.cancelCreate = function(){
        window.history.back();
    }

    $scope.addComp = function() {
        $scope.showSubmitBtn = false;
        $scope.comp.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.comp.compDate = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.comp.compLogDate = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.comp.compTime = $filter('date')(new Date(), 'HH:mm:ss');
        $scope.comp.compLogTime = $filter('date')(new Date(), 'HH:mm:ss');

        if ($scope.tc1 == true) {
            if ($scope.tc1days == undefined || $scope.tc1days == "") {
                $scope.tc1days = "0";
            }
            $scope.comp.compType += '1:::::';
            $scope.comp.compType += $scope.tc1days + ':,:';
        }
        if ($scope.tc2 == true) {
            $scope.comp.compType += '2:,:';
        }
        if ($scope.tc3 == true) {
            $scope.comp.compType += '3:,:';
        }
        if ($scope.tc4 == true) {
            $scope.comp.compType += '4:,:';
        }
        if ($scope.tc5 == true) {
            $scope.comp.compType += '5:,:';
        }
        if ($scope.tc6 == true) {
            $scope.comp.compType += '6:,:';
        }
        if ($scope.tc7 == true) {
            $scope.comp.compType += '7:,:';
        }
        if ($scope.tc8 == true) {
            $scope.comp.compType += '8:,:';
        }
        if ($scope.tc9 == true) {
            $scope.comp.compType += '9:,:';
        }
        if ($scope.tc10 == true) {
            $scope.comp.compType += '10:,:';
        }
        if ($scope.tc11 == true) {
            $scope.comp.compType += '11:,:';
        }
        if ($scope.tc12 == true) {
            if ($scope.tc12others == undefined) {
                $scope.tc12others = "";
            }
            $scope.comp.compType += '12:::::';
            $scope.comp.compType += $scope.tc12others + ':,:';
        }
        if ($scope.tc13 == true) {
            if ($scope.tc13others == undefined) {
                $scope.tc13others = "";
            }
            $scope.comp.compType += '13:::::';
            $scope.comp.compType += $scope.tc13others + ':,:';
        }
        if ($scope.tc14 == true) {
            if ($scope.tc14others == undefined) {
                $scope.tc14others = "";
            }
            $scope.comp.compType += '14:::::';
            $scope.comp.compType += $scope.tc14others + ':,:';
        }


        $scope.comp.compType = $scope.comp.compType.substring(0, $scope.comp.compType.length - 3);
        $scope.comp.services = $scope.typeOption;


        if ($scope.comp.compDate == '' || $scope.comp.compTime == '' || $scope.comp.compSource == '' || $scope.comp.compRefNo == '' || $scope.comp.compName == '' || $scope.comp.compPhone == '' || $scope.comp.compAddress == '' || $scope.comp.compType == '' || $scope.comp.compLogDate == '' || $scope.comp.compLogTime == '' || $scope.comp.compLogBy == '' || $scope.comp.services == '') {
            console.log($scope.comp);
            $scope.notify("error", "There has some blank column");
            $scope.showSubmitBtn = true;
            $scope.comp.compType = '';
        } else {            
            $http.post('/submitOfficeMadeComplaint', $scope.comp).then(function(response) {
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    window.location.href = '#/complaint-module';
                } else {
                    $scope.notify("error", "There has some ERROR!");
                }
            });
        }

    }
});
app.controller('complaintOfficerdetailController', function($scope, $http, $routeParams, $filter, $route, storeDataService) {
    $scope.coIDobj = {
        'coID': $routeParams.coID
    };
    $scope.detailObj = {};
    $scope.detailType = "";
    $scope.viewControl = 0;
    $scope.areaCode = "";
    $scope.cust = {
        'custDate': "",
        'custTime': "",
        'custBy': "",
        'custStatus': "",
        'contactStatus': "",
        'cmsStatus': "",
        'coID': $routeParams.coID
    };
    
    $scope.showcmsupdatebtn = angular.copy(storeDataService.show.complaintweb.editcms);
    $scope.showhiststatuslist = angular.copy(storeDataService.show.complaintweb.hist);
    
    $scope.custStatus = {
        'status': "open",
        'statusDate': "",
        'statusTime': "",
        'coID': $routeParams.coID
    };
    $scope.complaintImages = {
        'image01': "",
        'image02': "",
        'image03': ""
    }
    $scope.showComplaintImages = {
        'image01': false,
        'image02': false,
        'image03': false
    }
    $scope.logsImages = {
        'image01': "",
        'image02': "",
        'image03': ""
    }
    $scope.showLogsImages = {
        'image01': false,
        'image02': false,
        'image03': false
    }
    $scope.editImages = false;
    $scope.checkCustContactStatus = false;
    $scope.custContactableStatus = "0";
    $scope.cmsStatus = "";
    $scope.custContactableStatusOthers = "";
    $scope.showSubCustBtn = true;
    $scope.showCompImg = true;
    $scope.showLogsImg = true;

    var splitType = "";
    var splitTypeContent = "";
    var splitTypeSpecialContent = "";
    var areaSplit = "";

    $http.post('/getComplaintOfficerDetail', $scope.coIDobj).then(function(response) {
        $scope.detailObj = response.data.data[0];
        
        //init images
        $scope.complaintImages.image01 = $scope.detailObj.compImg.split("|")[0];
        $scope.complaintImages.image02 = $scope.detailObj.compImg.split("|")[1];
        $scope.complaintImages.image03 = $scope.detailObj.compImg.split("|")[2];
        
        if($scope.complaintImages.image01 !== 'undefined'){
            $scope.showComplaintImages.image01 = true;
        }else{
            $scope.complaintImages.image01 = "";
        }
        if($scope.complaintImages.image02 !== 'undefined'){
            $scope.showComplaintImages.image02 = true;
        }else{
            $scope.complaintImages.image02 = "";
        }
        if($scope.complaintImages.image03 !== 'undefined'){
            $scope.showComplaintImages.image03 = true;
        }else{
            $scope.complaintImages.image03 = "";
        }
        
        if($scope.detailObj.logsImg !== null){
            //init images
            $scope.logsImages.image01 = $scope.detailObj.logsImg.split("|")[0];
            $scope.logsImages.image02 = $scope.detailObj.logsImg.split("|")[1];
            $scope.logsImages.image03 = $scope.detailObj.logsImg.split("|")[2];

            if($scope.logsImages.image01 !== 'undefined'){
                $scope.showLogsImages.image01 = true;
            }else{
                $scope.logsImages.image01 = "";
            }
            if($scope.logsImages.image02 !== 'undefined'){
                $scope.showLogsImages.image02 = true;
            }else{
                $scope.logsImages.image02 = "";
            }
            if($scope.logsImages.image03 !== 'undefined'){
                $scope.showLogsImages.image03 = true;
            }else{
                $scope.logsImages.image03 = "";
            }
        }
        
        //review
        if($scope.detailObj.customerReview !== null){
            var staffID = {
                'id': $scope.detailObj.customerReview
            };
            $http.post('/getStaffName', staffID).then(function(response) {
                $scope.complaintReview = "BD Reviewed by " + response.data[0].staffName;
            });
        }

        //initialize staff
        var staffID = {
            'id': $scope.detailObj.logisticsBy
        };

        var logisticsStaffID = {
            'id': $scope.detailObj.forwardedBy
        };

        var informCustStaffID = {
            'id': $scope.detailObj.customerBy
        };

        var driverID = {
            id: $scope.detailObj.driver
        };
        
        $scope.cmsUpdateStatus = $scope.detailObj.cmsStatus;

        $scope.staffName = '';
        $scope.logsStaffName = '';
        $scope.driverName = '';
        
        $http.post('/getStaffName', staffID).then(function(response) {
            $scope.staffName = response.data[0].staffName;
        });
        
        $http.post('/getStaffName', driverID).then(function (response){
            $scope.driverName = response.data[0].staffName;
        })

        //date reformat
        $scope.compDate = new Date($filter("date")(Date.now(), 'yyyy-MM-dd'));
        $scope.detailObj.complaintDate = $filter('date')($scope.detailObj.complaintDate, 'yyyy-MM-dd');

        $scope.detailObj.logisticsDate = $filter('date')($scope.detailObj.logisticsDate, 'yyyy-MM-dd');

        $scope.detailObj.customerDate = $filter('date')($scope.detailObj.customerDate, 'yyyy-MM-dd');

        $scope.detailObj.forwardedDate = $filter('date')($scope.detailObj.forwardedDate, 'yyyy-MM-dd');

        $scope.detailObj.statusDate = $filter('date')($scope.detailObj.statusDate, 'yyyy-MM-dd');

        splitType = $scope.detailObj.type.split(":,:");
        for (var i = 0; i < splitType.length; i++) {
            if (splitType[i].length > 3) {
                splitTypeSpecialContent = splitType[i].split(":::::");
                if (splitTypeSpecialContent[0] == '1') {
                    splitTypeSpecialContent[2] = "Waste not collected (days)";
                } else if (splitTypeSpecialContent[0] == '12') {
                    splitTypeSpecialContent[2] = "Others(compactor)";
                } else if (splitTypeSpecialContent[0] == '13') {
                    splitTypeSpecialContent[2] = "Others(hooklift)";
                } else if (splitTypeSpecialContent[0] == '14') {
                    splitTypeSpecialContent[2] = "Others(hazardous waste)";
                }
                $scope.detailType += splitTypeSpecialContent[2] + ': ' + splitTypeSpecialContent[1];
            } else {
                if (splitType[i] == '2') {
                    splitTypeContent = "Bin not pushed back to its original location";
                } else if (splitType[i] == '3') {
                    splitTypeContent = "Spillage of waste";
                } else if (splitType[i] == '4') {
                    splitTypeContent = "Spillage of leachate water";
                } else if (splitType[i] == '5') {
                    splitTypeContent = "RoRo not send";
                } else if (splitType[i] == '6') {
                    splitTypeContent = "RoRo not exchanged";
                } else if (splitType[i] == '7') {
                    splitTypeContent = "RoRo not pulled";
                } else if (splitType[i] == '8') {
                    splitTypeContent = "RoRo not emptied";
                } else if (splitType[i] == '9') {
                    splitTypeContent = "Waste not collected on time";
                } else if (splitType[i] == '10') {
                    splitTypeContent = "Spillage during collection";
                } else if (splitType[i] == '11') {
                    splitTypeContent = "Incomplete documents";
                }
                $scope.detailType += splitTypeContent;
            }

            if (i < (splitType.length - 1)) {
                $scope.detailType += ", ";
            }

        }

        if ($scope.detailObj.compImg === "undefined|undefined|undefined") {
            $scope.showCompImg = false;
        }

        if ($scope.detailObj.logsImg == "undefined|undefined|undefined") {
            $scope.showLogsImg = false;
        }



        $scope.viewControl = $scope.detailObj.step;

        if ($scope.viewControl >= 2) {
            areaSplit = $scope.detailObj.under;
            $scope.areaCode = areaSplit.split(",")[1];

            $http.post('/getStaffName', logisticsStaffID).then(function(response) {
                $scope.logsStaffName = response.data[0].staffName;
            });




            if ($scope.viewControl >= 3) {
                $http.post('/getStaffName', informCustStaffID).then(function(response) {
                    $scope.informCustStaffName = response.data[0].staffName;
                });

                $scope.custStatus.status = $scope.detailObj.custStatus;
                $scope.custStatus.statusDate = $filter('date')($scope.detailObj.customerDate, 'yyyy-MM-dd');
                $scope.custStatus.statusTime = $scope.detailObj.customerTime;
            }
        }
        
        if($scope.detailObj.histUpdateList != null){
            $scope.histUpdateList = $scope.detailObj.histUpdateList.split("\n");

            for(var n = 0; n < $scope.histUpdateList.length; n++){
                if($scope.histUpdateList[n].split(" ")[0] == "CMS"){
                    if($scope.histUpdateList[n].split(" ")[7] == 1){
                        $scope.histUpdateList[n] = $scope.histUpdateList[n].substring(0,$scope.histUpdateList[n].length - 1);
                        $scope.histUpdateList[n] += "Valid";
                    }else if($scope.histUpdateList[n].split(" ")[7] == 2){
                        $scope.histUpdateList[n] = $scope.histUpdateList[n].substring(0,$scope.histUpdateList[n].length - 1);
                        $scope.histUpdateList[n] += "Invalid";
                        console.log($scope.histUpdateList[n]);
                    }else if($scope.histUpdateList[n].split(" ")[7] == 3){
                        $scope.histUpdateList[n] = $scope.histUpdateList[n].substring(0,$scope.histUpdateList[n].length - 1);
                        $scope.histUpdateList[n] += "Pending Review";
                    }
                }

            }
        }
    });
    $scope.setCMSStatus = function() {
        //set cms status to closed if lg and bd status are closed
        if ($scope.detailObj.status == 'closed' && $scope.custStatus.status == 'closed') {
            $scope.cmsStatus = "3";
        } else {
            $scope.cmsStatus = "";
        }
    }

    $scope.checkCMSStatus = function() {
        //set cms status to closed if lg and bd status are closed
        if ($scope.detailObj.status == 'closed' && $scope.custStatus.status == 'closed') {
            $scope.cmsUpdateStatus = "3";
        }
    }

    $scope.updateCust = function() {

        if ($scope.checkCustContactStatus == false) {
            $scope.custContactableStatus = "0";
        }

        if ($scope.custContactableStatus == '4') {
            $scope.custContactableStatus += ":" + $scope.custContactableStatusOthers;
        }

        $scope.showSubCustBtn = false;
        $scope.cust.custStatus = $scope.custStatus.status;
        $scope.cust.custDate = $filter('date')($scope.custDate, 'yyyy-MM-dd');
        $scope.cust.custTime = $filter('date')($scope.custTime, 'HH:mm:ss');
        $scope.cust.custBy = window.sessionStorage.getItem('owner');
        $scope.cust.contactStatus = $scope.custContactableStatus;


        if ($scope.cust.custDate == '' || $scope.cust.custDate == undefined || $scope.cust.custTime == '' || $scope.cust.custStatus == '') {
            $scope.notify("error", "There has some blank column");
            $scope.showSubCustBtn = true;
        } else {
            $http.post('/updateCustInformation', $scope.cust).then(function(response) {
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    $route.reload();
                } else {
                    $scope.notify("error", "There has some ERROR!");
                }
            });
        }

    };

    $scope.updateStatus = function() {

        $scope.custStatus.statusDate = $filter('date')(Date.now(), 'yyyy-MM-dd');
        var time = new Date();
        $scope.custStatus.statusTime = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();

//        $scope.cmsUpdateRequest = {
//            "cmsstatus" : $scope.cmsUpdateStatus,
//            "coID" : $routeParams.coID,
//            "cmsdate" : $filter('date')(Date.now(), 'yyyy-MM-dd'),
//            "cmstime": time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
//        };    


        $http.post('/updateComplaintDetailsCustStatus', $scope.custStatus).then(function(response) {
            if (response.data.status == "success") {
                $scope.notify(response.data.status, "Status has been updated");
                $route.reload();
//                $http.post('/updateCMSStatus', $scope.cmsUpdateRequest).then(function(response) {
//                    if (response.data.status == "success") {
//                        
//                    } else {
//                        $scope.notify("error", "There are some ERROR!");
//                    }
//                });                 
            } else {
                $scope.notify("error", "There has some ERROR!");
            }
        });
        
       
    }

    $scope.updateCMSStatus = function() {
        
        var time = new Date();
        $scope.cmsUpdateRequest = {
            "cmsstatus" : $scope.cmsUpdateStatus,
            "coID" : $routeParams.coID,
            "cmsdate" : $filter('date')(Date.now(), 'yyyy-MM-dd'),
            "cmstime": time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
        };           

        $http.post('/updateCMSStatus', $scope.cmsUpdateRequest).then(function(response) {
            if (response.data.status == "success") {
                $scope.notify(response.data.status, "CMS Status has been updated");
                $route.reload();
            } else {
                $scope.notify("error", "There has some ERROR!");
            }
        });
    }
    
    $scope.cancelCreate = function(){
        window.history.back();
    }
    
    //edit images by handsome felix, yeyyyy
    $scope.editCompImages = function(){
        $scope.editImages = true;
        var images = [$scope.complaintImages.image01, $scope.complaintImages.image02, $scope.complaintImages.image03];
        
        images.forEach(function(image, index){
            var isEmpty = true;
            if(image !== "" && index === 0){
                var canvas = document.getElementById("uploadImg01");
                isEmpty = false;
            }else if(image !== "" && index === 1){
                var canvas = document.getElementById("uploadImg02");
                isEmpty = false;
            }else if(image !== "" && index === 2){
                var canvas = document.getElementById("uploadImg03");
                isEmpty = false;
            }
            
            if(!isEmpty){
                var ctx = canvas.getContext('2d');
                var img = new Image();
                img.src = image;

                // Once the image loads, render the img on the canvas
                img.onload = function() {
                    // Update dimensions of the canvas with the dimensions of the image
                    canvas.width = this.width;
                    canvas.height = this.height;

                    // Draw the image
                    ctx.drawImage(img, 0, 0);
                };
            }
        });
    }
    
    function retrieveImageFromClipboardAsBlob(pasteEvent, callback) {
        if (pasteEvent.clipboardData == false) {
            if (typeof(callback) == "function") {
                callback(undefined);
            }
        };

        var items = pasteEvent.clipboardData.items;

        if (items == undefined) {
            if (typeof(callback) == "function") {
                callback(undefined);
            }
        };

        for (var i = 0; i < items.length; i++) {
            // Skip content if not image
            if (items[i].type.indexOf("image") == -1) continue;
            // Retrieve image on clipboard as blob
            var blob = items[i].getAsFile();

            if (typeof(callback) == "function") {
                callback(blob);
            }
        }
    }
    
    $(".target").on("click", function() {
        var $this = $(this);
        $scope.imgPasteID = $this.attr("id");
        $(".active").removeClass("active");
		$this.addClass("active");
        window.addEventListener("paste", function(e) {
            
            // Handle the event
            retrieveImageFromClipboardAsBlob(e, function(imageBlob) {
                // If there's an image, display it in the canvas
                if (imageBlob) {
                    var canvas = document.getElementById($scope.imgPasteID);
                    var ctx = canvas.getContext('2d');

                    // Create an image to render the blob on the canvas
                    var img = new Image();

                    // Once the image loads, render the img on the canvas
                    img.onload = function() {
                        // Update dimensions of the canvas with the dimensions of the image
                        canvas.width = this.width;
                        canvas.height = this.height;

                        // Draw the image
                        ctx.drawImage(img, 0, 0);
                    };

                    // Crossbrowser support for URL
                    var URLObj = window.URL || window.webkitURL;

                    // Creates a DOMString containing a URL representing the object given in the parameter
                    // namely the original Blob
                    img.src = URLObj.createObjectURL(imageBlob);
                    var reader = new FileReader();
                    reader.readAsDataURL(imageBlob);
                    reader.onloadend = function() {
                        var base64data = reader.result;
                        if($scope.imgPasteID == "uploadImg01"){
                            $scope.complaintImages.image01 = base64data;
                        }else if($scope.imgPasteID == "uploadImg02"){
                            $scope.complaintImages.image02 = base64data;
                        }else if($scope.imgPasteID == "uploadImg03"){
                            $scope.complaintImages.image03 = base64data;
                        }
                    }
                }
            });
        }, false);
    });
    
    $scope.clearImage = function(imgID){
        if(imgID === "uploadImg01"){
            $scope.complaintImages.image01 = "";
        }else if(imgID === "uploadImg02"){
            $scope.complaintImages.image02 = "";
        }else if(imgID === "uploadImg03"){
            $scope.complaintImages.image03 = "";
        }
        var canvas = document.getElementById(imgID);
        var ctx = canvas.getContext('2d');        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    $scope.updateCompImages = function(){
        $scope.editImages = false;
        
        var updateImages = {
            'coID': $routeParams.coID,
            'department': "LG",
            'images': $scope.complaintImages.image01 + "|" + $scope.complaintImages.image02 + "|" + $scope.complaintImages.image03
        }
        
        $http.post('/updateComplaintImages', updateImages).then(function(response) {
            if (response.data.status == "success") {
                $scope.notify(response.data.status, response.data.message);
                $route.reload();
            } else {
                $scope.notify("error", "There are some ERROR updating the images");
            }
        });
            
    }

    //    $scope.editComp = function (coID) {
    //        setTimeout(function () {
    //            window.location.href = '#/complaint-officer-edit/' + coID;
    //        }, 500);
    //    }

    $scope.backList = function() {
        window.location.href = '#/complaint-module';
    }
    
    $scope.reviewComplaintBD = function(){
        if (confirm("Are you sure you want to review this complaint?")) {
            var reviewComplaint = {
                'coID': $routeParams.coID,
                'department': "BD",
                'staffID': window.sessionStorage.getItem('owner')
            }

            $http.post('/updateComplaintReview', reviewComplaint).then(function(response) {
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    $route.reload();
                } else {
                    $scope.notify("error", "There are some ERROR reviewing the complaint");
                }
            });
        }
        
    }
});
app.controller('complaintOfficereditController', function($scope, $http, $routeParams, $filter) {

    $scope.showEditBtn = true;
    $scope.coIDobj = {
        'coID': $routeParams.coID
    };



    $http.post('/getComplaintOfficerDetail', $scope.coIDobj).then(function(response) {
        $scope.editObj = response.data[0];

        $scope.editObj.complaintDate = new Date($scope.editObj.complaintDate);

        $scope.editObj.logisticsDate = new Date($scope.editObj.logisticsDate);

        $scope.editObj.customerDate = new Date($scope.editObj.customerDate);

        $scope.editObj.recordedDate = new Date($scope.editObj.recordedDate);

        $scope.editObj.forwardedDate = new Date($scope.editObj.forwardedDate);

        $scope.editObj.statusDate = new Date($scope.editObj.statusDate);

        $scope.splitEditObjSource = $scope.editObj.sorce.split(":");
        if ($scope.splitEditObjSource.length > 1) {
            $scope.editObj.sorce = "Others";
            $scope.sourceOthers = $scope.splitEditObjSource[1];
        }

        $scope.splitEditObjAreaUnder = $scope.editObj.under.split(":");
        if ($scope.splitEditObjAreaUnder.length > 1) {
            $scope.editObj.under = "Subcontractors";
            $scope.underOthers = $scope.splitEditObjAreaUnder[1];
        }

        $scope.splitEditObjCouncil = $scope.editObj.council.split(":");
        if ($scope.splitEditObjCouncil.length > 1) {
            $scope.editObj.council = "Others";
            $scope.councilOthers = $scope.splitEditObjCouncil[1];
        }

        $scope.splitEditObjSource = $scope.editObj.sorce.split(":");
        if ($scope.splitEditObjSource.length > 1) {
            $scope.editObj.sorce = "Others";
            $scope.sourceOthers = $scope.splitEditObjSource[1];
        }

        $scope.splitEditObjType = $scope.editObj.type.split(":");
        if ($scope.splitEditObjType.length > 1) {
            $scope.editObj.type = "Waste not collected";
            $scope.type1days = $scope.splitEditObjType[1];
        }

        $scope.compTimeFormat = new Date();
        $scope.compTimeSplit = $scope.editObj.complaintTime.split(":");
        $scope.compTimeFormat.setHours($scope.editObj.complaintTime.split(":")[0]);
        $scope.compTimeFormat.setMinutes($scope.editObj.complaintTime.split(":")[1]);
        $scope.compTimeFormat.setSeconds(0);
        $scope.compTimeFormat.setMilliseconds(0);

        $scope.logTimeFormat = new Date();
        $scope.logTimeSplit = $scope.editObj.logisticsTime.split(":");
        $scope.logTimeFormat.setHours($scope.editObj.logisticsTime.split(":")[0]);
        $scope.logTimeFormat.setMinutes($scope.editObj.logisticsTime.split(":")[1]);
        $scope.logTimeFormat.setSeconds(0);
        $scope.logTimeFormat.setMilliseconds(0);

        $scope.ciTimeFormat = new Date();
        $scope.ciTimeSplit = $scope.editObj.customerTime.split(":");
        $scope.ciTimeFormat.setHours($scope.editObj.customerTime.split(":")[0]);
        $scope.ciTimeFormat.setMinutes($scope.editObj.customerTime.split(":")[1]);
        $scope.ciTimeFormat.setSeconds(0);
        $scope.ciTimeFormat.setMilliseconds(0);

        $scope.rcTimeFormat = new Date();
        $scope.rcTimeSplit = $scope.editObj.recordedTime.split(":");
        $scope.rcTimeFormat.setHours($scope.editObj.recordedTime.split(":")[0]);
        $scope.rcTimeFormat.setMinutes($scope.editObj.recordedTime.split(":")[1]);
        $scope.rcTimeFormat.setSeconds(0);
        $scope.rcTimeFormat.setMilliseconds(0);

        $scope.subTimeFormat = new Date();
        $scope.subTimeSplit = $scope.editObj.forwardedTime.split(":");
        $scope.subTimeFormat.setHours($scope.editObj.forwardedTime.split(":")[0]);
        $scope.subTimeFormat.setMinutes($scope.editObj.forwardedTime.split(":")[1]);
        $scope.subTimeFormat.setSeconds(0);
        $scope.subTimeFormat.setMilliseconds(0);

        $scope.sTimeFormat = new Date();
        $scope.sTimeSplit = $scope.editObj.statusTime.split(":");
        $scope.sTimeFormat.setHours($scope.editObj.statusTime.split(":")[0]);
        $scope.sTimeFormat.setMinutes($scope.editObj.statusTime.split(":")[1]);
        $scope.sTimeFormat.setSeconds(0);
        $scope.sTimeFormat.setMilliseconds(0);


    });

    $scope.compTimeChange = function(time) {
        $scope.editObj.complaintTime = time == undefined ? "" : time;
    };
    $scope.logTimeChange = function(time) {
        $scope.editObj.logisticsTime = time == undefined ? "" : time;
    };
    $scope.ciTimeChange = function(time) {
        $scope.editObj.customerTime = time == undefined ? "" : time;
    };
    $scope.rcTimeChange = function(time) {
        $scope.editObj.recordedTime = time == undefined ? "" : time;
    };
    $scope.subTimeChange = function(time) {
        $scope.editObj.forwardedTime = time == undefined ? "" : time;
    };
    $scope.sTimeChange = function(time) {
        $scope.editObj.statusTime = time == undefined ? "" : time;
    };



    $scope.editComp = function() {
        $scope.showEditBtn = false;

        $scope.editObj.complaintDate = $filter('date')($scope.editObj.complaintDate, 'yyyy-MM-dd');

        $scope.editObj.logisticsDate = $filter('date')($scope.editObj.logisticsDate, 'yyyy-MM-dd');

        $scope.editObj.customerDate = $filter('date')($scope.editObj.customerDate, 'yyyy-MM-dd');

        $scope.editObj.recordedDate = $filter('date')($scope.editObj.recordedDate, 'yyyy-MM-dd');

        $scope.editObj.forwardedDate = $filter('date')($scope.editObj.forwardedDate, 'yyyy-MM-dd');

        $scope.editObj.statusDate = $filter('date')($scope.editObj.statusDate, 'yyyy-MM-dd');

        $scope.editObj.complaintTime = $filter('date')($scope.compTimeFormat, 'HH:mm:ss');
        $scope.editObj.logisticsTime = $filter('date')($scope.logTimeFormat, 'HH:mm:ss');
        $scope.editObj.customerTime = $filter('date')($scope.ciTimeFormat, 'HH:mm:ss');
        $scope.editObj.recordedTime = $filter('date')($scope.rcTimeFormat, 'HH:mm:ss');
        $scope.editObj.forwardedTime = $filter('date')($scope.subTimeFormat, 'HH:mm:ss');
        $scope.editObj.statusTime = $filter('date')($scope.sTimeFormat, 'HH:mm:ss');

        if ($scope.editObj.sorce == "Others") {
            $scope.editObj.sorce = "Others: " + $scope.sourceOthers;
        }
        if ($scope.editObj.under == "Subcontractors") {
            $scope.editObj.under = "Subcontractors: " + $scope.underOthers;
        }
        if ($scope.editObj.council == "Others") {
            $scope.editObj.council = "Others: " + $scope.councilOthers;
        }
        if ($scope.editObj.type == "Waste not collected") {
            $scope.editObj.type = "Waste not collected (days): " + $scope.type1days;
        }

        if ($scope.editObj.complaintDate == '' || $scope.editObj.complaintTime == '' || $scope.editObj.sorce == '' || $scope.editObj.refNo == '' || $scope.editObj.name == '' || $scope.editObj.company == '' || $scope.editObj.telNo == '' || $scope.editObj.address == '' || $scope.editObj.under == '' || $scope.editObj.council == '' || $scope.editObj.type == '' || $scope.editObj.logisticsDate == '' || $scope.editObj.logisticsTime == '' || $scope.editObj.logisticsBy == '' || $scope.editObj.customerDate == '' || $scope.editObj.customerTime == '' || $scope.editObj.customerBy == '' || $scope.editObj.recordedDate == '' || $scope.editObj.recordedTime == '' || $scope.editObj.recordedBy == '' || $scope.editObj.forwardedSub == '' || $scope.editObj.forwardedDate == '' || $scope.editObj.forwardedTime == '' || $scope.editObj.forwardedBy == '' || $scope.editObj.status == '' || $scope.editObj.statusClosed == '' || $scope.editObj.statusDate == '' || $scope.editObj.statusTime == '' || $scope.editObj.statusBy == '' || $scope.editObj.remarks == '') {
            $scope.notify("error", "There has some blank column");
            $scope.showEditBtn = true;
        } else {
            $http.post('/editOfficeMadeComplaint', $scope.editObj).then(function(response) {
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    window.location.href = '#/complaint-officer-detail/' + $scope.editObj.coID;
                } else {
                    $scope.notify("error", "There has some ERROR!");
                }
            });
        }

    }

    $scope.closeEdit = function() {
        window.location.href = '#/complaint-officer-detail/' + $scope.editObj.coID;
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

    $scope.bdafID = '';
    $scope.bdafList = [];
    $scope.driverList = [];
    $scope.generalWorkerList = [];
    $scope.binRequestList = [];
    $scope.selectedRequests = []; //TO STORE SELECTED BIN REQUESTS
    var driverPosition = angular.copy(storeDataService.positionID.driverPosition);
    var generalWorkerPosition = angular.copy(storeDataService.positionID.generalWorkerPosition);


    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;

    $scope.show = angular.copy(storeDataService.show.delivery);

    $scope.viewbdaf = function(bdafID) {
        window.location.href = '#/bdaf-details/' + bdafID;
    }




    $scope.currentStatus = {
        "status": true
    }

    function getAllBdaf() {
        $http.post('/getAllBdaf').then(function(response) {

            $scope.bdafList = response.data;


            console.log("BDAF data received by controller");
            console.log(response.data);
        });
    }

    function getBdafDetails() {
        $http.post('/getAllBdaf').then(function(response) {

            $scope.bdafDetailsList = response.data;
        });
    }
    $scope.addBdaf = function() {
        $scope.bdaf.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.bdaf.preparedBy = window.sessionStorage.getItem('owner');

        $http.post('/addBdaf', $scope.bdaf).then(function(response) {
            var returnedData = response.data;
            var newBdafID = returnedData.details.bdafID;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "BDAF added successfully!"
                });

                $scope.bdafList.push({
                    "id": newBdafID,
                    "date": $scope.bdaf.date,
                    "driver": $scope.bdaf.driverID,
                    "generalWorker": $scope.bdaf.generalWorkerID,
                    "authorizedBy": "",
                    "authorizedDate": "",
                    "status": 'ACTIVE'
                });

                angular.element('#createBDAF').modal('toggle');

            }
        });
    }

    function getUnassignedBinRequests() {
        $http.post('/getUnassignedBinRequests').then(function(response) {
            d
            $scope.binRequestList = response.data;
        });
    }

    function getUnassignedBinRequests() {
        $http.post('/getUnassignedBinRequests').then(function(response) {

            $scope.binRequestList = response.data;
            console.log($scope.binRequestList);
        });
    }
    $scope.selectRequest = function(request) {
        if (request.selected) {
            $scope.selectedRequests.push(request);
        } else {
            $scope.selectedRequests.splice($scope.selectedRequests.indexOf(request), 1);
        }

        console.log($scope.selectedRequests);
    }
    $scope.assignRequests = function() {
        var x = 0;
        for (x = 0; x < $scope.selectedRequests.length; x++) {
            var request = {};
            $scope.selectedRequests[x].bdafID = $scope.bdafID
            request = $scope.selectedRequests[x];
            console.log(request);

            $http.post('/assignRequest', request).then(function(response) {

            });


            getUnassignedBinRequests();
        }

    }
    $scope.selectBdafID = function(bdafID) {
        console.log(bdafID)
    }
    $scope.confirmAssign = function() {
        $scope.assignRequests();
        angular.element('#confirmation').modal('toggle');

    }


    getAllBdaf(); //call
    getBdafDetails();
    getUnassignedBinRequests();
});

app.controller('bdafDetailsController', function($scope, $http, $filter, storeDataService, $routeParams) {


    // VARIABLES
    //$scope.authorize = angular.copy(storeDataService.show.formAuthorization); //To reveal authorization controls
    $scope.show = angular.copy(storeDataService.show.bdafDetails); //To reveal other controls
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10; //Max number of pages
    $scope.bdafDetailsList = [];
    $scope.bdaf = []; //TO STORE BDAF INFO
    $scope.bdafID = {}; //TO SEND TO SQL
    $scope.bdafID.id = $routeParams.bdafID;
    $scope.driverList = [];
    $scope.generalWorkerList = [];
    $scope.bdaf.generalWorker = [];
    $scope.status = ''; //FOR AUTHORIZATION
    $scope.generalWorkers = ''; //Store assigned general worker list
    $scope.driverButton; //reveal driver buttons
    $scope.generalWorkerButton; //reveal general worker buttons
    $scope.newBinDelivered = ''; //Store bin delivered input
    $scope.newBinPulled = ''; //Store bin pulled input
    $scope.binDelivered = ''; //Store bin delivered list
    $scope.binPulled = ''; //Store bin pulled list
    $scope.newBinDeliveredButton = false; //reveal bin delivered buttons
    $scope.newBinPulledButton = false; //reveal bin pulled buttons
    $scope.binSizeList = [] //To store bin sizes
    $scope.rightStatus = false;
    $scope.permission = false;

    //GET BIN SIZE LIST
    var getBinSize = function() {
        $http.get('/getBinSize').then(function(response) {
            $scope.searchAcrFilter = '';
            $scope.binSizeList = response.data;
        });
    };

    //ASSIGN DRIVER AND GENERAL WORKERS
    var getDrivers = function() {
        $http.post('/getStaffList', {
            "position": 'Driver'
        }).then(function(response) {
            $scope.searchAcrFilter = '';
            $scope.driverList = response.data;
            console.log($scope.driverList);

            $scope.driverButton = true;

        });
    }
    $scope.assignDriver = function(driver) {
        $scope.driverButton = false;

        $scope.bdaf.driver = driver.staffName
        $scope.bdaf[0].driverID = driver.staffID;
        $http.post('/assignDriver', $scope.bdaf[0]).then(function(response) {

        });
    }
    $scope.clearDriver = function() {
        $scope.driverButton = true;

        $scope.bdaf.driver = '';
    }
    var getGeneralWorkers = function() {
        $http.post('/getStaffList', {
            "position": 'General Worker'
        }).then(function(response) {
            $scope.searchAcrFilter = '';
            $scope.generalWorkerList = response.data;
            console.log($scope.generalWorkerList);

            $scope.generalWorkerButton = true;
            $scope.bdaf.generalWorker = [];

        });
    }
    $scope.assignGeneralWorker = function(generalWorker, index) {
        $scope.generalWorkerButton = false;

        $scope.bdaf.generalWorker.push(generalWorker.staffName);
        $scope.generalWorkerList.splice(index, 1);

        if ($scope.generalWorkers == '') {
            $scope.generalWorkers = generalWorker.staffName;
        } else {
            $scope.generalWorkers = $scope.generalWorkers.concat(", ", generalWorker.staffName);
        }

        $scope.bdaf[0].staffID = generalWorker.staffID;
        $http.post('/assignGeneralWorker', $scope.bdaf[0]).then(function(response) {

        });


    }
    $scope.clearGeneralWorker = function() {
        $scope.generalWorkerButton = true;

        $scope.bdaf.generalWorker = [];
        $scope.generalWorkers = '';

        $http.post('/clearGeneralWorker', $scope.bdaf[0]).then(function(response) {

        });

        getGeneralWorkers();
    }



    // ASSIGN BIN DELIVERED AND BIN PULLED
    $scope.assignBinDelivered = function(binDelivered) {

        if ($scope.binDelivered == '') {
            $scope.binDelivered = binDelivered;
            $scope.editedBdafEntry.binDelivered = binDelivered;
        } else {
            $scope.binDelivered = $scope.binDelivered.concat(" ", binDelivered);
            $scope.editedBdafEntry.binDelivered = $scope.binDelivered;
        }


        $scope.newBinDelivered = '';
        $scope.newBinDeliveredButton = false;

    }
    $scope.assignBinPulled = function(binPulled) {

        if ($scope.binPulled == '') {
            $scope.binPulled = binPulled;
            $scope.editBdafEntry.binPulled = binPulled;
        } else {
            $scope.binPulled = $scope.binPulled.concat(", ", binPulled);
            $scope.editBdafEntry.binPulled = $scope.binPulled;
        }

        $scope.newBinPulled = '';
        $scope.newBinPulledButton = false;

    }
    $scope.clearBinDelivered = function() {

        $scope.binDelivered = '';

    }
    $scope.clearBinPulled = function() {

        $scope.binPulled = '';

    }
    $scope.cancelBinDelivered = function() {
        $scope.newBinDeliveredButton = false;
        $scope.newBinDelivered = '';
    }
    $scope.cancelBinPulled = function() {
        $scope.newBinPulledButton = false;
        $scope.newBinPulled = '';
    }
    $scope.revealBinDelivered = function() {
        $scope.newBinDeliveredButton = true;
    }
    $scope.revealBinPulled = function() {
        $scope.newBinPulledButton = true;
    }

    //BDAF ENTRY MAIN FUNCTIONS
    $scope.getBdafInfo = function() {
        $http.post('/getBdafInfo', $scope.bdafID).then(function(response) {

            $scope.bdaf = response.data;

            console.log($scope.bdaf);
            if ($scope.bdaf[0].status == 'A') {
                $scope.status = 'ACTIVE';
            } else if ($scope.bdaf[0].status == 'I') {
                $scope.status = 'INACTIVE';
                document.getElementById("checkbox").disabled = true;
            } else if ($scope.bdaf[0].status == 'R') {
                $scope.status = 'CORRECTION REQUIRED';
            } else if ($scope.bdaf[0].status == 'P') {
                $scope.status = 'PENDING';
                $scope.rightStatus = true;
            } else if ($scope.bdaf[0].status == 'K') {
                $scope.status = 'CHECKED';
                $scope.rightStatus = true;
            } else if ($scope.bdaf[0].status == 'C') {
                $scope.status = 'COMPLETE';
                console.log("disabled");
                $scope.show.edit = 'I';
            }



            if ($scope.show.checkView || $scope.show.verifyView) {
                $scope.permission = true;
            }

            console.log($scope.rightStatus);
            console.log($scope.permission);
            //get Driver name
            $http.post('/getStaffName', {
                "staffID": $scope.bdaf[0].driverID
            }).then(function(response) {
                if (response.data.length > 0) {
                    $scope.bdaf.driver = response.data[0].staffName;
                } else {
                    $scope.bdaf.driver = "";
                }

            });

            //get GeneralWorker name
            var x = 1;
            console.log($scope.bdaf[0].staffID);
            var generalWorkers = $scope.bdaf[0].staffID.split(" ");
            console.log(generalWorkers);


            for (x = 1; x < generalWorkers.length; x++) {
                $http.post('/getStaffName', {
                    "staffID": generalWorkers[x]
                }).then(function(response) {
                    console.log(response.data[0])
                    var generalWorker = response.data[0].staffName;

                    console.log(generalWorker);
                    if ($scope.generalWorkers == '') {
                        $scope.generalWorkers = generalWorker;
                    } else {
                        $scope.generalWorkerButton = false;
                        $scope.generalWorkers = $scope.generalWorkers.concat(", ", generalWorker);
                    }

                    console.log($scope.generalWorkers);
                });
            }
        });
    }
    $scope.getBdafDetails = function() {
        $http.post('/getBdafDetails', $scope.bdafID).then(function(response) {

            $scope.bdafDetailsList = response.data;
            console.log($scope.bdafDetailsList);
            console.log($scope.show);

            var x = 0;
            for (x = 0; x < $scope.bdafDetailsList.length; x++) {
                console.log($scope.bdafDetailsList[x].status);
                if ($scope.bdafDetailsList[x].status == 'Settled') {
                    $scope.bdafDetailsList[x].completed = true;
                } else {
                    $scope.bdafDetailsList[x].completed = false;
                }
            }

            console.log($scope.bdafDetailsList);
        });
    }
    $scope.addBdafEntry = function() {
        $scope.bdafEntry.bdafID = $routeParams.bdafID;

        console.log($scope.bdafEntry);
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


                $scope.bdafDetailsList.push({
                    "location": $scope.bdafEntry.location,
                    "contactPerson": $scope.bdafEntry.contactPerson,
                    "contactNo": $scope.bdafEntry.contactNo,
                    "acrSticker": $scope.bdafEntry.acrSticker,
                    "acrfNo": $scope.bdafEntry.acrfNo,
                    "jobDesc": $scope.bdafEntry.jobDesc,
                    "binSize": $scope.bdafEntry.binSize,
                    "unit": $scope.bdafEntry.unit,
                    "remarks": $scope.bdafEntry.remarks,
                    "binDelivered": $scope.bdafEntry.binDelivered,
                    "binPulled": $scope.bdafEntry.binPulled,
                    "completed": $scope.bdafEntry.completed
                });

                angular.element('#createBdafEntry').modal('toggle');
            }
        });
    }
    $scope.editBdafEntry = function(request) {

        $scope.editedBdafEntry = request;

        //get binPulled and binDelivered

    }
    $scope.saveBdafEntry = function() {

        console.log($scope.editedBdafEntry);
        $http.post('/updateBdafEntry', $scope.editedBdafEntry).then(function(response) {

            $scope.getBdafDetails();
        });

        angular.element('#editBdafEntry').modal('toggle');
    }

    function completeForm() {
        //set requests that are checked to 'Settled'
        var x = 0;
        for (x = 0; x < $scope.bdafDetailsList.length; x++) {
            console.log($scope.bdafDetailsList[x].completed)
            if ($scope.bdafDetailsList[x].completed) {
                var binRequest = $scope.bdafDetailsList[x]
                $http.post('/completeBinRequest', binRequest).then(function(response) {
                    console.log("Bin Request Completed!")
                });
            } else {
                var binRequest = $scope.bdafDetailsList[x]
                $http.post('/uncompleteBinRequest', binRequest).then(function(response) {
                    console.log("Bin Request Uncompleted!")
                });
            }
        }
    }


    //AUTHORIZATION MODULE
    //CHECKED BY
    $scope.requestAuthorization = function() {
        sendFormForAuthorization($routeParams.bdafID, "bdaf");
        angular.element('#checkConfirmation').modal('toggle');
        $scope.status = 'PENDING';
        $scope.rightStatus = true;
        completeForm();
    };
    $scope.checkForm = function() {
        $scope.status = 'CHECKED';
        checkForm($routeParams.bdafID, "bdaf");

        angular.element('#approveCheck').modal('toggle');
    }
    $scope.rejectForm = function() {
        $scope.status = 'CORRECTION REQUIRED';
        rejectForm($routeParams.bdafID, "bdaf", $scope.bdaf[0].feedback);
        $scope.rightStatus = true;

        angular.element('#rejectForm').modal('toggle');
    }

    //VERIFIED BY
    $scope.requestVerification = function() {
        sendFormForVerification($routeParams.dcsID, "bdaf");
        $scope.rightStatus = true;
        angular.element('#completeConfirmation').modal('toggle');
        $scope.status = 'PENDING';
    };

    //
    $scope.verifyForm = function() {
        $scope.status = 'COMPLETE';
        verifyForm($routeParams.bdafID, "bdaf");
        $scope.rightStatus = false;
        angular.element('#approveVerification').modal('toggle');

        //UPDATE WBD AND WBSI
        // var x = 0;
        // for (x = 0; x < $scope.binRequestList.length; x++) {
        //     var pulledBins = $scope.binRequestList[x].binPulled.split(" ");
        //     var deliveredBins = $scope.binRequestList[x].binDelivered.split(" ");
        //     var newPulledBins = [];
        //     var reusablePulledBins = [];
        //     var newDeliveredBins = [];
        //     var reusableDeliveredBins = [];

        //     //Check if bins are Reusable bins or New bins
        //     var y = 0;
        //     for (y = 0; y < pulledBins.length; y++) {
        //         $http.post('/checkBin', {
        //             "bin": pulledBins[y]
        //         }).then(function (response) {
        //             if (response.result = 'new') {
        //                 newPulledBins.push(pulledBins[x]);
        //             } else if (response.result = 'reusable') {
        //                 reusablePulledBins.push(pulledBins[x]);
        //             }
        //         });
        //     }

        //     for (y = 0; y < deliveredBins.length; y++) {
        //         $http.post('/checkBin', {
        //             "bin": deliveredBins[y]
        //         }).then(function (response) {
        //             if (response.result = 'new') {
        //                 newDeliveredBins.push(deliveredBins[x]);
        //             } else if (response.result = 'reusable') {
        //                 reusableDeliveredBins.push(deliveredBins[x]);
        //             }
        //         });
        //     }

        //     //NEW BINS: CREATE NEW WBD ENTRY AND UPDATE WBSI
        //     var z = 0;
        //     for (z = 0; z < newDeliveredBins.length; z++) {
        //         $http.post('/deliverNewBin', {
        //             "bin": newDeliveredBins[z]
        //         }).then(function (response) {

        //         });
        //     }

        //     for (z = 0; z < newPulledBins.length; z++) {
        //         $http.post('/pullNewBin', {
        //             "bin": newPulledBins[z]
        //         }).then(function (response) {

        //         });
        //     }

        //     //REUSABLE BINS: UPDATE WBD AND UPDATE WBSI
        //     for (z = 0; z < reusableDeliveredBins.length; z++) {
        //         $http.post('/deliverReusableBin', {
        //             "bin": reusableDeliveredBins[z]
        //         }).then(function (response) {

        //         });
        //     }

        //     for (z = 0; z < reusablePulledBins.length; z++) {
        //         $http.post('/pullReusableBin', {
        //             "bin": reusablePulledBins[z]
        //         }).then(function (response) {

        //         });
        //     }
        // }
    }


    //INTIALIZE PAGE
    $scope.getBdafInfo();
    $scope.getBdafDetails();
    getDrivers();
    getGeneralWorkers();
    getBinSize();
    $(document).ready(function() {
        $('.selectpicker').selectpicker();
        document.getElementById('txtAcrSticker').value = 'NA';
        document.getElementById('txtAcrfNo').value = 'NA';

    });



});

app.controller('damagedBinController', function($scope, $http, $filter, storeDataService) {
    'use strict';

    $scope.dbrList = [];
    $scope.dbdList = [];
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;


    $scope.viewDbd = function(dbdID) {
        window.location.href = '#/dbd-details/' + dbdID;
    }

    $scope.viewDbr = function(dbrID) {
        window.location.href = '#/dbr-details/' + dbrID;
    }



    $scope.show = angular.copy(storeDataService.show.damagedBin);


    $scope.currentStatus = {
        "status": true
    }

    function getAllDbd() {
        $http.post('/getAllDbd').then(function(response) {
            $scope.dbdList = response.data;

            console.log("DBD data received by controller");
            console.log(response.data);
        });
    }

    function getAllDbr() {
        $http.post('/getAllDbr', $scope.currentStatus).then(function(response) {
            $scope.searchAcrFilter = '';
            $scope.dbrList = response.data;

            console.log("DBR data received by controller");
            console.log(response.data);
        });
    }



    $scope.addDbr = function() {
        var position = window.sessionStorage.getItem('owner');
        console.log(position);
        $scope.dbr.preparedBy = position;
        $scope.dbr.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.dbr.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addDbr', $scope.dbr).then(function(response) {
            var returnedData = response.data;
            var newDbrID = returnedData.details.dbrID;
            var today = new Date();

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "DBR added successfully!"
                });

                //     var area = $('.selectpicker option:selected').text();
                //    var areastr = area.split(" ")[2];
                //                console.log(areastr);
                $scope.dbrList.push({
                    "id": newDbrID,
                    "creationDateTime": today,
                    "preparedBy": $scope.dbr.preparedBy,
                    "status": 'ACTIVE'
                });
                // $scope.filterAcrList = angular.copy($scope.acrList);
                angular.element('#createDbr').modal('toggle');
                // $scope.totalItems = $scope.filterAcrList.length;
            }
        });
    }

    $scope.addDbd = function() {
        var position = window.sessionStorage.getItem('owner');

        $scope.dbd.preparedBy = position;
        $scope.dbd.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.dbd.periodFrom = $filter('date')($scope.dbd.periodFrom, 'yyyy-MM-dd HH:mm:ss');
        $scope.dbd.periodTo = $filter('date')($scope.dbd.periodTo, 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addDbd', $scope.dbd).then(function(response) {
            var returnedData = response.data;
            var newDbdID = returnedData.details.dbdID;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "DBD added successfully!"
                });

                $scope.dbdList.push({
                    "id": newDbdID,
                    "periodFrom": $scope.dbd.periodFrom,
                    "periodTo": $scope.dbd.periodTo,
                    "preparedBy": $scope.dbd.preparedBy,
                    "status": 'ACTIVE'
                });
                // $scope.filterAcrList = angular.copy($scope.acrList);
                angular.element('#createDbd').modal('toggle');
                // $scope.totalItems = $scope.filterAcrList.length;
            }
        });
    }

    //CALL FUNCTIONS
    getAllDbd();
    getAllDbr();
});

app.controller('dbdDetailsController', function($scope, $http, $filter, storeDataService, $routeParams) {

    $scope.show = angular.copy(storeDataService.show.dbdDetails);
    //$scope.authorize = angular.copy(storeDataService.show.formAuthorization);
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;
    $scope.showDbdDetails = true;
    $scope.dbdDetailsList = [{
        "areaCode": ''
    }];
    $scope.dbdDetailsDetailsList = [];
    $scope.dbd = [];
    $scope.customerList = [];
    $scope.dbdID = {};
    $scope.dbdID.id = $routeParams.dbdID;
    $scope.dbrID = [];
    $scope.status = '';
    $scope.rightStatus = false;
    $scope.permission = false;

    function getAllDbd() {
        $http.post('/getDbdInfo', $scope.dbdID).then(function(response) {

            $scope.dbd = response.data;

            if ($scope.dbd[0].status == 'A') {
                $scope.status = 'ACTIVE';
            } else if ($scope.dbd[0].status == 'I') {
                $scope.status = 'INACTIVE';
            } else if ($scope.dbd[0].status == 'R') {
                $scope.status = 'CORRECTION REQUIRED';
            } else if ($scope.dbd[0].status == 'P') {
                $scope.status = 'PENDING';
                $scope.rightStatus = true;
            } else if ($scope.dbd[0].status == 'K') {
                $scope.status = 'CHECKED';
                $scope.rightStatus = true;
            } else if ($scope.dbd[0].status == 'C') {
                $scope.status = 'COMPLETE';
                $scope.show.edit = 'I';
            }

            if ($scope.show.checkView || $scope.show.verifyView) {
                $scope.permission = true;
            }


            console.log($scope.dbd);
            $http.post('/getDbdDetails', $scope.dbd[0]).then(function(response) {

                var dbdDetailsList = response.data;
                console.log(dbdDetailsList);
                $scope.dbdDetailsList = [];
                for (i = 0; i < dbdDetailsList.length; i += 5) {
                    $scope.dbdDetailsList.push(dbdDetailsList[i]);
                }

                console.log($scope.dbdDetailsList);
            });
        });

        //AUTHORIZATION MODULE
        //CHECKED BY
        $scope.requestAuthorization = function() {
            sendFormForAuthorization($routeParams.dbdID, "dbd");
            angular.element('#checkConfirmation').modal('toggle');
            $scope.rightStatus = true;
            $scope.status = 'PENDING';
        };
        $scope.checkForm = function() {
            $scope.status = 'CHECKED';

            //UPDATE DBR WITH BD INPUT
            console.log($scope.dbd);
            $http.post('/checkForm', $scope.dbd[0]).then(function(response) {
                checkForm($routeParams.dbdID, "dbd");
            });


            angular.element('#approveCheck').modal('toggle');
        }
        $scope.rejectForm = function() {
            $scope.status = 'CORRECTION REQUIRED';
            rejectForm($routeParams.dbdID, "dbd", $scope.dbd[0].feedback);
            $scope.rightStatus = false;

            angular.element('#rejectForm').modal('toggle');
        }

        //VERIFIED BY
        $scope.requestVerification = function() {
            sendFormForVerification($routeParams.dbdID, "dbd");
            angular.element('#completeConfirmation').modal('toggle');
            $scope.status = 'PENDING';
        };


        $scope.verifyForm = function() {
            $scope.status = 'COMPLETE';
            verifyForm($routeParams.dbdID, "dbd");
            $scope.rightStatus = false;
            angular.element('#approveVerification').modal('toggle');
        }
    }


    getAllDbd();
});

app.controller('dbrDetailsController', function($scope, $http, $filter, storeDataService, $routeParams) {

    $scope.show = angular.copy(storeDataService.show.dbrDetails);
    console.log($scope.show);
    //$scope.authorize = angular.copy(storeDataService.show.formAuthorization);
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;
    $scope.showDbrDetails = true;
    $scope.dbrDetailsList = [];
    $scope.dbr = [];
    $scope.customerList = [];
    $scope.dbrID = {};
    $scope.dbrID.id = $routeParams.dbrID;
    $scope.status = '';
    $scope.permission = false;
    $scope.rightStatus = false;

    function getDbrInfo() {
        $http.post('/getDbrInfo', $scope.dbrID).then(function(response) {

            $scope.dbr = response.data;
            console.log($scope.dbr);

            if ($scope.dbr[0].status == 'A') {
                $scope.status = 'ACTIVE';
            } else if ($scope.dbr[0].status == 'I') {
                $scope.status = 'INACTIVE';
            } else if ($scope.dbr[0].status == 'R') {
                $scope.status = 'CORRECTION REQUIRED';
            } else if ($scope.dbr[0].status == 'P') {
                $scope.status = 'PENDING';
                $scope.rightStatus = true;
            } else if ($scope.dbr[0].status == 'K') {
                $scope.status = 'CHECKED';
                $scope.rightStatus = true;
            } else if ($scope.dbr[0].status == 'C') {
                $scope.status = 'COMPLETE';
                $scope.show.edit = 'I';
            }

            if ($scope.show.checkView || $scope.show.verifyView) {
                $scope.permission = true;
            }

        });
    }

    function getDbrDetails() {
        $http.post('/getDbrDetails', $scope.dbrID).then(function(response) {

            $scope.dbrDetailsList = response.data;
            console.log($scope.dbrDetailsList);
        });
    }

    //AUTHORIZATION MODULE
    //CHECKED BY
    $scope.requestAuthorization = function() {
        sendFormForAuthorization($routeParams.dbrID, "dbr");
        angular.element('#checkConfirmation').modal('toggle');
        $scope.rightStatus = true;
        $scope.status = 'PENDING';
    };
    $scope.checkForm = function() {
        $scope.status = 'CHECKED';

        //UPDATE DBR WITH BD INPUT
        console.log($scope.dbr);
        $http.post('/updateDbrBD', $scope.dbr[0]).then(function(response) {
            checkForm($routeParams.dbrID, "dbr");
        });


        angular.element('#approveCheck').modal('toggle');
    }
    $scope.rejectForm = function() {
        $scope.status = 'CORRECTION REQUIRED';
        rejectForm($routeParams.dbrID, "dbr", $scope.dbr[0].feedback);
        $scope.rightStatus = false;

        angular.element('#rejectForm').modal('toggle');
    }

    //VERIFIED BY
    $scope.requestVerification = function() {
        sendFormForVerification($routeParams.dbrID, "dbr");
        angular.element('#completeConfirmation').modal('toggle');
        $scope.status = 'PENDING';
    };


    $scope.verifyForm = function() {
        $scope.status = 'COMPLETE';
        verifyForm($routeParams.dbrID, "dbr");
        $scope.rightStatus = false;
        angular.element('#approveVerification').modal('toggle');
    }

    getDbrInfo();
    getDbrDetails();

});

app.controller('lostBinController', function($scope, $http, $filter, storeDataService) {
    'use strict';

    $scope.blostList = [];
    $scope.areaList = [];

    console.log("LOST BIN MANAGEMENT ACTIVATED!!");

    $scope.viewblost = function(blostID) {
        window.location.href = '#/blost-details/' + blostID;
    }

    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;



    $scope.show = angular.copy(storeDataService.show.lostBin);


    $scope.currentStatus = {
        "status": true
    }


    function getAllBlost() {
        $http.post('/getAllBlost', $scope.currentStatus).then(function(response) {
            $scope.searchAcrFilter = '';
            $scope.blostList = response.data;

            console.log("BLOST data received by controller");
            console.log(response.data);
        });

        $http.post('/getAreaList').then(function(response) {
            $scope.searchAcrFilter = '';
            $scope.areaList = response.data;
        });

    }

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
                $scope.blostList.push({
                    "id": newBlostID,
                    "creationDateTime": today,
                    "preparedBy": $scope.blost.preparedBy,
                    "authorizedBy": $scope.blost.authorizedBy,
                    "authorizedDate": $scope.blost.authorizedDate,
                    "status": 'ACTIVE'
                });
                // $scope.filterAcrList = angular.copy($scope.acrList);
                angular.element('#createBLOST').modal('toggle');
                // $scope.totalItems = $scope.filterAcrList.length;
            }
        });
    }
});

app.controller('blostDetailsController', function($scope, $http, $filter, storeDataService, $routeParams) {


    //$scope.authorize = angular.copy(storeDataService.show.formAuthorization);
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
    $scope.areaList = [];
    $scope.binList = [];
    $scope.status = '';
    $scope.editedBlostEntry = [];





    $http.post('/getBlostInfo', $scope.blostID).then(function(response) {

        $scope.blost = response.data;
        console.log($scope.blost);

        console.log($scope.blost);
        if ($scope.blost[0].status == 'A') {
            $scope.status = 'ACTIVE';
        } else if ($scope.blost[0].status == 'I') {
            $scope.status = 'INACTIVE';
        } else if ($scope.blost[0].status == 'R') {
            $scope.status = 'CORRECTION REQUIRED';
        } else if ($scope.blost[0].status == 'P') {
            $scope.status = 'PENDING';
        } else if ($scope.blost[0].status == 'K') {
            $scope.status = 'CHECKED';
        } else if ($scope.blost[0].status == 'C') {
            $scope.status = 'COMPLETE';
            $scope.show.edit = 'I';
        }
    });

    function getCustomerList() {
        $http.get('/getBlostCustomerList').then(function(response) {
            $scope.customerList = response.data;
            console.log($scope.customerList);
        });
    }

    function getBlostDetails() {
        $http.post('/getBlostDetails', $scope.blostID).then(function(response) {

            $scope.blostDetailsList = response.data;
            console.log($scope.blostDetailsList);
        });
    }
    $scope.addBlostEntry = function() {
        $scope.blostEntry.blostID = $routeParams.blostID;
        console.log($scope.blostEntry);

        $scope.blostEntry.formattedDateOfLoss = $filter('date')($scope.blostEntry.dateOfLoss, 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addBlostEntry', $scope.blostEntry).then(function(response) {

            var returnedData = response.data;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "BLOST Entry added successfully!"
                });


                $scope.blostDetailsList.push({
                    "name": $scope.blostEntry.name,
                    "phoneNo": $scope.blostEntry.phoneNo,
                    "address": $scope.blostEntry.address,
                    "collectionArea": $scope.blostEntry.collectionArea,
                    "binSize": $scope.blostEntry.binSize,
                    "noOfBins": $scope.blostEntry.noOfBins,
                    "sharedBin": $scope.blostEntry.sharedBin,
                    "dateOfLoss": $scope.blostEntry.dateOfLoss,
                    "reason": $scope.blostEntry.reason
                });

                angular.element('#createBlostEntry').modal('toggle');
            }
        });
    }
    $scope.assignCustomer = function(customer) {
        if (customer.company == null) {
            $scope.blostEntry.name = customer.name;
        } else {
            $scope.blostEntry.name = customer.companyName + ", " + customer.name;
        }
    }
    $scope.editBlostEntry = function(blostEntry) {
        $scope.editedBlostEntry = blostEntry;
    }
    $scope.saveBlostEntry = function() {
        $http.post('/editBlostEntry', $scope.editedBlostEntry).then(function(response) {

            var returnedData = response.data;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "BLOST Entry updated successfully!"
                });
                getBlostDetails();
                angular.element('#editBlostEntry').modal('toggle');
            }
        });
    }



    // FORM AUTHORIZATIONs
    $scope.requestAuthorization = function() {
        sendFormForAuthorization($routeParams.blostID, "blost");
        $scope.status = 'PENDING';
    };

    $scope.checkForm = function() {
        $scope.status = 'CHECKED';
        checkForm($routeParams.blostID, "blost");

        angular.element('#approveCheck').modal('toggle');
    }
    $scope.rejectForm = function() {
        $scope.status = 'CORRECTION REQUIRED';
        rejectForm($routeParams.blostID, "blost", $scope.blost[0].feedback);


        angular.element('#rejectForm').modal('toggle');
    }

    //CALL FUNCTIONS
    //getCustomerList();
    getBlostDetails();

});

function checkForm(formID, formType) {
    $http = angular.injector(["ng"]).get("$http");

    var formDetails = {
        "formID": formID,
        "formType": formType,
        "authorizedBy": window.sessionStorage.getItem('owner')
    }

    $http.post('/checkForm', formDetails).then(function(response) {

        returnedData = response.data;

        if (returnedData.status === "success") {
            angular.element('body').overhang({
                type: "success",
                "message": "Form approved!"
            });
        }
    });
}

function verifyForm(formID, formType) {
    $http = angular.injector(["ng"]).get("$http");

    var formDetails = {
        "formID": formID,
        "formType": formType,
        "verifiedBy": window.sessionStorage.getItem('owner')
    }

    $http.post('/verifyForm', formDetails).then(function(response) {

        returnedData = response.data;

        if (returnedData.status === "success") {
            angular.element('body').overhang({
                type: "success",
                "message": "Form verified!"
            });
        }
    });
}

function rejectForm(formID, formType, feedback) {
    $http = angular.injector(["ng"]).get("$http");


    var formDetails = {
        "formID": formID,
        "formType": formType,
        "feedback": feedback
    }

    $http.post('/rejectForm', formDetails).then(function(response) {

        var returnedData = response.data;
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

    $http.post('/sendFormForAuthorization', formDetails).then(function(response) {

        var returnedData = response.data;

        if (returnedData.status === "success") {
            angular.element('body').overhang({
                type: "success",
                "message": "Form sent for authorization!"
            });
        }
    });
}

function sendFormForVerification(formID, formType) {
    var today = new Date();
    $http = angular.injector(["ng"]).get("$http");
    var formDetails = {
        "formID": formID,
        "formType": formType,
        "preparedBy": window.sessionStorage.getItem('owner'),
        "date": today
    }

}