app.directive('appFilereader', function($q) {
    'use strict';
    var slice = Array.prototype.slice;

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
                if (!ngModel) {return;}

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
                            if (element.multiple) {ngModel.$setViewValue(values);}
                            else {ngModel.$setViewValue(values.length ? values[0] : null);}
                        });

                }); //change

            } //link
    }; //return
});
app.directive("strToTime", function(){
   return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModelController) {
        ngModelController.$parsers.push(function(data) {     
            if (!data)
                return "";
            return ("0" + data.getHours().toString()).slice(-2) + ":" + ("0" + data.getMinutes().toString()).slice(-2);
        });
    
        ngModelController.$formatters.push(function(data) {
            if (!data) {
                return null; 
            }
            var d = new Date(1970, 1, 1);
            var splitted = data.split(":");
            d.setHours(splitted[0]);
            d.setMinutes(splitted[1]);
          return d;
        });
      }
    };
});
app.controller('dailyController', function ($scope, $window, $routeParams, $http, $filter) {
    'use strict';
    
    $scope.circleID = 0;
    $scope.rectangleID = 0;
    $scope.shape = 'circle';
    var centerArray = [], rectArray = [];

    $scope.report = {
        "areaCode": $routeParams.areaCode,
        "collectionDate": '',
        "startTime": '',
        "endTime": '',
        "truck": '',
        "driver": '',
        "ton": '',
        "remark": '',
        "ifleetImg": '',
        "lng": '',
        "lat": '',
        "address": '',
        "marker": centerArray,
        "rectangle": rectArray,
        "creationDate": '',
        "status" : ''
    };
    
    angular.element('.btnShape').click(function () {
        $scope.shape = angular.element(this).data('shape');
    });
    
    
    $scope.report.collectionDate = new Date($filter("date")(Date.now(), 'yyyy-MM-dd'));

    $scope.startTimeChange = function(time) {
        $scope.report.startTime = time == undefined ? "" : time;
    };
    
    $scope.endTimeChange = function(time) {
        $scope.report.endTime = time == undefined ? "" : time;
    };
    
    $scope.truckList = [];
    $scope.driverList = [];
   
//    var params = $routeParams.areaCode;
//    var areaCode = params.split("+")[0];
//    var areaName = params.split("+")[1];
//    
//    $scope.$params_areaName = areaName;
    $scope.params = {
        "areaCode": $routeParams.areaCode,
        "areaName" : $routeParams.areaName
    };
//    $scope.report.area = areaCode;
    
    $http.get('/getTruckList').then(function (response) {
        $scope.truckList = response.data;
    });
    
    $http.get('/getDriverList').then(function (response) {
        $scope.driverList = response.data;
    });
    
    $http.post('/getAreaLngLat',$scope.params).then(function (response) {
        console.log(response.data);
        var $googleMap = document.getElementById('googleMap');
        var visualizeMap = {
            center: new google.maps.LatLng(1, 1),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            panControl: false,
            zoomControl: false,
            streetViewControl: false,
            disableDefaultUI: true,
            editable: false
        };

       var map = new google.maps.Map($googleMap, visualizeMap);

        // OnClick add Marker and get address
        google.maps.event.addListener(map, "click", function (e) {
            var latLng, latitude, longtitude, circle, rectangle;

            latLng = e.latLng;
            latitude = latLng.lat();
            longtitude = latLng.lng();

            if ($scope.shape == "circle") {
                $scope.circleID++;
                circle = new google.maps.Circle({
                    id: $scope.circleID,
                    map: map,
                    center: new google.maps.LatLng(latitude, longtitude),
                    radius: 200,
                    fillColor: 'transparent',
                    strokeColor: 'red',
                    editable: true,
                    draggable: true
                });
                centerArray.push({"cLat": circle.getCenter().lat(), "cLong": circle.getCenter().lng(), "radius": circle.getRadius()});

                google.maps.event.addListener(circle, "radius_changed", function () {
                    $.each(centerArray, function (index, value) {
                        if (circle.id == (index + 1)) {
                            centerArray[index].radius = circle.getRadius();
                        }
                    });
                });
                google.maps.event.addListener(circle, "center_changed", function () {
                    $.each(centerArray, function (index, value) {
                        if (circle.id == (index + 1)) {
                            centerArray[index].lat = circle.getCenter().lat();
                            centerArray[index].lng = circle.getCenter().lng();
                        }
                    });
                });
            } else if ($scope.shape == "rectangle") {
                $scope.rectangleID++;
                rectangle = new google.maps.Rectangle({
                    id: $scope.rectangleID,
                    strokeColor: '#FF0000',
                    strokeWeight: 2,
                    fillColor: 'transparent',
                    map: map,
                    editable: true,
                    draggable: true,
                    center: new google.maps.LatLng(latitude, longtitude),
                    bounds: new google.maps.LatLngBounds (
                        new google.maps.LatLng (latitude, longtitude),
                        new google.maps.LatLng (latitude+0.001, longtitude+0.001),
                    )
                });
                rectArray.push({"neLat": rectangle.getBounds().getNorthEast().lat(), "neLng": rectangle.getBounds().getNorthEast().lng(), "swLat": rectangle.getBounds().getSouthWest().lat(), "swLng": rectangle.getBounds().getSouthWest().lng()});

                google.maps.event.addListener(rectangle, "bounds_changed", function () {
                    var bounds =  rectangle.getBounds();
                    var ne = bounds.getNorthEast();
                    var sw = bounds.getSouthWest();
                    $.each(rectArray, function (index, value) {
                        if (rectangle.id == (index + 1)) {
                            rectArray[index].neLat = ne.lat();
                            rectArray[index].neLng = ne.lng();
                            rectArray[index].swLat = sw.lat();
                            rectArray[index].swLng = sw.lng();
                        }
                    });
                });
            }


    //                    var marker = new google.maps.Marker({
    //                        position: new google.maps.LatLng(latitude, longtitude),
    //                        title: 'Marker',
    //                        map: map,
    //                        draggable: true
    //                    });
    //
    //                    var geocoder = new google.maps.Geocoder();
    //                    geocoder.geocode({'address': 'Kuching, MY'}, function(results, status) {
    //                        if (status == google.maps.GeocoderStatus.OK) {
    //                            alert("Location: " + results[0].geometry.location.lat() + " " + results[0].geometry.location.lng() + " " + results[0].formatted_address);
    //                        } else {
    //                            alert("Something got wrong " + status);
    //                        }
    //                    });
        });
                       
        $window.setTimeout(function () {
            map.panTo(new google.maps.LatLng(response.data[0].latitude, response.data[0].longitude));
            map.setZoom(17);
        }, 1000);
    });
    

    
    $scope.addReport = function () {
        $scope.report.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addReport', $scope.report).then(function (response) {
            var returnedData = response.data;
            var newReportID = returnedData.details.reportID;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    message: "Report added successfully!"
                });
                socket.emit('make report', {"reportID": newReportID, "owner": $window.sessionStorage.getItem("owner")});
                window.location.href = '#/reporting';
            }
        });
    };
    
    (function($) {
        var defaults;
        $.event.fix = (function(originalFix) {
            return function(event) {
                event = originalFix.apply(this, arguments);
                if (event.type.indexOf("copy") === 0 || event.type.indexOf("paste") === 0) {
                    event.clipboardData = event.originalEvent.clipboardData;
                }
                return event;
            };
        })($.event.fix);
        defaults = {
            callback: $.noop,
            matchType: /image.*/
        };
        return ($.fn.pasteImageReader = function(options) {
            if (typeof options === "function") {
                options = {
                    callback: options
                };
            }
            options = $.extend({}, defaults, options);
            return this.each(function() {
                var $this, element;
                element = this;
                $this = $(this);
                return $this.bind("paste", function(event) {
                    var clipboardData, found;
                    found = false;
                    clipboardData = event.clipboardData;
                    return Array.prototype.forEach.call(clipboardData.types, function(type, i) {
                        var file, reader;
                        if (found) {
                            return;
                        }
                        if (
                            type.match(options.matchType) ||
                            clipboardData.items[i].type.match(options.matchType)
                        ) {
                            file = clipboardData.items[i].getAsFile();
                            reader = new FileReader();
                            reader.onload = function(evt) {
                                return options.callback.call(element, {
                                    dataURL: evt.target.result,
                                    event: evt,
                                    file: file,
                                    name: file.name
                                });
                            };
                            reader.readAsDataURL(file);
                            snapshoot();
                            return (found = true);
                        }
                    });
                });
            });
        });
    })(jQuery);
    
    var dataURL, filename;
    $("html").pasteImageReader(function(results) {
        filename = results.filename, dataURL = results.dataURL;
        $data.text(dataURL);
        $size.val(results.file.size);
        $type.val(results.file.type);
        var img = document.createElement("img");
        img.src = dataURL;
        $scope.report.ifleetImg = dataURL;
        var w = img.width;
        var h = img.height;
        $width.val(w);
        $height.val(h);
        return $(".active")
            .css({
                backgroundImage: "url(" + dataURL + ")"
            })
            .data({ width: w, height: h });
    });

    var $data, $size, $type, $width, $height;
    $(function() {
        $data = $(".data");
        $size = $(".size");
        $type = $(".type");
        $width = $("#width");
        $height = $("#height");
        $(".target").on("click", function() {
            var $this = $(this);
            var bi = $this.css("background-image");
            if (bi != "none") {
                $data.text(bi.substr(4, bi.length - 6));
            }

            $(".active").removeClass("active");
            $this.addClass("active");

            //$this.toggleClass("contain");

            $width.val($this.data("width"));
            $height.val($this.data("height"));
            if ($this.hasClass("contain")) {
                $this.css({
                    width: $this.data("500px"),
                    height: $this.data("height"),
                    "z-index": "10"
                });
            } else {
                $this.css({ width: "", height: "", "z-index": "" });
            }
        });
    });

    function copy(text) {
        var t = document.getElementById("base64");
        t.select();
        try {
            var successful = document.execCommand("copy");
            var msg = successful ? "successfully" : "unsuccessfully";
            alert("Base64 data coppied " + msg + " to clipboard");
        } catch (err) {
            alert("Unable to copy text");
        }
    }
});

app.controller('reportingController', function ($scope, $http, $filter, $window) {
    'use strict';
    $scope.searchReportFilter = '';
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 8; //Record number each page
    $scope.maxSize = 10; //Show the number in page
    $scope.areaList = [];
    $scope.filterReportList = [];
    
    $scope.reportingOfficerId = {
        "officerid" : $window.sessionStorage.getItem('owner')
    };
    
    $http.post('/getReportingAreaList', $scope.reportingOfficerId).then(function (response) {
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
            $scope.areaList.push({"zone": { "id": value.zoneID, "name": value.zoneName } ,"area": area});
           
        });
    });
    
    $http.get('/getReportList').then(function(response){
        $scope.reportList = response.data;
        $.each($scope.reportList, function (index, value) {
            $scope.reportList[index].reportCollectionDate = $filter('date')($scope.reportList[index].reportCollectionDate, 'yyyy-MM-dd');
        });
        
        $scope.filterReportList = angular.copy($scope.reportList);
        
        $scope.searchReport = function (report) {
            return (report.reportID + report.reportCollectionDate + report.areaName + report.reportStatus + report.frequency + report.remark).toUpperCase().indexOf($scope.searchReportFilter.toUpperCase()) >= 0;
        }
        
        $scope.totalItems = $scope.filterReportList.length;

        $scope.getData = function () {
            return $filter('filter')($scope.filterReportList, $scope.searchReportFilter);
        };
        
        $scope.$watch('searchReportFilter', function (newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);
    });
    
    $scope.viewReport = function(reportCode){
        setTimeout(function () {
            window.location.href = '#/view-report/' + reportCode; // +"+"+ name
        }, 500);
    }

    $scope.thisArea = function (id,name) {
        angular.element('#chooseArea').modal('toggle');
        setTimeout(function () {
            window.location.href = '#/daily-report/' + id  +"/"+ name
        }, 500);
    };

    //filtering by column asc and desc
    var asc = true;
    $scope.orderBy = function (property) {
        $scope.reportList = $filter('orderBy')($scope.reportList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('viewReportController', function($scope, $http, $routeParams, $window, $filter){
    $scope.bin = "";
    //$scope.acr = "";
    var map;
    
    function GMapCircle(lat, lng, circleArr, detail = 8) {
        var uri = 'https://maps.googleapis.com/maps/api/staticmap?';
        var staticMapSrc = 'center=' + lat + ',' + lng;
        staticMapSrc += '&size=650x650';
        staticMapSrc += '&path=color:0xFF0000FF|weight:1|';
        var r    = 6371;
        var pi   = Math.PI;
        
        $.each(circleArr, function (index, value) {
            var _lat  = (value.lat * pi) / 180;
            var _lng  = (value.lng * pi) / 180;
            var d    = (value.radius/1000) / r;
            var i = 0;

            for(i = 0; i <= 360; i += detail) {
                var brng = i * pi / 180;
                var pLat = Math.asin(Math.sin(_lat) * Math.cos(d) + Math.cos(_lat) * Math.sin(d) * Math.cos(brng));
                var pLng = ((_lng + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(_lat), Math.cos(d) - Math.sin(_lat) * Math.sin(pLat))) * 180) / pi;
                    pLat = (pLat * 180) / pi;
                if (staticMapSrc.slice(-32) == "&path=color:0xFF0000FF|weight:1|") {
                    staticMapSrc += pLat + "," + pLng;
                } else {
                    staticMapSrc += "|" + pLat + "," + pLng;
                }
            }
            if (index != circleArr.length) {
                staticMapSrc += "&path=color:0xFF0000FF|weight:1|";
            }
        });
        return uri + encodeURI(staticMapSrc) + '&key=<APIKEY>';
    }
    
    $scope.report = {
        "reportID": $routeParams.reportCode
    };
    $scope.reportID = $routeParams.reportCode;
    
    $scope.thisReport = {
        "acr": [],
        "date" : ""
    };
    
    $http.post('/getReport', $scope.report).then(function(response){
        $scope.thisReport = response.data[0];
        $scope.thisReport.date = $filter('date')($scope.thisReport.date, 'yyyy-MM-dd');

        $scope.area = {
            "areaID": $scope.thisReport.area
        };
        
        var $googleMap = document.getElementById('googleMap');
        var visualizeMap = {
            center: new google.maps.LatLng(1, 1),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            panControl: false,
            zoomControl: false,
            streetViewControl: false,
            disableDefaultUI: true,
            editable: false
        };

        map = new google.maps.Map($googleMap, visualizeMap);

        $window.setTimeout(function () {
            map.panTo(new google.maps.LatLng($scope.thisReport.lat, $scope.thisReport.lng));
            map.setZoom(17);
        }, 1000);
        
        $http.post('/getReportBinCenter', $scope.area).then(function(response){
            $scope.thisReport.bin = response.data;
            $scope.row = Object.keys($scope.thisReport.bin).length;
            $.each($scope.thisReport.bin, function (index, value) {
                $scope.bin += value.name;
                if ((index + 1) != $scope.row) {
                    $scope.bin += ', ';
                }
            });
        });
    });
    
//    $http.post('/getReportACR', $scope.report).then(function (response) {
//        if(response.data.length != 0){
//            $scope.thisReport.acr = response.data;            
//        }
//        else{
//            $scope.thisReport.acr = [];
//        }
//        $scope.acrRow = Object.keys($scope.thisReport.acr).length;
//        $.each($scope.thisReport.acr, function (index, value) {
//            $scope.acr += value.name;
//            if ((index + 1) != $scope.acrRow) {
//                $scope.acr += ', ';
//            }
//        });
//    });
    
    $http.post('/getReportCircle', $scope.report).then(function (response) {
        var data = response.data;
        $window.setTimeout(function () {
        $.each(data, function (index, value) {
            var circle = new google.maps.Circle({
                map: map,
                center: new google.maps.LatLng(data[index].cLat, data[index].cLong),
                radius: parseFloat(data[index].radius),
                fillColor: 'transparent',
                strokeColor: 'red',
                editable: false,
                draggable: false
            });
        });
        }, 1000);
    });
    
//    $window.setTimeout(function() {
//        var image = GMapCircle($scope.thisReport.lat, $scope.thisReport.lng, $scope.circles);
//        $('.googleMap').attr("src", image);
//    }, 1000);
    
    $http.post('/getReportRect', $scope.report).then(function (response) {
        var data = response.data;
        $window.setTimeout(function () {
            $.each(data, function(index, value) {
                var rect = new google.maps.Rectangle({
                    map: map,
                    bounds: new google.maps.LatLngBounds (
                        new google.maps.LatLng (data[index].swLat, data[index].swLng),
                        new google.maps.LatLng (data[index].neLat, data[index].neLng),
                    ),
                    fillColor: 'transparent',
                    strokeColor: 'red',
                    editable: false,
                    draggable: false
                });
            })
        }, 1000);
    });
    
    $scope.editReport = function () {
            window.location.href = '#/edit-report/' + $scope.thisReport.id;
    };
    
});

app.controller('editReportController', function($scope, $http, $routeParams, $window, $filter){
    $scope.reportCode = $routeParams.reportCode;
    $scope.reportObj = {
        "reportID": $routeParams.reportCode
    };
    $scope.truckList = [];
    $scope.driverList = [];

    $scope.circleID = 0;
    $scope.rectangleID = 0;
    $scope.shape = 'circle';
    var centerArray = [], rectArray = [];

    angular.element('.btnShape').click(function () {
        $scope.shape = angular.element(this).data('shape');
    });
    
//    $scope.editField = {
//        "collectionDate" : "",
//        "startTime" : "",
//        "endTime" : "",
//        "truck" : "",
//        "driver" : "",
//        "status" : "",
//        "ton" : "",
//        "remark" : "",
//        "ifleet" : ""
//    }
    
    $http.post('/getReport',$scope.reportObj).then(function(response){
        
        $scope.editField = response.data[0];
        $scope.editField.date = new Date(response.data[0].date);
        
        var $googleMap = document.getElementById('googleMap');
        var visualizeMap = {
            center: new google.maps.LatLng(1, 1),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            panControl: false,
            zoomControl: false,
            streetViewControl: false,
            disableDefaultUI: true,
            editable: false
        };

        map = new google.maps.Map($googleMap, visualizeMap);

        $window.setTimeout(function () {
            map.panTo(new google.maps.LatLng($scope.editField.lat, $scope.editField.lng));
            map.setZoom(17);
        }, 1000);
        
        // OnClick add Marker and get address
        google.maps.event.addListener(map, "click", function (e) {
            var latLng, latitude, longtitude, circle, rectangle;

            latLng = e.latLng;
            latitude = latLng.lat();
            longtitude = latLng.lng();

            if ($scope.shape == "circle") {
                $scope.circleID++;
                circle = new google.maps.Circle({
                    id: $scope.circleID,
                    map: map,
                    center: new google.maps.LatLng(latitude, longtitude),
                    radius: 200,
                    fillColor: 'transparent',
                    strokeColor: 'red',
                    editable: true,
                    draggable: true
                });
                centerArray.push({"cLat": circle.getCenter().lat(), "cLong": circle.getCenter().lng(), "radius": circle.getRadius()});


                google.maps.event.addListener(circle, "radius_changed", function () {
                    $.each(centerArray, function (index, value) {
                        if (circle.id == (index + 1)) {
                            centerArray[index].radius = circle.getRadius();
                        }
                    });
                });
                google.maps.event.addListener(circle, "center_changed", function () {
                    $.each(centerArray, function (index, value) {
                        if (circle.id == (index + 1)) {
                            console.log(index);
                            centerArray[index].cLat = circle.getCenter().lat();
                            centerArray[index].cLong = circle.getCenter().lng();
                        }
                    });
                });
            } else if ($scope.shape == "rectangle") {
                $scope.rectangleID++;
                rectangle = new google.maps.Rectangle({
                    id: $scope.rectangleID,
                    strokeColor: '#FF0000',
                    strokeWeight: 2,
                    fillColor: 'transparent',
                    map: map,
                    editable: true,
                    draggable: true,
                    center: new google.maps.LatLng(latitude, longtitude),
                    bounds: new google.maps.LatLngBounds (
                        new google.maps.LatLng (latitude, longtitude),
                        new google.maps.LatLng (latitude+0.001, longtitude+0.001),
                    )
                });
                rectArray.push({"neLat": rectangle.getBounds().getNorthEast().lat(), "neLng": rectangle.getBounds().getNorthEast().lng(), "swLat": rectangle.getBounds().getSouthWest().lat(), "swLng": rectangle.getBounds().getSouthWest().lng()});

                google.maps.event.addListener(rectangle, "bounds_changed", function () {
                    var bounds =  rectangle.getBounds();
                    var ne = bounds.getNorthEast();
                    var sw = bounds.getSouthWest();
                    $.each(rectArray, function (index, value) {
                        if (rectangle.id == (index + 1)) {
                            rectArray[index].neLat = ne.lat();
                            rectArray[index].neLng = ne.lng();
                            rectArray[index].swLat = sw.lat();
                            rectArray[index].swLng = sw.lng();
                        }
                    });
                });
            }
            
        });

        $http.post('/getReportCircle', $scope.reportObj).then(function (response) {
            var data = response.data;
            $window.setTimeout(function () {
            $.each(data, function (index, value) {
                $scope.circleID++;
                var circle = new google.maps.Circle({
                    id: $scope.circleID,
                    map: map,
                    center: new google.maps.LatLng(data[index].cLat, data[index].cLong),
                    radius: parseFloat(data[index].radius),
                    fillColor: 'transparent',
                    strokeColor: 'red',
                    editable: true,
                    draggable: true
                });
                centerArray.push({"cLat": circle.getCenter().lat(), "cLong": circle.getCenter().lng(), "radius": circle.getRadius()});
                
                google.maps.event.addListener(circle, "radius_changed", function () {
                    $.each(centerArray, function (index, value) {
                        if (circle.id == (index + 1)) {
                            centerArray[index].radius = circle.getRadius();
                        }
                    });
                });
                google.maps.event.addListener(circle, "center_changed", function () {
                    $.each(centerArray, function (index, value) {
                        if (circle.id == (index + 1)) {
                            centerArray[index].lat = circle.getCenter().lat();
                            centerArray[index].lng = circle.getCenter().lng();
                        }
                    });
                });
            });
            }, 1000);

        });
        
        $http.post('/getReportRect', $scope.reportObj).then(function (response) {
            var data = response.data;
            $window.setTimeout(function () {
                $.each(data, function(index, value) {
                    $scope.rectangleID++;
                    var rectangle = new google.maps.Rectangle({
                        id: $scope.rectangleID,
                        map: map,
                        center: new google.maps.LatLng(data[index].lat, data[index].lng),
                        bounds: new google.maps.LatLngBounds (
                            new google.maps.LatLng (data[index].swLat, data[index].swLng),
                            new google.maps.LatLng (data[index].neLat, data[index].neLng),
                        ),
                        fillColor: 'transparent',
                        strokeColor: 'red',
                        strokeWeight: 2,
                        editable: true,
                        draggable: true
                    });
                    rectArray.push({"neLat": rectangle.getBounds().getNorthEast().lat(), "neLng": rectangle.getBounds().getNorthEast().lng(), "swLat": rectangle.getBounds().getSouthWest().lat(), "swLng": rectangle.getBounds().getSouthWest().lng()});

                    google.maps.event.addListener(rectangle, "bounds_changed", function () {
                        var bounds =  rectangle.getBounds();
                        var ne = bounds.getNorthEast();
                        var sw = bounds.getSouthWest();
                        $.each(rectArray, function (index, value) {
                            if (rectangle.id == (index + 1)) {
                                rectArray[index].neLat = ne.lat();
                                rectArray[index].neLng = ne.lng();
                                rectArray[index].swLat = sw.lat();
                                rectArray[index].swLng = sw.lng();
                            }
                        });
                    });
                })
            }, 1000);
        });        
        
    });
    
    $http.get('/getTruckList').then(function (response) {
        $scope.truckList = response.data;
    });
    
    $http.get('/getDriverList').then(function (response) {
        $scope.driverList = response.data;
    });
    
    $scope.edit = function(){
        $scope.editField.marker = centerArray;
        $scope.editField.rectangle = rectArray;
        
        $http.post('/editReport',$scope.editField).then(function(response){
            var returnedReportData = response.data;   
            
            if (returnedReportData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    message: "Report edit successfully!"
                });
                window.location.href = '#/reporting';
            }
        });
        
              
    };
 
});