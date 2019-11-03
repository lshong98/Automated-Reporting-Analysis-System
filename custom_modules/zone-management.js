/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var variable = require('../variable');
var dateTime = variable.dateTime;

// Create Zone
app.post('/addZone', function (req, res) {
    'use strict';
    f.makeID("zone", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblzone (zoneID, zoneCode, zoneName, creationDateTime, zoneStatus) VALUE ('" + ID + "', '" + req.body.code + "', '" + req.body.name + "', '" + req.body.creationDate + "', 'A')";
        
        f.sendForAuthorization(req.body.creationDate, req.body.iam, "add", "Create new zone", ID, "tblzone", "\"" + sql + "\"");
        f.logTransaction(req.body.creationDate, req.body.iam, "add", "Request to create new zone", ID, "tblzone");
        f.log(req.body.creationDate, "Request to create new zone.", req.body.iam);
        res.json({"status": "success", "message": "Request pending.."});
        res.end();
         
//        database.query(sql, function (err, result) {
//            if (err) {
//                res.end();
//                throw err;
//            } else {
//                f.logTransaction(req.body.creationDate, req.body.iam, "add", "Create New Zone", '', ID, "tblzone");
//                res.json({"status": "success", "message": "Zone added successfully!", "details": {"zoneID": ID}});
//                res.end();
//            }
//        });
    });
}); // Complete

// Used in comboBox - Zone
app.get('/getZoneList', function (req, res) {
    'use strict';
    var sql = "SELECT zoneID AS id, zoneCode AS code, zoneName AS name FROM tblzone WHERE zoneStatus = 'A'";
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
    var sql = "SELECT zoneID AS id, zoneCode AS code, zoneName AS name, (CASE WHEN zoneStatus = 'A' THEN 'ACTIVE' WHEN zoneStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblzone";
    
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
    
    var dt = dateTime.create().format('Y-m-d H:M:S');
    req.body.status = req.body.status === 'ACTIVE' ? 'A' : 'I';
    var sql = "UPDATE tblzone SET zoneCode = '" + req.body.code + "', zoneName = '" + req.body.name + "', zoneStatus = '" + req.body.status + "' WHERE zoneID = '" + req.body.id + "'";
    
    f.sendForAuthorization(dt, req.body.iam, "update", "Update zone", req.body.id, "tblzone", "\"" + sql + "\"");
    f.logTransaction(dt, req.body.iam, "update", "Request to update zone", req.body.id, "tblzone");
    f.log(dt, "Request to update zone.", req.body.iam);
    res.json({"status": "success", "message": "Request pending.."});
    res.end();
    
//    database.query(sql, function (err, result) {
//        if (err) {
//            res.json({"status": "error", "message": "Update failed."});
//            res.end();
//            throw err;
//        } else {
//            f.logTransaction(dt, req.body.iam, "update", "Update Zone - " + req.body.id + "", '', req.body.id, "tblzone");
//            res.json({"status": "success", "message": "Zone Information Updated."});
//            res.end();
//        }
//    });
}); // Complete

module.exports = app;