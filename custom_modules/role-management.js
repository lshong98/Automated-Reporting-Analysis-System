/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// Create Role
app.post('/addRole', function (req, res) {
    'use strict';
    
    f.makeID("role", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblposition (positionID, positionName, creationDateTime, positionStatus) VALUE ('" + ID + "', '" + req.body.name + "', '" + req.body.creationDate + "', 'A')",
            i = 0;

        console.log(sql);
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            } else {
                f.waterfallQuery("SELECT COUNT(*) AS 'countmgmt' FROM tblmanagement").then(function (countmgmt) {
                    for (i = 1; i <= countmgmt.countmgmt; i += 1) {
                        var insertsql = "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + ID + "', '" + i + "', 'I' )";

                        database.query(insertsql, function (err, result) {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                });
            }
            res.json({"status": "success", "message": "Role created successfully!", "details": {"roleID": ID}});
        });
    });
}); // Complete

// Load all role in management
app.get('/getAllRole', function (req, res) {
    'use strict';
    
    var sql = "SELECT positionID AS id, positionName AS name, (CASE WHEN positionStatus = 'A' THEN 'ACTIVE' WHEN positionStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblposition WHERE positionName != 'DEVELOPER'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

// Give/Remove authority from an user
app.post('/setAuth', function (req, res) {
    'use strict';
    
    var information = {};
    
    f.waterfallQuery("SELECT positionID AS id FROM tblposition WHERE positionName = '" + req.body.name + "' LIMIT 0, 1").then(function (positionID) {
        information.positionID = positionID.id;
        return f.waterfallQuery("SELECT mgmtID AS id FROM tblmanagement WHERE mgmtName = '" + req.body.management + "' LIMIT 0, 1");
    }).then(function (managementID) {
        information.managementID = managementID.id;
        return f.waterfallQuery("DELETE FROM tblaccess WHERE positionID = '" + information.positionID + "' AND mgmtID = '" + information.managementID + "'");
    }).then(function () {
        database.query("INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + information.positionID + "', '" + information.managementID + "', '" + req.body.access + "')", function (err, result) {
            if (err) {
                throw err;
            } else {
                var message = req.body.access === 'A' ? "Permission given." : "Permission removed.";
                res.json({"status": "success", "message": message});
                res.end();
            }
        });
    });
}); // Complete

app.post('/setAllAuth', function (req, res) {
    'use strict';
    
    var sqlgetposid = "SELECT positionID AS id FROM tblposition WHERE positionName = '" + req.body.name + "' LIMIT 0, 1";
    database.query(sqlgetposid, function (err, result) {
        if (err) {
            throw err;
        } else {
            if (req.body.value == true) {
                var sqlupdtacs = "UPDATE tblaccess SET status = 'A' WHERE positionID = '" + result[0].id + "' AND mgmtID != 4";

                database.query(sqlupdtacs, function (err2, result2) {
                    if (err2) {
                        throw err2;
                    } else {
                        res.json({"status": "success"});
                    }
                });
            } else if (req.body.value == false) {
                var sqlupdtacs = "UPDATE tblaccess SET status = 'I' WHERE positionID = '" + result[0].id + "'";

                database.query(sqlupdtacs, function (err2, result2) {
                    if (err2) {
                        throw err2;
                    } else {
                        res.json({"status": "success"});
                    }
                });
            }
        }
    });
});

// Used in comboBox - Role
app.get('/getPositionList', function (req, res) {
    'use strict';
    
    var sql = "SELECT positionID AS id, positionName AS name FROM tblposition WHERE positionStatus = 'A' AND positionName != 'DEVELOPER'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        } else {
            res.json(result);
            res.end();
        }
    });
    
}); // Complete

// Load specific role details - Accessibility
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

app.post('/updateRoleName', function (req, res) {
    'use strict';
    var sql = "UPDATE tblposition SET positionName = '" + req.body.name + "' WHERE positionName = '" + req.body.oriname + "'";
    database.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Role Name Updated Failed..."});
            throw err;
        } else {
            res.json({"status": "success", "message": "Role Name Updated Successfully!"});
        }
    });
});

module.exports = app;