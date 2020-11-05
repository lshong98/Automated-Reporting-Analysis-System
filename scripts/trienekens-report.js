app.controller('dailyController', function($scope, $window, $routeParams, $http, $filter) {
    $scope.showSubmitBtn = true;
    'use strict';

    $scope.circleID = 0;
    $scope.rectangleID = 0;
    $scope.shape = 'circle';
    var centerArray = [],
        rectArray = [];

    $scope.report = {
        "areaCode": $routeParams.areaCode,
        "acr": '',
        "collectionDate": '',
        "startTime": '',
        "endTime": '',
        "format_startTime": '',
        "format_endTime": '',
        "truck": '',
        "driver": '',
        "ton": '',
        "remark": '',
        "ifleetImg": '',
        "lh": '',
        "rttb": '',
        "wt": '',
        "gpswox": '',
        "lng": '',
        "lat": '',
        "address": '',
        "marker": centerArray,
        "rectangle": rectArray,
        "creationDate": '',
        "status": '',
        "colDay": '',
        "staffID" : $window.sessionStorage.getItem('owner')
    };


    angular.element('.btnShape').click(function() {
        $scope.shape = angular.element(this).data('shape');
    });


    $scope.colDate = new Date($filter("date")(Date.now(), 'yyyy-MM-dd'));

    $scope.startTimeChange = function(time) {
        $scope.report.startTime = time == undefined ? "" : time;
    };

    $scope.endTimeChange = function(time) {
        $scope.report.endTime = time == undefined ? "" : time;
    };

    $scope.truckList = [];
    $scope.driverList = [];

    $scope.params = {
        "areaCode": $routeParams.areaCode,
        "areaName": $routeParams.areaName
    };
    
    $scope.getCode = {
        "areaID": $routeParams.areaCode
    }
    //get code
    $http.post('/getAreaCode', $scope.getCode).then(function (response){
        $scope.code = response.data[0].code;
    });
    
    //    $scope.report.area = areaCode;
    $http.post('/getInitTime', $scope.params).then(function(response) {
        $scope.report.startTime = response.data.stime;
        $scope.report.endTime = response.data.etime;
    })

    $http.get('/getTruckList').then(function(response) {
        $scope.truckList = response.data;
    });

    $http.post('/getInitTruck', $scope.params).then(function(response) {
        if (response.data.length == 0) {
            $scope.report.truck = "";
        } else {
            $scope.report.truck = response.data[0].truckID;
        }
    });

    $http.post('/getInitDriver', { "area": $scope.report.areaCode }).then(function(response) {
        $scope.report.driver = response.data[0].driver;
    });

    $http.get('/getDriverList').then(function(response) {
        $scope.driverList = response.data;
    });



    $http.post('/getInitStatus', $scope.params).then(function(response) {
        if (response.data.initcount == response.data.actualcount) {
            $scope.report.status = 'N';
        } else {
            $scope.report.status = 'A';
        }
    });

    $scope.generateACRList = function(){
        $http.post('/getReportAcrList', {"area": $routeParams.areaCode, "day": $scope.colDate.getDay()}).then(function(response){
            $scope.report.acr = '';
            for(var i = 0; i < response.data.length; i++){
                $scope.report.acr += response.data[i].company + '\n';
            }
        })
    }


    $scope.passArea = {
        "areaID": $routeParams.areaCode
    }

    $scope.addReport = function() {
        $scope.showSubmitBtn = false;
        $scope.report.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.report.collectionDate = $filter('date')($scope.colDate, 'yyyy-MM-dd');
        $scope.report.format_startTime = $filter('date')($scope.report.startTime, 'HH:mm:ss');
        $scope.report.format_endTime = $filter('date')($scope.report.endTime, 'HH:mm:ss');
        $scope.report.colDay = $filter('date')($scope.colDate, 'EEE').toLowerCase();

        if ($scope.report.collectionDate == "" || $scope.report.collectionDate == null) {
            $scope.notify("error", "Collection Date Cannot Be Blank");
            $scope.showSubmitBtn = true;
        } else if($scope.report.startTime == 0 || $scope.report.endTime == 0){
            $scope.notify("error", "Please Fill In Start Time and End Time");
            $scope.showSubmitBtn = true;
        } else if ($scope.report.truck == "") {
            $scope.notify("error", "Truck Cannot Be Blank");
            $scope.showSubmitBtn = true;
        } else if ($scope.driver == "") {
            $scope.notify("error", "Driver Cannot Be Blank");
            $scope.showSubmitBtn = true;
        }else {
            //temp
            if ($scope.report.ton == "" || $scope.report.ton == null) {
                $scope.report.ton = 0;
            }
            $http.post('/addReport', $scope.report).then(function(response) {
                var returnedData = response.data;
                var newReportID = returnedData.details.reportID;

                if (returnedData.status === "success") {
                    angular.element('body').overhang({
                        type: "success",
                        message: "Report added successfully!"
                    });
                    socket.emit('make report', { "reportID": newReportID, "owner": $window.sessionStorage.getItem("owner") });
                    window.location.href = '#/dashboard-officer';
                }else{
                    $scope.notify("error", "Report Has Error When Submitting");
                    $scope.showSubmitBtn = true;
                }
            });
        }

    };

    //    $scope.cancelImg = function(){
    //        $scope.report.ifleetImg = "";
    //    };

    //    (function($) {
    //        var defaults;
    //        $.event.fix = (function(originalFix) {
    //            return function(event) {
    //                event = originalFix.apply(this, arguments);
    //                if (event.type.indexOf("copy") === 0 || event.type.indexOf("paste") === 0) {
    //                    event.clipboardData = event.originalEvent.clipboardData;
    //                }
    //                return event;
    //            };
    //        })($.event.fix);
    //        defaults = {
    //            callback: $.noop,
    //            matchType: /image.*/
    //        };
    //        return ($.fn.pasteImageReader = function(options) {
    //            if (typeof options === "function") {
    //                options = {
    //                    callback: options
    //                };
    //            }
    //            options = $.extend({}, defaults, options);
    //            return this.each(function() {
    //                var $this, element;
    //                element = this;
    //                $this = $(this);
    //                return $this.bind("paste", function(event) {
    //                    var clipboardData, found;
    //                    found = false;
    //                    clipboardData = event.clipboardData;
    //                    return Array.prototype.forEach.call(clipboardData.types, function(type, i) {
    //                        var file, reader;
    //                        if (found) {
    //                            return;
    //                        }
    //                        if (
    //                            type.match(options.matchType) ||
    //                            clipboardData.items[i].type.match(options.matchType)
    //                        ) {
    //                            file = clipboardData.items[i].getAsFile();
    //                            reader = new FileReader();
    //                            reader.onload = function(evt) {
    //                                return options.callback.call(element, {
    //                                    dataURL: evt.target.result,
    //                                    event: evt,
    //                                    file: file,
    //                                    name: file.name
    //                                });
    //                            };
    //                            reader.readAsDataURL(file);
    //                            snapshoot();
    //                            return (found = true);
    //                        }
    //                    });
    //                });
    //            });
    //        });
    //    })(jQuery);
    //    
    //    var dataURL, filename;
    //    $("html").pasteImageReader(function(results) {
    //        filename = results.filename, dataURL = results.dataURL;
    //        $data.text(dataURL);
    //        $size.val(results.file.size);
    //        $type.val(results.file.type);
    //        var img = document.createElement("img");
    //        img.src = dataURL;
    //        var w = img.width;
    //        var h = img.height;
    //        $width.val(w);
    //        $height.val(h);
    //        return $(".active")
    //            .css({
    //                backgroundImage: "url(" + dataURL + ")"
    //            })
    //            .data({ width: w, height: h });
    //    });
    //
    //    var $data, $size, $type, $width, $height;
    //    $(function() {
    //        $data = $(".data");
    //        $size = $(".size");
    //        $type = $(".type");
    //        $width = $("#width");
    //        $height = $("#height");
    //        $(".target").on("click", function() {
    //            var $this = $(this);
    //            var bi = $this.css("background-image");
    //            if (bi != "none") {
    //                $data.text(bi.substr(4, bi.length - 6));
    //            }
    //
    //            $(".active").removeClass("active");
    //            $this.addClass("active");
    //
    //            //$this.toggleClass("contain");
    //
    //            $width.val($this.data("width"));
    //            $height.val($this.data("height"));
    //            if ($this.hasClass("contain")) {
    //                $this.css({
    //                    width: $this.data("500px"),
    //                    height: $this.data("height"),
    //                    "z-index": "10"
    //                });
    //            } else {
    //                $this.css({ width: "", height: "", "z-index": "" });
    //            }
    //        });
    //    });
    //
    //    function copy(text) {
    //        var t = document.getElementById("base64");
    //        t.select();
    //        try {
    //            var successful = document.execCommand("copy");
    //            var msg = successful ? "successfully" : "unsuccessfully";
    //            alert("Base64 data coppied " + msg + " to clipboard");
    //        } catch (err) {
    //            alert("Unable to copy text");
    //        }
    //    }
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
    
    // Enlarge Image
//    $('canvas').on('click', function (e) {
//        var $canvas = e.target.id;
//        
//        if ($scope.report[$canvas] !== "") {
//            $('#image_previewer #this_image').attr('src', $scope.report[$canvas]);
//            $('#image_previewer').modal('show');
//        }
//    });

    
    window.addEventListener("paste", function(e) {
            // Handle the event
            retrieveImageFromClipboardAsBlob(e, function(imageBlob) {
                // If there's an image, display it in the canvas
                if (imageBlob) {
                    var canvas_id_name = e.target.children[1].id,
                        canvas = document.getElementById(canvas_id_name),
                        ctx = canvas.getContext('2d');

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
                        $scope.report[canvas_id_name] = base64data;
                    }
                }
            });
    }, false);

});

app.controller('reportingController', function($scope, $http, $filter, $window, storeDataService) {
    'use strict';
    $scope.searchReportFilter = '';
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 8; //Record number each page
    $scope.maxSize = 10; //Show the number in page
    $scope.areaList = [];
    $scope.passAreaList = [];
    $scope.filterReportList = [];
    $scope.show = angular.copy(storeDataService.show.reporting);

    $scope.reportingOfficerId = {
        "officerid": $window.sessionStorage.getItem('owner'),
        "day" : $filter('date')(new Date(), 'EEE').toLowerCase()
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

    $http.get('/getReportList').then(function(response) {
        $scope.allReport = [];
        $scope.normalReport = [];
        $scope.abnormalReport = [];
        $scope.reportList = response.data;
        $.each($scope.reportList, function(index, value) {
            $scope.reportList[index].date = $filter('date')(value.date, 'yyyy-MM-dd');
            if (value.status === 'A') {
                ($scope.abnormalReport).push(value);
            } else {
                ($scope.normalReport).push(value);
            }
        });        
        

        $scope.searchReport = function(report) {
            return (report.area + report.date + report.truck + report.ton + report.remark + report.staffName).toUpperCase().indexOf($scope.searchReportFilter.toUpperCase()) >= 0;
        }

        //all reports
        $scope.filterReportList = angular.copy($scope.reportList);
        
        $scope.totalItems = $scope.filterReportList.length;

        $scope.getData = function() {
            return $filter('filter')($scope.filterReportList, $scope.searchReportFilter);
        };

        
        
        //normal report only
        $scope.filterNormalReportList = angular.copy($scope.normalReport);
        $scope.totalNormalReport = $scope.filterNormalReportList.length;
        $scope.getNormalReport = function(){
            return $filter('filter')($scope.filterNormalReportList, $scope.searchReportFilter);
        }
        
        //abnormal report
        $scope.filterAbnormalReportList = angular.copy($scope.abnormalReport);
        $scope.totalAbnormalReport = $scope.filterAbnormalReportList.length;
        $scope.getAbnormalReport = function(){
            return $filter('filter')($scope.filterAbnormalReportList, $scope.searchReportFilter);
        }
        
        //filter pagination count
        $scope.$watch('searchReportFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
                $scope.totalNormalReport = $scope.getNormalReport().length;
                $scope.totalNormalReport = $scope.getAbnormalReport().length;
            }
            return vm;
        }, true);
    });

    $scope.viewReport = function(reportCode) {
        setTimeout(function() {
            window.location.href = '#/view-report/' + reportCode; // +"+"+ name
        }, 500);
    };
    
    $scope.exportReportListPage = function(){
        setTimeout(function(){
            window.location.href = '#/export-report-list';
        }, 500);
    }

    $scope.thisArea = function(id, name, modalfrom) {
        if(modalfrom == "today"){
            angular.element('#chooseArea').modal('toggle');
        }else if(modalfrom == "pass"){
            angular.element('#choosePassArea').modal('toggle');
        }
        
        setTimeout(function() {
            window.location.href = '#/daily-report/' + id + "/" + name
        }, 500);
    };

    //filtering by column asc and desc
    var asc = true;
    $scope.orderBy = function(property) {
        $scope.reportList = $filter('orderBy')($scope.reportList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };   
    
});

app.controller('exportReportListController', function($scope, $http, $window, $filter, storeDataService){
    'use strict';
    
    $scope.renderSltPicker = function () {
        angular.element('.selectpicker').selectpicker('refresh');
        angular.element('.selectpicker').selectpicker('render');
    };
    
    $scope.areaList = [];
    $scope.filterStartDate = "";
    $scope.filterEndDate = "";
    $scope.reportList = [];
    
    $http.get('/getAreaList').then(function (response) {
        console.log(response.data);
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
      
//      $scope.filterStartDate.setDate($scope.filterStartDate.getDate() + 1);
//      $scope.filterEndDate.setDate($scope.filterEndDate.getDate() + 1);
      
      $scope.filterStartDate =  $filter('date')($scope.filterStartDate, 'yyyy-MM-dd');
      $scope.filterEndDate =  $filter('date')($scope.filterEndDate, 'yyyy-MM-dd');
  });

  $('input[name="daterange"]').on('cancel.daterangepicker', function(ev, picker) {
      $(this).val('');
      $scope.filterStartDate = "";
      $scope.filterEndDate = "";
  });      
    
    
    $scope.checkList = function(){
        if($scope.filterStartDate == "" || $scope.filterEndDate == ""){
             $scope.notify("error", "Please Fill in the Date Range");
        }
        else{
            var reqObj = {
                "startDate": $scope.filterStartDate,
                "endDate": $scope.filterEndDate
            };
            
            $http.post("/getFilterExportReport", reqObj).then(function(response){
                $scope.reportList = response.data;
                $.each($scope.reportList, function(index, value) {
                    $scope.reportList[index].date = $filter('date')(value.date, 'yyyy-MM-dd');
                    $http.post('/getStaffName', {'id': $scope.reportList[index].reportingStaffId}).then(function (response) {
                        $scope.reportList[index].staffName = response.data[0].staffName;
                    });
                    $scope.reportList[index].feedback = $scope.reportList[index].feedback.replace(/<p>/gi, " ");
                    $scope.reportList[index].feedback = $scope.reportList[index].feedback.replace(/<\/p>/gi, " ");    
                });                  
            });
        }
        
        
    }
     
    $scope.exportFile = function(tableID, filename = ''){
        var downloadLink;
        var dataType = 'application/vnd.ms-excel';
        var tableSelect = document.getElementById(tableID);
        var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

        // Specify file name
        filename = filename?filename+'.xls':'Reporting Summary.xls';

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

app.controller('viewReportController', function($scope, $http, $routeParams, $window, $filter, storeDataService) {
    var position = $window.sessionStorage.getItem('position');
    $scope.show = angular.copy(storeDataService.show.reporting);

    $scope.bin = "";
    //$scope.acr = "";
    var map;

    $scope.report = {
        "reportID": $routeParams.reportCode,
        "check": $scope.show.check
    };
    $scope.reportID = $routeParams.reportCode;

    $scope.thisReport = {
        "acr": [],
        "date": ""
    };
    
    $('.frame').on('click', function () {
        var src = $(this).children().attr("src");
        if (src !== "") {
            $('#image_previewer').modal('show');
            $('#image_previewer #this_image').attr('src', src);
        }
    });
    
    $('button[name="submit_feedback"]').on('click', function () {
        $http.post('/report_feedback', {"id": $scope.reportID, "feedback": $('textarea[name="report_feedback"]').val()}).then(function (response) {
            $scope.notify(response.data.status, response.data.message);
            window.location.href = '#/reporting';
        });
    });

    $http.post('/getReport', $scope.report).then(function(response) {
        $scope.thisReport = response.data[0];
        console.log($scope.thisReport);
        $("#summernote").summernote("code", $scope.thisReport.feedback);
        $scope.thisReport.date = $filter('date')($scope.thisReport.date, 'yyyy-MM-dd');
        $scope.area = {
            "areaID": $scope.thisReport.area
        };

        $scope.report = {
            "reportID": $routeParams.reportCode
        };

        $http.post('/getReportBinCenter', $scope.area).then(function(response) {
            $scope.thisReport.bin = response.data;
            $scope.row = Object.keys($scope.thisReport.bin).length;
            $.each($scope.thisReport.bin, function(index, value) {
                $scope.bin += value.name;
                if ((index + 1) != $scope.row) {
                    $scope.bin += ', ';
                }
            });
        });

        $http.post('/getReportingStaff', $scope.report).then(function(response) {
            $scope.thisReport.reportingStaff = response.data[0].staffName;
        });
        
        // $scope.forGetAcrInfo = $scope.thisReport;
        // $scope.forGetAcrInfo.todayday = "";
        // var d = new Date($scope.thisReport.date);
        // var n = d.getDay();
        // if(n == 1){
        //     $scope.forGetAcrInfo.todayday = "mon";
        // }
        // else if(n == 2){
        //     $scope.forGetAcrInfo.todayday = "tue";
        // }
        // else if(n == 3){
        //     $scope.forGetAcrInfo.todayday = "wed";
        // }
        // else if(n == 4){
        //     $scope.forGetAcrInfo.todayday = "thu";
        // }
        // else if(n == 5){
        //     $scope.forGetAcrInfo.todayday = "fri";
        // }
        // else if(n == 6){
        //     $scope.forGetAcrInfo.todayday = "sat";
        // }else if(n == 0){
        //     $scope.forGetAcrInfo.todayday = "sun";
        // }
        
        // $http.post('/getReportACR', $scope.forGetAcrInfo).then(function(response){
        //     if (response.data !== null) {
        //         if (response.data.length > 0) {
        //             $scope.thisReport.acr = response.data;
        //         } else {
        //             $scope.thisReport.acr = [];
        //         }
        //         $scope.acrRow = Object.keys($scope.thisReport.acr).length;
        //         $scope.acr = "";
        //         $.each($scope.thisReport.acr, function(index, value) {
        //             $scope.acr += value.name;
        //             if ((index + 1) != $scope.acrRow) {
        //                 $scope.acr += ', ';
        //             }
        //         });
        //     }
        // });


        $scope.editReport = function() {
            window.location.href = '#/edit-report/' + $scope.thisReport.id;
        };

    });
});

app.controller('editReportController', function($scope, $http, $routeParams, $window, $filter) {
    $scope.showEditBtn = true;
    $scope.reportCode = $routeParams.reportCode;
    $scope.reportObj = {
        "reportID": $routeParams.reportCode
    };
    $scope.truckList = [];
    $scope.driverList = [];

    $scope.circleID = 0;
    $scope.rectangleID = 0;
    $scope.shape = 'circle';
    var centerArray = [],
        rectArray = [];

    angular.element('.btnShape').click(function() {
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

    $http.post('/getReport', $scope.reportObj).then(function(response) {

        $scope.editField = response.data[0];
        $scope.editField.date = new Date(response.data[0].date);
        $scope.areaCode = response.data[0].areaCode;
        $scope.area = {
            "areaID": response.data[0].area
        };
        $scope.startFormat = new Date();
        $scope.startSplit = $scope.editField.startTime.split(":");
        $scope.startFormat.setHours($scope.editField.startTime.split(":")[0]);
        $scope.startFormat.setMinutes($scope.editField.startTime.split(":")[1]);
        $scope.startFormat.setSeconds(0);
        $scope.startFormat.setMilliseconds(0);
        
        $scope.endFormat = new Date();
        $scope.endSplit = $scope.editField.endTime.split(":");
        $scope.endFormat.setHours($scope.editField.endTime.split(":")[0]);
        $scope.endFormat.setMinutes($scope.editField.endTime.split(":")[1]);
        $scope.endFormat.setSeconds(0);
        $scope.endFormat.setMilliseconds(0);
        
        $scope.editField.startTime = $scope.startFormat;
        $scope.editField.endTime = $scope.endFormat;
        
        
        var canvas_array = ["lh", "rttb", "wt", "gpswox"],
            c,
            ctx,
            img_show,
            oc,
            octx,
            steps;
        for (var i = 0; i < canvas_array.length; i++) {
            c = document.getElementById(canvas_array[i]);
            ctx = c.getContext('2d');
            img_show = new Image();
            img_show.id = canvas_array[i];
            img_show.onload = function (_that) {
                oc = document.getElementById(this.id);
                octx = oc.getContext('2d');
                oc.width = this.width;
                oc.height = this.height;
                
                steps = (oc.width / c.width)>>1;
                octx.filter = `blur(${steps}px)`;
                octx.drawImage(this, 0, 0);
                ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, c.width, c.height);
            }
            img_show.src = $scope.editField[canvas_array[i]];
        }
//        ifleetImgShow.onload = function() {
//
//            // steo 2: pre-filter image using steps as radius
//            const steps = (oc.width / c.width)>>1;
//            octx.filter = `blur(${steps}px)`;
//            octx.drawImage(this, 0, 0);
//
//            // step 3, draw scaled
//            ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, c.width, c.height);
//            
//        };
//        ifleetImgShow.src = $scope.editField.ifleet;
               
    });

    $http.get('/getTruckList').then(function(response) {
        $scope.truckList = response.data;
    });

    $http.get('/getDriverList').then(function(response) {
        $scope.driverList = response.data;
    });

    $scope.edit = function() {
        $scope.showEditBtn = false;
        $scope.editField.marker = centerArray;
        $scope.editField.rectangle = rectArray;
        if($scope.editField.date == "" || $scope.editField.date == null){
            $scope.notify("error","Date Cannot Be Blank.");
            $scope.showEditBtn = true;
        } else if($scope.editField.startTime == 0 || $scope.editField.startTime == null){
            $scope.notify("error","Start Time Cannot Be Blank.");
            $scope.showEditBtn = true;
        } else if($scope.editField.endTime == 0 || $scope.editField.endTime == null){
            $scope.notify("error","End Time Cannot Be Blank.");
            $scope.showEditBtn = true;
        } else if($scope.editField.truckID == "" || $scope.editField.truckID == null){
            $scope.notify("error","Truck Cannot Be Blank.");
            $scope.showEditBtn = true;
        } else if($scope.editField.driverID == "" || $scope.editField.driverID == null){
            $scope.notify("error","Driver Cannot Be Blank.");
            $scope.showEditBtn = true;
        } else if($scope.editField.status == "" || $scope.editField.status == null){
            $scope.notify("error","Status Cannot Be Blank.");
            $scope.showEditBtn = true;
        } else{
            $scope.editField.date = $filter('date')($scope.editField.date, 'yyyy-MM-dd');
            $scope.editField.colDay = $filter('date')($scope.editField.date, 'EEE').toLowerCase();
            $scope.editField.format_startTime = $filter('date')($scope.editField.startTime, 'HH:mm:ss');
            $scope.editField.format_endTime = $filter('date')($scope.editField.endTime, 'HH:mm:ss');
            if ($scope.editField.ton == "" || $scope.editField.ton == null) {
                $scope.editField.ton = 0;
            }
            $http.post('/editReport', $scope.editField).then(function(response) {
                var returnedReportData = response.data;

                if (returnedReportData.status === "success") {
                    angular.element('body').overhang({
                        type: "success",
                        message: "Report edit successfully!"
                    });
                    window.location.href = '#/reporting';
                }
                $scope.showEditBtn = true;
            });
        }
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

 
    window.addEventListener("paste", function(e) {
        // Handle the event
        retrieveImageFromClipboardAsBlob(e, function(imageBlob) {
            // If there's an image, display it in the canvas
            if (imageBlob) {
                var canvas_id = e.target.children[1].id;
                var canvas = document.getElementById(canvas_id);
                var ctx = canvas.getContext('2d');
                //                ctx.drawImage($scope.editField.ifleet)

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
                    $scope.editField[canvas_id] = base64data;
                }
            }
        });
    }, false);
});