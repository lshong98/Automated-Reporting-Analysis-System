/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// Create Bin Center
app.post('/addBinCenter', function (req, res) {
    'use strict';
    f.makeID("bincenter", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblbincenter (binCenterID, areaID, binCenterName, binCenterLocation, binCenterStatus, creationDateTime) VALUE ('" + ID + "', '" + req.body.area + "' , '" + req.body.name + "', '" + req.body.location + "', 'A', '" + req.body.creationDate + "')";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "message": "Bin Center added successfully!", "details": {"binID": ID}});
            res.end();
        });
    });
}); // Complete

// Update Bin Center
app.post('/editBinCenter', function (req, res) {
    'use strict';
    
    req.body.status = req.body.status === "ACTIVE" ? 'A' : 'I';
    
    var sql = "UPDATE tblbincenter SET binCenterName = '" + req.body.name + "', binCenterLocation = '" + req.body.location + "', areaID = '" + req.body.area + "', binCenterStatus = '" + req.body.status + "' WHERE binCenterID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Successfully updated!"});
    });
}); // Complete

// Load all bin center in management
app.post('/getAllBinCenter', function (req, res) {
    'use strict';
    
    var sql = "SELECT binCenterID AS id, areaID AS area, binCenterName as name, binCenterLocation AS location, (CASE WHEN binCenterStatus = 'A' THEN 'ACTIVE' WHEN binCenterStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblbincenter";
    
    if(req.body.status){
        sql += " WHERE binCenterStatus = 'A'";
    }else{
        sql += " WHERE binCenterStatus = 'I'";
    }
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        res.end();
    });
}); // Complete

module.exports = app;