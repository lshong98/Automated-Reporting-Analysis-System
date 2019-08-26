/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var dateTime = require('node-datetime');
var f = require('./function-management');

app.post('/boundary/create', function (req, res) {
    'use strict';
    
    var dt = dateTime.create().format('Y-m-d H:M:S');
    var d = dateTime.create().format('Y-m-d');
    var dWithoutSymbol = d.replace(/-/g, '');
    var polygons = req.body.polygons, boundaryID;
    
    if (polygons.length === 0) {
        res.json({"status": "success"});
        res.end();
    } else {
        f.boundaryID(dt, polygons).then(function (boundaryJSON) {
            var boundarySQL = "INSERT INTO tblboundary (boundaryID, color, creationDateTime, status) VALUES ", prefix = '';
            var plotSQL = "INSERT INTO tblboundaryplot (boundaryID, lat, lng, ordering, status) VALUES ";
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
                    plotSQL += "('" + boundaryID + "', '" + boundaryJSON.polygons[i].latLngs[k].lat + "', '" + boundaryJSON.polygons[i].latLngs[k].lng + "', '" + (k + 1) + "', 'A')";
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
    }
    
});

app.get('/boundary/load', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblboundaryplot.boundaryID AS id, tblboundary.color, tblboundaryplot.lat, tblboundaryplot.lng FROM tblboundaryplot JOIN tblboundary ON tblboundaryplot.boundaryID = tblboundary.boundaryID WHERE tblboundary.status = 'A' ORDER BY tblboundaryplot.boundaryID ASC, tblboundaryplot.ordering ASC";
    
    database.query(sql, function (err, result) {
        if (err) {
            res.end();
            throw err;
        } else {
            res.json(result);
            res.end();
        }
    });
});

app.post('/boundary/update', function (req, res) {
    'use strict';
    
    var deletePlotSQL = "DELETE FROM tblboundaryplot WHERE ";
    var polygons = req.body.polygons;
    var plotSQL = "INSERT INTO tblboundaryplot (boundaryID, lat, lng, ordering, status) VALUES ";
    
    if (polygons.length === 0) {
        res.json({"status": "success"});
        res.end();
    } else {
        for (var i = 0; i < polygons.length; i++) {
            deletePlotSQL += "boundaryID = '" + polygons[i].id + "' OR ";
            for (var j = 0; j < polygons[i].latLngs.length; j++) {
                plotSQL += "('" + polygons[i].id + "', '" + polygons[i].latLngs[j].lat + "', '" + polygons[i].latLngs[j].lng + "', '" + (j + 1) + "', 'A')";
                plotSQL += ", ";
            }
        }
        plotSQL = plotSQL.trim();
        plotSQL = plotSQL.replace(/.$/, '');
        deletePlotSQL = deletePlotSQL.trim();
        deletePlotSQL = deletePlotSQL.replace(/.$/, '');
        deletePlotSQL = deletePlotSQL.replace(/.$/, '');
        deletePlotSQL = deletePlotSQL.trim();

        database.query(deletePlotSQL, function (err, result) {
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
    }
});

app.post('/boundary/remove', function (req, res) {
    'use strict';
    
    var removedPolygons = req.body.polygons;
    var removedBoundarySQL = "UPDATE tblboundary SET status = 'I' WHERE ",
        removedPlotSQL = "UPDATE tblboundaryplot SET status = 'I' WHERE ";
    
    if (removedPolygons.length > 0) {
        for (var i = 0; i < removedPolygons.length; i++) {
            removedBoundarySQL += "boundaryID = '" + removedPolygons[i].id + "' OR ";
            removedPlotSQL += "boundaryID = '" + removedPolygons[i].id + "' OR ";
        }
    }
    removedBoundarySQL = removedBoundarySQL.slice(0, -4);
    removedPlotSQL = removedPlotSQL.slice(0, -4);
    
    database.query(removedBoundarySQL, function (err, result) {
        if (err) {
            res.end();
            throw err;
        } else {
            database.query(removedPlotSQL, function (err, result) {
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

module.exports = app;