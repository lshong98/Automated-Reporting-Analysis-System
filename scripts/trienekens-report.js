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

app.controller('dailyController', function ($scope, $window, $routeParams, $http, $filter) {
    'use strict';
    
    $scope.circleID = 0;
    var centerArray = [];

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
        "creationDate": ''
    };
    
    $scope.report.collectionDate = new Date($filter("date")(Date.now(), 'yyyy-MM-dd'));

    $scope.startTimeChange = function(time) {
        $scope.report.startTime = time.toLocaleTimeString();
    };
    
    $scope.endTimeChange = function(time) {
        $scope.report.endTime = time.toLocaleTimeString();
    };
    
    $scope.truckList = [];
    $scope.driverList = [];
   
//    var params = $routeParams.areaCode;
//    var areaCode = params.split("+")[0];
//    var areaName = params.split("+")[1];
//    
//    $scope.$params_areaName = areaName;
    $scope.params = {
        "areaCode": $routeParams.areaCode
    };
//    $scope.report.area = areaCode;
    
    $http.get('/getTruckList').then(function (response) {
        $scope.truckList = response.data;
    });
    
    $http.get('/getDriverList').then(function (response) {
        $scope.driverList = response.data;
    });

    var $googleMap, visualizeMap, map, lat = 0, lng = 0, myPlace, address;
    
    $http.post('/getGoogleLocation', $scope.params).then(function (response) {
        var myPlace = response.data[0];
        console.log(myPlace);
        var area = myPlace.area.replace(" ", "+");
        var zone = myPlace.zone.replace(" ", "+");
        var concat = area + ',' + zone;
        $scope.report.address = concat;
        
        address = "https://maps.googleapis.com/maps/api/geocode/json?address=" + concat + "&key=<APIKEY>";
        
        $http.get(address).then(function (response) {
            function timeToSeconds(time) {
                time = time.split(/:/);
                return time[0] * 3600 + time[1] * 60 + time[2];
            }

            $googleMap = document.getElementById('googleMap');
            visualizeMap = {
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

            // OnClick add Marker and get address
            google.maps.event.addListener(map, "click", function (e) {
                var latLng, latitude, longtitude, circle;
                $scope.circleID++;

                latLng = e.latLng;
                latitude = latLng.lat();
                longtitude = latLng.lng();

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
                centerArray.push({"lat": circle.getCenter().lat(), "lng": circle.getCenter().lng(), "radius": circle.getRadius()});

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

            // JSON data returned by API above
            var myPlace = response.data;

            // After get the place data, re-center the map
            $window.setTimeout(function () {
                var places, location;

                places = myPlace.results[0];
                location = places.formatted_address;
                lat = places.geometry.location.lat;
                lng = places.geometry.location.lng;
                map.panTo(new google.maps.LatLng(lat, lng));
                map.setZoom(17);
                
                $scope.report.lng = lng;
                $scope.report.lat = lat;
            }, 1000);
        });
        

    });
    
    $scope.addReport = function () {
        $scope.report.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        console.log($scope.report.creationDate);
        console.log($scope.report);
        $http.post('/addReport', $scope.report).then(function (response) {
            var returnedData = response.data;
            var newReportID = returnedData.details.reportID;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    message: "Report added successfully!"
                });
               
            }
             //window.location.href = '#/reporting';
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

app.controller('reportingController', function ($scope, $http, $filter) {
    'use strict';
    $scope.searchReportFilter = '';
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 10; //Record number each page
    $scope.maxSize = 10; //Show the number in page
    $scope.areaList = [];

    $http.get('/getAreaList').then(function (response) {
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
         console.log($scope.areaList);
    });
//    $scope.handledArea = [{
//        "zoneCode": 'Z1',
//        "area": [{
//            "areaCode": 'Z1A1',
//            "areaName": 'Zone 1 Area 1'
//        }, {
//            "areaCode": 'Z1A2',
//            "areaName": 'Zone 1 Area 2'
//        }, {
//            "areaCode": 'Z1A3',
//            "areaName": 'Zone 1 Area 3'
//        }, {
//            "areaCode": 'Z1A4',
//            "areaName": 'Zone 1 Area 4'
//        }, {
//            "areaCode": 'Z1A5',
//            "areaName": 'Zone 1 Area 5'
//        }]
//    }, {
//        "zoneCode": 'Z2',
//        "area": [{
//            "areaCode": 'Z2A1',
//            "areaName": 'Zone 2 Area 1'
//        }, {
//            "areaCode": 'Z2A2',
//            "areaName": 'Zone 2 Area 2'
//        }, {
//            "areaCode": 'Z2A3',
//            "areaName": 'Zone 2 Area 3'
//        }, {
//            "areaCode": 'Z2A4',
//            "areaName": 'Zone 2 Area 4'
//        }, {
//            "areaCode": 'Z2A5',
//            "areaName": 'Zone 2 Area 5'
//        }]
//    }, {
//        "zoneCode": 'Z3',
//        "area": [{
//            "areaCode": 'Z3A1',
//            "areaName": 'Zone 3 Area 1'
//        }, {
//            "areaCode": 'Z3A2',
//            "areaName": 'Zone 3 Area 2'
//        }, {
//            "areaCode": 'Z3A3',
//            "areaName": 'Zone 3 Area 3'
//        }, {
//            "areaCode": 'Z3A4',
//            "areaName": 'Zone 3 Area 4'
//        }, {
//            "areaCode": 'Z3A5',
//            "areaName": 'Zone 3 Area 5'
//        }]
//    }];

    $scope.thisArea = function (id,name) {
        angular.element('#chooseArea').modal('toggle');
        setTimeout(function () {
            window.location.href = '#/daily-report/' + id; // +"+"+ name
        }, 500);
    };

    $scope.reportList = [{
        "reportCode": '0001',
        "reportDate": '17/05/2019',
        "area": 'Tabuan Jaya',
        "collection": 'Tue & Fri',
        "status": 'Completed',
        "garbageAmount": '50',
        "remark": 'Sing Hong'
    }, {
        "reportCode": '0002',
        "reportDate": '16/05/2019',
        "area": 'Tabuan Jaya',
        "collection": 'Tue & Fri',
        "status": 'Completed',
        "garbageAmount": '50',
        "remark": 'Felix'
    }, {
        "reportCode": '0003',
        "reportDate": '15/05/2019',
        "area": 'Tabuan Jaya',
        "collection": 'Tue & Fri',
        "status": 'Completed',
        "garbageAmount": '50',
        "remark": 'Steven'
    }, {
        "reportCode": '0004',
        "reportDate": '14/05/2019',
        "area": 'Tabuan Jaya',
        "collection": 'Tue & Fri',
        "status": 'Completed',
        "garbageAmount": '50',
        "remark": 'Others'
    }];

    
    $scope.filterReportList = [];
    $scope.searchReport = function (report) {
        return (report.reportCode + report.reportDate + report.area + report.collection + report.status + report.garbageAmount + report.remark).toUpperCase().indexOf($scope.searchReportFilter.toUpperCase()) >= 0;
    }
    
    $.each($scope.reportList, function (index) {
        $scope.filterReportList = angular.copy($scope.reportList);
    });

    $scope.totalItems = $scope.filterReportList.length;
    console.log($scope.totalItems)

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
    
    //filtering by column asc and desc
    var asc = true;
    $scope.orderBy = function (property) {
        $scope.reportList = $filter('orderBy')($scope.reportList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});