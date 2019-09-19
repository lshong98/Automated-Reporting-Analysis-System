/*jslint node:true*/
var variable = require('./variable');
var express = variable.express;
var app = variable.app;
var server = variable.server;
var SVR_PORT = variable.SVR_PORT;
var emitter = variable.emitter;
var fs = variable.fs;
var upload = variable.upload;
var FCMAdmin = variable.FCMAdmin;
var FCMServiceAccount = variable.FCMServiceAccount;

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
var boundaryManagement = require('./custom_modules/boundary-management');
var socketManagement = require('./custom_modules/socket-management');
var complaintManagement = require('./custom_modules/complaint-management');

// Parse JSON bodies (as sent by API clients)
app.use(express.json({limit: '50mb'}));
// Parse URL-encoded bodies (as sent by HTML forms)
//app.use(express.urlencoded());

//Use express file upload
app.use(upload());

//FCM
FCMAdmin.initializeApp({
    credential: FCMAdmin.credential.cert(FCMServiceAccount),
    databaseURL: "https://trienekens-994df.firebaseio.com"
});

app.post('/sendNotifToDevice', function (req, res) {
    'use strict';
    
    var topic = req.body.target;

    var payloadWithTopic = {
        'notification':
            {
                'title': req.body.title,
                'body': req.body.message
            },
        topic: topic
    };

    console.log(req.body);
    console.log(req.body.target);
    console.log(req.body.title);
    console.log(req.body.message);

    //var target = req.body.target;
    // if(target == "all"){
    //     console.log("all customers have been selected");
    //     FCMAdmin.messaging().sendToDevice(token, payload, options)
    //     .then(function(response){
    //         console.log("Message sent successfully");
    //     }).catch(function(err){
    //         console.log(err);
    //     });
    // }
    //else{
    FCMAdmin.messaging().send(payloadWithTopic)
        .then(function (response) {
            console.log("Topic message sent successfully");
        }).catch(function (err) {
            console.log(err);
        });
    //}
});

app.get('/fetchCarouselImg', function (req, res) {
    'use strict';
    var sql = "", output = {}, i = 0;
    
    sql = "SELECT * FROM tblcarouselimg";
    output.output = [];
    database.query(sql, function (err, result) {
        for (i = 0; i < result.length; i += 1) {
            output.output.push({"imageName": result[i].fileName, "id": result[i].id});
        }
        console.log(output);
        res.json(output);
    });
});

app.get('/getAllSchedule', function (req, res) {
    'use strict';

    var sql = "", output = [], i = 0;
    
    sql = "SELECT * FROM tblschedule";
    database.query(sql, function (err, result) {
        for (i = 0; i < result.length; i += 1) {
            output.push(result[i]);
        }
        console.log(output);
        res.json(output);
    });
});

app.get('/getPendingUser', function (req, res) {
    'use strict';

    var sql = "", output = [], i = 0;
    
    sql = "SELECT * FROM tblpending WHERE status = 'Pending'";
    database.query(sql, function (err, result) {
        for (i = 0; i < result.length; i += 1) {
            output.push(result[i]);
        }
        console.log(output);
        res.json(output);
    });
});

app.get('/getPendingBinRequest', function (req, res) {
    'use strict';

    var sql = "", output = [], i = 0;
    
    sql = "SELECT reqID, requestDate, binType, reason, remarks, tblbinrequest.status, CONCAT(houseNo, ' ', streetNo, ', ', postCode, ' ', city, ', ', State) AS address, contactNumber FROM tblbinrequest JOIN tblcustomer WHERE tblbinrequest.status = 'PENDING'AND tblbinrequest.customerID = tblcustomer.customerID";
    database.query(sql, function (err, result) {
        for (i = 0; i < result.length; i += 1) {
            output.push(result[i]);
        }
        console.log(output);
        res.json(output);
    });
});

app.post('/updatePendingUser', function (req, res) {
    'use strict';
    console.log(req.body);
    var sql = "UPDATE tblpending SET status = '" + req.body.status + "' WHERE pendingID = '" + req.body.pendingID + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.send("User Status Updated");
    });
});

app.post('/updateBinRequest', function (req, res) {
    'use strict';
    console.log(req.body);
    var sql = "UPDATE tblbinrequest SET status = '" + req.body.status + "' WHERE reqID = '" + req.body.reqID + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.send("Bin Request Updated");
    });
});

app.post('/deleteCarouselImg', function (req, res) {
    'use strict';
    console.log(req.body);
    
    var imgDir = "", sql = "";
    
    imgDir = "scripts/img/" + req.body.name;
    sql = "DELETE FROM tblcarouselimg WHERE id = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        fs.unlink(imgDir, function (err) {
            if (err) {
                throw err;
            }
            console.log("Image Deleted");
            res.send("Image Deleted");
        });
    });
});

app.post('/editCollectionSchedule', function (req, res) {
    'use strict';
    console.log(req.body);
    var sql = "UPDATE tblschedule SET mon = '" + req.body.mon + "', tue = '" + req.body.tue + "', wed = '" + req.body.wed + "', thur = '" + req.body.thur + "', fri = '" + req.body.fri + "', sat = '" + req.body.sat + "' WHERE areaID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Updated");
    });
});

app.post('/uploadCarouselImg', function (req, res) {
    'use strict';
    //console.log(req.files);
    
    if (req.files) {
        var file = req.files.carouselImg,
            allowed = ["png", "jpg", "jpeg"],
            x = 0,
            i = 0,
            fileName,
            fileSize,
            fileExt,
            actualFileExt,
            sql;

        for (x = 0; x < file.length; x += 1) {
            fileName = file[x].name;
            fileSize = file[x].size;
            fileExt = file[x].name.split('.');
            actualFileExt = fileExt[1].toLowerCase();

            for (i = 0; i < allowed.length; i += 1) {
                if (actualFileExt == allowed[i]) {
                    if (file[x].size <= 2000000) {
                        sql = "INSERT INTO tblcarouselimg(fileName) VALUES('" + file[x].name + "')";
                        database.query(sql, function (err, result) {
                            if (err) {
                                throw err;
                            }
                            //console.log("Image Uploaded");
                        });
                        file[x].mv('./scripts/img/' + file[x].name, function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                }
            }
        }
        res.redirect('/pages/#/upload-image-carousel');
//        console.log("fileExt: " + fileExt);
//        console.log("actualFileExt: ", actualFileExt);
    }
});

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
            if ((key.mgmtName).indexOf("view") !== -1 || (key.mgmtName).indexOf("upload") !== -1 || (key.mgmtName).indexOf("send") !== -1 || (key.mgmtName).indexOf("approve") !== -1) {
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
    
    var sql = "SELECT DISTINCT CONCAT(tblzone.zoneCode,tblarea.areaCode) AS area, tblstaff.staffName AS staff FROM tblarea INNER JOIN tblstaff ON tblarea.staffID = tblstaff.staffID JOIN tblzone on tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaID NOT IN (SELECT tblreport.areaID FROM tblreport WHERE DATE(tblreport.creationDateTime) = CURDATE()) AND tblarea.collection_frequency LIKE '%" + req.body.day + "%'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getSubmitted', function (req, res) {
    'use strict';
    
    var sql = "SELECT DISTINCT CONCAT(tblzone.zoneCode,tblarea.areaCode) AS area, tblstaff.staffName AS staff FROM tblarea INNER JOIN tblstaff ON tblarea.staffID = tblstaff.staffID JOIN tblzone on tblarea.zoneID = tblzone.zoneID INNER JOIN tblreport ON tblreport.areaID = tblarea.areaID WHERE tblarea.collection_frequency LIKE '%" + req.body.day + "%' AND DATE(tblreport.creationDateTime) = CURDATE()";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
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

//app.post('/emailandupdate', function (req, res) {
//    'use strict';
//    var transporter, subject, text, email, mailOptions;
//    
//    transporter = nodemailer.createTransport({
//        service: 'gmail',
//        auth: {
//            user: process.env.EMAIL,
//            pass: process.env.PASSWORD
//        }
//    });
////    
////    var subject = "testinggg using nodemailer";
////    var text = "testinggg";
////    var email = "lshong9899@gmail.com";
//        
//    subject = req.body.subject;
//    text = req.body.text;
//    email = req.body.email;
//    
//    mailOptions = {
//        from: process.env.EMAIL,
//        to: email,
//        subject: subject,
//        text: text
//    };
//
//    transporter.sendMail(mailOptions, function (error, info) {
//        if (error) {
//            console.log(error);
//        } else {
//            console.log('Email sent: ' + info.response);
////        res.json({"status": "success"});
//            var sql = "UPDATE tblcomplaint SET status = '" + req.body.status + "' WHERE complaintID = '" + req.body.id + "'";
//            database.query(sql, function (err, result) {
//                if (err) {
//                    throw err;
//                }
//                res.json({"status": "success"});
//            });
//        }
//    });
//});

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

server.listen(process.env.PORT || SVR_PORT, function () {
    'use strict';
    console.log('Server is running on port ' + SVR_PORT);
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
app.use('/', boundaryManagement);
app.use('/', socketManagement);
app.use('/', complaintManagement);
