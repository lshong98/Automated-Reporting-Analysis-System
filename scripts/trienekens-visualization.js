/*jslint white:true */
/*global angular, Highcharts, $ */
//Felix handsome boi2 doing visualization
app.controller('visualizationController', function ($scope, $http, $window) {
    'use strict';
    $scope.chartDurationGarbageSelected = "Line";
    $scope.changeChartDurationGarbage = function (chart) {
        if (chart === 'Line') {
            $scope.chartDurationGarbageSelected = "Line";
        } else if (chart === 'Bar') {
            $scope.chartDurationGarbageSelected = "Bar";
        }
    }

    var stringToTime = function (string) {
        var strArray = string.split(":");
        var d = new Date();
        d.setHours(strArray[0], strArray[1], strArray[2]);

        return d;
    }
    var getElementList = function (element, data) {
        var objReturn = [];
        var i, j;
        for (i = 0; i < data.length; i += 1) {
            if (element === "reportCollectionDate") {
                objReturn.push(data[i].reportCollectionDate);
            } else if (element === "areaID") {
                objReturn.push(data[i].areaID);
            } else if (element === "garbageAmount") {
                objReturn.push(data[i].garbageAmount);
            } else if (element === "operationTimeStart") {
                objReturn.push(data[i].operationTimeStart);
            } else if (element === "operationTimeEnd") {
                objReturn.push(data[i].operationTimeEnd);
            } else if (element === "area & duration") {
                var exist = false;

                var timeStart = stringToTime(data[i].operationTimeStart)
                var timeEnd = stringToTime(data[i].operationTimeEnd);
                var duration = (timeEnd - timeStart) / 60 / 1000;



                for (j = 0; j < objReturn.length; j += 1) {
                    if (objReturn[j].name === data[i].areaID) {
                        objReturn[j].data.push(duration);
                        exist = true;
                    }
                }
                if (!exist) {
                    objReturn.push({
                        "name": data[i].areaID,
                        "data": [duration]
                    });
                }
            } else if (element === "amountGarbageOnArea") {
                var exist2 = false;
                for (j = 0; j < objReturn.length; j += 1) {
                    if (objReturn[j].name === data[i].areaID) {
                        objReturn[j].y += parseInt(data[i].garbageAmount);
                        exist2 = true;
                    }
                }
                if (!exist2) {
                    objReturn.push({
                        "name": data[i].areaID,
                        "y": parseInt(data[i].garbageAmount)
                    });
                }
            }
        }

        return objReturn;
    }
    $http.get("/data_json/reports.json")
        .then(function (response) {
                $scope.reportList = response.data;
                //        var obj = getElementList("amountGarbageOnArea", $scope.reportList);
                //        console.log(obj);
                displayChart();

            },
            function (response) {
                $window.console.log("errror retrieving json file - " + response);
            });
    //chart-line-duration-garbage
    var displayChart = function () {
        Highcharts.chart('chart-line-duration-garbage', {

            title: {
                text: 'Areas Collection Duration'
            },

            subtitle: {
                text: 'Trienekens'
            },
            xAxis: {
                categories: getElementList("reportCollectionDate", $scope.reportList)
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
            tooltip: {
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y} minutes</b></td></tr>'
            },
            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    }
                }
            },

            series: getElementList("area & duration", $scope.reportList),

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
                categories: getElementList("reportCollectionDate", $scope.reportList),
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
                    '<td style="padding:0"><b>{point.y} minutes</b></td></tr>',
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
            series: getElementList("area & duration", $scope.reportList)
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
                name: 'Amount',
                colorByPoint: true,
                data: getElementList("amountGarbageOnArea", $scope.reportList)
    }]
        });
    }
    //chart-line-volume-day
    {
        $.getJSON('https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/usdeur.json',
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
        );
    }
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
    //
    // Age categories
    var categories = [
    '0-4', '5-9', '10-14', '15-19',
    '20-24', '25-29', '30-34', '35-39', '40-44',
    '45-49', '50-54', '55-59', '60-64', '65-69',
    '70-74', '75-79', '80-84', '85-89', '90-94',
    '95-99', '100 + '
];
    //chart-negativebar-status-area
    Highcharts.chart('chart-negativebar-status-area', {
        chart: {
            type: 'bar'
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
