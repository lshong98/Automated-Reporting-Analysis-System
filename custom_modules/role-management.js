var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// Role Management
app.post('/addRole', function (req, res) {
    'use strict';
    
    f.makeID("role", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblposition (positionID, positionName, creationDateTime, positionStatus) VALUE ('" + ID + "', '" + req.body.name + "', '" + req.body.creationDate + "', 'A')";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "message": "Role created successfully!", "details": {"roleID": ID}});
        });
    });
}); // Complete
app.get('/getAllRole', function (req, res) {
    'use strict';
    
    var sql = "SELECT positionID AS id, positionName AS name, (CASE WHEN positionStatus = 'A' THEN 'ACTIVE' WHEN positionStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblposition WHERE positionName != 'ADMINISTRATOR'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
app.post('/setAuth', function (req, res) {
    'use strict';
    
    var sql = "SELECT positionID AS id FROM tblposition WHERE positionName = '" + req.body.name + "' LIMIT 0, 1";
    database.query(sql, function (err, result){
        if (err) {
            throw err;
        }
        var staffID = result[0].id;
        var sql = "SELECT mgmtID AS id FROM tblmanagement WHERE mgmtName = '" + req.body.management + "' LIMIT 0, 1";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            var managementID = result[0].id;
            var sql = "DELETE FROM tblaccess WHERE positionID = '" + staffID + "' AND mgmtID = '" + managementID + "'";
            database.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                var sql = "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + staffID + "', '" + managementID + "', '" + req.body.access + "')";
                console.log(sql);
                database.query(sql, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    var message = req.body.access == 'A' ? "Permission given." : "Permission removed.";
                    res.json({"status": "success", "message": message});
                });
            });
        });
    });
}); // Complete
app.get('/getPositionList', function(req, res) {
    'use strict';
    
    var sql = "SELECT positionID AS id, positionName AS name FROM tblposition WHERE positionStatus = 'A' AND positionName != 'ADMINISTRATOR'";
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
    
}); // Complete
app.post('/getAllAuth', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblmanagement.mgmtName AS name, tblaccess.status FROM tblaccess JOIN tblposition ON tblaccess.positionID = tblposition.positionID JOIN tblmanagement ON tblmanagement.mgmtID = tblaccess.mgmtID WHERE tblposition.positionName = '" + req.body.name + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

module.exports = app;