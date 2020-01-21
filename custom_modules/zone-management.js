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
    
    var log = [],
        staff_id = req.body.iam,
        zone_code = req.body.code,
        zone_name = req.body.name,
        created_on = req.body.creationDate;
    
    f.makeID("zone", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblzone (zoneID, zoneCode, zoneName, creationDateTime, zoneStatus) VALUE ('" + ID + "', '" + zone_code + "', '" + zone_name + "', '" + created_on + "', 'A')";
        
        f.sendForAuthorization(created_on, staff_id, "add", "Create new zone", ID, "tblzone", "\"" + sql + "\"");
        
        f.waterfallQuery("SELECT s.staffName AS name, p.positionName AS positoin FROM tblstaff s JOIN tblposition p ON s.positionID = p.positionID WHERE s.staffID = '" + staff_id + "' LIMIT 0, 1").then(function (staff_info) {
            log.staff_name = staff_info.name;
            log.position_name = staff_info.position;
            
            var content = "";
            
            content = ""+log.staff_name+" would like to create a new zone. Zone details shown below:\n";
            content += 'Zone Code: ' + zone_code + '\n';
            content += 'Zone Name: ' + zone_name + '\n';
            
            f.log(created_on, "Request to create new zone.", content, staff_id);

            res.json({"status": "success", "message": "Request pending.."});
            res.end();
        });
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
    var sql = "SELECT zoneID AS id, zoneCode AS code, zoneName AS name, (CASE WHEN zoneStatus = 'A' THEN 'ACTIVE' WHEN zoneStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblzone ORDER BY zoneID DESC";
    
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
    
    var dt = dateTime.create().format('Y-m-d H:M:S'),
        sql = "",
        zone_id = req.body.id,
        zone_code = req.body.code,
        zone_name = req.body.name,
        zone_status = req.body.status === 'ACTIVE' ? 'A' : 'I',
        staff_id = req.body.iam,
        log = [];
    
    sql = "UPDATE tblzone SET zoneCode = '" + zone_code + "', zoneName = '" + zone_name + "', zoneStatus = '" + zone_status + "' WHERE zoneID = '" + zone_id + "'";
    
    f.sendForAuthorization(dt, staff_id, "update", "Update zone", zone_id, "tblzone", "\"" + sql + "\"");

    f.waterfallQuery("SELECT s.staffName AS name, p.positionName AS positoin FROM tblstaff s JOIN tblposition p ON s.positionID = p.positionID WHERE s.staffID = '" + staff_id + "' LIMIT 0, 1").then(function (staff_info) {
        log.staff_name = staff_info.name;
        log.position_name = staff_info.position;
        
        return f.waterfallQuery("SELECT * FROM tblzone WHERE zoneID = '" + zone_id + "' LIMIT 0, 1");
    }).then(function (original_information) {
        log.original = original_information;
        
        var content = "";

        content = ""+log.staff_name+" would like to update zone details. The changes shown below:\n";
        content += 'Zone Code: <s>' + log.original.zoneCode + '</s> to ' + zone_code + '\n';
        content += 'Zone Name: <s>' + log.original.zoneName + '</s> to ' + zone_name + '\n';
        content += 'Zone Status: <s>' + log.original.zoneStatus + '</s> to ' + zone_status + '\n';

        f.log(dt, "Request to update zone details.", content, staff_id);
        res.json({"status": "success", "message": "Request pending.."});
        res.end();
    });
}); // Complete

module.exports = app;