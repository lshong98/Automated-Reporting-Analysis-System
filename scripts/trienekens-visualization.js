//Felix hamsap boi2 doing visualization
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