/*
jshint: white
global angular, document, google, Highcharts
*/
var app = angular.module('trienekens', ['ngRoute', 'ui.bootstrap', 'ngSanitize', 'ngCsv', 'easypiechart']);
//var socket = io.connect();
var socket = io({transports: ['websocket'], 'force new connection': true});
var flag = false;

//web push notification
const webPushPublicVapidKey = 'BKRH77GzVVAdLbU9ZAblIjl_zKYZzLlJQCRZXsdawtS--XnMPIQUN3QXJ87R9qgNITl7gkHjepq4wsm2SVxq6to';

// if('serviceWorker' in navigator){
//     send().catch(err => console.error(err));
// }
// webNotification('Trienekens-web-portal', 'New Bin Request Received');

// async function send(){
//     console.log("Registering service worker...");
//     const register = await navigator.serviceWorker.register('/worker.js',{
//         scope : '/'
//     });
//     console.log('Service Worker Registered');

//     //Register Push
//     console.log('Registering push');
//     const subscription = await register.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array(webPushPublicVapidKey)
//     });
//     console.log('Push Registered');
//     console.log(subscription);

//     //send push notification
//     console.log('Sending Push');
//     await fetch('/subscribe',{
//         method: 'POST',
//         body: JSON.stringify(subscription),
//         headers:{
//             'content-type': 'application/json'
//         }
//     });
//     console.log('Push Sent...');
// }

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

if(Notification.permission === "default"){
    Notification.requestPermission().then(permission =>{
    })
}

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

function webNotification(title, content){
    
    if(Notification.permission === "granted"){
        //windows notification
        var notification = new Notification(title, {body: content});
    }else if(Notification.permission !== "denied"){
        Notification.requestPermission().then(permission =>{
            if(permission === "granted"){
                var notification = new Notification(title, {body: content});
            }
        })
    }
}

function bdKPIFunc(custDate, custTime, compDate, compTime){

    if (custDate != null && custTime != null && compDate != null && compTime != null) {

        var returnBdKPI = '';
        var bdDateFormat = new Date(custDate);
        var complaintDateFormat = new Date(compDate);

        var bkBetweenDay = bdDateFormat - complaintDateFormat;
        bkBetweenDay = bkBetweenDay / 60 / 60 / 24 / 1000;

        var checkBetweenDay = bkBetweenDay + 1;

        var bkBetweenTime = "";

        var bdTimeFormat = new Date(2000, 0, 1, custTime.split(":")[0], custTime.split(":")[1]);

        var complaintTimeFormat = new Date(2000, 0, 1, compTime.split(":")[0], compTime.split(":")[1]);

        var operationStartTime = new Date(2000, 0, 1, 0, 00);
        var operationEndTime = new Date(2000, 0, 1, 24, 00);
        var mondayStartTime = new Date(2000, 0, 1, 08, 30);
        var fridayEndTime = new Date(2000, 0, 1, 17, 30);
        if(
            (complaintDateFormat.getDay() == '6' || complaintDateFormat.getDay() == '0') && (bdDateFormat.getDay() == '6' || bdDateFormat.getDay() == '0') ||
            (complaintDateFormat.getDay() == '5' && complaintTimeFormat > fridayEndTime && bdDateFormat.getDay() == '1' && bdTimeFormat < mondayStartTime)    
        ){
            returnBdKPI = "0:00";
        }else{
            if (bkBetweenDay == 0) {
                if(complaintDateFormat.getDay() == '5' && complaintTimeFormat > fridayEndTime){
                    bkBetweenTime = 0;
                }else if(bdTimeFormat.getDay() == '5' && bdTimeFormat > fridayEndTime){
                    bkBetweenTime = fridayEndTime - complaintTimeFormat;
                }else if(bdTimeFormat.getDay() == '1' && bdTimeFormat < mondayStartTime){
                    bkBetweenTime = 0;
                }else if(complaintDateFormat.getDay() == '1' && complaintTimeFormat < mondayStartTime){
                    bkBetweenTime = bdTimeFormat - mondayStartTime;
                }else{
                    bkBetweenTime = bdTimeFormat - complaintTimeFormat;
                }
                bkBetweenTime = bkBetweenTime / 60 / 60 / 1000;
                bkBetweenTime = bkBetweenTime.toFixed(2); 
                var splitHrsBK = "";
                var splitMinBK = "";

                var splitHrsBK = bkBetweenTime.split(".")[0];
                var splitMinBK = bkBetweenTime.split(".")[1] / 100 * 60;         
                var stayCondition = false;       

                returnBdKPI = splitHrsBK + ":" + splitMinBK; 

            } else if (bkBetweenDay >= 1) {
                if(complaintDateFormat.getDay() == '5' && complaintTimeFormat > fridayEndTime){
                    bkBetweenTime = bdTimeFormat - mondayStartTime;
                    stayCondition = true;
                }else if(complaintDateFormat.getDay() == '6' || complaintDateFormat.getDay() == '0'){
                    bkBetweenTime = bdTimeFormat - mondayStartTime;
                    bkBetweenDay++;
                    stayCondition = true;
                }else if(complaintDateFormat.getDay() == '1' && complaintTimeFormat < mondayStartTime){
                    bkBetweenTime = bdTimeFormat - mondayStartTime;
                }else if((bdDateFormat.getDay() == '1' && bdTimeFormat < mondayStartTime) || (bdDateFormat.getDay() == '5' && bdTimeFormat > fridayEndTime) || bdDateFormat.getDay() == '6' || bdDateFormat.getDay() == '0'){
                    bkBetweenTime = fridayEndTime - complaintTimeFormat;
                }else if(complaintDateFormat.getDay() == '5' && complaintTimeFormat <= fridayEndTime && bdDateFormat.getDay() == '1' && bdTimeFormat >= mondayStartTime){
                    bkBetweenTime = (fridayEndTime - complaintTimeFormat) + (bdTimeFormat - mondayStartTime);
                    stayCondition = true;
                }else{
                    bkBetweenTime = (operationEndTime - complaintTimeFormat) + (bdTimeFormat - operationStartTime);
                    stayCondition = true;
                }
                bkBetweenTime = bkBetweenTime / 60 / 60 / 1000;
                for (var dayCounter = 1; dayCounter < bkBetweenDay; dayCounter++) {
                    bkBetweenTime += 24;
                }
                if(stayCondition == true){
                    for(var x = 0; x < checkBetweenDay; x++){
                        var checkDate = new Date(complaintDateFormat);
                        checkDate.setDate(checkDate.getDate() + x);
                        if(checkDate.getDay() == '6' || checkDate.getDay() == '0'){
                            bkBetweenTime -= 24;
                        }                
                    }
                }

                bkBetweenTime = bkBetweenTime.toFixed(2);
                var splitHrsBK = "";
                var splitMinBK = "";

                var splitHrsBK = bkBetweenTime.split(".")[0];
                var splitMinBK = bkBetweenTime.split(".")[1] / 100 * 60;                

                returnBdKPI = splitHrsBK + ":" + splitMinBK;                    

            } else {
                returnBdKPI = "N/A";
            }
        }
        console.log(returnBdKPI);
        return returnBdKPI;
    }
}

function lgKPIFunc(statusDate, statusTime, compDate, compTime){

    if (statusDate != null && statusTime != null && statusDate != null && statusTime != null) {
        var returnLGKPI = '';
        var lgDateFormat = new Date(statusDate);
        var complaintDateFormat = new Date(compDate);

        var lgBetweenDay = lgDateFormat - complaintDateFormat;
        lgBetweenDay = lgBetweenDay / 60 / 60 / 24 / 1000;

        var checkBetweenDay = lgBetweenDay + 1;

        var lgBetweenTime = "";

        var lgTimeFormat = new Date(2000, 0, 1, statusTime.split(":")[0], statusTime.split(":")[1]);

        var complaintTimeFormat = new Date(2000, 0, 1, compTime.split(":")[0], compTime.split(":")[1]);

        var operationStartTime = new Date(2000, 0, 1, 8, 30);
        var operationEndTime = new Date(2000, 0, 1, 17, 30);

        if (lgBetweenDay == 0) {
            
            if(complaintTimeFormat < operationEndTime && lgTimeFormat > operationStartTime){
                lgBetweenTime = lgTimeFormat - complaintTimeFormat;
            }else{
                lgBetweenTime = 0;
            }

            lgBetweenTime = lgBetweenTime / 60 / 60 / 1000;
            lgBetweenTime = lgBetweenTime.toFixed(2); 
            var splitHrsLG = "";
            var splitMinLG = "";

            var splitHrsLG = lgBetweenTime.split(".")[0];
            var splitMinLG = lgBetweenTime.split(".")[1] / 100 * 60;                

            returnLGKPI = splitHrsLG + ":" + splitMinLG; 

        } else if (lgBetweenDay >= 1) {

            if(complaintTimeFormat > operationEndTime && lgTimeFormat > operationStartTime){
                lgBetweenTime = lgTimeFormat - operationStartTime;
            }else if(complaintTimeFormat < operationEndTime && lgTimeFormat < operationStartTime){
                lgBetweenTime = operationEndTime - complaintTimeFormat;
            }else if(complaintTimeFormat < operationEndTime && lgTimeFormat > operationStartTime){
                lgBetweenTime = (operationEndTime - complaintTimeFormat) + (lgTimeFormat - operationStartTime);
            }else{
                lgBetweenTime = 0;
            }
            
            lgBetweenTime = lgBetweenTime / 60 / 60 / 1000;
            

            for (var dayCounter = 1; dayCounter < lgBetweenDay; dayCounter++) {
                lgBetweenTime += 9;
            }

            for(var x = 0; x < checkBetweenDay; x++){
                var checkDate = new Date(complaintDateFormat);
                checkDate.setDate(checkDate.getDate() + x);
                if(checkDate.getDay() == '0'){
                    lgBetweenTime -= 9;
                }
            }

            if(lgBetweenTime < 0){
                lgBetweenTime = operationEndTime - complaintTimeFormat
            }
            if(lgBetweenTime < 0){
                lgBetweenTime = 0;
            }

            lgBetweenTime = lgBetweenTime.toFixed(2);
            var splitHrsLG = "";
            var splitMinLG = "";

            var splitHrsLG = lgBetweenTime.split(".")[0];
            var splitMinLG = lgBetweenTime.split(".")[1] / 100 * 60;                

            returnLGKPI = splitHrsLG + ":" + splitMinLG;                    
        } else {
            returnLGKPI = "N/A";
        }  
        
        return returnLGKPI;
    }
}

function isOpen(ws) {
    var ping = {
        "type": "ping"
    };
    ws.send(JSON.stringify(ping));
    //return ws.io.readyState === "open";
}

window.setInterval(function () {
    isOpen(socket);
}, 10000);

socket.on('connect', function () {
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

    if (window.sessionStorage.getItem('position') == "Manager" || window.sessionStorage.getItem('position') == "Administrator" || window.sessionStorage.getItem('position') == "Developer" || window.sessionStorage.getItem('position') == "DEVELOPER") {
        socket.emit('room', "manager");
    }
});

socket.on('receive authorize action', function (data) {
    if (data.num > 0) {
        $('.authorization').addClass("badge badge-danger").html(data.num);
    }
});

socket.on('receive form authorize action', function (data) {
    if (data.num > 0) {
        $('.form-authorization').addClass("badge badge-danger").html(data.num);
    }
});

socket.on('new enquiry', function (data) {
    if (data.unread > 0) {
        $('.enquiry').addClass("badge badge-danger").html(data.unread);
    }
});

socket.on('new binrequest', function (data) {
    console.log(data);
    if (data.unread > 0) {
        $('.binrequest').addClass("badge badge-danger").html(data.unsolvedCount);
    }

    lobi_notify('info', 'New Bin Request', 'New Bin Request Received', '');
    webNotification('Trienekens-web-portal', 'New Bin Request Received');  
});

socket.on('new message', function (data) {
    var content = data.content,
        sender = data.sender,
        recipient = data.recipient,
        date = data.date,
        complaintID = data.complaintID;

    lobi_notify('info', 'You received a new message.', 'From complaint ID: '+complaintID, '');
    webNotification('Trienekens-web-portal', 'You received a new message.');
    // if('serviceWorker' in navigator){
    //     send().catch(err => console.error(err));
    // }     
   
});



socket.on('read enquiry', function (data) {
    $('.enquiry').addClass("badge badge-danger").html(data.unread);
});

socket.on('read binrequest', function (data) {
    $('.binrequest').addClass("badge badge-danger").html(data.unread);
});

socket.on('new complaint', function (data) {
    if (data.unread != 0) {
        $('.complaint').addClass("badge badge-danger").html(data.unread);
    }
    lobi_notify('info', 'New App Complaint', 'New App Complaint Received', '');
    webNotification('Trienekens-web-portal', 'New App Complaint Received');
});

socket.on('read complaint', function (data) {
    $('.complaint').addClass("badge badge-danger").html(data.unread);
});

socket.on('receive report notification', function (data) {
    var content = data.name + ' have submitted a new report ' + data.id;
    lobi_notify('info', 'Daily Report', content, data.avatar);
});

socket.on('new complaint to web', function (data) {
    var content = data.premise;
    lobi_notify('info', 'New Complaint', content, '');
});

socket.on('disconnect', function () {
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
app.filter('offset', function () {
    'use strict';
    return function (input, start) {
        if (!input || !input.length) {
            return;
        }
        start = +start; //parse to int
        return input.slice(start);
    };
});

app.filter('trustHtml', function ($sce) {
    return function (html) {
        return $sce.trustAsHtml(html)
    }
});

// WBD Filters
app.filter('serialNoFilter', function () {
    'use strict';
    return function (serialNo, input) {
        if (input == serialNo) {
            return serialNo;
        }
        return serialNo;
    }
})

/*
    -Upload Image
*/
app.directive('appFilereader', function ($q) {
    'use strict';
    var slice = Array.prototype.slice;

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) {
                return;
            }

            ngModel.$render = function () {};

            element.bind('change', function (e) {
                var element;
                element = e.target;

                function readFile(file) {
                    var deferred = $q.defer(),
                        reader = new FileReader();

                    reader.onload = function (e) {
                        deferred.resolve(e.target.result);
                    };
                    reader.onerror = function (e) {
                        deferred.reject(e);
                    };
                    reader.readAsDataURL(file);

                    return deferred.promise;
                }

                $q.all(slice.call(element.files, 0).map(readFile))
                    .then(function (values) {
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
    -upload excel
*/

app.directive('fileModel', ['$parse', function ($parse) { 
    return { 
        restrict: 'A', 
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel); 
            var modelSetter = model.assign;
            element.bind('change', function(){ 
                scope.$apply(function(){
                  modelSetter(scope, element[0].files[0]);
                }); 
            }); 
        } 
    }; 
}]);

/*
    -Sharing Data
*/
app.service('storeDataService', function () {
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
                "approve": 'A',
                "delete": 'I',
                "export": 'I'
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
            "complaintappkch": {
                "view": 'I'
            },
            "complaintwebkch": {
                "view": 'I',
                "create": 'I',
                "hist": 'I',
                "editcms": 'I',
                "delete": 'I'
            },
            "complaintlogskch": {
                "view": 'I'
            },
            "complaintappbtu": {
                "view": 'I'
            },
            "complaintwebbtu": {
                "view": 'I',
                "create": 'I',
                "hist": 'I',
                "editcms": 'I',
                "delete": 'I'
            },
            "complaintlogsbtu": {
                "view": 'I'
            },
            "bdb": {
                "view": 'I',
                "create": 'I',
                "edit": 'I',
                "delete": 'I',
                "export": 'I',
                "batch": 'I',
                "hist": 'I'
            },
            "acrdb": {
                "view": 'I',
                "create": 'I',
                "edit": 'I',
                "delete": 'I',
                "export": 'I',
                "hist": 'I'
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
app.directive('editable', function ($compile, $http, $filter, storeDataService) {
    'use strict';
    return function (scope) {
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
            "status": '',
            "branch": ''
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



        scope.notify = function (stat, mes) {
            angular.element('body').overhang({
                type: stat,
                message: mes
            });
        };

        scope.editAcr = function (acr) {

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

        scope.saveAcr = function (acr) {
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

            $http.post('/getAreaID', scope.thisAcr).then(function (response) {

                console.log(response.data);
                scope.thisAcr.areaID = response.data[0].areaID;
                console.log(scope.thisAcr);
                $http.post('/editAcr', scope.thisAcr).then(function (response) {
                    var data = response.data[0];

                    if (data === 'error') {
                        window.alert("DCS Doesn't Exist!");
                    }
                });
            });




        };

        scope.saveAcrDays = function (acr) {
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
            $http.post('/editAcrDays', scope.thisAcr).then(function (response) {
                var data = response.data;

            });




        };
        scope.cancelAcr = function () {
            scope.showAcr = !scope.showAcr;

            $.each(storeDataService.acr, function (index, value) {
                if (storeDataService.acr[index].id == scope.acr.id) {
                    scope.b = angular.copy(storeDataService.acr[index]);
                    return false;
                }
            });

        };

        scope.editDbrEntry = function (dbr) {
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

        scope.saveDbrEntry = function (dbr) {
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

            $http.post('/editDbr', scope.thisDbr).then(function (response) {
                var data = response.data;

                scope.notify(data.status, data.message);
            });
        }

        scope.cancelDbrEntry = function () {
            scope.showDbr = !scope.showDbr;
            $.each(storeDataService.dbr, function (index, value) {
                if (storeDataService.dbr[index].id == scope.dbr.id) {
                    scope.b = angular.copy(storeDataService.dbr[index]);
                    return false;
                }
            });

        }

        scope.editTruck = function (id, no, transporter, type, ton, tax, status, branch) {
            scope.showTruck = !scope.showTruck;
            scope.thisTruck = {
                "id": id,
                "no": no,
                "transporter": transporter,
                "type": type,
                "ton": ton,
                "roadtax": tax,
                "status": status,
                "branch": branch
            };
        };
        scope.saveTruck = function () {
            scope.showTruck = !scope.showTruck;
            scope.t.iam = window.sessionStorage.getItem('owner');
            $http.post('/editTruck', scope.t).then(function (response) {
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
                $.each(scope.truckListActive, function (index, value) {
                    if (scope.truckListActive[index].id == scope.thisTruck.id) {
                        existActive = true;
                    }
                });
                $.each(scope.truckListInactive, function (index, value) {
                    if (scope.truckListInactive[index].id == scope.thisTruck.id) {
                        existInactive = true;
                    }
                });
                $.each(scope.truckList, function (index, value) {
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
        scope.cancelTruck = function () {
            scope.showTruck = !scope.showTruck;

            $.each(storeDataService.truck, function (index, value) {
                if (storeDataService.truck[index].id == scope.thisTruck.id) {
                    scope.t = angular.copy(storeDataService.truck[index]);
                }
            });

        };

        scope.editZone = function (id, code, name, status) {
            scope.showZone = !scope.showZone;
            scope.thisZone = {
                "id": id,
                "code": code,
                "name": name,
                "status": status
            };
        };
        scope.saveZone = function () {
            scope.showZone = !scope.showZone;
            scope.z.iam = window.sessionStorage.getItem('owner');
            $http.post('/editZone', scope.z).then(function (response) {
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
        scope.cancelZone = function () {
            scope.showZone = !scope.showZone;

            $.each(storeDataService.zone, function (index, value) {
                if (storeDataService.zone[index].id == scope.thisZone.id) {
                    scope.z = angular.copy(storeDataService.zone[index]);
                }
            });
        };

        scope.editProfile = function () {
            scope.showProfile = !scope.showProfile;
            scope.originalData = angular.copy(scope.thisAccount);
        };
        scope.saveProfile = function () {
            scope.showProfile = !scope.showProfile;
            scope.thisAccount.dob = $filter('date')(scope.thisAccount.dob, 'dd MMM yyyy');
            scope.thisAccount.bindDob = $filter('date')(scope.thisAccount.dob, 'dd MMM yyyy');
            $http.post('/updateProfile', scope.thisAccount).then(function (response) {
                var data = response.data;
                scope.notify(data.status, data.message);
            });
        };
        scope.cancelProfile = function () {
            scope.showProfile = !scope.showProfile;
            scope.thisAccount = angular.copy(scope.originalData);
        };

        scope.editBin = function (id, name, location, area, areaCode, status) {
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
        scope.saveBin = function () {
            scope.showBin = !scope.showBin;
            var areaFullString = (scope.b.areacode).split(',');
            scope.b.area = areaFullString[0];
            scope.b.areaCode = areaFullString[1];
            scope.b.iam = window.sessionStorage.getItem('owner');
            $http.post('/editBinCenter', scope.b).then(function (response) {
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
        scope.cancelBin = function () {
            scope.showBin = !scope.showBin;

            $.each(storeDataService.bin, function (index, value) {
                if (storeDataService.bin[index].id == scope.thisBin.id) {
                    scope.b = angular.copy(storeDataService.bin[index]);
                    return false;
                }
            });

        };

        scope.editCollection = function (id, address) {
            scope.showCollection = !scope.showCollection;
            scope.thisCollection = {
                "id": id,
                "address": address
            };
        };
        scope.saveCollection = function () {
            scope.showCollection = !scope.showCollection;
            scope.c.iam = window.sessionStorage.getItem('owner');
            $http.post('/updateCollection', scope.c).then(function (response) {
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
        scope.cancelCollection = function () {
            scope.showCollection = !scope.showCollection;
            $.each(storeDataService.collection, function (index, value) {
                if (storeDataService.collection[index].id == scope.thisCollection.id) {
                    scope.c = angular.copy(storeDataService.collection[index]);
                    return false;
                }
            });
        };
        scope.deleteCollection = function (id) {
            scope.collection.id = id;
            scope.collection.iam = window.sessionStorage.getItem('owner');
            $http.post('/deleteCollection', scope.collection).then(function (response) {
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

        scope.editCollectionSchedule = function () {
            scope.showCollectionSchedule = !scope.showCollectionSchedule;

            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');
        };

        scope.saveCollectionSchedule = function (id, mon, tue, wed, thur, fri, sat) {
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

            $http.post('/editCollectionSchedule', scope.thisCollectionSchedule).then(function (response) {
                var data = response.data;
                console.log(data);
            }, function (error) {
                console.log(error);
            });
        };

        scope.cancelCollectionSchedule = function () {
            scope.showCollectionSchedule = !scope.showCollectionSchedule;

            $.each(storeDataService.collectionSchedule, function (index, value) {
                if (storeDataService.collectionSchedule[index].id == scope.thisCollectionSchedule.id) {
                    scope.x = angular.copy(storeDataService.collectionSchedule[index]);
                }
            });
        };

        scope.cancelBinRequestStatus = function () {
            scope.showBinRequest = !scope.showBinRequest;

            $.each(storeDataService.binRequest, function (index, value) {
                if (storeDataService.binRequest[index].id == scope.thisBinRequest.id) {
                    scope.x = angular.copy(storeDataService.binRequest[index]);
                }
            });
        };

        scope.editEnquiryStatus = function () {
            scope.showEnquiry = !scope.showEnquiry;

            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');
        };

        scope.saveEnquiryStatus = function (status, id) {
            scope.showEnquiry = !scope.showEnquiry;

            scope.thisEnquiry = {
                "status": status,
                "id": id
            };

            $http.post('/updateEnquiry', scope.thisEnquiry).then(function (response) {
                var data = response.data;
                if (data == "Enquiry Updated") {
                    alert(data);
                }
                console.log(data);
            }, function (error) {
                console.log(error);
            });
        };

        scope.cancelEnquiryStatus = function () {
            scope.showEnquiry = !scope.showEnquiry;

            $.each(storeDataService.enquiry, function (index, value) {
                if (storeDataService.enquiry[index].id == scope.thisEnquiry.id) {
                    scope.x = angular.copy(storeDataService.enquiry[index]);
                }
            });
        };

        //TAMAN MODULE EDITABLE TABLES
        scope.editTaman = function () {
            scope.showTaman = !scope.showTaman;


            console.log("hello from editTaman");
            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');

        };
        scope.saveTaman = function (tamanID, areaID, tamanName, longitude, latitude, areaCollStatus) {
            scope.showTaman = !scope.showTaman;

            scope.thisTaman = {
                "tamanID": tamanID,
                "areaID": areaID,
                "tamanName": tamanName,
                "longitude": longitude,
                "latitude": latitude,
                "areaCollStatus": areaCollStatus
            };

            $http.put('/editTaman', scope.thisTaman).then(function (response) {
                var data = response.data;

                scope.notify(data.status, data.message);

                $.each(storeDataService.databaseBin, function (index, value) {
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
        scope.cancelTaman = function () {
            scope.showTaman = !scope.showTaman;

            $.each(storeDataService.bin, function (index, value) {
                if (storeDataService.databaseBin[index].id == scope.thisDatabaseBin.id) {
                    scope.b = angular.copy(storeDataService.databaseBin[index]);
                    return false;
                }
            });

        };
        scope.deleteTaman = function (tamanID) {
            scope.tamanIDJSON = {
                "tamanID": tamanID
            };
            $http.post('/deleteTaman', scope.tamanIDJSON).then(function (response) {
                //var data = response.data;
                scope.message = {
                    "status": "success",
                    "message": "Taman deleted successfully!"
                }

                scope.notify(scope.message.status, scope.message.message);

            });
        };

        //CUSTOMER MODULE EDITABLE TABLES
        scope.editCustomer = function () {
            scope.showCustomer = !scope.showCustomer;

            console.log("hello from editCustomer");
            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');

        };
        scope.saveCustomer = function (customerID, creationDateTime, name, ic, contactNumber, tradingLicense, city, imgPath, status, houseNo, streetNo, companyName) {
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

            $http.put('/editCustomer', scope.thisCustomer).then(function (response) {
                var data = response.data;

                console.log("hello from editCustomer");
                console.log(response.data);

                scope.notify(data.status, data.message);

                $.each(storeDataService.databaseBin, function (index, value) {
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
        scope.cancelCustomer = function () {
            scope.showCustomer = !scope.showCustomer;

            $.each(storeDataService.bin, function (index, value) {
                if (storeDataService.customer[index].id == scope.thisCustomer.id) {
                    scope.b = angular.copy(storeDataService.customer[index]);
                    return false;
                }
            });

        };
        scope.deleteCustomer = function (customerID) {
            //scope.customerIDTemp = customerID;

            $http.post('/deleteCustomer', customerID).then(function (response) {
                var data = response.data;

                scope.notify(data.status, data.message);

            });
        };

        //BIN STOCK MODULE EDITABLE TABLES
        scope.editBinStock = function () {
            scope.showBinStock = !scope.showBinStock;
            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');

        };

        scope.saveBinStock = function (serialNo, size, status) {
            scope.showBinStock = !scope.showBinStock;

            scope.thisBinStock = {
                "serialNo": serialNo,
                "size": size,
                "status": status
            }

            $http.put('/editBinStock', scope.thisBinStock).then(function (response) {
                var data = response.data;

                scope.notify(data.status, data.message);
            });
        };

        scope.cancelBinStock = function () {
            scope.showBinStock = !scope.showBinStock;

            $.each(storeDataService.bin, function (index, value) {
                if (storeDataService.databaseBin[index].id == scope.thisDatabaseBin.id) {
                    scope.b = angular.copy(storeDataService.databaseBin[index]);
                    return false;
                }
            });

        };
        scope.deleteBinStock = function (serialNo) {
            $http.post('/deleteBinStock', scope.b).then(function (response) {
                //var data = response.data;
                console.log('Delete bin stock trienekens.js');

                //scope.notify(data.status, data.message);

            });
        };

        //BIN INVENTORY MODULE EDITABLE TABLES
        scope.editDatabaseBin = function () {
            scope.showDatabaseBin = !scope.showDatabaseBin;
            //scope.b.area = area;




            console.log("hello from editDatabaseBin");
            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');

        };
        scope.saveDatabaseBin = function (id, date, customerID, areaCode, serialNo, acrfSerialNo, status, rcDwell, comment, itemType, path) {
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

            $http.put('/editDatabaseBin', scope.thisDatabaseBin).then(function (response) {
                var data = response.data;

                scope.notify(data.status, data.message);

                $.each(storeDataService.databaseBin, function (index, value) {
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
        scope.cancelDatabaseBin = function () {
            scope.showDatabaseBin = !scope.showDatabaseBin;

            $.each(storeDataService.bin, function (index, value) {
                if (storeDataService.databaseBin[index].id == scope.thisDatabaseBin.id) {
                    scope.b = angular.copy(storeDataService.databaseBin[index]);
                    return false;
                }
            });

        };
        scope.deleteDatabaseBin = function () {
            $http.post('/deleteDatabaseBin', scope.b).then(function (response) {
                var data = response.data;

                scope.notify(data.status, data.message);
                $http.get('/getAllDatabaseBin').then(function (response) {

                    $scope.databaseBinList = response.data;
                    storeDataService.databaseBin = angular.copy($scope.databaseBinList);
                });

            });
        };
        scope.editNewMgb = function () {
            scope.showNewMgb = !scope.showNewMgb;

            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');
        };
        scope.saveNewMgb = function (date, doNo, inNew120, inNew240, inNew660, inNew1000, outNew120, outNew240, outNew660, outNew1000) {
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

            $http.post('/editNewMgbStock', scope.thisNewMgb).then(function (response) {
                var data = response.data;

                scope.notify(data.status, data.message);

                $.each(storeDataService.databaseBin, function (index, value) {
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
        scope.cancelNewMgb = function () {
            scope.showNewMgb = !scope.showNewMgb;

            $.each(storeDataService.bin, function (index, value) {
                if (storeDataService.databaseBin[index].id == scope.thisDatabaseBin.id) {
                    scope.b = angular.copy(storeDataService.databaseBin[index]);
                    return false;
                }
            });

        };
        scope.editReusableMgb = function () {
            scope.showReusableMgb = !scope.showReusableMgb;

            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');
        };
        scope.saveReusableMgb = function (date, inReusable120, inReusable240, inReusable660, inReusable1000, outReusable120, outReusable240, outReusable660, outReusable1000) {
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



            $http.post('/editReusableMgbStock', scope.thisReusableMgb).then(function (response) {
                var data = response.data;

                scope.notify(data.status, data.message);

                $.each(storeDataService.databaseBin, function (index, value) {
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
        scope.cancelReusableMgb = function () {
            scope.showReusableMgb = !scope.showReusableMgb;

            $.each(storeDataService.bin, function (index, value) {
                if (storeDataService.databaseBin[index].id == scope.thisDatabaseBin.id) {
                    scope.b = angular.copy(storeDataService.databaseBin[index]);
                    return false;
                }
            });

        };
        //DCS DETAILS
        scope.editDcsDetails = function (id, name, location, area, status) {
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

        scope.saveDcsDetails = function () {
            scope.showDcsDetails = !scope.showDcsDetails;

            $http.post('/editDcsDetails', scope.b).then(function (response) {
                var data = response.data;

                scope.notify(data.status, data.message);

                $.each(storeDataService.bin, function (index, value) {
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
        scope.cancelDcsDetails = function () {
            scope.showDcsDetails = !scope.showDcsDetails;

            $.each(storeDataService.bin, function (index, value) {
                if (storeDataService.bin[index].id == scope.thisBin.id) {
                    scope.b = angular.copy(storeDataService.bin[index]);
                    return false;
                }
            });

        };

    };
});

app.directive('dateNow', ['$filter', function ($filter) {
    'use strict';
    return {
        link: function ($scope, $elem, $attrs) {
            $elem.text($filter('date')(new Date(), $attrs.dateNow));
        }
    };
}]);

app.directive("fileInput", function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attribute) {
            element.bind("change", function () {
                scope.$apply(function () {
                    $parse(attribute.fileInput).assign(scope, element[0].files)
                });
            });
        }
    }
});

/*
    -Sharing Function
*/
app.run(function ($rootScope) {
    $rootScope.notify = function (stat, mes) {
        angular.element('body').overhang({
            type: stat,
            message: mes
        });
    };
    $rootScope.loadDetails = function (key, value) {
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
    $rootScope.renderSltPicker = function () {
        angular.element('.selectpicker').selectpicker('refresh');
        angular.element('.selectpicker').selectpicker('render');
    };
    $rootScope.geocodeLink = function (place) {
        var area = place.area.replace(" ", "+");
        var zone = place.zone.replace(" ", "+");
        var concat = area + '+' + zone;

        return "https://maps.googleapis.com/maps/api/geocode/json?address=" + concat + "&key=<APIKEY>";
    };
});

//Customer Service Pages Controller
app.controller('custServiceCtrl', function($scope, $rootScope, $location, $http, $window, $filter, storeDataService) {
    
    $scope.itemsPerPageEnquiry = 10;
    $scope.itemsPerPageAnnouncement = 10;

    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 3; //Record number each page
    $scope.maxSize = 8; //Show the number in page

    $scope.sendNotifToDevice = function () {
        $scope.data = {
            // 'target': "LocalDeveloper",
           'target': "TriAllUsers",
            'title': $scope.notifTitle,
            'message': $scope.notifMessage,
            'link': $scope.notifLink
        };

        if (confirm("Poset Announcement?")) {
            $http.post('/sendNotifToDevice', $scope.data).then(function (response) {
                console.log(response.data);
            }, function (error) {
                console.log(error);
            });

            $http.post('/insertAnnouncement', $scope.data).then(function (response) {
                console.log(response.data);
            }, function (error) {
                console.log(error);
            });
            alert("Announcement posted!");
        };
    };

    // $scope.uploadImg = function () {
    //     var fd = new FormData();
    //     angular.forEach($scope.files, function (file) {
    //         fd.append('file[]', file);
    //     });

    //     console.log($scope.files);
    //     $http.post('/uploadCarouselImg').then(function (response) {
    //         console.log(response.data);
    //     }, function (error) {
    //         console.log(error);
    //     });
    // };

    // $scope.displayImg = function () {
    //     $http.get('/fetchCarouselImg').then(function (response) {
    //         console.log(response.data.output);
    //         $scope.imgs = response.data.output;
    //     }, function (error) {
    //         console.log(error);
    //     });
    // };

    // $scope.deleteImg = function (id, name) {
    //     $scope.delCarouselImg = {
    //         "id": id,
    //         "name": name
    //     };

    //     $http.post('/deleteCarouselImg', $scope.delCarouselImg).then(function (response) {
    //         alert(response.data);
    //         $scope.displayImg();
    //     }, function (error) {
    //         console.log(error);
    //     });
    // };

    $scope.getSchedule = function () {
        $http.get('/getAllSchedule').then(function (response) {
            console.log(response.data);
            $scope.schedule = response.data;
        }, function (error) {
            console.log(error);
        });
    };

    $scope.getAnnouncements = function () {
        $http.get('/getAnnouncements').then(function (response) {
            console.log(response.data);
            $scope.announcements = response.data;
            $scope.totalItemsAnnouncement = response.data.length;
        }, function (error) {
            console.log(error);
        });
    };

    $scope.getAreas = function () {
        $http.get('/getAreas').then(function (response) {
            console.log(response.data);
            $scope.areaList = response.data;
        }, function (error) {
            console.log(error);
        });
    };

    $scope.getEnquiry = function () {
        $http.get('/getEnquiry').then(function (response) {
            console.log(response.data);
            $scope.enquiry = response.data;
            $scope.totalItemsEnquiry = response.data.length;
            $scope.searchEnquiryFilter = '';
            $scope.filterEnquiryList = [];

            $scope.searchEnquiry = function (enquiry) {
                return (enquiry.name + enquiry.contactNumber).toUpperCase().indexOf($scope.searchEnquiryFilter.toUpperCase()) >= 0;
            }

            //$scope.totalItemsEnquiry = $scope.filterEnquiryList.length;

            $scope.getWebData = function () {
                return $filter('filter')($scope.filterEnquiryList, $scope.searchEnquiryFilter);
            }
        }, function (error) {
            console.log(error);
        });
        $http.post('/readEnquiry').then(function (response) {
            console.log(response.data);
            if (response.data == "Enquiry Read") {
                socket.emit('enquiry read');
            }
        }, function (err) {
            console.log(err);
        });
    };
    
    //ng-csv
    $scope.separator = ",";
    $scope.getDataHeaderMunicipal = function () {
        return ["Collection Promptness Unsatisfied", "Collection Promptness Satisfied", "Collection Promptness Very Satisfied", "Team Efficiency Unsatisfied", "Team Efficiency Satisfied", "Team Efficiency Very Satisfied", "Company Rating Unsatisfied", "Company Rating Satisfied", "Company Rating Very Satisfied", "Bin Handling Unsatisfied", "Bin Handling Satisfied", "Bin Handling Very Satisfied", "Spillage Control Unsatisfied", "Spillage Control Satisfied", "Spillage Control Very Satisfied", "Query Response Unsatisfied", "Query Response Satisfied", "Query Response Very Satisfied"];
    };
    $scope.getDataHeaderCommercial = function () {
        return ["Collection Promptness Unsatisfied", "Collection Promptness Satisfied", "Collection Promptness Very Satisfied", "Team Efficiency Unsatisfied", "Team Efficiency Satisfied", "Team Efficiency Very Satisfied", "Company Rating Unsatisfied", "Company Rating Satisfied", "Company Rating Very Satisfied", "Cleanliness Unsatisfied", "Cleanliness Satisfied", "Cleanliness Very Satisfied", "Physical Condition Unsatisfied", "Physical Condition Satisfied", "Physical Condition Very Satisfied", "Query Response Unsatisfied", "Query Response Satisfied", "Query Response Very Satisfied"];
    };
    $scope.getDataHeaderScheduled = function () {
        return ["Team Efficiency Unsatisfied", "Team Efficiency Satisfied", "Team Efficiency Very Satisfied", "Company Rating Unsatisfied", "Company Rating Satisfied", "Company Rating Very Satisfied", "Health Adherence Unsatisfied", "Health Adherence Satisfied", "Health Adherence Very Satisfied", "Regulations Adherence Unsatisfied", "Regulations Adherence Satisfied", "Regulations Adherence Very Satisfied", "Query Response Unsatisfied", "Query Response Satisfied", "Query Response Very Satisfied"];
    };
});

app.controller('binRequestController', function($scope, $http, $filter, storeDataService){

    $scope.searchBinReqStatus = "";
    $scope.searchRoroReqStatus = "";
    
    $scope.getBinRoroRequest = function(reqStatus){
        $http.post('/getBinRequest', {"status": reqStatus}).then(function (response) {
            $scope.itemsPerPageBin = 8;
            $scope.itemsPerPageRoro = 8;
            $scope.currentBinPage = 1; //Initial current page to 1
            $scope.currentRoroPage = 1; //Initial current page to 1
            $scope.maxSize = 8; //Show the number in page

            $scope.roroEnquiry = [];
            $scope.nonRoroEnquiry = [];
            $scope.searchBinReqFilter = '';
            $scope.searchRoroEnqFilter = '';
            $scope.filterBinReqList = [];
            $scope.filterRoroEnqList = [];

            $scope.pendingBinRequests = response.data;
            for (var i=0; i<$scope.pendingBinRequests.length; i++){
                if (($scope.pendingBinRequests[i].reason).toLowerCase().includes("roro")){
                    $scope.roroEnquiry.push($scope.pendingBinRequests[i]);
                } else {
                    $scope.nonRoroEnquiry.push($scope.pendingBinRequests[i]);
                }
            }
            //search non roro request
            $scope.searchBinReq = function (br) {
                return (br.reqID + br.name + br.contactNumber + br.status + br.type + br.dateRequest + br.reason).toUpperCase().indexOf($scope.searchBinReqFilter.toUpperCase()) >= 0;
            }
            
            //search roro enquiries
            $scope.searchRoroEnq = function (br) {
                return (br.reqID + br.name + br.contactNumber).toUpperCase().indexOf($scope.searchRoroEnqFilter.toUpperCase()) >= 0;
            }

            $scope.filterBinReqList = angular.copy($scope.nonRoroEnquiry);
            $scope.filterRoroEnqList = angular.copy($scope.roroEnquiry);

            $scope.totalItemsBinReq = $scope.filterBinReqList.length;
            $scope.totalItemsBinReqRoro = $scope.filterRoroEnqList.length;         

            $scope.showDeleteBinReq = angular.copy(storeDataService.show.binrequest.delete);
            $scope.showExportBinReq = angular.copy(storeDataService.show.binrequest.export);

            $scope.getBinReq = function () {
                return $filter('filter')($scope.filterBinReqList, $scope.searchBinReqFilter);
            }        



            $scope.getRoroEnq = function () {
                return $filter('filter')($scope.filterRoroEnqList, $scope.searchRoroEnqFilter);
            }

            $scope.$watch('searchBinReqFilter', function (newVal, oldVal) {
                var vm = this;
                if (oldVal !== newVal) {
                    $scope.currentBinPage = 1;
                    $scope.totalItemsBinReq = $scope.getBinReq().length;
                }
                return vm;
            }, true);

            $scope.$watch('searchRoroEnqFilter', function (newVal, oldVal) {
                var vm = this;
                if (oldVal !== newVal) {
                    $scope.currentRoroPage = 1;
                    $scope.totalItemsBinReqRoro = $scope.getRoroEnq().length;
                }
                return vm;
            }, true);
        });
    }

    $scope.getBinRoroRequest("");

    $http.get('/binRequestUnsolvedCount').then(function (response) {
        $scope.unsolvedBin = response.data[0].unsolvedBin;
    });

    $http.get('/roroRequestUnsolvedCount').then(function (response) {
        $scope.unsolvedRoro = response.data[0].unsolvedRoro;
    });

    $scope.deleteBinReq = function(binReqID){

        if(confirm("Do you want to Delete the Bin Request / RoRo Request?")){
            $http.post('/deleteBinReq', {'binReqID': binReqID}).then(function (response){
                if(response.data.status == "success"){
                    $scope.notify(response.data.status, response.data.message);
                    
                }else{
                    $scope.notify("error","There is something wrong!");
                }
                location.reload();
            })
        }
    }

    $scope.binReqDetail = function (reqID) {
        window.location.href = '#/bin-request-detail/' + reqID;

    };

    $scope.exportBinReqPage = function(){
        setTimeout(function(){
            window.location.href = '#/export-bin-request';
        }, 500);
    }   
});

app.controller('cssInfoCtrl', function($scope, $http, $filter, storeDataService) {
    'use strict';

    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 3; //Record number each page
    $scope.maxSize = 8; //Show the number in page

    $scope.searchCompactorFilter = '';
    $scope.searchRoroFilter = '';
    $scope.searchScheduledFilter = '';
    $scope.compactorCurrentPage = 1; //Initial current page to 1
    $scope.roroCurrentPage = 1; //Initial current page to 1
    $scope.scheduledCurrentPage = 1; //Initial current page to 1
    $scope.detailItemsPerPage = 10; //Record number each page
    $scope.detailMaxSize = 10; //Show the number in page

    $scope.filterCompactorList = [];
    $scope.filterRoroList = [];
    $scope.filterScheduledList = [];
    $scope.m = {};
    $scope.c = {};
    $scope.s = {};

    //auto-fill satisfaction form date
    var today = new Date();
    $scope.m.date = today;
    $scope.c.date = today;
    $scope.s.date = today;

    $scope.m.formattedDate = $filter('date')($scope.m.date, 'yyyy-MM-dd HH:mm:ss');
    $scope.c.formattedDate = $filter('date')($scope.c.date, 'yyyy-MM-dd HH:mm:ss');
    $scope.s.formattedDate = $filter('date')($scope.s.date, 'yyyy-MM-dd HH:mm:ss');





    $scope.addFeedback = function (type) {
        if (type == "municipal") {
            $http.post('/addMunicipal', $scope.m).then(function (response) {
                var returnedData = response.data;

                if (returnedData === "success") {
                    angular.element('body').overhang({
                        type: "success",
                        "message": "Feedback added successfully!"
                    });

                    $scope.getMunicipalFeedback(); //REFRESH DETAILS

                    angular.element('#municipal-form').modal('toggle');
                    $scope.resetFormM();
                }
            });
        } else if (type == "commercial") {
            $http.post('/addCommercial', $scope.c).then(function (response) {
                var returnedData = response.data;

                if (returnedData === "success") {
                    angular.element('body').overhang({
                        type: "success",
                        "message": "Feedback added successfully!"
                    });

                    $scope.getCommercialFeedback(); //REFRESH DETAILS

                    angular.element('#commercial-form').modal('toggle');
                    $scope.resetFormC();
                }
            });
            
        } else {
            $http.post('/addScheduled', $scope.s).then(function (response) {
                var returnedData = response.data;

                if (returnedData === "success") {
                    angular.element('body').overhang({
                        type: "success",
                        "message": "Feedback added successfully!"
                    });

                    $scope.getScheduledFeedback(); //REFRESH DETAILS

                    angular.element('#scheduled-form').modal('toggle');
                    $scope.resetFormS();
                }
            });
            
        }
    };

    $scope.getMunicipalFeedback = function () {
        $http.post('/customerFeedbackMunicipal', $scope.filters).then(function (response) {
            $scope.reviews = response.data;
            $scope.totalItems = response.data.comments.length;
            $scope.totalUnsatisfied = $scope.reviews.compRateUS + $scope.reviews.teamEffUS + $scope.reviews.collPromptUS + $scope.reviews.binHandUS + $scope.reviews.spillCtrlUS + $scope.reviews.qryRespUS;
            $scope.totalSatisfied = $scope.reviews.compRateAvg + $scope.reviews.teamEffAvg + $scope.reviews.collPromptAvg + $scope.reviews.binHandAvg + $scope.reviews.spillCtrlAvg + $scope.reviews.qryRespAvg;
            $scope.totalVSatisfied = $scope.reviews.compRateS + $scope.reviews.teamEffS + $scope.reviews.collPromptS + $scope.reviews.binHandS + $scope.reviews.spillCtrlS + $scope.reviews.qryRespS;

            var data = {
                ...response.data
            };
            delete data.comments;
            $scope.municipalData = [];
            $scope.municipalData.push(data);

            //excel filename
            if ($scope.filters.month == undefined && $scope.filters.location == undefined) {
                $scope.filename = $scope.filters.year.value + "_custsatisfaction_municipal.xls";
            } else if ($scope.filters.month != undefined && $scope.filters.location == undefined){
                $scope.filename = $scope.filters.year.value.toString() + "_" + $scope.filters.month.toString() + "_custsatisfaction_municipal.xls";
            } else if ($scope.filters.month != undefined && $scope.filters.location != undefined){
                $scope.filename = $scope.filters.year.value.toString() + "_" + $scope.filters.month.toString() + "_" + $scope.filters.location + "_custsatisfaction_municipal.xls";
            } else if ($scope.filters.month == undefined && $scope.filters.location != undefined){
                $scope.filename = $scope.filters.year.value.toString() + "_" + $scope.filters.location + "_custsatisfaction_municipal.xls";
            }
            
            $scope.downloadxls = function (tableid) {
                var downloadLink;
                var dataType = 'application/vnd.ms-excel';
                var tableSelect = document.getElementById(tableid);
                var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

                // Specify file name
                var filename = $scope.filename;

                // Create download link element
                downloadLink = document.createElement("a");

                document.body.appendChild(downloadLink);

                if (navigator.msSaveOrOpenBlob) {
                    var blob = new Blob(['\ufeff', tableHTML], {
                        type: dataType
                    });
                    navigator.msSaveOrOpenBlob(blob, filename);
                } else {
                    // Create a link to the file
                    downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

                    // Setting the file name
                    downloadLink.download = filename;

                    //triggering the function
                    downloadLink.click();
                }
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

            $http.get('/readSatisfactionMunicipal').then(function (response) {
                console.log(response.data);
            }, function (err) {
                console.log(err);
            });
        }, function (err) {
            console.log(err);
        });

        var municipalYearMonth = transformYearMothLocFunc($scope.filters);
        $http.post('/getCSSInfoCompactor', municipalYearMonth).then(function(response){
            $scope.compactorInfo = response.data;      
            
            for(var c = 0; c < $scope.compactorInfo.length; c++){
                $scope.compactorInfo[c].date = $filter('date')($scope.compactorInfo[c].date, 'yyyy-MM-dd HH:mm:ss');
            }
    
            $scope.searchCompactor = function(compactor){
                return (compactor.date + compactor.location + compactor.name + compactor.contact + compactor.comment).toUpperCase().indexOf($scope.searchCompactorFilter.toUpperCase()) >= 0;
            }
    
            $scope.filterCompactorList = angular.copy($scope.compactorInfo);
            $scope.compactorTotalItems = $scope.filterCompactorList.length;
            $scope.compactorGetData = function() {
                return $filter('filter')($scope.filterCompactorList, $scope.searchCompactorFilter);
            };
            
            //filter pagination count
            $scope.$watch('searchCompactorFilter', function(newVal, oldVal) {
                var vm = this;
                if (oldVal !== newVal) {
                    $scope.compactorCurrentPage = 1;
                    $scope.compactorTotalItems = $scope.compactorGetData().length;
                }
                return vm;
            }, true);
        })
        $scope.getCountSatisfaction;
    };

    $scope.getCommercialFeedback = function () {
        $http.post('/customerFeedbackCommercial', $scope.filters).then(function (response) {
            
            $scope.reviewsCommercial = response.data;
            $scope.totalItemsCommercial = response.data.comments.length;
            $scope.totalUnsatisfiedCom = $scope.reviewsCommercial.compRateUS + $scope.reviewsCommercial.teamEffUS + $scope.reviewsCommercial.collPromptUS + $scope.reviewsCommercial.cleanlinessUS + $scope.reviewsCommercial.physicalCondUS + $scope.reviewsCommercial.qryRespUS;
            $scope.totalSatisfiedCom = $scope.reviewsCommercial.compRateAvg + $scope.reviewsCommercial.teamEffAvg + $scope.reviewsCommercial.collPromptAvg + $scope.reviewsCommercial.cleanlinessAvg + $scope.reviewsCommercial.physicalCondAvg + $scope.reviewsCommercial.qryRespAvg;
            $scope.totalVSatisfiedCom = $scope.reviewsCommercial.compRateS + $scope.reviewsCommercial.teamEffS + $scope.reviewsCommercial.collPromptS + $scope.reviewsCommercial.cleanlinessS + $scope.reviewsCommercial.physicalCondS + $scope.reviewsCommercial.qryRespS;

            var data = {
                ...response.data
            };
            delete data.comments;
            $scope.commercialData = [];
            $scope.commercialData.push(data);

            //excel filename
            if ($scope.filters.month == undefined && $scope.filters.location == undefined) {
                $scope.filename = $scope.filters.year.value + "_custsatisfaction_commercial.xls";
            } else if ($scope.filters.month != undefined && $scope.filters.location == undefined){
                $scope.filename = $scope.filters.year.value.toString() + "_" + $scope.filters.month.toString() + "_custsatisfaction_commercial.xls";
            } else if ($scope.filters.month != undefined && $scope.filters.location != undefined){
                $scope.filename = $scope.filters.year.value.toString() + "_" + $scope.filters.month.toString() + "_" + $scope.filters.location + "_custsatisfaction_commercial.xls";
            } else if ($scope.filters.month == undefined && $scope.filters.location != undefined){
                $scope.filename = $scope.filters.year.value.toString() + "_" + $scope.filters.location + "_custsatisfaction_commercial.xls";
            }

            $scope.downloadxlsCommercial = function (tableid) {
                // var blob = new Blob([document.getElementById('feedback-summary-commercial').innerHTML], {
                //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
                // });
                // saveAs(blob, $scope.filename);
                var downloadLink;
                var dataType = 'application/vnd.ms-excel';
                var tableSelect = document.getElementById(tableid);
                var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

                // Specify file name
                var filename = $scope.filename;

                // Create download link element
                downloadLink = document.createElement("a");

                document.body.appendChild(downloadLink);

                if (navigator.msSaveOrOpenBlob) {
                    var blob = new Blob(['\ufeff', tableHTML], {
                        type: dataType
                    });
                    navigator.msSaveOrOpenBlob(blob, filename);
                } else {
                    // Create a link to the file
                    downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

                    // Setting the file name
                    downloadLink.download = filename;

                    //triggering the function
                    downloadLink.click();
                }
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

            $http.get('/readSatisfactionCommercial').then(function (response) {
                console.log(response.data);
            }, function (err) {
                console.log(err);
            });
        }, function (err) {
            console.log(err);
        });

        var commercialYearMonth = transformYearMothLocFunc($scope.filters);
        $http.post('/getCSSInfoRoro', commercialYearMonth).then(function(response){
            $scope.roroInfo = response.data;

            for(var r=0; r<$scope.roroInfo.length; r++){
                $scope.roroInfo[r].date = $filter('date')($scope.roroInfo[r].date, 'yyyy-MM-dd HH:mm:ss');
            }

            $scope.searchRoro = function(roro){
                return (roro.date + roro.location + roro.name + roro.contact + roro.comment).toUpperCase().indexOf($scope.searchRoroFilter.toUpperCase()) >= 0;
            }

            $scope.filterRoroList = angular.copy($scope.roroInfo);
            $scope.roroTotalItems = $scope.filterRoroList.length;
            $scope.roroGetData = function() {
                return $filter('filter')($scope.filterRoroList, $scope.searchRoroFilter);
            };

            //filter pagination count
            $scope.$watch('searchRoroFilter', function(newVal, oldVal) {
                var vm = this;
                if (oldVal !== newVal) {
                    $scope.roroCurrentPage = 1;
                    $scope.roroTotalItems = $scope.roroGetData().length;
                }
                return vm;
            }, true);
        })

        $scope.getCountSatisfaction;
    };


    $scope.getScheduledFeedback = function () {
        $http.post('/customerFeedbackScheduled', $scope.filters).then(function (response) {
            
            $scope.reviewsScheduled = response.data;
            $scope.totalItemsScheduled = response.data.comments.length;
            $scope.totalUnsatisfiedS = $scope.reviewsScheduled.compRateUS + $scope.reviewsScheduled.teamEffUS + $scope.reviewsScheduled.regAdhUS + $scope.reviewsScheduled.healthAdhUS + $scope.reviewsScheduled.qryRespUS;
            $scope.totalSatisfiedS = $scope.reviewsScheduled.compRateAvg + $scope.reviewsScheduled.teamEffAvg + $scope.reviewsScheduled.regAdhAvg + $scope.reviewsScheduled.healthAdhAvg + $scope.reviewsScheduled.qryRespAvg;
            $scope.totalVSatisfiedS = $scope.reviewsScheduled.compRateS + $scope.reviewsScheduled.teamEffS + $scope.reviewsScheduled.regAdhS + $scope.reviewsScheduled.healthAdhS + $scope.reviewsScheduled.qryRespS;

            var data = {
                ...response.data
            };
            delete data.comments;
            $scope.scheduledData = [];
            $scope.scheduledData.push(data);

            //excel filename
            if ($scope.filters.month == undefined && $scope.filters.location == undefined) {
                $scope.filename = $scope.filters.year.value + "_custsatisfaction_scheduled.xls";
            } else if ($scope.filters.month != undefined && $scope.filters.location == undefined){
                $scope.filename = $scope.filters.year.value.toString() + "_" + $scope.filters.month.toString() + "_custsatisfaction_scheduled.xls";
            } else if ($scope.filters.month != undefined && $scope.filters.location != undefined){
                $scope.filename = $scope.filters.year.value.toString() + "_" + $scope.filters.month.toString() + "_" + $scope.filters.location + "_custsatisfaction_scheduled.xls";
            } else if ($scope.filters.month == undefined && $scope.filters.location != undefined){
                $scope.filename = $scope.filters.year.value.toString() + "_" + $scope.filters.location + "_custsatisfaction_scheduled.xls";
            }

            $scope.downloadxlsScheduled = function (tableid) {
                // var blob = new Blob([document.getElementById('feedback-summary-scheduled').innerHTML], {
                //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
                // });
                // saveAs(blob, $scope.filename);
                var downloadLink;
                var dataType = 'application/vnd.ms-excel';
                var tableSelect = document.getElementById(tableid);
                var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

                // Specify file name
                var filename = $scope.filename;

                // Create download link element
                downloadLink = document.createElement("a");

                document.body.appendChild(downloadLink);

                if (navigator.msSaveOrOpenBlob) {
                    var blob = new Blob(['\ufeff', tableHTML], {
                        type: dataType
                    });
                    navigator.msSaveOrOpenBlob(blob, filename);
                } else {
                    // Create a link to the file
                    downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

                    // Setting the file name
                    downloadLink.download = filename;

                    //triggering the function
                    downloadLink.click();
                }
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

            $http.get('/readSatisfactionScheduled').then(function (response) {
                console.log(response.data);
            }, function (err) {
                console.log(err);
            });
        }, function (err) {
            console.log(err);
        });

        var scheduledYearMonth = transformYearMothLocFunc($scope.filters);
        $http.post('/getCSSInfoScheduled', scheduledYearMonth).then(function(response){
            $scope.scheduledInfo = response.data;
            for(var s=0; s<$scope.scheduledInfo.length; s++){
                $scope.scheduledInfo[s].date = $filter('date')($scope.scheduledInfo[s].date, 'yyyy-MM-dd HH:mm:ss');
            }
    
            $scope.searchScheduled = function(scheduled){
                return (scheduled.date + scheduled.location + scheduled.name + scheduled.contact + scheduled.comment).toUpperCase().indexOf($scope.searchScheduledFilter.toUpperCase()) >= 0;
            }
    
            $scope.filterScheduledList = angular.copy($scope.scheduledInfo);
            $scope.scheduledTotalItems = $scope.filterScheduledList.length;
            $scope.scheduledGetData = function() {
                return $filter('filter')($scope.filterScheduledList, $scope.searchScheduledFilter);
            };
    
            //filter pagination count
            $scope.$watch('searchScheduledFilter', function(newVal, oldVal) {
                var vm = this;
                if (oldVal !== newVal) {
                    $scope.scheduledCurrentPage = 1;
                    $scope.scheduledTotalItems = $scope.scheduledGetData().length;
                }
                return vm;
            }, true);        
        })
    
        $scope.getCountSatisfaction;
    };

    $scope.getCountSatisfaction = function(){
        $http.post('/countSatisfaction', $scope.filters).then(function (response) {
            $scope.unreadMunicipal = response.data.municipal;
            $scope.unreadCommercial = response.data.commercial;
            $scope.unreadScheduled = response.data.scheduled;
        });
    }

    //Filter cust satisfaction
    $scope.filterFunction = function () {
        var currentYear = (new Date()).getFullYear();
        $scope.yearOptions = [];
        $scope.filters = {};

        for (var i = currentYear; i >= 2018; i--) {
            $scope.yearKV = {
                "name": i,
                "value": i
            };
            $scope.yearOptions.push($scope.yearKV);
        }
        var year = document.getElementById("year");
        var selectedYear = year.options[year.selectedIndex].value;
        //console.log(selectedYear);
        var month = document.getElementById("month");
        var selectedMonth = month.options[month.selectedIndex].value;

        var location = document.getElementById("locationFilter");
        var selectedLocation = location.options[location.selectedIndex].value;

        $scope.filters.year = selectedYear.value;
        $scope.filters.month = selectedMonth.value;
        $scope.filters.location = selectedLocation.value;
    }

    $scope.resetFormM = function () {
        $scope.m.date = today;
        $scope.m.name = '';
        $scope.m.location = 'Kuching';
        $scope.m.surveyType = 'Household';
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

    $scope.resetFormC = function () {
        $scope.c.date = today;
        $scope.c.name = '';
        $scope.c.location = 'Kuching';
        $scope.c.surveyType = 'Household';
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

    $scope.resetFormS = function () {
        $scope.s.date = today;
        $scope.s.name = '';
        $scope.s.location = 'Kuching';
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

    var transformYearMothLocFunc = function(myObj){
        var myYear = myObj.year.name.toString();
        var myMonth = myObj.month;
        var myLoc = myObj.location;
        console.log(myObj);

        if(myLoc == undefined){
            myLoc = '';
        }

        if(myMonth == undefined){
            myMonth = '';
        }else if(myMonth == 1){
            myMonth = "01";
        }else if(myMonth == 2){
            myMonth = "02";
        }else if(myMonth == 3){
            myMonth = "03";
        }else if(myMonth == 4){
            myMonth = "04";
        }else if(myMonth == 5){
            myMonth = "05";
        }else if(myMonth == 6){
            myMonth = "06";
        }else if(myMonth == 7){
            myMonth = "07";
        }else if(myMonth == 8){
            myMonth = "08";
        }else if(myMonth == 9){
            myMonth = "09";
        }else if(myMonth == 10){
            myMonth = "10";
        }else if(myMonth == 11){
            myMonth = "11";
        }else if(myMonth == 12){
            myMonth = "12";
        }

        var myYearMonth = myYear + "-" + myMonth;

        return {"yearMonth": myYearMonth, "location": myLoc};
    }
});

//export bin request page controller
app.controller('exportBinReqCtrl', function($scope, $http, $filter, storeDataService){
    'use strict';
    $scope.showExportBinReq = angular.copy(storeDataService.show.binrequest.export);
    console.log($scope.showExportBinReq);
    
    $scope.filterStartDate = "";
    $scope.filterEndDate = "";
        
    $('input[name="daterange"]').daterangepicker({
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear'
        }
    });

    $('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
        
        $scope.filterStartDate = new Date(picker.startDate.format('YYYY-MM-DD'));
        $scope.filterEndDate = new Date(picker.endDate.format('YYYY-MM-DD'));
        $scope.filterStartDate =  $filter('date')($scope.filterStartDate, 'yyyy-MM-dd');
        $scope.filterEndDate =  $filter('date')($scope.filterEndDate, 'yyyy-MM-dd');
    });

    $('input[name="daterange"]').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
        $scope.filterStartDate = "";
        $scope.filterEndDate = "";
    });    
    
    $scope.generateReport = function(){
        if($scope.filterStartDate == "" || $scope.filterEndDate == ""){
            $scope.notify("error", "Please Fill in the Date Range");
       }
       else{
           var reqObj = {
               "startDate": $scope.filterStartDate,
               "endDate": $scope.filterEndDate
           };
           
           $http.post("/getFilterExportBinReqReport", reqObj).then(function(response){
               $scope.reportList = response.data;              
               
               $.each($scope.reportList, function(index, value){
                   $scope.reportList[index].formattedDate = $filter('date')(value.dateRequest, 'yyyy-MM-dd');

                   if($scope.reportList[index].rejectExtraInfo == undefined || $scope.reportList[index].rejectExtraInfo == null || $scope.reportList[index].rejectExtraInfo == "null"){
                    $scope.reportList[index].rejectExtraInfo = "";
                   }
                   if($scope.reportList[index].rejectReason == undefined || $scope.reportList[index].rejectReason == null || $scope.reportList[index].rejectReason == "null"){
                    $scope.reportList[index].rejectReason = "";
                   }
                   $scope.reportList[index].rejectReasonCompile = $scope.reportList[index].rejectReason + $scope.reportList[index].rejectExtraInfo;
               });
               console.log($scope.reportList);
           });
       }        
    };

    $scope.exportReport = function(tableID, filename = ''){
        var downloadLink;
        var dataType = 'application/vnd.ms-excel';
        var tableSelect = document.getElementById(tableID);
        var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

        // Specify file name
        filename = filename?filename+'.xls':'Bin Request Summary.xls';

        // Create download link element
        downloadLink = document.createElement("a");

        document.body.appendChild(downloadLink);

        if(navigator.msSaveOrOpenBlob){
            var blob = new Blob(['\ufeff', tableHTML], {
                type: dataType
            });
            navigator.msSaveOrOpenBlob( blob, filename);
        }else{
            // Create a link to the file
            downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

            // Setting the file name
            downloadLink.download = filename;

            //triggering the function
            downloadLink.click();
        }
    }    
          
});

app.controller('binReqDetailCtrl', function ($scope, $filter, $http, $routeParams, $window, $route) {
    'use strict';
    $scope.entry = {};
    $scope.req = {
        'id': $routeParams.reqID
    };
    $http.post('/getStaffName', {'id': $window.sessionStorage.getItem('owner')}).then(function (response) {
        $scope.user = response.data[0].staffName;
    });  
       
    $http.post('/getBinReqDetail', $scope.req).then(function (response) {
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
            'reqID': request[0].reqID,
            'rejectReason': request[0].rejectReason,
            'rejectExtraInfo': request[0].rejectExtraInfo,
            'brHistUpdate': request[0].brHistUpdate,
            'userEmail': request[0].userEmail,
            'pickUp': request[0].pickUp,
            'binSerialNo': request[0].binSerialNo
        };
        $scope.reqDate = $filter('date')($scope.reqDetail.reqDate, 'yyyy-MM-dd HH:MM:ss');
        $scope.entry.acrBin = 'no';
        if($scope.reqDetail.brHistUpdate == null){
            $scope.reqDetail.brHistUpdate = "";
        }else{
            $scope.brHistUpdateList = $scope.reqDetail.brHistUpdate.split("\n");
        }
        if($scope.reqDetail.pickUp == null){
            $scope.reqDetail.pickUp = "";
        }    

        var imgArray = [];
        if($scope.reqDetail.icImg != null){
            imgArray.push({"url": $scope.reqDetail.icImg, "name": "IC"});
        }
        if($scope.reqDetail.binImg != null){
            imgArray.push({"url": $scope.reqDetail.binImg, "name": "Bin"});
        }
        if($scope.reqDetail.utilityImg != null){
            imgArray.push({"url": $scope.reqDetail.utilityImg, "name": "Utility Bill"});
        }
        if($scope.reqDetail.assessmentImg != null){
            imgArray.push({"url": $scope.reqDetail.assessmentImg, "name": "Assessment Bill"});
        }
        if($scope.reqDetail.tradingImg != null){
            imgArray.push({"url": $scope.reqDetail.tradingImg, "name": "Trading License"});
        }
        if($scope.reqDetail.policeImg != null){
            imgArray.push({"url": $scope.reqDetail.policeImg, "name": "Police Report"});
        }     
        $http.post('/getBinReqImgForPDF', imgArray).then(function (response){
            $scope.imgArray = response.data;
        });          
        
    });
    

    $scope.saveBinRequestStatus = function (status, id, rejectReason, rejectExtraInfo) {

        var updateStatusDate = $filter("date")(Date.now(), 'yyyy-MM-dd HH:mm:ss');

        $scope.thisBinRequest = {
            "status": status,
            "id": id,
            "brHistUpdate" : $scope.reqDetail.brHistUpdate + "Update " + status + " by " + $scope.user + " - " + updateStatusDate +"\n"
        };

        if (status == 'Approved') {
            angular.element('#confirmStatus').modal('toggle');
        } else if (status == 'Rejected'){
            $scope.thisBinRequest.from = $filter('date')($scope.thisBinRequest.from, 'yyyy-MM-dd');
            $scope.thisBinRequest.to = $filter('date')($scope.thisBinRequest.to, 'yyyy-MM-dd');
            $scope.thisBinRequest.rejectReason = rejectReason;
            $scope.thisBinRequest.rejectExtraInfo = rejectExtraInfo;
            $http.post('/updateBinRequest', $scope.thisBinRequest).then(function (response) {
                var data = response.data;
                angular.element('body').overhang({
                    type: 'success',
                    message: 'Status Updated!'
                });
                $route.reload();
            }, function (error) {
                console.log(error);
            });
        } else {
            $scope.thisBinRequest.from = $filter('date')($scope.thisBinRequest.from, 'yyyy-MM-dd');
            $scope.thisBinRequest.to = $filter('date')($scope.thisBinRequest.to, 'yyyy-MM-dd');
            $scope.thisBinRequest.rejectReason = '';
            $scope.thisBinRequest.rejectExtraInfo = '';
            $http.post('/updateBinRequest', $scope.thisBinRequest).then(function (response) {
                var data = response.data;
                angular.element('body').overhang({
                    type: 'success',
                    message: 'Status Updated!'
                });
                $route.reload();
            }, function (error) {
                console.log(error);
            });
        }


    };  

    $scope.confirmStatus = function () {
        $scope.entry.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.entry.status = "Approved";
        $scope.entry.id = $routeParams.reqID;
        $scope.entry.formattedFrom = $filter('date')($scope.entry.from, 'yyyy-MM-dd');
        $scope.entry.formattedTo = $filter('date')($scope.entry.to, 'yyyy-MM-dd');
        var updateStatusDate = $filter("date")(Date.now(), 'yyyy-MM-dd HH:MM:ss');

        $scope.entry.brHistUpdate = $scope.reqDetail.brHistUpdate + "Update Approved by " + $scope.user + " - " + updateStatusDate + "\n";
        $http.post('/updateBinRequest', $scope.entry).then(function (response) {
            var data = response.data;
            angular.element('body').overhang({
                type: 'success',
                message: 'Status Updated!'
            });
            angular.element('#confirmStatus').modal('toggle');
            location.reload();
        }, function (error) {
            console.log(error);
        });
    }

    $scope.printBinReqImgPDF = function(){

        var doc = new jsPDF();
        var canvas, context, imgData;
        doc.text("Bin Request Detail: " + $routeParams.reqID, 10, 10);

        console.log($scope.imgArray);
        loadImages($scope.imgArray,function(images){
                //create a canvas
                for( var image in images){
                    canvas = document.createElement('canvas');
                    canvas.width = 1100;
                    canvas.height =1700;   
                    //add the images
                    context = canvas.getContext('2d');
                    context.fillStyle = "white";
                    context.fillRect(0, 0, canvas.width, canvas.height);                
                    context.drawImage(images[image], 50, 50, 800, 1400);
                    imgData = canvas.toDataURL('image/jpeg');
                    doc.addImage(imgData, 'JPEG', 20, 20,200, 250);
                    doc.addPage();
                }
                var string = doc.output('datauristring');
                doc.save('testing.pdf');
                var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
                var x = window.open();
                x.document.open();
                x.document.write(iframe);
                x.document.close();                                                  
        }); 
        

        function loadImages(sources, callback) {
            var images = {};
            var loadedImages = 0;
            var numImages = 0;
            // get num of sources
            for(var src in sources) {
                numImages++;
            }
            for(var src in sources) {
                images[src] = new Image();
                images[src].crossOrigin = "anonymous";
                images[src].onload = function() {
                    if(++loadedImages >= numImages) {
                        callback(images);
                    }
                };
                images[src].src = sources[src].url;
            }
        }
    }

});

app.controller('navigationController', function ($scope, $http, $window, storeDataService) {
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

    $http.post('/getAllAuth', $scope.navigation).then(function (response) {
        $.each(response.data, function (index, value) {
            $.each($scope.show, function (bigKey, bigValue) {
                $.each(bigValue, function (smallKey, smallValue) {
                    if (smallKey == "collection") {
                        $.each(smallValue, function (xsmallKey, xsmallValue) {
                            if(value.name == 'add collection' && xsmallKey == 'add'){
                                $scope.show[bigKey][smallKey][xsmallKey] = value.status;
                            }
                            if(value.name == 'edit collection' && xsmallKey == 'edit'){
                                $scope.show[bigKey][smallKey][xsmallKey] = value.status;
                            }
                            
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
    }).then(function (response) {

        //        console.log(response.data);
        $('ul.menu__level').html(response.data.content);
    });

    // $http.get('/unreadCustFeedbackCount').then(function (response) {
    //     if (response.data != 0) {
    //         $('.satisfaction').addClass("badge badge-danger").html(response.data);
    //     }
    // });

    $http.get('/unreadEnquiryCount').then(function (response) {
        if (response.data != 0) {
            $('.enquiry').addClass("badge badge-danger").html(response.data);
        }
    });

    $http.get('/binRequestUnsolvedCount').then(function (response) {
        $http.get('/roroRequestUnsolvedCount').then(function (response1) {
            $scope.unsolvedCount = response.data[0].unsolvedBin + response1.data[0].unsolvedRoro;
            $('.binrequest').addClass("badge badge-danger").html($scope.unsolvedCount);
        });
    });

    $http.get('/unreadComplaintCount').then(function (response) {
        if (response.data != 0) {
            $('.complaint').addClass("badge badge-danger").html(response.data);
        }
    });
});

app.controller('managerController', function ($scope, $http, $filter) {
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
    var stringToTime = function (string) {
        var strArray = string.split(":");
        var d = new Date();
        d.setHours(strArray[0], strArray[1], strArray[2]);

        return d;
    }
    //function to reshape data for fit into charts
    var getElementList = function (element, data) {
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
    }).then(function (response) {
        $scope.todayAreaCount = response.data[0].todayAreaCount;
    });

    $http.post('/getTodayAreaCount', {
        "day": $scope.ytd
    }).then(function (response) {
        $scope.ytdAreaCount = response.data[0].todayAreaCount;
    });

    $http.get('/getCount').then(function (response) {
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
    }).then(function (response) {
        if (response.data.length > 0) {
            $scope.unsubmitted = response.data;
        } else {
            $scope.unsubmitted = [];
        }
    });
    $http.post('/getSubmitted', {
        "day": $scope.day
    }).then(function (response) {
        if (response.data.length > 0) {
            $scope.submitted = response.data;
        } else {
            $scope.submitted = [];
        }
    });

    $http.post('/getDataVisualization', $scope.visualdate).then(function (response) {
        //        console.log(response.data)
        if (response.data.length > 0) {
            $scope.visualObject = response.data;
        } else {
            $scope.visualObject = [];
        }
    });
    $http.post('/getDataVisualizationGroupByDate', $scope.visualdate).then(function (response) {
        //        console.log(response.data);
        if (response.data.length > 0) {
            $scope.reportListGroupByDate = response.data;

        } else {
            $scope.reportListGroupByDate = [];
        }
        displayChart();
    });
    var displayChart = function () {
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

//
//    var $googleMap, visualizeMap, map;
//    //    var src = '../KUCHING_COLLECTION_ZONE DIGITAL_MAP.kml',
//    //        kmlLayer;
//    //    var src = '../split.kml', kmlLayer;
//
//    $googleMap = document.getElementById('googleMap');
//    visualizeMap = {
//        center: new google.maps.LatLng(1.5503052, 110.3394602),
//        mapTypeId: google.maps.MapTypeId.ROADMAP,
//        mapTypeControl: false,
//        panControl: false,
//        zoomControl: false,
//        streetViewControl: false,
//        disableDefaultUI: true,
//        editable: false,
//        zoom: 13
//    };

//    map = new google.maps.Map($googleMap, visualizeMap);

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

//    $http.get('/livemap').then(function (response) {
//        var data = response.data,
//            coordinate = {
//                "lat": '',
//                "lng": ''
//            },
//            dot = {
//                "url": ''
//            },
//            marker;
//
//        $.each(data, function (key, value) {
//            coordinate.lat = value.latitude;
//            coordinate.lng = value.longitude;
//            dot.url = value.status === "NOT COLLECTED" ? '../styles/mapmarkers/rd.png' : '../styles/mapmarkers/gd.png';
//
//            marker = new google.maps.Marker({
//                id: value.serialNo,
//                position: coordinate,
//                icon: dot
//            });
//            marker.setMap(map);
//            $scope.markerList.push(marker);
//        });
//
//        diff_hour = (daily_time[0] - parseInt(cur_time_in_arr[0], 10));
//        diff_min = (daily_time[1] - parseInt(cur_time_in_arr[1], 10));
//        diff_sec = (daily_time[2] - parseInt(cur_time_in_arr[2], 10));
//
//        seconds = (+diff_hour) * 60 * 60 + (+diff_min) * 60 + (+diff_sec);
//        mili_sec = (seconds * 1000);
//
//        var noti_mili_sec = (mili_sec - 30000);
//
//        setTimeout(function () {
//            lobi_notify('info', 'Reset Live Map', 'Live Map Indicator is going to reset after 30 seconds.', '');
//        }, noti_mili_sec);
//
//        setTimeout(function () {
//            $.each(data, function (key, value) {
//                coordinate.lat = value.latitude;
//                coordinate.lng = value.longitude;
//                dot.url = '../styles/mapmarkers/rd.png';
//
//                marker = new google.maps.Marker({
//                    id: value.serialNo,
//                    position: coordinate,
//                    icon: dot
//                });
//                marker.setMap(map);
//                $scope.markerList.push(marker);
//            });
//        }, mili_sec);
//
//    });

    socket.on('synchronize map', function (data) {
        $.each($scope.markerList, function (key, value) {
            if (value.id == data.serialNumber) {

                value.icon.url = "../styles/mapmarkers/shining.gif";

                var marker = new google.maps.Marker({
                    position: value.position,
                    icon: value.icon
                });
                marker.setMap(map);

                setTimeout(function () {
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

app.controller('officerController', function ($scope, $filter, $http, $window) {
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

    $http.post('/getReportingAreaList', $scope.reportingOfficerId).then(function (response) {
        $.each(response.data, function (index, value) {
            var areaID = value.id.split(",");
            var areaName = value.name.split(",");
            var areaCode = value.areaCode.split(",");
            var area = [];
            $.each(areaID, function (index, value) {
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

    $http.post('/getPassReportingAreaList', $scope.getPassReport).then(function (response) {
        $.each(response.data, function (index, value) {
            var passAreaID = value.id.split(",");
            var passAreaName = value.name.split(",");
            var passAreaCode = value.areaCode.split(",");
            var passArea = [];
            $.each(passAreaID, function (index, value) {
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

    $http.post('/getReportOfficerTodayUnsubmitted', $scope.reportingOfficerId).then(function (response) {
        $scope.getROUnsubmitted = response.data;
    });
    $http.post('/getReportOfficerTodaySubmitted', $scope.reportingOfficerId).then(function (response) {
        $scope.getROSubmitted = response.data;
    });


    $scope.thisArea = function (areaID, areaName) {
        window.location.href = '#/daily-report/' + areaID + '/' + areaName;
    };
});

app.controller('areaController', function ($scope, $http, $filter, storeDataService) {
    'use strict';
    $scope.showCreateBtn = true;
    var asc = true;
    $scope.initializeStaff = function () {
        $scope.area = {
            "zone": '',
            "staff": '',
            "iam": '',
            "transporter": '0'
        };
    }

    $scope.pagination = angular.copy(storeDataService.pagination);
    $scope.show = angular.copy(storeDataService.show.area);

    $scope.statusList = true;
    $scope.updateStatusList = function () {
        if ($scope.statusList) {
            $scope.areaList = angular.copy($scope.areaListActive);
        } else {
            $scope.areaList = angular.copy($scope.areaListInactive);
        }
        $scope.totalItems = $scope.filterAreaList.length;
    }

    $http.get('/getAllArea').then(function (response) {
        $scope.initializeStaff();
        $scope.searchAreaFilter = '';
        $scope.areaList = response.data;
        $scope.filterAreaList = [];

        $.each($scope.areaList, function (index, value) {
            value.code = value.zoneCode + value.code;
        });

        $scope.searchArea = function (area) {
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

        $scope.getData = function () {
            return $filter('filter')($scope.filterAreaList, $scope.searchAreaFilter);
        };

        $scope.$watch('searchAreaFilter', function (newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.pagination.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);
    });

    $http.get('/getZoneList').then(function (response) {
        $scope.zoneList = response.data;
        $scope.area.zone = $scope.zoneList[0];
        for (var i = 0; i < (response.data).length; i++) {
            $scope.zoneList[i].zoneidname = response.data[i].code + ' - ' + response.data[i].name;
        }
    });

    $http.get('/getStaffList').then(function (response) {
        $scope.staffList = response.data;
        $scope.area.staff = $scope.staffList[0];
        for (var i = 0; i < (response.data).length; i++) {
            $scope.staffList[i].staffidname = response.data[i].name + ' - ' + response.data[i].id;
        }
    });

    $http.get('/getDriverList').then(function (response) {
        $scope.driverList = response.data;
        $scope.area.driver = $scope.driverList[0];
        for (var i = 0; i < $scope.driverList.length; i++) {
            $scope.driverList[i].driveridname = response.data[i].name + ' - ' + response.data[i].id;
        }
    });

    $scope.addArea = function () {
        $scope.showCreateBtn = false;
        if ($scope.area.code == null || $scope.area.code == "" || $scope.area.name == null || $scope.area.name == "" || $scope.area.zone == null || $scope.area.zone == "" || $scope.area.staff == null || $scope.area.staff == "" || $scope.area.driver == null || $scope.area.driver == "" || $scope.area.branch == null || $scope.area.branch == "") {
            $scope.notify("error", "There Has Blank Column.");
            $scope.showCreateBtn = true;
        } else {
            $scope.area.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $scope.area.iam = window.sessionStorage.getItem('owner');
            $http.post('/addArea', $scope.area).then(function (response) {
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

    socket.on('append area list', function (data) {
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

    $scope.orderBy = function (property, property2) {
        $scope.areaList = $filter('orderBy')($scope.areaList, ['' + property + '', '' + property2 + ''], asc);
        asc == true ? asc = false : asc = true;
    };
    
    $scope.exportFile = function(tableID, filename = ''){
        var downloadLink;
        var dataType = 'application/vnd.ms-excel';
        var tableSelect = document.getElementById(tableID);
        var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

        // Specify file name
        filename = filename?filename+'.xls':'Area Summary.xls';

        // Create download link element
        downloadLink = document.createElement("a");

        document.body.appendChild(downloadLink);

        if(navigator.msSaveOrOpenBlob){
            var blob = new Blob(['\ufeff', tableHTML], {
                type: dataType
            });
            navigator.msSaveOrOpenBlob( blob, filename);
        }else{
            // Create a link to the file
            downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

            // Setting the file name
            downloadLink.download = filename;

            //triggering the function
            downloadLink.click();
        }
    }      
});

app.controller('thisAreaController', function ($scope, $http, $routeParams, storeDataService) {
    'use strict';

    var areaID = $routeParams.areaID;

    $scope.area = {
        "id": areaID,
        "code": '',
        "name": '',
        "zone": '',
        "staff": '',
        "driver": '',
        "transporter": '',
        "status": '',
        "branch": '',
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
    $http.get('/getZoneList').then(function (response) {
        var data = response.data;
        $scope.zoneList = data;
    });

    $http.get('/getReportingOfficerList').then(function (response) {
        var data = response.data;
        $scope.staffList = data;
    });

    $http.get('/getDriverList').then(function (response) {
        var data = response.data;
        $scope.driverList = data;

    });

    $http.post('/thisArea', $scope.area).then(function (response) {
        var data = response.data[0];
        $scope.area = data;
        if ($scope.area.frequency != null) {
            $scope.daysArray = $scope.area.frequency.split(',');
            $.each($scope.daysArray, function (index, value) {
                $scope.days[value] = 'A';
            });
        }
        //        $http.post('/thisAreaDriver', { "id": areaID }).then(function(response) {
        //            $scope.area.driver = response.data[0].driver;
        //        });
    });

    $http.post('/getCollection', $scope.area).then(function (response) {
        $scope.collectionList = response.data;
        storeDataService.collection = angular.copy($scope.collectionList);
    });

    $scope.addCollection = function () {
        if ($scope.collection.address == "") {
            //            angular.element('body').overhang({
            //                "type": "error",
            //                "message": "Address Cannot Be Blank"
            //            });
            $scope.notify("error", "Address Cannot Be Blank");
        } else {
            if ($scope.collection.add != "") {
                $scope.collection.iam = window.sessionStorage.getItem('owner');
                $http.post('/addCollection', $scope.collection).then(function (response) {
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


    $scope.updateArea = function () {
        var concatDays = "";
        $scope.area.iam = window.sessionStorage.getItem('owner');
        $.each($scope.days, function (index, value) {
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
            $http.post('/updateArea', $scope.area).then(function (response) {
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

    $scope.areaEditBoundaries = function () {
        window.location.href = '#/boundary/' + $scope.area.id;
    }

});

app.controller('overallReportController', function ($scope, $http, $filter, $window, storeDataService) {
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
    }).then(function (response) {
        $scope.todayAreaCount = response.data[0].todayAreaCount;
    });

    setTimeout(function () {
        $http.get('/getCount').then(function (response) {
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
    }).then(function (response) {
        if (response.data.length > 0) {
            $scope.unsubmittedReport = response.data;
        } else {
            $scope.unsubmittedReport = [];
        }
    });
    $http.post('/getSubmittedReportDetail', {
        "day": $scope.day
    }).then(function (response) {
        if (response.data.length > 0) {
            $scope.submittedReport = response.data;
        } else {
            $scope.submittedReport = [];
        }
    });

    $http.get('/external/email_settings.json').then(function (response) {

        var time = new Date();
        time.setHours(response.data.time.split(":")[0]);
        time.setMinutes(response.data.time.split(":")[1]);
        time.setSeconds(0);
        time.setMilliseconds(0);

        $scope.emailSettings = response.data;
        $scope.emailSettings.time = time;
    });
    $scope.saveSettings = function () {
        $scope.emailSettings.time = $filter('date')($scope.emailSettings.time, 'HH:mm:ss');
        $http.post('/saveExternalEmailSettings', $scope.emailSettings).then(function (response) {
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

    $scope.sendEmail = function () {
        html2canvas(document.querySelector('#exportPDF'), {}).then(function (canvas) {
            var img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.src = canvas.toDataURL("image/jpeg");
            var imageSource = {
                "imgSrc": img.src
            }
            $http.post('/sendEmailImageToBucket', imageSource).then(function (response) {

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

    setTimeout(function () {


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

app.controller('accountController', function ($scope, $http, $filter, $window, storeDataService) {
    'use strict';

    var asc = true;
    $scope.filterStaffList = [];
    $scope.searchStaffFilter = '';
    $scope.staffList = [];
    $scope.showCreateBtn = true;

    $scope.pagination = angular.copy(storeDataService.pagination);
    $scope.show = angular.copy(storeDataService.show.account);

    $scope.initializeStaff = function () {
        $scope.staff = {
            "name": '',
            "position": $scope.positionList[0],
            "username": '',
            "password": '',
            "transporter": '0',
            "type": '0'
        };
    };

    $http.get('/getPositionList').then(function (response) {
        $scope.positionList = response.data;
        $scope.initializeStaff();
    });

    $scope.statusList = true;

    $scope.updateStatusList = function () {
        if ($scope.statusList) {
            $scope.staffList = angular.copy($scope.staffListActive);
        } else {
            $scope.staffList = angular.copy($scope.staffListInactive);
        }

        $scope.filterStaffList = angular.copy($scope.staffList);
        $scope.totalItems = $scope.filterStaffList.length;
    }

    $http.get('/getAllUser').then(function (response) {
        $scope.staffList = response.data;
        $scope.searchStaff = function (staff) {
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

        $scope.getData = function () {
            return $filter('filter')($scope.filterStaffList, $scope.searchStaffFilter);
        };

        $scope.$watch('searchStaffFilter', function (newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.pagination.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);
    });

    $scope.addUser = function () {
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
            $http.post('/addUser', $scope.staff).then(function (response) {
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

    socket.on('append user list', function (data) {
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

    $scope.orderBy = function (property) {
        $scope.staffList = $filter('orderBy')($scope.staffList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };

    $scope.exportFile = function(tableID, filename = ''){
        var downloadLink;
        var dataType = 'application/vnd.ms-excel';
        var tableSelect = document.getElementById(tableID);
        var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

        // Specify file name
        filename = filename?filename+'.xls':'Account Summary.xls';

        // Create download link element
        downloadLink = document.createElement("a");

        document.body.appendChild(downloadLink);

        if(navigator.msSaveOrOpenBlob){
            var blob = new Blob(['\ufeff', tableHTML], {
                type: dataType
            });
            navigator.msSaveOrOpenBlob( blob, filename);
        }else{
            // Create a link to the file
            downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

            // Setting the file name
            downloadLink.download = filename;

            //triggering the function
            downloadLink.click();
        }
    }    
});

app.controller('specificAccController', function ($scope, $http, $routeParams, $filter, storeDataService) {
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
        "branch": '',
        "iam": window.sessionStorage.getItem('owner')
    };

    $scope.password = {
        "id": $routeParams.userID,
        "password": '',
        "again": '',
        "iam": window.sessionStorage.getItem('owner')
    };

    $scope.show = angular.copy(storeDataService.show.account);

    $http.get('/getPositionList').then(function (response) {
        $scope.positionList = response.data;
    });

    $http.post('/loadSpecificAccount', $scope.thisAccount).then(function (response) {
        $.each(response.data[0], function (index, value) {
            if (index == "dob") {
                $scope.thisAccount[index] = new Date(value);
                $scope.thisAccount["bindDob"] = $scope.thisAccount["bindDob"] == "null" ? "" : $filter('date')($scope.thisAccount[index], 'dd MMM yyyy');
            } else {
                $scope.thisAccount[index] = value == "null" ? "" : value;
            }
        });
    });

    $scope.updatePassword = function () {
        $http.post('/updatePassword', $scope.password).then(function (response) {
            var data = response.data;
            $scope.notify(data.status, data.message);
            if (data.status === "success") {
                $scope.password.password = '';
                $scope.password.again = '';
            }
        });
    };

    $scope.backPage = function () {
        window.location.href = "#/account-management"
    }
});

app.controller('errorController', function ($scope, $window) {
    'use strict';
    angular.element('.error-page [data-func="go-back"]').click(function () {
        $window.history.back();
    });
});

app.controller('truckController', function ($scope, $http, $filter, storeDataService) {
    'use strict';

    var asc = true;
    $scope.areaList = [];
    $scope.filterTruckList = [];

    $scope.initializeTruck = function () {
        $scope.truck = {
            "no": '',
            "driver": '',
            "area": '',
            "branch": '',
            "transporter": '',
            "type": '0',
            "iam": window.sessionStorage.getItem('owner')
        };
    };
    $scope.showCreateBtn = true;

    $scope.pagination = angular.copy(storeDataService.pagination);
    $scope.show = angular.copy(storeDataService.show.truck);

    $scope.statusList = true;
    $scope.updateStatusList = function () {
        if ($scope.statusList) {
            $scope.truckList = angular.copy($scope.truckListActive);
        } else {
            $scope.truckList = angular.copy($scope.truckListInactive);
        }

        $scope.filterTruckList = angular.copy($scope.truckList);
        $scope.totalItems = $scope.filterTruckList.length;
    }

    $http.get('/getAllTruck').then(function (response) {
        $scope.initializeTruck();
        $scope.searchTruckFilter = '';
        $scope.truckList = response.data;
        $.each($scope.truckList, function (index, value) {
            $scope.truckList[index].roadtax = $filter('date')($scope.truckList[index].roadtax, 'yyyy-MM-dd');
        });

        storeDataService.truck = angular.copy($scope.truckList);

        $scope.searchTruck = function (truck) {
            return (truck.id + truck.no + truck.transporter + truck.ton + truck.roadtax + truck.status + truck.branch).toUpperCase().indexOf($scope.searchTruckFilter.toUpperCase()) >= 0;
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

        $scope.getData = function () {
            return $filter('filter')($scope.filterTruckList, $scope.searchTruckFilter);
        };

        $scope.$watch('searchTruckFilter', function (newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.pagination.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);
    });

    $scope.addTruck = function () {
        $scope.showCreateBtn = false;
        if ($scope.truck.no == null || $scope.truck.transporter == null || $scope.truck.ton == null || $scope.truck.roadtax == null || $scope.truck.branch == null || $scope.truck.no == "" || $scope.truck.transporter == "" || $scope.truck.type == "" || $scope.truck.ton == "" || $scope.truck.roadtax == "" || $scope.truck.branch == "") {
            $scope.notify("error", "There Has Blank Column");
            $scope.showCreateBtn = true;
        } else {

            $scope.truck.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $scope.truck.roadtax = $filter('date')($scope.truck.roadtax, 'yyyy-MM-dd');
            $scope.truck.iam = window.sessionStorage.getItem('owner');
            $http.post('/addTruck', $scope.truck).then(function (response) {
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

    socket.on('append truck list', function (data) {
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

    $scope.orderBy = function (property) {
        $scope.truckList = $filter('orderBy')($scope.truckList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
    
    $scope.exportFile = function(tableID, filename = ''){
        var downloadLink;
        var dataType = 'application/vnd.ms-excel';
        var tableSelect = document.getElementById(tableID);
        var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

        // Specify file name
        filename = filename?filename+'.xls':'Truck Summary.xls';

        // Create download link element
        downloadLink = document.createElement("a");

        document.body.appendChild(downloadLink);

        if(navigator.msSaveOrOpenBlob){
            var blob = new Blob(['\ufeff', tableHTML], {
                type: dataType
            });
            navigator.msSaveOrOpenBlob( blob, filename);
        }else{
            // Create a link to the file
            downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

            // Setting the file name
            downloadLink.download = filename;

            //triggering the function
            downloadLink.click();
        }
    }     
});

app.controller('zoneController', function ($scope, $http, $filter, storeDataService) {
    'use strict';

    var asc = true;
    $scope.filterZoneList = [];
    $scope.showCreateBtn = true;

    $scope.initializeZone = function () {
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
    $scope.updateStatusList = function () {
        if ($scope.statusList) {
            $scope.zoneList = angular.copy($scope.zoneListActive);
        } else {
            $scope.zoneList = angular.copy($scope.zoneListInactive);
        }

        $scope.filterZoneList = angular.copy($scope.zoneList);
        $scope.totalItems = $scope.filterZoneList.length;
    }

    $http.get('/getAllZone').then(function (response) {
        storeDataService.zone = angular.copy(response.data);
        $scope.searchZoneFilter = '';
        $scope.zoneList = response.data;

        $scope.searchZone = function (zone) {
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

        $scope.getData = function () {
            return $filter('filter')($scope.filterZoneList, $scope.searchZoneFilter);
        };

        $scope.$watch('searchZoneFilter', function (newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.pagination.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);

    });

    $scope.addZone = function () {
        $scope.showCreateBtn = false;
        if ($scope.zone.code == null || $scope.zone.code == "" || $scope.zone.name == null || $scope.zone.code == "") {
            $scope.notify("error", "There Has Blank Column");
            $scope.showCreateBtn = true;
        } else {
            $scope.zone.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $scope.zone.iam = window.sessionStorage.getItem('owner');
            $http.post('/addZone', $scope.zone).then(function (response) {
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

    socket.on('append zone list', function (data) {
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

    $scope.orderBy = function (property) {
        $scope.zoneList = $filter('orderBy')($scope.zoneList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('roleController', function ($scope, $http, $filter) {
    'use strict';
    $scope.showCreateBtn = true;
    $scope.role = {
        "name": "",
        "creationDate": ""
    };

    $scope.initializeRole = function () {
        $scope.role = {
            "name": "",
            "creationDate": ""
        };
    };

    $http.get('/getAllRole').then(function (response) {
        $scope.roleList = response.data;
    });

    $scope.editAuth = function (role) {
        window.location.href = '#/auth/' + role;
    };

    $scope.addRole = function () {
        $scope.showCreateBtn = false;
        $scope.role.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        if ($scope.role.name == null || $scope.role.name == "") {
            $scope.notify("error", "Role Name Cannot be Blank.");
            $scope.showCreateBtn = true;
        } else {
            $http.post('/addRole', $scope.role).then(function (response) {
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

app.controller('specificAuthController', function ($scope, $http, $routeParams, storeDataService, $location) {
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
            "approve": 'I',
            "delete": 'I',
            "export": 'I'
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
        "complaintappkch": {
            "view": 'I'
        },
        "complaintwebkch": {
            "view": 'I',
            "create": 'I',
            "hist": 'I',
            "editcms": 'I',
            "delete": 'I'
        },
        "complaintlogskch": {
            "view": 'I'
        },
        "complaintappbtu": {
            "view": 'I'
        },
        "complaintwebbtu": {
            "view": 'I',
            "create": 'I',
            "hist": 'I',
            "editcms": 'I',
            "delete": 'I'
        },
        "complaintlogsbtu": {
            "view": 'I'
        },
        "bdb": {
            "view": 'I',
            "create": 'I',
            "edit": 'I',
            "delete": 'I',
            "export": 'I',
            "batch": 'I',
            "hist": 'I'
        },
        "acrdb": {
            "view": 'I',
            "create": 'I',
            "edit": 'I',
            "delete": 'I',
            "export": 'I',
            "hist": 'I'
        }
    };

    $http.post('/getAllAuth', $scope.role).then(function (response) {

        var splitName, flag = false,
            key;

        $.each(response.data, function (index, value) {
            $.each(value, function (bigKey, bigValue) {
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

    $scope.changeValue = function (value, key) {

        $scope.thisAuth = {
            "name": $scope.role.name,
            "management": key,
            "access": value
        };

        console.log($scope.thisAuth);

        $http.post('/setAuth', $scope.thisAuth).then(function (response) {
            var data = response.data;
            console.log(data);
            $scope.notify(data.status, data.message);
            storeDataService.show = angular.copy($scope.auth);
        });
    }

    $scope.updateRoleName = function () {
        $scope.showSaveBtn = false;
        if ($scope.role.name == null || $scope.role.name == "") {
            $scope.notify("error", "Role Name Cannot be Blank.");
            $scope.showSaveBtn = true;
        } else {


            $http.post('/updateRoleName', $scope.role).then(function (response) {
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

    $scope.checkAllAuth = function () {
        if ($scope.checkall == false) {
            $scope.showCheckBtn = false;
            $scope.checkall = true;
            $scope.allAuth = {
                "name": $scope.role.oriname,
                "value": $scope.checkall
            }

            $http.post('/setAllAuth', $scope.allAuth).then(function (response) {
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
                            "approve": 'A',
                            "delete": 'A',
                            "export": 'A'
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
                        "complaintappkch": {
                            "view": 'A'
                        },
                        "complaintwebkch": {
                            "view": 'A',
                            "create": 'A',
                            "hist": 'A',
                            "editcms": 'A',
                            "delete": 'A'
                        },
                        "complaintlogskch": {
                            "view": 'A'
                        },
                        "complaintappbtu": {
                            "view": 'A'
                        },
                        "complaintwebbtu": {
                            "view": 'A',
                            "create": 'A',
                            "hist": 'A',
                            "editcms": 'A',
                            "delete": 'A'
                        },
                        "complaintlogsbtu": {
                            "view": 'A'
                        },
                        "bdb": {
                            "view": 'A',
                            "create": 'A',
                            "edit": 'A',
                            "delete": 'A',
                            "export": 'A',
                            "batch": 'A',
                            "hist": 'A'
                        },
                        "acrdb": {
                            "view": 'A',
                            "create": 'A',
                            "edit": 'A',
                            "delete": 'A',
                            "export": 'A',
                            "hist": 'A'
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
            $http.post('/setAllAuth', $scope.allAuth).then(function (response) {
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
                            "approve": 'I',
                            "delete": 'I',
                            'Export': 'I'
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
                        "complaintappkch": {
                            "view": 'I'
                        },
                        "complaintwebkch": {
                            "view": 'I',
                            "create": 'I',
                            "hist": 'I',
                            "editcms": 'I',
                            "delete": 'I'
                        },
                        "complaintlogskch": {
                            "view": 'I'
                        },
                        "complaintappbtu": {
                            "view": 'I'
                        },
                        "complaintwebbtu": {
                            "view": 'I',
                            "create": 'I',
                            "hist": 'I',
                            "editcms": 'I',
                            "delete": 'I'
                        },
                        "complaintlogsbtu": {
                            "view": 'I'
                        },
                        "bdb": {
                            "view": 'I',
                            "create": 'I',
                            "edit": 'I',
                            "delete": 'I',
                            "export": 'I',
                            "batch": 'I',
                            "hist": 'I'
                        },
                        "acrdb": {
                            "view": 'I',
                            "create": 'I',
                            "edit": 'I',
                            "delete": 'I',
                            "export": 'I',
                            "hist": 'I'
                        }
                    };
                }
            });
        }

    }

});

app.controller('binController', function ($scope, $http, $filter, storeDataService) {
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

    $scope.updateStatusList = function () {
        $scope.binList = $scope.statusList == true ? angular.copy($scope.binListActive) : angular.copy($scope.binListInactive);
        $scope.totalItems = $scope.binList.length;

        //        //$scope.filterAreaList = angular.copy($scope.binList);
        //        //$scope.totalItems = $scope.filterAreaList.length;
    }

    $http.get('/getAllBinCenter', $scope.currentStatus).then(function (response) {
        $scope.searchBinFilter = '';
        $scope.binList = response.data;
        $scope.filterBinList = [];
        $scope.binListActive = [];
        $scope.binListInactive = [];

        $.each($scope.binList, function (index, value) {
            $scope.binList[index].areacode = $scope.binList[index].area + ',' + $scope.binList[index].areaCode;
        });

        storeDataService.bin = angular.copy($scope.binList);

        $scope.searchBin = function (bin) {
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

        $scope.getData = function () {
            return $filter('filter')($scope.filterBinList, $scope.searchBinFilter);
        };

        $scope.$watch('searchBinFilter', function (newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.pagination.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);
    });

    $http.get('/getAreaList').then(function (response) {
        $scope.renderSltPicker();
        $.each(response.data, function (index, value) {
            var areaID = value.id.split(",");
            var areaName = value.name.split(",");
            var code = value.code.split(",");
            var area = [];
            $.each(areaID, function (index, value) {
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
        $('.selectpicker').on('change', function () {
            $scope.renderSltPicker();
        });
    });

    $scope.addBin = function () {
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
            $http.post('/addBinCenter', $scope.bin).then(function (response) {
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

    socket.on('append bin list', function (data) {
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

    $scope.orderBy = function (property) {
        $scope.binList = $filter('orderBy')($scope.binList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('boundaryController', function ($scope, $http, $filter, $routeParams, storeDataService) {
    'use strict';

    var areaID = $routeParams;

    $http.post('/getAreaCode', $routeParams).then(function (response) {
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

        selectedShape.getPaths().forEach(function (path, index) {
            google.maps.event.addListener(path, 'insert_at', function () {
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

            google.maps.event.addListener(path, 'remove_at', function () {
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

            google.maps.event.addListener(path, 'set_at', function () {
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

    $('.jscolor').on('blur', function (e) {
        setColor(e.target.value);
    });

    $('#enablePolygon').click(function () {
        setColor($('.jscolor').val());
        drawingManager.setMap(map);
        polyOptions.id = polygonID;
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    });

    $('#resetPolygon').click(function () {
        if (selectedShape) {
            selectedShape.setMap(null);
            $.each(polygons, function (index, value) {
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

    $('#clearSelection').click(function () {
        clearSelection();
    });

    google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
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

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
        all_overlays.push(e);
        if (e.type != google.maps.drawing.OverlayType.MARKER) {
            // Switch back to non-drawing mode after drawing a shape.
            drawingManager.setDrawingMode(null);

            // Add an event listener that selects the newly-drawn shape when the user
            // mouses down on it.
            var newShape = e.overlay;
            newShape.type = e.type;
            google.maps.event.addListener(newShape, 'click', function () {
                setSelection(newShape);
            });
            setSelection(newShape);
        }
    });

    $('#btnSaveBoundary').click(function (e) {
        var existingPolygons = [];
        for (var i = 0; i < polygons.length; i++) {
            if (typeof (polygons[i].id) !== typeof (0)) {
                existingPolygons.push(polygons[i]);
            }
        }
        for (var j = 0; j < existingPolygons.length; j++) {
            polygons.splice(existingPolygons[j], 1);
        }

        $http.post('/createBoundary', {
            "polygons": polygons
        }).then(function (response) {
            $http.post('/updateBoundary', {
                "polygons": existingPolygons
            }).then(function (response) {

                if (removedPolygons.length > 0) {
                    $http.post('/removeBoundary', {
                        "polygons": removedPolygons
                    }).then(function (response) {
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
        $http.get('/loadBoundary').then(function (response) {
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
            $.each(boundaries, function (index, value) {
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


                google.maps.event.addListener(myPolygon, 'click', function () {
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
    $scope.backToArea = function () {
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

app.controller('historyDetailController', function ($scope, $http, $routeParams) {
    'use strict';

    $http.post('/historyDetail', {
        "id": $routeParams.historyID
    }).then(function (response) {
        $scope.content = response.data[0].content;
    });
});

//-----------Check Line------------------

app.controller('dcsDetailsController', function ($scope, $http, $filter, storeDataService, $routeParams) {

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

    $scope.requestAuthorization = function () {
        sendFormForAuthorization($routeParams.dcsID, "dcs");
        $scope.status = 'PENDING';
    };

    $scope.confirm = function (request) {
        if (request == 'approve') {
            $scope.approveForm();
        } else if (request == 'reject') {
            $scope.rejectForm();
        }
    };

    $scope.approveForm = function () {
        $scope.status = 'APPROVED';
        approveForm($routeParams.dcsID, "dcs");

        angular.element('#approveConfirmation').modal('toggle');
    }

    $scope.rejectForm = function () {
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


    $scope.editDcsEntry = function (acrID) {

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

    $scope.deleteDcsEntry = function (d, index) {

        $http.post('/deleteDcsEntry', d).then(function (response) {

            if (response.data.status === "success") {
                angular.element('body').overhang({
                    type: "danger",
                    "message": "DCS Entry deleted!"
                });

                $scope.dcsDetailsList.splice(index, 1);
            };
        });
    }

    $scope.filterAddress = function () {

        console.log($scope.dcsEntry);
        $http.post('/filterAddress', $scope.dcsEntry).then(function (response) {

            $scope.filteredCustomerList = response.data;
        });
    }

    $scope.saveDcsEntry = function () {

        console.log($scope.dcsEntry.customerID);
        if ($scope.dcsEntry.customerID != null) {
            $http.post('/updateDcsEntry', $scope.dcsEntry).then(function (response) {

                $scope.getDcsDetails();
            });

            angular.element('#editDcsEntry').modal('toggle');
        } else {
            window.alert("Please select customer address");
        }

    }


    $scope.period = {};
    $scope.getDcsInfo = function () {
        $http.post('/getDcsInfo', $scope.dcsID).then(function (response) {

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


            $http.post('/getDcsDetails', $scope.period).then(function (response) {
                $scope.dcsDetailsList = response.data;
                console.log($scope.dcsDetailsList);

                $scope.totalItems = $scope.dcsDetailsList.length;
            });


        });


    }

    $scope.getDcsDetails = function () {
        $scope.getDcsInfo();

        $http.get('/getCustomerList', $scope.dcsID).then(function (response) {
            $scope.customerList = response.data;
        });

        $http.post('/getAreaList').then(function (response) {
            $scope.areaList = response.data;
        });

        $http.post('/getStaffList', {
            "position": 'Driver'
        }).then(function (response) {
            $scope.driverList = response.data;
        });
        $scope.driverButton = true;
        $scope.replacementDriverButton = true;



    }

    $scope.getDcsDetails();





    $scope.assignDriver = function (d) {
        $scope.driverButton = false;

        $scope.dcs.driver = d.staffName;
    }

    $scope.assignReplacementDriver = function (d) {
        $scope.replacementDriverButton = false;

        $scope.dcs.replacementDriver = d.staffName;
        $scope.replacementPeriodFrom = true;
        $scope.replacementPeriodTo = true;
    }

    $scope.clearDriver = function () {
        $scope.driverButton = true;

        $scope.dcs.driver = '';
    }

    $scope.clearReplacementDriver = function () {
        $scope.replacementDriverButton = true;

        $scope.dcs.replacementDriver = '';

        $scope.replacementPeriodFrom = false;
        $scope.replacementPeriodTo = false;
        $scope.dcs.replacementPeriodFrom = '';
        $scope.dcs.replacementPeriodTo = '';
    }

    $scope.setReplacementPeriodFrom = function () {
        $scope.replacementPeriodFrom = false;
    }

    $scope.setReplacementPeriodTo = function () {
        $scope.replacementPeriodTo = false;
    }

    $scope.resetReplacementPeriodFrom = function () {
        $scope.replacementPeriodFrom = true;
        $scope.dcs.replacementPeriodFrom = '';
    }

    $scope.resetReplacementPeriodTo = function () {
        $scope.replacementPeriodTo = true;
        $scope.dcs.replacementPeriodTo = '';
    }


    $scope.resetForm = function () {
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



    $scope.addDcsEntry = function () {
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

        $http.post('/addDcsEntry', $scope.dcsEntry).then(function (response) {

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
    $scope.requestAuthorization = function () {
        sendFormForAuthorization($routeParams.dcsID, "dcs");
        angular.element('#checkConfirmation').modal('toggle');
        $scope.status = 'PENDING';
    };
    $scope.checkForm = function () {
        $scope.status = 'CHECKED';

        //UPDATE DBR WITH BD INPUT
        console.log($scope.dcs);
        checkForm($routeParams.dcsID, "dcs");



        angular.element('#approveCheck').modal('toggle');
    }
    $scope.rejectForm = function () {
        $scope.status = 'CORRECTION REQUIRED';
        rejectForm($routeParams.dcsID, "dcs", $scope.dcs[0].feedback);

        angular.element('#rejectForm').modal('toggle');
    }

    //VERIFIED BY
    $scope.requestVerification = function () {
        sendFormForVerification($routeParams.dcsID, "dcs");
        angular.element('#completeConfirmation').modal('toggle');
        $scope.status = 'PENDING';
    };


    $scope.verifyForm = function () {
        $scope.status = 'COMPLETE';
        verifyForm($routeParams.dcsID, "dcs");
        angular.element('#approveVerification').modal('toggle');
    }

});

app.controller('newBusinessController', function ($scope, $http, $filter) {
    'use strict';
    $scope.customerList = [];
    $scope.tamanList = [];
    $scope.areaList = [];
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 20; //Record number each page
    $scope.maxSize = 8; //Show the number in page

    //Customer Details
    $scope.initializeCustomer = function () {
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
    $scope.initializeTaman = function () {
        $scope.taman = {
            "tamanID": "",
            "areaID": "",
            "tamanName": "",
            "longitude": "",
            "latitude": "",
            "areaCollStatus": ""
        }
    }

    $http.get('/getAllCustomers').then(function (response) {
        $scope.customerList = response.data;
        console.log($scope.customerList);

    })

    $http.get('/getAllTaman').then(function (response) {
        $scope.tamanList = response.data;
        console.log($scope.tamanList);

    })

    $http.get('/getAllArea').then(function (response) {
        $scope.areaList = response.data;
        console.log($scope.areaList);

    })

    $scope.addTaman = function () {
        $scope.customer.creationDateTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');

        //$scope.customer.customerID = f.makeID('customer',$filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'));
        //console.log($scope.customer.customeriD);
        //console.log($scope.customer);

        $http.post('/addTaman', $scope.taman).then(function (response) {

            $scope.notify(response.data.status, response.data.message);
            if (response.data.status === 'success') {
                angular.element('body').overhang({
                    type: "success",
                    "message": "New Taman added successfully!"
                });

                $http.get('/getAllTaman').then(function (response) {
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

    $scope.addCustomer = function () {
        $scope.customer.creationDateTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');

        //$scope.customer.customerID = f.makeID('customer',$filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'));
        //console.log($scope.customer.customeriD);
        //console.log($scope.customer);

        $http.post('/addCustomer', $scope.customer).then(function (response) {

            $scope.notify(response.data.status, response.data.message);
            if (response.data.status === 'success') {
                angular.element('body').overhang({
                    type: "success",
                    "message": "New Customer added successfully!"
                });

                $http.get('/getAllCustomers').then(function (response) {
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

app.controller('binHistoryController', function ($scope, $http, $filter, storeDataService, $routeParams) {
    'use strict';
    $scope.binHistoryList = [];

    $scope.serialNo = $routeParams.serialNo;

    console.log("This is from the wbdHistory function in the binHistoryController: ");
    console.log($scope.serialNo);
    //window.location.href = '#/wbd-history/' + $scope.serialNo;

    $http.get('/getBinHistory', $scope.serialNo).then(function (response) {
        $scope.binHistoryList = response.data;
        console.log($scope.binHistoryList);

    })

    //wbdHistory function
    $scope.wbdHistory = function (serialNo) {
        console.log("This is from the wbdHistory function in the binHistoryController: ");
        console.log(serialNo);
        window.location.href = '#/wbd-history/' + serialNo;

        $http.get('/getBinHistory', serialNo).then(function (response) {
            $scope.binHistoryList = response.data;
            console.log($scope.binHistoryList);

        })

    }
})

app.controller('binStockController', function ($scope, $http) {
    'use strict';
    $scope.binStockList = [];

    //Retrieve all Bin entries and store them in binList
    $http.get('/getAllBins').then(function (response) {
        $scope.binStockList = response.data;
    })

    $scope.addBin = function () {

        $http.post('/addBin', $scope.bin).then(function (response) {

            $scope.notify(response.data.status, response.data.message);
            if (response.data.status === 'success') {
                angular.element('body').overhang({
                    type: "success",
                    "message": "New Bin added successfully!"
                });

                $http.get('/getAllBins').then(function (response) {
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

app.controller('databaseBinController', function ($scope, $http, $filter, storeDataService) {
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
    $scope.initializeCustomer = function () {
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
    $scope.initializeBin = function () {
        $scope.bin = {
            "serialNo": '',
            "size": '',
            "status": '',
            "longitude": '',
            "latitude": '',
        };
    }

    //Taman details
    $scope.initializeTaman = function () {
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
    $http.get('/getAllTaman').then(function (response) {
        $scope.tamanList = response.data;
        //console.log($scope.tamanList);
        //console.log("Hello from taman controller");
    })

    //Retrieve all Area entries and store them in areaList
    $http.get('/getAllArea').then(function (response) {
        $scope.areaList = response.data;
        //console.log($scope.areaList);
        //console.log("Hello from area controller");
    })

    //Retrieve all Customer entries and store them in customerList
    $http.get('/getAllCustomer').then(function (response) {
        $scope.customerList = response.data;
        //console.log($scope.customerList);
        //console.log("Hello from customer controller");
    })

    //Retrieve all Bin entries and store them in binList
    $http.get('/getAllBins').then(function (response) {
        $scope.binList = response.data;
        //console.log($scope.binList);
        //console.log("Hello from bin controller");
    })

    //Retrieve all ACR entries and store them in binList
    $http.get('/getAllAcr').then(function (response) {
        $scope.acrList = response.data;
        //console.log($scope.acrList);
        //console.log("Hello from acr controller");
    })

    $http.get('/getAllDatabaseBin').then(function (response) {

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

    $scope.addDatabaseBin = function () {
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
        $http.post('/addDatabaseBin', $scope.databaseBin).then(function (response) {
            //var returnedData = response.data;
            //var newBinID = returnedData.details.binID;

            $scope.notify(response.data.status, response.data.message);
            if (response.data.status === 'success') {
                angular.element('body').overhang({
                    type: "success",
                    "message": "New Entry added successfully!"
                });

                $http.get('/getAllDatabaseBin').then(function (response) {

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
    $scope.addCustomer = function () {
        //console.log($scope.customer.tamanID);
        //console.log("Customer Created");
        $scope.customer.creationDateTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');

        //$scope.customer.customerID = f.makeID('customer',$filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'));
        //console.log($scope.customer.customeriD);
        //console.log($scope.customer);

        $http.post('/addCustomer', $scope.customer).then(function (response) {
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
    $scope.addBin = function () {
        //console.log($scope.customer.tamanID);
        //console.log("Bin Created");
        //console.log($scope.customer);

        $http.post('/addBin', $scope.bin).then(function (response) {
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
    $scope.addTaman = function () {
        //console.log($scope.customer.tamanID);
        //console.log("Taman Created");
        //console.log($scope.taman);

        $http.post('/addTaman', $scope.taman).then(function (response) {
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

    $scope.wbdHistory = function (serialNo) {
        console.log("This is from the wbdHistory function in the wbd controller: ");
        console.log(serialNo);
        window.location.href = '#/wbd-history/' + serialNo;
    }


    $scope.orderBy = function (property) {
        $scope.databaseBinList = $filter('orderBy')($scope.databaseBinList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };

    $scope.date = $scope.date || {
        from: '1900-01-01',
        to: '3000-01-01'
    };

    $(function () {
        var start = moment().subtract(7, 'days');
        var end = moment();

        function putRange(start, end) {
            $('#databaserange span').html(start.format('MMM D, YYYY') + ' - ' + end.format('MMM D, YYYY'));
        }

        $('#databaserange').daterangepicker({
            startDate: start,
            endDate: end,
            opens: 'right'
        }, function (start, end, label) {
            putRange(start, end);
            $scope.date.from = start.format('YYYY-MM-DD');
            $scope.date.to = end.format('YYYY-MM-DD');
            //console.log($scope.date.from + ' ' + $scope.date.to);

        });
        putRange(start, end);
    });



});

app.filter("dateFilter", function () {
    return function (binDatabase, dateFrom, dateTo) {
        var filtered = [];

        var from_date = Date.parse(dateFrom);
        var to_date = Date.parse(dateTo) + 86400000;


        angular.forEach(binDatabase, function (bin) {
            if (Date.parse(bin.date) > from_date && Date.parse(bin.date) < to_date) {
                filtered.push(bin);
            }
        });
        return filtered;
    };
});

app.filter("yearMonthFilter", function () {
    return function (inventoryRecordList, yearMonth) {
        var filtered = [];

        var strYearMonth = yearMonth.split("-");

        var year = strYearMonth[0];
        var month = strYearMonth[1];

        var fromDate = new Date(year, month - 1, 1);
        var toDate = new Date(year, month, 1);

        var from_Date = Date.parse(fromDate);
        var to_Date = Date.parse(toDate);

        angular.forEach(inventoryRecordList, function (bin) {
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

app.controller('inventoryBinController', function ($scope, $http, $filter, storeDataService) {
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
    $scope.getDataHeader = function () {
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





    $scope.calculateBalance = function (date) {

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

    $scope.calculateStock = function () {
        $scope.calculateNewStock();
        $scope.calculateReusableStock();
        $scope.calculateOverallStock();
    };

    //CALCULATE STOCK
    $scope.calculateOverallStock = function () {
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

    $scope.calculateReusableStock = function () {
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

    $scope.calculateNewStock = function () {
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
    $scope.getRecordIndex = function (date) {
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

    $http.get('/getAllInventoryRecords').then(function (response) {
        $scope.inventoryRecordList = response.data;
        storeDataService.inventoryRecord = angular.copy($scope.inventoryRecord);

        // $scope.searchDatabaseBin = function (bin) {
        //     return (bin.id + bin.name + bin.location + bin.status).toUpperCase().indexOf($scope.searchBinFilter.toUpperCase()) >= 0;
        // };

        $scope.filterInventoryRecordList = angular.copy($scope.inventoryRecordList);

        $scope.totalItems = $scope.filterInventoryRecordList.length;

        $scope.getData = function () {
            return $filter('filter')($scope.filterNewMgbList, $scope.searchNewMgbFilter);
        };

        $scope.$watch('searchDatabaseBinFilter', function (newVal, oldVal) {
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
            addDays = function (days) {
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


            $http.post('/insertDate', $scope.date).then(function (response) {


            });


        }
    };


    $http.get('/getAllDates').then(function (response) {
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

    $scope.exportCSVFile = function () {
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
//-----------Check Line End------------------

app.controller('taskAuthorizationController', function ($scope, $window, $http, $filter, storeDataService) {
    'use strict';
    $http.get('/getAllTasks').then(function (response) {
        storeDataService.task = angular.copy(response.data);
        $scope.taskList = response.data;
    });

    $scope.approveTask = function (taskId, query) {
        $scope.task = {
            "id": taskId,
            "query": query,
            "approvedBy": $window.sessionStorage.getItem('owner')
        }

        $http.post('/approveTask', $scope.task).then(function (response) {
            var data = response.data;
            angular.element('body').overhang({
                type: data.status,
                "message": data.message
            });
            $scope.notify(data.status, data.message);

            //socket.emit('create new user');
        });
        $http.get('/getAllTasks').then(function (response) {
            storeDataService.task = angular.copy(response.data);
            $scope.taskList = response.data;
        });

    }

    $scope.rejectTask = function (taskId) {
        $scope.taskId = {
            "id": taskId,
            "rejectedBy": $window.sessionStorage.getItem('owner')
        }
        $http.post('/rejectTask', $scope.taskId).then(function (response) {

            console.log(response.data);
        });

        $http.get('/getAllTasks').then(function (response) {
            storeDataService.task = angular.copy(response.data);
            $scope.taskList = response.data;
        });
    }
    var asc = true;
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 8; //Record number each page
    $scope.maxSize = 10; //Show the number in page

    $scope.show = angular.copy(storeDataService.show.authorization);

    $scope.orderBy = function (property) {
        $scope.taskList = $filter('orderBy')($scope.taskList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('formAuthorizationController', function ($scope, $window, $http, $filter, storeDataService) {
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




    $scope.orderBy = function (property) {
        $scope.taskList = $filter('orderBy')($scope.taskList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };

    $scope.getForm = function (formID) {

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
        $http.post('/getAllBdaf').then(function (response) {
            // storeDataService.task = angular.copy(response.data);
            $scope.bdafList = response.data;

            console.log($scope.bdafList);

            // for (var i = 0; i < $scope.formList.length; i++) {
            //     $scope.formList[i].formType = $scope.formList[i].formID.match(/[a-zA-Z]+/g)[0].toLowerCase();
            // }
        });
        $http.post('/getAllDcs').then(function (response) {
            $scope.dcsList = response.data;

            console.log($scope.dcsList);
        });
        $http.post('/getAllBlost').then(function (response) {
            $scope.blostList = response.data;

            console.log($scope.blostList);
        });
        $http.post('/getAllDbr').then(function (response) {
            $scope.dbrList = response.data;

            console.log($scope.dbrList);
        });
        $http.post('/getAllDbd').then(function (response) {
            $scope.dbdList = response.data;

            console.log($scope.dbdList);
        });


    }


    getAllForms();


});

app.controller('bdbController', function($scope, $http, $filter, $window, storeDataService){
    'use strict';

    $scope.user = window.sessionStorage.getItem('owner');
    $scope.filterBindatabaseList = [];
    $scope.show = angular.copy(storeDataService.show.bdb);
    $scope.pagination = angular.copy(storeDataService.pagination);
    $scope.showData = false;
    $scope.searchSerialNo = '';
    $scope.searchName = '';
    $scope.searchIC = '';
    $scope.searchAddress = '';
    $scope.searchCompany = '';
    $scope.searchDateStart = '';
    $scope.searchDateEnd = '';
    $scope.searchKeyDateStart = '';
    $scope.searchKeyDateEnd = '';
    $scope.searchChangesDateStart = '';
    $scope.searchChangesDateEnd = '';
    $scope.editBinNewPic = '';

    $scope.createBin = {
        "serialNo": "",
        "brand" : "",
        "binSize": "",
        "binInUse": "",
        "date": "",
        "name": "",
        "contact": "",
        "ic": "",
        "propertyNo": "",
        "tmnkpg": "",
        "address": "",
        "company": "",
        "typeOfPro": "",
        "pic": "",
        "communal": "",
        "council": "",
        "binStatus": "",
        "comment": "",
        "writtenOff": ""
    }

    $scope.createBatches={
        "serialChar": "",
        "serialNum": "",
        "volume": "",
        "size": "",
        "binBrand": ""
    }

    $http.get('/getInitBinDatabase').then(function(response){
        $scope.showData = true;
        $scope.searchBindatabaseFilter = '';
        $scope.binList = response.data;

        for(var i = 0; i < $scope.binList.length; i++){
            $scope.binList[i].date = $filter('date')($scope.binList[i].date, 'yyyy-MM-dd');
            $scope.binList[i].keyInDate = $filter('date')($scope.binList[i].keyInDate, 'yyyy-MM-dd');
            $scope.binList[i].changesDate = $filter('date')($scope.binList[i].changesDate, 'yyyy-MM-dd');
        }

        $scope.searchBin = function (bin) {
            return (bin.serialNo + bin.brand + bin.size + bin.binInUse + bin.date + bin.name + bin.contact + bin.ic + bin.propertyNo + bin.tmnkpg + bin.address + bin.company + bin.typeOfPro + bin.pic + bin.communal + bin.council + bin.binStatus + bin.comment + bin.writtenOff + bin.keyInDate + bin.changesDate).toUpperCase().indexOf($scope.searchBindatabaseFilter.toUpperCase()) >= 0;
            
        }

        $scope.filterBindatabaseList = angular.copy($scope.binList);

        $scope.getData = function () {
            return $filter('filter')($scope.filterBindatabaseList, $scope.searchBindatabaseFilter);
        };

        $scope.$watch('searchBindatabaseFilter', function (newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.pagination.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);            
    });
    
    $scope.searchFunction = function(field){
        var value = '';
        if(field == 'serialNo'){
            value = $scope.searchSerialNo;
        }else if(field == 'binInUse'){
            value = $scope.searchUse;
        }else if(field == 'name'){
            value = $scope.searchName;
        }else if(field == 'ic'){
            value = $scope.searchIC;
        }else if(field == 'address'){
            value = $scope.searchAddress;
        }else if(field == 'company'){
            value = $scope.searchCompany;
        }else if(field == 'typeOfPro'){
            value = $scope.searchTypeOfPro;
        }else if(field == 'date'){
            if($scope.searchDateStart == '' || $scope.searchDateStart == null){
                value = null;
            }else{
                var value1 = new Date($scope.searchDateStart);
                if($scope.searchDateEnd == '' || $scope.searchDateEnd == null){
                    var value2 = new Date();
                }else{
                    var value2 = new Date($scope.searchDateEnd);
                }
                value = value1.getFullYear() + '-' + (value1.getMonth() + 1) + '-' + value1.getDate() + '::' + value2.getFullYear() + '-' + (value2.getMonth() + 1) + '-' + value2.getDate();
            }
        }else if(field == 'keyInDate'){
            if($scope.searchKeyDateStart == '' || $scope.searchKeyDateStart == null){
                value = null;
            }else{
                var value1 = new Date($scope.searchKeyDateStart);
                if($scope.searchKeyDateEnd == '' || $scope.searchKeyDateEnd == null){
                    var value2 = new Date();
                }else{
                    var value2 = new Date($scope.searchKeyDateEnd);
                }
                value = value1.getFullYear() + '-' + (value1.getMonth() + 1) + '-' + value1.getDate() + '::' + value2.getFullYear() + '-' + (value2.getMonth() + 1) + '-' + value2.getDate();
            }
        }else if(field == 'changesDate'){
            if($scope.searchChangesDateStart == '' || $scope.searchChangesDateStart == null){
                value = null;
            }else{
                var value1 = new Date($scope.searchChangesDateStart);
                if($scope.searchChangesDateEnd == '' || $scope.searchChangesDateEnd == null){
                    var value2 = new Date();
                }else{
                    var value2 = new Date($scope.searchChangesDateEnd);
                }
                value = value1.getFullYear() + '-' + (value1.getMonth() + 1) + '-' + value1.getDate() + '::' + value2.getFullYear() + '-' + (value2.getMonth() + 1) + '-' + value2.getDate();
            }
        }

        if(value == ''){
            $scope.notify('error', 'Please Don\'t leave the search column blank!');
        }else{
            $http.post('/getBinDatabaseList', {'field': field, 'value': value}).then(function(response){
                $scope.showData = true;
                $scope.searchBindatabaseFilter = '';
                $scope.binList = response.data;
                $scope.totalItems = response.data.length;
        
                for(var i = 0; i < $scope.binList.length; i++){
                    $scope.binList[i].date = $filter('date')($scope.binList[i].date, 'yyyy-MM-dd');
                    $scope.binList[i].keyInDate = $filter('date')($scope.binList[i].keyInDate, 'yyyy-MM-dd');
                    $scope.binList[i].changesDate = $filter('date')($scope.binList[i].changesDate, 'yyyy-MM-dd');
                }
        
                $scope.searchBin = function (bin) {
                    return (bin.serialNo + bin.brand + bin.size + bin.binInUse + bin.date + bin.name + bin.contact + bin.ic + bin.propertyNo + bin.tmnkpg + bin.address + bin.company + bin.typeOfPro + bin.icPic + bin.sescoPic + bin.kwbPic + bin.communal + bin.council + bin.binStatus + bin.comment + bin.writtenOff + bin.keyInDate).toUpperCase().indexOf($scope.searchBindatabaseFilter.toUpperCase()) >= 0;
                    
                }
        
                $scope.filterBindatabaseList = angular.copy($scope.binList);
                $scope.totalItems = $scope.filterBindatabaseList.length;
        
                $scope.getData = function () {
                    return $filter('filter')($scope.filterBindatabaseList, $scope.searchBindatabaseFilter);
                };
        
                $scope.$watch('searchBindatabaseFilter', function (newVal, oldVal) {
                    var vm = this;
                    if (oldVal !== newVal) {
                        $scope.pagination.currentPage = 1;
                        $scope.totalItems = $scope.getData().length;
                    }
                    return vm;
                }, true);        
            });
        }
    }

    $scope.hnp = function(){
        window.location.href = '#/bdb-hist';
    }

    $scope.addBinDatabase = function(){
        $scope.createBin.date = $filter('date')($scope.createBin.date, 'yyyy-MM-dd');

        if($scope.createBin.serialNo == ''){
            $scope.notify("error", "Please dont leave blank on serial no.")
        }else{
            $http.post('/addBinDatabase', $scope.createBin).then(function(response){
                if(response.data.status=="success"){
                    $scope.notify(response.data.status, response.data.message);
                    angular.element('#createBin').modal('toggle');
                }else{
                    $scope.notify("error", "There has some error.");
                    angular.element('#createBin').modal('toggle');
                }
            });
        }
    }

    $scope.addBinBatches = function(){
        if($scope.createBatches.serialChar == "" || $scope.createBatches.serialNum == "" || $scope.createBatches.volume == "" || $scope.createBatches.size == "" || $scope.createBatches.binBrand == ""){
            $scope.notify("error", "Please fill in the blank column");
        }else{
            $http.post('/addBatchesBinDB', $scope.createBatches).then(function(response){
                if(response.data.status == "success"){
                    $scope.notify("success", "Bins Added");
                }else{
                    $scope.notify("error", "Something Wrong!");
                }
                
            })
        }
    }

    $scope.binEditModal = function(id){
        window.location.href = "#/bdb-edit/" + id;
    }

    $scope.deleteBinDatabase = function(id){
        if(confirm("Do you want to Delete the Bin record?")){
            $http.post('/deleteBindatabase',{'id': id}).then(function(response){
                $scope.notify(response.data.status,response.data.message);
            });
        }
    }

    $scope.exportBinDatabase = function(tableID, filename = ''){
        var downloadLink;
        var dataType = 'application/vnd.ms-excel';
        var tableSelect = document.getElementById(tableID);
        var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
        
        // Specify file name
        filename = filename?filename+'.xls':'binDatabase.xls';
        
        // Create download link element
        downloadLink = document.createElement("a");
        
        document.body.appendChild(downloadLink);
        
        if(navigator.msSaveOrOpenBlob){
            var blob = new Blob(['\ufeff', tableHTML], {
                type: dataType
            });
            navigator.msSaveOrOpenBlob( blob, filename);
        }else{
            // Create a link to the file
            downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
        
            // Setting the file name
            downloadLink.download = filename;
            
            //triggering the function
            downloadLink.click();
        }
    }

});

app.controller('bdbEditController', function($scope, $http, $filter, $window, $routeParams, $route, storeDataService){
    'use strict';

    $scope.bdbID = {
        "id": $routeParams.bdbID
    }
    $scope.user = window.sessionStorage.getItem('owner');
    $http.post('/getBinDatabaseDetail', $scope.bdbID).then(function(response){
        $scope.editBin = response.data[0];

        if($scope.editBin.date != null){
            $scope.editBin.date = new Date($scope.editBin.date);
        }
        if($scope.editBin.keyInDate != null){
            $scope.editBin.keyInDate = new Date($scope.editBin.keyInDate);
        }
        console.log($scope.editBin);
    });

    $scope.editBinDatabase = function(){
        $scope.editBin.date = $filter('date')($scope.editBin.date, 'yyyy-MM-dd');
        $scope.editBin.keyInDate = $filter('date')($scope.editBin.keyInDate, 'yyyy-MM-dd');
        $scope.editBin.myTimeStamp =  $filter('date')(new Date(), 'yyyyMMddHHmmss');

        if($scope.editBinNewPic != undefined){
            $scope.editBin.newPic = $scope.editBinNewPic;
        }else{
            $scope.editBin.newPic = $scope.editBin.pic;
        }

        $.each($scope.editBin, function (key, value) {
            if(value == null){
                $scope.editBin[key] = ""
            }
        });

        if($scope.editBin.serialNo == ''){
            $scope.notify("error", "Please dont leave blank on serial no.")
        }else{
            $scope.editBin.user = $scope.user;
            $http.post('/editBinDatabase', $scope.editBin).then(function(response){
                if(response.data.status=="success"){
                    $scope.notify(response.data.status, response.data.message);
                    window.location.href = '#/bdb';
                }else{
                    $scope.notify("error", "There has some error.");
                }            
            })
        }
    }


});

app.controller('bdbHistController', function($scope, $http, $filter, $window, storeDataService){
    'use strict'
    
    $scope.show = angular.copy(storeDataService.show.bdb);
    $scope.bdbHistList = [];
    $scope.filterBdbHistList = [];
    $scope.searchBdbHistFilter = '';

    $http.get('/getBdbHistList').then(function(response){
        $scope.bdbHistList = response.data;

        $scope.searchBdb = function (bdb) {
            return (bdb.requestDAte + bdb.requestor + bdb.serialNo + bdb.action + bdb.status + bdb.approver + bdb.changesDate ).toUpperCase().indexOf($scope.searchBdbHistFilter.toUpperCase()) >= 0;    
        }

        $scope.filterBdbHistList = angular.copy($scope.bdbHistList);

        for(var i = 0; i < $scope.bdbHistList.length; i++){
            $scope.bdbHistList[i].content = $scope.bdbHistList[i].content.replace(/\t/g,' ');
            $scope.bdbHistList[i].serialNo = JSON.parse($scope.bdbHistList[i].content).serialNo;      
            $scope.bdbHistList[i].requestDate = $filter('date')($scope.bdbHistList[i].requestDate, 'yyyy-MM-dd');
            $scope.bdbHistList[i].changesDate = $filter('date')($scope.bdbHistList[i].changesDate, 'yyyy-MM-dd');
        } 
    });

    $scope.backBtn = function () {
        window.history.back();
    }

    $scope.bdbDetailPage = function(bdbID){
        window.location.href = "#/bdb-hist-detail/" + bdbID;
    }

});

app.controller('bdbHistDetailController', function($scope, $http, $filter, $window, $routeParams, $route, storeDataService){
    'use strict';
    $scope.approver = window.sessionStorage.getItem('owner');
    $scope.show = angular.copy(storeDataService.show.bdb);
    $scope.remarkCol = "";
    $scope.editView = false;

    $scope.bdbID = {
        "id": $routeParams.bdbID
    };

    $http.post('/getBdbHistDetail', $scope.bdbID).then(function(response){
        $scope.bdbDetail = response.data[0];
        $scope.bdbDetail.requestDate = $filter('date')($scope.bdbDetail.requestDate, 'yyyy-MM-dd');
        $scope.bdbDetail.changesDate = $filter('date')($scope.bdbDetail.changesDate, 'yyyy-MM-dd');

        $scope.bdbDetail.content = $scope.bdbDetail.content.replace(/\\/g,"");
        $scope.bdbDetail.content = $scope.bdbDetail.content.replace(/\t/g,' ');
        $scope.newContent = JSON.parse($scope.bdbDetail.content);

        if($scope.newContent.date != null){
            $scope.newContent.date =  $scope.newContent.date.replace(/'/g,"");
        }
        if($scope.newContent.keyInDate != null){
            $scope.newContent.keyInDate =  $scope.newContent.keyInDate.replace(/'/g,"");
        }
        if($scope.bdbDetail.status != "Pending"){
            $scope.bdbDetail.oldContent = $scope.bdbDetail.oldContent.replace(/\\/g,"");
            $scope.oldContent = JSON.parse($scope.bdbDetail.oldContent);
            $scope.remark = $scope.bdbDetail.remark;
        }
        if($scope.bdbDetail.status == "Pending"){
            $http.post('/getBdbOriDetail', {'id': $scope.newContent.id}).then(function(response){
                $scope.oldContent = response.data[0];
                $scope.oldContent.date = $filter('date')($scope.oldContent.date, 'yyyy-MM-dd');
                $scope.oldContent.keyInDate = $filter('date')($scope.oldContent.keyInDate, 'yyyy-MM-dd');
            })
        }

        $scope.editContent = JSON.parse($scope.bdbDetail.content);
        if($scope.editContent.date != null){
            $scope.editContent.date = new Date($scope.editContent.date);
        }
        if($scope.editContent.keyInDate != null){
            $scope.editContent.keyInDate = new Date($scope.editContent.keyInDate);
        }
        
    });

    $scope.bdbEditReq = function(status){
        var query = {
            "status": status,
            "query": $scope.bdbDetail.query,
            "oldContent": JSON.stringify($scope.oldContent),
            "id": $scope.bdbDetail.id,
            "binId": $scope.oldContent.id,
            "approver": $scope.approver,
            "remarkCol": $scope.remarkCol
        }

        $http.post('/bdbAprvRejEdit', query).then(function(response){
            if(response.data.status == "success"){
                $scope.notify("success", "Success");
                $route.reload(); 
            }
        });
    }

    $scope.saveEditBdbHist = function(){
        $scope.editContent.date = $filter('date')($scope.editContent.date, 'yyyy-MM-dd');
        $scope.editContent.keyInDate = $filter('date')($scope.editContent.keyInDate, 'yyyy-MM-dd');
        $scope.editContent.myTimeStamp =  $filter('date')(new Date(), 'yyyyMMddHHmmss');
        $scope.editContent.remarkCol = $scope.remarkCol;

        if($scope.editBinNewPic != undefined){
            $scope.editContent.newPic = $scope.editBinNewPic;
        }else{
            $scope.editContent.newPic = $scope.editContent.pic;
        }

        $.each($scope.editContent, function (key, value) {
            if(value == null){
                $scope.editContent[key] = ""
            }
        });

        if($scope.editContent.serialNo == ''){
            $scope.notify("error", "Please dont leave blank on serial no.")
        }else{
            $scope.editContent.approver = $scope.approver;
            $scope.editContent.logID = $scope.bdbID.id;
            $scope.editContent.oldContent = JSON.stringify($scope.oldContent);

            $http.post('/editBdbFromHist', $scope.editContent).then(function(response){
                if(response.data.status=="success"){
                    $scope.notify(response.data.status, response.data.message);
                    $route.reload();   
                }else{
                    $scope.notify("error", "There has some error.");
                }            
            })
        }        
    }

    $scope.cancelEditBdbHist = function(){
        $scope.editView = false;
    }
});

app.controller('acrdbController', function($scope, $http, $filter, storeDataService, $window){
    'use strict';

    $scope.filterAcrdbList = [];
    $scope.show = angular.copy(storeDataService.show.acrdb);
    $scope.dateOfApplication = "";
    $scope.cf = {
        "mon": "",
        "tue": "",
        "wed": "",
        "thu": "",
        "fri": "",
        "sat": "",
        "sun": ""
    }

    $scope.getAcrdbListParam = {
        "council": "",
        "status": ""
    }


    $scope.acrdb = {
        "serialNo": "",
        "brand": "",
        "binSize": "",
        "dateOfApplication": "",
        "name": "",
        "contact": "",
        "ic": "",
        "company": "",
        "billAddress": "",
        "serviceAddress":"",
        "frequency": "",
        "typeOfPremise": "",
        "acrSerialNo": "",
        "council": "",
        "councilSerialNo": "",
        "remarks": "",
        "mon": "",
        "tue": "",
        "wed": "",
        "thu": "",
        "fri": "",
        "sat": "",
        "sun": ""
    }

    $scope.getAcrdbList = function(){
        $http.post('/getAcrdbList', $scope.getAcrdbListParam).then(function(response){

            $scope.searchAcrdbListFilter = '';
            $scope.acrdbList = response.data;

            for(var i = 0; i < $scope.acrdbList.length; i++){
                $scope.acrdbList[i].dateOfApplication = $filter('date')($scope.acrdbList[i].dateOfApplication, 'yyyy-MM-dd');
                $scope.acrdbList[i].cf = '';
                $scope.acrdbList[i].frequencyNum = 0;
                if( $scope.acrdbList[i].mon == 'X'){
                    $scope.acrdbList[i].cf += 'Mon,';
                    $scope.acrdbList[i].frequencyNum++;
                }
                if( $scope.acrdbList[i].tue == 'X'){
                    $scope.acrdbList[i].cf += ' Tue,';
                    $scope.acrdbList[i].frequencyNum++;
                }
                if( $scope.acrdbList[i].wed == 'X'){
                    $scope.acrdbList[i].cf += ' Wed,';
                    $scope.acrdbList[i].frequencyNum++;
                }
                if( $scope.acrdbList[i].thu == 'X'){
                    $scope.acrdbList[i].cf += ' Thu,';
                    $scope.acrdbList[i].frequencyNum++;
                }
                if( $scope.acrdbList[i].fri == 'X'){
                    $scope.acrdbList[i].cf += ' Fri,';
                    $scope.acrdbList[i].frequencyNum++;
                }
                if( $scope.acrdbList[i].sat == 'X'){
                    $scope.acrdbList[i].cf += ' Sat,';
                    $scope.acrdbList[i].frequencyNum++;
                }
                if( $scope.acrdbList[i].sun == 'X'){
                    $scope.acrdbList[i].cf += ' Sun';
                    $scope.acrdbList[i].frequencyNum++;
                }

                if($scope.acrdbList[i].binStatus == '0'){
                    $scope.acrdbList[i].status = "Active";
                }else if($scope.acrdbList[i].binStatus == '1'){
                    $scope.acrdbList[i].status = "Postponed";
                }else if($scope.acrdbList[i].binStatus == '2'){
                    $scope.acrdbList[i].status = "Terminated";
                }else if($scope.acrdbList[i].binStatus == '3'){
                    $scope.acrdbList[i].status = "Terminated(Closed)";
                }
            }

            $scope.searchAcrdb = function (acrdb) {
                return (acrdb.serialNo + acrdb.brand + acrdb.binSize + acrdb.dateOfApplication + acrdb.name + acrdb.contact + acrdb.ic + acrdb.company + acrdb.billingAddress + acrdb.serviceAddress + acrdb.frequency + acrdb.typeOfPremise + acrdb.acrSerialNo + acrdb.council + acrdb.councilSerialNo + acrdb.remarks + acrdb.cf).toUpperCase().indexOf($scope.searchAcrdbListFilter.toUpperCase()) >= 0;
                
            }

            $scope.filterAcrdbList = angular.copy($scope.acrdbList);

            $scope.getData = function () {
                return $filter('filter')($scope.filterAcrdbList, $scope.searchAcrdbListFilter);
            };

        });
    }

    $scope.addAcrdb = function(){

        $scope.acrdb.dateOfApplication = $filter('date')($scope.dateOfApplication, 'yyyy-MM-dd');
        if($scope.cf.mon == true){
            $scope.acrdb.mon = "X";
        }else{
            $scope.acrdb.mon = "I";
        }
        if($scope.cf.tue == true){
            $scope.acrdb.tue = "X"
        }else{
            $scope.acrdb.tue = "I";
        }

        if($scope.cf.wed == true){
            $scope.acrdb.wed = "X"
        }else{
            $scope.acrdb.wed = "I";
        }

        if($scope.cf.thu == true){
            $scope.acrdb.thu = "X"
        }else{
            $scope.acrdb.thu = "I";
        }

        if($scope.cf.fri == true){
            $scope.acrdb.fri = "X"
        }else{
            $scope.acrdb.fri = "I";
        }

        if($scope.cf.sat == true){
            $scope.acrdb.sat = "X"
        }else{
            $scope.acrdb.sat = "I";
        }

        if($scope.cf.sun == true){
            $scope.acrdb.sun = "X"
        }else{
            $scope.acrdb.sun = "I";
        }

        if($scope.acrdb.dateOfApplication == ""){
            $scope.notify('error', 'don\'t leave the date of application blank.');
        }else{
            $http.post('/addAcrDB', $scope.acrdb).then(function(response){
                
                if(response.data.status == 'success'){
                    $scope.notify('success', 'Insert Success');
                    angular.element('#createAcrdb').modal('toggle');
                }
            });
        }
    }

    $scope.editAcrdbPage = function(acrId){
        window.location.href = '#/acr-database-edit/' + acrId;
    }

    $scope.exportAcrDatabase = function(tableID, filename = ''){
        var downloadLink;
        var dataType = 'application/vnd.ms-excel';
        var tableSelect = document.getElementById(tableID);
        var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
        
        // Specify file name
        filename = filename?filename+'.xls':'acrDatabase.xls';
        
        // Create download link element
        downloadLink = document.createElement("a");
        
        document.body.appendChild(downloadLink);
        
        if(navigator.msSaveOrOpenBlob){
            var blob = new Blob(['\ufeff', tableHTML], {
                type: dataType
            });
            navigator.msSaveOrOpenBlob( blob, filename);
        }else{
            // Create a link to the file
            downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
        
            // Setting the file name
            downloadLink.download = filename;
            
            //triggering the function
            downloadLink.click();
        }
    }     

    $scope.getAcrdbList();
});

app.controller('acrdbEditController', function($scope, $http, $filter, storeDataService, $routeParams, $route){
    'use strict';

    $scope.show = angular.copy(storeDataService.show.acrdb);
    var acrID = {
        'id': $routeParams.acrID
    }
    $scope.areaList = [];
    
    $http.get('/getAreaList').then(function (response) {
        for(var i=0; i< response.data.length; i++){
            $scope.areaList.push(response.data[i]);
        }
    });  

    $http.post('/getAcrDbDetail', acrID).then(function(response){
        $scope.renderSltPicker();
        $scope.acrdbDetail = response.data[0];
        $scope.acrdbDetail.dateOfApplication = new Date($scope.acrdbDetail.dateOfApplication);
        $scope.acrdbDetail.checkMon = "";
        $scope.acrdbDetail.checkTue = "";
        $scope.acrdbDetail.checkWed = "";
        $scope.acrdbDetail.checkThu = "";
        $scope.acrdbDetail.checkFri = "";
        $scope.acrdbDetail.checkSat = "";
        $scope.acrdbDetail.checkSun = "";
        
        if($scope.acrdbDetail.mon == 'X'){
            $scope.acrdbDetail.checkMon = true;
        }else{
            $scope.acrdbDetail.checkMon = false;
        }
        if($scope.acrdbDetail.tue == 'X'){
            $scope.acrdbDetail.checkTue = true;
        }else{
            $scope.acrdbDetail.checkTue = false;
        }
        if($scope.acrdbDetail.wed == 'X'){
            $scope.acrdbDetail.checkWed = true;
        }else{
            $scope.acrdbDetail.checkWed = false;
        }
        if($scope.acrdbDetail.thu == 'X'){
            $scope.acrdbDetail.checkThu = true;
        }else{
            $scope.acrdbDetail.checkThu = false;
        }
        if($scope.acrdbDetail.fri == 'X'){
            $scope.acrdbDetail.checkFri = true;
        }else{
            $scope.acrdbDetail.checkFri = false;
        }
        if($scope.acrdbDetail.sat == 'X'){
            $scope.acrdbDetail.checkSat = true;
        }else{
            $scope.acrdbDetail.checkSat = false;
        }
        if($scope.acrdbDetail.sun == 'X'){
            $scope.acrdbDetail.checkSun = true;
        }else{
            $scope.acrdbDetail.checkSun = false;
        }

        var acrAreaSplit = $scope.acrdbDetail.area.split(';');
        var areaList = [];
        for(var i = 0; i < acrAreaSplit.length; i++){
            areaList[i] = acrAreaSplit[i];
        }
        $scope.acrdbDetail.area1 = areaList[0];
        $scope.acrdbDetail.area2 = areaList[1];
        $scope.acrdbDetail.area3 = areaList[2];
    });  

    $scope.acrdbEditBack = function(){
        window.history.back();
    }

    $scope.saveAcrdbEdit = function(){
        $scope.acrdbDetail.saveDateOfApplication = $filter('date')($scope.acrdbDetail.dateOfApplication, 'yyyy-MM-dd');
        $scope.acrdbDetail.area = "";
        if($scope.acrdbDetail.area1 != undefined){
            $scope.acrdbDetail.area += $scope.acrdbDetail.area1 + ";";
        }
        if($scope.acrdbDetail.area2 != undefined){
            $scope.acrdbDetail.area += $scope.acrdbDetail.area2 + ";";
        }
        if($scope.acrdbDetail.area3 != undefined){
            $scope.acrdbDetail.area += $scope.acrdbDetail.area3 + ";";
        }

        $http.post('/saveAcrdbEdit', $scope.acrdbDetail).then(function(response){
            if(response.data.status == 'success'){
                $route.reload();
                $scope.notify('success', 'Updated Successfully');
            }
        });
    }

    $http.post("/addRoroRequest",{"reqDate": "2021-06-06", "address": "Taman ABC", "remarks": "My Remarks", "type": "1", "userID": "20", "status": "1", "amount":"1", "size":"16"}).then(function(response){
        console.log(response.data);
    });
});

app.controller('acrdbCustListController', function($scope, $http, storeDataService, $route){
    'use strict'
    
    $scope.council = null;
    $scope.showUploadBtn = false;

    $scope.acrParam = {
        "council": '',
        "status": ''
    }

    $scope.addCustDetail = {
        "name": "",
        "company": "",
        "ic": "",
        "contact": "",
        "council": ""
    }

    $scope.show = angular.copy(storeDataService.show.acrdb);

    $scope.getAcrdbCustList = function(){
        $http.post('/getAcrdbCustList', $scope.acrParam).then(function(response){
            
            $scope.acrdbCustList = response.data;
            $scope.searchAcrdbCustListFilter = '';
            $scope.filterAcrdbCustList = [];

            if($scope.acrParam.status == '0'){
                
               for(var i=0; i<$scope.acrdbCustList.length; i++){
                    if($scope.acrdbCustList[i].activeCount == null){
                        $scope.acrdbCustList.splice(i,1);
                        i--;
                    }
                };
            }else if($scope.acrParam.status == '1'){
                for(var i=0; i<$scope.acrdbCustList.length; i++){
                    if($scope.acrdbCustList[i].postponedCount == null){
                        $scope.acrdbCustList.splice(i,1);
                        i--;
                    }
                };
            }else if($scope.acrParam.status == '2'){
                for(var i=0; i<$scope.acrdbCustList.length; i++){
                    if($scope.acrdbCustList[i].terminatedCount == null){
                        $scope.acrdbCustList.splice(i,1);
                        i--;
                    }
                };
            }
              
            $scope.searchAcrdbCustList = function (acrdbCustList) {
                return (acrdbCustList.company).toUpperCase().indexOf($scope.searchAcrdbCustListFilter.toUpperCase()) >= 0;
            }

            $scope.filterAcrdbCustList = angular.copy($scope.acrdbCustList);

            $scope.getData = function () {
                return $filter('filter')($scope.filterAcrdbCustList, $scope.searchAcrdbCustListFilter);
            };
            

        });
    }

    $scope.addAcrdbCust = function(){
        if($scope.addCustDetail.name == "" || $scope.addCustDetail.company == "" || $scope.addCustDetail.contact == "" || $scope.addCustDetail.council == "" || $scope.addCustDetail.ic == ""){
            $scope.notify("error","Please Fill In All Column");
        }else{
            $http.post("/addAcrdbCust", $scope.addCustDetail).then(function(response){
                if(response.data.status == 'success'){
                    $scope.notify('success', 'ACR Customer Added');
                    angular.element('#createAcrdbCust').modal('toggle');
                }
            })
        }
    }

    $scope.acrdbCustDetails = function(id){
        window.location.href = '#/acr-database-custDetails/' + id
    }

    $scope.acrDatabasePage = function(){
        window.location.href = '#/acr-database';
    }

    $scope.acrCollectionList = function(){
        window.location.href = '#/acr-collectionList';
    }

    $scope.acrAddCollectionList = function(){
        window.location.href = '#/acr-addCollectionList';
    }

    $scope.acrBillingMatchingPage = function(){
        window.location.href = '#/acr-billingDataMatching';
    }

    $scope.getAcrdbCustList();
});

app.controller('acrdbCustDetailsController', function($scope, $http, $routeParams, $filter, $route){
    'use strict';

    $scope.acrCustID = {'acrCustID': $routeParams.custID};
    $scope.acrBinList = [];
    $scope.editAcr = false;

    $scope.acrDetailsList = [];
    $scope.acrBinActiveCount = 0;
    $scope.acrBinPostponedCount = 0;
    $scope.acrBinTerminatedCount = 0;
    $scope.acrBinTerminatedClosedCount = 0;

    $scope.recommendCustStatus = "";

    $http.post('/getAcrdbCustDetails', $scope.acrCustID).then(function(response){
        $scope.acrCustDetails = response.data[0];
        $scope.acrEditCustDetails = response.data[0];

        if($scope.acrCustDetails.custStatus == '0'){
            $scope.acrCustDetails.statusWord = "Active"
        }else if($scope.acrCustDetails.custStatus == '1'){
            $scope.acrCustDetails.statusWord = "Postponed"
        }else if($scope.acrCustDetails.custStatus == '2'){
            $scope.acrCustDetails.statusWord = "Terminated"
        }

    });

    $http.post('/getAcrdbCustBEBin', $scope.acrCustID).then(function(response){
        $scope.acrBinList = response.data;
        $scope.searchAcrdbCustBinFilter = '';
        $scope.filterAcrdbCustBin= [];

        for(var i = 0; i< $scope.acrBinList.length; i++){
            $scope.acrBinList[i].date = $filter('date')($scope.acrBinList[i].date, 'yyyy-MM-dd');
        }

        $scope.searchAcrdbCustBins = function (acrdbCustBin) {
            return (acrdbCustBin.serialNo + acrdbCustBin.binStatus + acrdbCustBin.size + acrdbCustBin.binInUse + acrdbCustBin.date + acrdbCustBin.name + acrdbCustBin.brand).toUpperCase().indexOf($scope.searchAcrdbCustBinFilter.toUpperCase()) >= 0;
        }

        $scope.filterAcrdbCustBin = angular.copy($scope.acrBinList);

        $scope.getData = function () {
            return $filter('filter')($scope.filterAcrdbCustBin, $scope.searchAcrdbCustBinFilter);
        };
    })

    $http.post('/getAcrdbCustAcrBin', $scope.acrCustID).then(function(response){
        $scope.acrDetailsList = response.data;
        $scope.searchAcrdbCustDetailsFilter = '';
        $scope.filterAcrdbCustDetails= [];

        for(var j = 0; j< $scope.acrDetailsList.length; j++){
            $scope.acrDetailsList[j].date = $filter('date')($scope.acrDetailsList[j].date, 'yyyy-MM-dd');
            if($scope.acrDetailsList[j].status == 'Active'){
                $scope.acrBinActiveCount++;
            }else if($scope.acrDetailsList[j].status == 'Postponed'){
                $scope.acrBinPostponedCount++;
            }else if($scope.acrDetailsList[j].status == 'Terminated'){
                $scope.acrBinTerminatedCount++;
            }else if($scope.acrDetailsList[j].status == 'Terminated (Closed)'){
                $scope.acrBinTerminatedClosedCount++;
            }
        }

        if($scope.acrBinActiveCount>0){
            $scope.recommendCustStatus = "0";
        }else if($scope.acrBinPostponedCount>0){
            $scope.recommendCustStatus = "1";
        }else if($scope.acrBinTerminatedCount>0 || $scope.acrBinTerminatedClosedCount>0){
            $scope.recommendCustStatus = "2";
        }
        
        $scope.searchAcrdbCustDetails = function (acrdbCustDetails) {
            return (acrdbCustDetails.serialNo + acrdbCustDetails.brand + acrdbCustDetails.binSize + acrdbCustDetails.date + acrdbCustDetails.name + acrdbCustDetails.status).toUpperCase().indexOf($scope.searchAcrdbCustDetailsFilter.toUpperCase()) >= 0;
        }

        $scope.filterAcrdbCustDetails = angular.copy($scope.acrDetailsList);

        $scope.getData = function () {
            return $filter('filter')($scope.filterAcrdbCustDetails, $scope.searchAcrdbCustDetailsFilter);
        };        
    });　

    $scope.submitAcrdbCustEdit = function(){
        $scope.acrEditCustDetails.acrCustID = $routeParams.custID;
        $http.post('/submitAcrdbCustEdit', $scope.acrEditCustDetails).then(function(response){
            if(response.data.status == 'success'){
                $scope.notify('success', 'ACR Customer Details Updated');
                $route.reload(); 
            }
        });
    }

    $scope.editAcrdbPage = function(acrId){
        window.location.href = '#/acr-database-edit/' + acrId;
    }

    $scope.editAcrBdbPage = function(id){
        window.location.href = "#/bdb-edit/" + id;
    }
});

app.controller('acrCollectionListController', function($scope, $http, $filter, storeDataService){
    $scope.show = angular.copy(storeDataService.show.acrdb);

    $http.get('/getTruckCollectionRecord').then(function(response){
        console.log(response.data);

        
        $scope.acrCollectionList = response.data;
        for(var i=0; i<$scope.acrCollectionList.length; i++){
            $scope.acrCollectionList[i].myDate = $filter('date')($scope.acrCollectionList[i].myDate, 'yyyy-MM-dd');    
        }
        
    });
});

app.controller('acrAddCollectionListController', function($scope, $http, $filter, storeDataService){

    $scope.show = angular.copy(storeDataService.show.acrdb);
    
    var allowSubmit = false;

    $scope.importACRExcel = function(){
        if($scope.myFile != undefined){
            $scope.formattedCollectionData = [];
            var file = $scope.myFile;
            var fileReader = new FileReader();
            fileReader.readAsBinaryString(file);
            fileReader.onload = (event)=>{
                var excelData = event.target.result;
                var workbook = XLSX.read(excelData,{type:"binary"});

                workbook.SheetNames.forEach(sheet=>{
                    // let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
                    let rawJsonObject = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
                    if(Object.keys(rawJsonObject[0])[0] == "Device:"){
                        var firstDevice = Object.keys(rawJsonObject[0])[1];
                        var device = Object.keys(rawJsonObject[0])[1];
                        var flag = 0;
                        $scope.formattedCollectionData.push({
                            "device": device,
                            "data": []
                        });
                        for(var i=0; i<rawJsonObject.length; i++){
                            if(rawJsonObject[i]["Device:"] != 'Zone in'){
                                if(rawJsonObject[i]["Device:"] != undefined){
                                    if(rawJsonObject[i]["Device:"] != "Device:"){
                                        if(rawJsonObject[i]["__EMPTY"].length > 3){ //above 1 min
                                            $scope.formattedCollectionData[flag].data.push({
                                                "location": rawJsonObject[i]["__EMPTY_2"],
                                                "zoneIn": rawJsonObject[i]["Device:"],
                                                "zoneOut": rawJsonObject[i][firstDevice],
                                                "duration":rawJsonObject[i]["__EMPTY"],
                                                "distance": rawJsonObject[i]["__EMPTY_1"],
                                                "position": rawJsonObject[i]["__EMPTY_3"],
                                                "date": rawJsonObject[i]["Device:"].split(" ")[0]
                                            });
                                        }else{ //below 1 min
                                            if(parseInt(rawJsonObject[i]["__EMPTY"].slice(0,2))>20){
                                                $scope.formattedCollectionData[flag].data.push({
                                                    "location": rawJsonObject[i]["__EMPTY_2"],
                                                    "zoneIn": rawJsonObject[i]["Device:"],
                                                    "zoneOut": rawJsonObject[i][firstDevice],
                                                    "duration":rawJsonObject[i]["__EMPTY"],
                                                    "distance": rawJsonObject[i]["__EMPTY_1"],
                                                    "position": rawJsonObject[i]["__EMPTY_3"],
                                                    "date": rawJsonObject[i]["Device:"].split(" ")[0]
                                                });
                                            }
                                        }
                                    }else{
                                        device = rawJsonObject[i][firstDevice];
                                        $scope.formattedCollectionData.push({
                                            "device": device,
                                            "data": []
                                        })
                                        flag++;
                                    }
                                }
                            }
                        }
                        console.log($scope.formattedCollectionData);
                        allowSubmit = true;
                        $scope.$apply();
                    }else{
                        $scope.notify('error', 'This is wrong format, please consult IT support');
                        allowSubmit = false;
                    }               
                });
            }
        }else{
            $scope.notify('error', 'Please select your file before upload');
            allowSubmit = false;
        }
    }

    $scope.submitCollectionList = function(){
        if(!allowSubmit){
            $scope.notify('error', 'Please upload your data before submit');
        }else{
            $http.post("/submitTruckCollectionRecord", $scope.formattedCollectionData).then(function(response){
                if(response.data.status == 'success'){
                    $scope.notify('success', 'Insert Success');
                }else{
                    $scope.notify('error', 'Error');
                }
            });
        }
    }

});

app.controller('acrBillingDataMatchingController', function($scope, $http, $filter, storeDataService){
    $scope.show = angular.copy(storeDataService.show.acrdb);
    $scope.showUpdateBtnAcrList = true;
    $scope.showUpdateBtnBillList = true;

    $scope.cf = {
        "mon": "",
        "tue": "",
        "wed": "",
        "thu": "",
        "fri": "",
        "sat": "",
        "sun": ""
    }

    $scope.addCustDetail = {
        "name": "",
        "company": "",
        "ic": "",
        "contact": "",
        "council": ""
    }

    var council={
        "council": ""
    }

    $scope.council = "";

    $scope.importBillingAcrExcel = function(){

        $scope.latestActiveBillingAcr = [];
        var billingExcel = $scope.billingExcel;
        var excelRawData = [];

        if(billingExcel != null){
            var fileReader = new FileReader();
            fileReader.readAsBinaryString(billingExcel);
            fileReader.onload = (event)=>{
                var excelData = event.target.result;
                var workbook = XLSX.read(excelData,{type:"binary"});
                council["council"]= workbook.SheetNames[0];
                $scope.council = workbook.SheetNames[0];
                workbook.SheetNames.forEach(sheet=>{
                    excelRawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
                    if(council.council == "DBKU"){
                        for(var a=2; a<excelRawData.length - 1; a++){
                            $scope.latestActiveBillingAcr.push({
                                "company": excelRawData[a]["__EMPTY_1"],
                                "amount": excelRawData[a]["__EMPTY_4"]
                            })
                        }
                    }if(council.council == "MBKS"){
                        for(var a=0; a<excelRawData.length; a++){
                            $scope.latestActiveBillingAcr.push({
                                "company": excelRawData[a]["company"]
                            })
                        }
                    }
                });
                $scope.refreshAcrdbMatch();
            }
        }else{
            $scope.notify("error","Please insert excel file before upload.")
        }
        
    }


    $scope.refreshAcrdbMatch = function(){
        $scope.listNotAppearInBill = [];
        $scope.billNotAppearInList = [];
        $scope.listAppearInBill = [];
        $scope.billAppearInList = [];
        $scope.matchList = [];
        
        $http.post('/getAcrdbBillingMatchingList', council).then(function(response){
            $scope.acrdbCouncilCustList = response.data;

            $.each($scope.acrdbCouncilCustList , function (key1, value1) {
                var flag = false;
                $.each($scope.latestActiveBillingAcr , function (key2, value2) {
                    if(value1.company.replace(/\s/g, '').toUpperCase() == value2.company.replace(/\s/g, '').toUpperCase() && value1.custStatus == '0'){
                        flag = true;
                        $scope.listAppearInBill.push(value1);
                        
                        var bin = "";
                        if(value1.bin1000L != null){
                            bin += "1000L x " + value1.bin1000L.toString() + "\n";
                        }
                        if(value1.bin660L != null){
                            bin += "660L x " + value1.bin660L.toString() + "\n";
                        }
                        if(value1.bin240L != null){
                            bin += "240L x " + value1.bin240L.toString() + "\n";
                        }
                        if(value1.bin120L != null){
                            bin += "120L x " + value1.bin120L.toString() + "\n";
                        }
                        if(value1.na != null){
                            bin += "NA x " + value1.na.toString() + "\n";
                        }
                        
                        $scope.matchList.push({
                            "acrCustID": value1.acrCustID,
                            "company": value1.company,
                            "bin": bin,
                            "cost": value1.cost,
                            "entitlement": value1.entitlement,
                            "total": value1.totalCost,
                            "histPayment": value1.histPayment,
                            "histPaymentDate": $filter('date')(value1.histPaymentDate, 'yyyy-MM-dd'),
                            "payment": value2.amount
                        });
                    }
                });
                if(flag == false && value1.custStatus == '0'){
                    $scope.listNotAppearInBill.push(value1);
                }
            });

            $.each($scope.latestActiveBillingAcr , function (key3, value3) {
                var flag = false;
                $.each($scope.acrdbCouncilCustList , function (key4, value4) {
                    if(value3.company.replace(/\s/g, '').toUpperCase() == value4.company.replace(/\s/g, '').toUpperCase() && value4.custStatus == '0'){
                        flag = true;
                        $scope.billAppearInList.push(value3);
                    }else if(value3.company.replace(/\s/g, '').toUpperCase() == value4.company.replace(/\s/g, '').toUpperCase() && value4.custStatus != '0'){
                        flag = true;
                        value4.type = '1'
                        $scope.billNotAppearInList.push(value4);
                    }
                });
                
                if(flag == false){
                    value3.type = '0';
                    $scope.billNotAppearInList.push(value3);
                }
            });
            // console.log($scope.billAppearInList);
            console.log($scope.billNotAppearInList);
        });
    }
    
    $scope.editMatchACRCustCompanyName = function(company, id){
        $http.post('/updateACRCustCompanyName', {"company": company, "id": id}).then(function(response){
            console.log(response);
        })
    }

    $scope.editACRCustCompanyNameStatus = function(id){
        $http.post('/updateACRCustCompanyName', {"company": $('#inputCompanyName-'+id).val(), "status":$('#inputCompanyStatus-'+id).val(), "id": id}).then(function(response){
            if(response.data.status=="success"){
                $scope.notify('success', 'Information Updated');
            }
        })
    }

    $scope.editBillingCustCompanyNameStatus = function(id){
        $http.post('/updateBillCompanyStatus', {"status":$('#inputBillingStatus-'+id).val(), "id": id}).then(function(response){
            if(response.data.status=="success"){
                $scope.notify('success', 'Information Updated');
            }
        })
    }
    
    $scope.addAcrdbCust = function(){
        if($scope.addCustDetail.name == "" || $scope.addCustDetail.company == "" || $scope.addCustDetail.contact == "" || $scope.addCustDetail.council == "" || $scope.addCustDetail.ic == ""){
            $scope.notify("error","Please Fill In All Column");
        }else{
            $http.post("/addAcrdbCust", $scope.addCustDetail).then(function(response){
                if(response.data.status == 'success'){
                    $scope.notify('success', 'ACR Customer Added');
                    angular.element('#createAcrdbCust').modal('toggle');
                }
            })
        }
    }

    $scope.updateAcrBilling = function(){

        var billingObj = [];
        var date = $filter('date')(new Date(), "yyyy-MM-dd");   

        for(var i=0; i<$scope.matchList.length; i++){
            billingObj.push({
                "acrCustID": $scope.matchList[i].acrCustID, 
                "amount": $scope.matchList[i].payment,
                "date": date
            })
        }

        $http.post('/updateAcrBilling', billingObj).then(function(response){
            if(response.data.status == 'success'){
                $scope.notify('success', "Latest payment has been recorded");
                $scope.refreshAcrdbMatch();
            }
        })
    }
});

app.controller('complaintController', function ($scope, $http, $filter, $window, storeDataService) {
    'use strict';
    var asc = true;
    $scope.complaintList = [];
    $scope.complaintOfficerList = [];
    $scope.logisticsComplaintList = [];
    $scope.nowModule = 'web';
    $scope.zonReq = {
        "zon": ''
    }
    $scope.zonReqApp = {
        "zon": ''
    }

    $scope.zonReqLogs = {
        "zon": ''
    }

    //show control
    $scope.showwebkch = angular.copy(storeDataService.show.complaintwebkch);
    $scope.showappkch = angular.copy(storeDataService.show.complaintappkch);
    $scope.showlogskch = angular.copy(storeDataService.show.complaintlogskch);
    $scope.showwebbtu = angular.copy(storeDataService.show.complaintwebbtu);
    $scope.showappbtu = angular.copy(storeDataService.show.complaintappbtu);
    $scope.showlogsbtu = angular.copy(storeDataService.show.complaintlogsbtu);

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
    if($scope.showwebkch.view == 'A' && $scope.showwebbtu.view == 'A'){
        $scope.zonReq.zon = ""
    }else if($scope.showwebkch.view == 'A'){
        $scope.zonReq.zon = "KCH"
    }else if($scope.showwebbtu.view == 'A'){
        $scope.zonReq.zon = "BTU"
    }

    if($scope.showlogskch.view == 'A' && $scope.showlogsbtu.view == 'A'){
        $scope.zonReqLogs.zon = ""
    }else if($scope.showlogskch.view == 'A'){
        $scope.zonReqLogs.zon = "KCH"
    }else if($scope.showlogsbtu.view == 'A'){
        $scope.zonReqLogs.zon = "BTU"
    }

    if($scope.showappkch.view == 'A' && $scope.showappbtu.view == 'A'){
        $scope.zonReqApp.zon = ""
    }else if($scope.showappkch.view == 'A'){
        $scope.zonReqApp.zon = "KCH"
    }else if($scope.showappbtu.view == 'A'){
        $scope.zonReqApp.zon = "BTU"
    }

    //get verified complaint list
    $http.post('/getComplaintOfficerList', $scope.zonReq).then(function (response) {

        $scope.complaintOfficerList = response.data;
        $scope.searchWebComplaintFilter = '';
        $scope.filterWebComplaintList = [];

        for (var i = 0; i < $scope.complaintOfficerList.length; i++) {

            if ($scope.complaintOfficerList[i].readState == 'u') {
                $scope.unreadWebComplaintCount++;
            }

            if ($scope.complaintOfficerList[i].step == 1) {
                $scope.complaintOfficerList[i].department = "Logistics";
            } else {
                $scope.complaintOfficerList[i].department = "Customer Services";
            }

            if ($scope.complaintOfficerList[i].services == 1) {
                $scope.complaintOfficerList[i].serviceType = "Municipal Waste";
            } else if ($scope.complaintOfficerList[i].services == 2) {
                $scope.complaintOfficerList[i].serviceType = "Roro Container";
            } else if ($scope.complaintOfficerList[i].services == 3) {
                $scope.complaintOfficerList[i].serviceType = "Scheduled waste";
            }

            if ($scope.complaintOfficerList[i].status == null) {
                $scope.complaintOfficerList[i].status = "N/A";
            }

            if($scope.complaintOfficerList[i].contactStatus == null){
                $scope.complaintOfficerList[i].contactStatus = "";
            }else{
                var contactStatus = $scope.complaintOfficerList[i].contactStatus.split(":");
                if(contactStatus[0] == "1"){
                    $scope.complaintOfficerList[i].contactStatus = "NA";
                }else if(contactStatus[0] == "2"){
                    $scope.complaintOfficerList[i].contactStatus = "WN";
                }else if(contactStatus[0] == "3"){
                    $scope.complaintOfficerList[i].contactStatus = "NN";
                }else if(contactStatus[0] == "4"){
                    $scope.complaintOfficerList[i].contactStatus = "OT";
                }else if(contactStatus[0] == '0'){
                    $scope.complaintOfficerList[i].contactStatus = "Complete";
                }
            }

            
            if($scope.complaintOfficerList[i].bdKPI != null){                
                $scope.complaintOfficerList[i].bdKPINum = $scope.complaintOfficerList[i].bdKPI.split(":")[0] + ":" + parseInt($scope.complaintOfficerList[i].bdKPI.split(":")[1]);
            }
            
            if($scope.complaintOfficerList[i].bdKPIAchieve == 'A'){
                $scope.complaintOfficerList[i].bdKPIAchieveWord = 'Achieve';
            }else if($scope.complaintOfficerList[i].bdKPIAchieve == 'N'){
                $scope.complaintOfficerList[i].bdKPIAchieveWord = 'Over Time';
            }else if($scope.complaintOfficerList[i].bdKPIAchieve == 'E'){
                $scope.complaintOfficerList[i].bdKPIAchieveWord = 'Error';
            }else if($scope.complaintOfficerList[i].bdKPIAchieve == '' || $scope.complaintOfficerList[i].bdKPIAchieve == null){
                $scope.complaintOfficerList[i].bdKPIAchieveWord = 'Blank';
            }
        }

        $scope.filterWebComplaintList = angular.copy($scope.complaintOfficerList);

        $scope.searchWebComplaint = function (complaint) {
            return (complaint.complaintDate + complaint.coID + complaint.serialNo + complaint.customerDateTime + complaint.logisticsDateTime + complaint.bdKPINum + complaint.bdKPIAchieveWord +  complaint.name + complaint.company + complaint.serviceType + complaint.department + complaint.status).toUpperCase().indexOf($scope.searchWebComplaintFilter.toUpperCase()) >= 0;
        }

        $scope.webComptotalItems = $scope.filterWebComplaintList.length;

        $scope.getWebData = function () {
            return $filter('filter')($scope.filterWebComplaintList, $scope.searchWebComplaintFilter);
        }

        $scope.$watch('searchWebComplaintFilter', function (newVal, oldVal) {
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
    $http.post('/getComplaintList', $scope.zonReqApp).then(function (response) {

        $scope.searchComplaintFilter = '';
        $scope.filterComplaintList = [];
        $scope.complaintList = response.data;
        var splitType = "";
        var splitTypeContent = "";
        var splitTypeSpecialContent = "";

        for (var i = 0; i < $scope.complaintList.length; i++) {
            
            if ($scope.complaintList[i].readStat == 'u') {
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
                        splitTypeSpecialContent[2] = "Others(Municipal waste)";
                    } else if (splitTypeSpecialContent[0] == '13') {
                        splitTypeSpecialContent[2] = "Others(Roro container)";
                    } else if (splitTypeSpecialContent[0] == '14') {
                        splitTypeSpecialContent[2] = "Others(Scheduled waste)";
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
                        splitTypeContent = "RoRo not sent";
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

                if ($scope.complaintList[i].type == 1) {
                    $scope.complaintList[i].serviceType = "Municipal waste";
                } else if ($scope.complaintList[i].type == 2) {
                    $scope.complaintList[i].serviceType = "Roro container";
                } else if ($scope.complaintList[i].type == 3) {
                    $scope.complaintList[i].serviceType = "Scheduled waste";
                }
            }



        }

        $scope.filterComplaintList = angular.copy($scope.complaintList);

        $scope.searchComplaint = function (complaint) {
            return (complaint.date + complaint.complaintID + complaint.detailType + complaint.customer + complaint.serviceType + complaint.code + complaint.status).toUpperCase().indexOf($scope.searchComplaintFilter.toUpperCase()) >= 0;
        }

        $scope.appComptotalItems = $scope.filterComplaintList.length;

        $scope.getData = function () {
            return $filter('filter')($scope.filterComplaintList, $scope.searchComplaintFilter);
        }

        $scope.$watch('searchComplaintFilter', function (newVal, oldVal) {
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
    $http.post('/getLogisticsComplaintList', $scope.zonReqLogs).then(function (response) {

        $scope.logisticsComplaintList = response.data;
        $scope.searchLogComplaintFilter = '';
        $scope.filterLogComplaintList = [];

        if ($scope.logisticsComplaintList.length != 0) {
            for (var i = 0; i < $scope.logisticsComplaintList.length; i++) {

                if ($scope.logisticsComplaintList[i].logsReadState == 'u') {
                    $scope.unreadLogComplaintCount++;
                }

                // $scope.logisticsComplaintList[i].complaintDate = $filter('date')($scope.logisticsComplaintList[i].complaintDate, 'yyyy-MM-dd');

                if ($scope.logisticsComplaintList[i].services == 1) {
                    $scope.logisticsComplaintList[i].serviceType = "Municipal waste";
                } else if ($scope.logisticsComplaintList[i].services == 2) {
                    $scope.logisticsComplaintList[i].serviceType = "Roro Container";
                } else if ($scope.logisticsComplaintList[i].services == 3) {
                    $scope.logisticsComplaintList[i].serviceType = "Scheduled waste";
                }

                if ($scope.logisticsComplaintList[i].status == null) {
                    // console.log($scope.logisticsComplaintList[i].status);
                    $scope.logisticsComplaintList[i].status = "N/A";
                }

                if ($scope.logisticsComplaintList[i].step == 1) {
                    $scope.logisticsComplaintList[i].department = "Logistics";
                } else {
                    $scope.logisticsComplaintList[i].department = "Customer Services";
                }

                //formulate reason
                if($scope.logisticsComplaintList[i].reason == 1){
                    $scope.logisticsComplaintList[i].reason = "Waste Not Collected (MW)";
                }else if($scope.logisticsComplaintList[i].reason == 2){
                    $scope.logisticsComplaintList[i].reason = "Shortage Manpower (MW)";
                }else if($scope.logisticsComplaintList[i].reason == 3){
                    $scope.logisticsComplaintList[i].reason = "Truck Breakdown (MW)";
                }else if($scope.logisticsComplaintList[i].reason == 4){
                    $scope.logisticsComplaintList[i].reason = "Truck Full (MW)";
                }else if($scope.logisticsComplaintList[i].reason == 5){
                    $scope.logisticsComplaintList[i].reason = "Bin Not Sent Back (MW)";
                }else if($scope.logisticsComplaintList[i].reason == 6){
                    $scope.logisticsComplaintList[i].reason = "Spillage of Leachate (MW)";
                }else if($scope.logisticsComplaintList[i].reason == 7){
                    $scope.logisticsComplaintList[i].reason = "Others (MW)";
                }else if($scope.logisticsComplaintList[i].reason == 8){
                    $scope.logisticsComplaintList[i].reason = "Not wearing PPE / Uniform (MW)";
                }else if($scope.logisticsComplaintList[i].reason == 9){
                    $scope.logisticsComplaintList[i].reason = "Spillage of waste (MW)";
                }else if($scope.logisticsComplaintList[i].reason == 10){
                    $scope.logisticsComplaintList[i].reason = "Truck Breakdown (RoRo)";
                }else if($scope.logisticsComplaintList[i].reason == 11){
                    $scope.logisticsComplaintList[i].reason = "Shortage Manpower (RoRo)";
                }else if($scope.logisticsComplaintList[i].reason == 12){
                    $scope.logisticsComplaintList[i].reason = "Not wearing PPE / Uniform (RoRo)";
                }else if($scope.logisticsComplaintList[i].reason == 13){
                    $scope.logisticsComplaintList[i].reason = "Shortage of Container (RoRo)";
                }else if($scope.logisticsComplaintList[i].reason == 14){
                    $scope.logisticsComplaintList[i].reason = "Others (RoRo)";
                }else if($scope.logisticsComplaintList[i].reason == 15){
                    $scope.logisticsComplaintList[i].reason = "Truck Breakdown (SW)";
                }else if($scope.logisticsComplaintList[i].reason == 16){
                    $scope.logisticsComplaintList[i].reason = "Shortage Manpower (SW)";
                }else if($scope.logisticsComplaintList[i].reason == 17){
                    $scope.logisticsComplaintList[i].reason = "Incomplete Documents (SW)";
                }else if($scope.logisticsComplaintList[i].reason == 18){
                    $scope.logisticsComplaintList[i].reason = "Spillage During Collection (SW)";
                }else if($scope.logisticsComplaintList[i].reason == 19){
                    $scope.logisticsComplaintList[i].reason = "Not waring PPE / Uniform (SW)";
                }else if($scope.logisticsComplaintList[i].reason == 20){
                    $scope.logisticsComplaintList[i].reason = "Others (SW)";
                }

                if($scope.logisticsComplaintList[i].lgKPI != null){                
                    $scope.logisticsComplaintList[i].lgKPINum = $scope.logisticsComplaintList[i].lgKPI.split(":")[0] + ":" + parseInt($scope.logisticsComplaintList[i].lgKPI.split(":")[1]);
                }

                if($scope.logisticsComplaintList[i].lgKPIAchieve == 'A'){
                    $scope.logisticsComplaintList[i].lgKPIAchieveWord = 'Achieve';
                }else if($scope.logisticsComplaintList[i].lgKPIAchieve == 'N'){
                    $scope.logisticsComplaintList[i].lgKPIAchieveWord = 'Over Time';
                }else if($scope.logisticsComplaintList[i].lgKPIAchieve == 'E'){
                    $scope.logisticsComplaintList[i].lgKPIAchieveWord = 'Error';
                }else if($scope.logisticsComplaintList[i].lgKPIAchieve == '' || $scope.logisticsComplaintList[i].lgKPIAchieve == null){
                    $scope.logisticsComplaintList[i].lgKPIAchieveWord = 'Blank';
                }
            }
        }


        $scope.filterLogComplaintList = angular.copy($scope.logisticsComplaintList);

        $scope.searchLogComplaint = function (complaint) {
            return (complaint.complaintDate + complaint.coID + complaint.serialNo + complaint.name + complaint.company + complaint.reason + complaint.serviceType + complaint.staff + complaint.department + complaint.status + complaint.lgKPIAchieveWord + complaint.lgKPINum).toUpperCase().indexOf($scope.searchLogComplaintFilter.toUpperCase()) >= 0;
        }

        $scope.logComptotalItems = $scope.filterLogComplaintList.length;

        $scope.getLogData = function () {
            return $filter('filter')($scope.filterLogComplaintList, $scope.searchLogComplaintFilter);
        }

        $scope.$watch('searchLogComplaintFilter', function (newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.paginationLogComp.currentPage = 1;
                $scope.logComptotalItems = $scope.getLogData().length;
            }
            return vm;
        }, true);

        $scope.unreadLogRowControl = "{'table-active': l.logsReadState == 'u'}";
    });

    //view app complaint
    $scope.complaintDetail = function (complaintCode) {
        console.log('complaint clicked');
        $http.post('/readComplaint', {"id":complaintCode}).then(function(response) {
            console.log(response.data);
            if (response.data == "Complaint Read") {
                socket.emit('complaint read');
            }
        }, function(err) {
            console.log(err);
        });
        window.location.href = '#/complaint-detail/' + complaintCode;

    };

    //create verified complaint
    $scope.createComp = function () {
        window.location.href = '#/complaint-officer-create';
    };

    //route to export complaint
    $scope.exportComp = function () {
        window.location.href = '#/complaint-export';
    };

    //route to cms daily report
    $scope.exportCmsDailyReport = function () {
        window.location.href = '#/complaint-cmsDailyReport';
    };

    //route to bd cms statistics
    $scope.bdCMSStatistics = function () {
        window.location.href = '#/complaint-cmsBDStatistics';
    };

    //route to bd cms qop
    $scope.bdQOP = function () {
        window.location.href = '#/complaint-cmsBDQOP';
    };

    //route to general cms statistics
    $scope.logisticsGeneralCMSStatistics = function () {
        window.location.href = '#/complaint-cmsStatistics';
    };

    $scope.cmsSubconDataPage = function(){
        window.location.href = '#/complaint-cmsSubconData';
    }

    //route to cms datasheet
    $scope.exportCmsDatasheet = function () {
        window.location.href = '#/complaint-cmsDatasheet';
    };

    //view verified complaint
    $scope.viewComp = function (coID) {
        setTimeout(function () {
            window.location.href = '#/complaint-officer-detail/' + coID;
        }, 500);
    };

    //view logistics complaint
    $scope.viewLogComp = function (coID) {
        setTimeout(function () {
            window.location.href = '#/complaint-logistics-detail/' + coID;
        }, 500);
    }

    $scope.orderBy = function (property) {

        $scope.complaintList = $filter('orderBy')($scope.complaintList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };

    $scope.webOrderBy = function (property) {
        $scope.complaintOfficerList = $filter('orderBy')($scope.complaintOfficerList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };

    $scope.logsOrderBy = function (property) {

        $scope.logisticsComplaintList = $filter('orderBy')($scope.logisticsComplaintList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };

    $scope.tabClick = function (module) {
        $scope.nowModule = module;
    }


});

app.controller('complaintExportController', function ($scope, $http, $window, $filter) {
    'use strict';

    var datevar = new Date();

    $scope.obj = {
        "startDate": new Date(datevar.getFullYear(), datevar.getMonth(), 1),
        "endDate": new Date(datevar.getFullYear(), datevar.getMonth() + 1, 0),
        "services": '0',
        "zon": 'KCH'
    }

    $scope.complaintExportList = [];

    $scope.generateExportList = function(){
        var obj = $scope.obj;
        obj.endDate.setDate(obj.endDate.getDate() + 1);
        console.log(obj);
        $http.post('/getComplaintExportList', obj).then(function (response) {
            $scope.complaintExportList = response.data;
            
            var splitType = "";
            var splitTypeContent = "";
            var splitTypeSpecialContent = ""; 

            var areaCFList = [];
            $http.get('/getAreaCFList').then(function(response){
                areaCFList = response.data;
                
                for (var i = 0; i < $scope.complaintExportList.length; i++) {
                    $scope.detailType = "";
                    //formulate value for type of complaint
                    splitType = $scope.complaintExportList[i].type.split(":,:");
                    
                    for (var n = 0; n < splitType.length; n++) {
                        if (splitType[n].length > 3) {
                            splitTypeSpecialContent = splitType[n].split(":::::");
                            if (splitTypeSpecialContent[0] == '1') {
                                splitTypeSpecialContent[2] = "Waste not collected";
                            } else if (splitTypeSpecialContent[0] == '12' || splitTypeSpecialContent[0] == '13' || splitTypeSpecialContent[0] == '14') {
                                splitTypeSpecialContent[2] = "Others";
                            }
                            $scope.detailType += splitTypeSpecialContent[2];
                        } else {
                            if (splitType[n] == '2') {
                                splitTypeContent = "Bin not pushed back to its original location";
                            } else if (splitType[n] == '3') {
                                splitTypeContent = "Spillage of waste";
                            } else if (splitType[n] == '4') {
                                splitTypeContent = "Spillage of leachate water";
                            } else if (splitType[n] == '5') {
                                splitTypeContent = "RoRo not sent";
                            } else if (splitType[n] == '6') {
                                splitTypeContent = "RoRo not exchanged";
                            } else if (splitType[n] == '7') {
                                splitTypeContent = "RoRo not pulled";
                            } else if (splitType[n] == '8') {
                                splitTypeContent = "RoRo not emptied";
                            } else if (splitType[n] == '9') {
                                splitTypeContent = "Waste not collected on time";
                            } else if (splitType[n] == '10') {
                                splitTypeContent = "Spillage during collection";
                            } else if (splitType[n] == '11') {
                                splitTypeContent = "Incomplete documents";
                            }
                            $scope.detailType += splitTypeContent;
                        }

                        if (i < (splitType.length - 1)) {
                            $scope.detailType += ", ";
                        }

                    }  
                    $scope.complaintExportList[i].complaintTypeFormatted = $scope.detailType;            

                    //formulate waste collected on
                    if($scope.complaintExportList[i].wasteColDT != null){
                        var wasteArray = $scope.complaintExportList[i].wasteColDT.split(";");
                        $scope.complaintExportList[i].wcdSentences = "";
                        for(var c=0; c < wasteArray.length - 1; c++){
                            $scope.complaintExportList[i].wcdSentences += wasteArray[c].split(",")[0] + ' (' + $filter("date")(wasteArray[c].split(",")[0].split(" ")[0], "EEEE") + ') - ' + wasteArray[c].split(",")[1]  + ".\n";
                        }  
                    }

                    if($scope.complaintExportList[i].reason == 1){
                        $scope.complaintExportList[i].reason = "Waste Not Collected (MW)";
                    }else if($scope.complaintExportList[i].reason == 2){
                        $scope.complaintExportList[i].reason = "Shortage Manpower (MW)";
                    }else if($scope.complaintExportList[i].reason == 3){
                        $scope.complaintExportList[i].reason = "Truck Breakdown (MW)";
                    }else if($scope.complaintExportList[i].reason == 4){
                        $scope.complaintExportList[i].reason = "Truck Full (MW)";
                    }else if($scope.complaintExportList[i].reason == 5){
                        $scope.complaintExportList[i].reason = "Bin Not Sent Back (MW)";
                    }else if($scope.complaintExportList[i].reason == 6){
                        $scope.complaintExportList[i].reason = "Spillage of Leachate (MW)";
                    }else if($scope.complaintExportList[i].reason == 7){
                        $scope.complaintExportList[i].reason = "Others (MW)";
                    }else if($scope.complaintExportList[i].reason == 8){
                        $scope.complaintExportList[i].reason = "Not wearing PPE / Uniform (MW)";
                    }else if($scope.complaintExportList[i].reason == 9){
                        $scope.complaintExportList[i].reason = "Spillage of waste (MW)";
                    }else if($scope.complaintExportList[i].reason == 10){
                        $scope.complaintExportList[i].reason = "Truck Breakdown (RoRo)";
                    }else if($scope.complaintExportList[i].reason == 11){
                        $scope.complaintExportList[i].reason = "Shortage Manpower (RoRo)";
                    }else if($scope.complaintExportList[i].reason == 12){
                        $scope.complaintExportList[i].reason = "Not wearing PPE / Uniform (RoRo)";
                    }else if($scope.complaintExportList[i].reason == 13){
                        $scope.complaintExportList[i].reason = "Shortage of Container (RoRo)";
                    }else if($scope.complaintExportList[i].reason == 14){
                        $scope.complaintExportList[i].reason = "Others (RoRo)";
                    }else if($scope.complaintExportList[i].reason == 15){
                        $scope.complaintExportList[i].reason = "Truck Breakdown (SW)";
                    }else if($scope.complaintExportList[i].reason == 16){
                        $scope.complaintExportList[i].reason = "Shortage Manpower (SW)";
                    }else if($scope.complaintExportList[i].reason == 17){
                        $scope.complaintExportList[i].reason = "Incomplete Documents (SW)";
                    }else if($scope.complaintExportList[i].reason == 18){
                        $scope.complaintExportList[i].reason = "Spillage During Collection (SW)";
                    }else if($scope.complaintExportList[i].reason == 19){
                        $scope.complaintExportList[i].reason = "Not waring PPE / Uniform (SW)";
                    }else if($scope.complaintExportList[i].reason == 20){
                        $scope.complaintExportList[i].reason = "Others (SW)";
                    }

                    if($scope.complaintExportList[i].bdKPI != null){                
                        $scope.complaintExportList[i].bdKPINum = $scope.complaintExportList[i].bdKPI.split(":")[0] + ":" + parseInt($scope.complaintExportList[i].bdKPI.split(":")[1]);
                    }
                    if($scope.complaintExportList[i].lgKPI != null){                
                        $scope.complaintExportList[i].lgKPINum = $scope.complaintExportList[i].lgKPI.split(":")[0] + ":" + parseInt($scope.complaintExportList[i].lgKPI.split(":")[1]);
                    }
                    for(var cf=0; cf<areaCFList.length; cf++){
                        if($scope.complaintExportList[i].area == areaCFList[cf].code){
                            $scope.complaintExportList[i].area += " (" + areaCFList[cf].cf + ")";
                        }
                    }  
                    
                    if($scope.complaintExportList[i].tonnage == null){
                        $scope.complaintExportList[i].tonnage = 'N/A'
                    }
                }
            });
        });
    }

});

app.controller('complaintcmsDailyReportController', function($scope, $filter, $http, $window){
    $scope.obj = {
        'startDate': '',
        'endDate': '',
        'services': '1',
        'zon': 'KCH'
    }

    $scope.showOtherSubcon = false;

    $scope.obj.startDate = new Date();
    $scope.obj.endDate = new Date();

    $scope.cmsDailyReportList = [];

    $scope.viewComp = function (coID) {
        setTimeout(function () {
            window.location.href = '#/complaint-officer-detail/' + coID;
        }, 500);
    };

    $scope.request = function(obj){
        console.log(obj);
        $http.post('/getCmsDailyReportList', obj).then(function(response){

            if($scope.obj.services == '3'){
                $scope.showOtherSubcon = true;
            }else{
                $scope.showOtherSubcon = false;
            }

            $scope.cmsDailyReportList = response.data;
            $scope.obj.startDate.setDate($scope.obj.startDate.getDate() + 1);
            var splitType = "";
            var splitTypeContent = "";
            var splitTypeSpecialContent = ""; 
            $scope.noTS = 0;
            $scope.noMP = 0;
            $scope.noTAK = 0;
            $scope.noOthers = 0;

            for(var i=0; i<$scope.cmsDailyReportList.length; i++){
                $scope.cmsDailyReportList[i].complaintDate = $filter('date')($scope.cmsDailyReportList[i].complaintDate, 'yyyy-MM-dd');

                $scope.cmsDailyReportList[i].complaintDateTime = $scope.cmsDailyReportList[i].complaintDate + ' ' +$scope.cmsDailyReportList[i].complaintTime;

                $scope.cmsDailyReportList[i].statusDate = $filter('date')($scope.cmsDailyReportList[i].statusDate, 'yyyy-MM-dd');

                if($scope.cmsDailyReportList[i].statusDate ==  null || $scope.cmsDailyReportList[i].statusTime == null){
                    $scope.cmsDailyReportList[i].statusDateTime = '-';
                }else{
                    $scope.cmsDailyReportList[i].statusDateTime = $scope.cmsDailyReportList[i].statusDate + ' ' +$scope.cmsDailyReportList[i].statusTime;
                }

                if($scope.cmsDailyReportList[i].forwardSubconDateTime == '' || $scope.cmsDailyReportList[i].forwardSubconDateTime == null){
                    $scope.cmsDailyReportList[i].forwardSubconDateTime = '-';
                }

                if($scope.cmsDailyReportList[i].services == '1'){
                    $scope.cmsDailyReportList[i].servicesType = 'Municipal waste';
                }else if($scope.cmsDailyReportList[i].services == '2'){
                    $scope.cmsDailyReportList[i].servicesType = 'Roro container';
                }else if($scope.cmsDailyReportList[i].services == '3'){
                    $scope.cmsDailyReportList[i].services = 'Scheduled Waste';
                }

                //formulate for subcon column
                if($scope.obj.services == '3'){
                    if($scope.cmsDailyReportList[i].subcon == "Trienekens"){
                        $scope.cmsDailyReportList[i].ts = "1";
                        $scope.cmsDailyReportList[i].others = "-";
                        $scope.noTS++;
                    }else{
                        $scope.cmsDailyReportList[i].ts = "-";
                        $scope.cmsDailyReportList[i].others = "1";
                        $scope.noOthers++;
                    }
                }else{
                    if($scope.cmsDailyReportList[i].subcon == "Trienekens"){
                        $scope.cmsDailyReportList[i].ts = "1";
                        $scope.cmsDailyReportList[i].mp = "-";
                        $scope.cmsDailyReportList[i].tak = "-";
                        $scope.noTS++;
                    }else if($scope.cmsDailyReportList[i].subcon == "Mega Power"){
                        $scope.cmsDailyReportList[i].ts = "-";
                        $scope.cmsDailyReportList[i].mp = "1";
                        $scope.cmsDailyReportList[i].tak = "-";
                        $scope.noMP++;
                    }else if($scope.cmsDailyReportList[i].subcon == "TAK"){
                        $scope.cmsDailyReportList[i].ts = "-";
                        $scope.cmsDailyReportList[i].mp = "-";
                        $scope.cmsDailyReportList[i].tak = "1";
                        $scope.noTAK++;
                    }
                }

                //formulate reason
                
                if($scope.cmsDailyReportList[i].reason == 1){
                    $scope.cmsDailyReportList[i].reason = "Waste Not Collected (MW)";
                }else if($scope.cmsDailyReportList[i].reason == 2){
                    $scope.cmsDailyReportList[i].reason = "Shortage Manpower (MW)";
                }else if($scope.cmsDailyReportList[i].reason == 3){
                    $scope.cmsDailyReportList[i].reason = "Truck Breakdown (MW)";
                }else if($scope.cmsDailyReportList[i].reason == 4){
                    $scope.cmsDailyReportList[i].reason = "Truck Full (MW)";
                }else if($scope.cmsDailyReportList[i].reason == 5){
                    $scope.cmsDailyReportList[i].reason = "Bin Not Sent Back (MW)";
                }else if($scope.cmsDailyReportList[i].reason == 6){
                    $scope.cmsDailyReportList[i].reason = "Spillage of Leachate (MW)";
                }else if($scope.cmsDailyReportList[i].reason == 7){
                    $scope.cmsDailyReportList[i].reason = "Others (MW)";
                }else if($scope.cmsDailyReportList[i].reason == 8){
                    $scope.cmsDailyReportList[i].reason = "Not wearing PPE / Uniform (MW)";
                }else if($scope.cmsDailyReportList[i].reason == 9){
                    $scope.cmsDailyReportList[i].reason = "Spillage of waste (MW)";
                }else if($scope.cmsDailyReportList[i].reason == 10){
                    $scope.cmsDailyReportList[i].reason = "Truck Breakdown (RoRo)";
                }else if($scope.cmsDailyReportList[i].reason == 11){
                    $scope.cmsDailyReportList[i].reason = "Shortage Manpower (RoRo)";
                }else if($scope.cmsDailyReportList[i].reason == 12){
                    $scope.cmsDailyReportList[i].reason = "Not wearing PPE / Uniform (RoRo)";
                }else if($scope.cmsDailyReportList[i].reason == 13){
                    $scope.cmsDailyReportList[i].reason = "Shortage of Container (RoRo)";
                }else if($scope.cmsDailyReportList[i].reason == 14){
                    $scope.cmsDailyReportList[i].reason = "Others (RoRo)";
                }else if($scope.cmsDailyReportList[i].reason == 15){
                    $scope.cmsDailyReportList[i].reason = "Truck Breakdown (SW)";
                }else if($scope.cmsDailyReportList[i].reason == 16){
                    $scope.cmsDailyReportList[i].reason = "Shortage Manpower (SW)";
                }else if($scope.cmsDailyReportList[i].reason == 17){
                    $scope.cmsDailyReportList[i].reason = "Incomplete Documents (SW)";
                }else if($scope.cmsDailyReportList[i].reason == 18){
                    $scope.cmsDailyReportList[i].reason = "Spillage During Collection (SW)";
                }else if($scope.cmsDailyReportList[i].reason == 19){
                    $scope.cmsDailyReportList[i].reason = "Not waring PPE / Uniform (SW)";
                }else if($scope.cmsDailyReportList[i].reason == 20){
                    $scope.cmsDailyReportList[i].reason = "Others (SW)";
                }

                //formulate review date
                $scope.cmsDailyReportList[i].logsReviewDate = $filter('date')($scope.cmsDailyReportList[i].logsReviewDate, 'yyyy-MM-dd');

                //formulate for area code
                if($scope.cmsDailyReportList[i].area != null){
                    $scope.cmsDailyReportList[i].area = $scope.cmsDailyReportList[i].area.split(",")[1];
                }
                
                //formulate value for type of complaint
                $scope.detailType = "";
                splitType = $scope.cmsDailyReportList[i].type.split(":,:");
                for (var n = 0; n < splitType.length; n++) {
                    if (splitType[n].length > 3) {
                        splitTypeSpecialContent = splitType[n].split(":::::");
                        if (splitTypeSpecialContent[0] == '1') {
                            splitTypeSpecialContent[2] = "Waste not collected";
                        } else if (splitTypeSpecialContent[0] == '12' || splitTypeSpecialContent[0] == '13' || splitTypeSpecialContent[0] == '14') {
                            splitTypeSpecialContent[2] = "Others";
                        }
                        $scope.detailType += splitTypeSpecialContent[2];
                    } else {
                        if (splitType[n] == '2') {
                            splitTypeContent = "Bin not pushed back to its original location";
                        } else if (splitType[n] == '3') {
                            splitTypeContent = "Spillage of waste";
                        } else if (splitType[n] == '4') {
                            splitTypeContent = "Spillage of leachate water";
                        } else if (splitType[n] == '5') {
                            splitTypeContent = "RoRo not sent";
                        } else if (splitType[n] == '6') {
                            splitTypeContent = "RoRo not exchanged";
                        } else if (splitType[n] == '7') {
                            splitTypeContent = "RoRo not pulled";
                        } else if (splitType[n] == '8') {
                            splitTypeContent = "RoRo not emptied";
                        } else if (splitType[n] == '9') {
                            splitTypeContent = "Waste not collected on time";
                        } else if (splitType[n] == '10') {
                            splitTypeContent = "Spillage during collection";
                        } else if (splitType[n] == '11') {
                            splitTypeContent = "Incomplete documents";
                        }
                        $scope.detailType += splitTypeContent;
                    }

                    if (n < (splitType.length - 1)) {
                        $scope.detailType += ", ";
                    }

                }
                $scope.cmsDailyReportList[i].type = $scope.detailType;
                
                //formulate value for waste collection date time
                if($scope.cmsDailyReportList[i].wasteColDT != null){
                    var wasteArray = $scope.cmsDailyReportList[i].wasteColDT.split(";");
                    $scope.cmsDailyReportList[i].wcdSentences = "";
                    for(var c=0; c < wasteArray.length - 1; c++){
                        $scope.cmsDailyReportList[i].wcdSentences += wasteArray[c].split(",")[0] + " - " + wasteArray[c].split(",")[1] + ".\n";
                    }  
                }else{
                    $scope.cmsDailyReportList[i].wcdSentences = '';
                }

                if($scope.cmsDailyReportList[i].wcdSentences == ''){
                    $scope.cmsDailyReportList[i].wcdSentences = '-';
                }
            }
        });
    }

    $scope.objChange = function () {
        if ($scope.obj.startDate != undefined && $scope.obj.endDate != undefined && $scope.obj.startDate <= $scope.obj.endDate) {
            var  sendObjDate = $scope.obj;
            sendObjDate.startDate.setDate(sendObjDate.startDate.getDate() - 1);
            $scope.request(sendObjDate);
        }
    }

    $scope.cmsReview = function () {
        if (confirm("Are you sure you want to review complaints?")) {
            var reviewComplaint = {
                'department': "LG",
                'staffID': window.sessionStorage.getItem('owner'),
                'coID': []
            }

            for(var i=0; i<$scope.cmsDailyReportList.length; i++){
                reviewComplaint.coID[i] = $scope.cmsDailyReportList[i].coID;
            }

            $http.post('/updateComplaintReviewDaily', reviewComplaint).then(function (response) {
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    $route.reload();
                } else {
                    $scope.notify("error", "There are some ERROR reviewing the complaint");
                }
            });
        }
    }

    $scope.setupLGKPI = function(){
        
        for(var i = 0;i < $scope.cmsDailyReportList.length; i++){
            if($scope.cmsDailyReportList[i].statusDate != null && $scope.cmsDailyReportList[i].statusTime != null && $scope.cmsDailyReportList[i].complaintDate != null && $scope.cmsDailyReportList[i].complaintTime != null){
                console.log($scope.cmsDailyReportList[i]);
                var lgKPI = lgKPIFunc($scope.cmsDailyReportList[i].statusDate, $scope.cmsDailyReportList[i].statusTime, $scope.cmsDailyReportList[i].complaintDate, $scope.cmsDailyReportList[i].complaintTime);
                var lgKPIAchieve = 'A';
                if(lgKPI.split(":")[0] > 6){
                    lgKPIAchieve = 'N';
                }else if(lgKPI == 'N/A'){
                    lgKPIAchieve = 'E';
                }
                $scope.cmsDailyReportList[i].lgKPI = lgKPI;
                $scope.cmsDailyReportList[i].lgKPIAchieve = lgKPIAchieve;

                console.log($scope.cmsDailyReportList[i].lgKPI);
                console.log($scope.cmsDailyReportList[i].lgKPIAchieve);
                $http.post('/setupLGKPI', {"coID": $scope.cmsDailyReportList[i].coID, "lgKPI":  $scope.cmsDailyReportList[i].lgKPI, "lgKPIAchieve": $scope.cmsDailyReportList[i].lgKPIAchieve}).then(function(response){
                    console.log("abc");
                })
            }
        }
    }

});

app.controller('complaintscmsBDQOPController', function($scope, $filter, $http){
    'use strict';


    var datevar = new Date();
    $scope.obj = {
        'year': '',
        'month': '',
        'zon': 'KCH',
        'startDate': '',
        'endDate': ''
    }
    $scope.obj.year = new Date().getFullYear();
    $scope.obj.month = new Date().getMonth().toString();
    $scope.showBDRemarks = false;

    $scope.objChange = function(){

        $scope.firstMW = 0;
        $scope.firstRoro = 0;
        $scope.firstSW = 0;
        $scope.firstMWAchieved = 0;
        $scope.firstRoroAchieved = 0;
        $scope.firstSWAchieved = 0;
        $scope.firstMWNotAchieved = 0;
        $scope.firstRoroNotAchieved = 0;
        $scope.firstSWNotAchieved = 0;
        $scope.firstMWBDRemarks = 0;
        
        $scope.secondMW = 0;
        $scope.secondRoro = 0;
        $scope.secondSW = 0;
        $scope.secondMWAchieved = 0;
        $scope.secondRoroAchieved = 0;
        $scope.secondSWAchieved = 0;
        $scope.secondMWNotAchieved = 0;
        $scope.secondRoroNotAchieved = 0;
        $scope.secondSWNotAchieved = 0;
        $scope.secondMWBDRemarks = 0;

        $scope.thirdMW = 0;
        $scope.thirdRoro = 0;
        $scope.thirdSW = 0;
        $scope.thirdMWAchieved = 0;
        $scope.thirdRoroAchieved = 0;
        $scope.thirdSWAchieved = 0;
        $scope.thirdMWNotAchieved = 0;
        $scope.thirdRoroNotAchieved = 0;
        $scope.thirdSWNotAchieved = 0;
        $scope.thirdMWBDRemarks = 0;

        $scope.fourthMW = 0;
        $scope.fourthRoro = 0;
        $scope.fourthSW = 0;
        $scope.fourthMWAchieved = 0;
        $scope.fourthRoroAchieved = 0;
        $scope.fourthSWAchieved = 0;
        $scope.fourthMWNotAchieved = 0;
        $scope.fourthRoroNotAchieved = 0;
        $scope.fourthSWNotAchieved = 0;
        $scope.fourthMWBDRemarks = 0;

        $scope.fifthMW = 0;
        $scope.fifthRoro = 0;
        $scope.fifthSW = 0;
        $scope.fifthMWAchieved = 0;
        $scope.fifthRoroAchieved = 0;
        $scope.fifthSWAchieved = 0;
        $scope.fifthMWNotAchieved = 0;
        $scope.fifthRoroNotAchieved = 0;
        $scope.fifthSWNotAchieved = 0;
        $scope.fifthMWBDRemarks = 0;

        $scope.obj.startDate = new Date(parseInt($scope.obj.year), parseInt($scope.obj.month), 1);
        $scope.obj.endDate = new Date(parseInt($scope.obj.year), parseInt($scope.obj.month) + 1, 0);

        var firstWeekLastDayDate = new Date();
        var secondWeekLastDayDate = new Date();
        var thirdWeekLastDayDate = new Date();
        var fourthWeekLastDayDate = new Date();
        var fifthWeekLastDayDate = new Date();
        var dateFlag = new Date();

        dateFlag.setFullYear($scope.obj.startDate.getFullYear());
        dateFlag.setMonth($scope.obj.startDate.getMonth(),$scope.obj.startDate.getDate());

        firstWeekLastDayDate.setFullYear($scope.obj.startDate.getFullYear());
        secondWeekLastDayDate.setFullYear($scope.obj.startDate.getFullYear());
        thirdWeekLastDayDate.setFullYear($scope.obj.startDate.getFullYear());
        fourthWeekLastDayDate.setFullYear($scope.obj.startDate.getFullYear());
        fifthWeekLastDayDate.setFullYear($scope.obj.startDate.getFullYear());

        firstWeekLastDayDate.setMonth($scope.obj.startDate.getMonth(),1);
        secondWeekLastDayDate.setMonth($scope.obj.startDate.getMonth(),1);
        thirdWeekLastDayDate.setMonth($scope.obj.startDate.getMonth(),1);
        fourthWeekLastDayDate.setMonth($scope.obj.startDate.getMonth(),1);
        fifthWeekLastDayDate.setMonth($scope.obj.startDate.getMonth(),1);

        for(var w=0; w<7; w++){
            if(dateFlag.getDay() == 0){
                if(w == 0){
                    firstWeekLastDayDate.setDate(dateFlag.getDate() + 7);
                }else{
                    firstWeekLastDayDate.setDate(dateFlag.getDate());
                }
                break;
            }
            dateFlag.setDate(dateFlag.getDate() + 1);
        }
        secondWeekLastDayDate.setDate(firstWeekLastDayDate.getDate() + 7);
        thirdWeekLastDayDate.setDate(secondWeekLastDayDate.getDate() + 7);
        fourthWeekLastDayDate.setDate(thirdWeekLastDayDate.getDate() + 7);
        fifthWeekLastDayDate.setDate($scope.obj.endDate.getDate());

        $scope.firstWeekStart = $filter('date')($scope.obj.startDate, "yyyy-MM-dd");
        $scope.firstWeekEnd = $filter('date')(firstWeekLastDayDate, "yyyy-MM-dd");   
        $scope.secondWeekStart = $filter('date')(new Date(firstWeekLastDayDate).setDate(firstWeekLastDayDate.getDate() + 1), "yyyy-MM-dd");
        $scope.secondWeekEnd = $filter('date')(secondWeekLastDayDate, "yyyy-MM-dd");
        $scope.thirdWeekStart = $filter('date')(new Date(secondWeekLastDayDate).setDate(secondWeekLastDayDate.getDate() + 1), "yyyy-MM-dd");
        $scope.thirdWeekEnd = $filter('date')(thirdWeekLastDayDate, "yyyy-MM-dd");
        $scope.fourthWeekStart = $filter('date')(new Date(thirdWeekLastDayDate).setDate(thirdWeekLastDayDate.getDate() + 1), "yyyy-MM-dd");
        $scope.fourthWeekEnd = $filter('date')(fourthWeekLastDayDate, "yyyy-MM-dd");
        $scope.fifthWeekStart = $filter('date')(new Date(fourthWeekLastDayDate).setDate(fourthWeekLastDayDate.getDate() + 1), "yyyy-MM-dd");
        $scope.fifthWeekEnd = $filter('date')(fifthWeekLastDayDate, "yyyy-MM-dd");
        
        $http.post('/getCMSQOP', $scope.obj).then(function(response){
            
            for(var i =0; i<response.data.length; i++){
                var compDate = new Date($filter('date')(response.data[i].complaintDate, "yyyy-MM-dd"));
                
                if(compDate >= $scope.obj.startDate && compDate <= firstWeekLastDayDate){
                    if(response.data[i].services == '1'){
                        $scope.firstMW += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.firstMWAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.firstMWNotAchieved += 1;
                        }
                        if(response.data[i].bdRemarks != ""){
                            $scope.firstMWBDRemarks += 1;
                            $scope.showBDRemarks = true;
                        }
                    }else if(response.data[i].services == '2'){
                        $scope.firstRoro += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.firstRoroAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.firstRoroNotAchieved += 1;
                        }
                    }else if(response.data[i].services == '3'){
                        $scope.firstSW += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.firstSWAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.firstSWNotAchieved += 1;
                        }
                    }            
                    
                }else if(compDate > firstWeekLastDayDate && compDate <= secondWeekLastDayDate){
                    if(response.data[i].services == '1'){
                        $scope.secondMW += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.secondMWAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.secondMWNotAchieved += 1;
                        }
                        if(response.data[i].bdRemarks != ""){
                            $scope.secondMWBDRemarks += 1;
                            $scope.showBDRemarks = true;
                        }
                    }else if(response.data[i].services == '2'){
                        $scope.secondRoro += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.secondRoroAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.secondRoroNotAchieved += 1;
                        }
                    }else if(response.data[i].services == '3'){
                        $scope.secondSW += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.secondSWAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.secondSWNotAchieved += 1;
                        }
                    }    
                }else if(compDate > secondWeekLastDayDate && compDate <= thirdWeekLastDayDate){
                    if(response.data[i].services == '1'){
                        $scope.thirdMW += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.thirdMWAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.thirdMWNotAchieved += 1;
                        }
                        if(response.data[i].bdRemarks != ""){
                            $scope.thirdMWBDRemarks += 1;
                            $scope.showBDRemarks = true;
                        }
                    }else if(response.data[i].services == '2'){
                        $scope.thirdRoro += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.thirdRoroAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.thirdRoroNotAchieved += 1;
                        }
                    }else if(response.data[i].services == '3'){
                        $scope.thirdSW += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.thirdSWAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.thirdSWNotAchieved += 1;
                        }
                    }    
                }else if(compDate > thirdWeekLastDayDate && compDate <= fourthWeekLastDayDate){
                    if(response.data[i].services == '1'){
                        $scope.fourthMW += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.fourthMWAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.fourthMWNotAchieved += 1;
                        }
                        if(response.data[i].bdRemarks != ""){
                            $scope.fourthMWBDRemarks += 1;
                            $scope.showBDRemarks = true;
                        }
                    }else if(response.data[i].services == '2'){
                        $scope.fourthRoro += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.fourthRoroAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.fourthRoroNotAchieved += 1;
                        }
                    }else if(response.data[i].services == '3'){
                        $scope.fourthSW += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.fourthSWAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.fourthSWNotAchieved += 1;
                        }
                    }    
                }else if(compDate > fourthWeekLastDayDate && compDate <= fifthWeekLastDayDate){
                    if(response.data[i].services == '1'){
                        $scope.fifthMW += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.fifthMWAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.fifthMWNotAchieved += 1;
                        }
                        if(response.data[i].bdRemarks != ""){
                            $scope.fifthMWBDRemarks += 1;
                            $scope.showBDRemarks = true;
                        }
                    }else if(response.data[i].services == '2'){
                        $scope.fifthRoro += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.fifthRoroAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.fifthRoroNotAchieved += 1;
                        }
                    }else if(response.data[i].services == '3'){
                        $scope.fifthSW += 1;
                        if(response.data[i].bdKPIAchieve == 'A'){
                            $scope.fifthSWAchieved += 1;
                        }else if(response.data[i].bdKPIAchieve == 'N'){
                            $scope.fifthSWNotAchieved += 1;
                        }
                    }    
                }
            }
        });
    }
});

app.controller('complaintscmsBDStatisticsController', function($scope, $filter, $http){
    'use strict';

    var datevar = new Date();
    $scope.obj = {
        'startDate': '',
        'endDate': '',
        'zon': 'KCH'
    }
    $scope.obj.startDate = new Date(datevar.getFullYear(), datevar.getMonth(), 1);
    $scope.obj.endDate = new Date(datevar.getFullYear(), datevar.getMonth() + 1, 0);
    $("[data-toggle=popover]").popover({
        html:true
    });
    $scope.requestStatistics = function(obj){
        $http.post("/getCmsBDStatisticsMW", obj).then(function(response){
            $scope.mwData = response.data;
        });
        $http.post("/getCmsBDStatisticsRoro", obj).then(function(response){
            $scope.roroData = response.data;
        });
        $http.post("/getCmsBDStatisticsSW", obj).then(function(response){
            $scope.swData = response.data;
        });

        $http.post("/getCmsSource", obj).then(function(response){
            $scope.source = response.data;
        });

        $scope.tsCount = 0;
        $scope.mpCount = 0;
        $scope.takCount = 0;
        $scope.roroTSCount = 0;
        $scope.roroMPCount = 0;
        $scope.roroTAKCount = 0;
        $scope.totalROROCount = 0;
        $scope.mbksCount = 0;
        $scope.dbkuCount = 0;
        $scope.mppCount = 0;
        $scope.mdsCount = 0;
        $scope.validMWCount = 0;
        $scope.validROROCount = 0;
        $scope.validScheduledCount = 0;
        $scope.invalidCount = 0;
        $scope.missColCountTS = 0;
        $scope.shortageMPCountTS = 0;
        $scope.truckBDCountTS = 0;
        $scope.truckFullCountTS = 0;
        $scope.binNSBCountTS = 0;
        $scope.lechateCountTS = 0;
        $scope.otherCountTS = 0;
        $scope.spillageCountTS = 0;
        $scope.notWearingPPECountTS = 0;
        $scope.roroTruckBDCountTS = 0;
        $scope.roroShortageMPCountTS = 0;
        $scope.roroNotWearingPPECountTS = 0;
        $scope.roroShortageOfContainterTS = 0;
        $scope.roroOtherCountTS = 0;
        $scope.swTruckBDCountTS = 0;
        $scope.swShortageMPCountTS = 0;
        $scope.swIncompleteDocCountTS = 0;
        $scope.swSpillageCountTS = 0;
        $scope.swNotWearingPPECountTS = 0;
        $scope.swOtherCountTS = 0;
        $scope.missColCountMP = 0;
        $scope.shortageMPCountMP = 0;
        $scope.truckBDCountMP = 0;
        $scope.truckFullCountMP = 0;
        $scope.binNSBCountMP = 0;
        $scope.lechateCountMP = 0;
        $scope.otherCountMP = 0;
        $scope.spillageCountMP = 0;
        $scope.notWearingPPECountMP = 0;
        $scope.roroTruckBDCountMP = 0;
        $scope.roroShortageMPCountMP = 0;
        $scope.roroNotWearingPPECountMP = 0;
        $scope.roroShortageOfContainterMP = 0;
        $scope.roroOtherCountMP = 0;
        $scope.swTruckBDCountMP = 0;
        $scope.swShortageMPCountMP = 0;
        $scope.swIncompleteDocCountMP = 0;
        $scope.swSpillageCountMP = 0;
        $scope.swNotWearingPPECountMP = 0;
        $scope.swOtherCountMP = 0;
        $scope.missColCountTAK = 0;
        $scope.shortageMPCountTAK = 0;
        $scope.truckBDCountTAK = 0;
        $scope.truckFullCountTAK = 0;
        $scope.binNSBCountTAK = 0;
        $scope.lechateCountTAK = 0;
        $scope.otherCountTAK = 0;
        $scope.spillageCountTAK = 0;
        $scope.notWearingPPECountTAK = 0;
        $scope.roroTruckBDCountTAK = 0;
        $scope.roroShortageMPCountTAK = 0;
        $scope.roroNotWearingPPECountTAK = 0;
        $scope.roroShortageOfContainterTAK = 0;
        $scope.roroOtherCountTAK = 0;
        $scope.swTruckBDCountTAK = 0;
        $scope.swShortageMPCountTAK = 0;
        $scope.swIncompleteDocCountTAK = 0;
        $scope.swSpillageCountTAK = 0;
        $scope.swNotWearingPPECountTAK = 0;
        $scope.swOtherCountTAK = 0;
        $scope.missColCountOther = 0;
        $scope.shortageMPCountOther = 0;
        $scope.truckBDCountOther = 0;
        $scope.truckFullCountOther = 0
        $scope.binNSBCountOther = 0;
        $scope.lechateCountOther = 0;
        $scope.otherCountOther = 0;
        $scope.spillageCountOther = 0;
        $scope.notWearingPPECountOther = 0;
        $scope.roroTruckBDCountOther = 0;
        $scope.roroShortageMPCountOther = 0;
        $scope.roroNotWearingPPECountOther = 0;
        $scope.roroShortageOfContainterOther = 0;
        $scope.roroOtherCountOther = 0;
        $scope.swTruckBDCountOther = 0;
        $scope.swShortageMPCountOther = 0;
        $scope.swIncompleteDocCountOther = 0;
        $scope.swSpillageCountOther = 0;
        $scope.swNotWearingPPECountOther = 0;
        $scope.swOtherCountOther = 0;
        $scope.scheduledCount = 0;
        $scope.swTsCount = 0;
        $scope.swOtherCount = 0;
        $http.post('/getCmsStatistics', obj).then(function(response){
            var myData = response.data;
            $scope.tsCount = myData.tsCount;
            $scope.mpCount = myData.mpCount;
            $scope.takCount = myData.takCount;
            $scope.roroTSCount = myData.roroTSCount;
            $scope.roroMPCount = myData.roroMPCount;
            $scope.roroTAKCount = myData.roroTAKCount;
            $scope.totalROROCount = $scope.roroTSCount + $scope.roroMPCount + $scope.roroTAKCount;
            $scope.mbksCount = myData.mbksCount;
            $scope.dbkuCount = myData.dbkuCount;
            $scope.mppCount = myData.mppCount;
            $scope.mdsCount = myData.mdsCount;
            $scope.scheduledCount = myData.scheduledCount;
            $scope.swTsCount = myData.swTsCount;
            $scope.swOtherCount = myData.swOtherCount;
            $scope.scheduledCount = myData.scheduledCount;
            $scope.validMWCount = myData.validMWCount;
            $scope.validROROCount = myData.validROROCount;
            $scope.validScheduledCount = myData.validScheduledCount;
            $scope.invalidCount = myData.invalidCount;
            $scope.missColCountTS = myData.missColCountTS;
            $scope.shortageMPCountTS = myData.shortageMPCountTS;
            $scope.truckBDCountTS = myData.truckBDCountTS;
            $scope.truckFullCountTS = myData.truckFullCountTS;
            $scope.binNSBCountTS = myData.binNSBCountTS;
            $scope.lechateCountTS = myData.lechateCountTS;
            $scope.otherCountTS = myData.otherCountTS;
            $scope.spillageCountTS = myData.spillageCountTS;
            $scope.notWearingPPECountTS = myData.notWearingPPECountTS;
            $scope.roroTruckBDCountTS = myData.roroTruckBDCountTS;
            $scope.roroShortageMPCountTS = myData.roroShortageMPCountTS;
            $scope.roroNotWearingPPECountTS = myData.roroNotWearingPPECountTS;
            $scope.roroShortageOfContainterTS = myData.roroShortageOfContainterTS;
            $scope.roroOtherCountTS = myData.roroOtherCountTS;
            $scope.swTruckBDCountTS = myData.swTruckBDCountTS;
            $scope.swShortageMPCountTS = myData.swShortageMPCountTS;
            $scope.swIncompleteDocCountTS = myData.swIncompleteDocCountTS;
            $scope.swSpillageCountTS = myData.swSpillageCountTS;
            $scope.swNotWearingPPECountTS = myData.swNotWearingPPECountTS;
            $scope.swOtherCountTS = myData.swOtherCountTS;
            $scope.missColCountMP = myData.missColCountMP;
            $scope.shortageMPCountMP = myData.shortageMPCountMP;
            $scope.truckBDCountMP = myData.truckBDCountMP;
            $scope.truckFullCountMP = myData.truckFullCountMP;
            $scope.binNSBCountMP = myData.binNSBCountMP;
            $scope.lechateCountMP = myData.lechateCountMP;
            $scope.otherCountMP = myData.otherCountMP;
            $scope.spillageCountMP = myData.spillageCountMP;
            $scope.notWearingPPECountMP = myData.notWearingPPECountMP;
            $scope.roroTruckBDCountMP = myData.roroTruckBDCountMP;
            $scope.roroShortageMPCountMP = myData.roroShortageMPCountMP;
            $scope.roroNotWearingPPECountMP = myData.roroNotWearingPPECountMP;
            $scope.roroShortageOfContainterMP = myData.roroShortageOfContainterMP;
            $scope.roroOtherCountMP = myData.roroOtherCountMP;
            $scope.swTruckBDCountMP = myData.swTruckBDCountMP;
            $scope.swShortageMPCountMP = myData.swShortageMPCountMP;
            $scope.swIncompleteDocCountMP = myData.swIncompleteDocCountMP;
            $scope.swSpillageCountMP = myData.swSpillageCountMP;
            $scope.swNotWearingPPECountMP = myData.swNotWearingPPECountMP;
            $scope.swOtherCountMP = myData.swOtherCountMP;
            $scope.missColCountTAK = myData.missColCountTAK;
            $scope.shortageMPCountTAK = myData.shortageMPCountTAK;
            $scope.truckBDCountTAK = myData.truckBDCountTAK;
            $scope.truckFullCountTAK = myData.truckFullCountTAK;
            $scope.binNSBCountTAK = myData.binNSBCountTAK;
            $scope.lechateCountTAK = myData.lechateCountTAK;
            $scope.otherCountTAK = myData.otherCountTAK;
            $scope.spillageCountTAK = myData.spillageCountTAK;
            $scope.notWearingPPECountTAK = myData.notWearingPPECountTAK;
            $scope.roroTruckBDCountTAK = myData.roroTruckBDCountTAK;
            $scope.roroShortageMPCountTAK = myData.roroShortageMPCountTAK;
            $scope.roroNotWearingPPECountTAK = myData.roroNotWearingPPECountTAK;
            $scope.roroShortageOfContainterTAK = myData.roroShortageOfContainterTAK;
            $scope.roroOtherCountTAK = myData.roroOtherCountTAK;
            $scope.swTruckBDCountTAK = myData.swTruckBDCountTAK;
            $scope.swShortageMPCountTAK = myData.swShortageMPCountTAK;
            $scope.swIncompleteDocCountTAK = myData.swIncompleteDocCountTAK;
            $scope.swSpillageCountTAK = myData.swSpillageCountTAK;
            $scope.swNotWearingPPECountTAK = myData.swNotWearingPPECountTAK;
            $scope.swOtherCountTAK = myData.swOtherCountTAK;
            $scope.missColCountOther = myData.missColCountOther;
            $scope.shortageMPCountOther = myData.shortageMPCountOther;
            $scope.truckBDCountOther = myData.truckBDCountOther;
            $scope.truckFullCountOther = myData.truckFullCountOther;
            $scope.binNSBCountOther = myData.binNSBCountOther;
            $scope.lechateCountOther = myData.lechateCountOther;
            $scope.otherCountOther = myData.otherCountOther;
            $scope.spillageCountOther = myData.spillageCountOther;
            $scope.notWearingPPECountOther = myData.notWearingPPECountOther;
            $scope.roroTruckBDCountOther = myData.roroTruckBDCountOther;
            $scope.roroShortageMPCountOther = myData.roroShortageMPCountOther;
            $scope.roroNotWearingPPECountOther = myData.roroNotWearingPPECountOther;
            $scope.roroShortageOfContainterOther = myData.roroShortageOfContainterOther;
            $scope.roroOtherCountOther = myData.roroOtherCountOther;
            $scope.swTruckBDCountOther = myData.swTruckBDCountOther;
            $scope.swShortageMPCountOther = myData.swShortageMPCountOther;
            $scope.swIncompleteDocCountOther = myData.swIncompleteDocCountOther;
            $scope.swSpillageCountOther = myData.swSpillageCountOther;
            $scope.swNotWearingPPECountOther = myData.swNotWearingPPECountOther;
            $scope.swOtherCountOther = myData.swOtherCountOther;
        });

        $http.post('/getCmsStatisticsCategoryTruckBreakdown', obj).then(function(response){
            $scope.truckBreakDownRootCause = "";
            if(response.data.length == 0){
                $scope.truckBreakDownRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                $scope.truckBreakDownRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryTruckFull', obj).then(function(response){
            $scope.truckFullRootCause = "";
            if(response.data.length == 0){
                $scope.truckFullRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                var area = response.data[i].area.split(",")[1];
                $scope.truckFullRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + " - " + area + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryShortageManpower', obj).then(function(response){
            $scope.shortageManpowerRootCause = "";
            if(response.data.length == 0){
                $scope.shortageManpowerRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                var area = response.data[i].area.split(",")[1];
                $scope.shortageManpowerRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + " - " + area + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryWasteNotCollected', obj).then(function(response){
            $scope.wasteNotCollectedRootCause = "";
            if(response.data.length == 0){
                $scope.wasteNotCollectedRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                var area = response.data[i].area.split(",")[1];
                $scope.wasteNotCollectedRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + " - " + area  + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryBinNSB', obj).then(function(response){
            $scope.binNSBRootCause = "";
            if(response.data.length == 0){
                $scope.binNSBRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                var area = response.data[i].area.split(",")[1];
                $scope.binNSBRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + " - " + area + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryOther', obj).then(function(response){
            $scope.otherRootCause = "";
            if(response.data.length == 0){
                $scope.otherRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                $scope.otherRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryLeachate', obj).then(function(response){
            $scope.leachateRootCause = "";
            if(response.data.length == 0){
                $scope.leachateRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                var area = response.data[i].area.split(",")[1];
                $scope.leachateRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + " - " + area + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryRoroTruckBD', obj).then(function(response){
            $scope.roroRootCause = "";
            if(response.data.length == 0){
                $scope.roroRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                $scope.roroRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategorySWTruckBD', obj).then(function(response){
            $scope.swRootCause = "";
            if(response.data.length == 0){
                $scope.swRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                $scope.swRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategorySpillage', obj).then(function(response){
            $scope.spillageRootCause = "";
            if(response.data.length == 0){
                $scope.spillageRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                var area = response.data[i].area.split(",")[1];
                $scope.spillageRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + " - " + area + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryNotWearingPPE', obj).then(function(response){
            $scope.notWearingPPERootCause = "";
            if(response.data.length == 0){
                $scope.notWearingPPERootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                $scope.notWearingPPERootCause += compDate + " - " + response.data[i].forwardedSub + "<br />";
            }
        });

    }

    $scope.requestStatistics($scope.obj);

    $scope.objChange = function () {
        if ($scope.obj.startDate != undefined && $scope.obj.endDate != undefined && $scope.obj.startDate <= $scope.obj.endDate) {
            $scope.obj.endDate.setDate($scope.obj.endDate.getDate() + 1);
            $scope.requestStatistics($scope.obj);
        }
    }
});

app.controller('complaintcmsSubconDataController', function ($scope, $filter, $http, $window) {
    'use strict';

    var datevar = new Date();
    $scope.obj = {
        'startDate': '',
        'endDate': '',
        'zon': 'KCH'
    }
    $scope.obj.startDate = new Date(datevar.getFullYear(), datevar.getMonth(), 1);
    $scope.obj.endDate = new Date(datevar.getFullYear(), datevar.getMonth() + 1, 0);

    $scope.requestSubconPenaltyData = function(obj){
        $http.post('/getCMSSubconPenalty', obj).then(function(response){
            $scope.penaltyList = response.data;

            $scope.penaltyList.forEach( function(item, index){
                item.areaName = item.area.split(',')[1];
            })
            $scope.penaltyList.sort(function(a, b) {
                // return (a.areaName > b.areaName) ? 1 : ((a.areaName < b.areaName) ? -1 : 0);
                return a.subcon === b.subcon ? ((a.areaName > b.areaName) ? 1 : ((a.areaName < b.areaName) ? -1 : 0)) : a.subcon - b.subcon;
            });
            $scope.notify("success", "Data Loaded");
        });
        
    }


    $scope.requestSubconPenaltyData($scope.obj);

    $scope.objChange = function () {
        if ($scope.obj.startDate != undefined && $scope.obj.endDate != undefined && $scope.obj.startDate <= $scope.obj.endDate) {
            $scope.obj.endDate.setDate($scope.obj.endDate.getDate() + 1);
            $scope.requestSubconPenaltyData($scope.obj);
        }
    }
});

app.controller('complaintscmsStatisticsController', function($scope, $filter, $http){
    'use strict';

    var datevar = new Date();
    $scope.obj = {
        'startDate': '',
        'endDate': '',
        'zon': 'KCH'
    }
    $scope.obj.startDate = new Date(datevar.getFullYear(), datevar.getMonth(), 1);
    $scope.obj.endDate = new Date(datevar.getFullYear(), datevar.getMonth() + 1, 0);
    $("[data-toggle=popover]").popover({
        html:true
    });
    

    $scope.requestStatistics = function(obj){

        $scope.tsCount = 0;
        $scope.mpCount = 0;
        $scope.takCount = 0;
        $scope.roroTSCount = 0;
        $scope.roroMPCount = 0;
        $scope.roroTAKCount = 0;
        $scope.totalROROCount = 0;
        $scope.mbksCount = 0;
        $scope.dbkuCount = 0;
        $scope.mppCount = 0;
        $scope.mdsCount = 0;
        $scope.validMWCount = 0;
        $scope.validROROCount = 0;
        $scope.validScheduledCount = 0;
        $scope.invalidCount = 0;
        $scope.missColCountTS = 0;
        $scope.shortageMPCountTS = 0;
        $scope.truckBDCountTS = 0;
        $scope.truckFullCountTS = 0;
        $scope.binNSBCountTS = 0;
        $scope.lechateCountTS = 0;
        $scope.otherCountTS = 0;
        $scope.spillageCountTS = 0;
        $scope.notWearingPPECountTS = 0;
        $scope.roroTruckBDCountTS = 0;
        $scope.roroShortageMPCountTS = 0;
        $scope.roroNotWearingPPECountTS = 0;
        $scope.roroShortageOfContainterTS = 0;
        $scope.roroOtherCountTS = 0;
        $scope.swTruckBDCountTS = 0;
        $scope.swShortageMPCountTS = 0;
        $scope.swIncompleteDocCountTS = 0;
        $scope.swSpillageCountTS = 0;
        $scope.swNotWearingPPECountTS = 0;
        $scope.swOtherCountTS = 0;
        $scope.missColCountMP = 0;
        $scope.shortageMPCountMP = 0;
        $scope.truckBDCountMP = 0;
        $scope.truckFullCountMP = 0;
        $scope.binNSBCountMP = 0;
        $scope.lechateCountMP = 0;
        $scope.otherCountMP = 0;
        $scope.spillageCountMP = 0;
        $scope.notWearingPPECountMP = 0;
        $scope.roroTruckBDCountMP = 0;
        $scope.roroShortageMPCountMP = 0;
        $scope.roroNotWearingPPECountMP = 0;
        $scope.roroShortageOfContainterMP = 0;
        $scope.roroOtherCountMP = 0;
        $scope.swTruckBDCountMP = 0;
        $scope.swShortageMPCountMP = 0;
        $scope.swIncompleteDocCountMP = 0;
        $scope.swSpillageCountMP = 0;
        $scope.swNotWearingPPECountMP = 0;
        $scope.swOtherCountMP = 0;
        $scope.missColCountTAK = 0;
        $scope.shortageMPCountTAK = 0;
        $scope.truckBDCountTAK = 0;
        $scope.truckFullCountTAK = 0;
        $scope.binNSBCountTAK = 0;
        $scope.lechateCountTAK = 0;
        $scope.otherCountTAK = 0;
        $scope.spillageCountTAK = 0;
        $scope.notWearingPPECountTAK = 0;
        $scope.roroTruckBDCountTAK = 0;
        $scope.roroShortageMPCountTAK = 0;
        $scope.roroNotWearingPPECountTAK = 0;
        $scope.roroShortageOfContainterTAK = 0;
        $scope.roroOtherCountTAK = 0;
        $scope.swTruckBDCountTAK = 0;
        $scope.swShortageMPCountTAK = 0;
        $scope.swIncompleteDocCountTAK = 0;
        $scope.swSpillageCountTAK = 0;
        $scope.swNotWearingPPECountTAK = 0;
        $scope.swOtherCountTAK = 0;
        $scope.missColCountOther = 0;
        $scope.shortageMPCountOther = 0;
        $scope.truckBDCountOther = 0;
        $scope.truckFullCountOther = 0
        $scope.binNSBCountOther = 0;
        $scope.lechateCountOther = 0;
        $scope.otherCountOther = 0;
        $scope.spillageCountOther = 0;
        $scope.notWearingPPECountOther = 0;
        $scope.roroTruckBDCountOther = 0;
        $scope.roroShortageMPCountOther = 0;
        $scope.roroNotWearingPPECountOther = 0;
        $scope.roroShortageOfContainterOther = 0;
        $scope.roroOtherCountOther = 0;
        $scope.swTruckBDCountOther = 0;
        $scope.swShortageMPCountOther = 0;
        $scope.swIncompleteDocCountOther = 0;
        $scope.swSpillageCountOther = 0;
        $scope.swNotWearingPPECountOther = 0;
        $scope.swOtherCountOther = 0;
        $scope.scheduledCount = 0;
        $scope.swTsCount = 0;
        $scope.swOtherCount = 0;
        $http.post('/getCmsStatistics', obj).then(function(response){
            var myData = response.data;
            $scope.tsCount = myData.tsCount;
            $scope.mpCount = myData.mpCount;
            $scope.takCount = myData.takCount;
            $scope.roroTSCount = myData.roroTSCount;
            $scope.roroMPCount = myData.roroMPCount;
            $scope.roroTAKCount = myData.roroTAKCount;
            $scope.totalROROCount = $scope.roroTSCount + $scope.roroMPCount + $scope.roroTAKCount;
            $scope.mbksCount = myData.mbksCount;
            $scope.dbkuCount = myData.dbkuCount;
            $scope.mppCount = myData.mppCount;
            $scope.mdsCount = myData.mdsCount;
            $scope.scheduledCount = myData.scheduledCount;
            $scope.swTsCount = myData.swTsCount;
            $scope.swOtherCount = myData.swOtherCount;
            $scope.scheduledCount = myData.scheduledCount;
            $scope.validMWCount = myData.validMWCount;
            $scope.validROROCount = myData.validROROCount;
            $scope.validScheduledCount = myData.validScheduledCount;
            $scope.invalidCount = myData.invalidCount;
            $scope.missColCountTS = myData.missColCountTS;
            $scope.shortageMPCountTS = myData.shortageMPCountTS;
            $scope.truckBDCountTS = myData.truckBDCountTS;
            $scope.truckFullCountTS = myData.truckFullCountTS;
            $scope.binNSBCountTS = myData.binNSBCountTS;
            $scope.lechateCountTS = myData.lechateCountTS;
            $scope.otherCountTS = myData.otherCountTS;
            $scope.spillageCountTS = myData.spillageCountTS;
            $scope.notWearingPPECountTS = myData.notWearingPPECountTS;
            $scope.roroTruckBDCountTS = myData.roroTruckBDCountTS;
            $scope.roroShortageMPCountTS = myData.roroShortageMPCountTS;
            $scope.roroNotWearingPPECountTS = myData.roroNotWearingPPECountTS;
            $scope.roroShortageOfContainterTS = myData.roroShortageOfContainterTS;
            $scope.roroOtherCountTS = myData.roroOtherCountTS;
            $scope.swTruckBDCountTS = myData.swTruckBDCountTS;
            $scope.swShortageMPCountTS = myData.swShortageMPCountTS;
            $scope.swIncompleteDocCountTS = myData.swIncompleteDocCountTS;
            $scope.swSpillageCountTS = myData.swSpillageCountTS;
            $scope.swNotWearingPPECountTS = myData.swNotWearingPPECountTS;
            $scope.swOtherCountTS = myData.swOtherCountTS;
            $scope.missColCountMP = myData.missColCountMP;
            $scope.shortageMPCountMP = myData.shortageMPCountMP;
            $scope.truckBDCountMP = myData.truckBDCountMP;
            $scope.truckFullCountMP = myData.truckFullCountMP;
            $scope.binNSBCountMP = myData.binNSBCountMP;
            $scope.lechateCountMP = myData.lechateCountMP;
            $scope.otherCountMP = myData.otherCountMP;
            $scope.spillageCountMP = myData.spillageCountMP;
            $scope.notWearingPPECountMP = myData.notWearingPPECountMP;
            $scope.roroTruckBDCountMP = myData.roroTruckBDCountMP;
            $scope.roroShortageMPCountMP = myData.roroShortageMPCountMP;
            $scope.roroNotWearingPPECountMP = myData.roroNotWearingPPECountMP;
            $scope.roroShortageOfContainterMP = myData.roroShortageOfContainterMP;
            $scope.roroOtherCountMP = myData.roroOtherCountMP;
            $scope.swTruckBDCountMP = myData.swTruckBDCountMP;
            $scope.swShortageMPCountMP = myData.swShortageMPCountMP;
            $scope.swIncompleteDocCountMP = myData.swIncompleteDocCountMP;
            $scope.swSpillageCountMP = myData.swSpillageCountMP;
            $scope.swNotWearingPPECountMP = myData.swNotWearingPPECountMP;
            $scope.swOtherCountMP = myData.swOtherCountMP;
            $scope.missColCountTAK = myData.missColCountTAK;
            $scope.shortageMPCountTAK = myData.shortageMPCountTAK;
            $scope.truckBDCountTAK = myData.truckBDCountTAK;
            $scope.truckFullCountTAK = myData.truckFullCountTAK;
            $scope.binNSBCountTAK = myData.binNSBCountTAK;
            $scope.lechateCountTAK = myData.lechateCountTAK;
            $scope.otherCountTAK = myData.otherCountTAK;
            $scope.spillageCountTAK = myData.spillageCountTAK;
            $scope.notWearingPPECountTAK = myData.notWearingPPECountTAK;
            $scope.roroTruckBDCountTAK = myData.roroTruckBDCountTAK;
            $scope.roroShortageMPCountTAK = myData.roroShortageMPCountTAK;
            $scope.roroNotWearingPPECountTAK = myData.roroNotWearingPPECountTAK;
            $scope.roroShortageOfContainterTAK = myData.roroShortageOfContainterTAK;
            $scope.roroOtherCountTAK = myData.roroOtherCountTAK;
            $scope.swTruckBDCountTAK = myData.swTruckBDCountTAK;
            $scope.swShortageMPCountTAK = myData.swShortageMPCountTAK;
            $scope.swIncompleteDocCountTAK = myData.swIncompleteDocCountTAK;
            $scope.swSpillageCountTAK = myData.swSpillageCountTAK;
            $scope.swNotWearingPPECountTAK = myData.swNotWearingPPECountTAK;
            $scope.swOtherCountTAK = myData.swOtherCountTAK;
            $scope.missColCountOther = myData.missColCountOther;
            $scope.shortageMPCountOther = myData.shortageMPCountOther;
            $scope.truckBDCountOther = myData.truckBDCountOther;
            $scope.truckFullCountOther = myData.truckFullCountOther;
            $scope.binNSBCountOther = myData.binNSBCountOther;
            $scope.lechateCountOther = myData.lechateCountOther;
            $scope.otherCountOther = myData.otherCountOther;
            $scope.spillageCountOther = myData.spillageCountOther;
            $scope.notWearingPPECountOther = myData.notWearingPPECountOther;
            $scope.roroTruckBDCountOther = myData.roroTruckBDCountOther;
            $scope.roroShortageMPCountOther = myData.roroShortageMPCountOther;
            $scope.roroNotWearingPPECountOther = myData.roroNotWearingPPECountOther;
            $scope.roroShortageOfContainterOther = myData.roroShortageOfContainterOther;
            $scope.roroOtherCountOther = myData.roroOtherCountOther;
            $scope.swTruckBDCountOther = myData.swTruckBDCountOther;
            $scope.swShortageMPCountOther = myData.swShortageMPCountOther;
            $scope.swIncompleteDocCountOther = myData.swIncompleteDocCountOther;
            $scope.swSpillageCountOther = myData.swSpillageCountOther;
            $scope.swNotWearingPPECountOther = myData.swNotWearingPPECountOther;
            $scope.swOtherCountOther = myData.swOtherCountOther;
        });

        $http.post('/getCmsStatisticsCategoryTruckBreakdown', obj).then(function(response){
            $scope.truckBreakDownRootCause = "";
            if(response.data.length == 0){
                $scope.truckBreakDownRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                $scope.truckBreakDownRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryTruckFull', obj).then(function(response){
            $scope.truckFullRootCause = "";
            if(response.data.length == 0){
                $scope.truckFullRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                var area = response.data[i].area.split(",")[1];
                $scope.truckFullRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + " - " + area + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryShortageManpower', obj).then(function(response){
            $scope.shortageManpowerRootCause = "";
            if(response.data.length == 0){
                $scope.shortageManpowerRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                var area = response.data[i].area.split(",")[1];
                $scope.shortageManpowerRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + " - " + area + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryWasteNotCollected', obj).then(function(response){
            $scope.wasteNotCollectedRootCause = "";
            if(response.data.length == 0){
                $scope.wasteNotCollectedRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                var area = response.data[i].area.split(",")[1];
                $scope.wasteNotCollectedRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + " - " + area  + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryBinNSB', obj).then(function(response){
            $scope.binNSBRootCause = "";
            if(response.data.length == 0){
                $scope.binNSBRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                var area = response.data[i].area.split(",")[1];
                $scope.binNSBRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + " - " + area + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryOther', obj).then(function(response){
            $scope.otherRootCause = "";
            if(response.data.length == 0){
                $scope.otherRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                $scope.otherRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryLeachate', obj).then(function(response){
            $scope.leachateRootCause = "";
            if(response.data.length == 0){
                $scope.leachateRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                var area = response.data[i].area.split(",")[1];
                $scope.leachateRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + " - " + area + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryRoroTruckBD', obj).then(function(response){
            $scope.roroRootCause = "";
            if(response.data.length == 0){
                $scope.roroRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                $scope.roroRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategorySWTruckBD', obj).then(function(response){
            $scope.swRootCause = "";
            if(response.data.length == 0){
                $scope.swRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                $scope.swRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategorySpillage', obj).then(function(response){
            $scope.spillageRootCause = "";
            if(response.data.length == 0){
                $scope.spillageRootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                var area = response.data[i].area.split(",")[1];
                $scope.spillageRootCause += compDate + " - " + response.data[i].forwardedSub + " - " + response.data[i].truck + " - " + area + "<br />";
            }
        });

        $http.post('/getCmsStatisticsCategoryNotWearingPPE', obj).then(function(response){
            $scope.notWearingPPERootCause = "";
            if(response.data.length == 0){
                $scope.notWearingPPERootCause = "N/A";
            }
            for(var i=0; i<response.data.length; i++){
                var compDate = $filter('date')(response.data[i].complaintDate, "yyyy-MM-dd");
                $scope.notWearingPPERootCause += compDate + " - " + response.data[i].forwardedSub + "<br />";
            }
        });

    }

    $scope.requestStatistics($scope.obj);

    $scope.objChange = function () {
        if ($scope.obj.startDate != undefined && $scope.obj.endDate != undefined && $scope.obj.startDate <= $scope.obj.endDate) {
            $scope.obj.endDate.setDate($scope.obj.endDate.getDate() + 1);
            $scope.requestStatistics($scope.obj);
        }

    }
});

app.controller('cmsDatasheetController', function($scope, $filter, $http, $window){
    'use strict';
    var datevar = new Date();
    $scope.obj = {
        'startDate': '',
        'endDate': '',
        'services': '1',
        'zon': 'KCH'
    }
    $scope.obj.startDate = new Date(datevar.getFullYear(), datevar.getMonth(), 1);
    $scope.obj.endDate = new Date(datevar.getFullYear(), datevar.getMonth() + 1, 0);

    $scope.cmsDataSheet = [];

    $scope.request = function(obj){

        $http.post('/getCmsDatasheet', obj).then(function(response){
            
            $scope.cmsDataSheet = response.data;
            var splitType = "";
            var splitTypeContent = "";
            var splitTypeSpecialContent = ""; 
            var filterAddCount = 0;
            $scope.noTS = 0;
            $scope.noMP = 0;
            $scope.noTAK = 0;

            for(var i=0; i<$scope.cmsDataSheet.length; i++){
                $scope.cmsDataSheet[i].complaintDate = $filter('date')($scope.cmsDataSheet[i].complaintDate, 'yyyy-MM-dd');
                $scope.cmsDataSheet[i].customerDate = $filter('date')($scope.cmsDataSheet[i].customerDate, 'yyyy-MM-dd');

                //formulate for subcon column
                if($scope.cmsDataSheet[i].subcon == "Trienekens"){
                    $scope.cmsDataSheet[i].ts = "1";
                    $scope.cmsDataSheet[i].mp = "-";
                    $scope.cmsDataSheet[i].tak = "-";
                }else if($scope.cmsDataSheet[i].subcon == "Mega Power"){
                    $scope.cmsDataSheet[i].ts = "-";
                    $scope.cmsDataSheet[i].mp = "1";
                    $scope.cmsDataSheet[i].tak = "-";
                }else if($scope.cmsDataSheet[i].subcon == "TAK"){
                    $scope.cmsDataSheet[i].ts = "-";
                    $scope.cmsDataSheet[i].mp = "-";
                    $scope.cmsDataSheet[i].tak = "1";
                }

                //formulate for area code
                if($scope.cmsDataSheet[i].area != null){
                    $scope.cmsDataSheet[i].area = $scope.cmsDataSheet[i].area.split(",")[1];
                }

                //formulate value for type of complaint
                $scope.detailType = "";
                $scope.detailTypeCode2 = "";
                splitType = $scope.cmsDataSheet[i].type.split(":,:");
                for (var n = 0; n < splitType.length; n++) {
                    if (splitType[n].length > 3) {
                        splitTypeSpecialContent = splitType[n].split(":::::");
                        if (splitTypeSpecialContent[0] == '1') {
                            splitTypeSpecialContent[2] = "Waste not collected for " + splitTypeSpecialContent[1] + " days";
                            $scope.detailTypeCode2 += "a";
                        } else if (splitTypeSpecialContent[0] == '12' || splitTypeSpecialContent[0] == '13' || splitTypeSpecialContent[0] == '14') {
                            splitTypeSpecialContent[2] = "Others";
                            if(splitTypeSpecialContent[0] == '12'){
                                $scope.detailTypeCode2 += "l";
                            }else if(splitTypeSpecialContent[0] == '13'){
                                $scope.detailTypeCode2 += "m";
                            }else if(splitTypeSpecialContent[0] == '14'){
                                $scope.detailTypeCode2 += "n";
                            }
                        }
                        $scope.detailType += splitTypeSpecialContent[2];
                    } else {
                        if (splitType[n] == '2') {
                            splitTypeContent = "Bin not pushed back to its original location";
                            $scope.detailTypeCode2 += "b";
                        } else if (splitType[n] == '3') {
                            splitTypeContent = "Spillage of waste";
                            $scope.detailTypeCode2 += "c";
                        } else if (splitType[n] == '4') {
                            splitTypeContent = "Spillage of leachate water";
                            $scope.detailTypeCode2 += "d";
                        } else if (splitType[n] == '5') {
                            splitTypeContent = "RoRo not sent";
                            $scope.detailTypeCode2 += "e";
                        } else if (splitType[n] == '6') {
                            splitTypeContent = "RoRo not exchanged";
                            $scope.detailTypeCode2 += "f";
                        } else if (splitType[n] == '7') {
                            splitTypeContent = "RoRo not pulled";
                            $scope.detailTypeCode2 += "g";
                        } else if (splitType[n] == '8') {
                            splitTypeContent = "RoRo not emptied";
                            $scope.detailTypeCode2 += "h";
                        } else if (splitType[n] == '9') {
                            splitTypeContent = "Schedule Waste not collected on time";
                            $scope.detailTypeCode2 += "i";
                        } else if (splitType[n] == '10') {
                            splitTypeContent = "Schedule Waste spillage during collection";
                            $scope.detailTypeCode2 += "j";
                        } else if (splitType[n] == '11') {
                            splitTypeContent = "Incomplete documents";
                            $scope.detailTypeCode2 += "k";
                        }
                        $scope.detailType += splitTypeContent;
                    }

                    if (n < (splitType.length - 1)) {
                        $scope.detailType += ", ";
                        $scope.detailTypeCode2 += ",";
                    }

                }
                $scope.cmsDataSheet[i].type = $scope.detailType;            
                $scope.cmsDataSheet[i].typeCode2 = $scope.detailTypeCode2;     
                //formulate value for waste collection date time
                if($scope.cmsDataSheet[i].wasteColDT == null){
                    $scope.cmsDataSheet[i].wasteColDT = '';
                }
                if($scope.cmsDataSheet[i].wasteColDT != ''){
                    var wasteArray = $scope.cmsDataSheet[i].wasteColDT.split(";");
                    $scope.cmsDataSheet[i].wcdSentences = "";
                    for(var c=0; c < wasteArray.length - 1; c++){
                        $scope.cmsDataSheet[i].wcdSentences += wasteArray[c].split(",")[0] + ".\n";
                    }  
                }else{
                    $scope.cmsDataSheet[i].wcdSentences = '-';
                }

                //filtering
                if($scope.cmsDataSheet[i].subcon == "Trienekens"){ $scope.noTS++; }
                if($scope.cmsDataSheet[i].subcon == "Mega Power"){ $scope.noMP++; }
                if($scope.cmsDataSheet[i].subcon == "TAK"){ $scope.noTAK++; }
            }
        });    
    }

    $scope.objChange = function () {
        if ($scope.obj.startDate != undefined && $scope.obj.endDate != undefined && $scope.obj.startDate <= $scope.obj.endDate) {
            $scope.obj.endDate.setDate($scope.obj.endDate.getDate() + 1);
            $scope.request($scope.obj);
        }

    }
    $scope.changeTypeCode = function(){
        console.log($scope.cmsDataSheet.length);
        for(var i = 0;i < $scope.cmsDataSheet.length; i++){
            $http.post('/changeCompTypeCode', {"coID": $scope.cmsDataSheet[i].coID, "typeCode": $scope.cmsDataSheet[i].typeCode2}).then(function(response){
                console.log("abc");
            })
        }
    }
    
    $scope.setupKPI = function(){
        
        for(var i = 0;i < $scope.cmsDataSheet.length; i++){
            if($scope.cmsDataSheet[i].customerDate != null && $scope.cmsDataSheet[i].customerTime != null && $scope.cmsDataSheet[i].complaintDate != null && $scope.cmsDataSheet[i].complaintTime != null){
                console.log($scope.cmsDataSheet[i]);
                var bdKPI = bdKPIFunc($scope.cmsDataSheet[i].customerDate, $scope.cmsDataSheet[i].customerTime, $scope.cmsDataSheet[i].complaintDate, $scope.cmsDataSheet[i].complaintTime);
                var bdKPIAchieve = 'A';
                if(bdKPI.split(":")[0] >= 24){
                    bdKPIAchieve = 'N';
                }else if(bdKPI == 'N/A'){
                    bdKPIAchieve = 'E';
                }
                $scope.cmsDataSheet[i].bdKPI = bdKPI;
                $scope.cmsDataSheet[i].bdKPIAchieve = bdKPIAchieve;
                $http.post('/setupBDKPI', {"coID": $scope.cmsDataSheet[i].coID, "bdKPI":  $scope.cmsDataSheet[i].bdKPI, "bdKPIAchieve": $scope.cmsDataSheet[i].bdKPIAchieve}).then(function(response){
                })
            }
        }
    }
});

app.controller('complaintDetailController', function ($scope, $http, $filter, $window, $routeParams, $route, storeDataService) {
    'use strict';
    $scope.showInchargeBtn = true;
    $scope.showUninchargeBtn = false;
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
    $scope.services = "";

    //get complaint detail refers on complaint id
    $http.post('/getComplaintDetail', $scope.req).then(function (response) {
        var complaint = response.data;
        $scope.comDetail = {
            'ctype': complaint[0].complaint,
            'services': complaint[0].premiseType,
            'company': complaint[0].premiseComp,
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
            'company': $scope.comDetail.company,
            'telNo': $scope.comDetail.telNo,
            'address': $scope.comDetail.address,
            'img': $scope.comDetail.img,
            'type': $scope.comDetail.ctype,
            'typeCode': '',
            'services': $scope.comDetail.services,
            'cmsStatus': '',
            'lgStatus': 'open',
            'bdStatus': 'open',
            'date': $filter('date')(new Date(), 'yyyy-MM-dd'),
            'time': $filter('date')(new Date(), 'HH:mm:ss'),
            "forwardLogisticsDate": $filter("date")(new Date(), 'yyyy-MM-dd'),
            "forwardLogisticsTime": $filter('date')(new Date(), 'HH:mm:ss'),
            "forwardLogisticsBy": $window.sessionStorage.getItem('owner'),
            "creationDate": $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            "zon": ''
        };

        if($scope.verify.company == "" || $scope.verify.company == null){
            $scope.verify.company = "Household";
        }

        if ($scope.comDetail.services == 1) {
            $scope.services = "Municipal waste";
        } 
        else if ($scope.comDetail.services == 2) {
            $scope.services = "Roro container";
        } 
        else if ($scope.comDetail.services == 3) {
            $scope.services = "Scheduled waste";
        }

        splitType = $scope.comDetail.ctype.split(":,:");
        for (var i = 0; i < splitType.length; i++) {
            if (splitType[i].length > 3) {
                splitTypeSpecialContent = splitType[i].split(":::::");
                if (splitTypeSpecialContent[0] == '1') {
                    splitTypeSpecialContent[2] = "Waste not collected (days)";
                    $scope.verify.typeCode += 'a,';
                } else if (splitTypeSpecialContent[0] == '12') {
                    splitTypeSpecialContent[2] = "Others(Municipal waste)";
                    $scope.verify.typeCode += 'l,';
                } else if (splitTypeSpecialContent[0] == '13') {
                    splitTypeSpecialContent[2] = "Others(Roro container)";
                    $scope.verify.typeCode += 'm,';
                } else if (splitTypeSpecialContent[0] == '14') {
                    splitTypeSpecialContent[2] = "Others(Scheduled waste)";
                    $scope.verify.typeCode += 'n,';
                }
                $scope.detailType += splitTypeSpecialContent[2] + ': ' + splitTypeSpecialContent[1];
            } else {
                if (splitType[i] == '2') {
                    splitTypeContent = "Bin not pushed back to its original location";
                    $scope.verify.typeCode += 'b,';
                } else if (splitType[i] == '3') {
                    splitTypeContent = "Spillage of waste";
                    $scope.verify.typeCode += 'c,';
                } else if (splitType[i] == '4') {
                    splitTypeContent = "Spillage of leachate water";
                    $scope.verify.typeCode += 'd,';
                } else if (splitType[i] == '5') {
                    splitTypeContent = "RoRo not sent";
                    $scope.verify.typeCode += 'e,';
                } else if (splitType[i] == '6') {
                    splitTypeContent = "RoRo not exchanged";
                    $scope.verify.typeCode += 'f,';
                } else if (splitType[i] == '7') {
                    splitTypeContent = "RoRo not pulled";
                    $scope.verify.typeCode += 'g,';
                } else if (splitType[i] == '8') {
                    splitTypeContent = "RoRo not emptied";
                    $scope.verify.typeCode += 'h,';
                } else if (splitType[i] == '9') {
                    splitTypeContent = "Waste not collected on time";
                    $scope.verify.typeCode += 'i,';
                } else if (splitType[i] == '10') {
                    splitTypeContent = "Spillage during collection";
                    $scope.verify.typeCode += 'j,';
                } else if (splitType[i] == '11') {
                    splitTypeContent = "Incomplete documents";
                    $scope.verify.typeCode += 'k,';
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
        $http.post('/getDateListForComplaint', $scope.req2).then(function (response) {
            $scope.reportList = response.data;
            $scope.showReference = ($scope.reportList.length == 0 ? false : true);
        });

        $http.post('/chatList', $scope.req).then(function (response) {
            var data = response.data;
            var position = '';

            $.each(data, function (key, value) {
                position = window.sessionStorage.getItem('owner') === value.sender ? "right" : "left";
                chatContent += '<div class="message ' + position + '"><div class="message-text">' + value.content + '<div class="message-time text-right"><small class="text-muted"><i class="fa fa-clock"></i> ' + value.creationDateTime + '</small></div></div></div>';
            });
            angular.element('.chat-box').html(chatContent);
            $('.chat-box').animate({
                scrollTop: $('.chat-box')[0].scrollHeight
            }, 0);
        });

        $scope.sendMessage = function () {
            $scope.message.content = $scope.mymsg;
            $scope.message.creationDateTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            console.log($scope.message);
            $http.post('/messageSend', $scope.message).then(function (response) {
                chatContent += '<div class="message right"><div class="message-text">' + $scope.message.content + '<div class="message-time text-right"><small class="text-muted"><i class="fa fa-clock"></i> ' + $filter('date')(new Date(), 'HH:mm') + '</small></div></div></div>';
                angular.element('.chat-box').html(chatContent);
                $('.chat-box').animate({
                    scrollTop: $('.chat-box')[0].scrollHeight
                }, 1000);
            });
            $scope.mymsg = '';
        };

        socket.on('new message', function (data) {
            var content = data.content,
                sender = data.sender,
                recipient = data.recipient,
                date = data.date,
                complaintID = data.complaintID;

            chatContent += '<div class="message left"><div class="message-text">' + content + '<div class="message-time text-right"><small class="text-muted"><i class="fa fa-clock"></i> ' + $filter('date')(new Date(), 'HH:mm') + '</small></div></div></div>';
            angular.element('.chat-box').html(chatContent);
            $('.chat-box').animate({
                scrollTop: $('.chat-box')[0].scrollHeight
            }, 1000);
            //lobi_notify('info', 'You received a new message.', 'From '+sender+'. Complaint ID: '+complaintID, '');
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

        if ($scope.comDetail.staffID == null) {
            $scope.showInchargeBtn = true;
            $scope.showUninchargeBtn = false;
        } else if ($scope.comDetail.staffID == window.sessionStorage.getItem('owner') || $scope.comDetail.staffID == null || window.sessionStorage.getItem('position') == "Administrator") {
            $scope.showInchargeBtn = false;
            $scope.showUninchargeBtn = true;
        } else {
            $scope.showInchargeBtn = false;
        }

        $scope.setNotApplicable = function(){
            var setAppStatus = {
                'stauts': 'i',
                'complaintID': $scope.comDetail.id
            }

            $http.post('/setAppNotApplicable', setAppStatus).then(function(response){
                if (response.data.status = "success") {
                    $scope.notify("success", "Status 'Invalid' has been update");
                    $route.reload();
                } else {
                    $scope.notify("error", "Update Status Error");
                }
            })

        }

        $scope.inchargeChat = function () {
            var staffID = {
                "staffID": window.sessionStorage.getItem('owner'),
                "complaintID": $routeParams.complaintCode
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

        $scope.verifyComp = function () {
            
            $http.post('/verifyAppComp', $scope.verify).then(function (response) {
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    angular.element('#verifyComplaintModal').modal('toggle');
                } else {
                    $scope.notify("error", "There has some ERROR!");
                }
            });
        }
    });

    $scope.viewReport = function (reportCode) {
        //window.location.href = '#/view-report/' + reportCode;
        $scope.report = {
            "reportID": reportCode
        };
        var map;

        $http.post('/getReportForComplaint', $scope.report).then(function (response) {

            $scope.thisReport = response.data.result[0];

            $scope.area = {
                "areaID": $scope.thisReport.area
            };

            var htmlscripts = response.data.content;

            $http.post('/getReportBinCenter', $scope.area).then(function (binresponse) {
                var bindataset = binresponse.data;
                var bin = "";

                var row = Object.keys(bindataset).length;
                $.each(bindataset, function (index, value) {
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

                $http.post('/getReportACR', $scope.forGetAcrInfo).then(function (acrresponse) {
                    if (acrresponse.data !== null) {
                        if (acrresponse.data.length > 0) {
                            var acrset = acrresponse.data;
                        } else {
                            var acrset = [];
                        }
                        var acrRow = Object.keys(acrset).length;
                        var acr = "";
                        $.each(acrset, function (index, value) {
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

app.controller('complaintLogisticsDetailController', function ($scope, $http, $filter, $window, $routeParams, $route) {

    $scope.coIDobj = {
        'coID': $routeParams.complaintCode
    };


    $scope.detailObj = {};
    $scope.areaList = [];
    $scope.driverList = [];
    $scope.truckList = [];

    $scope.logistics = {
        'areaUnder': '',
        'areaCouncil': '',
        'lgReport': '',
        'sub': '',
        'subDate': null,
        'subTime': null,
        'by': $window.sessionStorage.getItem('owner'),
        'status': 'open',
        'statusDate': '',
        'statusTime': '',
        'reason': '',
        'remark': '',
        'logsImg': 'undefined|undefined|undefined',
        'coID': $routeParams.complaintCode,
        'driver': '',
        'truck': '',
        'wasteColDT': ''
    };
    $scope.complaintImages = {
        'image01': "",
        'image02': "",
        'image03': "",
        'image04': ""
    }
    $scope.showComplaintImages = {
        'image01': false,
        'image02': false,
        'image03': false,
        'image04': false
    }

    $scope.editLogistics = {
        "coID": '',
        "area": '',
        "council": '',
        "sub": '',
        "truck": '',
        "driver": '',
        "reason": '',
        "lgReport": '',
        "subDate": '',
        "subTime": ''
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
    $scope.wasteColDT = "";
    $scope.showLogsEdit = false;

    $http.post('/getStaffName', {'id': $window.sessionStorage.getItem('owner')}).then(function (response) {
        $scope.lgStaff = response.data[0].staffName;
    });

    $http.post('/getLogisticsComplaintDetail', $scope.coIDobj).then(function (response) {
        $scope.detailObj = response.data.data[0];
        $scope.detailType = "";

        var splitType = "";
        var splitTypeContent = "";
        var splitTypeSpecialContent = "";

        //init images
        $scope.complaintImages.image01 = $scope.detailObj.compImg.split("|")[0];
        $scope.complaintImages.image02 = $scope.detailObj.compImg.split("|")[1];
        $scope.complaintImages.image03 = $scope.detailObj.compImg.split("|")[2];
        $scope.complaintImages.image04 = $scope.detailObj.compImg.split("|")[3];

        if ($scope.complaintImages.image01 !== 'undefined') {
            $scope.showComplaintImages.image01 = true;
        } else {
            $scope.complaintImages.image01 = "";
        }
        if ($scope.complaintImages.image02 !== 'undefined') {
            $scope.showComplaintImages.image02 = true;
        } else {
            $scope.complaintImages.image02 = "";
        }
        if ($scope.complaintImages.image03 !== 'undefined') {
            $scope.showComplaintImages.image03 = true;
        } else {
            $scope.complaintImages.image03 = "";
        }
        if ($scope.complaintImages.image04 !== 'undefined') {
            $scope.showComplaintImages.image04 = true;
        } else {
            $scope.complaintImages.image04 = "";
        }        

        if ($scope.detailObj.services === "1") { //Municipal waste
            $scope.showAreaLogistics = true;
            $scope.areaUnderList = ["Trienekens", "Mega Power", "TAK"];
        } else if ($scope.detailObj.services === "2") { //Roro container
            $scope.showAreaLogistics = false;
            $scope.areaUnderList = ["Trienekens", "Mega Power", "TAK"];
        } else if ($scope.detailObj.services === "3") { //Scheduled Waste
            $scope.showAreaLogistics = false;
            $scope.areaUnderList = ["Trienekens", "Others"];
        }

        $scope.detailObj.complaintDate = $filter('date')($scope.detailObj.complaintDate, 'yyyy-MM-dd');
        $scope.detailObj.logisticsDate = $filter('date')($scope.detailObj.logisticsDate, 'yyyy-MM-dd');

        $scope.statusDate = new Date($filter("date")(Date.now(), 'yyyy-MM-dd'));

        $scope.subTimeChange = function (time) {
            $scope.logistics.subTime = time == undefined ? "" : time;
        };

        $scope.editSubTimeChange = function (time) {
            $scope.editLogistics.subTime = time == undefined ? "" : time;
        };
        $scope.statusTimeChange = function (time) {
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
        } else if ($scope.detailObj.step == 3) {
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
                    splitTypeSpecialContent[2] = "Others(Municipal waste)";
                } else if (splitTypeSpecialContent[0] == '13') {
                    splitTypeSpecialContent[2] = "Others(Roro container)";
                } else if (splitTypeSpecialContent[0] == '14') {
                    splitTypeSpecialContent[2] = "Others(Scheduled waste)";
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
                    splitTypeContent = "RoRo not sent";
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
                'image03': "",
                'image04': ""
            }
            $scope.showLogsImages = {
                'image01': false,
                'image02': false,
                'image03': false,
                'image04': false
            }
            $http.post('/getLogisticsFullComplaintDetail', $scope.coIDobj).then(function (response) {
                
                if (response.data.status == "success") {
                    $scope.fullComplaintDetail = response.data.data[0];

                    $scope.areaCode = $scope.fullComplaintDetail.area.split(",")[1];
                    if($scope.fullComplaintDetail.subDate != null){
                        $scope.fullComplaintDetail.subDate = $filter('date')($scope.fullComplaintDetail.subDate, 'yyyy-MM-dd');
                    }else{
                        $scope.fullComplaintDetail.subDate = 'N/A';
                        $scope.fullComplaintDetail.subTime = 'N/A';
                    }
                    
                    $scope.fullComplaintDetail.statusDate = $filter('date')($scope.fullComplaintDetail.statusDate, 'yyyy-MM-dd');
                    $scope.fullComplaintDetail.custDate = $filter('date')($scope.fullComplaintDetail.custDate, 'yyyy-MM-dd');

                    $scope.remarksCol = $scope.fullComplaintDetail.remarks;
                    $scope.remarksEditBtn = true;
                    $scope.remarksUpdateCancelBtn = false;
                    $scope.recordremarks = $scope.fullComplaintDetail.remarks;
                    $scope.editLogistics.reason = $scope.fullComplaintDetail.reason;
                    
                    if($scope.fullComplaintDetail.reason == 1){
                        $scope.fullComplaintDetail.reason = "Waste Not Collected (MW)";
                    }else if($scope.fullComplaintDetail.reason == 2){
                        $scope.fullComplaintDetail.reason = "Shortage Manpower (MW)";
                    }else if($scope.fullComplaintDetail.reason == 3){
                        $scope.fullComplaintDetail.reason = "Truck Breakdown (MW)";
                    }else if($scope.fullComplaintDetail.reason == 4){
                        $scope.fullComplaintDetail.reason = "Truck Full (MW)";
                    }else if($scope.fullComplaintDetail.reason == 5){
                        $scope.fullComplaintDetail.reason = "Bin Not Sent Back (MW)";
                    }else if($scope.fullComplaintDetail.reason == 6){
                        $scope.fullComplaintDetail.reason = "Spillage of Leachate (MW)";
                    }else if($scope.fullComplaintDetail.reason == 7){
                        $scope.fullComplaintDetail.reason = "Others (MW)";
                    }else if($scope.fullComplaintDetail.reason == 8){
                        $scope.fullComplaintDetail.reason = "Not wearing PPE / Uniform (MW)";
                    }else if($scope.fullComplaintDetail.reason == 9){
                        $scope.fullComplaintDetail.reason = "Spillage of waste (MW)";
                    }else if($scope.fullComplaintDetail.reason == 10){
                        $scope.fullComplaintDetail.reason = "Truck Breakdown (RoRo)";
                    }else if($scope.fullComplaintDetail.reason == 11){
                        $scope.fullComplaintDetail.reason = "Shortage Manpower (RoRo)";
                    }else if($scope.fullComplaintDetail.reason == 12){
                        $scope.fullComplaintDetail.reason = "Not wearing PPE / Uniform (RoRo)";
                    }else if($scope.fullComplaintDetail.reason == 13){
                        $scope.fullComplaintDetail.reason = "Shortage of Container (RoRo)";
                    }else if($scope.fullComplaintDetail.reason == 14){
                        $scope.fullComplaintDetail.reason = "Others (RoRo)";
                    }else if($scope.fullComplaintDetail.reason == 15){
                        $scope.fullComplaintDetail.reason = "Truck Breakdown (SW)";
                    }else if($scope.fullComplaintDetail.reason == 16){
                        $scope.fullComplaintDetail.reason = "Shortage Manpower (SW)";
                    }else if($scope.fullComplaintDetail.reason == 17){
                        $scope.fullComplaintDetail.reason = "Incomplete Documents (SW)";
                    }else if($scope.fullComplaintDetail.reason == 18){
                        $scope.fullComplaintDetail.reason = "Spillage During Collection (SW)";
                    }else if($scope.fullComplaintDetail.reason == 19){
                        $scope.fullComplaintDetail.reason = "Not waring PPE / Uniform (SW)";
                    }else if($scope.fullComplaintDetail.reason == 20){
                        $scope.fullComplaintDetail.reason = "Others (SW)";
                    } 
                    
                    $scope.wcdEditBtn = false;

                    //init images
                    $scope.logsImages.image01 = $scope.fullComplaintDetail.logsImg.split("|")[0];
                    $scope.logsImages.image02 = $scope.fullComplaintDetail.logsImg.split("|")[1];
                    $scope.logsImages.image03 = $scope.fullComplaintDetail.logsImg.split("|")[2];
                    $scope.logsImages.image04 = $scope.fullComplaintDetail.logsImg.split("|")[3];

                    if ($scope.logsImages.image01 !== 'undefined') {
                        $scope.showLogsImages.image01 = true;
                    } else {
                        $scope.logsImages.image01 = "";
                    }
                    if ($scope.logsImages.image02 !== 'undefined') {
                        $scope.showLogsImages.image02 = true;
                    } else {
                        $scope.logsImages.image02 = "";
                    }
                    if ($scope.logsImages.image03 !== 'undefined') {
                        $scope.showLogsImages.image03 = true;
                    } else {
                        $scope.logsImages.image03 = "";
                    }
                    if ($scope.logsImages.image04 !== 'undefined') {
                        $scope.showLogsImages.image04 = true;
                    } else {
                        $scope.logsImages.image04 = "";
                    }                    

                    if ($scope.detailObj.compImg == "undefined|undefined|undefined|undefined") {
                        $scope.showCompImg = false;
                    }

                    if ($scope.detailObj.logsImg === "undefined|undefined|undefined|undefined") {
                        $scope.showLogsImg = false;
                    }
                    
                    //formulate waste collected on
                    $scope.wasteData = [];
                    
                    var wasteArray = $scope.fullComplaintDetail.wasteColDT.split(";");
                    if(wasteArray.length == '1'){
                        $scope.wasteData.push({
                            "date": 'N/A',
                            "reporter": 'N/A'
                        });
                    }else{
                        for(var i=0; i < wasteArray.length - 1; i++){
                            $scope.wasteData.push({
                                "date": wasteArray[i].split(",")[0],
                                "reporter": wasteArray[i].split(",")[1]
                            });
                        }
                    }
                    
                    if($scope.fullComplaintDetail.lgReport != null){
                        $http.post('/getReportGarbageAmount', {"reportID": $scope.fullComplaintDetail.lgReport.split(' ')[2]}).then(function(response){
                            if(response.data[0] != null){
                                $scope.lgReportTonnage = response.data[0].garbageAmount;
                            }
                        })
                    }

                    //                    review
                    if ($scope.fullComplaintDetail.logisticsReview !== null) {
                        var staffID = {
                            'id': $scope.fullComplaintDetail.logisticsReview
                        };
                        $http.post('/getStaffName', staffID).then(function (response) {
                            $scope.complaintReview = "LG Reviewed by " + response.data[0].staffName;
                        });
                    }


                    var custByID = {
                        'id': $scope.fullComplaintDetail.custBy
                    };

                    var driverID = {
                        'id': $scope.fullComplaintDetail.driver
                    };

                    $http.post('/getStaffName', custByID).then(function (response) {
                        if (response.data.length > 0) {
                            $scope.informCustStaffName = response.data[0].staffName;
                        } else {
                            $scope.informCustStaffName = '';
                        }
                    });


                    $http.post('/getStaffName', driverID).then(function (response) {
                        if (response.data.length > 0) {
                            $scope.driverName = response.data[0].staffName;
                        } else {
                            $scope.driverName = '';
                        }
                    });

                    //set up edit data
                    $scope.editLogistics.coID = $routeParams.complaintCode;
                    $scope.editLogistics.area = $scope.fullComplaintDetail.area;
                    $scope.editLogistics.council = $scope.fullComplaintDetail.council;
                    $scope.editLogistics.sub = $scope.fullComplaintDetail.sub;
                    $scope.editLogistics.driver = $scope.fullComplaintDetail.driver;
                    $scope.editLogistics.truck = $scope.fullComplaintDetail.truck;
                    $scope.editLogistics.lgReport = $scope.fullComplaintDetail.lgReport;
                    $scope.editLogistics.subDate = new Date($scope.fullComplaintDetail.subDate);
                    $scope.editLogistics.subTime = new Date();
                    $scope.editLogistics.subTime.setHours($scope.fullComplaintDetail.subTime.split(":")[0]);
                    $scope.editLogistics.subTime.setMinutes($scope.fullComplaintDetail.subTime.split(":")[1]);
                    $scope.editLogistics.subTime.setSeconds($scope.fullComplaintDetail.subTime.split(":")[2]);
                    $scope.editLogistics.subTime.setMilliseconds(0);
                    
                    $scope.getLGReportListFunc('2');

                    $scope.updateLogisticsCMSEdit = function(){

                        $scope.editLogistics.subDate = $filter('date')($scope.editLogistics.subDate, 'yyyy-MM-dd');
                        $scope.editLogistics.subTime = $filter('date')($scope.editLogistics.subTime, 'HH:mm:ss');
                        
                        if($scope.editLogistics.sub == 'Others'){
                            $scope.editLogistics.sub = $scope.editLogistics.subEditOthers;
                        }
                        

                        $http.post('/updateLogisticsCMSEdit', $scope.editLogistics).then(function(response){
                            if (response.data.status == "success") {
                                $scope.notify(response.data.status, "Data has been updated");
                                $route.reload();                              

                            } else {
                                $scope.notify("error", "There are some ERROR!");
                            }
                        });
                    }

                    $scope.updateStatus = function () {
                        var time = new Date();
                        $scope.status = {
                            'status': $scope.fullComplaintDetail.status,
                            'coID': $routeParams.complaintCode,
                            'statusdate': $filter('date')(Date.now(), 'yyyy-MM-dd'),
                            'statustime': time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
                        }


                        $http.post('/updateComplaintDetailsStatus', $scope.status).then(function (response) {
                            if (response.data.status == "success") {
                                $scope.notify(response.data.status, "Status has been updated");
                                $route.reload();                              

                            } else {
                                $scope.notify("error", "There are some ERROR!");
                            }
                        });

                    }

                    $scope.updateCMSStatus = function () {

                        var time = new Date();
                        $scope.cmsUpdateRequest = {
                            "cmsstatus": $scope.fullComplaintDetail.cmsStatus,
                            "coID": $routeParams.complaintCode,
                            "cmsdate": $filter('date')(Date.now(), 'yyyy-MM-dd'),
                            "cmstime": time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
                        };
                
                        $http.post('/updateCMSStatus', $scope.cmsUpdateRequest).then(function (response) {
                            if (response.data.status == "success") {
                                $scope.notify(response.data.status, "CMS Status has been updated");
                                $route.reload();
                            } else {
                                $scope.notify("error", "There has some ERROR!");
                            }
                        });
                    }

                } else {
                    $scope.showInfo = false;
                    console.log("ERROR!");
                }

            });
        }

        $http.get('/getAreaList').then(function (response) {
            for(var i=0; i< response.data.length; i++){
                if(response.data[i].branch == $scope.detailObj.zon){
                    $scope.areaList.push(response.data[i]);
                }
            }

            $('#inputUnder').on('change', function(){
                $scope.logistics.areaCouncil = $(':selected', this).attr('council');
                $scope.subcon = $(':selected', this).attr('subcon');
                if($scope.subcon == 'TS'){
                    $scope.subcon2 = "Trienekens";
                }else if($scope.subcon == 'MP'){
                    $scope.subcon2 = 'Mega Power';
                }else if($scope.subcon == 'TAK'){
                    $scope.subcon2 = 'TAK'
                }else{
                    $scope.subcon2 = 'Others'
                }
                $('#inputSub').val($scope.subcon2);
            })

            $('#editUnder').on('change', function(){
                $scope.editLogistics.council = $(':selected', this).attr('council');
                $scope.subcon = $(':selected', this).attr('subcon');
                console.log($(':selected', this).attr('council'));
                console.log($scope.editLogistics.council);
                if($scope.subcon == 'TS'){
                    $scope.subcon2 = "Trienekens";
                }else if($scope.subcon == 'MP'){
                    $scope.subcon2 = 'Mega Power';
                }else if($scope.subcon == 'TAK'){
                    $scope.subcon2 = 'TAK'
                }else{
                    $scope.subcon2 = 'Others'
                }
                $('#editSub').val($scope.subcon2);
                
            })
        });
    
        $http.get('/getDriverList').then(function (response) {
            $.each(response.data, function (index, value) {
                if(value.branch == $scope.detailObj.zon){
                    $scope.driverList.push({
                        "id": value.id,
                        "name": value.name
                    })
                }
            });
            // $scope.driverList = response.data;
        });
    
        $http.get('/getTruckList').then(function(response){
            $.each(response.data, function (index, value) {
                if(value.branch == $scope.detailObj.zon){
                    $scope.truckList.push({
                        "id": value.id,
                        "no": value.no
                    })
                }
            });
        });

        $scope.getLGReportListFunc = function(marker){

            var lgArea = {
                "areaID": ""
            }

            if(marker == '1'){
                lgArea.areaID = $scope.logistics.areaUnder.split(',')[0];
            }else if(marker == '2'){
                lgArea.areaID =  $scope.fullComplaintDetail.area.split(",")[0];
            }else if(marker == '3'){
                lgArea.areaID = $scope.editLogistics.area.split(",")[0];
            }
            
            $http.post('/getReportListForComplaint', lgArea).then(function(response){
                $scope.lgReportList = response.data;

                $scope.lgReportList.forEach(function(item, index){
                    item.date = $filter('date')(item.date, 'yyyy-MM-dd');
                })
            });
        }
    
    });



    function retrieveImageFromClipboardAsBlob(pasteEvent, callback) {
        if (pasteEvent.clipboardData == false) {
            if (typeof (callback) == "function") {
                callback(undefined);
            }
        };

        var items = pasteEvent.clipboardData.items;

        if (items == undefined) {
            if (typeof (callback) == "function") {
                callback(undefined);
            }
        };

        for (var i = 0; i < items.length; i++) {
            // Skip content if not image
            if (items[i].type.indexOf("image") == -1) continue;
            // Retrieve image on clipboard as blob
            var blob = items[i].getAsFile();

            if (typeof (callback) == "function") {
                callback(blob);
            }
        }
    }

    var img01, img02, img03, img04;
    $(".target").on("click", function () {
        var $this = $(this);
        $scope.imgPasteID = $this.attr("id");
        $(".active").removeClass("active");
        $this.addClass("active");
        window.addEventListener("paste", function (e) {

            // Handle the event
            retrieveImageFromClipboardAsBlob(e, function (imageBlob) {
                // If there's an image, display it in the canvas
                if (imageBlob) {
                    var canvas = document.getElementById($scope.imgPasteID);
                    var ctx = canvas.getContext('2d');

                    // Create an image to render the blob on the canvas
                    var img = new Image();

                    // Once the image loads, render the img on the canvas
                    img.onload = function () {
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
                    reader.onloadend = function () {
                        var base64data = reader.result;
                        if ($scope.imgPasteID == "uploadImg01") {
                            img01 = base64data;
                        } else if ($scope.imgPasteID == "uploadImg02") {
                            img02 = base64data;
                        } else if ($scope.imgPasteID == "uploadImg03") {
                            img03 = base64data;
                        } else if ($scope.imgPasteID == "uploadImg04") {
                            img04 = base64data;
                        } else if ($scope.imgPasteID == "uploadImg05") {
                            $scope.logsImages.image01 = base64data;
                        } else if ($scope.imgPasteID == "uploadImg06") {
                            $scope.logsImages.image02 = base64data;
                        } else if ($scope.imgPasteID == "uploadImg07") {
                            $scope.logsImages.image03 = base64data;
                        } else if ($scope.imgPasteID == "uploadImg08") {
                            $scope.logsImages.image04 = base64data;
                        }
                        $scope.logistics.logsImg = img01 + "|" + img02 + "|" + img03 + "|" + img04;
                    }
                }
            });
        }, false);
    });

    $scope.editLogsImages = function () {
        $scope.editImages = true;
        var images = [$scope.logsImages.image01, $scope.logsImages.image02, $scope.logsImages.image03, $scope.logsImages.image04];
        images.forEach(function (image, index) {
            var isEmpty = true;
            if (image !== "" && index === 0) {
                var canvas = document.getElementById("uploadImg05")
                isEmpty = false;
            } else if (image !== "" && index === 1) {
                var canvas = document.getElementById("uploadImg06")
                isEmpty = false;
            } else if (image !== "" && index === 2) {
                var canvas = document.getElementById("uploadImg07")
                isEmpty = false;
            } else if (image !== "" && index === 3) {
                var canvas = document.getElementById("uploadImg08")
                isEmpty = false;
            }

            if (!isEmpty) {
                var ctx = canvas.getContext('2d');
                var img = new Image();
                img.src = image;

                // Once the image loads, render the img on the canvas
                img.onload = function () {
                    // Update dimensions of the canvas with the dimensions of the image
                    canvas.width = this.width;
                    canvas.height = this.height;

                    // Draw the image
                    ctx.drawImage(img, 0, 0);
                };
            }
        });
    }

    $scope.clearImage = function (imgID) {
        if (imgID === "uploadImg05") {
            $scope.logsImages.image01 = "";
        } else if (imgID === "uploadImg06") {
            $scope.logsImages.image02 = "";
        } else if (imgID === "uploadImg07") {
            $scope.logsImages.image03 = "";
        } else if (imgID === "uploadImg08") {
            $scope.logsImages.image04 = "";
        }
        var canvas = document.getElementById(imgID);
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    $scope.updateLogsImages = function () {
        $scope.editImages = false;

        var updateImages = {
            'coID': $routeParams.complaintCode,
            'department': "BD",
            'images': $scope.logsImages.image01 + "|" + $scope.logsImages.image02 + "|" + $scope.logsImages.image03 + "|" + $scope.logsImages.image04
        }

        $http.post('/updateComplaintImages', updateImages).then(function (response) {
            if (response.data.status == "success") {
                $scope.notify(response.data.status, response.data.message);
                $route.reload();
            } else {
                $scope.notify("error", "There are some ERROR updating the images");
            }
        });
    }

    $scope.cancelCreate = function () {
        window.history.back();
    }

    $scope.submit = function () {
        $scope.logistics.statusDate = $filter('date')(Date.now(), 'yyyy-MM-dd');
        $scope.logistics.statusTime = $filter('date')(Date.now(), 'HH:mm:ss');
        $scope.logistics.complaintDate = $scope.detailObj.complaintDate;
        $scope.logistics.complaintTime = $scope.detailObj.complaintTime;
        
        $scope.logistics.sub = $('#inputSub').val();

        if ($scope.logistics.sub != "Trienekens") {
            $scope.logistics.subDate = $filter('date')($scope.logsSubDate, 'yyyy-MM-dd');
            $scope.logistics.subTime = $filter('date')($scope.logsSubTime, 'HH:mm:ss');
        } else {
            $scope.logistics.subDate = null;
            $scope.logistics.subTime = null;
        }


        if($scope.logistics.statusDate != null && $scope.logistics.statusTime != null && $scope.logistics.complaintDate != null && $scope.logistics.complaintTime != null){
            var lgKPI = lgKPIFunc($scope.logistics.statusDate, $scope.logistics.statusTime, $scope.logistics.complaintDate, $scope.logistics.complaintTime);
            var lgKPIAchieve = 'A';
            if(lgKPI.split(":")[0] > 6){
                lgKPIAchieve = 'N';
            }else if(lgKPI == 'N/A'){
                lgKPIAchieve = 'E';
            }
            $scope.logistics.lgKPI = lgKPI;
            $scope.logistics.lgKPIAchieve = lgKPIAchieve;
        }

        if ($scope.logistics.sub == "" || $scope.logistics.cmsStatus == "" || $scope.logistics.status == "" || $scope.logistics.statusDate == "" || $scope.logistics.statusTime == "" || $scope.logistics.remarks == "" || $scope.logistics.reason =="" || $scope.logistics.truck == "") {

            $scope.notify("error", "There has some blank column");
            $scope.showSubmitBtn = true;
        } else {
            if($scope.wasteColDT != ""){
                $scope.logistics.wasteColDT = $filter('date')($scope.wasteColDT, 'yyyy-MM-dd HH:mm:ss') + "," + $scope.lgStaff + ";";
            }else{
                $scope.logistics.wasteColDT = ""
            }

            if($scope.logistics.sub == 'Others'){
                $scope.logistics.sub = $scope.logistics.subOthers;
            }
            
            $scope.showSubmitBtn = true;
            console.log($scope.logistics);
            $http.post('/submitLogisticsComplaint', $scope.logistics).then(function (response) {
                $scope.showSubmitBtn = true;
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    window.location.href = '#/complaint-module';
                } else {
                    $scope.notify("error", "There has some ERROR!");
                }
            });
        }
    };

    $scope.logsOfficerUpdateRemarks = function () {
        $http.post('/logsOfficerUpdateRemarks', {
            'recordremarks': $scope.recordremarks,
            'coID': $routeParams.complaintCode
        }).then(function (response) {
            if (response.data.status == "success") {
                $scope.notify(response.data.status, "Remarks Updates");
                $route.reload();
            } else {
                $scope.notify("error", "There has some ERROR!");
            }
        })
    };

    $scope.backList = function () {
        window.location.href = '#/complaint-module';
    };

    $scope.reviewComplaintLG = function () {
        if (confirm("Are you sure you want to review this complaint?")) {
            var reviewComplaint = {
                'coID': $routeParams.complaintCode,
                'department': "LG",
                'staffID': window.sessionStorage.getItem('owner')
            }

            $http.post('/updateComplaintReview', reviewComplaint).then(function (response) {
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    $route.reload();
                } else {
                    $scope.notify("error", "There are some ERROR reviewing the complaint");
                }
            });
        }
    }
    
    $scope.updateWCD = function(){
        if($scope.wcdEditData != ""){
            $scope.wcdEditData = $scope.fullComplaintDetail.wasteColDT + $filter('date')($scope.wcdEditData, 'yyyy-MM-dd HH:mm:ss') + "," + $scope.lgStaff + ";";
            
            var wcdPostData = {
                "data": $scope.wcdEditData,
                "coID" : $routeParams.complaintCode
            };
            
            $http.post('/updateWCD', wcdPostData).then(function(response){
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    $route.reload();
                } else {
                    $scope.notify("error", "There has some ERROR!");
                    $route.reload();
                }                
            });
            
        }else{
            $scope.notify("error", "The Column is blank!");
            $scope.wcdEditBtn = true;
        }        
    }

    $scope.logsEditChange = function(value){
        $scope.showLogsEdit = value;
    }

    $scope.ComplaintLGExportPDF = function(){
            
    var filename = 'lgComplaintExport.pdf';
    var pdf = new jsPDF('p', 'mm', 'a4');
    if($scope.detailObj.step >= 1){
        html2canvas($("#lgCMSPart1"), {
            useCORS: true,
            imageTimeout: 2000,
            scale: 10,
            background :'#FFFFFF'
        }).then(function(canvas) {
            var img = canvas.toDataURL("image/jpeg", 1.0);
            window.URL.revokeObjectURL(img);
            pdf.addImage(img, 'JPEG', 5, 5, 350, 250);
            if($scope.detailObj.step >= 2){
                html2canvas($("#lgCMSPart2"), {
                    useCORS: true,
                    imageTimeout: 2000,
                    scale: 1,
                    background :'#FFFFFF'
                }).then(function(canvas) {
                    var img = canvas.toDataURL("image/jpeg", 1.0);
                    window.URL.revokeObjectURL(img);
                    pdf.addPage();
                    pdf.addImage(img, 'JPEG', 5, 5, 325, 275);
                    if($scope.detailObj.step >= 3){
                        html2canvas($("#lgCMSPart3"), {
                            useCORS: true,
                            imageTimeout: 2000,
                            scale: 1,
                            background :'#FFFFFF'
                        }).then(function(canvas) {
                            var img = canvas.toDataURL("image/jpeg", 1.0);
                            window.URL.revokeObjectURL(img);
                            pdf.addPage();
                            pdf.addImage(img, 'JPEG', 5, 5, 350, 150);
                            pdf.save(filename);
                        });
                    }else{
                        pdf.save(filename);
                    }
                });
            }else{
                pdf.save(filename);
            }
        });
    }        
        
    }
});

app.controller('complaintOfficercreateController', function ($scope, $http, $filter, $window, storeDataService) {
    $scope.showSubmitBtn = true;
    $scope.showTypeOption = 0;

    $scope.kchZon = angular.copy(storeDataService.show.complaintwebkch.create);
    $scope.btuZon = angular.copy(storeDataService.show.complaintwebbtu.create);

    $scope.companyHousehold = '';
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
        "compTypeCode": '',
        "compLogDate": '',
        "compLogTime": '',
        "compLogBy": $window.sessionStorage.getItem('owner'),
        "creationDate": '',
        "services": '',
        "zon": ''
    };

    $scope.tc1 = false;
    $scope.tc2 = false;
    $scope.tc3 = false;
    $scope.tc4 = false;
    $scope.tc5 = false;
    $scope.tc6 = false;
    $scope.tc7 = false;
    $scope.tc8 = false;
    $scope.tc9 = false;
    $scope.tc10 = false;
    $scope.tc11 = false;
    $scope.tc12 = false;
    $scope.tc13 = false;
    $scope.tc14 = false;
    $scope.cmsBDRemarks = false;

    $scope.compDate = new Date($filter("date")(Date.now(), 'yyyy-MM-dd'));
    $scope.compLogDate = new Date($filter("date")(Date.now(), 'yyyy-MM-dd'));

    $scope.compTimeChange = function (time) {
        $scope.comp.compTime = time == undefined ? "" : time;
    };
    $scope.logTimeChange = function (time) {
        $scope.comp.compLogTime = time == undefined ? "" : time;
    };

    function retrieveImageFromClipboardAsBlob(pasteEvent, callback) {
        if (pasteEvent.clipboardData == false) {
            if (typeof (callback) == "function") {
                callback(undefined);
            }
        };

        var items = pasteEvent.clipboardData.items;

        if (items == undefined) {
            if (typeof (callback) == "function") {
                callback(undefined);
            }
        };

        for (var i = 0; i < items.length; i++) {
            // Skip content if not image
            if (items[i].type.indexOf("image") == -1) continue;
            // Retrieve image on clipboard as blob
            var blob = items[i].getAsFile();

            if (typeof (callback) == "function") {
                callback(blob);
            }
        }
    }
    var img01, img02, img03, img04;
    $(".target").on("click", function () {
        var $this = $(this);
        $scope.imgPasteID = $this.attr("id");
        $(".active").removeClass("active");
        $this.addClass("active");
        window.addEventListener("paste", function (e) {

            // Handle the event
            retrieveImageFromClipboardAsBlob(e, function (imageBlob) {
                // If there's an image, display it in the canvas
                if (imageBlob) {
                    var canvas = document.getElementById($scope.imgPasteID);
                    var ctx = canvas.getContext('2d');

                    // Create an image to render the blob on the canvas
                    var img = new Image();

                    // Once the image loads, render the img on the canvas
                    img.onload = function () {
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
                    reader.onloadend = function () {
                        var base64data = reader.result;
                        if ($scope.imgPasteID == "uploadImg01") {
                            img01 = base64data;
                        } else if ($scope.imgPasteID == "uploadImg02") {
                            img02 = base64data;
                        } else if ($scope.imgPasteID == "uploadImg03") {
                            img03 = base64data;
                        }else if ($scope.imgPasteID == "uploadImg04") {
                            img04 = base64data;
                        }
                        $scope.comp.compImg = img01 + "|" + img02 + "|" + img03 + "|" + img04;

                    }
                }
            });
        }, false);
    });

    $scope.cancelCreate = function () {
        window.history.back();
    }

    $scope.addComp = function () {
        $scope.showSubmitBtn = false;
        $scope.comp.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.comp.compDate = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.comp.compLogDate = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.comp.compTime = $filter('date')(new Date(), 'HH:mm:ss');
        $scope.comp.compLogTime = $filter('date')(new Date(), 'HH:mm:ss');

        $scope.comp.compType = "";
        $scope.comp.compTypeCode = "";

        if($scope.kchZon == 'A'){
            $scope.comp.zon = "KCH";
        }else if($scope.btuZon == 'A'){
            $scope.comp.zon = "BTU"
        }

        if ($scope.tc1 == true) {
            if ($scope.tc1days == undefined || $scope.tc1days == "") {
                $scope.tc1days = "0";
            }
            $scope.comp.compType += '1:::::';
            $scope.comp.compType += $scope.tc1days + ':,:';
            $scope.comp.compTypeCode += "a,";
        }
        if ($scope.tc2 == true) {
            $scope.comp.compType += '2:,:';
            $scope.comp.compTypeCode += "b,";
        }
        if ($scope.tc3 == true) {
            $scope.comp.compType += '3:,:';
            $scope.comp.compTypeCode += "c,";
        }
        if ($scope.tc4 == true) {
            $scope.comp.compType += '4:,:';
            $scope.comp.compTypeCode += "d,";
        }
        if ($scope.tc5 == true) {
            $scope.comp.compType += '5:,:';
            $scope.comp.compTypeCode += "e,";
        }
        if ($scope.tc6 == true) {
            $scope.comp.compType += '6:,:';
            $scope.comp.compTypeCode += "f,";
        }
        if ($scope.tc7 == true) {
            $scope.comp.compType += '7:,:';
            $scope.comp.compTypeCode += "g,";
        }
        if ($scope.tc8 == true) {
            $scope.comp.compType += '8:,:';
            $scope.comp.compTypeCode += "h,";
        }
        if ($scope.tc9 == true) {
            $scope.comp.compType += '9:,:';
            $scope.comp.compTypeCode += "i,";
        }
        if ($scope.tc10 == true) {
            $scope.comp.compType += '10:,:';
            $scope.comp.compTypeCode += "j,";
        }
        if ($scope.tc11 == true) {
            $scope.comp.compType += '11:,:';
            $scope.comp.compTypeCode += "k,";
        }
        if ($scope.tc12 == true) {
            if ($scope.tc12others == undefined) {
                $scope.tc12others = "";
            }
            $scope.comp.compType += '12:::::';
            $scope.comp.compType += $scope.tc12others + ':,:';
            $scope.comp.compTypeCode += "l,";
        }
        if ($scope.tc13 == true) {
            if ($scope.tc13others == undefined) {
                $scope.tc13others = "";
            }
            $scope.comp.compType += '13:::::';
            $scope.comp.compType += $scope.tc13others + ':,:';
            $scope.comp.compTypeCode += "m,";
        }
        if ($scope.tc14 == true) {
            if ($scope.tc14others == undefined) {
                $scope.tc14others = "";
            }
            $scope.comp.compType += '14:::::';
            $scope.comp.compType += $scope.tc14others + ':,:';
            $scope.comp.compTypeCode += "n,";
        }

        $scope.comp.compType = $scope.comp.compType.substring(0, $scope.comp.compType.length - 3);
        $scope.comp.compTypeCode = $scope.comp.compTypeCode.substring(0, $scope.comp.compType.length - 1);
        $scope.comp.services = $scope.typeOption;

        if($scope.companyHousehold == 'Household'){
            $scope.comp.compCompany = 'Household';
        }
        if($scope.refNoSlt == 'N/A'){
            $scope.comp.compRefNo = 'N/A';
        }

        if($scope.cmsBDRemarks == true){
            $scope.comp.cmsBDRemarks = 'Collection disrupted due to quarantine cases. Customer has been informed accordingly.';
        }else{
            $scope.comp.cmsBDRemarks = "";
        }

        if ($scope.comp.compDate == '' || $scope.comp.compTime == '' || $scope.comp.compSource == '' || $scope.comp.compRefNo == '' || $scope.comp.compName == '' || $scope.comp.compPhone == '' || $scope.comp.compAddress == '' || $scope.comp.compType == '' || $scope.comp.compLogDate == '' || $scope.comp.compLogTime == '' || $scope.comp.compLogBy == '' || $scope.comp.services == '' || $scope.comp.compCompany == '') {
            console.log($scope.comp);
            $scope.notify("error", "There has some blank column");
            $scope.showSubmitBtn = true;
            $scope.comp.compType = '';
        } else {

            $http.post('/submitOfficeMadeComplaint', $scope.comp).then(function (response) {
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

app.controller('complaintOfficerdetailController', function ($scope, $http, $routeParams, $filter, $route, storeDataService) {
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

    $scope.showcmsupdatebtnKch = angular.copy(storeDataService.show.complaintwebkch.editcms);
    $scope.showcmsupdatebtnBtu = angular.copy(storeDataService.show.complaintwebbtu.editcms);
    $scope.showhiststatuslistKch = angular.copy(storeDataService.show.complaintwebkch.hist);
    $scope.showhiststatuslistBtu = angular.copy(storeDataService.show.complaintwebbtu.hist);
    $scope.showDeleteKch = angular.copy(storeDataService.show.complaintwebkch.delete);
    $scope.showDeleteBtu = angular.copy(storeDataService.show.complaintwebbtu.delete);
    $scope.showEditTOC = false;

    $scope.custStatus = {
        'status': "open",
        'statusDate': "",
        'statusTime': "",
        'coID': $routeParams.coID
    };
    $scope.complaintImages = {
        'image01': "",
        'image02': "",
        'image03': "",
        'image04': ""
    }
    $scope.showComplaintImages = {
        'image01': false,
        'image02': false,
        'image03': false,
        'image04': false 
    }
    $scope.logsImages = {
        'image01': "",
        'image02': "",
        'image03': "",
        'image04': ""
    }
    $scope.showLogsImages = {
        'image01': false,
        'image02': false,
        'image03': false,
        'image04': false
    }
    $scope.editImages = false;
    $scope.checkCustContactStatus = false;
    $scope.custContactableStatus = "0";
    $scope.cmsStatus = "";
    $scope.custContactableStatusOthers = "";
    $scope.showSubCustBtn = true;
    $scope.showCompImg = true;
    $scope.showLogsImg = true;
    $scope.showAreaControl = true;

    var splitType = "";
    var splitTypeContent = "";
    var splitTypeSpecialContent = "";
    var areaSplit = "";

    $http.post('/getComplaintOfficerDetail', $scope.coIDobj).then(function (response) {
        $scope.detailObj = response.data.data[0];
        $scope.typeOption = $scope.detailObj.services;

        if($scope.detailObj.reason == 1){
            $scope.detailObj.reason = "Waste Not Collected (MW)";
        }else if($scope.detailObj.reason == 2){
            $scope.detailObj.reason = "Shortage Manpower (MW)";
        }else if($scope.detailObj.reason == 3){
            $scope.detailObj.reason = "Truck Breakdown (MW)";
        }else if($scope.detailObj.reason == 4){
            $scope.detailObj.reason = "Truck Full (MW)";
        }else if($scope.detailObj.reason == 5){
            $scope.detailObj.reason = "Bin Not Sent Back (MW)";
        }else if($scope.detailObj.reason == 6){
            $scope.detailObj.reason = "Spillage of Leachate (MW)";
        }else if($scope.detailObj.reason == 7){
            $scope.detailObj.reason = "Others (MW)";
        }else if($scope.detailObj.reason == 8){
            $scope.detailObj.reason = "Not wearing PPE / Uniform (MW)";
        }else if($scope.detailObj.reason == 9){
            $scope.detailObj.reason = "Spillage of waste (MW)";
        }else if($scope.detailObj.reason == 10){
            $scope.detailObj.reason = "Truck Breakdown (RoRo)";
        }else if($scope.detailObj.reason == 11){
            $scope.detailObj.reason = "Shortage Manpower (RoRo)";
        }else if($scope.detailObj.reason == 12){
            $scope.detailObj.reason = "Not wearing PPE / Uniform (RoRo)";
        }else if($scope.detailObj.reason == 13){
            $scope.detailObj.reason = "Shortage of Container (RoRo)";
        }else if($scope.detailObj.reason == 14){
            $scope.detailObj.reason = "Others (RoRo)";
        }else if($scope.detailObj.reason == 15){
            $scope.detailObj.reason = "Truck Breakdown (SW)";
        }else if($scope.detailObj.reason == 16){
            $scope.detailObj.reason = "Shortage Manpower (SW)";
        }else if($scope.detailObj.reason == 17){
            $scope.detailObj.reason = "Incomplete Documents (SW)";
        }else if($scope.detailObj.reason == 18){
            $scope.detailObj.reason = "Spillage During Collection (SW)";
        }else if($scope.detailObj.reason == 19){
            $scope.detailObj.reason = "Not waring PPE / Uniform (SW)";
        }else if($scope.detailObj.reason == 20){
            $scope.detailObj.reason = "Others (SW)";
        } 

        if($scope.detailObj.bdRemarks != ""){
            $scope.cmsBDRemarks = true;            
        }else{
            $scope.cmsBDRemarks = false;
        }

        //init images
        $scope.complaintImages.image01 = $scope.detailObj.compImg.split("|")[0];
        $scope.complaintImages.image02 = $scope.detailObj.compImg.split("|")[1];
        $scope.complaintImages.image03 = $scope.detailObj.compImg.split("|")[2];
        $scope.complaintImages.image04 = $scope.detailObj.compImg.split("|")[3];

        if ($scope.complaintImages.image01 !== 'undefined') {
            $scope.showComplaintImages.image01 = true;
        } 
        else {
            $scope.complaintImages.image01 = "";
        }
        if ($scope.complaintImages.image02 !== 'undefined') {
            $scope.showComplaintImages.image02 = true;
        } 
        else {
            $scope.complaintImages.image02 = "";
        }
        if ($scope.complaintImages.image03 !== 'undefined') {
            $scope.showComplaintImages.image03 = true;
        } 
        else {
            $scope.complaintImages.image03 = "";
        }
        if ($scope.complaintImages.image04 !== 'undefined') {
            $scope.showComplaintImages.image04 = true;
        } 
        else {
            $scope.complaintImages.image04 = "";
        }        

        if ($scope.detailObj.logsImg !== null) {
            //init images
            $scope.logsImages.image01 = $scope.detailObj.logsImg.split("|")[0];
            $scope.logsImages.image02 = $scope.detailObj.logsImg.split("|")[1];
            $scope.logsImages.image03 = $scope.detailObj.logsImg.split("|")[2];
            $scope.logsImages.image04 = $scope.detailObj.logsImg.split("|")[3];

            if ($scope.logsImages.image01 !== 'undefined') {
                $scope.showLogsImages.image01 = true;
            } else {
                $scope.logsImages.image01 = "";
            }
            if ($scope.logsImages.image02 !== 'undefined') {
                $scope.showLogsImages.image02 = true;
            } else {
                $scope.logsImages.image02 = "";
            }
            if ($scope.logsImages.image03 !== 'undefined') {
                $scope.showLogsImages.image03 = true;
            } else {
                $scope.logsImages.image03 = "";
            }
            if ($scope.logsImages.image04 !== 'undefined') {
                $scope.showLogsImages.image04 = true;
            } else {
                $scope.logsImages.image04 = "";
            }            
        }

        if ($scope.detailObj.services === "1") { //Municipal waste
            $scope.showAreaControl = true;
        } else if ($scope.detailObj.services === "2") { //Roro container
            $scope.showAreaControl = false;
        } else if ($scope.detailObj.services === "3") { //Scheduled Waste
            $scope.showAreaControl = false;
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

        $http.post('/getStaffName', staffID).then(function (response) {
            $scope.staffName = response.data[0].staffName;
        });

        $http.post('/getStaffName', driverID).then(function (response) {
            if(response.data.length != 0){
                $scope.driverName = response.data[0].staffName;
            }
        })
        

        if($scope.detailObj.wasteColDT != undefined){
            //formulate waste collected on
            $scope.wasteData = [];
            var wasteArray = $scope.detailObj.wasteColDT.split(";");
            if(wasteArray.length == '1'){
                $scope.wasteData.push({
                    "date": 'N/A',
                    "reporter": 'N/A'
                });
            }else{
                for(var i=0; i < wasteArray.length - 1; i++){
                    $scope.wasteData.push({
                        "date": wasteArray[i].split(",")[0],
                        "reporter": wasteArray[i].split(",")[1]
                    });
                }  
            }
        }

        //date reformat
        $scope.compDate = new Date($filter("date")(Date.now(), 'yyyy-MM-dd'));
        $scope.detailObj.complaintDate = $filter('date')($scope.detailObj.complaintDate, 'yyyy-MM-dd');

        $scope.detailObj.logisticsDate = $filter('date')($scope.detailObj.logisticsDate, 'yyyy-MM-dd');

        $scope.detailObj.customerDate = $filter('date')($scope.detailObj.customerDate, 'yyyy-MM-dd');

        if($scope.detailObj.forwardedDate != null){
            $scope.detailObj.forwardedDate = $filter('date')($scope.detailObj.forwardedDate, 'yyyy-MM-dd');
        }else{
            $scope.detailObj.forwardedDate = 'N/A';
            $scope.detailObj.forwardedTime = 'N/A';
        }
        
        $scope.detailObj.statusDate = $filter('date')($scope.detailObj.statusDate, 'yyyy-MM-dd');

        splitType = $scope.detailObj.type.split(":,:");
        for (var i = 0; i < splitType.length; i++) {
            if (splitType[i].length > 3) {
                splitTypeSpecialContent = splitType[i].split(":::::");
                if (splitTypeSpecialContent[0] == '1') {
                    splitTypeSpecialContent[2] = "Waste not collected (days)";
                    $scope.tc1 = true;
                    $scope.tc1days = splitTypeSpecialContent[1];
                } else if (splitTypeSpecialContent[0] == '12') {
                    splitTypeSpecialContent[2] = "Others(Municipal waste)";
                    $scope.tc12 = true;
                    $scope.tc12others = splitTypeSpecialContent[1];
                } else if (splitTypeSpecialContent[0] == '13') {
                    splitTypeSpecialContent[2] = "Others(Roro container)";
                    $scope.tc13 = true;
                    $scope.tc13others = splitTypeSpecialContent[1];
                } else if (splitTypeSpecialContent[0] == '14') {
                    splitTypeSpecialContent[2] = "Others(Scheduled waste)";
                    $scope.tc14 = true;
                    $scope.tc14others = splitTypeSpecialContent[1];
                }
                $scope.detailType += splitTypeSpecialContent[2] + ': ' + splitTypeSpecialContent[1];
            } else {
                if (splitType[i] == '2') {
                    splitTypeContent = "Bin not pushed back to its original location";
                    $scope.tc2 = true;
                } else if (splitType[i] == '3') {
                    splitTypeContent = "Spillage of waste";
                    $scope.tc3 = true;
                } else if (splitType[i] == '4') {
                    splitTypeContent = "Spillage of leachate water";
                    $scope.tc4 = true;
                } else if (splitType[i] == '5') {
                    splitTypeContent = "RoRo not sent";
                    $scope.tc5 = true;
                } else if (splitType[i] == '6') {
                    splitTypeContent = "RoRo not exchanged";
                    $scope.tc6 = true;
                } else if (splitType[i] == '7') {
                    splitTypeContent = "RoRo not pulled";
                    $scope.tc7 = true;
                } else if (splitType[i] == '8') {
                    splitTypeContent = "RoRo not emptied";
                    $scope.tc8 = true;
                } else if (splitType[i] == '9') {
                    splitTypeContent = "Waste not collected on time";
                    $scope.tc9 = true;
                } else if (splitType[i] == '10') {
                    splitTypeContent = "Spillage during collection";
                    $scope.tc10 = true;
                } else if (splitType[i] == '11') {
                    splitTypeContent = "Incomplete documents";
                    $scope.tc11 = true;
                }
                $scope.detailType += splitTypeContent;
            }

            if (i < (splitType.length - 1)) {
                $scope.detailType += ", ";
            }

        }
        
        
        
        //edit complaint
        $scope.editTypeOfComplaint = function(){
            if($scope.showEditTOC == false){
                $scope.showEditTOC = true;
            }else{
                $scope.showEditTOC = false;
                $route.reload();
            } 
        }  
        
        $scope.submitEditTOC = function(){
            $scope.editTypeString = "";
            if ($scope.tc1 == true) {
                if ($scope.tc1days == undefined || $scope.tc1days == "") {
                    $scope.tc1days = "0";
                }
                $scope.editTypeString += '1:::::';
                $scope.editTypeString += $scope.tc1days + ':,:';
            }
            if ($scope.tc2 == true) {
                $scope.editTypeString += '2:,:';
            }
            if ($scope.tc3 == true) {
                $scope.editTypeString += '3:,:';
            }
            if ($scope.tc4 == true) {
                $scope.editTypeString += '4:,:';
            }
            if ($scope.tc5 == true) {
                $scope.editTypeString += '5:,:';
            }
            if ($scope.tc6 == true) {
                $scope.editTypeString += '6:,:';
            }
            if ($scope.tc7 == true) {
                $scope.editTypeString += '7:,:';
            }
            if ($scope.tc8 == true) {
                $scope.editTypeString += '8:,:';
            }
            if ($scope.tc9 == true) {
                $scope.editTypeString += '9:,:';
            }
            if ($scope.tc10 == true) {
                $scope.editTypeString += '10:,:';
            }
            if ($scope.tc11 == true) {
                $scope.editTypeString += '11:,:';
            }
            if ($scope.tc12 == true) {
                if ($scope.tc12others == undefined) {
                    $scope.tc12others = "";
                }
                $scope.editTypeString += '12:::::';
                $scope.editTypeString += $scope.tc12others + ':,:';
            }
            if ($scope.tc13 == true) {
                if ($scope.tc13others == undefined) {
                    $scope.tc13others = "";
                }
                $scope.editTypeString += '13:::::';
                $scope.editTypeString += $scope.tc13others + ':,:';
            }
            if ($scope.tc14 == true) {
                if ($scope.tc14others == undefined) {
                    $scope.tc14others = "";
                }
                $scope.editTypeString += '14:::::';
                $scope.editTypeString += $scope.tc14others + ':,:';
            }


            $scope.editTypeString = $scope.editTypeString.substring(0, $scope.editTypeString.length - 3);

            if($scope.cmsBDRemarks == true){
                $scope.editBDRemarks = 'Collection disrupted due to quarantine cases. Customer has been informed accordingly.';
            }else{
                $scope.editBDRemarks = '';
            }

            $http.post('/submitEditTOC',{"type": $scope.editTypeString, "bdRemarks":$scope.editBDRemarks, "coID" : $routeParams.coID}).then(function(response){
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    $route.reload();
                } else {
                    $scope.notify("error", "There has some ERROR!");
                    $route.reload();
                }                
            })
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

            $http.post('/getStaffName', logisticsStaffID).then(function (response) {
                $scope.logsStaffName = response.data[0].staffName;
            });

            if($scope.detailObj.lgReport != null){
                $http.post('/getReportGarbageAmount', {"reportID": $scope.detailObj.lgReport.split(' ')[2]}).then(function(response){
                    if(response.data[0] != null){
                        $scope.lgReportTonnage = response.data[0].garbageAmount;
                    }
                })
            }


            if ($scope.viewControl >= 3) {
                $http.post('/getStaffName', informCustStaffID).then(function (response) {
                    $scope.informCustStaffName = response.data[0].staffName;
                });

                $scope.custStatus.status = $scope.detailObj.custStatus;
                $scope.custStatus.statusDate = $filter('date')($scope.detailObj.customerDate, 'yyyy-MM-dd');
                $scope.custStatus.statusTime = $scope.detailObj.customerTime;
            }
        }

        if ($scope.detailObj.histUpdateList != null) {
            $scope.histUpdateList = $scope.detailObj.histUpdateList.split("\n");

            for (var n = 0; n < $scope.histUpdateList.length; n++) {
                if ($scope.histUpdateList[n].split(" ")[0] == "CMS") {
                    if ($scope.histUpdateList[n].split(" ")[7] == 1) {
                        $scope.histUpdateList[n] = $scope.histUpdateList[n].substring(0, $scope.histUpdateList[n].length - 1);
                        $scope.histUpdateList[n] += "Valid";
                    } else if ($scope.histUpdateList[n].split(" ")[7] == 2) {
                        $scope.histUpdateList[n] = $scope.histUpdateList[n].substring(0, $scope.histUpdateList[n].length - 1);
                        $scope.histUpdateList[n] += "Invalid";
                    } else if ($scope.histUpdateList[n].split(" ")[7] == 3) {
                        $scope.histUpdateList[n] = $scope.histUpdateList[n].substring(0, $scope.histUpdateList[n].length - 1);
                        $scope.histUpdateList[n] += "To Be Reviewed";
                    }
                }

            }
        }
    });

    $scope.updateCust = function () {

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
        $scope.cust.refNo = $scope.detailObj.refNo;
        $scope.cust.sorce = $scope.detailObj.sorce;


        var bdKPI = bdKPIFunc($scope.cust.custDate, $scope.cust.custTime, $scope.detailObj.complaintDate, $scope.detailObj.complaintTime);
        var bdKPIAchieve = 'A';
        if(bdKPI.split(":")[0] > 24){
            bdKPIAchieve = 'N';
        }else if(bdKPI == 'N/A'){
            bdKPIAchieve = 'E'
        }
        if ($scope.cust.custDate == '' || $scope.cust.custDate == undefined || $scope.cust.custTime == '' || $scope.cust.custStatus == '') {
            $scope.notify("error", "There has some blank column");
            $scope.showSubCustBtn = true;
        } else {
            $scope.cust.bdKPI = bdKPI;
            $scope.cust.bdKPIAchieve = bdKPIAchieve;

            $http.post('/updateCustInformation', $scope.cust).then(function (response) {
                if (response.data.status == "success") {
                    $scope.notify(response.data.status, response.data.message);
                    $route.reload();
                } else {
                    $scope.notify("error", "There has some ERROR!");
                }
            });
        }

    };

    $scope.updateStatus = function () {

        $scope.custStatus.statusDate = $filter('date')(Date.now(), 'yyyy-MM-dd');
        var time = new Date();
        $scope.custStatus.statusTime = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();

        $http.post('/updateComplaintDetailsCustStatus', $scope.custStatus).then(function (response) {
            if (response.data.status == "success") {
                $scope.notify(response.data.status, "Status has been updated");
                $route.reload();             
            } else {
                $scope.notify("error", "There has some ERROR!");
            }
        });


    }

    $scope.updateCMSStatus = function () {

        var time = new Date();
        $scope.cmsUpdateRequest = {
            "cmsstatus": $scope.cmsUpdateStatus,
            "coID": $routeParams.coID,
            "cmsdate": $filter('date')(Date.now(), 'yyyy-MM-dd'),
            "cmstime": time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
        };

        $http.post('/updateCMSStatus', $scope.cmsUpdateRequest).then(function (response) {
            if (response.data.status == "success") {
                $scope.notify(response.data.status, "CMS Status has been updated");
                $route.reload();
            } else {
                $scope.notify("error", "There has some ERROR!");
            }
        });
    }

    $scope.cancelCreate = function () {
        window.history.back();
    }
    


    //edit images by handsome felix, yeyyyy
    $scope.editCompImages = function () {
        $scope.editImages = true;
        var images = [$scope.complaintImages.image01, $scope.complaintImages.image02, $scope.complaintImages.image03, $scope.complaintImages.image04];

        images.forEach(function (image, index) {
            var isEmpty = true;
            if (image !== "" && index === 0) {
                var canvas = document.getElementById("uploadImg01");
                isEmpty = false;
            } else if (image !== "" && index === 1) {
                var canvas = document.getElementById("uploadImg02");
                isEmpty = false;
            } else if (image !== "" && index === 2) {
                var canvas = document.getElementById("uploadImg03");
                isEmpty = false;
            } else if (image !== "" && index === 3) {
                var canvas = document.getElementById("uploadImg04");
                isEmpty = false;
            }

            if (!isEmpty) {
                var ctx = canvas.getContext('2d');
                var img = new Image();
                img.src = image;

                // Once the image loads, render the img on the canvas
                img.onload = function () {
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
            if (typeof (callback) == "function") {
                callback(undefined);
            }
        };

        var items = pasteEvent.clipboardData.items;

        if (items == undefined) {
            if (typeof (callback) == "function") {
                callback(undefined);
            }
        };

        for (var i = 0; i < items.length; i++) {
            // Skip content if not image
            if (items[i].type.indexOf("image") == -1) continue;
            // Retrieve image on clipboard as blob
            var blob = items[i].getAsFile();

            if (typeof (callback) == "function") {
                callback(blob);
            }
        }
    }

    $(".target").on("click", function () {
        var $this = $(this);
        $scope.imgPasteID = $this.attr("id");
        $(".active").removeClass("active");
        $this.addClass("active");
        window.addEventListener("paste", function (e) {

            // Handle the event
            retrieveImageFromClipboardAsBlob(e, function (imageBlob) {
                // If there's an image, display it in the canvas
                if (imageBlob) {
                    var canvas = document.getElementById($scope.imgPasteID);
                    var ctx = canvas.getContext('2d');

                    // Create an image to render the blob on the canvas
                    var img = new Image();

                    // Once the image loads, render the img on the canvas
                    img.onload = function () {
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
                    reader.onloadend = function () {
                        var base64data = reader.result;
                        if ($scope.imgPasteID == "uploadImg01") {
                            $scope.complaintImages.image01 = base64data;
                        } else if ($scope.imgPasteID == "uploadImg02") {
                            $scope.complaintImages.image02 = base64data;
                        } else if ($scope.imgPasteID == "uploadImg03") {
                            $scope.complaintImages.image03 = base64data;
                        }
                    }
                }
            });
        }, false);
    });

    $scope.clearImage = function (imgID) {
        if (imgID === "uploadImg01") {
            $scope.complaintImages.image01 = "";
        } else if (imgID === "uploadImg02") {
            $scope.complaintImages.image02 = "";
        } else if (imgID === "uploadImg03") {
            $scope.complaintImages.image03 = "";
        } else if (imgID === "uploadImg04") {
            $scope.complaintImages.image04 = "";
        }
        var canvas = document.getElementById(imgID);
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    $scope.updateCompImages = function () {
        $scope.editImages = false;

        var updateImages = {
            'coID': $routeParams.coID,
            'department': "LG",
            'images': $scope.complaintImages.image01 + "|" + $scope.complaintImages.image02 + "|" + $scope.complaintImages.image03 + "|" + $scope.complaintImages.image04
        }

        $http.post('/updateComplaintImages', updateImages).then(function (response) {
            if (response.data.status == "success") {
                $scope.notify(response.data.status, response.data.message);
                $route.reload();
            } else {
                $scope.notify("error", "There are some ERROR updating the images");
            }
        });

    }

    $scope.backList = function () {
        window.location.href = '#/complaint-module';
    }
    
    $scope.deleteComplaint = function() {
        if(confirm("Do you want to Delete the complaint?")){
            $http.post('/deleteComplaint',$scope.coIDobj).then(function(response){
                $scope.notify(response.data.status,response.data.message);
                window.location.href = '#/complaint-module/';
            });
        }
    }

    $scope.complaintDetailExportPDF = function(){
            
        var filename = 'ComplaintExport.pdf';
        var pdf = new jsPDF('p', 'mm', 'a4');
        if($scope.detailObj.step >= 1){
            html2canvas($("#cmsPart1"), {
                useCORS: true,
                imageTimeout: 2000,
                scale: 10,
                background :'#FFFFFF'
            }).then(function(canvas) {
                var img = canvas.toDataURL("image/jpeg", 1.0);
                window.URL.revokeObjectURL(img);
                pdf.addImage(img, 'JPEG', 5, 5, 350, 250);
                if($scope.detailObj.step >= 2){
                    html2canvas($("#cmsPart2"), {
                        useCORS: true,
                        imageTimeout: 2000,
                        scale: 1,
                        background :'#FFFFFF'
                    }).then(function(canvas) {
                        var img = canvas.toDataURL("image/jpeg", 1.0);
                        window.URL.revokeObjectURL(img);
                        pdf.addPage();
                        pdf.addImage(img, 'JPEG', 5, 5, 325, 275);
                        if($scope.detailObj.step >= 3){
                            console.log("c");
                            html2canvas($("#cmsPart3"), {
                                useCORS: true,
                                imageTimeout: 2000,
                                scale: 1,
                                background :'#FFFFFF'
                            }).then(function(canvas) {
                                var img = canvas.toDataURL("image/jpeg", 1.0);
                                window.URL.revokeObjectURL(img);
                                pdf.addPage();
                                pdf.addImage(img, 'JPEG', 5, 5, 350, 100);
                                pdf.save(filename);
                            });
                        }else{
                            pdf.save(filename);
                        }
                    });
                }else{
                    pdf.save(filename);
                }
            });
        }        
    }
});

app.controller('transactionLogController', function ($scope, $http, $filter, storeDataService) {
    'use strict';

    var asc = true;

    $scope.initializeTransaction = function () {
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

    $http.get('/getAllTransaction').then(function (response) {
        $scope.transactionList = response.data;
        $scope.totalItems = $scope.transactionList.length;
    });


    $scope.orderBy = function (property) {
        $scope.transactionList = $filter('orderBy')($scope.transactionList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('deliveryController', function ($scope, $http, $filter, storeDataService) {
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

    $scope.viewbdaf = function (bdafID) {
        window.location.href = '#/bdaf-details/' + bdafID;
    }




    $scope.currentStatus = {
        "status": true
    }

    function getAllBdaf() {
        $http.post('/getAllBdaf').then(function (response) {

            $scope.bdafList = response.data;


            console.log("BDAF data received by controller");
            console.log(response.data);
        });
    }

    function getBdafDetails() {
        $http.post('/getAllBdaf').then(function (response) {

            $scope.bdafDetailsList = response.data;
        });
    }
    $scope.addBdaf = function () {
        $scope.bdaf.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.bdaf.preparedBy = window.sessionStorage.getItem('owner');

        $http.post('/addBdaf', $scope.bdaf).then(function (response) {
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
        $http.post('/getUnassignedBinRequests').then(function (response) {
            d
            $scope.binRequestList = response.data;
        });
    }

    function getUnassignedBinRequests() {
        $http.post('/getUnassignedBinRequests').then(function (response) {

            $scope.binRequestList = response.data;
            console.log($scope.binRequestList);
        });
    }
    $scope.selectRequest = function (request) {
        if (request.selected) {
            $scope.selectedRequests.push(request);
        } else {
            $scope.selectedRequests.splice($scope.selectedRequests.indexOf(request), 1);
        }

        console.log($scope.selectedRequests);
    }
    $scope.assignRequests = function () {
        var x = 0;
        for (x = 0; x < $scope.selectedRequests.length; x++) {
            var request = {};
            $scope.selectedRequests[x].bdafID = $scope.bdafID
            request = $scope.selectedRequests[x];
            console.log(request);

            $http.post('/assignRequest', request).then(function (response) {

            });


            getUnassignedBinRequests();
        }

    }
    $scope.selectBdafID = function (bdafID) {
        console.log(bdafID)
    }
    $scope.confirmAssign = function () {
        $scope.assignRequests();
        angular.element('#confirmation').modal('toggle');

    }


    getAllBdaf(); //call
    getBdafDetails();
    getUnassignedBinRequests();
});

app.controller('bdafDetailsController', function ($scope, $http, $filter, storeDataService, $routeParams) {


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
    var getBinSize = function () {
        $http.get('/getBinSize').then(function (response) {
            $scope.searchAcrFilter = '';
            $scope.binSizeList = response.data;
        });
    };

    //ASSIGN DRIVER AND GENERAL WORKERS
    var getDrivers = function () {
        $http.post('/getStaffList', {
            "position": 'Driver'
        }).then(function (response) {
            $scope.searchAcrFilter = '';
            $scope.driverList = response.data;
            console.log($scope.driverList);

            $scope.driverButton = true;

        });
    }
    $scope.assignDriver = function (driver) {
        $scope.driverButton = false;

        $scope.bdaf.driver = driver.staffName
        $scope.bdaf[0].driverID = driver.staffID;
        $http.post('/assignDriver', $scope.bdaf[0]).then(function (response) {

        });
    }
    $scope.clearDriver = function () {
        $scope.driverButton = true;

        $scope.bdaf.driver = '';
    }
    var getGeneralWorkers = function () {
        $http.post('/getStaffList', {
            "position": 'General Worker'
        }).then(function (response) {
            $scope.searchAcrFilter = '';
            $scope.generalWorkerList = response.data;
            console.log($scope.generalWorkerList);

            $scope.generalWorkerButton = true;
            $scope.bdaf.generalWorker = [];

        });
    }
    $scope.assignGeneralWorker = function (generalWorker, index) {
        $scope.generalWorkerButton = false;

        $scope.bdaf.generalWorker.push(generalWorker.staffName);
        $scope.generalWorkerList.splice(index, 1);

        if ($scope.generalWorkers == '') {
            $scope.generalWorkers = generalWorker.staffName;
        } else {
            $scope.generalWorkers = $scope.generalWorkers.concat(", ", generalWorker.staffName);
        }

        $scope.bdaf[0].staffID = generalWorker.staffID;
        $http.post('/assignGeneralWorker', $scope.bdaf[0]).then(function (response) {

        });


    }
    $scope.clearGeneralWorker = function () {
        $scope.generalWorkerButton = true;

        $scope.bdaf.generalWorker = [];
        $scope.generalWorkers = '';

        $http.post('/clearGeneralWorker', $scope.bdaf[0]).then(function (response) {

        });

        getGeneralWorkers();
    }



    // ASSIGN BIN DELIVERED AND BIN PULLED
    $scope.assignBinDelivered = function (binDelivered) {

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
    $scope.assignBinPulled = function (binPulled) {

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
    $scope.clearBinDelivered = function () {

        $scope.binDelivered = '';

    }
    $scope.clearBinPulled = function () {

        $scope.binPulled = '';

    }
    $scope.cancelBinDelivered = function () {
        $scope.newBinDeliveredButton = false;
        $scope.newBinDelivered = '';
    }
    $scope.cancelBinPulled = function () {
        $scope.newBinPulledButton = false;
        $scope.newBinPulled = '';
    }
    $scope.revealBinDelivered = function () {
        $scope.newBinDeliveredButton = true;
    }
    $scope.revealBinPulled = function () {
        $scope.newBinPulledButton = true;
    }

    //BDAF ENTRY MAIN FUNCTIONS
    $scope.getBdafInfo = function () {
        $http.post('/getBdafInfo', $scope.bdafID).then(function (response) {

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
            }).then(function (response) {
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
                }).then(function (response) {
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
    $scope.getBdafDetails = function () {
        $http.post('/getBdafDetails', $scope.bdafID).then(function (response) {

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
    $scope.addBdafEntry = function () {
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

        $http.post('/addBdafEntry', $scope.bdafEntry).then(function (response) {

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
    $scope.editBdafEntry = function (request) {

        $scope.editedBdafEntry = request;

        //get binPulled and binDelivered

    }
    $scope.saveBdafEntry = function () {

        console.log($scope.editedBdafEntry);
        $http.post('/updateBdafEntry', $scope.editedBdafEntry).then(function (response) {

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
                $http.post('/completeBinRequest', binRequest).then(function (response) {
                    console.log("Bin Request Completed!")
                });
            } else {
                var binRequest = $scope.bdafDetailsList[x]
                $http.post('/uncompleteBinRequest', binRequest).then(function (response) {
                    console.log("Bin Request Uncompleted!")
                });
            }
        }
    }


    //AUTHORIZATION MODULE
    //CHECKED BY
    $scope.requestAuthorization = function () {
        sendFormForAuthorization($routeParams.bdafID, "bdaf");
        angular.element('#checkConfirmation').modal('toggle');
        $scope.status = 'PENDING';
        $scope.rightStatus = true;
        completeForm();
    };
    $scope.checkForm = function () {
        $scope.status = 'CHECKED';
        checkForm($routeParams.bdafID, "bdaf");

        angular.element('#approveCheck').modal('toggle');
    }
    $scope.rejectForm = function () {
        $scope.status = 'CORRECTION REQUIRED';
        rejectForm($routeParams.bdafID, "bdaf", $scope.bdaf[0].feedback);
        $scope.rightStatus = true;

        angular.element('#rejectForm').modal('toggle');
    }

    //VERIFIED BY
    $scope.requestVerification = function () {
        sendFormForVerification($routeParams.dcsID, "bdaf");
        $scope.rightStatus = true;
        angular.element('#completeConfirmation').modal('toggle');
        $scope.status = 'PENDING';
    };

    //
    $scope.verifyForm = function () {
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
    $(document).ready(function () {
        $('.selectpicker').selectpicker();
        document.getElementById('txtAcrSticker').value = 'NA';
        document.getElementById('txtAcrfNo').value = 'NA';

    });



});

app.controller('damagedBinController', function ($scope, $http, $filter, storeDataService) {
    'use strict';

    $scope.dbrList = [];
    $scope.dbdList = [];
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;


    $scope.viewDbd = function (dbdID) {
        window.location.href = '#/dbd-details/' + dbdID;
    }

    $scope.viewDbr = function (dbrID) {
        window.location.href = '#/dbr-details/' + dbrID;
    }



    $scope.show = angular.copy(storeDataService.show.damagedBin);


    $scope.currentStatus = {
        "status": true
    }

    function getAllDbd() {
        $http.post('/getAllDbd').then(function (response) {
            $scope.dbdList = response.data;

            console.log("DBD data received by controller");
            console.log(response.data);
        });
    }

    function getAllDbr() {
        $http.post('/getAllDbr', $scope.currentStatus).then(function (response) {
            $scope.searchAcrFilter = '';
            $scope.dbrList = response.data;

            console.log("DBR data received by controller");
            console.log(response.data);
        });
    }



    $scope.addDbr = function () {
        var position = window.sessionStorage.getItem('owner');
        console.log(position);
        $scope.dbr.preparedBy = position;
        $scope.dbr.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.dbr.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addDbr', $scope.dbr).then(function (response) {
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

    $scope.addDbd = function () {
        var position = window.sessionStorage.getItem('owner');

        $scope.dbd.preparedBy = position;
        $scope.dbd.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.dbd.periodFrom = $filter('date')($scope.dbd.periodFrom, 'yyyy-MM-dd HH:mm:ss');
        $scope.dbd.periodTo = $filter('date')($scope.dbd.periodTo, 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addDbd', $scope.dbd).then(function (response) {
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

app.controller('dbdDetailsController', function ($scope, $http, $filter, storeDataService, $routeParams) {

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
        $http.post('/getDbdInfo', $scope.dbdID).then(function (response) {

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
            $http.post('/getDbdDetails', $scope.dbd[0]).then(function (response) {

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
        $scope.requestAuthorization = function () {
            sendFormForAuthorization($routeParams.dbdID, "dbd");
            angular.element('#checkConfirmation').modal('toggle');
            $scope.rightStatus = true;
            $scope.status = 'PENDING';
        };
        $scope.checkForm = function () {
            $scope.status = 'CHECKED';

            //UPDATE DBR WITH BD INPUT
            console.log($scope.dbd);
            $http.post('/checkForm', $scope.dbd[0]).then(function (response) {
                checkForm($routeParams.dbdID, "dbd");
            });


            angular.element('#approveCheck').modal('toggle');
        }
        $scope.rejectForm = function () {
            $scope.status = 'CORRECTION REQUIRED';
            rejectForm($routeParams.dbdID, "dbd", $scope.dbd[0].feedback);
            $scope.rightStatus = false;

            angular.element('#rejectForm').modal('toggle');
        }

        //VERIFIED BY
        $scope.requestVerification = function () {
            sendFormForVerification($routeParams.dbdID, "dbd");
            angular.element('#completeConfirmation').modal('toggle');
            $scope.status = 'PENDING';
        };


        $scope.verifyForm = function () {
            $scope.status = 'COMPLETE';
            verifyForm($routeParams.dbdID, "dbd");
            $scope.rightStatus = false;
            angular.element('#approveVerification').modal('toggle');
        }
    }


    getAllDbd();
});

app.controller('dbrDetailsController', function ($scope, $http, $filter, storeDataService, $routeParams) {

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
        $http.post('/getDbrInfo', $scope.dbrID).then(function (response) {

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
        $http.post('/getDbrDetails', $scope.dbrID).then(function (response) {

            $scope.dbrDetailsList = response.data;
            console.log($scope.dbrDetailsList);
        });
    }

    //AUTHORIZATION MODULE
    //CHECKED BY
    $scope.requestAuthorization = function () {
        sendFormForAuthorization($routeParams.dbrID, "dbr");
        angular.element('#checkConfirmation').modal('toggle');
        $scope.rightStatus = true;
        $scope.status = 'PENDING';
    };
    $scope.checkForm = function () {
        $scope.status = 'CHECKED';

        //UPDATE DBR WITH BD INPUT
        console.log($scope.dbr);
        $http.post('/updateDbrBD', $scope.dbr[0]).then(function (response) {
            checkForm($routeParams.dbrID, "dbr");
        });


        angular.element('#approveCheck').modal('toggle');
    }
    $scope.rejectForm = function () {
        $scope.status = 'CORRECTION REQUIRED';
        rejectForm($routeParams.dbrID, "dbr", $scope.dbr[0].feedback);
        $scope.rightStatus = false;

        angular.element('#rejectForm').modal('toggle');
    }

    //VERIFIED BY
    $scope.requestVerification = function () {
        sendFormForVerification($routeParams.dbrID, "dbr");
        angular.element('#completeConfirmation').modal('toggle');
        $scope.status = 'PENDING';
    };


    $scope.verifyForm = function () {
        $scope.status = 'COMPLETE';
        verifyForm($routeParams.dbrID, "dbr");
        $scope.rightStatus = false;
        angular.element('#approveVerification').modal('toggle');
    }

    getDbrInfo();
    getDbrDetails();

});

app.controller('lostBinController', function ($scope, $http, $filter, storeDataService) {
    'use strict';

    $scope.blostList = [];
    $scope.areaList = [];

    console.log("LOST BIN MANAGEMENT ACTIVATED!!");

    $scope.viewblost = function (blostID) {
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
        $http.post('/getAllBlost', $scope.currentStatus).then(function (response) {
            $scope.searchAcrFilter = '';
            $scope.blostList = response.data;

            console.log("BLOST data received by controller");
            console.log(response.data);
        });

        $http.post('/getAreaList').then(function (response) {
            $scope.searchAcrFilter = '';
            $scope.areaList = response.data;
        });

    }

    getAllBlost();

    $scope.statusList = true;
    $scope.updateStatusList = function () {
        if ($scope.statusList) {
            $scope.currentStatus.status = true;
        } else {
            $scope.currentStatus.status = false;
        }
        getAllDcs(); //call
    }

    $scope.addBlost = function () {
        var position = window.sessionStorage.getItem('owner');
        console.log(position);
        $scope.blost.preparedBy = position;
        $scope.blost.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addBlost', $scope.blost).then(function (response) {
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

app.controller('blostDetailsController', function ($scope, $http, $filter, storeDataService, $routeParams) {


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





    $http.post('/getBlostInfo', $scope.blostID).then(function (response) {

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
        $http.get('/getBlostCustomerList').then(function (response) {
            $scope.customerList = response.data;
            console.log($scope.customerList);
        });
    }

    function getBlostDetails() {
        $http.post('/getBlostDetails', $scope.blostID).then(function (response) {

            $scope.blostDetailsList = response.data;
            console.log($scope.blostDetailsList);
        });
    }
    $scope.addBlostEntry = function () {
        $scope.blostEntry.blostID = $routeParams.blostID;
        console.log($scope.blostEntry);

        $scope.blostEntry.formattedDateOfLoss = $filter('date')($scope.blostEntry.dateOfLoss, 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addBlostEntry', $scope.blostEntry).then(function (response) {

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
    $scope.assignCustomer = function (customer) {
        if (customer.company == null) {
            $scope.blostEntry.name = customer.name;
        } else {
            $scope.blostEntry.name = customer.companyName + ", " + customer.name;
        }
    }
    $scope.editBlostEntry = function (blostEntry) {
        $scope.editedBlostEntry = blostEntry;
    }
    $scope.saveBlostEntry = function () {
        $http.post('/editBlostEntry', $scope.editedBlostEntry).then(function (response) {

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
    $scope.requestAuthorization = function () {
        sendFormForAuthorization($routeParams.blostID, "blost");
        $scope.status = 'PENDING';
    };

    $scope.checkForm = function () {
        $scope.status = 'CHECKED';
        checkForm($routeParams.blostID, "blost");

        angular.element('#approveCheck').modal('toggle');
    }
    $scope.rejectForm = function () {
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

    $http.post('/checkForm', formDetails).then(function (response) {

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

    $http.post('/verifyForm', formDetails).then(function (response) {

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

    $http.post('/rejectForm', formDetails).then(function (response) {

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

    $http.post('/sendFormForAuthorization', formDetails).then(function (response) {

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
