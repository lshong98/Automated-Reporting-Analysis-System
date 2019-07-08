/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// Create Zone
app.post('/addZone', function (req, res) {
    'use strict';
    f.makeID("zone", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblzone (zoneID, zoneName, creationDateTime, zoneStatus) VALUE ('" + ID + "', '" + req.body.name + "', '" + req.body.creationDate + "', 'A')";
        database.query(sql, function (err, result) {
            if (err) {
                res.end();
                throw err;
            } else {
                res.json({"status": "success", "message": "Zone added successfully!", "details": {"zoneID": ID}});
                res.end();
            }
        });
    });
}); // Complete

// Used in comboBox - Zone
app.get('/getZoneList', function (req, res) {
    'use strict';
    var sql = "SELECT zoneID AS id, zoneName AS name FROM tblzone WHERE zoneStatus = 'A'";
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

// Load all zone in management
app.get('/getAllZone', function (req, res) {
    'use strict';
    var sql = "SELECT zoneID AS id, zoneName AS name, (CASE WHEN zoneStatus = 'A' THEN 'ACTIVE' WHEN zoneStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblzone";
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

// Update zone
app.post('/editZone', function (req, res) {
    'use strict';
    var sql = "UPDATE tblzone SET zoneName = '" + req.body.name + "', zoneStatus = '" + req.body.status + "' WHERE zoneID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Update failed."});
            res.end();
            throw err;
        } else {
            res.json({"status": "success", "message": "Zone Information Updated."});
            res.end();
        }
    });
}); // Complete

module.exports = app;