/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var dateTime = require('node-datetime');
var f = require('./function-management');

app.post('/createBoundary', function (req, res) {
    'use strict';
    
    var dt = dateTime.create().format('Y-m-d H:M:S'),
        d = dateTime.create().format('Y-m-d'),
        dWithoutSymbol = d.replace(/-/g, ''),
        polygons = req.body.polygons,
        boundaryID,
        i,
        j,
        k;
    if (polygons.length === 0) {
        res.json({"status": "success"});
        res.end();
    } else {
        f.boundaryID(dt, polygons).then(function (boundaryJSON) {
            var boundarySQL = "INSERT INTO tblboundary (boundaryID, color, areaID, creationDateTime, status) VALUES ", prefix = '',
                plotSQL = "INSERT INTO tblboundaryplot (boundaryID, lat, lng, ordering, status) VALUES ",
                boundaryNum = parseInt(boundaryJSON.ID.substring(boundaryJSON.ID.length - 4), 10);


            for (i = 0; i < boundaryJSON.polygons.length; i += 1) {
                if (i !== 0) {
                    boundarySQL += ", ";
                }

                for (j = boundaryNum.toString().length; j < 4; j += 1) {
                    prefix += '0';
                }
                boundaryID = "BND" + dWithoutSymbol + prefix + boundaryNum;

                boundarySQL += "('" + boundaryID + "', '" + boundaryJSON.polygons[i].color + "', '" + boundaryJSON.polygons[i].areaID + "', '" + dt + "', 'A')";

                for (k = 0; k < boundaryJSON.polygons[i].latLngs.length; k += 1) {
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

app.get('/loadBoundary', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblboundaryplot.boundaryID AS id, tblboundary.color, tblboundaryplot.lat, tblboundaryplot.lng, tblarea.areaCode AS area, tblzone.zoneCode AS zone, tblboundary.areaID FROM tblboundaryplot JOIN tblboundary ON tblboundaryplot.boundaryID = tblboundary.boundaryID JOIN tblarea ON tblarea.areaID = tblboundary.areaID JOIN tblzone ON tblzone.zoneID = tblarea.zoneID WHERE tblboundary.status = 'A' ORDER BY tblboundaryplot.boundaryID ASC, tblboundaryplot.ordering ASC";
    
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

app.post('/loadSpecificBoundary', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblboundary.boundaryID, tblboundary.color, tblboundaryplot.lat, tblboundaryplot.lng FROM tblboundary JOIN tblboundaryplot ON tblboundary.boundaryID = tblboundaryplot.boundaryID WHERE tblboundary.status = 'A' AND tblboundary.areaID = '" + req.body.areaID + "' ORDER BY tblboundaryplot.boundaryID ASC, tblboundaryplot.ordering ASC";
    
    database.query(sql, function (err, result) {
        if (err) {
            req.end();
            throw err;
        } else {
            res.json(result);
            res.end();
        }
    });
});

app.post('/updateBoundary', function (req, res) {
    'use strict';
    
    var deletePlotSQL = "DELETE FROM tblboundaryplot WHERE ",
        polygons = req.body.polygons,
        plotSQL = "INSERT INTO tblboundaryplot (boundaryID, lat, lng, ordering, status) VALUES ",
        i,
        j;
    
    if (polygons.length === 0) {
        res.json({"status": "success"});
        res.end();
    } else {
        for (i = 0; i < polygons.length; i += 1) {
            deletePlotSQL += "boundaryID = '" + polygons[i].id + "' OR ";
            for (j = 0; j < polygons[i].latLngs.length; j += 1) {
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

app.post('/removeBoundary', function (req, res) {
    'use strict';
    
    var removedPolygons = req.body.polygons,
        removedBoundarySQL = "UPDATE tblboundary SET status = 'I' WHERE ",
        removedPlotSQL = "UPDATE tblboundaryplot SET status = 'I' WHERE ",
        i;
    
    if (removedPolygons.length > 0) {
        for (i = 0; i < removedPolygons.length; i += 1) {
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