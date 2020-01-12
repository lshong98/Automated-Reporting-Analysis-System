/*jslint node:true*/
var variable = require('../variable');
var express = variable.express;
var bcrypt = variable.bcrypt;
var dateTime = variable.dateTime;
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// Login
app.post('/login', function (req, res) {
    'use strict';

    var sql = "SELECT tblstaff.staffID AS id, tblstaff.password AS password, tblposition.positionName AS position FROM tblstaff JOIN tblposition ON tblposition.positionID = tblstaff.positionID WHERE tblstaff.username = '" + req.body.username + "' AND tblstaff.staffStatus = 'A'";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        if (result.length > 0) {
            if (bcrypt.compareSync(req.body.password, result[0].password)) {
                res.json({"status": "success", "message": "Login successfully!", details: {"position": result[0].position, "id": result[0].id}});
            } else {
                res.json({"status": "error", "message": "Invalid account!"});
            }
        } else {
            res.json({"status": "error", "message": "Invalid account!"});
        }
    });
}); // Complete

// Create User
app.post('/addUser', function (req, res) {
    'use strict';

    f.checkAuthority("create account", req.body.owner).then(function (status) {
        if (status === 'A') {
            f.makeID("account", req.body.creationDate).then(function (ID) {
                var thePassword = bcrypt.hashSync(req.body.password, 10),
                    sql = "INSERT INTO tblstaff (staffID, username, password, staffName, positionID, creationDateTime, staffStatus) VALUE ('" + ID + "', '" + req.body.username + "', '" + thePassword + "', '" + req.body.name + "', '" + req.body.position.id + "', '" + req.body.creationDate + "', 'A')";
                
                // Authorize
                f.sendForAuthorization(req.body.creationDate, req.body.owner, "add", "Created New Account", ID, "tblstaff", "\"" + sql + "\"");
                //f.logTransaction(req.body.creationDate, req.body.owner, "add", "Request to Create New Account", ID, "tblstaff");
                f.log(req.body.creationDate, "Request to create new account.", req.body.owner);
                res.json({"status": "success", "message": "Request pending.."});
                res.end();
            });
        } else {
            res.json({"status": "error", "message": "You have no permission to create account!"});
        }
    });
}); // Complete

/********************************Update******************************************/
// Update user password
app.post('/updatePassword', function (req, res) {
    'use strict';
    
    var dt = dateTime.create().format('Y-m-d H:M:S'),
        thePassword,
        sql;
    
    if (req.body.password === req.body.again) {
        thePassword = bcrypt.hashSync(req.body.password, 10);
        sql = "UPDATE tblstaff SET password = '" + thePassword + "' WHERE staffID = '" + req.body.id + "'";
        
        f.sendForAuthorization(dt, req.body.iam, "update", "Update Account Password", req.body.id, "tblstaff", "\"" + sql + "\"");
        //f.logTransaction(dt, req.body.iam, "update", "Request to Update Account Password - " + req.body.id + " ", req.body.id, "tblstaff");
        f.log(dt, "Request to update password.", req.body.iam);
        res.json({"status": "success", "message": "Request pending.."});
        res.end();
        
//        database.query(sql, function (err, result) {
//            if (err) { 
//                res.json({"status": "error", "message": "Update failed."});
//                res.end();
//                throw err;
//            } else {
//                f.logTransaction(dt, req.body.iam, "update", "Update Account Password - " + req.body.id + "", 'NULL', req.body.id, "tblstaff");
//                f.sendForAuthorization(date, staffId, action, description, authorizedBy, rowID, tblName, query);
//                res.json({"status": "success", "message": "Password updated."});
//                res.end();
//            }
//        });
    } else {
        res.json({"status": "error", "message": "Password not matched!"});
        res.end();
    }
}); // Complete

// Update Account Information
app.post('/updateProfile', function (req, res) {
    'use strict';
    
    var dt = dateTime.create(req.body.dob),
        sql = "SELECT positionID AS id FROM tblposition WHERE positionName = '" + req.body.position + "' LIMIT 0, 1",
        cdt = dateTime.create().format('Y-m-d H:M:S');
    req.body.status = req.body.status === "Active" ? 'A' : 'I';
    req.body.gender = req.body.gender === "Male" ? 'M' : 'F';
    req.body.dob = dt.format('Y-m-d');
    
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        req.body.position = result[0].id;
        var sql = "UPDATE tblstaff SET staffName = '" + req.body.name + "', staffIC = '" + req.body.ic + "', staffGender = '" + req.body.gender + "', staffDOB = '" + req.body.dob + "', staffAddress = '" + req.body.address + "', handphone = '" + req.body.handphone + "', phone = '" + req.body.phone + "', email = '" + req.body.email + "', positionID = '" + req.body.position + "', staffStatus = '" + req.body.status + "', staffPic = '" + req.body.avatar + "' WHERE staffID = '" + req.body.id + "'";
        
        f.sendForAuthorization(cdt, req.body.iam, "update", "Update Account Details", req.body.id, "tblstaff", "\"" + sql + "\"");
        //f.logTransaction(cdt, req.body.iam, "update", "Request Update Account - " + req.body.id + " ", req.body.id, "tblstaff");
        f.log(cdt, "Request to update account details.", req.body.iam);
        res.json({"status": "success", "message": "Request pending.."});
        res.end();
//        database.query(sql, function (err, result) {
//            if (err) {
//                res.end();
//                throw err;
//            } else {
//                f.logTransaction(cdt, req.body.iam, "update", "Request Update Account - " + req.body.id + "", 'NULL', req.body.id, "tblstaff");
//                res.json({"status": "success", "message": "Profile Updated!"});
//                res.end();
//            }
//        });
    });
}); // Complete
/********************************************************************************/

/********************************Load********************************************/
// Load all user in management
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

// Load specific account
app.post('/loadSpecificAccount', function (req, res) {
    'use strict';
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name, tblstaff.staffIC AS ic, (CASE WHEN tblstaff.staffGender = 'M' THEN 'Male' WHEN tblstaff.staffGender = 'F' THEN 'Female' END) AS gender, DATE_FORMAT(tblstaff.staffDOB, '%d %M %Y') AS dob, tblstaff.staffAddress AS address, (CASE WHEN tblstaff.staffStatus = 'A' THEN 'Active' WHEN tblstaff.staffStatus = 'I' THEN 'Inactive' END) AS status, tblstaff.handphone, tblstaff.phone, tblstaff.email, tblposition.positionName AS position, tblstaff.staffPic AS avatar FROM tblstaff JOIN tblposition ON tblstaff.positionID = tblposition.positionID WHERE tblstaff.staffID = '" + req.body.id + "' LIMIT 0, 1";
    
    database.query(sql, function (err, result) {
        if (err) {
            res.end();
            throw err;
        } else {
            //f.logTransaction(dt, req.body.iam, "view", "View Account - " + req.body.id + " ", 'NULL', req.body.id, "tblstaff");
            res.json(result);
            res.end();
        } 
    });
}); // Complete

// Used in comboBox - Reporting Officer
app.get('/getStaffList', function (req, res) {
    'use strict';
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name FROM tblstaff JOIN tblposition ON tblstaff.positionID = tblposition.positionID WHERE tblstaff.staffStatus = 'A' AND tblposition.positionName = 'Reporting Officer'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

// Used in comboBox - Driver
app.get('/getDriverList', function (req, res) {
    'use strict';
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name FROM tblposition JOIN tblstaff ON tblstaff.positionID = tblposition.positionID WHERE tblposition.positionName = 'Driver' AND tblstaff.staffStatus = 'A'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
/********************************************************************************/

module.exports = app;