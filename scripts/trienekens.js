/*
jshint: white
global angular, document, google
*/
var app = angular.module('trienekens', ['ngRoute', 'ui.bootstrap']);

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

app.directive('editable', function ($compile, $http) {
    'use strict';
    return function (scope) {
        scope.sho = true;
        scope.choose = function () {
            scope.sho = !scope.sho;


            angular.element('.btn' + scope.d.id).replaceWith($compile('<button class="btn btn-warning btn-sm btn' + scope.d.id + '" data-ng-click="save();"><i class="fa fa-save"></i></button>')(scope));
            angular.element('.btn' + scope.d.id).parent().append(" ").append($compile('<button class="btn btn-default btn-sm btnCancel' + scope.d.id + '" data-ng-click="cancel();"><i class="fa fa-times"></i></button>')(scope));
            //            angular.element('.btnBack').replaceWith($compile('<button class="btn btn-default btnCancel" data-directive="editable" data-ng-click="cancel()">Cancel</button>')(scope));
        };

        scope.save = function () {
            scope.sho = true;

            angular.element('.btn' + scope.d.id).replaceWith($compile('<button class="btn btn-primary btn-sm btn' + scope.d.id + '" data-ng-click="choose();"><i class="fa fa-pencil-alt"></i></button>')(scope));
        };



        //        scope.save = function () {
        //            $http({
        //                method: 'POST',
        //                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        //                url: '../database/backend.php?module=self&action=update',
        //                data: $.param({"id": selfDataService.self.id, "avatar": scope.self.avatar, "name": scope.self.name, "nric": scope.self.nric, "gender": scope.self.gender, "contact": scope.self.contact, "email": scope.self.email, "op": scope.self.op, "np": scope.self.np, "cp": scope.self.cp})
        //            }).then(function successCallback(response) {
        //                if (response.data.result === "success") {
        //                    $("body").overhang({
        //                        type: "success",
        //                        message: "Profile Saved!"
        //                    });
        //                    scope.sho = true;
        //                    selfDataService.self = angular.copy(scope.self);
        //                    
        //                    if (scope.self.gender === 'F') {scope.strGender = "Female";}
        //                    else if (scope.self.gender === 'M') {scope.strGender = "Male";}
        //                    else {scope.strGender = "Undefined";}
        //                    
        //                    angular.element('.btnSave').replaceWith($compile('<button class="btn btn-primary btnEdit" data-ng-click="choose()">Edit</button>')(scope));
        //                    angular.element('.btnCancel').replaceWith('<button class="btn btn-default btnBack">Back</button>');
        //                } else if (response.data.result === "fail") {
        //                    $("body").overhang({
        //                        type: "error",
        //                        message: "Something Wrong!"
        //                    });
        //                }
        //            });
        //        };

        scope.cancel = function () {
            scope.sho = true;
            //scope.self = angular.copy(selfDataService.self);

            angular.element('.btnSave').replaceWith($compile('<button class="btn btn-primary btnEdit" data-ng-click="choose()">Edit</button>')(scope));

            angular.element('.btnCancel').replaceWith('<button class="btn btn-default btnBack">Back</button>');
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

app.controller('managerController', function ($scope) {
    'use strict';
    var socket = io.connect();
    socket.on('connect', function () {
        var sessionid = socket.io.engine.id;
        console.log(sessionid);
    });

    function synchronizePieSeries(event, slice) {
        //console.log($(pieChart.series[1]));
        $(pieChart.series[1].data).each(function (i, e) {
            if (slice.name === e.name) {
                slice.visible ? e.graphic.hide() : e.graphic.show();
            }
        });
    }

    var pieChart = new Highcharts.Chart({
        chart: {
            renderTo: 'pie-chart',
            plotBackgroundColor: null,
            plotBorderWidth: 1,
            plotShadow: false,
            type: 'pie',
            events: {
                load: function () {},
                redraw: function () {}
            }
        },
        title: '',
        labels: {
            items: [{
                html: 'QAA 1234',
                style: {
                    left: '40',
                    top: '130'
                }
            }, {
                html: 'QAA 2345',
                style: {
                    left: '190',
                    top: '130'
                }
            }, {
                html: 'QAA 2345',
                style: {
                    left: '340',
                    top: '130'
                }
            }, {
                html: 'QAA 2345',
                style: {
                    left: '490',
                    top: '130'
                }
            }, {
                html: 'QAA 2345',
                style: {
                    left: '640',
                    top: '130'
                }
            }]
        },
        legend: {
            enabled: true
        },
        tooltip: {
            pointFormat: '{data.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: false,
                innerSize: '70%',
                cursor: 'pointer',
                column: {
                    colorByPoint: true
                },
                dataLabels: false
            }
        },
        floating: true,
        series: [{
            type: 'pie',
            name: 'Browser share',
            center: [50, 50],
            size: 100,
            showInLegend: true,
            title: {
                align: 'center',
                text: '<b>91.76%</b>',
                verticalAlign: 'middle',
                y: -10
            },
            data: [
                {
                    name: 'Used space',
                    y: 91.76,
                    labels: 'ok',
                    color: '#C10003'
                }, {
                    name: 'Free space',
                    y: 8.24,
                    color: 'gray'
                }
            ]
        }, {
            type: 'pie',
            name: 'Browser share',
            center: [200, 50],
            size: 100,
            title: {
                align: 'center',
                text: '<b>10%</b>',
                verticalAlign: 'middle',
                y: -10
            },
            dataLabels: {
                enabled: false
            },
            data: [
                {
                    name: 'Used space',
                    y: 10,
                    color: '#C10003'
                }, {
                    name: 'Free space',
                    y: 90,
                    color: 'gray'
                }
            ]
        }, {
            type: 'pie',
            name: 'Browser share',
            center: [350, 50],
            size: 100,
            title: {
                align: 'center',
                text: '<b>30%</b>',
                verticalAlign: 'middle',
                y: -10
            },
            dataLabels: {
                enabled: false
            },
            data: [
                {
                    name: 'Used space',
                    y: 30,
                    color: '#C10003'
                }, {
                    name: 'Free space',
                    y: 70,
                    color: 'gray'
                }
            ]
        }, {
            type: 'pie',
            name: 'Browser share',
            center: [500, 50],
            size: 100,
            title: {
                align: 'center',
                text: '<b>55%</b>',
                verticalAlign: 'middle',
                y: -10
            },
            dataLabels: {
                enabled: false
            },
            data: [
                {
                    name: 'Used space',
                    y: 55,
                    color: '#C10003'
                }, {
                    name: 'Free space',
                    y: 45,
                    color: 'gray'
                }
            ]
        }, {
            type: 'pie',
            name: 'Browser share',
            center: [650, 50],
            size: 100,
            title: {
                align: 'center',
                text: '<b>85%</b>',
                verticalAlign: 'middle',
                y: -10
            },
            dataLabels: {
                enabled: false
            },
            data: [
                {
                    name: 'Used space',
                    y: 85,
                    color: '#C10003'
                }, {
                    name: 'Free space',
                    y: 15,
                    color: 'gray'
                }
            ]
        }]
    }, function (chart) {
        $(chart.series[0].data).each(function (i, e) {
            e.legendItem.on('click', function (event) {
                var legendItem = e.name;

                event.stopPropagation();

                $(chart.series).each(function (j, f) {
                    $(this.data).each(function (k, z) {
                        if (z.name == legendItem) {
                            if (z.visible) {
                                z.setVisible(false);
                            } else {
                                z.setVisible(true);
                            }
                        }
                    });
                });
            });
        });
    });

    var lineChart = new Highcharts.Chart({
        chart: {
            renderTo: 'line-chart'
        },
        title: {
            text: 'Solar Employment Growth by Sector, 2010-2016'
        },
        subtitle: {
            text: 'Source: thesolarfoundation.com'
        },
        yAxis: {
            title: {
                text: 'Number of Employees'
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                },
                pointStart: 2010
            }
        },
        series: [{
            name: 'Installation',
            data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
        }, {
            name: 'Manufacturing',
            data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
        }, {
            name: 'Sales & Distribution',
            data: [11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387]
        }, {
            name: 'Project Development',
            data: [null, null, 7988, 12169, 15112, 22452, 34400, 34227]
        }, {
            name: 'Other',
            data: [12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111]
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 1000
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    });

    var barChart = new Highcharts.Chart({
        chart: {
            type: 'bar',
            renderTo: 'bar-chart'
        },
        title: {
            text: 'Population pyramid for Germany, 2018'
        },
        subtitle: {
            text: 'Source: <a href="http://populationpyramid.net/germany/2018/">Population Pyramids of the World from 1950 to 2100</a>'
        },
        xAxis: [{
            categories: categories,
            reversed: false,
            labels: {
                step: 1
            }
        }, { // mirror axis on right side
            opposite: true,
            reversed: false,
            categories: categories,
            linkedTo: 0,
            labels: {
                step: 1
            }
        }],
        yAxis: {
            title: {
                text: null
            },
            labels: {
                formatter: function () {
                    return Math.abs(this.value) + '%';
                }
            }
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + ', age ' + this.point.category + '</b><br/>' +
                    'Population: ' + Highcharts.numberFormat(Math.abs(this.point.y), 0);
            }
        },
        series: [{
            name: 'Male',
            data: [
                -2.2, -2.1, -2.2, -2.4,
                -2.7, -3.0, -3.3, -3.2,
                -2.9, -3.5, -4.4, -4.1,
                -3.4, -2.7, -2.3, -2.2,
                -1.6, -0.6, -0.3, -0.0,
                -0.0
            ]
        }, {
            name: 'Female',
            data: [
                2.1, 2.0, 2.1, 2.3, 2.6,
                2.9, 3.2, 3.1, 2.9, 3.4,
                4.3, 4.0, 3.5, 2.9, 2.5,
                2.7, 2.2, 1.1, 0.6, 0.2,
                0.0
            ]
        }]
    });

});

app.controller('officerController', function ($scope) {
    'use strict';
    $scope.handledArea = [{
        "zoneCode": 'Z1',
        "area": [{
            "areaCode": 'Z1A1',
            "areaName": 'Zone 1 Area 1'
        }, {
            "areaCode": 'Z1A2',
            "areaName": 'Zone 1 Area 2'
        }, {
            "areaCode": 'Z1A3',
            "areaName": 'Zone 1 Area 3'
        }, {
            "areaCode": 'Z1A4',
            "areaName": 'Zone 1 Area 4'
        }, {
            "areaCode": 'Z1A5',
            "areaName": 'Zone 1 Area 5'
        }]
    }, {
        "zoneCode": 'Z2',
        "area": [{
            "areaCode": 'Z2A1',
            "areaName": 'Zone 2 Area 1'
        }, {
            "areaCode": 'Z2A2',
            "areaName": 'Zone 2 Area 2'
        }, {
            "areaCode": 'Z2A3',
            "areaName": 'Zone 2 Area 3'
        }, {
            "areaCode": 'Z2A4',
            "areaName": 'Zone 2 Area 4'
        }, {
            "areaCode": 'Z2A5',
            "areaName": 'Zone 2 Area 5'
        }]
    }, {
        "zoneCode": 'Z3',
        "area": [{
            "areaCode": 'Z3A1',
            "areaName": 'Zone 3 Area 1'
        }, {
            "areaCode": 'Z3A2',
            "areaName": 'Zone 3 Area 2'
        }, {
            "areaCode": 'Z3A3',
            "areaName": 'Zone 3 Area 3'
        }, {
            "areaCode": 'Z3A4',
            "areaName": 'Zone 3 Area 4'
        }, {
            "areaCode": 'Z3A5',
            "areaName": 'Zone 3 Area 5'
        }]
    }];

    $scope.thisArea = function (a) {
        window.location.href = '#/daily-report/' + a;
    };
});

app.controller('areaController', function ($scope, $http, $filter) {
    'use strict';

    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 8; //Record number each page
    $scope.maxSize = 10; //Show the number in page

    $scope.area = {
        "zone": '',
        "staff": ''
    };

    $http.get('/getAllArea').then(function (response) {
        $scope.searchAreaFilter = '';
        $scope.areaList = response.data;
        $scope.filterAreaList = [];

        $scope.searchArea = function (area) {
            return (area.id + area.name + area.status).toUpperCase().indexOf($scope.searchAreaFilter.toUpperCase()) >= 0;
        }

        $.each($scope.areaList, function (index) {
            $scope.filterAreaList = angular.copy($scope.areaList);
        });

        $scope.totalItems = $scope.filterAreaList.length;

        $scope.getData = function () {
            return $filter('filter')($scope.filterAreaList, $scope.searchAreaFilter);
        };

        $scope.$watch('searchAreaFilter', function (newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);
    });

    $scope.areaCollection = [{
        "zoneCode": 'Z1',
        "area": [{
            "areaCode": 'Z1A1',
            "collection": [{
                "collectionName": 'Z1A1C1'
            }, {
                "collectionName": 'Z1A1C2'
            }, {
                "collectionName": 'Z1A1C3'
            }, {
                "collectionName": 'Z1A1C4'
            }, {
                "collectionName": 'Z1A1C5'
            }]
        }, {
            "areaCode": 'Z1A2',
            "collection": [{
                "collectionName": 'Z1A2C1'
            }, {
                "collectionName": 'Z1A2C2'
            }, {
                "collectionName": 'Z1A2C3'
            }, {
                "collectionName": 'Z1A2C4'
            }, {
                "collectionName": 'Z1A2C5'
            }]
        }, {
            "areaCode": 'Z1A3',
            "collection": [{
                "collectionName": "Z1A3C1"
            }, {
                "collectionName": "Z1A3C2"
            }, {
                "collectionName": "Z1A3C3"
            }, {
                "collectionName": "Z1A3C4"
            }, {
                "collectionName": "Z1A3C5"
            }]
        }]
    }, {
        "zoneCode": 'Z2',
        "area": [{
            "areaCode": 'Z2A1',
            "collection": [{
                "collectionName": 'Z2A1C1'
            }, {
                "collectionName": 'Z2A1C2'
            }, {
                "collectionName": 'Z2A1C3'
            }, {
                "collectionName": 'Z2A1C4'
            }, {
                "collectionName": 'Z2A1C5'
            }]
        }, {
            "areaCode": 'Z2A2',
            "collection": [{
                "collectionName": 'Z2A2C1'
            }, {
                "collectionName": 'Z2A2C2'
            }, {
                "collectionName": 'Z2A2C3'
            }, {
                "collectionName": 'Z2A2C4'
            }, {
                "collectionName": 'Z2A2C5'
            }]
        }, {
            "areaCode": 'Z2A3',
            "collection": [{
                "collectionName": 'Z2A3C1'
            }, {
                "collectionName": 'Z2A3C2'
            }, {
                "collectionName": 'Z2A3C3'
            }, {
                "collectionName": 'Z2A3C4'
            }, {
                "collectionName": 'Z2A3C5'
            }]
        }]
    }, {
        "zoneCode": 'Z3',
        "area": [{
            "areaCode": 'Z3A1',
            "collection": [{
                "collectionName": 'Z3A1C1'
            }, {
                "collectionName": 'Z3A1C2'
            }, {
                "collectionName": 'Z3A1C3'
            }, {
                "collectionName": 'Z3A1C4'
            }, {
                "collectionName": 'Z3A1C5'
            }]
        }, {
            "areaCode": 'Z3A2',
            "collection": [{
                "collectionName": 'Z3A2C1'
            }, {
                "collectionName": 'Z3A2C2'
            }, {
                "collectionName": 'Z3A2C3'
            }, {
                "collectionName": 'Z3A2C4'
            }, {
                "collectionName": 'Z3A2C5'
            }]
        }, {
            "areaCode": 'Z3A3',
            "collection": [{
                "collectionName": 'Z3A3C1'
            }, {
                "collectionName": 'Z3A3C2'
            }, {
                "collectionName": 'Z3A3C3'
            }, {
                "collectionName": 'Z3A3C4'
            }, {
                "collectionName": 'Z3A3C5'
            }]
        }]
    }];

    $http.get('/getZoneList').then(function (response) {
        $scope.zoneList = response.data;
        $scope.area.zone = $scope.zoneList[0];
    });

    $http.get('/getStaffList').then(function (response) {
        $scope.staffList = response.data;
        $scope.area.staff = $scope.staffList[0];
    });

    $scope.addArea = function () {
        $scope.area.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addArea', $scope.area).then(function (response) {
            var returnedData = response.data;
            var newAreaID = returnedData.details.areaID;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "Area added successfully!"
                });
                $scope.areaList.push({
                    "id": newAreaID,
                    "name": $scope.area.name,
                    "status": 'ACTIVE'
                });
                $scope.filterAreaList = angular.copy($scope.areaList);
                angular.element('#createArea').modal('toggle');
                $scope.totalItems = $scope.filterAreaList.length;
            }
        });
    }
    
    //new added 15/5
    //inactive can't be show
    $scope.editAreaPage = function(){
        window.location.href = '#/area-management-edit';

    }
    
    $scope.editArea = function(){
        
        $http.post('/editArea', $scope.area).then(function(response){
            var data = response.data;
            if(data.status === "success"){
                angular.element('body').overhang({
                    type: data.status,
                    message: data.message
                });
                window.location.href = '#/area-management';
            }
            
        });
    }
});

app.controller('accountController', function ($scope, $http, $filter, $window) {
    'use strict';

    var asc = true;
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 8; //Record number each page
    $scope.maxSize = 10; //Show the number in page

    $scope.initializeStaff = function () {
        $scope.staff = {
            "name": '',
            "position": $scope.positionList[0],
            "username": '',
            "password": ''
        };
    };

    $http.get('/getPositionList').then(function (response) {
        $scope.positionList = response.data;
        $scope.initializeStaff();
    });

    $http.get('/getAllUser').then(function (response) {
        $scope.searchStaffFilter = '';
        $scope.staffList = response.data;
        $scope.filterStaffList = [];
        $scope.searchStaff = function (staff) {
            return (staff.id + staff.name + staff.username + staff.position + staff.status).toUpperCase().indexOf($scope.searchStaffFilter.toUpperCase()) >= 0;
        }

        $.each($scope.staffList, function (index) {
            $scope.filterStaffList = angular.copy($scope.staffList);
        });

        $scope.totalItems = $scope.filterStaffList.length;

        $scope.getData = function () {
            return $filter('filter')($scope.filterStaffList, $scope.searchStaffFilter);
        };

        $scope.$watch('searchStaffFilter', function (newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);
    });

    $scope.loadSpecificAccount = function (staffID) {
        window.location.href = '#/account/' + staffID;
    };

    $scope.addUser = function () {
        $scope.staff.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $scope.staff.owner = $window.sessionStorage.getItem('owner');
        $http.post('/addUser', $scope.staff).then(function (response) {
            var returnedData = response.data;

            if (returnedData.status === "success") {
                var newStaffID = returnedData.details.staffID;
                $scope.staffList.push({
                    "id": newStaffID,
                    "name": $scope.staff.name,
                    "username": $scope.staff.username,
                    "position": $scope.staff.position.name,
                    "status": 'ACTIVE'
                });
                $scope.filterStaffList = angular.copy($scope.staffList);
                $scope.totalItems = $scope.filterStaffList.length;
            }
            angular.element('body').overhang({
                type: returnedData.status,
                message: returnedData.message
            });
            angular.element('#createAccount').modal('toggle');
            $scope.initializeStaff();
        }).catch(function (response) {
            console.error('error');
        });
    };

    $scope.orderBy = function (property) {
        $scope.staffList = $filter('orderBy')($scope.staffList, ['' + property + ''], asc);
        asc == true ? asc = false : asc = true;
    };
});

app.controller('specificAccController', function ($scope, $http, $routeParams) {
    'use strict';

    $scope.thisAccount = {
        "id": $routeParams.userID,
        "name": '',
        "ic": '',
        "gender": '',
        "dob": '',
        "position": '',
        "status": '',
        "email": '',
        "handphone": '',
        "phone": '',
        "address": ''
    };
    
    $scope.password = {
        "id": $routeParams.userID,
        "password": '',
        "again": ''
    };

    $http.post('/loadSpecificAccount', $scope.thisAccount).then(function (response) {
        $.each(response.data[0], function (index, value) {
            $scope.thisAccount[index] = value;
        });
    });
    
    $scope.updatePassword = function () {
        $http.post('/updatePassword', $scope.password).then(function (response) {
            var data = response.data;
            angular.element('body').overhang({
                type: data.status,
                message: data.message
            });
            $scope.password.password = '';
            $scope.password.again = '';
        });
    };
});

app.controller('errorController', function ($scope, $window) {
    'use strict';
    angular.element('.error-page [data-func="go-back"]').click(function () {
        $window.history.back();
    });
});

app.controller('dailyController', function ($scope, $window, $routeParams) {
    'use strict';

    $scope.$params_areaCode = $routeParams.areaCode;

    var $googleMap, visualizeMap, map, lat = 0,
        lng = 0;

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

        latLng = e.latLng;
        latitude = latLng.lat();
        longtitude = latLng.lng();

        circle = new google.maps.Circle({
            map: map,
            center: new google.maps.LatLng(latitude, longtitude),
            radius: 200,
            fillColor: 'transparent',
            strokeColor: 'red',
            editable: true,
            draggable: true
        });

        google.maps.event.addListener(circle, "radius_changed", function () {
            console.log(circle.getRadius());
        });
        google.maps.event.addListener(circle, "center_changed", function () {
            console.log(circle.getCenter());
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
    var myPlace = {
        "results": [
            {
                "address_components": [
                    {
                        "long_name": "Jalan Simpang Tiga",
                        "short_name": "Q5A",
                        "types": ["route"]
                    },
                    {
                        "long_name": "Kuching",
                        "short_name": "Kuching",
                        "types": ["locality", "political"]
                    },
                    {
                        "long_name": "Sarawak",
                        "short_name": "Sarawak",
                        "types": ["administrative_area_level_1", "political"]
                    },
                    {
                        "long_name": "马来西亚",
                        "short_name": "MY",
                        "types": ["country", "political"]
                    },
                    {
                        "long_name": "93350",
                        "short_name": "93350",
                        "types": ["postal_code"]
                    }
                ],
                "formatted_address": "Jalan Simpang Tiga, 93350 Kuching, Sarawak, 马来西亚",
                "geometry": {
                    "location": {
                        "lat": 1.5322626,
                        "lng": 110.3572259
                    },
                    "location_type": "GEOMETRIC_CENTER",
                    "viewport": {
                        "northeast": {
                            "lat": 1.533611580291502,
                            "lng": 110.3585748802915
                        },
                        "southwest": {
                            "lat": 1.530913619708498,
                            "lng": 110.3558769197085
                        }
                    }
                },
                "place_id": "ChIJ5yzgEQun-zERt0vSz5Dyy2k",
                "plus_code": {
                    "compound_code": "G9J4+WV 马来西亚 Sarawak, 古晋",
                    "global_code": "6PHGG9J4+WV"
                },
                "types": ["establishment", "point_of_interest", "university"]
            }
        ],
        "status": "OK"
    };
    var myPlace = {
        "results": [
            {
                "address_components": [
                    {
                        "long_name": "Kuching",
                        "short_name": "Kuching",
                        "types": ["locality", "political"]
                    },
                    {
                        "long_name": "马来西亚",
                        "short_name": "MY",
                        "types": ["country", "political"]
                    },
                    {
                        "long_name": "93250",
                        "short_name": "93250",
                        "types": ["postal_code"]
                    }
                ],
                "formatted_address": "No. 216, Lot 2014, Jalan Sungai Tapang, Sarawak, 93250 Kuching, 马来西亚",
                "geometry": {
                    "location": {
                        "lat": 1.4848857,
                        "lng": 110.3597152
                    },
                    "location_type": "GEOMETRIC_CENTER",
                    "viewport": {
                        "northeast": {
                            "lat": 1.486234680291502,
                            "lng": 110.3610641802915
                        },
                        "southwest": {
                            "lat": 1.483536719708498,
                            "lng": 110.3583662197085
                        }
                    }
                },
                "place_id": "ChIJZw7l55ug-zER2wJp6l3tqtQ",
                "plus_code": {
                    "compound_code": "F9M5+XV 马来西亚 Sarawak, 古晋",
                    "global_code": "6PHGF9M5+XV"
                },
                "types": ["establishment", "point_of_interest"]
            }
        ],
        "status": "OK"
    };

    // After get the place data, re-center the map
    $window.setTimeout(function () {
        var places, location;

        places = myPlace.results[0];
        location = places.formatted_address;
        lat = places.geometry.location.lat;
        lng = places.geometry.location.lng;
        map.panTo(new google.maps.LatLng(lat, lng));
        map.setZoom(17);
    }, 1000);
    
    

});

app.controller('truckController', function ($scope, $http, $filter) {
    'use strict';

    $scope.areaList = [];
    $scope.initializeTruck = function () {
        $scope.truck = {
            "no": '',
            "driver": '',
            "area": ''
        };
    };
    
    $http.get('/getAllTruck').then(function (response) {
        $scope.searchTruckFilter = '';
        $scope.truckList = response.data;
        
        $scope.filterTruckList = [];
        $scope.searchTruck = function (truck) {
            return (truck.id + truck.no + truck.transporter + truck.ton + truck.roadtax + truck.status).toUpperCase().indexOf($scope.searchTruckFilter.toUpperCase()) >= 0;
        }
        
        $.each($scope.truckList, function(index) {
            $scope.filterTruckList = angular.copy($scope.truckList);
        });
    
        $scope.totalItems = $scope.filterTruckList.length;
    
        $scope.getData = function () {
            return $filter('filter')($scope.filterTruckList, $scope.searchTruckFilter);
        };
    
        $scope.$watch('searchTruckFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);

    });
    
    function renderSltPicker() {
        angular.element('.selectpicker').selectpicker('refresh');
        angular.element('.selectpicker').selectpicker('render');
    }

    $http.get('/getDriverList').then(function (response) {
        $scope.driverList = response.data;
        $scope.truck.driver = $scope.driverList[0];
    });
    $http.get('/getAreaList').then(function (response) {
        renderSltPicker();
        $.each(response.data, function (index, value) {
            var areaID = value.id.split(",");
            var areaName = value.name.split(",");
            var area = [];
            $.each(areaID, function (index, value) {
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
        $('.selectpicker').on('change', function () {
            renderSltPicker();
        });
    });

    $scope.addTruck = function () {
        $scope.truck.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addTruck', $scope.truck).then(function (response) {
            var returnedData = response.data;
            var newTruckID = returnedData.details.truckID;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    message: "Truck added successfully!"
                });
                $scope.truckList.push({"id":newTruckID, "no":$scope.truck.no, "transporter":$scope.truck.transporter, "ton":$scope.truck.ton, "roadtax":$scope.truck.roadtax, "status":'Active'});
                $scope.filterTruckList = angular.copy($scope.truckList);
                $scope.totalItems = $scope.filterTruckList.length;
                angular.element('#createTruck').modal('toggle');
                $scope.initializeTruck();
            }
        });
    }
});

app.controller('driverController', function ($scope, $http, $filter) {
    'use strict';

    $scope.initializeDriver = function () {
        $scope.driver = {
            "name": ''
        };
    };

    $http.get('/getAllDriver').then(function (response) {
        $scope.driverList = response.data;
    });

    $scope.addDriver = function () {
        $scope.driver.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addDriver', $scope.driver).then(function (response) {
            var returnedData = response.data;
            var newDriverID = returnedData.details.driverID;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    message: "Driver added successfully!"
                });
                angular.element('#createDriver').modal('toggle');
                $scope.driverList.push({
                    "id": newDriverID,
                    "name": $scope.driver.name,
                    "status": 'ACTIVE'
                });
                $scope.initializeDriver();
            }
        });
    }
});

app.controller('zoneController', function ($scope, $http, $filter) {
    'use strict';

    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 8; //Record number each page
    $scope.maxSize = 10; //Show the number in page

    $scope.initializeZone = function () {
        $scope.zone = {
            "name": '',
            "creationDate": ''
        };
    }

    $http.get('/getAllZone').then(function (response) {
        $scope.searchZoneFilter = '';
        $scope.zoneList = response.data;
        $scope.filterZoneList = [];
        $scope.searchZone = function (zone) {
            return (zone.id + zone.name + zone.status).toUpperCase().indexOf($scope.searchZoneFilter.toUpperCase()) >= 0;
        }

        $.each($scope.zoneList, function (index) {
            $scope.filterZoneList = angular.copy($scope.zoneList);
        });

        $scope.totalItems = $scope.filterZoneList.length;

        $scope.getData = function () {
            return $filter('filter')($scope.filterZoneList, $scope.searchZoneFilter);
        };

        $scope.$watch('searchZoneFilter', function (newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);

    });

    $scope.addZone = function () {
        $scope.zone.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addZone', $scope.zone).then(function (response) {
            var returnedData = response.data;
            var newZoneID = returnedData.details.zoneID;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    message: "Zone added successfully!"
                });
                $scope.zoneList.push({
                    "id": newZoneID,
                    "name": $scope.zone.name,
                    "status": 'ACTIVE'
                });
                $scope.filterZoneList = angular.copy($scope.zoneList);
                $scope.totalItems = $scope.filterZoneList.length;
                angular.element('#createZone').modal('toggle');
                $scope.initializeZone();
            }
        });
    }
    
    //new added 15/5
    //inactive can't be show
    $scope.editZone = function(){
        $http.post('/editZone', $scope.zone).then(function(response){
            var data = response.data;
            if(data.status === "success"){
                angular.element('body').overhang({
                    type: data.status,
                    message: data.message
                });
            }
            
        });
    }
});

app.controller('roleController', function ($scope, $http, $filter) {
    'use strict';
    
    $scope.initializeRole = function () {
        $scope.role = {
            "name": '',
            "creationDate": ''
        };
    };
    
    $http.get('/getAllRole').then(function (response) {
        $scope.roleList = response.data;
    });

    $scope.editAuth = function (role) {
        window.location.href = '#/auth/' + role;
    };
    
    $scope.addRole = function () {
        $scope.role.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addRole', $scope.role).then(function (response) {
            var data = response.data;
            angular.element('body').overhang({
                type: data.status,
                "message": data.message
            });
            if (data.status == "success") {
                $scope.roleList.push({"id": data.details.roleID, "name": $scope.role.name, "status": "ACTIVE"});
                angular.element('#createRole').modal('toggle');
                $scope.initializeRole();
            }
        });
    };
    
});

app.controller('specificAuthController', function ($scope, $http, $routeParams) {
    $scope.role = {
        "name": $routeParams.auth
    };
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
            "view": 'I'
        }
    };

    $http.post('/getAllAuth', $scope.role).then(function (response) {
        $.each(response.data, function (index, value) {
            $.each($scope.auth, function (bigKey, bigValue) {
                $.each(bigValue, function (smallKey, smallValue) {
                    if (smallKey == "collection") {
                        $.each(smallValue, function (xsmallKey, xsmallValue) {
                            $scope.auth[bigKey][smallKey][xsmallKey] = value.status;
                        });
                    } else {
                        if (value.name.indexOf(smallKey) != -1) {
                            if (value.name.indexOf(bigKey) != -1) {
                                $scope.auth[bigKey][smallKey] = value.status;
                            }
                        }
                    }
                });
            });
        });
    });

    $scope.changeValue = function (value, key) {
        console.log($scope.role.name);
        console.log(key);
        console.log(value);
        
        $scope.thisAuth = {
            "name": $scope.role.name,
            "management": key,
            "access": value
        };
        
        $http.post('/setAuth', $scope.thisAuth).then(function (response) {
            var data = response.data;
            angular.element('body').overhang({
                type: data.status,
                "message": data.message
            });
        });
        
    }

});

// Felix handsome boi doing reporting
app.controller('reportingController', function ($scope, $filter) {
    'use strict';
    $scope.searchReportFilter = '';
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 10; //Record number each page
    $scope.maxSize = 10; //Show the number in page

    $scope.handledArea = [{
        "zoneCode": 'Z1',
        "area": [{
            "areaCode": 'Z1A1',
            "areaName": 'Zone 1 Area 1'
        }, {
            "areaCode": 'Z1A2',
            "areaName": 'Zone 1 Area 2'
        }, {
            "areaCode": 'Z1A3',
            "areaName": 'Zone 1 Area 3'
        }, {
            "areaCode": 'Z1A4',
            "areaName": 'Zone 1 Area 4'
        }, {
            "areaCode": 'Z1A5',
            "areaName": 'Zone 1 Area 5'
        }]
    }, {
        "zoneCode": 'Z2',
        "area": [{
            "areaCode": 'Z2A1',
            "areaName": 'Zone 2 Area 1'
        }, {
            "areaCode": 'Z2A2',
            "areaName": 'Zone 2 Area 2'
        }, {
            "areaCode": 'Z2A3',
            "areaName": 'Zone 2 Area 3'
        }, {
            "areaCode": 'Z2A4',
            "areaName": 'Zone 2 Area 4'
        }, {
            "areaCode": 'Z2A5',
            "areaName": 'Zone 2 Area 5'
        }]
    }, {
        "zoneCode": 'Z3',
        "area": [{
            "areaCode": 'Z3A1',
            "areaName": 'Zone 3 Area 1'
        }, {
            "areaCode": 'Z3A2',
            "areaName": 'Zone 3 Area 2'
        }, {
            "areaCode": 'Z3A3',
            "areaName": 'Zone 3 Area 3'
        }, {
            "areaCode": 'Z3A4',
            "areaName": 'Zone 3 Area 4'
        }, {
            "areaCode": 'Z3A5',
            "areaName": 'Zone 3 Area 5'
        }]
    }];

    $scope.thisArea = function (a) {
        angular.element('#chooseArea').modal('toggle');
        setTimeout(function () {
            window.location.href = '#/daily-report/' + a;
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
//Felix handsome boi2 doing visualization
app.controller('visualizationController', function ($scope) {
    'use strict';
    $scope.chartDurationGarbageSelected = "Line";
    $scope.changeChartDurationGarbage = function(chart){
        if(chart === 'Line'){
            $scope.chartDurationGarbageSelected = "Line";
        }else if(chart === 'Bar'){
            $scope.chartDurationGarbageSelected = "Bar";
        }
    }
    //chart-line-duration-garbage
    Highcharts.chart('chart-line-duration-garbage', {

        title: {
            text: 'Areas Collection Duration'
        },

        subtitle: {
            text: 'Trienekens'
        },

        yAxis: {
            title: {
                text: 'Duration in Minutes'
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },

        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                },
                pointStart: 2010
            }
        },

        series: [{
            name: 'Tabuan Jaya',
            data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
    }, {
            name: 'Padungan',
            data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
    }, {
            name: 'Simpang Tiga',
            data: [11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387]
    }, {
            name: 'Jalan Song',
            data: [null, null, 7988, 12169, 15112, 22452, 34400, 34227]
    }, {
            name: 'Other',
            data: [12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111]
    }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
        }]
        }

    });
    //chart-bar-duration-garbage
    Highcharts.chart('chart-bar-duration-garbage', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Areas Collection Duration'
    },
    subtitle: {
        text: 'Trienekens'
    },
    xAxis: {
        categories: [
            '5 May, 2019',
            '6 May, 2019',
            '7 May, 2019',
            '8 May, 2019',
            '9 May, 2019',
            '10 May, 2019',
            '11 May, 2019',
            '12 May, 2019',
            '13 May, 2019',
            '14 May, 2019',
            '15 May, 2019',
            '16 May, 2019'
        ],
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Duration in Minutes'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: [{
        name: 'Tabuan Jaya',
        data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

    }, {
        name: 'Padungan',
        data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

    }, {
        name: 'Simpang Tiga',
        data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]

    }, {
        name: 'Jalan Song',
        data: [42.4, 33.2, 34.5, 39.7, 52.6, 75.5, 57.4, 60.4, 47.6, 39.1, 46.8, 51.1]

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
            text: 'Browser market shares in January, 2018'
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
            name: 'Brands',
            colorByPoint: true,
            data: [{
                name: 'Chrome',
                y: 61.41,
                sliced: true,
                selected: true
        }, {
                name: 'Internet Explorer',
                y: 11.84
        }, {
                name: 'Firefox',
                y: 10.85
        }, {
                name: 'Edge',
                y: 4.67
        }, {
                name: 'Safari',
                y: 4.18
        }, {
                name: 'Sogou Explorer',
                y: 1.64
        }, {
                name: 'Opera',
                y: 1.6
        }, {
                name: 'QQ',
                y: 1.2
        }, {
                name: 'Other',
                y: 2.61
        }]
    }]
    });
    //chart-line-volume-day
    {
    $.getJSON( 'https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/usdeur.json',
    function (data) {

        Highcharts.chart('chart-line-volume-day', {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'USD to EUR exchange rate over time'
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
                    text: 'Exchange rate'
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
                name: 'USD to EUR',
                data: data
            }]
        });
    }
);}
    //chart-combine-durvol-day
    Highcharts.chart('chart-combine-durvol-day', {
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: 'Average Monthly Temperature and Rainfall in Tokyo'
    },
    subtitle: {
        text: 'Source: WorldClimate.com'
    },
    xAxis: [{
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        crosshair: true
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            format: '{value}∞C',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        title: {
            text: 'Temperature',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        }
    }, { // Secondary yAxis
        title: {
            text: 'Rainfall',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        labels: {
            format: '{value} mm',
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
        name: 'Rainfall',
        type: 'column',
        yAxis: 1,
        data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
        tooltip: {
            valueSuffix: ' mm'
        }

    }, {
        name: 'Temperature',
        type: 'spline',
        data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
        tooltip: {
            valueSuffix: '∞C'
        }
    }]
});
});


app.controller('binController', function($scope, $http, $filter){
    'use strict';
    $scope.areaList = [];
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;
    
    $scope.bin = {
        "name": '',
        "loc": '',
        "area": ''
    };
    
    $http.get('/getAllBin').then(function(response){
        $scope.searchBinFilter = '';
        $scope.binList = response.data;
        $scope.filterBinList = [];
        
        $scope.searchBin = function (bin) {
            return (bin.id + bin.name + bin.status).toUpperCase().indexOf($scope.searchBinFilter.toUpperCase()) >= 0;
        }
        
        $.each($scope.binList, function(index) {
            $scope.filterBinList = angular.copy($scope.binList);
        });
    
        $scope.totalItems = $scope.filterBinList.length;
    
        $scope.getData = function () {
            return $filter('filter')($scope.filterBinList, $scope.searchBinFilter);
        };
    
        $scope.$watch('searchBinFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);
        
        
    });
    
    
    $http.get('/getAreaList').then(function (response) {
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
            $scope.areaList.push({"zone": { "id": value.zoneID, "name": value.zoneName } ,"area": area});
        });
        $('.selectpicker').on('change', function() {
            renderSltPicker();
        });
    });
    
    
    function renderSltPicker() {
        angular.element('.selectpicker').selectpicker('refresh');
        angular.element('.selectpicker').selectpicker('render');
    }
    
    $scope.addBin = function () {
        $scope.bin.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addBin', $scope.bin).then(function (response) {
            var returnedData = response.data;
            var newBinID = returnedData.details.binID;
            
            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "Area added successfully!"
                });
                $scope.binList.push({"id": newBinID, "name": $scope.bin.name, "loc": $scope.bin.loc, "area":$scope.bin.area.name, "status": 'ACTIVE'});
                $scope.filterBinList = angular.copy($scope.binList);
                angular.element('#createBin').modal('toggle');
                $scope.totalItems = $scope.filterBinList.length;
            }
        });
    }
    
    $scope.editBin = function(){
        
        $http.post('/editBin', $scope.bin).then(function(response){
            var data = response.data;
            if(data.status === "success"){
                angular.element('body').overhang({
                    type: data.status,
                    message: data.message
                });
            }
            
        });
    }
    
});

//acr controller
app.controller('acrController',function($scope, $http, $filter){
    'use strict';
    $scope.acrList = [];
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;
    
    $scope.acr = {
        "name": '',
        "address": '',
        "area": '',
        "phone": '',
        "enddate": '',
        "status": ''
    };
    
        
    $http.get('/getAreaList').then(function (response) {
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
            $scope.areaList.push({"zone": { "id": value.zoneID, "name": value.zoneName } ,"area": area});
        });
        $('.selectpicker').on('change', function() {
            renderSltPicker();
        });
    });
    
    
    function renderSltPicker() {
        angular.element('.selectpicker').selectpicker('refresh');
        angular.element('.selectpicker').selectpicker('render');
    }
    
    $http.get('/getAllAcr').then(function(response){
        
        $scope.searchAcrFilter = '';
        $scope.acrList = response.data;
        $scope.filterAcrList = [];

        $scope.searchAcr = function (bin) {
            return (acr.id + acr.name + acr.address + acr.area + acr.phone + acr.enddate + acr.status).toUpperCase().indexOf($scope.searchAcrFilter.toUpperCase()) >= 0;
        }

        $.each($scope.acrList, function(index) {
            $scope.filterAcrList = angular.copy($scope.acrList);
        });

        $scope.totalItems = $scope.filterAcrList.length;

        $scope.getData = function () {
            return $filter('filter')($scope.filterAcrList, $scope.searchAcrFilter);
        };

        $scope.$watch('searchAcrFilter', function(newVal, oldVal) {
            var vm = this;
            if (oldVal !== newVal) {
                $scope.currentPage = 1;
                $scope.totalItems = $scope.getData().length;
            }
            return vm;
        }, true);


    });
    
    $scope.addAcr = function () {
        $scope.acr.creationDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        $http.post('/addAcr', $scope.acr).then(function (response) {
            var returnedData = response.data;
            var newAcrID = returnedData.details.acrID;
            
            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "ACR added successfully!"
                });
                $scope.acrList.push({"id": newAcrID, "name": $scope.acr.name, "address": $scope.acr.address, "area":$scope.area.area.name, "phone":$scope.acr.phone, "enddate":$scope.acr.enddate, "status": 'ACTIVE'});
                $scope.filterAcrList = angular.copy($scope.acrList);
                angular.element('#createACR').modal('toggle');
                $scope.totalItems = $scope.filterAcrList.length;
            }
        });
    }
});