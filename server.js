/*jslint node:true*/
var express = require('express');
var sanitizer = require('sanitizer');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
var mysql = require('mysql');
var EventEmitter = require('events');
var dateTime = require('node-datetime');
var emitter = new EventEmitter();

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


app.post('/navigationControl', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblmanagement.mgmtName, tblaccess.status FROM tblaccess JOIN tblmanagement ON tblmanagement.mgmtID = tblaccess.mgmtID JOIN tblposition ON tblposition.positionID = tblaccess.positionID WHERE tblposition.positionName = '" + req.body.position + "' AND tblaccess.status = 'A'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//});
app.post('/getAreaLngLat', function(req, res) {
    'use strict';
    var sql = "SELECT longitude, latitude FROM tblarea WHERE areaID = '" + req.body.areaCode+ "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/updateAreaLngLat', function(req, res) {
    'use strict';
    var sql = "UPDATE tblarea SET longitude = '" + req.body.lng + "', latitude = '" + req.body.lat+ "' WHERE areaID = '" + req.body.areaCode + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

// Visualization Management
app.post('/getDataVisualization', function(req, res){
    'use strict';
    
    var sql ="SELECT a.areaID, a.areaName, r.reportCollectionDate, r.operationTimeStart, r.operationTimeEnd, r.garbageAmount, r.completionStatus FROM tblreport r INNER JOIN tblarea a ON r.areaID = a.areaID WHERE r.reportCollectionDate BETWEEN '"+req.body.dateStart+"' AND '"+req.body.dateEnd+"' ORDER BY r.reportCollectionDate";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getDataVisualizationGroupByDate', function(req, res){
    'use strict';
    
    var sql ="SELECT reportCollectionDate, SUM(operationTimeStart) AS 'operationTimeStart', SUM(operationTimeEnd) AS 'operationTimeEnd', SUM(garbageAmount) AS 'garbageAmount' FROM tblreport WHERE reportCollectionDate BETWEEN '"+req.body.dateStart+"' AND '"+req.body.dateEnd+"' GROUP BY reportCollectionDate ORDER BY reportCollectionDate";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

// Driver
app.get('/getDriverList', function(req, res) {
    'use strict';
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name FROM tblposition JOIN tblstaff ON tblstaff.positionID = tblposition.positionID WHERE tblposition.positionName = 'Driver' AND tblstaff.staffStatus = 'A'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

//get count
app.get('/getZoneCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblzone";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getAreaCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblarea";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getAcrCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblacr";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getBinCenterCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblbincenter";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getTruckCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tbltruck";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getUserCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblstaff";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getReportCompleteCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'completeCount' FROM tblreport WHERE completionStatus = 'C'";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getReportIncompleteCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'incompleteCount' FROM tblreport WHERE completionStatus = 'I'";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});

//complaint module
app.get('/getComplaintList',function(req,res){
    var sql="SELECT tblComplaint.date AS 'date', tblComplaint.complaintTitle AS 'title', tblCustomer.name AS  'customer', tblComplaintType.complaintType AS 'type', tblArea.areaName AS 'area', tblComplaint.complaintID AS ' complaintID' FROM tblComplaint JOIN tblComplaintType ON tblComplaint.complaintType = tblComplaintType.complaintType JOIN tblCustomer ON tblCustomer.customerID = tblComplaint.customerID JOIN tblArea ON tblArea.areaID = tblCustomer.areaID";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });    
});

app.get('/getComplaintLoc',function(req,res){
    
    var sql = "SELECT tblcomplaint.complaintID, tblarea.longitude AS 'longitude', tblarea.latitude AS 'latitude', tblarea.areaName AS 'area' FROM tblarea JOIN tblcustomer ON tblarea.areaID = tblcustomer.areaID JOIN tblcomplaint ON tblcomplaint.customerID = tblcustomer.customerID";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });        
});
//get complaint detail by id
app.post('/getComplaintDetail',function(req,res){
    'use strict';
    var sql = "SELECT t.complaint, co.complaintTitle, co.complaintContent, co.date, cu.name, CONCAT(cu.houseNo, ', ', cu.streetNo, ', ', cu.neighborhood, ', ', cu.neighborhood, ', ', cu.postCode, ', ', cu.city) AS address, a.areaID, a.areaName from tblComplaint co JOIN tblComplaintType t ON co.complaintType = t.complaintType JOIN tblCustomer cu ON co.customerID = cu.customerID JOIN tblArea a ON a.areaID = cu.areaID WHERE co.complaintID = '" + req.body.id + "'";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });        
});

//get report date list for complaint by id
app.post('/getDateListForComplaint',function(req,res){
    'use strict';
    var sql = "SELECT reportCollectionDate as date FROM tblreport WHERE areaID = '" + req.body.id + "'";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });        
});

app.post('/updateAreaLngLat', function(req, res) {
    'use strict';
    var sql = "UPDATE tblarea SET longitude = '" + req.body.lng + "', latitude = '" + req.body.lat+ "' WHERE areaID = '" + req.body.areaCode + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

/* Emitter Registered */
// Create Database Tables
emitter.on('createTable', function () {
    'use strict';
    var sqls, i;
    
    sqls = [
        "CREATE TABLE tblCustomer (customerID int auto_increment, username varchar(30),  password varchar(30),  contactNumber int, ic varchar(20), tradingLicense varchar(20),  name varchar(50),  houseNo varchar(5),  streetNo varchar(20),  neighborhood varchar(20),  postCode int,  city varchar(20),  status char(1),  creationDateTime datetime, areaID varchar(15),  PRIMARY KEY (customerID))",
        "CREATE TABLE tblPosition (  positionID varchar(15),  positionName varchar(30),  positionStatus char(1),  creationDateTime datetime,  primary key (positionID))",
        "CREATE TABLE tblBins (  serialNo int,  customerID int,  size int,  status char(1),  PRIMARY KEY (serialNo),  foreign key (customerID) references tblCustomer(customerID))",
        "CREATE TABLE tblManagement (  mgmtID int auto_increment,  mgmtName varchar(50),  PRIMARY KEY (mgmtID))",
        "CREATE TABLE tblZone (  zoneID varchar(15),  zoneName varchar(100), zoneStatus char(1),  creationDateTime datetime,  PRIMARY KEY (zoneID))",
        "CREATE TABLE tblBinInventory (  date date,  doNo varchar(10),  inNew120 int,  inNew240 int,  inNew660 int,  inNew1000 int,  outNew120 int,  outNew240 int,  outNew660 int,  outNew1000 int,  inReusable120 int,  inReusable240 int,  inReusable660 int,  inReusable1000 int,  outReusable120 int,  outReusable240 int,  outReusable660 int,  outReusable1000 int,  newBalance120 int,  newBalance240 int,  newBalance660 int,  newBalance1000 int,  reusableBalance120 int,  reusableBalance240 int,  reusableBalance660 int,  reusableBalance1000 int,  overallBalance120 int,  overallBalance240 int,  overallBalance660 int,  overallBalance1000 int,  PRIMARY KEY (date))",
        "CREATE TABLE tblStaff (  staffID varchar(15),  username varchar(20),  password mediumtext,  staffName varchar(50),  staffIC varchar(15),  staffGender char(1),  staffDOB date,  staffAddress varchar(255),  handphone varchar(11),  phone varchar(10),  email varchar(50),  positionID varchar(15),  staffStatus char(1),  creationDateTime datetime,  staffPic mediumtext,  PRIMARY KEY (staffID),  foreign key (positionID) references tblPosition(positionID))",
        "CREATE TABLE tblTruck (  truckID varchar(15),  transporter varchar(15),  truckTon int(11),  truckNum varchar(10),  truckExpiryStatus date,  truckStatus char(1),  creationDateTime datetime,  PRIMARY KEY (truckID))",
        "CREATE TABLE tblDBD (  dbdID int auto_increment,  creationDateTime datetime,  status char(1),  PRIMARY KEY (dbdID))",
        "CREATE TABLE tblDBDEntry (  idNo int auto_increment,  dbdID int,  serialNo int,  reportedBy varchar(15),  damageType varchar(15),  reason mediumtext,  repair char(1),  replacement char(1),  costCharged varchar(5),  status char(1),  rectifiedDate datetime,  PRIMARY KEY (idNo),  foreign KEY  (dbdID) references tblDBD(dbdID),  foreign KEY  (serialNo) references tblBins(serialNo),  foreign KEY  (reportedBy) references tblStaff(staffID))",
        "CREATE TABLE tblAcr (  acrID varchar(15),  serialNo int,  acrSticker varchar(10),  customerID int,  acrPeriod date,  acrStatus char(1),  creationDateTime datetime,  PRIMARY KEY (acrID),  foreign key (serialNo) references tblBins(serialNo),  foreign key (customerID) references tblCustomer(customerID))",
        "CREATE TABLE tblArea (  areaID varchar(15),  zoneID varchar(15),  staffID varchar(15),  areaName varchar(30),  collection_frequency varchar(30),  longitude double(10,7),  latitude double(10,7),  areaStatus char(1),  creationDateTime datetime,  PRIMARY KEY (areaID),  foreign key (zoneID) references tblZone(zoneID),  foreign key (staffID) references tblStaff(staffID))",
        "CREATE TABLE tblBDAF (  bdafID int auto_increment,  creationDateTime datetime,  status char(1),  PRIMARY KEY (bdafID));",
        "CREATE TABLE tblBDAFentry (  idNo int auto_increment,  bdafID int,  customerID int,  acrID varchar(15),  serialNo int,  binDelivered int,  binPulled int,  jobDesc longtext,  remarks longtext,  completed boolean,  PRIMARY KEY (idNo),  foreign key (customerID) references tblCustomer(customerID),  foreign key (acrID) references tblAcr(acrID),  foreign key (bdafID) references tblBDAF(bdafID),  foreign key (serialNo) references tblBins(serialNo),  foreign key (binDelivered) references tblBins(serialNo),  foreign key (binPulled) references tblBins(serialNo))",
        "CREATE TABLE tblDCS (  dcsID int auto_increment,  creationDateTime datetime,  status char(1),  PRIMARY KEY (dcsID))",
        "CREATE TABLE tblDCSentry (  idNo int auto_increment,  dcsID int,  acrID varchar(15),  customerID int,  areaID varchar(15),  driverID varchar(15),  beBins int,  acrBins int,  mon boolean,  tue boolean,  wed boolean,  thurs boolean,  fri boolean,  sat boolean,  remarks longtext,  PRIMARY KEY (idNo),  foreign key (acrID) references tblAcr(acrID),  foreign key (customerID) references tblCustomer(customerID),  foreign key (areaID) references tblArea(areaID),  foreign key (dcsID) references tblDCS(dcsID),  foreign key (driverID) references tblStaff(staffID))",
        "CREATE TABLE area_collection (  acID int auto_increment,  areaID varchar(15),  areaAddress mediumtext,  longitude double(10,7),  latitude double(10,7),  areaCollStatus char(1),  PRIMARY KEY (acID),  foreign key (areaID) references tblArea(areaID))",
        "CREATE TABLE tblWheelBinDatabase (  idNo int auto_increment,  date datetime,  customerID int,  areaID varchar(15),  serialNo int,  acrID varchar(15),  activeStatus char(1),  PRIMARY KEY (idNo),  foreign key (customerID) references tblCustomer(customerID),  foreign key (areaID) references tblArea(areaID),  foreign key (serialNo) references tblBins(serialNo),  foreign key (acrID) references tblAcr(acrID))",
        "CREATE TABLE tblUserActions (  date datetime,  staffID varchar(15),  action varchar(20),  onObject varchar(20),  PRIMARY KEY (date, staffID),  foreign key (staffID) references tblStaff(staffID))",
        "CREATE TABLE tblAccess (  positionID varchar(15),  mgmtID int,  status char(1),  primary key (positionID, mgmtID),  foreign key (positionID) references tblPosition(positionID),  foreign key (mgmtID) references tblManagement(mgmtID))",
        "CREATE TABLE tblReport (  reportID VARCHAR(15),  areaID VARCHAR(15),  reportCollectionDate date,  creationDateTime datetime,  operationTimeStart time,  operationTimeEnd time,  garbageAmount int,  iFleetMap mediumtext,  readStatus char(1),  completionStatus char(1),  truckID varchar(15),  driverID varchar(15),  zoom double(2,2),  remark text,  PRIMARY KEY (reportID),  foreign key (areaID) references tblArea(areaID),  foreign key (truckID) references tblTruck(truckID),  foreign key (driverID) references tblStaff(staffID))",
        "CREATE TABLE tblMapCircle (  circleID int auto_increment,  radius varchar(50),  cLong double(10,7),  cLat double(10,7),  reportID varchar(15),  primary key (circleID),  foreign key (reportID) references tblReport(reportID))",
        "CREATE TABLE tblMapRect (  rectID int auto_increment,  neLat double(10,7),  neLng double(10,7),  swLat double(10,7),  swLng double(10,7),  reportID varchar(15),  primary key (rectID),  foreign key (reportID) references tblReport(reportID))",
        "CREATE TABLE tblAcrFreq (  acrID varchar(15),  areaID varchar(15),  day varchar(30),  primary key (acrID, areaID, day),  foreign key(acrID) references tblAcr(acrID),  foreign key(areaID) references tblArea(areaID))",
        "CREATE TABLE tblBinCenter (  binCenterID varchar(15),  areaID varchar(15),  binCenterName varchar(100),  binCenterLocation varchar(100),  binCenterStatus char(1),  creationDateTime datetime,  PRIMARY KEY (binCenterID),  foreign key (areaID) references tblArea(areaID))",
        "CREATE TABLE tblLostBinRecord (  idNo int auto_increment,  customerID int,  serialNo int,  noOfBins int,  sharedBin boolean,  areaID varchar(15),  lossDate datetime,  reasons longtext,  PRIMARY KEY (idNo),  foreign key (customerID) references tblCustomer(customerID),  foreign key (areaID) references tblArea(areaID),  foreign key (serialNo) references tblBins(serialNo))",
        "CREATE TABLE tblTag (  date datetime,  serialNo int,  truckID varchar(15),  longitude double(10,7),  latitude double(10,7),  PRIMARY KEY (date, serialNo),  foreign key (truckID) references tblTruck(truckID))", "create table tblComplaintType ( complaintType int auto_increment,    complaint varchar(15), primary key (complaintType))", " create table tblComplaint ( complaintID int auto_increment, customerID int, date datetime, complaintType int, complaintTitle mediumtext, complaintContent longtext, primary key (complaintID), foreign key (customerID) references tblCustomer(customerID), foreign key (complaintType) references tblComplaintType(complaintType))"
    ];
    
    for (i = 0; i < sqls.length; i += 1) {
        database.query(sqls[i], function (err, result) {
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
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view acr')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view database')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit database')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create database')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view inventory')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit inventory')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view authorization')"
    ], i;
    
    for (i = 0; i < sqls.length; i += 1) {
        database.query(sqls[i], function (err, result) {
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
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        makeID("account", formatted);
        setTimeout(function () {
            var thePassword = bcrypt.hashSync('adminacc123', 10);
            var sql = "INSERT INTO tblstaff (staffID, username, password, positionID, creationDateTime, staffStatus) VALUE ('" + obj.ID + "', 'trienekens@admin.com', '" + thePassword + "', '" + roleID + "', '" + formatted + "', 'A')";
            database.query(sql, function (err, result) {
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
                    database.query(sqls[j], function (err, result) {
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

//------------------------------------------------------------------------------------------
// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function(comparer) { 
    for(var i = 0; i < this.length; i++) { 
        if(comparer(this[i])) return true; 
    }
    return false; 
};

// adds an element to the array if it does not already exist using a comparer 
// function
Array.prototype.pushIfNotExist = function(element, comparer) { 
    if (!this.inArray(comparer)) {
        this.push(element);
    } else {
        for (var i = 0; i < this.length; i++) {
            if (this[i].user == element.user) {
                this[i].socketID = element.socketID;
            }
        }
    }
};
//------------------------------------------------------------------------------------------

var roomManager = "manager";

io.sockets.on('connection', function(socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);
    
    // Disconnect
    socket.on('disconnect', function(data) {
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });
    
    socket.on('socketID', function (data) {
        connectedUserList.pushIfNotExist(data, function(e) { 
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
            if (result[0].avatar == "") {
                result[0].avatar = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";
            }
            io.sockets.in(roomManager).emit('receive report notification', {
                id: data.reportID,
                name: result[0].name,
                avatar: result[0].avatar
            });
        });
    });
    
    
    //Send Message
    socket.on('send message', function(data) {
        io.sockets.emit('new message', {
            msg: data,
            user: socket.username
        });
    });
    
    //Create New User
    socket.on('create new user', function(data) {
        socket.broadcast.emit('append user list', {
            id: data.id,
            name: data.name,
            username: data.username,
            position: data.position.name,
            status: 'ACTIVE'
        });
    });
    
    // New User
    socket.on('new user', function(data, callback) {
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