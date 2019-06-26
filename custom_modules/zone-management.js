var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// Zone Management
app.post('/addZone', function (req, res) {
    'use strict';
    f.makeID("zone", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblzone (zoneID, zoneName, creationDateTime, zoneStatus) VALUE ('" + ID + "', '" + req.body.name + "', '" + req.body.creationDate + "', 'A')";
        database.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "details": {"zoneID": ID}});
        });
    });
}); // Complete
app.get('/getZoneList', function (req, res) {
    'use strict';
    var sql = "SELECT zoneID AS id, zoneName AS name FROM tblzone WHERE zoneStatus = 'A'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.get('/getAllZone', function (req, res) {
    'use strict';
    var sql = "SELECT zoneID AS id, zoneName AS name, (CASE WHEN zoneStatus = 'A' THEN 'ACTIVE' WHEN zoneStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblzone";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/editZone',function(req, res){
    'use strict';
    var sql = "UPDATE tblzone SET zoneName = '" + req.body.name+ "', zoneStatus = '" + req.body.status + "' WHERE zoneID = '"+ req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Update failed."});
            throw err;
        }
        res.json({"status": "success", "message": "Zone Information Updated."});
    });
}); // Complete

module.exports = app;