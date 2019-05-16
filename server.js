/*jslint node:true*/
var express = require('express');
var sanitizer = require('sanitizer');
var bcrypt = require('bcrypt');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
var mysql = require('mysql');
var EventEmitter = require('events');
var dateTime = require('node-datetime');
var emitter = new EventEmitter();

var DB_HOST = '';
var DB_USER = '';
var DB_PASS = '';
var DB_NAME = 'trienekens';

var SVR_PORT = 3000;
var obj = {
    "ID": '',
    "authStatus": ''
};

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
// Parse URL-encoded bodies (as sent by HTML forms)
//app.use(express.urlencoded());

// Set static path
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'pages')));
app.use(express.static(path.join(__dirname, 'fonts')));
app.use(express.static(path.join(__dirname, 'images')));

app.get('/', function (req, res) {
    'use strict';
    res.sendFile('index.html', {root: __dirname});
});
app.get('/pages', function (req, res) {
    'use strict';
    res.sendFile('pages/index.html', {root: __dirname});
});
app.get('/dashboard-manager', function (req, res) {
    'use strict';
    res.sendFile('pages/dashboard-manager.html', {root: __dirname});
});
app.get('/dashboard-officer', function (req, res) {
    'use strict';
    res.sendFile('pages/dashboard-officer.html', {root: __dirname});
});
app.get('/account-management', function (req, res) {
    'use strict';
    res.sendFile('pages/account-management.html', {root: __dirname});
});
app.get('/account/:account', function (req, res) {
    'use strict';
    res.sendFile('pages/account.html', {root: __dirname});
});
app.get('/truck-management', function (req, res) {
    'use strict';
    res.sendFile('pages/truck-management.html', {root: __dirname});
});
app.get('/area-management', function (req, res) {
    'use strict';
    res.sendFile('pages/area-management.html', {root: __dirname});
});
app.get('/dashboard-officer', function (req, res) {
    'use strict';
    res.sendFile('pages/dashboard-officer.html', {root: __dirname});
});
app.get('/acr-management', function (req, res) {
    'use strict';
    res.sendFile('pages/acr-management.html', {root: __dirname});
});
app.get('/notification', function (req, res) {
    'use strict';
    res.sendFile('pages/notification.html', {root: __dirname});
});
app.get('/error', function (req, res) {
    'use strict';
    res.sendFile('pages/error-404.html', {root: __dirname});
});
app.get('/daily-report', function(req, res) {
    'use strict';
    res.sendFile('pages/daily-report.html', {root: __dirname});
});
app.get('/driver-management', function(req, res) {
    'use strict';
    res.sendFile('pages/driver-management.html', {root: __dirname});
});
app.get('/zone-management', function(req, res) {
    'use strict';
    res.sendFile('pages/zone-management.html', {root: __dirname});
});
app.get('/role-management', function(req, res) {
    'use strict';
    res.sendFile('pages/role-management.html', {root: __dirname});
});
app.get('/auth/:auth', function(req, res) {
    'use strict';
    res.sendFile('pages/auth.html', {root: __dirname});
});
app.get('/area-management-edit', function(req, res) {
    'use strict';
    res.sendFile('pages/area-management-edit.html', {root: __dirname});
});
app.get('/bin-management', function(req, res) {
    'use strict';
    res.sendFile('pages/bin-management.html', {root: __dirname});
});
var makeID = function(keyword, creationDate) {
    var table, property, header, ID;
    var getDateArr, row, stringRow, prefix, i;
    var getDate = creationDate.split(' ');
    
    switch (keyword) {
        case "account":
            table = "tblstaff";
            property = "staffID";
            header = "ACC";
            break;
        case "truck":
            table = "tbltruck";
            property = "truckID";
            header = "TRK";
            break;
        case "driver":
            table = "tbldriver";
            property = "driverID";
            header = "DRV";
            break;
        case "zone":
            table = "tblzone";
            property = "zoneID";
            header = "ZON";
            break;
        case "area":
            table = "tblarea";
            property = "areaID";
            header = "ARE";
            break;
        case "bin":
            table = "tblbin";
            property = "binID";
            header = "BIN";
            break;
        case "role":
            table = "tblstaffposition";
            property = "staffPosID";
            header = "ATH";
            break;
        default: break;
    }
    
    var sql = "SELECT " + property + " FROM " + table + " WHERE creationDateTime LIKE '%" + getDate[0] + "%'";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        
        getDateArr = getDate[0].split('-');
        
        row = result.length;
        row += 1;
        stringRow = row.toString();
        prefix = '';
        for (i = stringRow.length; i < 4; i += 1) {
            prefix += '0';
        }
        ID = header + getDateArr[0] + getDateArr[1] + getDateArr[2] + prefix + row;
    });
    
    setTimeout(function() {
        obj.ID = ID;
    }, 100);
};

var checkAuthority = function (keyword, whoIs) {
    'use strict';
    
    var sql;
    
    switch (keyword) {
        case "create account":
            sql = "SELECT tblstaffposaccess.status FROM tblstaff JOIN tblstaffposition ON tblstaff.staffPosID = tblstaffposition.staffPosID JOIN tblstaffposaccess ON tblstaffposition.staffPosID = tblstaffposaccess.staffPosID JOIN tblmgmtaccess ON tblmgmtaccess.mgmtAccessID = tblstaffposaccess.mgmtAccessID WHERE tblmgmtaccess.mgmtAccessName = 'create account' AND tblstaff.staffID = '" + whoIs + "'";
            break;
    }
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        obj.authStatus = result[0].status;
    });
    
};

app.post('/login', function (req, res) {
    'use strict';

    var sql = "SELECT tblstaff.staffID, tblstaff.password, tblstaffposition.staffPositionName FROM tblstaff JOIN tblstaffposition ON tblstaffposition.staffPosID = tblstaff.staffPosID WHERE tblstaff.username = '" + req.body.username + "' AND tblstaff.staffStatus = 'A'";

    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        if (result.length > 0) {
            if (bcrypt.compareSync(req.body.password, result[0].password)) {
                res.json({"status": "valid", details: {"staffPosition": result[0].staffPositionName, "staffID": result[0].staffID}});
            } else {
                res.json({"status": "invalid"});
            }
        } else {
            res.json({"status": "invalid"});
        }
    });
});

// Access the parse results as request.body
app.post('/addUser', function (req, res) {
    'use strict';

    checkAuthority("create account", req.body.owner);
    setTimeout(function () {
        if (obj.authStatus == 'A') {
            makeID("account", req.body.creationDate);
            setTimeout(function() {
                var thePassword = bcrypt.hashSync(req.body.password, 10);
                var sql = "INSERT INTO tblstaff (staffID, username, password, staffName, staffPosID, creationDateTime, staffStatus) VALUE ('" + obj.ID + "', '" + req.body.username + "', '" + thePassword + "', '" + req.body.name + "', '" + req.body.position.id + "', '" + req.body.creationDate + "', 'A')";
                db.query(sql, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    res.json({"status": "success", "message": "Account created successfully!", "details": {"staffID": obj.ID}});
                });
            }, 100);
        } else {
            res.json({"status": "error", "message": "You have no permission to create account!"});
        }
    }, 100);
});

app.post('/addRole', function (req, res) {
    'use strict';
    
    makeID("role", req.body.creationDate);
    setTimeout(function () {
        var sql = "INSERT INTO tblstaffposition (staffPosID, staffPositionName, creationDateTime, staffPosStatus) VALUE ('" + obj.ID + "', '" + req.body.name + "', '" + req.body.creationDate + "', 'A')";
        db.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "message": "Role created successfully!", "details": {"roleID": obj.ID}});
        });
    }, 100);
});

app.get('/getAllRole', function (req, res) {
    'use strict';
    
    var sql = "SELECT staffPosID AS id, staffPositionName AS name, (CASE WHEN staffPosStatus = 'A' THEN 'ACTIVE' WHEN staffPosStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblstaffposition";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/setAuth', function (req, res) {
    'use strict';
    
    var sql = "SELECT staffPosID AS id FROM tblstaffposition WHERE staffPositionName = '" + req.body.name + "' LIMIT 0, 1";
    db.query(sql, function (err, result){
        if (err) {
            throw err;
        }
        var staffID = result[0].id;
        var sql = "SELECT mgmtAccessID AS id FROM tblmgmtaccess WHERE mgmtAccessName = '" + req.body.management + "' LIMIT 0, 1";
        db.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            var managementID = result[0].id;
            var sql = "DELETE FROM tblstaffposaccess WHERE staffPosID = '" + staffID + "' AND mgmtAccessID = '" + managementID + "'";
            db.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                var sql = "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + staffID + "', '" + managementID + "', '" + req.body.access + "')";
                db.query(sql, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    res.json({"status": "success", "message": "Permission given."});
                });
            });
        });
        //var sql = "";
    });
});

app.post('/updatePassword', function (req, res) {
    'use strict';

    var thePassword = bcrypt.hashSync(req.body.password, 10);

    var sql = "UPDATE tblstaff SET password = '" + thePassword + "' WHERE staffID = '" + req.body.id + "'";
    db.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Update failed."});
            throw err;
        }
        res.json({"status": "success", "message": "Password updated."});
    });
});

app.post('/loadSpecificAccount', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name, tblstaff.staffIC AS ic, (CASE WHEN tblstaff.staffGender = 'M' THEN 'Male' WHEN tblstaff.staffGender = 'F' THEN 'Female' END) AS gender, DATE_FORMAT(tblstaff.staffDOB, '%d %M %Y') AS dob, tblstaff.staffAddress AS address, (CASE WHEN tblstaff.staffStatus = 'A' THEN 'Active' WHEN tblstaff.staffStatus = 'F' THEN 'Freeze' END) AS status, tblstaffposition.staffPositionName AS position FROM tblstaff JOIN tblstaffposition ON tblstaff.staffPosID = tblstaffposition.staffPosID WHERE tblstaff.staffID = '" + req.body.id + "' LIMIT 0, 1";
    
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/addDriver', function (req, res) {
    'use strict';
    makeID("driver", req.body.creationDate);
    setTimeout(function() {
        var sql = "INSERT INTO tbldriver (driverID, driverName, creationDateTime, driverStatus) VALUE ('" + obj.ID + "', '" + req.body.name + "', '" + req.body.creationDate + "', 'A')";
        db.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "details": {"driverID": obj.ID}});
        });
    }, 100);
});

app.post('/addZone', function (req, res) {
    'use strict';
    makeID("zone", req.body.creationDate);
    setTimeout(function() {
        var sql = "INSERT INTO tblzone (zoneID, zoneName, creationDateTime, zoneStatus) VALUE ('" + obj.ID + "', '" + req.body.name + "', '" + req.body.creationDate + "', 'A')";
        db.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "details": {"zoneID": obj.ID}});
        });
    }, 100);
});

app.post('/addArea', function (req, res) {
    'use strict';
    makeID("area", req.body.creationDate);
    setTimeout(function () {
        var sql = "INSERT INTO tblarea (areaID, zoneID, staffID, areaName, creationDateTime, areaStatus) VALUE ('" + obj.ID + "', '" + req.body.zone.id + "', '" + req.body.staff.id + "', '" + req.body.name + "', '" + req.body.creationDate + "', 'A')";
        
//        var sql = "INSERT INTO tblarea (areaID, zoneID, staffID, areaName, collection_frequency, creationDateTime, areaStatus) VALUE ('" + obj.ID + "', '" + req.body.zone.id + "', '" + req.body.staff.id + "', '" + req.body.name + "', '" + req.body.collectionFrequency + "' , '" + req.body.creationDate + "', 'A')";
        db.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "details": {"areaID": obj.ID}});
        });
    }, 100);
});

//16/5 sing hong modify
app.post('/addTruck', function (req, res) {
    'use strict';
    makeID("truck", req.body.creationDate);
    setTimeout(function () {
        var sql = "INSERT INTO tbltruck (truckID, transporterID, truckTon, truckNum, truckExpiryStatus, creationDateTime, truckStatus) VALUE ('" + obj.ID + "', '" + req.body.transporter + "', '" + req.body.ton + "', '" + req.body.no + "', '" + req.body.roadtax + "', '" + req.body.creationDate + "', 'A')";
        db.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "details": {"truckID": obj.ID}});
        });
    }, 100);
});

//16/5 sing hong add
app.post('/addBin', function (req, res) {
    'use strict';
    makeID("bin", req.body.creationDate);
    setTimeout(function () {
        var sql = "INSERT INTO tblbin (binID, areaID,binName, binLocation, binStatus, creationDateTime) VALUE ('" + obj.ID + "', '" + req.body.area + "' , '" + req.body.name + "', '" + req.body.loc + "', 'A', '" + req.body.creationDate + "')";
        db.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "details": {"binID": obj.ID}});
        });
    }, 100);
});

app.get('/getAllUser', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name, tblstaff.username, (CASE WHEN tblstaff.staffStatus = 'A' THEN 'ACTIVE' WHEN tblstaff.staffStatus = 'F' THEN 'FREEZE' END) AS status, tblstaffposition.staffPositionName AS position FROM tblstaff JOIN tblstaffposition ON tblstaff.staffPosID = tblstaffposition.staffPosID";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.get('/getPositionList', function(req, res) {
    'use strict';
    
    var sql = "SELECT staffPosID AS id, staffPositionName AS name FROM tblstaffposition WHERE staffPosStatus = 'A'";
    db.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
    
});

app.get('/getDriverList', function(req, res) {
    'use strict';
    var sql = "SELECT driverID AS id, driverName AS name FROM tbldriver WHERE driverStatus = 'A'";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.get('/getZoneList', function (req, res) {
    'use strict';
    var sql = "SELECT zoneID AS id, zoneName AS name FROM tblzone WHERE zoneStatus = 'A'";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.get('/getAllZone', function (req, res) {
    'use strict';
    var sql = "SELECT zoneID AS id, zoneName AS name, (CASE WHEN zoneStatus = 'A' THEN 'ACTIVE' WHEN zoneStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblzone";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//15/5 sing hong modify
app.get('/getAllArea', function (req, res) {
    'use strict';
    var sql = "SELECT areaID AS id, areaName AS name, zoneID as zone, staffID as staff, collection_frequency as collectionFrequency, (CASE WHEN areaStatus = 'A' THEN 'ACTIVE' WHEN areaStatus = 'I' THEN 'INACTIVE' END) as status FROM tblarea";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.get('/getAllDriver', function (req, res) {
    'use strict';
    var sql = "SELECT driverID AS id, driverName AS name, (CASE WHEN driverStatus = 'A' THEN 'ACTIVE' WHEN driverStatus = 'I' THEN 'FREEZE' END) AS status FROM tbldriver";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.get('/getStaffList', function (req, res) {
    'use strict';
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name FROM tblstaff JOIN tblstaffposition ON tblstaff.staffPosID = tblstaffposition.staffPosID WHERE tblstaff.staffStatus = 'A' AND tblstaffposition.staffPositionName = 'Reporting Officer'";
    db.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.get('/getAreaList', function (req, res) {
    'use strict';
    var sql = "SELECT tblzone.zoneID AS zoneID, tblzone.zoneName AS zoneName, GROUP_CONCAT(tblarea.areaID) AS id, GROUP_CONCAT(tblarea.areaName) AS name FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaStatus = 'A' GROUP BY tblzone.zoneID";
    db.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/getAllAuth', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblmgmtaccess.mgmtAccessName AS name, tblstaffposaccess.status FROM tblstaffposaccess JOIN tblstaffposition ON tblstaffposaccess.staffPosID = tblstaffposition.staffPosID JOIN tblmgmtaccess ON tblmgmtaccess.mgmtAccessID = tblstaffposaccess.mgmtAccessID WHERE tblstaffposition.staffPositionName = '" + req.body.name + "'";
    
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//15/5 sing hong
app.get('/getAllTruck', function(req,res){
    'use strict';
    
    var sql = "SELECT truckID AS id, transporterID AS transporter, truckTon AS ton, truckNum AS no, truckExpiryStatus AS roadtax, (CASE WHEN truckStatus = 'A' THEN 'ACTIVE' WHEN truckStatus = 'I' THEN 'INACTIVE' END) AS status FROM tbltruck";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//16/5 sing hong
app.get('/getAllBin', function(req,res){
    'use strict';
    
    var sql = "SELECT binID AS id, areaID AS area, binName as name, binLocation AS location, (CASE WHEN binStatus = 'A' THEN 'ACTIVE' WHEN binStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblbin";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//15/5 sing hong
app.post('/editZone',function(req,res){
    'use strict';
    var sql = "UPDATE tblzone SET zoneName = '" + req.body.editZoneName+ "', zoneStatus = '" + req.body.editZoneStatus + "' WHERE zoneID = '"+ req.body.editZoneId + "'";
    db.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Update failed."});
            throw err;
        }
        res.json({"status": "success", "message": "Zone Information Updated."});
    });
});

//15/5 sing hong
app.post('/editArea',function(req,res){
    'use strict';
    
    var sql = "UPDATE tblarea SET areaName = '" + req.body.editAreaName+ "', zoneID = '" + req.body.editAreaZone.id + "', staffID = '" + req.body.editAreaStaff.id +"' , areaStatus = '" + req.body.editAreaStatus + "' WHERE areaID = '"+ req.body.editAreaId + "'";

    db.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Update failed."});
            throw err;
        }
        res.json({"status": "success", "message": "Area Information Updated."});
    });
});

/* Emitter Registered */

// Create Database Tables
emitter.on('createTable', function () {
    'use strict';
    var sqls, i;
    sqls = [
        "CREATE TABLE tblstaff (staffID VARCHAR(15) PRIMARY KEY, username VARCHAR(20), password MEDIUMTEXT, staffName VARCHAR(50), staffIC VARCHAR(15), staffGender CHAR(1), staffDOB DATE, staffAddress VARCHAR(255), staffPosID VARCHAR(15), creationDateTime DATETIME, staffStatus CHAR(1))",
        "CREATE TABLE tblstaffposition (staffPosID VARCHAR(15) PRIMARY KEY, staffPositionName VARCHAR(30), creationDateTime DATETIME, staffPosStatus CHAR(1))",
        "CREATE TABLE tblstaffposaccess (staffPosID VARCHAR(15), mgmtAccessID INT, status CHAR(1))",
        "CREATE TABLE tblmgmtaccess (mgmtAccessID INT PRIMARY KEY AUTO_INCREMENT, mgmtAccessName VARCHAR(100))",
        "CREATE TABLE tbldriver (driverID VARCHAR(15) PRIMARY KEY, driverName VARCHAR(100), driverAddress VARCHAR(200), driverDOB DATE, driverPhoneNum INT, driverLicenseExpiryDate DATE, creationDateTime DATETIME, driverStatus CHAR(1))",
        "CREATE TABLE tbltruck (truckID VARCHAR(15) PRIMARY KEY, transporterID VARCHAR(15), truckTon INT, truckNum VARCHAR(10), truckExpiryStatus CHAR(1), creationDateTime DATETIME, truckStatus CHAR(1))",
//        "CREATE TABLE tbltransporter (transporterID, transporterName, transporterDescription, transportStatus)",
        "CREATE TABLE tblzone (zoneID VARCHAR(15) PRIMARY KEY, zoneName VARCHAR(100), creationDateTime DATETIME, zoneStatus CHAR(1))",
        "CREATE TABLE tblarea (areaID VARCHAR(15) PRIMARY KEY, zoneID VARCHAR(15), staffID VARCHAR(15), areaName VARCHAR(100), collection_frequency VARCHAR(10), creationDateTime DATETIME, areaStatus CHAR(1))",
        "CREATE TABLE tblbin(binID VARCHAR(15) PRIMARY KEY, areaID VARCHAR(15), binName VARCHAR(100), binLocation VARCHAR(100), creationDateTime DATETIME, binStatus CHAR(1))"
//        "CREATE TABLE area_collection (acID, areaID, areaAddress, areaCollStatus)",
//        "CREATE TABLE tblbincenter (binID, areaID, binName, binLocation, binStatus)",
//        "CREATE TABLE tblacr (acrID, acrName, acrPhoneNo, acrAddress, acrPeriod, acrStatus)",
//        "CREATE TABLE tblacrfreq (acrID, areaID, day)",
//        "CREATE TABLE tblreport (reportID, areaID, reportCollectionData, reportCreationDateTime, operationTimeStart, operationTimeEnd, garbageAmount, iFleetMap, digitalMap, readStatus, reportStatus, truckID, driverID, remark)"
    ];
    
    for (i = 0; i < sqls.length; i += 1) {
        db.query(sqls[i], function (err, result) {
            if (err) {
                throw err;
            }
        });
    }
    console.log('Tables created...');
});

emitter.on('defaultUser', function () {
    'use strict';
    
    var sqls = [
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('create account')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('edit account')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('view account')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('create driver')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('edit driver')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('view driver')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('create truck')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('edit truck')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('view truck')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('create zone')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('edit zone')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('view zone')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('create area')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('edit area')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('view area')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('add collection')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('edit collection')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('create bin')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('edit bin')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('view bin')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('create acr')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('edit acr')",
        "INSERT INTO tblmgmtaccess (mgmtAccessName) VALUE ('view acr')"
    ], i;
    
    for (i = 0; i < sqls.length; i += 1) {
        db.query(sqls[i], function (err, result) {
            if (err) {
                throw err;
            }
        });
    }
    
    var dt = dateTime.create();
    var formatted= dt.format('Y-m-d H:M:S');
    
    makeID("role", formatted);
    setTimeout(function () {
        var sql = "INSERT INTO tblstaffposition (staffPosID, staffPositionName, creationDateTime, staffPosStatus) VALUE ('" + obj.ID + "', 'ADMINISTRATOR', '" + formatted + "', 'A')";
        
        db.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            var roleID = obj.ID;
            makeID("account", formatted);
            setTimeout(function () {
                var thePassword = bcrypt.hashSync('adminacc123', 10);
                var sql = "INSERT INTO tblstaff (staffID, username, password, staffPosID, creationDateTime, staffStatus) VALUE ('" + obj.ID + "', 'trienekens@admin.com', '" + thePassword + "', '" + roleID + "', '" + formatted + "', 'A')";
                db.query(sql, function (err, result) {
                    if (err) {
                        throw err;
                    }                    
                    var sqls = [
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '1', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '2', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '3', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '4', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '5', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '6', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '7', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '8', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '9', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '10', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '11', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '12', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '13', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '14', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '15', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '16', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '17', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '18', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '19', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '20', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '21', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '22', 'A')",
                        "INSERT INTO tblstaffposaccess (staffPosID, mgmtAccessID, status) VALUE ('" + roleID + "', '23', 'A')"
                    ], j;
                    
                    for (j = 0; j < sqls.length; j += 1) {
                        db.query(sqls[j], function (err, result) {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                    console.log('Administrator generated...');
                });
            }, 100);
        });
    }, 100);
});
/* Emitter Registered */


// Create connection
var db = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS
});

//// Connect
db.connect(function (err) {
    'use strict';
    if (err) {
        throw err;
    }
    db.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name = "' + DB_NAME + '"', function (err, result) {
        if (result[0] === undefined) {
            db.query('CREATE DATABASE ' + DB_NAME + '', function (err, result) {
                if (err) {
                    throw err;
                }
                console.log('Database created...');
                db.query('USE ' + DB_NAME + '', function (err, result) {
                    if (err) {
                        throw err;
                    }
                    console.log('MySQL Connected...');
                    emitter.emit('createTable');
                    emitter.emit('defaultUser');
                });
            });
        } else {
            if (result[0].schema_name === DB_NAME) {
                db.query('USE ' + DB_NAME + '', function (err, result) {
                    if (err) {
                        throw err;
                    }
                    console.log('MySQL Connected...');
                });
            }
        }
    });
});

server.listen(process.env.PORT || SVR_PORT, function () {
    'use strict';
    console.log('Server is running on port ' + SVR_PORT + '');
});