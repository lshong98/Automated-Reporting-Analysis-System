var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var dateTime = require('node-datetime');
var EventEmitter = require('events');
var emitter = new EventEmitter();

var DB_HOST = 'localhost';
var DB_USER = 'root';
var DB_PASS = '';
var DB_NAME = 'trienekens02';

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

/* Emitter Registered */
// Create Database Tables
emitter.on('createTable', function () {
    'use strict';
    var sqls, i;
    
    sqls = [
        "CREATE TABLE tblposition (positionID varchar(15),  positionName varchar(30),  positionStatus char(1),  creationDateTime datetime,  primary key (positionID))",
        "CREATE TABLE tblzone (zoneID varchar(15),  zoneName varchar(100), zoneStatus char(1),  creationDateTime datetime,  PRIMARY KEY (zoneID))",
        "CREATE TABLE tblstaff (  staffID varchar(15),  username varchar(20),  password mediumtext,  staffName varchar(50),  staffIC varchar(15),  staffGender char(1),  staffDOB date,  staffAddress varchar(255),  handphone varchar(11),  phone varchar(10),  email varchar(50),  positionID varchar(15),  staffStatus char(1),  creationDateTime datetime,  staffPic mediumtext,  PRIMARY KEY (staffID),  foreign key (positionID) references tblposition(positionID))",
        "CREATE TABLE tblarea (  areaID varchar(15),  zoneID varchar(15),  staffID varchar(15),  areaName varchar(30),  collection_frequency varchar(30),  longitude double(10,7),  latitude double(10,7),  areaStatus char(1),  creationDateTime datetime,  PRIMARY KEY (areaID),  foreign key (zoneID) references tblzone(zoneID),  foreign key (staffID) references tblstaff(staffID))",
        "CREATE TABLE tbltaman (tamanID int auto_increment,areaID varchar(15),tamanName varchar(30),PRIMARY KEY (tamanID),foreign key (areaID) references tblarea(areaID))",
        "CREATE TABLE tblcustomer (customerID int auto_increment, tamanID int , username varchar(30),  password varchar(30),  contactNumber int, ic varchar(20), tradingLicense varchar(20),  name varchar(50),  houseNo varchar(5),  streetNo varchar(20),  postCode int,  city varchar(20),  status char(1),  creationDateTime datetime, PRIMARY KEY (customerID),foreign key (tamanID) references tbltaman(tamanID))",
        "CREATE TABLE tblbins (serialNo int,  customerID int,  size int,  status char(1),  longitude double(10,7),  latitude double(10,7), PRIMARY KEY (serialNo),  foreign key (customerID) references tblcustomer(customerID))",
        "CREATE TABLE tblmanagement (mgmtID int auto_increment,  mgmtName varchar(50),  PRIMARY KEY (mgmtID))",
        "CREATE TABLE tblbininventory (date date,  doNo varchar(10), inNew120 int, inNew240 int, inNew660 int, inNew1000 int, outNew120 int, outNew240 int, outNew660 int, outNew1000 int, inReusable120 int, inReusable240 int, inReusable660 int,  inReusable1000 int, outReusable120 int, outReusable240 int, outReusable660 int, outReusable1000 int, newBalance120 int, newBalance240 int, newBalance660 int, newBalance1000 int, reusableBalance120 int, reusableBalance240 int, reusableBalance660 int, reusableBalance1000 int, overallBalance120 int, overallBalance240 int, overallBalance660 int, overallBalance1000 int, PRIMARY KEY (date))",
        "CREATE TABLE tbltruck (  truckID varchar(15),  transporter varchar(15),  truckTon int(11),  truckNum varchar(10),  truckExpiryStatus date,  truckStatus char(1),  creationDateTime datetime,  PRIMARY KEY (truckID))",
        "CREATE TABLE tbldbd (  dbdID int auto_increment,  creationDateTime datetime,  status char(1),  PRIMARY KEY (dbdID))",
        "CREATE TABLE tbldbdentry (  idNo int auto_increment,  dbdID int,  serialNo int,  reportedBy varchar(15),  damageType varchar(15),  reason mediumtext,  repair char(1),  replacement char(1),  costCharged varchar(5),  status char(1),  rectifiedDate datetime,  PRIMARY KEY (idNo),  foreign KEY  (dbdID) references tbldbd(dbdID),  foreign KEY  (serialNo) references tblbins(serialNo),  foreign KEY  (reportedBy) references tblstaff(staffID))",
        "CREATE TABLE tblacr (  acrID varchar(15),  serialNo int,  acrSticker varchar(10),  customerID int,  acrPeriod date,  acrStatus char(1),  creationDateTime datetime,  PRIMARY KEY (acrID),  foreign key (serialNo) references tblbins(serialNo),  foreign key (customerID) references tblcustomer(customerID))",
        "CREATE TABLE tblbdaf (  bdafID int auto_increment,  creationDateTime datetime,  status char(1),  PRIMARY KEY (bdafID))",
        "CREATE TABLE tblbdafentry (  idNo int auto_increment,  bdafID int,  customerID int,  acrID varchar(15),  serialNo int,  binDelivered int,  binPulled int,  jobDesc longtext,  remarks longtext,  completed boolean,  PRIMARY KEY (idNo),  foreign key (customerID) references tblcustomer(customerID),  foreign key (acrID) references tblacr(acrID),  foreign key (bdafID) references tblbdaf(bdafID),  foreign key (serialNo) references tblbins(serialNo),  foreign key (binDelivered) references tblbins(serialNo),  foreign key (binPulled) references tblbins(serialNo))",
        "CREATE TABLE tbldcs (  dcsID VARCHAR(15),  creationDateTime datetime,  status varchar(25), driver varchar(50), periodFrom date, periodTo date, replacementDriver varchar(50), replacementPeriodFrom date, replacementPeriodTo date, PRIMARY KEY (dcsID))",
        "CREATE TABLE tbldcsentry (  idNo int auto_increment,  dcsID VARCHAR(15),  acrID varchar(15),  customerID int,  areaID varchar(15),  beBins int,  acrBins int,  mon boolean,  tue boolean,  wed boolean,  thurs boolean,  fri boolean,  sat boolean,  remarks longtext,  PRIMARY KEY (idNo),  foreign key (acrID) references tblacr(acrID),  foreign key (customerID) references tblcustomer(customerID),  foreign key (areaID) references tblarea(areaID),  foreign key (dcsID) references tbldcs(dcsID))",
        "CREATE TABLE area_collection (  acID int auto_increment,  areaID varchar(15),  areaAddress mediumtext,  longitude double(10,7),  latitude double(10,7),  areaCollStatus char(1),  PRIMARY KEY (acID),  foreign key (areaID) references tblarea(areaID))",
        "CREATE TABLE tblwheelbindatabase (  idNo int auto_increment,  date datetime,  customerID int,  areaID varchar(15),  serialNo int,  acrID varchar(15),  activeStatus char(1),  PRIMARY KEY (idNo),  foreign key (customerID) references tblcustomer(customerID),  foreign key (areaID) references tblarea(areaID),  foreign key (serialNo) references tblbins(serialNo),  foreign key (acrID) references tblacr(acrID))",
        "CREATE TABLE tbluseractions (  date datetime,  staffID varchar(15),  action varchar(20),  onObject varchar(20),  PRIMARY KEY (date, staffID),  foreign key (staffID) references tblstaff(staffID))",
        "CREATE TABLE tblaccess (  positionID varchar(15),  mgmtID int,  status char(1),  primary key (positionID, mgmtID),  foreign key (positionID) references tblposition(positionID),  foreign key (mgmtID) references tblmanagement(mgmtID))",
        "CREATE TABLE tblreport (  reportID VARCHAR(15),  areaID VARCHAR(15),  reportCollectionDate date,  creationDateTime datetime,  operationTimeStart time,  operationTimeEnd time,  garbageAmount int,  iFleetMap mediumtext,  readStatus char(1),  completionStatus char(1),  truckID varchar(15),  driverID varchar(15),  zoom double(2,2),  remark text,  PRIMARY KEY (reportID),  foreign key (areaID) references tblarea(areaID),  foreign key (truckID) references tbltruck(truckID),  foreign key (driverID) references tblstaff(staffID))",
        "CREATE TABLE tblmapcircle (  circleID int auto_increment,  radius varchar(50),  cLong double(10,7),  cLat double(10,7),  reportID varchar(15),  primary key (circleID),  foreign key (reportID) references tblreport(reportID))",
        "CREATE TABLE tblmaprect (  rectID int auto_increment,  neLat double(10,7),  neLng double(10,7),  swLat double(10,7),  swLng double(10,7),  reportID varchar(15),  primary key (rectID),  foreign key (reportID) references tblreport(reportID))",
        "CREATE TABLE tblacrfreq (  acrID varchar(15),  areaID varchar(15),  day varchar(30),  primary key (acrID, areaID, day),  foreign key(acrID) references tblacr(acrID),  foreign key(areaID) references tblarea(areaID))",
        "CREATE TABLE tblbincenter (  binCenterID varchar(15),  areaID varchar(15),  binCenterName varchar(100),  binCenterLocation varchar(100),  binCenterStatus char(1),  creationDateTime datetime,  PRIMARY KEY (binCenterID),  foreign key (areaID) references tblarea(areaID))",
        "CREATE TABLE tbllostbinrecord (  idNo int auto_increment,  customerID int,  serialNo int,  noOfBins int,  sharedBin boolean,  areaID varchar(15),  lossDate datetime,  reasons longtext,  PRIMARY KEY (idNo),  foreign key (customerID) references tblcustomer(customerID),  foreign key (areaID) references tblarea(areaID),  foreign key (serialNo) references tblbins(serialNo))",
        "CREATE TABLE tbltag (  date datetime,  serialNo int,  truckID varchar(15),  longitude double(10,7),  latitude double(10,7),  PRIMARY KEY (date, serialNo),  foreign key (truckID) references tbltruck(truckID))",
        "CREATE TABLE tblcomplainttype ( complaintType int auto_increment, complaint varchar(15), primary key (complaintType))",
        "CREATE TABLE tblcomplaint ( complaintID int auto_increment, customerID int, date datetime, complaintType int, complaintTitle mediumtext, complaintContent longtext, status char(1), primary key (complaintID), foreign key (customerID) references tblcustomer(customerID), foreign key (complaintType) references tblcomplainttype(complaintType))",
        "CREATE TABLE tbllog (transactionID int auto_increment, date datetime, staffID varchar(15), authorizedBy varchar(15), action varchar(15), description mediumtext, rowID varchar(15), tblName varchar(50), primary key (transactionID), foreign key (staffID) references tblstaff(staffID), foreign key (authorizedBy) references tblstaff(staffID))",
        "CREATE TABLE tblauthorization (taskID int auto_increment, date datetime, staffID varchar(15),action varchar(20),description mediumtext, rowID varchar(15),query mediumtext,authorize varchar(1),authorizedBy varchar(15), tblName varchar(50), PRIMARY KEY (taskID),foreign KEY (staffID) references tblstaff(staffID),foreign key (authorizedBy) references tblstaff(staffID))",
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
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view role')",
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
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view authorization')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view complaintlist')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view transactionLog')"
    ], i;
    
    for (i = 0; i < sqls.length; i += 1) {
        db.query(sqls[i], function (err, result) {
            if (err) {
                throw err;
            }
        });
    }
    
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    var roleFormat = dt.format('Ymd');
    
    var roleID = "ATH" + roleFormat + "0001";
    var staffID = "ACC" + roleFormat + "0001";
    
    var sql = "INSERT INTO tblposition (positionID, positionName, creationDateTime, positionStatus) VALUE ('" + roleID + "', 'ADMINISTRATOR', '" + formatted + "', 'A')";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        var thePassword = bcrypt.hashSync('adminacc123', 10);
        var sql = "INSERT INTO tblstaff (staffID, username, password, positionID, creationDateTime, staffStatus) VALUE ('" + staffID + "', 'trienekens@admin.com', '" + thePassword + "', '" + roleID + "', '" + formatted + "', 'A')";
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
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '23', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '24', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '25', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '26', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '27', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '28', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '29', 'A')"
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
    });
}); // Complete
/* Emitter Registered */

module.exports = db;