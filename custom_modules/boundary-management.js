/*jslint node:true*/
var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var database = require('./database-management');
var dateTime = require('node-datetime');
var f = require('./function-management');

app.post('/boundary/create', function (req, res) {
    'use strict';
    
    var dt = dateTime.create().format('Y-m-d H:M:S');
    var d = dateTime.create().format('Y-m-d');
    var dWithoutSymbol = d.replace(/-/g, '');
    var polygons = req.body.polygons, boundaryID;
    
    f.boundaryID(dt, polygons).then(function (boundaryJSON) {
        var boundarySQL = "INSERT INTO tblboundary (boundaryID, color, creationDateTime, status) VALUES ", prefix = '';
        var plotSQL = "INSERT INTO tblboundaryplot (boundaryID, lat, lng, status) VALUES ";
        var boundaryNum = parseInt(boundaryJSON.ID.substring(boundaryJSON.ID.length - 4));
        
        
        for (var i = 0; i < boundaryJSON.polygons.length; i++) {
            if (i !== 0) {
                boundarySQL += ", ";
            }
            
            for (var j = boundaryNum.toString().length; j < 4; j++) {
                prefix += '0';
            }
            boundaryID = "BND" + dWithoutSymbol + prefix + boundaryNum;
            
            boundarySQL += "('" + boundaryID + "', '" + boundaryJSON.polygons[i].color + "', '" + dt + "', 'A')";
            
            for (var k = 0; k < boundaryJSON.polygons[i].latLngs.length; k++) {
                plotSQL += "('" + boundaryID + "', '" + boundaryJSON.polygons[i].latLngs[k].lat + "', '" + boundaryJSON.polygons[i].latLngs[k].lng + "', 'A')";
                plotSQL += ", ";
            }
            
            boundaryNum += 1;
            prefix = '';
        }
        plotSQL = plotSQL.trim();
        plotSQL = plotSQL.replace(/.$/, '');
        
        database.query(boundarySQL, function (err, result) {
            if (err) {
                res.end();
                throw err;
            } else {
                database.query(plotSQL, function (err, result) {
                    if (err) {
                        res.end();
                        throw err;
                    } else {
                        res.json({"status": "success"});
                        res.end();
                    }
                });
            }
        });
    });
    
});

module.exports = app;