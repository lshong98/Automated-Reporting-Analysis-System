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
    
    var log = [],
        bin_center_area = req.body.area,
        bin_center_name = req.body.name,
        bin_center_location = req.body.location,
        created_on = req.body.creationDate,
        staff_id = req.body.iam;
    
    f.makeID("bincenter", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblbincenter (binCenterID, areaID, binCenterName, binCenterLocation, binCenterStatus, creationDateTime) VALUE ('" + ID + "', '" + bin_center_area + "' , '" + bin_center_name + "', '" + bin_center_location + "', 'A', '" + created_on + "')";
        
        f.sendForAuthorization(created_on, staff_id, "add", "Create new bin center", ID, "tblbincenter", "\"" + sql + "\"");
        //f.logTransaction(req.body.creationDate, req.body.iam, "add", "Request to create new bin center", ID, "tblbincenter");
        //f.log(req.body.creationDate, "Request to create new bin center.", req.body.iam);
        //res.json({"status": "success", "message": "Request pending.."});
        //res.end();
        
        f.waterfallQuery("SELECT s.staffName AS name, p.positionName AS positoin FROM tblstaff s JOIN tblposition p ON s.positionID = p.positionID WHERE s.staffID = '" + staff_id + "' LIMIT 0, 1").then(function (staff_info) {
            log.staff_name = staff_info.name;
            log.position_name = staff_info.position;
            
            var content = "";
            
            content = ""+log.staff_name+" would like to create a new truck. Truck details shown below:\n";
            content += 'Bin Center Name: ' + bin_center_name + '\n';
            content += 'Belonging to: ' + bin_center_area + '\n';
            content += 'Bin Center Location: ' + bin_center_location + '\n';
            
            f.log(created_on, "Request to create new bin center.", content, staff_id);

            res.json({"status": "success", "message": "Request pending.."});
            res.end();
        });
        
    });
}); // Complete

// Update Bin Center
app.post('/editBinCenter', function (req, res) {
    'use strict';
    
    var log = [],
        bin_center_id = req.body.id,
        bin_center_name = req.body.name,
        bin_center_location = req.body.location,
        bin_center_area = req.body.area,
        bin_center_status = req.body.status === "ACTIVE" ? 'A' : 'I',
        staff_id = req.body.iam,
        dt = dateTime.create().format('Y-m-d H:M:S'),
        sql = "UPDATE tblbincenter SET binCenterName = '" + bin_center_name + "', binCenterLocation = '" + bin_center_location + "', areaID = '" + bin_center_area + "', binCenterStatus = '" + bin_center_status + "' WHERE binCenterID = '" + bin_center_id + "'";
    
    f.sendForAuthorization(dt, staff_id, "update", "Update bin center", bin_center_id, "tblbincenter", "\"" + sql + "\"");
    //f.logTransaction(dt, req.body.iam, "update", "Request to update bin center", req.body.id, "tblbincenter");
    //f.log(dt, "Request to update bin center.", req.body.iam);
    //res.json({"status": "success", "message": "Request pending.."});
    //res.end();
    
    f.waterfallQuery("SELECT s.staffName AS name, p.positionName AS position FROM tblstaff s JOIN tblposition p ON s.positionID = p.positionID WHERE s.staffID = '" + staff_id + "' LIMIT 0, 1").then(function (staff_info) {
        log.staff_name = staff_info.name;
        log.position_name = staff_info.position;
        return f.waterfallQuery("SELECT * FROM tblbincenter WHERE binCenterID = '" + bin_center_id + "' LIMIT 0, 1");
    }).then(function (original_information) {
        log.original = original_information;

        var content = "";

        content = "" + log.staff_name + " would like to update bin center details. The changes shown below:\n";
        content += 'Bin Center Name: <s>' + log.original.binCenterName + '</s> to ' + bin_center_name + '\n';
        content += 'Belonging to: <s>' + log.original.areaID + '</s> to ' + bin_center_area + '\n';
        content += 'Bin Center Location: <s>' + log.original.binCenterLocation + '</s> to ' + bin_center_location + '\n';
        content += 'Bin Center Status: <s>' + log.original.binCenterStatus + '</s> to ' + bin_center_status + '\n';

        f.log(dt, "Request to update bin center details.", content, staff_id);
        res.json({"status": "success", "message": "Request pending.."});
        res.end();
    });
}); // Complete

// Load all bin center in management
app.get('/getAllBinCenter', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblbincenter.binCenterID AS id, CONCAT(tblzone.zoneCode, tblarea.areaCode) AS areaCode, tblarea.areaID AS area, tblbincenter.binCenterName as name, tblbincenter.binCenterLocation AS location, (CASE WHEN tblbincenter.binCenterStatus = 'A' THEN 'ACTIVE' WHEN tblbincenter.binCenterStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblbincenter JOIN tblarea ON tblbincenter.areaID = tblarea.areaID JOIN tblzone ON tblzone.zoneID = tblarea.zoneID ORDER BY binCenterID DESC";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        res.end();
    });
}); // Complete

module.exports = app;