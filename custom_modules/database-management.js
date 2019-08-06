var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var dateTime = require('node-datetime');
var EventEmitter = require('events');
var emitter = new EventEmitter();

// Cloud database access
// var DB_HOST = '35.240.160.118';
// var DB_USER = 'root';
// var DB_PASS = 'root';
// var DB_NAME = 'trienekens_test';

// Local database access
var DB_HOST = 'localhost';
var DB_USER = 'root';
var DB_PASS = '';
var DB_NAME = 'triemerge';

// // Config used for socket connection, important for Google Cloud hosting
// var config = {
//     user: DB_USER,
//     password: DB_PASS,
//     host: DB_HOST
// }

// if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
//     config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
// }
 
// // Create connection 
var db = mysql.createConnection({ 
   host: DB_HOST,
   user: DB_USER,  
   password: DB_PASS
});

 var db = mysql.createConnection(config);


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
                    //emitter.emit('dummyData');
                    //emitter.emit('eventScheduler');
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
        "CREATE TABLE tbltaman (  tamanID int auto_increment,  areaID varchar(15),  tamanName mediumtext,  longitude double(10,7),  latitude double(10,7),  areaCollStatus char(1),  PRIMARY KEY (tamanID),  foreign key (areaID) references tblarea(areaID))",
        "CREATE TABLE tblcustomer (customerID VARCHAR(15), tamanID int , username varchar(30),  password varchar(30),  contactNumber int, ic varchar(20), tradingLicense varchar(20),  name varchar(50), companyName varchar(50),  houseNo varchar(5),  streetNo varchar(20),  postCode int,  city varchar(20),  status char(1),  creationDateTime datetime, PRIMARY KEY (customerID),foreign key (tamanID) references tbltaman(tamanID))",
        "CREATE TABLE tblbins (serialNo varchar(15),size int,  status char(1),  longitude double(10,7),  latitude double(10,7), PRIMARY KEY (serialNo))", 
        "CREATE TABLE tblmanagement (mgmtID int auto_increment,  mgmtName varchar(50),  PRIMARY KEY (mgmtID))",
        "CREATE TABLE tblbininventory (date date,  doNo varchar(10), inNew120 int, inNew240 int, inNew660 int, inNew1000 int, outNew120 int, outNew240 int, outNew660 int, outNew1000 int, inReusable120 int, inReusable240 int, inReusable660 int,  inReusable1000 int, outReusable120 int, outReusable240 int, outReusable660 int, outReusable1000 int, newBalance120 int, newBalance240 int, newBalance660 int, newBalance1000 int, reusableBalance120 int, reusableBalance240 int, reusableBalance660 int, reusableBalance1000 int, overallBalance120 int, overallBalance240 int, overallBalance660 int, overallBalance1000 int, PRIMARY KEY (date))",
        "CREATE TABLE tbltruck (  truckID varchar(15),  transporter varchar(15),  truckTon int(11),  truckNum varchar(10),  truckExpiryStatus date,  truckStatus char(1),  creationDateTime datetime,  PRIMARY KEY (truckID))",
        "CREATE TABLE tbldbd (  dbdID int auto_increment,  creationDateTime datetime,  status char(1),  PRIMARY KEY (dbdID))",
        "CREATE TABLE tbldbdentry (  idNo int auto_increment,  dbdID int,  serialNo varchar(15),  reportedBy varchar(15),  damageType varchar(15),  reason mediumtext,  repair char(1),  replacement char(1),  costCharged varchar(5),  status char(1),  rectifiedDate datetime,  PRIMARY KEY (idNo),  foreign KEY  (dbdID) references tbldbd(dbdID),  foreign KEY  (serialNo) references tblbins(serialNo),  foreign KEY  (reportedBy) references tblstaff(staffID))",
        "CREATE TABLE tblblost (  blostID varchar(15),  creationDateTime datetime, preparedBy varchar(15), authorizedBy varchar(15), authorizedDate dateTime,  status char(1),  formStatus char(1), PRIMARY KEY (blostID), foreign key (preparedBy) references tblstaff (staffID), foreign key (authorizedBy) references tblstaff (staffID))",
        "CREATE TABLE tblblostentry (  idNo int auto_increment,  creationDateTime datetime, blostID varchar(15),  customerID varchar(15), serialNo varchar(15),  sharedBin boolean,  dateOfLoss datetime,  reason longtext,  status char(1), PRIMARY KEY (idNo),  foreign KEY  (blostID) references tblblost(blostID),  foreign KEY  (serialNo) references tblbins(serialNo),  foreign KEY  (customerID) references tblcustomer(customerID))",
        "CREATE TABLE tbldcs (dcsID varchar(15),creationDateTime datetime,status char(1), formStatus char(1), periodFrom date,periodTo date,driverID varchar(15),replacementDriverID varchar(15),replacementPeriodFrom date,replacementPeriodTo date,authorizedBy varchar(15),authorizedDate datetime,preparedBy varchar(15),PRIMARY KEY (dcsID),foreign key (driverID) references tblstaff(staffID),foreign key (replacementDriverID) references tblstaff(staffID),foreign key (authorizedBy) references tblstaff(staffID),foreign key (preparedBy) references tblstaff(staffID))",
        "CREATE TABLE tblacr (acrID varchar(15),creationDateTime datetime,dcsID varchar(15),areaID varchar(15),customerID VARCHAR(15),beBins int,acrBins int,mon boolean,tue boolean,wed boolean,thu boolean,fri boolean,sat boolean,remarks longtext,PRIMARY KEY (acrID),foreign key (dcsID) references tbldcs(dcsID),foreign key (customerID) references tblcustomer(customerID))",
        "CREATE TABLE tblbdaf (  bdafID varchar(15),  creationDateTime datetime,  driverID varchar(15), staffID varchar(15), authorizedBy varchar(15), authorizedDate dateTime, status char(1), formStatus char(1), PRIMARY KEY (bdafID), foreign key (driverID) references tblstaff(staffID), foreign key (staffID) references tblstaff(staffID), foreign key (authorizedBy) references tblstaff(staffID))",
        "CREATE TABLE tblbdafentry (  idNo int auto_increment,  bdafID varchar(15),  customerID VARCHAR(15),  acrID varchar(15), acrSticker varchar(20),  serialNo varchar(15),  binDelivered varchar(15),  binPulled varchar(15),  jobDesc longtext,  remarks longtext,  completed boolean,  PRIMARY KEY (idNo),  foreign key (customerID) references tblcustomer(customerID),  foreign key (acrID) references tblacr(acrID),  foreign key (bdafID) references tblbdaf(bdafID),  foreign key (serialNo) references tblbins(serialNo),  foreign key (binDelivered) references tblbins(serialNo),  foreign key (binPulled) references tblbins(serialNo))",
        "CREATE TABLE tblwheelbindatabase (  idNo int auto_increment,  date datetime,  customerID VARCHAR(15),  areaID varchar(15),  serialNo varchar(15),  acrID varchar(15),  activeStatus char(1), rcDwell varchar(20), comment mediumtext, itemType varchar(20), path varchar(20),PRIMARY KEY (idNo),  foreign key (customerID) references tblcustomer(customerID),  foreign key (areaID) references tblarea(areaID),  foreign key (serialNo) references tblbins(serialNo),  foreign key (acrID) references tblacr(acrID))",
        "CREATE TABLE tbluseractions (  date datetime,  staffID varchar(15),  action varchar(20),  onObject varchar(20),  PRIMARY KEY (date, staffID),  foreign key (staffID) references tblstaff(staffID))",
        "CREATE TABLE tblaccess (  positionID varchar(15),  mgmtID int,  status char(1),  primary key (positionID, mgmtID),  foreign key (positionID) references tblposition(positionID),  foreign key (mgmtID) references tblmanagement(mgmtID))",
        "CREATE TABLE tblreport (  reportID VARCHAR(15),  areaID VARCHAR(15),  reportCollectionDate date,  creationDateTime datetime,  operationTimeStart time,  operationTimeEnd time,  garbageAmount int,  iFleetMap mediumtext,  readStatus char(1),  completionStatus char(1),  truckID varchar(15),  driverID varchar(15),  zoom double(2,2),  remark text,  PRIMARY KEY (reportID),  foreign key (areaID) references tblarea(areaID),  foreign key (truckID) references tbltruck(truckID),  foreign key (driverID) references tblstaff(staffID))",
        "CREATE TABLE tblmapcircle (  circleID int auto_increment,  radius varchar(50),  cLong double(10,7),  cLat double(10,7),  reportID varchar(15),  primary key (circleID),  foreign key (reportID) references tblreport(reportID))",
        "CREATE TABLE tblmaprect (  rectID int auto_increment,  neLat double(10,7),  neLng double(10,7),  swLat double(10,7),  swLng double(10,7),  reportID varchar(15),  primary key (rectID),  foreign key (reportID) references tblreport(reportID))",
        "CREATE TABLE tblacrfreq (  acrID varchar(15),  areaID varchar(15),  day varchar(30),  primary key (acrID, areaID, day),  foreign key(acrID) references tblacr(acrID),  foreign key(areaID) references tblarea(areaID))",
        "CREATE TABLE tblbincenter (  binCenterID varchar(15),  areaID varchar(15),  binCenterName varchar(100),  binCenterLocation varchar(100),  binCenterStatus char(1),  creationDateTime datetime,  PRIMARY KEY (binCenterID),  foreign key (areaID) references tblarea(areaID))",
        "CREATE TABLE tbllostbinrecord (  idNo int auto_increment,  customerID VARCHAR(15),  serialNo varchar(15),  noOfBins int,  sharedBin boolean,  areaID varchar(15),  lossDate datetime,  reasons longtext,  PRIMARY KEY (idNo),  foreign key (customerID) references tblcustomer(customerID),  foreign key (areaID) references tblarea(areaID),  foreign key (serialNo) references tblbins(serialNo))",
        "CREATE TABLE tbltag (date datetime,  serialNo VARCHAR(15),  truckID varchar(15),  longitude double(10,7),  latitude double(10,7),  PRIMARY KEY (date, serialNo),  foreign key (truckID) references tbltruck(truckID))",
        "CREATE TABLE tblcomplainttype ( complaintType int auto_increment, complaint varchar(15), primary key (complaintType))",
        "CREATE TABLE tblcomplaint ( complaintID int auto_increment, customerID VARCHAR(15), date datetime, complaintType int, complaintTitle mediumtext, complaintContent longtext, status char(1), primary key (complaintID), foreign key (customerID) references tblcustomer(customerID), foreign key (complaintType) references tblcomplainttype(complaintType))",
        "CREATE TABLE tbllog (transactionID int auto_increment, date datetime, staffID varchar(15), authorizedBy varchar(15), action varchar(15), description mediumtext, rowID varchar(15), tblName varchar(50), primary key (transactionID), foreign key (staffID) references tblstaff(staffID), foreign key (authorizedBy) references tblstaff(staffID))",
        "CREATE TABLE tblauthorization (taskID int auto_increment, date datetime, staffID varchar(15),action varchar(20),description mediumtext, rowID varchar(15),query mediumtext,authorize varchar(1),authorizedBy varchar(15), tblName varchar(50), PRIMARY KEY (taskID),foreign KEY (staffID) references tblstaff(staffID),foreign key (authorizedBy) references tblstaff(staffID))",
        "CREATE TABLE tblformauthorization (formentryID int auto_increment, creationDateTime dateTime, formID varchar(15), formType varchar(15), tblname varchar(50), preparedBy varchar(15), status char(1), PRIMARY KEY (formentryID), foreign KEY (preparedBy) references tblstaff(staffID))",
        "CREATE TABLE tblchat (chatID VARCHAR(15) PRIMARY KEY, sender VARCHAR(15), recipient VARCHAR(15), content MEDIUMTEXT, complaintID INT, creationDateTime DATETIME, status CHAR(1), FOREIGN KEY(complaintID) REFERENCES tblcomplaint(complaintID))"
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
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view formAuthorization')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view complaintlist')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view transactionLog')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view reporting')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit reporting')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create reporting')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('export reporting')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create dcsDetails')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit dcsDetails')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view dcsDetails')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create delivery')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit delivery')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view delivery')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create bdafDetails')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit bdafDetails')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view bdafDetails')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create damagedlost')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit damagedlost')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view damagedlost')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create dbdDetails')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit dbdDetails')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view dbdDetails')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('create blostDetails')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('edit blostDetails')",
        "INSERT INTO tblmanagement (mgmtName) VALUE ('view blostDetails')"
        
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
    
    var sql = "INSERT INTO tblposition (positionID, positionName, creationDateTime, positionStatus) VALUES ('" + roleID + "', 'ADMINISTRATOR', '" + formatted + "', 'A')";
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        } else {
        var thePassword = bcrypt.hashSync('adminacc123', 10);
        var sql = "INSERT INTO tblstaff (staffID, username, password, positionID, creationDateTime, staffStatus) VALUES ('" + staffID + "', 'trienekens@admin.com', '" + thePassword + "', '" + roleID + "', '" + formatted + "', 'A')";
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
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '29', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '30', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '31', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '32', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '33', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '34', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '35', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '36', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '37', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '38', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '39', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '40', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '41', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '42', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '43', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '44', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '45', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '46', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '47', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '48', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '49', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '50', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '51', 'A')",
                "INSERT INTO tblaccess (positionID, mgmtID, status) VALUE ('" + roleID + "', '52', 'A')",
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
        }
    });
}); // Complete
/* Emitter Registered */

/* Emitter Registered */
// Insert Dummy Data 
emitter.on('dummyData', function () {
    'use strict';
    var sqls, i;
     
    sqls = [ 
        "insert into tblzone values('a001','Zone number 1','a',current_timestamp())",
        "insert into tblposition values('200','tempBoss','a',current_timestamp())",
        "insert into tblposition values('DRV','Driver','a',current_timestamp())",
        "insert into tblposition values('GWK','General Worker','a',current_timestamp())",
        "INSERT INTO tblposition VALUE ('a001', 'ADMINISTRATOR', 'A',current_timestamp())",
        "insert into tblstaff values('a001','user1','user123','Jackson','ic123456','m','1999/12/12','123 Abc drive, Taman BDC','012345678','12345676','email@email.com','200','a',current_timestamp(),'this is an image')",
        "insert into tblstaff values('a002','user1','user123','Roy','ic293024','m','1999/12/12','123 Abc drive, Taman BDC','012345678','12345676','email@email.com','DRV','a',current_timestamp(),'this is an image')",
        "insert into tblstaff values('a003','user1','user123','Kevin','ic582045','m','1999/12/12','123 Abc drive, Taman BDC','012345678','12345676','email@email.com','DRV','a',current_timestamp(),'this is an image')",
        "insert into tblstaff values('a004','user1','user123','Alvin','ic087006','m','1999/12/12','123 Abc drive, Taman BDC','012345678','12345676','email@email.com','GWK','a',current_timestamp(),'this is an image')",
        "insert into tblstaff values('a005','user1','user123','Barry','ic152472','m','1999/12/12','123 Abc drive, Taman BDC','012345678','12345676','email@email.com','GWK','a',current_timestamp(),'this is an image')",
        "insert into tblauthorization values(null,current_timestamp(),'a001','action','page info','row info','query here',true,'a001','table name')",
        "insert into tblarea values('a001','a001','a001','area 1','seven times','44.21530','-99.70123','a',current_timestamp())",
        "insert into tbltaman values(null,'a001','taman supreme','44.21530','-99.70123','a')",
        "insert into tbltaman values(null,'a001','taman wan alwi','44.21530','-99.70123','a')",
        "insert into tblcustomer values('CUS201907190001','1','mobi','mobi123','1234567','18092830','abc123','Mubashir', 'Mobi Company','316','lorong wan alwi 1','93350','kuching','a',current_timestamp())",
        "insert into tblcustomer values('CUS201907190002','2','jake','jake123','1234567','1236989','abc123','Jake', 'Jake Company','846','lorong sekama 1','93350','kuching','a',current_timestamp())",
        "insert into tblcomplainttype values(NULL,'Household')",
        "insert into tblcomplainttype values(NULL,'Commercial')",
        "insert into tblcomplaint values(NULL, 'CUS201907190001', current_timestamp(),'1','No garbage collectiomn','Garbage truck didnt come to collect','a')",
        "insert into tblbins values('1','120','a','44.21530','-99.70123')",
        "insert into tblmanagement values(NULL,'management1')",
        "insert into tblbininventory values(current_date(),'a001','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1')",
        "insert into tbltruck values('a001','transporter','1','1234','2019/12/12','a',current_timestamp())",
        "insert into tbldbd  values(NULL,current_timestamp(),'a')",
        "insert into tbldbdentry values(NULL,'1','1','a001','destroyed','car crash','n','y','50','i','2019/12/12')",
        "insert into tbldcs values('a001',current_timestamp(),'a','a',current_date(),current_date()+interval 1 day,'a001','a001',current_date(), current_date()+interval 1 day, 'a001', current_timestamp(), 'a001')",
        //"insert into tblacr values('a001','a001','a001','1','10','10',true,true,true,true,true,true,'remarks');",
        //"insert into tblbdaf  values(NULL,current_timestamp(),'a')",
        //"insert into tblbdafentry values(NULL, '1','1','a001','1','1','1','bin was delivered','no remarks',true)",
        //"insert into tblwheelbindatabase values(NULL, current_timestamp(),'1','a001','1','a001','a','rc Dwell', 'comment', 'item type 1', 'path 1')",
        "insert into tbluseractions values(current_timestamp(),'a001','delete','tblbins')",
        "insert into tblaccess values('200','1','a')",
        "insert into tblreport values('a001','a001',current_date(),current_timestamp(),current_time(),current_time(),'10','this is a map','a','a','a001','a001','0.11','no remark')",
        "insert into tblmapcircle values('1','radius','44.21530','-99.70123','a001')",
        "insert into tblmaprect values('1','44.21530','-99.70123','44.21530','-99.70123','a001')",
        //"insert into tblacrfreq values('a001','a001',dayofweek(current_date()))",
        "insert into tblbincenter values('a001','a001','bin center 1','tabuan bin center','a',current_timestamp())",
        //"insert into tbllostbinrecord values(NULL,'1','1','1',false,'a001',current_date(),'no reason')",
        "insert into tbltag values(null, current_timestamp(),'1','a001','44.21530','-99.70123')",
    ];
    
    for (i = 0; i < sqls.length; i += 1) {
        db.query(sqls[i], function (err, result) {
            if (err) {
                throw err;
            }
        });
    }
    console.log('Dummy Data Inserted...');
}); // Complete

/* Emitter Registered */
// Insert Event scheduler 
emitter.on('eventScheduler', function () {
    'use strict';
    var sqls, i;
    
    sqls = [
        "create event updateInventory on schedule every 1 day starts concat(current_date(),' 23:59:59') do insert into tblbininventory values(current_date(),'0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0')",
        "set global event_scheduler='ON'"
    ];
    
    for (i = 0; i < sqls.length; i += 1) {
        db.query(sqls[i], function (err, result) {
            if (err) {
                throw err;
            }
        });
    }
    console.log('Event Scheduler created...');
}); // Complete

module.exports = db;