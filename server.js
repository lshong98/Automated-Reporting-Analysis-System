/*jslint node:true*/
var express = require('express');
var sanitizer = require('sanitizer');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path'); 
var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var EventEmitter = require('events');
var dateTime = require('node-datetime');
var emitter = new EventEmitter();
var nodemailer = require('nodemailer');
var Joi = require('joi');
require('dotenv').config();

var SVR_PORT = 3000;

var requestHandler = require('./requestHandlers');
var database = require('./custom_modules/database-management');
var accountManagement = require('./custom_modules/account-management');
var acrManagement = require('./custom_modules/acr-management');
var areaManagement = require('./custom_modules/area-management');
var zoneManagement = require('./custom_modules/zone-management');
var bincenterManagement = require('./custom_modules/bincenter-management');
var f = require('./custom_modules/function-management');
var reportManagement = require('./custom_modules/report-management');
var roleManagement = require('./custom_modules/role-management');
var truckManagement = require('./custom_modules/truck-management');
var zoneManagement = require('./custom_modules/zone-management');
var transactionLog = require('./custom_modules/transaction-log');
var authorization = require('./custom_modules/authorization');
var formAuthorization = require('./custom_modules/form-authorization'); 
var databaseBinManagement = require('./custom_modules/bin-database');
var binInventoryManagement = require('./custom_modules/bin-inventory');
var chatManagement = require('./custom_modules/chat-management');
var deliveryManagement = require('./custom_modules/delivery-management');
var damagedLostBin = require('./custom_modules/damaged-lost-bin');

users = [];
connections = [];
connectedUserList = [];
 
var obj = {
    "ID": '',
    "authStatus": ''
};

// Parse JSON bodies (as sent by API clients)
app.use(express.json({limit: '50mb'}));
// Parse URL-encoded bodies (as sent by HTML forms)
//app.use(express.urlencoded());

app.post('/loadMenu', function (req, res) {
    'use strict';
    var content = '', sql;
    
    if (req.body.position === "Manager") {
        content += '<li data-ng-show="navigation.manager" class="menu__item" role="menuitem"><a class="menu__link" href="#/dashboard-manager"><i class="fa fa-tachometer-alt"></i> Manager Dashboard</a></li>';
    } else if (req.body.position === "Reporting Officer") {
        content += '<li data-ng-show="navigation.officer" class="menu__item" role="menuitem"><a class="menu__link" href="#/dashboard-officer"><i class="fa fa-tachometer-alt"></i> Officer Dashboard</a></li>';
    }
    
    sql = "SELECT tblmanagement.mgmtName, tblaccess.status FROM tblaccess INNER JOIN tblmanagement ON tblmanagement.mgmtID = tblaccess.mgmtID JOIN tblposition ON tblposition.positionID = tblaccess.positionID WHERE tblposition.positionName = '" + req.body.position + "' AND tblaccess.status = 'A'";
    
    database.query(sql, function (err, result) {
        result.forEach(function (key, value) {
            if ((key.mgmtName).indexOf("view") !== -1) {
                content += f.menuItem(key.mgmtName, key.status);
            }
        });
        
        content += '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/logout"><i class="fa fa-power-off"></i> Logout</a></li>';
        
        res.json({"content": content});
        res.end();
    });
    
});

app.post('/getAreaLngLat', function (req, res) {
    'use strict';
    var sql = "SELECT longitude, latitude FROM tblarea WHERE areaID = '" + req.body.areaCode + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/updateAreaLngLat', function (req, res) {
    'use strict';
    var sql = "UPDATE tblarea SET longitude = '" + req.body.lng + "', latitude = '" + req.body.lat + "' WHERE areaID = '" + req.body.areaCode + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        result.type = "success";
        result.msg = "Area's Longitude and Latitude has been added";
        res.json(result);
    });
}); // Complete

// Visualization Management
app.post('/getDataVisualization', function (req, res) {
    'use strict';
    
    var sql = "SELECT a.areaID, a.areaName, r.reportCollectionDate, r.operationTimeStart, r.operationTimeEnd, r.garbageAmount, r.completionStatus FROM tblreport r INNER JOIN tblarea a ON r.areaID = a.areaID WHERE r.reportCollectionDate BETWEEN '" + req.body.dateStart + "' AND '" + req.body.dateEnd + "' ORDER BY r.reportCollectionDate";
    
    if (req.body.zoneID !== '') {
        sql = "SELECT a.areaID, a.areaName, r.reportCollectionDate, r.operationTimeStart, r.operationTimeEnd, r.garbageAmount, r.completionStatus FROM tblreport r INNER JOIN tblarea a ON r.areaID = a.areaID WHERE r.reportCollectionDate BETWEEN '" + req.body.dateStart + "' AND '" + req.body.dateEnd + "' AND a.zoneID = '" + req.body.zoneID + "' ORDER BY r.reportCollectionDate";
    }
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getDataVisualizationGroupByDate', function (req, res) {
    'use strict';
    
    var sql = "SELECT r.reportCollectionDate, SUM(r.operationTimeStart) AS 'operationTimeStart', SUM(r.operationTimeEnd) AS 'operationTimeEnd', SUM(r.garbageAmount) AS 'garbageAmount' FROM tblreport r INNER JOIN tblarea a ON  r.areaID = a.areaID WHERE r.reportCollectionDate BETWEEN '" + req.body.dateStart + "' AND '" + req.body.dateEnd + "' GROUP BY r.reportCollectionDate ORDER BY r.reportCollectionDate";
    
    if (req.body.zoneID !== '') {
        sql = "SELECT r.reportCollectionDate, SUM(r.operationTimeStart) AS 'operationTimeStart', SUM(r.operationTimeEnd) AS 'operationTimeEnd', SUM(r.garbageAmount) AS 'garbageAmount' FROM tblreport r INNER JOIN tblarea a ON  r.areaID = a.areaID WHERE r.reportCollectionDate BETWEEN '" + req.body.dateStart + "' AND '" + req.body.dateEnd + "' AND a.zoneID = '" + req.body.zoneID + "' GROUP BY r.reportCollectionDate ORDER BY r.reportCollectionDate";
    }
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//get count
app.get('/getCount', function (req, res) {
    'use strict';
    var results = {};
    
    f.waterfallQuery("SELECT COUNT(*) AS zone FROM tblzone").then(function (zone) {
        results.zone = zone.zone;
        return f.waterfallQuery("SELECT COUNT(*) AS area FROM tblarea");
    }).then(function (area) {
        results.area = area.area;
        return f.waterfallQuery("SELECT COUNT(*) AS acr FROM tblacr");
    }).then(function (acr) {
        results.acr = acr.acr;
        return f.waterfallQuery("SELECT COUNT(*) AS bin FROM tblbincenter");
    }).then(function (bin) {
        results.bin = bin.bin;
        return f.waterfallQuery("SELECT COUNT(*) AS truck FROM tbltruck");
    }).then(function (truck) {
        results.truck = truck.truck;
        return f.waterfallQuery("SELECT COUNT(*) AS staff FROM tblstaff");
    }).then(function (staff) {
        results.staff = staff.staff;
        return f.waterfallQuery("SELECT COUNT(*) AS complaint FROM tblcomplaint WHERE status != 'c'");
    }).then(function (complaint) {
        results.complaint = complaint.complaint;
        return f.waterfallQuery("SELECT COUNT(*) AS completeReport FROM tblreport WHERE completionStatus = 'C' AND DATE(creationDateTime)= CURRENT_DATE");
    }).then(function (completeReport) {
        results.completeReport = completeReport.completeReport;
        return f.waterfallQuery("SELECT COUNT(*) AS incompleteReport FROM tblreport WHERE completionStatus = 'I'");
    }).then(function (incompleteReport) {
        results.incompleteReport = incompleteReport.incompleteReport;
        res.json(results);
        res.end();
    });
});

app.post('/getTodayAreaCount', function (req, res) {
    'use strict';
    var sql = "SELECT COUNT(*) AS todayAreaCount FROM tblarea WHERE collection_frequency LIKE '%" + req.body.day + "%'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/getUnsubmitted', function (req, res) {
    'use strict';
    
    var sql = "SELECT DISTINCT tblarea.areaName AS area, tblstaff.staffName AS staff FROM tblarea INNER JOIN tblstaff ON tblarea.staffID = tblstaff.staffID WHERE tblarea.areaID NOT IN (SELECT tblreport.areaID FROM tblreport WHERE DATE(tblreport.creationDateTime) = CURDATE()) AND tblarea.collection_frequency LIKE '%" + req.body.day + "%'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getSubmitted', function (req, res) {
    'use strict';
    
    var sql = "SELECT DISTINCT tblarea.areaName AS area, tblstaff.staffName AS staff FROM tblarea INNER JOIN tblstaff ON tblarea.staffID = tblstaff.staffID INNER JOIN tblreport ON tblreport.areaID = tblarea.areaID WHERE tblarea.collection_frequency LIKE '%" + req.body.day + "%' AND DATE(tblreport.creationDateTime) = CURDATE()";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//complaint module
app.get('/getComplaintList', function (req, res) {
    'use strict';
    var sql = "SELECT tblcomplaint.date AS 'date', tblcomplaint.complaintTitle AS 'title', tblcustomer.name AS  'customer', tblcomplainttype.complaintType AS 'type', tblarea.areaName AS 'area', tblcomplaint.complaintID AS ' complaintID', (CASE WHEN tblcomplaint.status = 'c' THEN 'Confirmation' WHEN tblcomplaint.status = 'p' THEN 'Pending' WHEN tblcomplaint.status = 'i' THEN 'In progress' WHEN tblcomplaint.status ='d' THEN 'Done' END) AS status FROM tblcomplaint JOIN tblcomplainttype ON tblcomplaint.complaintType = tblcomplainttype.complaintType JOIN tblcustomer ON tblcustomer.customerID = tblcomplaint.customerID JOIN tbltaman ON tbltaman.tamanID = tblcustomer.tamanID JOIN tblarea ON tblarea.areaID = tbltaman.areaID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.get('/getComplaintLoc', function (req, res) {
    'use strict';
    var sql = "SELECT tblcomplaint.complaintID, tblcomplaint.date AS 'date', tblarea.longitude AS 'longitude', tblarea.latitude AS 'latitude', tblarea.areaName AS 'area', tblcustomer.name AS 'customer', tblcomplaint.status AS 'status' FROM tblcustomer JOIN tbltaman ON tblcustomer.tamanID = tbltaman.tamanID JOIN tblarea ON tblarea.areaID = tbltaman.areaID JOIN tblcomplaint ON tblcomplaint.customerID = tblcustomer.customerID";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
//get complaint detail by id
app.post('/getComplaintDetail', function (req, res) {
    'use strict';
    var sql = "SELECT t.complaint, co.complaintTitle, co.complaintContent, co.date, cu.name, CONCAT(cu.houseNo, ', ', cu.streetNo, ', ', tbltaman.tamanName, ', ', cu.postCode, ', ', cu.city) AS address, a.areaID, a.areaName, (CASE WHEN co.status = 'c' THEN 'Confirmation' WHEN co.status = 'p' THEN 'Pending' WHEN co.status = 'i' THEN 'In progress' WHEN co.status = 'd' THEN 'Done' END) AS status from tblcomplaint co JOIN tblcomplainttype t ON co.complaintType = t.complaintType JOIN tblcustomer cu ON co.customerID = cu.customerID JOIN tbltaman ON tbltaman.tamanID = cu.tamanID JOIN tblarea a ON a.areaID = tbltaman.areaID WHERE co.complaintID = '" + req.body.id + "'";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//get report date list for complaint by id
app.post('/getDateListForComplaint', function (req, res) {
    'use strict';
    var sql = "SELECT reportID, reportCollectionDate as date FROM tblreport WHERE areaID = '" + req.body.id + "' ORDER BY reportCollectionDate DESC";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getReportForComplaint', function (req, res) {
    'use strict';
    var content = '', sql;
    
    sql = "SELECT tblreport.reportID AS id, tblreport.areaID AS area, tblreport.reportCollectionDate AS date, tblreport.operationTimeStart AS startTime, tblreport.operationTimeEnd AS endTime, tblreport.remark, tblarea.latitude AS lat, tblarea.longitude AS lng, tblreport.garbageAmount AS ton, tblreport.iFleetMap AS ifleet, tbltruck.truckNum AS truck, tbltruck.truckID as truckID, tbltruck.transporter AS transporter, tblstaff.staffName AS driver, tblstaff.staffID AS driverID, GROUP_CONCAT(tbltaman.tamanName) AS collection, tblarea.collection_frequency AS frequency, tblreport.completionStatus as status FROM tblreport JOIN tbltruck ON tbltruck.truckID = tblreport.truckID JOIN tblstaff ON tblreport.driverID = tblstaff.staffID JOIN tblarea ON tblarea.areaID = tblreport.areaID JOIN tbltaman ON tbltaman.areaID = tblarea.areaID WHERE tblreport.reportID = '" + req.body.reportID + "' GROUP BY tblreport.areaID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log(sql);
        console.log(result);
        
        content += '<div class="row"><div class="col-md-12"><table border="1"><thead><tr><th colspan="2">IVWM INSPECTION REPORT ID: ' + result[0].id + '</th><th>Completion Status:' + result[0].status + '</th><th>Collection Date: ' + result[0].date + '</th><th>Garbage Amount(ton): ' + result[0].ton + '</th><th>Time Start: ' + result[0].startTime + '</th><th>Time End: ' + result[0].startEnd + '</th><th>Reporting Staff:</th></tr><tr><th>Area</th><th>Collection Area</th><th>COLLECTION FREQUENCY</th><th>BIN CENTERS</th><th>ACR CUSTOMER</th><th>TRANSPORTER</th><th>TRUCK NO.</th><th>DRIVER</th></tr></thead><tbody><tr><td>' + result[0].area + '</td><td>' + result[0].collection + '</td><td>' + result[0].frequency + '</td><td >bin</td><td>acr</td><td>' + result[0].transporter + '</td><td>' + result[0].truck + '</td><td>' + result[0].driver + '</td></tr><tr><td>Remarks:</td><td colspan="7">' + result[0].remark + '</td></tr></tbody></table></div></div>';
        
        res.json({"content": content, "result": result});
        
    });
    
});
app.post('/updateAreaLngLat', function (req, res) {
    'use strict';
    var sql = "UPDATE tblarea SET longitude = '" + req.body.lng + "', latitude = '" + req.body.lat + "' WHERE areaID = '" + req.body.areaCode + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete


//get all customer lng and lat
app.get('/getLngLat', function (req, res) {
    'use strict';
    
    var sql = "SELECT longitude, latitude FROM tblbins";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
//        SELECT serialNo, longitude, latitude, mystatus FROM (SELECT serialNo, latitude, longitude, 'NOT COLLECTED' AS mystatus FROM tblbins WHERE serialNo NOT IN (SELECT serialNo FROM tbltag WHERE date = CURRENT_DATE) UNION ALL SELECT serialNo, latitude, longitude, 'COLLECTED' AS mystatus FROM tbltag WHERE serialNo NOT IN (SELECT serialNo FROM tblbins WHERE serialNo NOT IN (SELECT serialNo FROM tbltag WHERE date = CURRENT_DATE))) AS t ORDER BY serialNo
    });
});

//get lng and lat of collected customer's bin 
app.get('/getCollectedLngLat', function (req, res) {
    'use strict';
    var sql = "SELECT tblbins.longitude AS longitude, tblbins.latitude AS latitude FROM tblbins JOIN tbltag on tblbins.serialNo = tbltag.serialNo WHERE tbltag.date = CURDATE()";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        res.end();
    });
});

app.get('/livemap', function (req, res) {
    'use strict';
    
    var sql = "SELECT serialNo, longitude, latitude, status FROM (SELECT serialNo, latitude, longitude, 'NOT COLLECTED' AS status FROM tblbins WHERE serialNo NOT IN (SELECT serialNo FROM tbltag WHERE date >= CURRENT_DATE) UNION ALL SELECT b.serialNo, b.latitude, b.longitude, 'COLLECTED' AS status FROM tbltag t, tblbins b WHERE b.serialNo NOT IN (SELECT serialNo FROM tblbins WHERE serialNo NOT IN (SELECT serialNo FROM tbltag WHERE date >= CURRENT_DATE))) AS t ORDER BY serialNo";
    
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



//app.post('/insertTag', function (req, res) {
//    'use strict';
//    
//    var sql = "INSERT into tbltag values('2019-08-01 06:34:20','K123875','TRK201908010001','110.348068','1.5089');";
//    database.query(sql, function (err, result) {
//        if (err) {
//            throw err;
//        } else {
//            emitter.emit('live map');
//        }
//    });
//});

app.get('/insertTag', function (req, res) {
    'use strict';

    f.waterfallQuery("SELECT truckID FROM tbltruck WHERE truckNum = '" + req.query.truckID + "'").then(function (truck) {
        var sql = "INSERT INTO tbltag (date, serialNo, truckID, longitude, latitude) VALUES ('" + req.query.date + "', '" + req.query.serialNo + "', '" + truck.truckID + "', '" + req.query.longitude + "', '" + req.query.latitude + "')";
        database.query(sql, function (err, result) {
            if (err) {
                res.end();
                throw err;
            } else {
                console.log("Tag inserted:{'" + req.query.date + "', '" + req.query.serialNo + "', '" + req.query.truckID + "', '" + req.query.longitude + "', '" + req.query.latitude + "'}");
                emitter.emit('live map');
                res.end();
            }
        });
    });
});

// Tag Rest API

app.get('/api/tags', function (req, res) {
    'use strict';
    var sql = "select * from tbltag";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/api/tags', function (req, res) {
    'use strict';
    // Validation
    // If invalid return 400 bad request
    var error = validateTag(req.body), tag, sql;
    console.log(error);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    
    // If valid then execute
    tag = {
        "date": req.body.date,
        "serialNo": req.body.serialNo,
        "truckID": req.body.truckID,
        "longitude": req.body.longitude,
        "latitude": req.body.latitude
    };

    sql = "INSERT INTO tbltag VALUES ('" + req.body.date + "', '" + req.body.serialNo + "', '" + req.body.truckID + "', '" + req.body.longitude + "', '" + req.body.latitude + "')";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log(result);
    });

    res.send(tag);
    emitter.emit('live map');
});

function validateTag(tag) {
    'use strict';
    var schema = {
        date: Joi.date().required(),
        serialNo : Joi.string().required(),
        truckID : Joi.string().required(),
        longitude : Joi.number().required(),
        latitude : Joi.number().required()
    };

    return Joi.validate(tag, schema);
}

// End of Rest API

app.post('/emailandupdate', function (req, res) {
    'use strict';
    var transporter, subject, text, email, mailOptions;
    
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
//    
//    var subject = "testinggg using nodemailer";
//    var text = "testinggg";
//    var email = "lshong9899@gmail.com";
        
    subject = req.body.subject;
    text = req.body.text;
    email = req.body.email;
    
    mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
//        res.json({"status": "success"});
            var sql = "UPDATE tblcomplaint SET status = '" + req.body.status + "' WHERE complaintID = '" + req.body.id + "'";
            database.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                res.json({"status": "success"});
            });
        }
    });
});

////emailing service for complaint
//app.post('/emailService',function(req,res){
//    'use strict';
//    console.log("testing");
//    var transporter = nodemailer.createTransport({
//      service: 'gmail',
//      auth: {
//        user: process.env.EMAIL,
//        pass: process.env.PASSWORD
//      }
//    });
////    
////    var subject = "testinggg using nodemailer";
////    var text = "testinggg";
////    var email = "lshong9899@gmail.com";
//        
//    var subject = req.body.subject;
//    var text = req.body.text;
//    var email = req.body.email;
//    
//    var mailOptions = {
//      from: process.env.EMAIL,
//      to: email,
//      subject: subject,
//      text: text
//    };
//
//    transporter.sendMail(mailOptions, function(error, info){
//      if (error) {
//        console.log(error);
//      } else {
//        console.log('Email sent: ' + info.response);
//          res.json({"status": "success"});
//      }
//    });
//    
//});

app.post('/updateComplaintStatus', function (req, res) {
    'use strict';
    var sql = "UPDATE tblcomplaint SET status = '" + req.body.status + "' WHERE complaintID = '" + req.body.id + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
    
});

server.listen(process.env.PORT || SVR_PORT, function () {
    'use strict';
    console.log('Server is running on port ' + SVR_PORT);
});

//------------------------------------------------------------------------------------------
// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function (comparer) {
    'use strict';
    var i = 0;
    
    for (i = 0; i < this.length; i += 1) {
        if (comparer(this[i])) {
            return true;
        }
    }
    return false;
};

// adds an element to the array if it does not already exist using a comparer 
// function
Array.prototype.pushIfNotExist = function (element, comparer) {
    'use strict';
    var i = 0;
    
    if (!this.inArray(comparer)) {
        this.push(element);
    } else {
        for (i = 0; i < this.length; i += 1) {
            if (this[i].user == element.user) {
                this[i].socketID = element.socketID;
            }
        }
    }
};
//------------------------------------------------------------------------------------------

var roomManager = "manager";

io.sockets.on('connection', function (socket) {
    'use strict';
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);
    
    // Disconnect
    socket.on('disconnect', function (data) {
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });
    
    socket.on('socketID', function (data) {
        connectedUserList.pushIfNotExist(data, function (e) {
            return e.user === data.user;
        });
        console.log(connectedUserList);
    });
    
    socket.on('room', function (room) {
        socket.join(room);
    });
    
    socket.on('make report', function (data) {
        var sql = "SELECT staffName AS name, staffPic AS avatar FROM tblstaff WHERE staffID = '" + data.owner + "' LIMIT 0, 1";
        
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            if (result[0].avatar === "") {
                result[0].avatar = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";
            }
            io.sockets.in(roomManager).emit('receive report notification', {
                id: data.reportID,
                name: result[0].name,
                avatar: result[0].avatar
            });
        });
    });
    
    socket.on('authorize request', function (data) {
        var sql = "";
        if (data.action === "create user") {
            sql = "SELECT COUNT(*) AS row FROM tblauthorization WHERE authorize = 'M'";
        }
        
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            } else {
                io.sockets.in(roomManager).emit('receive authorize action', {
                    num: result[0].row
                });
            }
        });
    });
    
    emitter.on('live map', function () {
        var sql = "SELECT serialNo FROM tbltag WHERE date >= CURRENT_DATE ORDER BY date DESC LIMIT 0, 1";
        
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            } else {
                io.sockets.in(roomManager).emit('synchronize map', {
                    "serialNumber": result[0].serialNo,
                    "status": "COLLECTED"
                });
            }
        });
    });
    
    //Send Message
    socket.on('send message', function (data) {
        io.sockets.emit('new message', {
            msg: data,
            user: socket.username
        });
    });
    
    //Create New User
    socket.on('create new user', function () {
        var latestData = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name, tblstaff.username, tblposition.positionName AS position, (CASE WHEN tblstaff.staffStatus = 'A' THEN 'ACTIVE' WHEN tblstaff.staffStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblstaff INNER JOIN tblposition ON tblposition.positionID = tblstaff.positionID ORDER BY tblstaff.creationDateTime DESC LIMIT 0, 1";
        
        database.query(latestData, function (err, result) {
            socket.broadcast.emit('append user list', {
                id: result[0].id,
                name: result[0].name,
                username: result[0].username,
                position: result[0].position,
                status: result[0].status
            });
        });
    });
    
    //Create New Truck
    socket.on('create new truck', function (data) {
        socket.broadcast.emit('append truck list', {
            id: data.id,
            no: data.no,
            transporter: data.transporter,
            ton: data.ton,
            roadtax: data.roadtax,
            status: 'ACTIVE'
        });
    });
    
    //Create New Zone
    socket.on('create new zone', function (data) {
        socket.broadcast.emit('append zone list', {
            "id": data.id,
            "name": data.name,
            "status": 'ACTIVE'
        });
    });
    
    //Create New Area
    socket.on('create new area', function (data) {
        socket.broadcast.emit('append area list', {
            "id": data.id,
            "name": data.name,
            "zoneName": data.zoneName,
            "staffName": data.staffName,
            "status": 'ACTIVE'
        });
    });
    
    //Create New Bin
    socket.on('create new bin', function (data) {
        socket.broadcast.emit('append bin list', {
            "id": data.id,
            "name": data.name,
            "location": data.location,
            "area": data.area,
            "status": 'ACTIVE'
        });
    });
    
    // New User
    socket.on('new user', function (data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    });
    
    function updateUsernames() {
        io.sockets.emit('get users', users);
    }
});

app.use('/', requestHandler);
app.use('/', accountManagement);
app.use('/', acrManagement);
app.use('/', areaManagement);
app.use('/', bincenterManagement);
app.use('/', reportManagement);
app.use('/', roleManagement);
app.use('/', truckManagement);
app.use('/', zoneManagement);
app.use('/', transactionLog);
app.use('/', authorization);
app.use('/', databaseBinManagement);
app.use('/', binInventoryManagement);
app.use('/', chatManagement);
app.use('/', deliveryManagement);
app.use('/', damagedLostBin);
app.use('/', formAuthorization);
