/*
jshint: white
global angular, document, google
*/
var app = angular.module('trienekens', ['ngRoute']);

app.controller('errorController', function ($scope, $window) {
    'use strict';
    angular.element('.error-page [data-func="go-back"]').click(function () {
        $window.history.back();
    });
});

app.controller('dailyController', function ($window) {
    'use strict';
    
    var $googleMap, visualizeMap, map, lat = 0, lng = 0;
    
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
                
    //https://maps.googleapis.com/maps/api/geocode/json?address=swinburne+sarawak&key=AIzaSyCuJowvWcaKkGZj2mokAtLuKTsiLHl6rgU
                
    // JSON data returned by API above
    var myPlace = {
        "results" : [
            {
                "address_components" : [
                    {
                        "long_name" : "Jalan Simpang Tiga",
                        "short_name" : "Q5A",
                        "types" : [ "route" ]
                    },
                    {
                        "long_name" : "Kuching",
                        "short_name" : "Kuching",
                        "types" : [ "locality", "political" ]
                    },
                    {
                        "long_name" : "Sarawak",
                        "short_name" : "Sarawak",
                        "types" : [ "administrative_area_level_1", "political" ]
                    },
                    {
                        "long_name" : "马来西亚",
                        "short_name" : "MY",
                        "types" : [ "country", "political" ]
                    },
                    {
                        "long_name" : "93350",
                        "short_name" : "93350",
                        "types" : [ "postal_code" ]
                    }
                ],
                "formatted_address" : "Jalan Simpang Tiga, 93350 Kuching, Sarawak, 马来西亚",
                "geometry" : {
                    "location" : {
                        "lat" : 1.5322626,
                        "lng" : 110.3572259
                    },
                    "location_type" : "GEOMETRIC_CENTER",
                    "viewport" : {
                        "northeast" : {
                            "lat" : 1.533611580291502,
                            "lng" : 110.3585748802915
                        },
                        "southwest" : {
                            "lat" : 1.530913619708498,
                            "lng" : 110.3558769197085
                        }
                    }
                },
                "place_id" : "ChIJ5yzgEQun-zERt0vSz5Dyy2k",
                "plus_code" : {
                    "compound_code" : "G9J4+WV 马来西亚 Sarawak, 古晋",
                    "global_code" : "6PHGG9J4+WV"
                },
                "types" : [ "establishment", "point_of_interest", "university" ]
            }
        ],
        "status" : "OK"
    };
    var myPlace = {
        "results" : [
            {
                "address_components" : [
                    {
                        "long_name" : "Kuching",
                        "short_name" : "Kuching",
                        "types" : [ "locality", "political" ]
                    },
                    {
                        "long_name" : "马来西亚",
                        "short_name" : "MY",
                        "types" : [ "country", "political" ]
                    },
                    {
                        "long_name" : "93250",
                        "short_name" : "93250",
                        "types" : [ "postal_code" ]
                    }
                ],
                "formatted_address" : "No. 216, Lot 2014, Jalan Sungai Tapang, Sarawak, 93250 Kuching, 马来西亚",
                "geometry" : {
                    "location" : {
                        "lat" : 1.4848857,
                        "lng" : 110.3597152
                    },
                    "location_type" : "GEOMETRIC_CENTER",
                    "viewport" : {
                        "northeast" : {
                            "lat" : 1.486234680291502,
                            "lng" : 110.3610641802915
                        },
                        "southwest" : {
                            "lat" : 1.483536719708498,
                            "lng" : 110.3583662197085
                        }
                    }
                },
                "place_id" : "ChIJZw7l55ug-zER2wJp6l3tqtQ",
                "plus_code" : {
                    "compound_code" : "F9M5+XV 马来西亚 Sarawak, 古晋",
                    "global_code" : "6PHGF9M5+XV"
                },
                "types" : [ "establishment", "point_of_interest" ]
            }
        ],
        "status" : "OK"
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