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
var emitter = new EventEmitter();

var DB_HOST = '192.168.64.2';
var DB_USER = 'username';
var DB_PASS = 'password';
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

var makeID = function(keyword, creationDate) {
    var table, property, header;
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
        db.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "details": {"areaID": obj.ID}});
        });
    }, 100);
});

app.post('/addTruck', function (req, res) {
    'use strict';
    makeID("truck", req.body.creationDate);
    setTimeout(function () {
        var sql = "INSERT INTO tbltruck (truckID, truckNum, creationDateTime, truckStatus) VALUE ('" + obj.ID + "', '" + req.body.no + "', '" + req.body.creationDate + "', 'A')";
        db.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "details": {"truckID": obj.ID}});
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
    var sql = "SELECT zoneID AS id, zoneName AS name, (CASE WHEN zoneStatus = 'A' THEN 'ACTIVE' END) AS status FROM tblzone";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.get('/getAllArea', function (req, res) {
    'use strict';
    var sql = "SELECT areaID AS id, areaName AS name FROM tblarea";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.get('/getAllDriver', function (req, res) {
    'use strict';
    var sql = "SELECT driverID AS id, driverName AS name, (CASE WHEN driverStatus = 'A' THEN 'ACTIVE' END) AS status FROM tbldriver";
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
    
    var sql = "SELECT tblmgmtaccess.mgmtAccessName AS name, (CASE WHEN tblstaffposaccess.status = 'A' THEN true WHEN tblstaffposaccess.status = 'I' THEN false END) AS status FROM tblstaffposaccess JOIN tblstaffposition ON tblstaffposaccess.staffPosID = tblstaffposition.staffPosID JOIN tblmgmtaccess ON tblmgmtaccess.mgmtAccessID = tblstaffposaccess.mgmtAccessID WHERE tblstaffposition.staffPositionName = '" + req.body.name + "'";
    
    db.query(sql, function (err, result) {
        res.json(result);
    });
});

/* Emitter Registered */

// Create Database Tables
emitter.on('createTable', function () {
    'use strict';
    var sqls, i;
    sqls = [
        "CREATE TABLE tblstaff (staffID VARCHAR(15) PRIMARY KEY, username VARCHAR(20), password MEDIUMTEXT, staffName VARCHAR(50), staffIC VARCHAR(15), staffGender CHAR(1), staffDOB DATE, staffAddress VARCHAR(255), staffPosID INT(2), creationDateTime DATETIME, staffStatus CHAR(1))",
        "CREATE TABLE tblstaffposition (staffPosID INT PRIMARY KEY AUTO_INCREMENT, staffPositionName VARCHAR(30), staffPosDescription MEDIUMTEXT, staffPosStatus CHAR(1))",
        "CREATE TABLE tblstaffposaccess (staffPosID INT, mgmtAccessID INT, status CHAR(1))",
        "CREATE TABLE tblmgmtaccess (mgmtAccessID INT PRIMARY KEY AUTO_INCREMENT, mgmtAccessName VARCHAR(100))",
        "CREATE TABLE tbldriver (driverID VARCHAR(15) PRIMARY KEY, driverName VARCHAR(100), driverAddress VARCHAR(200), driverDOB DATE, driverPhoneNum INT, driverLicenseExpiryDate DATE, creationDateTime DATETIME, driverStatus CHAR(1))",
        "CREATE TABLE tbltruck (truckID VARCHAR(15) PRIMARY KEY, transporterID VARCHAR(15), truckTon INT, truckNum VARCHAR(10), truckExpiryStatus CHAR(1), creationDateTime DATETIME, truckStatus CHAR(1))",
//        "CREATE TABLE tbltransporter (transporterID, transporterName, transporterDescription, transportStatus)",
        "CREATE TABLE tblzone (zoneID VARCHAR(15) PRIMARY KEY, zoneName VARCHAR(100), creationDateTime DATETIME, zoneStatus CHAR(1))",
        "CREATE TABLE tblarea (areaID VARCHAR(15) PRIMARY KEY, zoneID VARCHAR(15), staffID VARCHAR(15), areaName VARCHAR(100), collection_frequency VARCHAR(10), creationDateTime DATETIME, areaStatus CHAR(1))"
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
/* Emitter Registered */


// Create connection
var db = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS
});

// Connect
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