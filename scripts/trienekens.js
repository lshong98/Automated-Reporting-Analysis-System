/*
jshint: white
global angular, document, google, Highcharts
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

app.service('storeDataService', function () {
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
        "show": {
            "account": {
                "create": false,
                "edit": false,
                "view": false
            },
            "driver": {
                "create": false,
                "edit": false,
                "view": false
            },
            "truck": {
                "create": false,
                "edit": false,
                "view": false
            },
            "zone": {
                "create": false,
                "edit": false,
                "view": false
            },
            "area": {
                "create": false,
                "edit": false,
                "view": false,
                "collection": {
                    "add": false,
                    "edit": false
                }
            },
            "bin": {
                "create": false,
                "edit": false,
                "view": false
            },
            "acr": {
                "create": false,
                "edit": false,
                "view": false
            }
        }
    };
    
    return globalList;
});

app.directive('editable', function ($compile, $http, $filter, storeDataService) {
    'use strict';
    return function (scope) {
        scope.showTruck = true;
        scope.showZone = true;
        scope.showProfile = true;
        scope.showBin = true;
        scope.showCollection = true;
        scope.deleteCollection = true;
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
            "status": ''
        };
        scope.thisCollection = {
            "id": '',
            "address": ''
        };
        scope.collection = {
            "id": ''
        };
        
        scope.notify = function (stat, mes) {
            angular.element('body').overhang({
                type: stat,
                message: mes
            });
        };
        
        scope.editTruck = function (id, no, transporter, ton, tax, status) {
            scope.showTruck = !scope.showTruck;
            scope.thisTruck = { "id": id, "no": no, "transporter": transporter, "ton": ton, "roadtax": tax, "status": status };
        };
        scope.saveTruck = function () {
            scope.showTruck = !scope.showTruck;
            $http.post('/editTruck', scope.t).then(function (response) {
                var data = response.data;
                scope.notify(data.status, data.message);
                
                $.each(storeDataService.truck, function (index, value) {
                    if (storeDataService.truck[index].id == scope.thisTruck.id) {
                        if (data.status == "success") {
                            storeDataService.truck[index] = angular.copy(scope.t);
                        } else {
                            scope.t = angular.copy(storeDataService.truck[index]);
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
        
        scope.editZone = function (id, name, status) {
            scope.showZone = !scope.showZone;
            scope.thisZone = { "id": id, "name": name, "status": status };
        };
        scope.saveZone = function () {
            scope.showZone = !scope.showZone;
            $http.post('/editZone', scope.z).then(function (response) {
                var data = response.data;
                scope.notify(data.status, data.message);
                
                $.each(storeDataService.zone, function (index, value) {
                    if (storeDataService.zone[index].id == scope.thisZone.id) {
                        if (data.status == "success") {
                            storeDataService.zone[index] = angular.copy(scope.z);
                        } else {
                            scope.z = angular.copy(storeDataService.zone[index]);
                        }
                    }
                });
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
        
        scope.editBin = function (id, name, location, area, status) {
            scope.showBin = !scope.showBin;
            scope.b.area = area;
            angular.element('.selectpicker').selectpicker('refresh');
            angular.element('.selectpicker').selectpicker('render');
            scope.thisBin = { "id": id, "name": name, "location": location, "area": area, "status": status };
        };
        scope.saveBin = function () {
            scope.showBin = !scope.showBin;
            
            $http.post('/editBin', scope.b).then(function (response) {
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
            scope.thisCollection = { "id": id, "address": address };
        };
        scope.saveCollection = function () {
            scope.showCollection = !scope.showCollection;
            console.log(scope.thisCollection);
            console.log(scope.c);
            $http.post('/updateCollection', scope.c).then(function (response) {
                var data = response.data;
                
                scope.notify(data.status, data.message);
                if (data.status == "success") {
                    $.each(storeDataService.collection, function (index, value) {
                        if (storeDataService.collection[index].id = scope.thisCollection.id) {
                            storeDataService.collection[index] = angular.copy(scope.c);
                            return false;
                        }
                    });
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
            $http.post('/deleteCollection', scope.collection).then(function (response) {
                var data = response.data;
                scope.notify(data.status, data.message);
                if (data.status == "success") {
                    $.each(storeDataService.collection, function (index, value) {
                        if (storeDataService.collection[index].id == scope.collection.id) {
                            scope.deleteCollection = !scope.deleteCollection;
                            storeDataService.collection.splice(index, 1);
                            return false;
                        }
                    });
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

app.controller('navigationController', function ($scope, $http, $window, storeDataService) {
    'use strict';
    
    $scope.navigation = {
        "name": $window.sessionStorage.getItem('position'),
        "manager": false,
        "officer": false
    };
    
    $scope.show = {
        "account": {
            "create": false,
            "edit": false,
            "view": false
        },
        "driver": {
            "create": false,
            "edit": false,
            "view": false
        },
        "truck": {
            "create": false,
            "edit": false,
            "view": false
        },
        "zone": {
            "create": false,
            "edit": false,
            "view": false
        },
        "area": {
            "create": false,
            "edit": false,
            "view": false,
            "collection": {
                "add": false,
                "edit": false
            }
        },
        "bin": {
            "create": false,
            "edit": false,
            "view": false
        },
        "acr": {
            "create": false,
            "edit": false,
            "view": false
        }
    };
    
    if ($scope.navigation.name == "Manager") {
        $scope.navigation["manager"] = true;
    } else {
        $scope.navigation["officer"] = true;
    }

    $http.post('/getAllAuth', $scope.navigation).then(function (response) {
        $.each(response.data, function (index, value) {
            $.each($scope.show, function (bigKey, bigValue) {
                $.each(bigValue, function (smallKey, smallValue) {
                    if (smallKey == "collection") {
                        $.each(smallValue, function (xsmallKey, xsmallValue) {
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
});

app.controller('managerController', function ($scope, $http, $filter) {
    'use strict';
    //date configuration
    var currentDate = new Date();
    var startDate = new Date();
    startDate.setDate(currentDate.getDate() - 7);
    $scope.visualdate = {
        "dateStart" : '',
        "dateEnd" : ''
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
    
    var socket = io.connect();
    socket.on('connect', function () {
        var sessionid = socket.io.engine.id;
    });
    
    $http.get('/getZoneCount').then(function (response) {
        $scope.zoneCount = response.data[0].count;
    });
    
    $http.get('/getAreaCount').then(function (response) {
        $scope.areaCount = response.data[0].count;
    });
    
    $http.get('/getAcrCount').then(function (response) {
        $scope.acrCount = response.data[0].count;
    });
    
    $http.get('/getBinCount').then(function (response) {
        $scope.binCount = response.data[0].count;
    });
    
    $http.get('/getTruckCount').then(function (response) {
        $scope.truckCount = response.data[0].count;
    });
    
    $http.get('/getUserCount').then(function (response) {
        $scope.userCount = response.data[0].count - 1;
    });
    
    $http.get('/getReportCompleteCount').then(function (response) {
        $scope.reportCompleteCount = response.data[0].completeCount;
    });
    
    $http.get('/getReportIncompleteCount').then(function (response) {
        $scope.reportIncompleteCount = response.data[0].incompleteCount;
    });
    
    $http.post('/getDataVisualization', $scope.visualdate).then(function (response) {
        $scope.visualObject = response.data;
    });
    $http.post('/getDataVisualizationGroupByDate', $scope.visualdate).then(function (response) {
        $scope.reportListGroupByDate = response.data;
        displayChart();
    });
    var displayChart = function(){
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

//    function synchronizePieSeries(event, slice) {
//        //console.log($(pieChart.series[1]));
//        $(pieChart.series[1].data).each(function (i, e) {
//            if (slice.name === e.name) {
//                slice.visible ? e.graphic.hide() : e.graphic.show();
//            }
//        });
//    }

//    var pieChart = new Highcharts.Chart({
//        chart: {
//            renderTo: 'pie-chart',
//            plotBackgroundColor: null,
//            plotBorderWidth: 1,
//            plotShadow: false,
//            type: 'pie',
//            events: {
//                load: function () {},
//                redraw: function () {}
//            }
//        },
//        title: '',
//        labels: {
//            items: [{
//                html: 'QAA 1234',
//                style: {
//                    left: '40',
//                    top: '130'
//                }
//            }, {
//                html: 'QAA 2345',
//                style: {
//                    left: '190',
//                    top: '130'
//                }
//            }, {
//                html: 'QAA 2345',
//                style: {
//                    left: '340',
//                    top: '130'
//                }
//            }, {
//                html: 'QAA 2345',
//                style: {
//                    left: '490',
//                    top: '130'
//                }
//            }, {
//                html: 'QAA 2345',
//                style: {
//                    left: '640',
//                    top: '130'
//                }
//            }]
//        },
//        legend: {
//            enabled: true
//        },
//        tooltip: {
//            pointFormat: '{data.name}: <b>{point.percentage:.1f}%</b>'
//        },
//        plotOptions: {
//            pie: {
//                allowPointSelect: false,
//                innerSize: '70%',
//                cursor: 'pointer',
//                column: {
//                    colorByPoint: true
//                },
//                dataLabels: false
//            }
//        },
//        floating: true,
//        series: [{
//            type: 'pie',
//            name: 'Browser share',
//            center: [50, 50],
//            size: 100,
//            showInLegend: true,
//            title: {
//                align: 'center',
//                text: '<b>91.76%</b>',
//                verticalAlign: 'middle',
//                y: -10
//            },
//            data: [
//                {
//                    name: 'Used space',
//                    y: 91.76,
//                    labels: 'ok',
//                    color: '#C10003'
//                }, {
//                    name: 'Free space',
//                    y: 8.24,
//                    color: 'gray'
//                }
//            ]
//        }, {
//            type: 'pie',
//            name: 'Browser share',
//            center: [200, 50],
//            size: 100,
//            title: {
//                align: 'center',
//                text: '<b>10%</b>',
//                verticalAlign: 'middle',
//                y: -10
//            },
//            dataLabels: {
//                enabled: false
//            },
//            data: [
//                {
//                    name: 'Used space',
//                    y: 10,
//                    color: '#C10003'
//                }, {
//                    name: 'Free space',
//                    y: 90,
//                    color: 'gray'
//                }
//            ]
//        }, {
//            type: 'pie',
//            name: 'Browser share',
//            center: [350, 50],
//            size: 100,
//            title: {
//                align: 'center',
//                text: '<b>30%</b>',
//                verticalAlign: 'middle',
//                y: -10
//            },
//            dataLabels: {
//                enabled: false
//            },
//            data: [
//                {
//                    name: 'Used space',
//                    y: 30,
//                    color: '#C10003'
//                }, {
//                    name: 'Free space',
//                    y: 70,
//                    color: 'gray'
//                }
//            ]
//        }, {
//            type: 'pie',
//            name: 'Browser share',
//            center: [500, 50],
//            size: 100,
//            title: {
//                align: 'center',
//                text: '<b>55%</b>',
//                verticalAlign: 'middle',
//                y: -10
//            },
//            dataLabels: {
//                enabled: false
//            },
//            data: [
//                {
//                    name: 'Used space',
//                    y: 55,
//                    color: '#C10003'
//                }, {
//                    name: 'Free space',
//                    y: 45,
//                    color: 'gray'
//                }
//            ]
//        }, {
//            type: 'pie',
//            name: 'Browser share',
//            center: [650, 50],
//            size: 100,
//            title: {
//                align: 'center',
//                text: '<b>85%</b>',
//                verticalAlign: 'middle',
//                y: -10
//            },
//            dataLabels: {
//                enabled: false
//            },
//            data: [
//                {
//                    name: 'Used space',
//                    y: 85,
//                    color: '#C10003'
//                }, {
//                    name: 'Free space',
//                    y: 15,
//                    color: 'gray'
//                }
//            ]
//        }]
//    }, function (chart) {
//        $(chart.series[0].data).each(function (i, e) {
//            e.legendItem.on('click', function (event) {
//                var legendItem = e.name;
//
//                event.stopPropagation();
//
//                $(chart.series).each(function (j, f) {
//                    $(this.data).each(function (k, z) {
//                        if (z.name == legendItem) {
//                            if (z.visible) {
//                                z.setVisible(false);
//                            } else {
//                                z.setVisible(true);
//                            }
//                        }
//                    });
//                });
//            });
//        });
//    });
//
//    var lineChart = new Highcharts.Chart({
//        chart: {
//            renderTo: 'line-chart'
//        },
//        title: {
//            text: 'Solar Employment Growth by Sector, 2010-2016'
//        },
//        subtitle: {
//            text: 'Source: thesolarfoundation.com'
//        },
//        yAxis: {
//            title: {
//                text: 'Number of Employees'
//            }
//        },
//        legend: {
//            layout: 'vertical',
//            align: 'right',
//            verticalAlign: 'middle'
//        },
//        plotOptions: {
//            series: {
//                label: {
//                    connectorAllowed: false
//                },
//                pointStart: 2010
//            }
//        },
//        series: [{
//            name: 'Installation',
//            data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
//        }, {
//            name: 'Manufacturing',
//            data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
//        }, {
//            name: 'Sales & Distribution',
//            data: [11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387]
//        }, {
//            name: 'Project Development',
//            data: [null, null, 7988, 12169, 15112, 22452, 34400, 34227]
//        }, {
//            name: 'Other',
//            data: [12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111]
//        }],
//        responsive: {
//            rules: [{
//                condition: {
//                    maxWidth: 1000
//                },
//                chartOptions: {
//                    legend: {
//                        layout: 'horizontal',
//                        align: 'center',
//                        verticalAlign: 'bottom'
//                    }
//                }
//            }]
//        }
//    });
//
//    var barChart = new Highcharts.Chart({
//        chart: {
//            type: 'bar',
//            renderTo: 'bar-chart'
//        },
//        title: {
//            text: 'Population pyramid for Germany, 2018'
//        },
//        subtitle: {
//            text: 'Source: <a href="http://populationpyramid.net/germany/2018/">Population Pyramids of the World from 1950 to 2100</a>'
//        },
//        xAxis: [{
//            categories: categories,
//            reversed: false,
//            labels: {
//                step: 1
//            }
//        }, { // mirror axis on right side
//            opposite: true,
//            reversed: false,
//            categories: categories,
//            linkedTo: 0,
//            labels: {
//                step: 1
//            }
//        }],
//        yAxis: {
//            title: {
//                text: null
//            },
//            labels: {
//                formatter: function () {
//                    return Math.abs(this.value) + '%';
//                }
//            }
//        },
//        plotOptions: {
//            series: {
//                stacking: 'normal'
//            }
//        },
//        tooltip: {
//            formatter: function () {
//                return '<b>' + this.series.name + ', age ' + this.point.category + '</b><br/>' +
//                    'Population: ' + Highcharts.numberFormat(Math.abs(this.point.y), 0);
//            }
//        },
//        series: [{
//            name: 'Male',
//            data: [
//                -2.2, -2.1, -2.2, -2.4,
//                -2.7, -3.0, -3.3, -3.2,
//                -2.9, -3.5, -4.4, -4.1,
//                -3.4, -2.7, -2.3, -2.2,
//                -1.6, -0.6, -0.3, -0.0,
//                -0.0
//            ]
//        }, {
//            name: 'Female',
//            data: [
//                2.1, 2.0, 2.1, 2.3, 2.6,
//                2.9, 3.2, 3.1, 2.9, 3.4,
//                4.3, 4.0, 3.5, 2.9, 2.5,
//                2.7, 2.2, 1.1, 0.6, 0.2,
//                0.0
//            ]
//        }]
//    });

});

app.controller('officerController', function ($scope, $filter, $http, $window) {
    'use strict';
    
    var d = new Date()
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    $scope.todayDate = $filter('date')(new Date(), 'yyyy-MM-dd');
    $scope.todayDay = days[d.getDay()];
    $scope.areaList = [];
    $scope.reportingOfficerId = {
        "officerid" : $window.sessionStorage.getItem('owner')
    };
    
    $http.post('/getReportingAreaList',$scope.reportingOfficerId).then(function (response) {
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

    $scope.thisArea = function (a) {
        window.location.href = '#/daily-report/' + a;
    };
});

app.controller('areaController', function ($scope, $http, $filter, storeDataService) {
    'use strict';

    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 8; //Record number each page
    $scope.maxSize = 10; //Show the number in page

    $scope.area = {
        "zone": '',
        "staff": ''
    };
    
    $scope.show = angular.copy(storeDataService.show.area);

    $http.get('/getAllArea').then(function (response) {
        $scope.searchAreaFilter = '';
        $scope.areaList = response.data;
        $scope.filterAreaList = [];

//        for(var i = 0; i < ($scope.areaList).length; i++){
//            $scope.areaList[i].zoneidname =  $scope.areaList[i].zoneName + '-' + $scope.areaList[i].zone;
//            $scope.areaList[i].staffidname = $scope.areaList[i].staffName + '-' + $scope.areaList[i].staff;
//        }
        
        $scope.searchArea = function (area) {
            return (area.id + area.name + area.status).toUpperCase().indexOf($scope.searchAreaFilter.toUpperCase()) >= 0;
        }

//        $.each($scope.areaList, function (index) {
            $scope.filterAreaList = angular.copy($scope.areaList);
//        });

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

    $http.get('/getZoneList').then(function (response) {
        $scope.zoneList = response.data;
        $scope.area.zone = $scope.zoneList[0];
        for(var i =0; i<(response.data).length; i++){
            $scope.zoneList[i].zoneidname =  response.data[i].name + '-' + response.data[i].id;
        }
    });

    $http.get('/getStaffList').then(function (response) {
        $scope.staffList = response.data;
        $scope.area.staff = $scope.staffList[0];
        for(var i =0; i<(response.data).length; i++){
            $scope.staffList[i].staffidname =  response.data[i].name + '-' + response.data[i].id;
        }
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
                    "status": 'ACTIVE',
                    "zoneName" : ($scope.area.zone.id + '-' + $scope.area.zone.name),
                    "staffName" : ($scope.area.staff.id + '-' +$scope.area.staff.name) 
                });
                console.log($scope.area.zone);
                console.log($scope.area.staff);
                $scope.filterAreaList = angular.copy($scope.areaList);
                angular.element('#createArea').modal('toggle');
                $scope.totalItems = $scope.filterAreaList.length;
            }
        });
    }
    
    $scope.editAreaPage = function(id){
        window.location.href = '#/area/' + id;
    };
});

app.controller('thisAreaController', function ($scope, $http, $routeParams, storeDataService) {
    'use strict';
    
    var areaID = $routeParams.areaID;
    
    $scope.area = {
        "id": areaID,
        "name": '',
        "zone": '',
        "staff": '',
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
        "frequency": ''
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
    
    $http.get('/getZoneList').then(function (response){
        var data = response.data;
        $scope.zoneList = data;
    });
    
    $http.get('/getStaffList').then(function (response) {
        var data = response.data;
        $scope.staffList = data;
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
    });
    
    $http.post('/getCollection', $scope.area).then(function (response) {
        $scope.collectionList = response.data;
        storeDataService.collection = angular.copy($scope.collectionList);
    });
    
    $scope.addCollection = function () {
        if ($scope.collection.add != "") {
            $http.post('/addCollection', $scope.collection).then(function (response) {
                var data = response.data;
                
                if (data.status == "success") {
                    $scope.collectionList.push({"id": data.details.id, "address": $scope.collection.address});
                    storeDataService.collection = angular.copy($scope.collectionList);
                    $scope.collection.address = "";
                }
                angular.element('body').overhang({
                    "status": data.status,
                    "message": data.message
                });
            });
        }
    };
    
    $scope.updateArea = function(){
        var concatDays = "";
        $.each($scope.days, function (index, value) {
            if (value != "") {
                concatDays += index + ',';
            }
        });
        concatDays = concatDays.slice(0, -1);
        $scope.area.frequency = concatDays;
        $http.post('/updateArea', $scope.area).then(function(response){
            var data = response.data;
            if(data.status === "success"){
                angular.element('body').overhang({
                    type: data.status,
                    message: data.message
                });
                window.location.href = '#/area-management';
            }
            
        });
    };
    
});

app.controller('accountController', function ($scope, $http, $filter, $window, storeDataService) {
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
    
    $scope.show = angular.copy(storeDataService.show.account);

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

        //$.each($scope.staffList, function (index) {
            $scope.filterStaffList = angular.copy($scope.staffList);
        //});

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

app.controller('specificAccController', function ($scope, $http, $routeParams, $filter, storeDataService) {
    'use strict';

    $scope.thisAccount = {
        "id": $routeParams.userID,
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
        "address": ''
    };
    
    $scope.password = {
        "id": $routeParams.userID,
        "password": '',
        "again": ''
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

app.controller('truckController', function ($scope, $http, $filter, storeDataService) {
    'use strict';

    $scope.areaList = [];
    $scope.initializeTruck = function () {
        $scope.truck = {
            "no": '',
            "driver": '',
            "area": ''
        };
    };
    
    $scope.show = angular.copy(storeDataService.show.truck);
    
    $http.get('/getAllTruck').then(function (response) {
        $scope.searchTruckFilter = '';
        $scope.truckList = response.data;
        $.each($scope.truckList, function (index, value) {
            $scope.truckList[index].roadtax = $filter('date')($scope.truckList[index].roadtax, 'yyyy-MM-dd');
        });
        storeDataService.truck = angular.copy(response.data);
        
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
        $scope.truck.roadtax = $filter('date')($scope.truck.roadtax, 'yyyy-MM-dd');
        $http.post('/addTruck', $scope.truck).then(function (response) {
            var returnedData = response.data;
            var newTruckID = returnedData.details.truckID;

            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    message: "Truck added successfully!"
                });
                $scope.truckList.push({"id":newTruckID, "no":$scope.truck.no, "transporter":$scope.truck.transporter, "ton":$scope.truck.ton, "roadtax": $scope.truck.roadtax, "status":'Active'});
                storeDataService.truck = angular.copy($scope.truckList);
                $scope.filterTruckList = angular.copy($scope.truckList);
                $scope.totalItems = $scope.filterTruckList.length;
                angular.element('#createTruck').modal('toggle');
                $scope.initializeTruck();
            }
        });
    };
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

app.controller('zoneController', function ($scope, $http, $filter, storeDataService) {
    'use strict';

    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemsPerPage = 8; //Record number each page
    $scope.maxSize = 10; //Show the number in page

    $scope.initializeZone = function () {
        $scope.zone = {
            "name": '',
            "creationDate": ''
        };
    };
    
    $scope.show = angular.copy(storeDataService.show.zone);

    $http.get('/getAllZone').then(function (response) {
        storeDataService.zone = angular.copy(response.data);
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
                storeDataService.zone = angular.copy($scope.zoneList);
                $scope.totalItems = $scope.filterZoneList.length;
                angular.element('#createZone').modal('toggle');
                $scope.initializeZone();
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

app.controller('specificAuthController', function ($scope, $http, $routeParams, storeDataService) {
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
        var splitName, flag = false, key;
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
        storeDataService.show = angular.copy($scope.auth);
    });

    $scope.changeValue = function (value, key) {
        
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
            storeDataService.show = angular.copy($scope.auth);
        });
    }

});

app.controller('binController', function($scope, $http, $filter, storeDataService){
    'use strict';
    $scope.areaList = [];
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;
    
    $scope.bin = {
        "id": '',
        "name": '',
        "location": '',
        "area": ''
    };
    
    $scope.show = angular.copy(storeDataService.show.bin);
    
    $http.get('/getAllBin').then(function(response){
        $scope.searchBinFilter = '';
        $scope.binList = response.data;
        storeDataService.bin = angular.copy($scope.binList);
        $scope.filterBinList = [];
        
        $scope.searchBin = function (bin) {
            return (bin.id + bin.name + bin.status).toUpperCase().indexOf($scope.searchBinFilter.toUpperCase()) >= 0;
        };
        
        $scope.filterBinList = angular.copy($scope.binList);
    
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
        console.log($scope.bin);
        $http.post('/addBin', $scope.bin).then(function (response) {
            var returnedData = response.data;
            var newBinID = returnedData.details.binID;
            
            if (returnedData.status === "success") {
                angular.element('body').overhang({
                    type: "success",
                    "message": "Area added successfully!"
                });
                $scope.binList.push({"id": newBinID, "name": $scope.bin.name, "location": $scope.bin.location, "area":$scope.bin.area, "status": 'ACTIVE'});
                storeDataService.bin = angular.copy($scope.binList);
                $scope.filterBinList = angular.copy($scope.binList);
                angular.element('#createBin').modal('toggle');
                $scope.totalItems = $scope.filterBinList.length;
            }
        });
    }
    
//    $scope.editBin = function(){
//        
//        $http.post('/editBin', $scope.bin).then(function(response){
//            var data = response.data;
//            if(data.status === "success"){
//                angular.element('body').overhang({
//                    type: data.status,
//                    message: data.message
//                });
//            }
//            
//        });
//    }
    
});

//acr controller
app.controller('acrController',function($scope, $http, $filter, storeDataService){
    'use strict';
    $scope.areaList = [];
    $scope.acrList = [];
    $scope.currentPage = 1; //Initial current page to 1
    $scope.itemPerPage = 8; //Record number each page
    $scope.maxSize = 10;
    
    function initializeAcr(){
        $scope.acr = {
            "id": '',    
            "name": '',
            "address": '',
            "area": '',
            "phone": '',
            "days": [{
                "mon": '',
                "tue": '',
                "wed": '',
                "thu": '',
                "fri": '',
                "sat": '',
                "sun": ''
            }],
            "enddate": '',
            "status": ''
        };
    }
    
    $scope.show = angular.copy(storeDataService.show.acr);
    
    function renderSltPicker() {
        angular.element('.selectpicker').selectpicker('refresh');
        angular.element('.selectpicker').selectpicker('render');
    }
    
    $http.get('/getAllAcr').then(function (response) {
        $scope.searchAcrFilter = '';
        $scope.acrList = response.data;
        
        $scope.filterAcrList = [];
        $scope.searchAcr = function (acr) {
            return (acr.id + acr.name + acr.address + acr.area + acr.phone + acr.days + acr.enddate + acr.status).toUpperCase().indexOf($scope.searchAcrFilter.toUpperCase()) >= 0;
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
    
    angular.element('.datepicker').datepicker();
    
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
        renderSltPicker();
        $('.selectpicker').on('change', function() {
            renderSltPicker();
        });
    });
    
    $http.get('/getScheduleList').then(function (response) {
        $scope.scheduleList = response.data;
    });
    
//    $http.get('/getAllAcr').then(function(response){
//        
//        $scope.searchAcrFilter = '';
//        $scope.acrList = response.data;
//        $scope.filterAcrList = [];
//
//        $scope.searchAcr = function (bin) {
//            return (acr.id + acr.name + acr.address + acr.area + acr.phone + acr.enddate + acr.status).toUpperCase().indexOf($scope.searchAcrFilter.toUpperCase()) >= 0;
//        }
//
//        $.each($scope.acrList, function(index) {
//            $scope.filterAcrList = angular.copy($scope.acrList);
//        });
//
//        $scope.totalItems = $scope.filterAcrList.length;
//
//        $scope.getData = function () {
//            return $filter('filter')($scope.filterAcrList, $scope.searchAcrFilter);
//        };
//
//        $scope.$watch('searchAcrFilter', function(newVal, oldVal) {
//            var vm = this;
//            if (oldVal !== newVal) {
//                $scope.currentPage = 1;
//                $scope.totalItems = $scope.getData().length;
//            }
//            return vm;
//        }, true);
//
//
//    });
    
    
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
                
                var area = $('.selectpicker option:selected').text();
               var areastr = area.split(" ")[2];
//                console.log(areastr);
                $scope.acrList.push({"id": newAcrID, "name": $scope.acr.name, "address": $scope.acr.address, "area": areastr, "phone":$scope.acr.phone, "enddate":$scope.acr.enddate, "status": 'ACTIVE'});
                $scope.filterAcrList = angular.copy($scope.acrList);
                angular.element('#createACR').modal('toggle');
                $scope.totalItems = $scope.filterAcrList.length;
            }
        });
    }
});