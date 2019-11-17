/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var variable = require('../variable');
var dateTime = variable.dateTime;

// Create Bin Center
app.post('/addBinCenter', function (req, res) {
    'use strict';
    f.makeID("bincenter", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblbincenter (binCenterID, areaID, binCenterName, binCenterLocation, binCenterStatus, creationDateTime) VALUE ('" + ID + "', '" + req.body.area + "' , '" + req.body.name + "', '" + req.body.location + "', 'A', '" + req.body.creationDate + "')";
        
        f.sendForAuthorization(req.body.creationDate, req.body.iam, "add", "Create new bin center", ID, "tblbincenter", "\"" + sql + "\"");
        f.logTransaction(req.body.creationDate, req.body.iam, "add", "Request to create new bin center", ID, "tblbincenter");
        f.log(req.body.creationDate, "Request to create new bin center.", req.body.iam);
        res.json({"status": "success", "message": "Request pending.."});
        res.end();
    });
}); // Complete

// Update Bin Center
app.post('/editBinCenter', function (req, res) {
    'use strict';
    
    req.body.status = req.body.status === "ACTIVE" ? 'A' : 'I';
    var dt = dateTime.create().format('Y-m-d H:M:S'),
        sql = "UPDATE tblbincenter SET binCenterName = '" + req.body.name + "', binCenterLocation = '" + req.body.location + "', areaID = '" + req.body.area + "', binCenterStatus = '" + req.body.status + "' WHERE binCenterID = '" + req.body.id + "'";
    
    f.sendForAuthorization(dt, req.body.iam, "update", "Update bin center", req.body.id, "tblbincenter", "\"" + sql + "\"");
    f.logTransaction(dt, req.body.iam, "update", "Request to update bin center", req.body.id, "tblbincenter");
    f.log(dt, "Request to update bin center.", req.body.iam);
    res.json({"status": "success", "message": "Request pending.."});
    res.end();
}); // Complete

// Load all bin center in management
app.get('/getAllBinCenter', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblbincenter.binCenterID AS id, CONCAT(tblzone.zoneCode, tblarea.areaCode) AS areaCode, tblarea.areaID AS area, tblbincenter.binCenterName as name, tblbincenter.binCenterLocation AS location, (CASE WHEN tblbincenter.binCenterStatus = 'A' THEN 'ACTIVE' WHEN tblbincenter.binCenterStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblbincenter JOIN tblarea ON tblbincenter.areaID = tblarea.areaID JOIN tblzone ON tblzone.zoneID = tblarea.zoneID";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        res.end();
    });
}); // Complete

module.exports = app;