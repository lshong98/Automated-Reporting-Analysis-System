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
var DB_NAME = '';

var SVR_PORT = 3000;
var obj = {
    "ID": '',
    "authStatus": ''
};

// Parse JSON bodies (as sent by API clients)
app.use(express.json({limit: '50mb'}));
// Parse URL-encoded bodies (as sent by HTML forms)
//app.use(express.urlencoded());

// Set static path
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'pages')));
app.use(express.static(path.join(__dirname, 'fonts')));
app.use(express.static(path.join(__dirname, 'images')));

//app.route('/').get(function (req, res) {
//    'use strict';
//    res.sendFile('index.html', {root: __dirname});
//});

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
app.get('/area/:areaID', function(req, res) {
    'use strict';
    res.sendFile('pages/area.html', {root: __dirname});
});
app.get('/bin-management', function(req, res) {
    'use strict';
    res.sendFile('pages/bin-management.html', {root: __dirname});
});
app.get('/reporting', function (req, res) {
    'use strict';
    res.sendFile('pages/reporting.html', {root: __dirname});
});
app.get('/view-report/:reportCode', function (req, res) {
    'use strict';
    res.sendFile('pages/view-report.html', {root: __dirname});
});
app.get('/data-visualization', function (req, res) {
    'use strict';
    res.sendFile('pages/data-visualization.html', {root: __dirname});
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
            table = "tblposition";
            property = "positionID";
            header = "ATH";
            break;
        case "acr":
            table = "tblacr";
            property = "acrID";
            header = "ACR";
            break;
        case "report":
            table = "tblreport";
            property = "reportID";
            header = "RPT";
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
            sql = "SELECT tblaccess.status FROM tblstaff JOIN tblposition ON tblstaff.positionID = tblposition.positionID JOIN tblaccess ON tblposition.positionID = tblaccess.positionID JOIN tblmanagement ON tblmanagement.mgmtID = tblaccess.mgmtID WHERE tblmanagement.mgmtName = 'create account' AND tblstaff.staffID = '" + whoIs + "'";
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

    var sql = "SELECT tblstaff.staffID, tblstaff.password, tblposition.positionName FROM tblstaff JOIN tblposition ON tblposition.positionID = tblstaff.positionID WHERE tblstaff.username = '" + req.body.username + "' AND tblstaff.staffStatus = 'A'";

    db.query(sql, function (err, result) {
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
app.post('/navigationControl', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblmanagement.mgmtName, tblaccess.status FROM tblaccess JOIN tblmanagement ON tblmanagement.mgmtID = tblaccess.mgmtID JOIN tblposition ON tblposition.positionID = tblaccess.positionID WHERE tblposition.positionName = '" + req.body.position + "' AND tblaccess.status = 'A'";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

// Account Management
app.post('/addUser', function (req, res) {
    'use strict';

    checkAuthority("create account", req.body.owner);
    setTimeout(function () {
        if (obj.authStatus == 'A') {
            makeID("account", req.body.creationDate);
            setTimeout(function() {
                var thePassword = bcrypt.hashSync(req.body.password, 10);
                var sql = "INSERT INTO tblstaff (staffID, username, password, staffName, positionID, creationDateTime, staffStatus) VALUE ('" + obj.ID + "', '" + req.body.username + "', '" + thePassword + "', '" + req.body.name + "', '" + req.body.position.id + "', '" + req.body.creationDate + "', 'A')";
                db.query(sql, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    res.json({"status": "success", "message": "Account created successfully!", "details": {"staffID": obj.ID}});
                    res.end();
                });
            }, 100);
        } else {
            res.json({"status": "error", "message": "You have no permission to create account!"});
        }
    }, 100);
}); // Complete
app.get('/getAllUser', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name, tblstaff.username, (CASE WHEN tblstaff.staffStatus = 'A' THEN 'ACTIVE' WHEN tblstaff.staffStatus = 'I' THEN 'INACTIVE' END) AS status, tblposition.positionName AS position FROM tblstaff JOIN tblposition ON tblstaff.positionID = tblposition.positionID AND tblposition.positionName != 'ADMINISTRATOR'";
    db.query(sql, function (err, result) {
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
    db.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Update failed."});
            throw err;
        }
        res.json({"status": "success", "message": "Password updated."});
    });
}); // Complete
app.post('/loadSpecificAccount', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name, tblstaff.staffIC AS ic, (CASE WHEN tblstaff.staffGender = 'M' THEN 'Male' WHEN tblstaff.staffGender = 'F' THEN 'Female' END) AS gender, DATE_FORMAT(tblstaff.staffDOB, '%d %M %Y') AS dob, tblstaff.staffAddress AS address, (CASE WHEN tblstaff.staffStatus = 'A' THEN 'Active' WHEN tblstaff.staffStatus = 'I' THEN 'Inactive' END) AS status, tblstaff.handphone, tblstaff.phone, tblstaff.email, tblposition.positionName AS position FROM tblstaff JOIN tblposition ON tblstaff.positionID = tblposition.positionID WHERE tblstaff.staffID = '" + req.body.id + "' LIMIT 0, 1";
    
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
app.get('/getStaffList', function (req, res) {
    'use strict';
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name FROM tblstaff JOIN tblposition ON tblstaff.positionID = tblposition.positionID WHERE tblstaff.staffStatus = 'A' AND tblposition.positionName = 'Reporting Officer'";
    db.query(sql, function(err, result) {
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
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        req.body.position = result[0].id;
        var sql = "UPDATE tblstaff SET staffName = '" + req.body.name + "', staffIC = '" + req.body.ic + "', staffGender = '" + req.body.gender + "', staffDOB = '" + req.body.dob + "', staffAddress = '" + req.body.address + "', handphone = '" + req.body.handphone + "', phone = '" + req.body.phone + "', email = '" + req.body.email + "', positionID = '" + req.body.position + "', staffStatus = '" + req.body.status + "' WHERE staffID = '" + req.body.id + "'";
        db.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "message": "Profile Updated!"});
        });
    });
}); // Complete

// Role Management
app.post('/addRole', function (req, res) {
    'use strict';
    
    makeID("role", req.body.creationDate);
    setTimeout(function () {
        var sql = "INSERT INTO tblposition (positionID, positionName, creationDateTime, positionStatus) VALUE ('" + obj.ID + "', '" + req.body.name + "', '" + req.body.creationDate + "', 'A')";
        db.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "message": "Role created successfully!", "details": {"roleID": obj.ID}});
        });
    }, 100);
}); // Complete
app.get('/getAllRole', function (req, res) {
    'use strict';
    
    var sql = "SELECT positionID AS id, positionName AS name, (CASE WHEN positionStatus = 'A' THEN 'ACTIVE' WHEN positionStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblposition WHERE positionName != 'ADMINISTRATOR'";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
app.post('/setAuth', function (req, res) {
    'use strict';
    
    var sql = "SELECT positionID AS id FROM tblposition WHERE positionName = '" + req.body.name + "' LIMIT 0, 1";
    db.query(sql, function (err, result){
        if (err) {
            throw err;
        }
        var staffID = result[0].id;
        var sql = "SELECT mgmtID AS id FROM tblmanagement WHERE mgmtName = '" + req.body.management + "' LIMIT 0, 1";
        db.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            var managementID = result[0].id;
            var sql = "DELETE FROM tblaccess WHERE positionID = '" + staffID + "' AND mgmtID = '" + managementID + "'";
            db.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                var sql = "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + staffID + "', '" + managementID + "', '" + req.body.access + "')";
                db.query(sql, function (err, result) {
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
    db.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
    
}); // Complete
app.post('/getAllAuth', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblmanagement.mgmtName AS name, tblaccess.status FROM tblaccess JOIN tblposition ON tblaccess.positionID = tblposition.positionID JOIN tblmanagement ON tblmanagement.mgmtID = tblaccess.mgmtID WHERE tblposition.positionName = '" + req.body.name + "'";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

// Truck Management
app.post('/addTruck', function (req, res) {
    'use strict';
    makeID("truck", req.body.creationDate);
    setTimeout(function () {
        var sql = "INSERT INTO tbltruck (truckID, transporter, truckTon, truckNum, truckExpiryStatus, creationDateTime, truckStatus) VALUE ('" + obj.ID + "', '" + req.body.transporter + "', '" + req.body.ton + "', '" + req.body.no + "', '" + req.body.roadtax + "', '" + req.body.creationDate + "', 'A')";
        db.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "details": {"truckID": obj.ID}});
        });
    }, 100);
}); // Complete
app.post('/editTruck', function (req, res) {
    'use strict';
    
    req.body.status = req.body.status == "ACTIVE" ? 'A' : 'I';
    
    var sql = "UPDATE tbltruck SET transporter = '" + req.body.transporter + "', truckTon = '" + req.body.ton + "', truckNum = '" + req.body.no + "', truckExpiryStatus = '" + req.body.roadtax + "', truckStatus = '" + req.body.status + "' WHERE truckID = '" + req.body.id + "'";
    db.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Something wrong!"});
            throw err;
        }
        res.json({"status": "success", "message": "Truck edited!"});
    });
}); // Complete
app.get('/getTruckList', function (req, res) {
    'use strict';
    var sql = "SELECT truckID AS id, truckNum AS no FROM tbltruck WHERE truckStatus = 'A'";
    db.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.get('/getAllTruck', function(req,res){
    'use strict';
    
    var sql = "SELECT truckID AS id, transporter, truckTon AS ton, truckNum AS no, truckExpiryStatus AS roadtax, (CASE WHEN truckStatus = 'A' THEN 'ACTIVE' WHEN truckStatus = 'I' THEN 'INACTIVE' END) AS status FROM tbltruck";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/getGoogleLocation', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblarea.areaName AS area, tblzone.zoneName AS zone FROM tblarea INNER JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaID = '" + req.body.areaCode + "' LIMIT 0, 1";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

// Zone Management
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
}); // Complete
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
app.post('/editZone',function(req, res){
    'use strict';
    var sql = "UPDATE tblzone SET zoneName = '" + req.body.name+ "', zoneStatus = '" + req.body.status + "' WHERE zoneID = '"+ req.body.id + "'";
    db.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Update failed."});
            throw err;
        }
        res.json({"status": "success", "message": "Zone Information Updated."});
    });
}); // Complete

// Area Management
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
}); // Complete
app.get('/getAllArea', function (req, res) {
    'use strict';
    var sql = "SELECT a.areaID AS id, a.areaName AS name, z.zoneID as zone, z.zoneName as zoneName, s.staffID as staff, s.staffName as staffName, collection_frequency as collectionFrequency, (CASE WHEN areaStatus = 'A' THEN 'ACTIVE' WHEN areaStatus = 'I' THEN 'INACTIVE' END) as status FROM tblarea a INNER JOIN tblzone z ON a.zoneID = z.zoneID INNER JOIN tblstaff s ON a.staffID = s.staffID";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
app.get('/getAreaList', function (req, res) {
    'use strict';
    var sql = "SELECT tblzone.zoneID AS zoneID, tblzone.zoneName AS zoneName, GROUP_CONCAT(tblarea.areaID) AS id, GROUP_CONCAT(tblarea.areaName) AS name FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaStatus = 'A' GROUP BY tblzone.zoneID";
    db.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
app.post('/updateArea',function(req,res){
    'use strict';
    
    var sql = "SELECT staffID FROM tblstaff WHERE staffName = '" + req.body.staff + "' LIMIT 0, 1";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        var staffID = result[0].staffID;
        
        var sql = "SELECT zoneID FROM tblzone WHERE zoneName = '" + req.body.zone + "' LIMIT 0, 1";
        db.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            var zoneID = result[0].zoneID;
            
            req.body.status = req.body.status == 'Active' ? 'A' : 'I';
            var sql = "UPDATE tblarea SET areaName = '" + req.body.name+ "', zoneID = '" + zoneID + "', staffID = '" + staffID +"', collection_frequency = '" + req.body.frequency + "', areaStatus = '" + req.body.status + "' WHERE areaID = '"+ req.body.id + "'";
            
            db.query(sql, function (err, result) {
                if (err) {
                    res.json({"status": "error", "message": "Update failed."});
                    throw err;
                }
                res.json({"status": "success", "message": "Area Information Updated."});
            });
        });
    });
}); // Complete
app.post('/thisArea', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblarea.areaID AS id, tblarea.areaName AS name, tblstaff.staffName AS staff, tblzone.zoneName AS zone, (CASE WHEN tblarea.areaStatus = 'A' THEN 'Active' WHEN tblarea.areaStatus = 'I' THEN 'Inactive' END) AS status, collection_frequency AS frequency FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID JOIN tblstaff ON tblarea.staffID = tblstaff.staffID WHERE tblarea.areaID = '" + req.body.id + "'";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/addCollection', function (req, res) {
    'use strict';
    
    var sql = "INSERT INTO area_collection (areaID, areaAddress, acStatus) VALUE ('" + req.body.area + "', '" + req.body.address + "', 'A')";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Address Added!"});
    });
});
app.post('/getCollection', function (req, res){
    'use strict';

    var sql = "SELECT acID AS id, areaAddress AS address FROM area_collection WHERE acStatus = 'A' AND areaID = '" + req.body.id + "'";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        res.end();
    });
});
app.post('/deleteCollection', function (req, res) {
    'user strict';
    
    var sql = "UPDATE area_collection SET acStatus = 'I' WHERE acID = '" + req.body.id + "'";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Delete successfully!"});
    });
});
app.post('/updateCollection', function (req, res) {
    'use strict';
    
    var sql = "UPDATE area_collection SET areaAddress = '" + req.body.address + "' WHERE acID = '" + req.body.id + "'";
    db.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Area collection updated!"});
    });
});

// Bin Management
app.post('/addBin', function (req, res) {
    'use strict';
    makeID("bin", req.body.creationDate);
    setTimeout(function () {
        var sql = "INSERT INTO tblbin (binID, areaID, binName, binLocation, binStatus, creationDateTime) VALUE ('" + obj.ID + "', '" + req.body.area + "' , '" + req.body.name + "', '" + req.body.location + "', 'A', '" + req.body.creationDate + "')";
        db.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "details": {"binID": obj.ID}});
        });
    }, 100);
}); // Complete
app.post('/editBin', function (req, res) {
    'use strict';
    
    req.body.status = req.body.status == "ACTIVE" ? 'A' : 'I';
    var sql = "UPDATE tblbin SET binName = '" + req.body.name + "', binLocation = '" + req.body.location + "', areaID = '" + req.body.area + "', binStatus = '" + req.body.status + "' WHERE binID = '" + req.body.id + "'";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Successfully updated!"});
    });
}); // Complete
app.get('/getAllBin', function(req,res){
    'use strict';
    
    var sql = "SELECT binID AS id, areaID AS area, binName as name, binLocation AS location, (CASE WHEN binStatus = 'A' THEN 'ACTIVE' WHEN binStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblbin";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

// ACR Management
app.post('/addAcr',function(req,res){
    'use strict';
    var i, days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    
    makeID("acr", req.body.creationDate);
    setTimeout(function () {
        var sql = "INSERT INTO tblacr (acrID, acrName, acrPhoneNo, acrAddress, acrPeriod, acrStatus, creationDateTime) VALUE ('" + obj.ID + "', '" + req.body.name + "' , '" + req.body.phone + "', '" + req.body.address + "', '" + req.body.enddate + "', 'A', '" + req.body.creationDate + "')";
        
        db.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            for (i = 0; i < days.length; i += 1) {
                if (req.body.days[days[i]] != undefined) {
                    var sql = "INSERT INTO tblacrfreq (acrID, areaID, day) VALUE ('" + obj.ID + "', '" + req.body.area + "', '" + days[i] + "')";
                    db.query(sql, function (err, result) {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
            res.json({"status": "success", "message": "ACR created!", "details": {"acrID": obj.ID}});
        });
    }, 100);
}); // Complete
app.get('/getAllAcr', function(req,res){
    'use strict';
    
    var sql = "SELECT DISTINCT a.acrID AS id, a.acrName AS name, a.acrPhoneNo AS phone, a.acrAddress AS address, DATE_FORMAT(a.acrPeriod, '%d %M %Y') as enddate, c.areaName as area,(CASE WHEN a.acrStatus = 'A' THEN 'ACTIVE' WHEN a.acrStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblacr a INNER JOIN tblacrfreq b ON a.acrID = b.acrID INNER JOIN tblarea c ON c.areaID = b.areaID";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.get('/getScheduleList', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblacr.acrName AS name, GROUP_CONCAT(tblacrfreq.day) AS days FROM tblacr JOIN tblacrfreq ON tblacr.acrID = tblacrfreq.acrID GROUP BY tblacr.acrID";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        res.end();
    });
});

// Report Management
app.post('/addReport',function(req,res){
    'use strict';
    makeID('report',req.body.creationDate);
    setTimeout(function () {
        var sql = "INSERT INTO tblreport (reportID, areaID, reportCollectionDate, operationTimeStart, operationTimeEnd, garbageAmount, iFleetImg, address, lng, lat, readStatus, reportStatus, truckID, driverID, remark, creationDateTime) VALUE ('" + obj.ID + "', '" + req.body.areaCode + "', '" + req.body.collectionDate + "', '" + req.body.startTime + "', '" + req.body.endTime + "', '" + req.body.ton + "', '" + req.body.ifleetImg + "', '" + req.body.address + "', '" + req.body.lng + "', '" + req.body.lat + "', 'I', '" + req.body.status+ "','" + req.body.truck + "', '" + req.body.driver + "', '" + req.body.remark + "','" + req.body.creationDate + "')";
        var i = 0;
        var reportID = obj.ID;
        
        db.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            for (i = 0; i < Object.keys(req.body.marker).length; i++) {
                var sql = "INSERT INTO tblmapcircle (radius, lng, lat, reportID) VALUE ('" + req.body.marker[i].radius + "', '" + req.body.marker[i].lng + "', '" + req.body.marker[i].lat + "', '" + reportID + "')";
                
                db.query(sql, function (err, result) {
                    if (err) {
                        throw err;
                    }
                });
            }
            res.json({"status": "success", "details": {"reportID": obj.ID}});
        });
    }, 100);
}); // Complete
app.post('/getReport', function(req, res){
    'use strict';
    
    var sql = "SELECT tblreport.reportID AS id, tblreport.areaID AS area, tblreport.reportCollectionDate AS date, tblreport.operationTimeStart AS startTime, tblreport.operationTimeEnd AS endTime, tblreport.remark, tblreport.lat AS lat, tblreport.lng AS lng, tblreport.garbageAmount AS ton, tblreport.iFleetImg AS ifleet, tbltruck.truckNum AS truck, tbltruck.transporter AS transporter, tblstaff.staffName AS driver, GROUP_CONCAT(area_collection.areaAddress) AS collection, tblarea.collection_frequency AS frequency FROM tblreport JOIN tbltruck ON tbltruck.truckID = tblreport.truckID JOIN tblstaff ON tblreport.driverID = tblstaff.staffID JOIN area_collection ON tblreport.areaID = area_collection.areaID JOIN tblarea ON tblarea.areaID = tblreport.areaID WHERE tblreport.reportID = '" + req.body.reportID + "' GROUP BY tblreport.areaID";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Wait for area_collection

app.post('/getReportingAreaList', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblzone.zoneID AS zoneID, tblzone.zoneName AS zoneName, GROUP_CONCAT(tblarea.areaID) AS id, GROUP_CONCAT(tblarea.areaName) AS name FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaStatus = 'A' AND tblarea.staffID = '" + req.body.officerid + "'GROUP BY tblzone.zoneID";
    
    db.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/getReportBin', function(req,res){
    'use strict';
    
    var sql = "SELECT binName AS name FROM tblbin WHERE areaID = '" + req.body.areaID + "'";
    
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getReportACR', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblacr.acrName AS name FROM tblacrfreq JOIN tblreport ON tblreport.areaID = tblacrfreq.areaID JOIN tblacr ON tblacr.acrID = tblacrfreq.acrID WHERE tblreport.reportID = '" + req.body.reportID + "' GROUP BY tblacr.acrName";
    
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getReportCircle', function(req,res){
    'use strict';
    
    var sql = "SELECT radius, lng, lat FROM tblmapcircle WHERE reportID = '" + req.body.reportID + "'";
    
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.get('/getReportList', function(req, res){
    'use strict';
    
    var sql ="SELECT reportID, reportCollectionDate, areaID, reportStatus, garbageAmount, remark FROM tblreport";
    
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

// Visualization Management
app.post('/getDataVisualization', function(req, res){
    'use strict';
    
    var sql ="SELECT a.areaID, a.areaName, r.reportCollectionDate, r.operationTimeStart, r.operationTimeEnd, r.garbageAmount, r.reportStatus FROM tblreport r INNER JOIN tblarea a ON r.areaID = a.areaID WHERE r.reportCollectionDate BETWEEN '"+req.body.dateStart+"' AND '"+req.body.dateEnd+"' ORDER BY r.reportCollectionDate";
    
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getDataVisualizationGroupByDate', function(req, res){
    'use strict';
    
    var sql ="SELECT reportCollectionDate, SUM(operationTimeStart) AS 'operationTimeStart', SUM(operationTimeEnd) AS 'operationTimeEnd', SUM(garbageAmount) AS 'garbageAmount' FROM tblreport WHERE reportCollectionDate BETWEEN '"+req.body.dateStart+"' AND '"+req.body.dateEnd+"' GROUP BY reportCollectionDate ORDER BY reportCollectionDate";
    
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
//"SELECT reportCollectionDate, SUM(operationTimeStart), SUM(operationTimeEnd), SUM(garbageAmount) FROM tblreport WHERE r.reportCollectionDate BETWEEN '"+req.body.dateStart+"' AND '"+req.body.dateEnd+"' GROUP BY reportCollectionDate ORDER BY r.reportCollectionDate";

// Driver
app.get('/getDriverList', function(req, res) {
    'use strict';
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name FROM tblposition JOIN tblstaff ON tblstaff.positionID = tblposition.positionID WHERE tblposition.positionName = 'Driver' AND tblstaff.staffStatus = 'A'";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.get('/getZoneCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblzone";
     db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});

app.get('/getAreaCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblarea";
     db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});

app.get('/getAcrCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblacr";
     db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});

app.get('/getBinCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblbin";
     db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});

app.get('/getTruckCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tbltruck";
     db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});

app.get('/getUserCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblstaff";
     db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});

app.get('/getReportCompleteCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'completeCount' FROM tblreport WHERE reportStatus = 'C'";
     db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});

app.get('/getReportIncompleteCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'incompleteCount' FROM tblreport WHERE reportStatus = 'I'";
     db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
/* Emitter Registered */

// Create Database Tables
emitter.on('createTable', function () {
    'use strict';
    var sqls, i;
    
    sqls = [
        "CREATE TABLE tblstaff (staffID VARCHAR(15) PRIMARY KEY, username VARCHAR(20), password MEDIUMTEXT, staffName VARCHAR(50), staffIC VARCHAR(15), staffGender CHAR(1), staffDOB DATE, staffAddress VARCHAR(255), handphone VARCHAR(11), phone VARCHAR(10), email VARCHAR(50), positionID VARCHAR(15), staffPic MEDIUMTEXT, creationDateTime DATETIME, staffStatus CHAR(1))",
        "CREATE TABLE tblposition (positionID VARCHAR(15) PRIMARY KEY, positionName VARCHAR(30), creationDateTime DATETIME, positionStatus CHAR(1))",
        "CREATE TABLE tblmanagement (mgmtID INT PRIMARY KEY AUTO_INCREMENT, mgmtName VARCHAR(50))",
        "CREATE TABLE tblaccess (positionID VARCHAR(15), mgmtID VARCHAR(15), status CHAR(1))",
        "CREATE TABLE tblzone (zoneID VARCHAR(15) PRIMARY KEY, zoneName VARCHAR(100), creationDateTime DATETIME, zoneStatus CHAR(1))",
        "CREATE TABLE tblarea (areaID VARCHAR(15) PRIMARY KEY, zoneID VARCHAR(15), staffID VARCHAR(15), areaName VARCHAR(100), collection_frequency VARCHAR(10), creationDateTime DATETIME, areaStatus CHAR(1))",
        "CREATE TABLE area_collection (acID INT PRIMARY KEY AUTO_INCREMENT, areaID VARCHAR(15), areaAddress MEDIUMTEXT, acStatus CHAR(1))",
        "CREATE TABLE tblbin (binID VARCHAR(15) PRIMARY KEY, areaID VARCHAR(15), binName VARCHAR(100), binLocation VARCHAR(100), creationDateTime DATETIME, binStatus CHAR(1))",
        "CREATE TABLE tblacr (acrID VARCHAR(15) PRIMARY KEY, acrName VARCHAR(100), acrPhoneNo VARCHAR(30), acrAddress VARCHAR(100), acrPeriod DATE, creationDateTime DATETIME, acrStatus CHAR(1))",
        "CREATE TABLE tblacrfreq (acrID VARCHAR(15), areaID VARCHAR(15), day VARCHAR(15))",
        "CREATE TABLE tbltruck (truckID VARCHAR(15) PRIMARY KEY, transporter VARCHAR(15), truckTon INT, truckNum VARCHAR(10), truckExpiryStatus DATE, creationDateTime DATETIME, truckStatus CHAR(1))",
        "CREATE TABLE tblreport (reportID VARCHAR(15) PRIMARY KEY, areaID VARCHAR(15), reportCollectionDate DATE, operationTimeStart TIME, operationTimeEnd TIME, garbageAmount INT(3), iFleetImg MEDIUMTEXT, address VARCHAR(80), lng DOUBLE(10, 7), lat DOUBLE(10, 7), readStatus CHAR(1), reportStatus CHAR(1), truckID VARCHAR(15), driverID VARCHAR(15), remark TEXT, creationDateTime DATETIME)",
        "CREATE TABLE tblmapcircle(circleID INT PRIMARY KEY AUTO_INCREMENT, radius VARCHAR(50), lng DOUBLE(10, 7), lat DOUBLE(10, 7), reportID VARCHAR(15))"
    ];
    
    for (i = 0; i < sqls.length; i += 1) {
        db.query(sqls[i], function (err, result) {
            if (err) {
                throw err;
            }
        });
    }
    console.log('Tables created...');
}); // Complete
emitter.on('defaultUser', function () {
    'use strict';
    
    var sqls = [
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create account')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit account')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view account')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create driver')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit driver')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view driver')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create truck')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit truck')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view truck')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create zone')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit zone')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view zone')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create area')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit area')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view area')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('add collection')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit collection')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create bin')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit bin')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view bin')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create acr')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit acr')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view acr')"
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
    var roleFormat = dt.format('Ymd');
    
    var roleID = "ATH" + roleFormat + "0001";
    var sql = "INSERT INTO tblposition (positionID, positionName, creationDateTime, positionStatus) VALUE ('" + roleID + "', 'ADMINISTRATOR', '" + formatted + "', 'A')";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        makeID("account", formatted);
        setTimeout(function () {
            var thePassword = bcrypt.hashSync('adminacc123', 10);
            var sql = "INSERT INTO tblstaff (staffID, username, password, positionID, creationDateTime, staffStatus) VALUE ('" + obj.ID + "', 'trienekens@admin.com', '" + thePassword + "', '" + roleID + "', '" + formatted + "', 'A')";
            db.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }                    
                var sqls = [
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '1', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '2', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '3', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '4', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '5', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '6', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '7', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '8', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '9', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '10', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '11', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '12', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '13', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '14', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '15', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '16', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '17', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '18', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '19', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '20', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '21', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '22', 'A')",
                    "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '23', 'A')"
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
        }, 1000);
    });
    
    
}); // Complete
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