/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var variable = require('../variable');
var dateTime = variable.dateTime;

// Create Truck
app.post('/addTruck', function (req, res) {
    'use strict';
    
    var log = [];
    
    f.makeID("truck", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tbltruck (truckID, transporter, truckTon, truckNum, truckExpiryStatus, creationDateTime, truckStatus) VALUE ('" + ID + "', '" + req.body.transporter + "', '" + req.body.ton + "', '" + req.body.no + "', '" + req.body.roadtax + "', '" + req.body.creationDate + "', 'A')";
        
        f.sendForAuthorization(req.body.creationDate, req.body.iam, "add", "Create new truck", ID, "tbltruck", "\"" + sql + "\"");
        f.logTransaction(req.body.creationDate, req.body.iam, "add", "Request to Create New truck", ID, "tbltruck");
        
        f.waterfallQuery("SELECT s.staffName AS name, p.positionName AS positoin FROM tblstaff s JOIN tblposition p ON s.positionID = p.positionID WHERE s.staffID = '" + req.body.iam + "' LIMIT 0, 1").then(function (staff_info) {
            log.staff_name = staff_info.name;
            log.position_name = staff_info.position;
            
            var content = "";
            
            content = ""+log.staff_name+" would like to create a new truck. Truck details shown below:\n";
            content += 'Truck Number: ' + req.body.no + '\n';
            content += 'Truck Volume: ' + req.body.ton + '\n';
            content += 'Transporter: ' + req.body.transporter + '\n';
            content += 'Road Tax Expiry Date: ' + req.body.roadtax + '\n';
            
            f.log(req.body.creationDate, "Request to create new truck.", content, req.body.iam);

            res.json({"status": "success", "message": "Request pending.."});
            res.end();
        });
    });
}); // Complete

// Update Truck
app.post('/editTruck', function (req, res) {
    'use strict';
    
    var dt = dateTime.create().format('Y-m-d H:M:S'),
        sql = "";
    
    var truck_id = req.body.id,
        transporter = req.body.transporter,
        ton = req.body.ton,
        truck_number = req.body.no,
        road_tax = req.body.roadtax,
        truck_status = req.body.status === "ACTIVE" ? 'A' : 'I',
        staff_id = req.body.iam,
        log = [];
    
    sql = "UPDATE tbltruck SET transporter = '" + transporter + "', truckTon = '" + ton + "', truckNum = '" + truck_number + "', truckExpiryStatus = '" + road_tax + "', truckStatus = '" + truck_status + "' WHERE truckID = '" + truck_id + "'";
    
    f.sendForAuthorization(dt, staff_id, "update", "Update truck", truck_id, "tbltruck", "\"" + sql + "\"");
    
    f.waterfallQuery("SELECT s.staffName AS name, p.positionName AS position FROM tblstaff s JOIN tblposition p ON s.positionID = p.positionID WHERE s.staffID = '" + staff_id + "' LIMIT 0, 1").then(function (staff_info) {
        log.staff_name = staff_info.name;
        log.position_name = staff_info.position;
        return f.waterfallQuery("SELECT * FROM tbltruck WHERE truckID = '" + truck_id + "' LIMIT 0, 1");
    }).then(function (original_information) {
        log.original = original_information;

        var content = "";

        content = "" + log.staff_name + " would like to update truck details. The changes shown below:\n";
        content += 'Truck Number: <s>' + log.original.truckNum + '</s> to ' + truck_number + '\n';
        content += 'Transporter: <s>' + log.original.transporter + '</s> to ' + transporter + '\n';
        content += 'Truck Volume: <s>' + log.original.truckTon + '</s> to ' + ton + '\n';
        content += 'Road Tax Expiry Date: <s>' + log.original.truckExpiryStatus + '</s> to ' + road_tax + '\n';
        content += 'Truck Status: <s>' + log.original.truckStatus + '</s> to ' + truck_status + '\n';

        f.log(dt, "Request to update truck details.", content, staff_id);
        res.json({"status": "success", "message": "Request pending.."});
        res.end();
    });
}); // Complete

// Used in comboBox - Truck
app.get('/getTruckList', function (req, res) {
    'use strict';
    var sql = "SELECT truckID AS id, truckNum AS no FROM tbltruck WHERE truckStatus = 'A'";
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

// Load all truck in management
app.get('/getAllTruck', function (req, res) {
    'use strict';
    
    var sql = "SELECT truckID AS id, transporter, truckTon AS ton, truckNum AS no, truckExpiryStatus AS roadtax, (CASE WHEN truckStatus = 'A' THEN 'ACTIVE' WHEN truckStatus = 'I' THEN 'INACTIVE' END) AS status FROM tbltruck ORDER BY truckID DESC";
    
    database.query(sql, function (err, result) {
        if (err) {
            res.end();
            throw err;
        } else {
            res.json(result);
            res.end();
        }
    });
}); // Complete

module.exports = app;