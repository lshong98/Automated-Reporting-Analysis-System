var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var database = require('./database-management');
var dateTime = require('node-datetime');
var f = require('./function-management');

app.post('/login', function (req, res) {
    'use strict';

    var sql = "SELECT tblstaff.staffID, tblstaff.password, tblposition.positionName FROM tblstaff JOIN tblposition ON tblposition.positionID = tblstaff.positionID WHERE tblstaff.username = '" + req.body.username + "' AND tblstaff.staffStatus = 'A'";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        if (result.length > 0) {
            if (bcrypt.compareSync(req.body.password, result[0].password)) {
                res.json({"status": "valid", details: {"staffPosition": result[0].positionName, "staffID": result[0].staffID}});
            } else {
                res.json({"status": "invalid"});
            }
        } else {
            res.json({"status": "invalid"});
        }
    });
}); // Complete

// Account Management
app.post('/addUser', function (req, res) {
    'use strict';

    f.checkAuthority("create account", req.body.owner).then(function (status) {
        if (status == 'A') {
            f.makeID("account", req.body.creationDate).then(function (ID) {
                var thePassword = bcrypt.hashSync(req.body.password, 10);
                var sql = "INSERT INTO tblstaff (staffID, username, password, staffName, positionID, creationDateTime, staffStatus) VALUE ('" + ID + "', '" + req.body.username + "', '" + thePassword + "', '" + req.body.name + "', '" + req.body.position.id + "', '" + req.body.creationDate + "', 'A')";
                database.query(sql, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    res.json({"status": "success", "message": "Account created successfully!", "details": {"staffID": ID}});
                    res.end();
                });
            });

            f.logTransaction(req.body.creationDate, req.body.owner, "add", "Created New Account", req.body.owner, 1, "tblstaff");
        } else {
            res.json({"status": "error", "message": "You have no permission to create account!"});
        }
    });
}); // Complete
app.get('/getAllUser', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name, tblstaff.username, (CASE WHEN tblstaff.staffStatus = 'A' THEN 'ACTIVE' WHEN tblstaff.staffStatus = 'I' THEN 'INACTIVE' END) AS status, tblposition.positionName AS position FROM tblstaff JOIN tblposition ON tblstaff.positionID = tblposition.positionID AND tblposition.positionName != 'ADMINISTRATOR'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
app.post('/updatePassword', function (req, res) {
    'use strict';

    var thePassword = bcrypt.hashSync(req.body.password, 10);

    var sql = "UPDATE tblstaff SET password = '" + thePassword + "' WHERE staffID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Update failed."});
            throw err;
        }
        res.json({"status": "success", "message": "Password updated."});
    });
}); // Complete
app.post('/loadSpecificAccount', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name, tblstaff.staffIC AS ic, (CASE WHEN tblstaff.staffGender = 'M' THEN 'Male' WHEN tblstaff.staffGender = 'F' THEN 'Female' END) AS gender, DATE_FORMAT(tblstaff.staffDOB, '%d %M %Y') AS dob, tblstaff.staffAddress AS address, (CASE WHEN tblstaff.staffStatus = 'A' THEN 'Active' WHEN tblstaff.staffStatus = 'I' THEN 'Inactive' END) AS status, tblstaff.handphone, tblstaff.phone, tblstaff.email, tblposition.positionName AS position, tblstaff.staffPic AS avatar FROM tblstaff JOIN tblposition ON tblstaff.positionID = tblposition.positionID WHERE tblstaff.staffID = '" + req.body.id + "' LIMIT 0, 1";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
app.get('/getStaffList', function (req, res) {
    'use strict';
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name FROM tblstaff JOIN tblposition ON tblstaff.positionID = tblposition.positionID WHERE tblstaff.staffStatus = 'A' AND tblposition.positionName = 'Reporting Officer'";
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
app.post('/updateProfile', function (req, res) {
    'use strict';
    
    var dt = dateTime.create(req.body.dob);

    req.body.status = req.body.status == "Active" ? 'A' : 'I';
    req.body.gender = req.body.gender == "Male" ? 'M' : 'F';
    req.body.dob = dt.format('Y-m-d');
    
    var sql = "SELECT positionID AS id FROM tblposition WHERE positionName = '" + req.body.position + "' LIMIT 0, 1";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        req.body.position = result[0].id;
        var sql = "UPDATE tblstaff SET staffName = '" + req.body.name + "', staffIC = '" + req.body.ic + "', staffGender = '" + req.body.gender + "', staffDOB = '" + req.body.dob + "', staffAddress = '" + req.body.address + "', handphone = '" + req.body.handphone + "', phone = '" + req.body.phone + "', email = '" + req.body.email + "', positionID = '" + req.body.position + "', staffStatus = '" + req.body.status + "', staffPic = '" + req.body.avatar + "' WHERE staffID = '" + req.body.id + "'";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "message": "Profile Updated!"});
        });
    });
}); // Complete

module.exports = app;