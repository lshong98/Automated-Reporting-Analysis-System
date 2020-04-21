/*jslint node:true*/
var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var dateTime = require('node-datetime');
var EventEmitter = require('events');
var emitter = new EventEmitter();

var DB_HOST = process.env.DATABASE_HOST || '';
var DB_USER = process.env.DATABASE_USER || '';
var DB_PASS = process.env.DATABASE_PASSWORD || '';
var DB_NAME = process.env.DATABASE_NAME || '';
 
var config = {
    user: DB_USER,
    password: DB_PASS,
    host: DB_HOST,
    port: 3306,
    timezone: 'UTC+08:00'
};

var db; 
if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
    config.socketPath = '/cloudsql/' + process.env.INSTANCE_CONNECTION_NAME;
} 

// Create connection 
function handleDisconnect() {
    'use strict';
    db = mysql.createConnection(config);

    // Connect
    db.connect(function (err) { 
        if (err) {
            throw err;
        }
        db.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name = "' + DB_NAME + '"', function (err, result) {
            if (result[0] === undefined) {
                db.query('CREATE DATABASE ' + DB_NAME, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    console.log('Database created...');
                    db.query('USE ' + DB_NAME, function (err, result) {
                        if (err) {
                            setTimeout(handleDisconnect, 2000);
                            console.log('error when connecting to db:', err);
                        }
                        console.log('MySQL Connected...');
                        emitter.emit('createTable');
                        emitter.emit('defaultUser');
                    });
                });
            } else {
                if (result[0].schema_name === DB_NAME) {
                    db.query('USE ' + DB_NAME, function (err, result) {
                        if (err) {
                            setTimeout(handleDisconnect, 2000);
                            console.log('error when connecting to db:', err);
                        }
                        console.log('MySQL Connected...');
                    });
                }
            }
        });
    });


    db.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                        // lost due to either server restart, or a
        } else {                                       // connnection idle timeout (the wait_timeout
            throw err;                                 // server variable configures this)
        }
    });
}
function create_table(sql) {
    'use strict';
    db.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
    });
}

handleDisconnect();

/* Emitter Registered */
// Create Database Tables
emitter.on('createTable', function () {
    'use strict';
    var sqls, i; 
      
    sqls = [
        "CREATE TABLE tblposition (positionID varchar(15),  positionName varchar(30),  positionStatus char(1),  creationDateTime datetime,  primary key (positionID))",
        "CREATE TABLE tblzone (zoneID varchar(15),  zoneCode varchar(5), zoneName varchar(100), zoneStatus char(1),  creationDateTime datetime,  PRIMARY KEY (zoneID))",
        "CREATE TABLE tblstaff (  staffID varchar(15),  username varchar(20),  password mediumtext,  staffName varchar(50),  staffIC varchar(15),  staffGender char(1),  staffDOB date,  staffAddress varchar(255),  handphone varchar(11),  phone varchar(10),  email varchar(50),  positionID varchar(15),  staffStatus char(1),  creationDateTime datetime,  staffPic mediumtext,  PRIMARY KEY (staffID),  foreign key (positionID) references tblposition(positionID))",
        "CREATE TABLE tblarea (  areaID varchar(15),  zoneID varchar(15),  staffID varchar(15), driverID varchar(15), areaName varchar(30), areaCode varchar(15), collection_frequency varchar(30),  longitude double(10,7),  latitude double(10,7),  areaStatus char(1),  creationDateTime datetime,  PRIMARY KEY (areaID),  foreign key (zoneID) references tblzone(zoneID),  foreign key (staffID) references tblstaff(staffID))",
        "CREATE TABLE tbltaman (  tamanID int auto_increment,  areaID varchar(15),  tamanName mediumtext,  longitude double(10,7),  latitude double(10,7),  areaCollStatus char(1),  PRIMARY KEY (tamanID),  foreign key (areaID) references tblarea(areaID))",
        "CREATE TABLE tblcustomer (customerID VARCHAR(15), tamanID int , userEmail varchar(30),  password varchar(30),  contactNumber int, ic varchar(20), tradingLicense varchar(20),  name varchar(50), companyName varchar(50),  houseNo varchar(5),  streetNo varchar(20),  postCode int,  city varchar(20),  State varchar(30), status char(1),  imgPath varchar(50), creationDateTime datetime, PRIMARY KEY (customerID),foreign key (tamanID) references tbltaman(tamanID))",
        "CREATE TABLE tblbins (serialNo varchar(15),size int,  status char(1),  longitude double(10,7),  latitude double(10,7), PRIMARY KEY (serialNo))",
        "CREATE TABLE tblmanagement (mgmtID int auto_increment,  mgmtName varchar(50),  PRIMARY KEY (mgmtID))",
        "CREATE TABLE tblbininventory (date date,  doNo varchar(10), inNew120 int, inNew240 int, inNew660 int, inNew1000 int, outNew120 int, outNew240 int, outNew660 int, outNew1000 int, inReusable120 int, inReusable240 int, inReusable660 int,  inReusable1000 int, outReusable120 int, outReusable240 int, outReusable660 int, outReusable1000 int, newBalance120 int, newBalance240 int, newBalance660 int, newBalance1000 int, reusableBalance120 int, reusableBalance240 int, reusableBalance660 int, reusableBalance1000 int, overallBalance120 int, overallBalance240 int, overallBalance660 int, overallBalance1000 int, PRIMARY KEY (date))",
        "CREATE TABLE tbltruck (  truckID varchar(15), staffID varchar(15), transporter varchar(15),  truckTon int(11),  truckNum varchar(10),  truckExpiryStatus date,  truckStatus char(1),  creationDateTime datetime,  PRIMARY KEY (truckID), foreign key (staffID) references tblstaff(staffID))",
        "CREATE TABLE `tbldbd` (`dbdID` varchar(15) NOT NULL,`creationDateTime` datetime DEFAULT NULL,`status` char(1) DEFAULT NULL,`periodFrom` datetime DEFAULT NULL,`periodTo` datetime DEFAULT NULL,`preparedBy` varchar(15) DEFAULT NULL,`authorizedBy` varchar(15) DEFAULT NULL,`authorizedDate` datetime DEFAULT NULL,`verifiedBy` varchar(15) DEFAULT NULL,`verifiedDate` datetime DEFAULT NULL,`feedback` mediumtext,PRIMARY KEY (`dbdID`))",
        "CREATE TABLE `tbldbdentry` (`idNo` int(11) NOT NULL AUTO_INCREMENT,`dbdID` varchar(15) DEFAULT NULL,`serialNo` varchar(15) DEFAULT NULL,`reportedBy` varchar(15) DEFAULT NULL,`damageType` varchar(15) DEFAULT NULL,`reason` mediumtext,`repair` char(1) DEFAULT NULL,`replacement` char(1) DEFAULT NULL,`costCharged` varchar(5) DEFAULT NULL,`status` char(1) DEFAULT NULL,`rectifiedDate` datetime DEFAULT NULL,PRIMARY KEY (`idNo`),KEY `dbdID` (`dbdID`),KEY `serialNo` (`serialNo`),KEY `reportedBy` (`reportedBy`),CONSTRAINT `tbldbdentry_ibfk_1` FOREIGN KEY (`dbdID`) REFERENCES `tbldbd` (`dbdID`),CONSTRAINT `tbldbdentry_ibfk_2` FOREIGN KEY (`serialNo`) REFERENCES `tblbins` (`serialNo`),CONSTRAINT `tbldbdentry_ibfk_3` FOREIGN KEY (`reportedBy`) REFERENCES `tblstaff` (`staffID`))",
        "CREATE TABLE `tblblost` (`blostID` varchar(15) NOT NULL,`creationDateTime` datetime DEFAULT NULL,`preparedBy` varchar(15) DEFAULT NULL,`authorizedBy` varchar(15) DEFAULT NULL,`authorizedDate` datetime DEFAULT NULL,`status` char(1) DEFAULT NULL,`formStatus` char(1) DEFAULT NULL,`verifiedBy` varchar(15) DEFAULT NULL,`verifiedDate` datetime DEFAULT NULL,`feedback` mediumtext,PRIMARY KEY (`blostID`),KEY `preparedBy` (`preparedBy`),KEY `authorizedBy` (`authorizedBy`),CONSTRAINT `tblblost_ibfk_1` FOREIGN KEY (`preparedBy`) REFERENCES `tblstaff` (`staffID`),CONSTRAINT `tblblost_ibfk_2` FOREIGN KEY (`authorizedBy`) REFERENCES `tblstaff` (`staffID`))",
        "CREATE TABLE tblblostentry (  idNo int auto_increment,  creationDateTime datetime, blostID varchar(15),  customerID varchar(15), serialNo varchar(15),  sharedBin boolean,  dateOfLoss datetime,  reason longtext,  status char(1), PRIMARY KEY (idNo),  foreign KEY  (blostID) references tblblost(blostID),  foreign KEY  (serialNo) references tblbins(serialNo),  foreign KEY  (customerID) references tblcustomer(customerID))",
        "CREATE TABLE tbldcs (dcsID varchar(15),creationDateTime datetime,status char(1), formStatus char(1), periodFrom date,periodTo date,driverID varchar(15), areaID mediumtext, replacementDriverID varchar(15),replacementPeriodFrom date,replacementPeriodTo date, replacementAreaID varchar(15), authorizedBy varchar(15),authorizedDate datetime,preparedBy varchar(15),PRIMARY KEY (dcsID),foreign key (driverID) references tblstaff(staffID),foreign key (replacementDriverID) references tblstaff(staffID),foreign key (authorizedBy) references tblstaff(staffID),foreign key (preparedBy) references tblstaff(staffID))",
        "CREATE TABLE `tblacr` (`acrID` varchar(15) NOT NULL,`dcsID` mediumtext,`creationDateTime` datetime DEFAULT NULL,`from` date DEFAULT NULL,`to` date DEFAULT NULL,`areaID` varchar(15) DEFAULT NULL,`userID` varchar(15) DEFAULT NULL,`beBins` varchar(50) DEFAULT NULL,`acrBins` varchar(50) DEFAULT NULL,`mon` tinyint(1) DEFAULT NULL,`tue` tinyint(1) DEFAULT NULL,`wed` tinyint(1) DEFAULT NULL,`thu` tinyint(1) DEFAULT NULL,`fri` tinyint(1) DEFAULT NULL,`sat` tinyint(1) DEFAULT NULL,`remarks` longtext,`acrfNumber` varchar(15) DEFAULT NULL,PRIMARY KEY (`acrID`),KEY `customerID` (`userID`))",
        "CREATE TABLE `tblbdaf` (`bdafID` varchar(15) NOT NULL,`creationDateTime` datetime DEFAULT NULL,`driverID` varchar(15) DEFAULT NULL,`staffID` varchar(15) DEFAULT NULL,`preparedBy` varchar(15) DEFAULT NULL,`authorizedBy` varchar(15) DEFAULT NULL,`authorizedDate` datetime DEFAULT NULL,`status` char(1) DEFAULT NULL,`formStatus` char(1) DEFAULT NULL,`verifiedBy` varchar(15) DEFAULT '',`verifiedDate` datetime DEFAULT NULL,`feedback` mediumtext,PRIMARY KEY (`bdafID`),KEY `driverID` (`driverID`),KEY `staffID` (`staffID`),KEY `authorizedBy` (`authorizedBy`),KEY `preparedBy` (`preparedBy`),KEY `tblbdaf_ibfk_2` (`verifiedBy`))",
        "CREATE TABLE tblbdafentry (  idNo int auto_increment,  bdafID varchar(15),  customerID VARCHAR(15),  acrID varchar(15), acrSticker varchar(20),  serialNo varchar(15),  binDelivered varchar(15),  binPulled varchar(15),  jobDesc longtext,  remarks longtext,  completed boolean,  PRIMARY KEY (idNo),  foreign key (customerID) references tblcustomer(customerID),  foreign key (acrID) references tblacr(acrID),  foreign key (bdafID) references tblbdaf(bdafID),  foreign key (serialNo) references tblbins(serialNo),  foreign key (binDelivered) references tblbins(serialNo),  foreign key (binPulled) references tblbins(serialNo))",
        "CREATE TABLE tblwheelbindatabase (  idNo int auto_increment,  date datetime,  customerID VARCHAR(15),  areaID varchar(15),  serialNo varchar(15),  acrID varchar(15),  activeStatus char(1), rcDwell varchar(20), comment mediumtext, itemType varchar(20), path varchar(20),PRIMARY KEY (idNo),  foreign key (customerID) references tblcustomer(customerID),  foreign key (areaID) references tblarea(areaID),  foreign key (serialNo) references tblbins(serialNo),  foreign key (acrID) references tblacr(acrID))",
        "CREATE TABLE tbluseractions (  date datetime,  staffID varchar(15),  action varchar(20),  onObject varchar(20),  PRIMARY KEY (date, staffID),  foreign key (staffID) references tblstaff(staffID))",
        "CREATE TABLE tblaccess (  positionID varchar(15),  mgmtID int,  status char(1),  primary key (positionID, mgmtID),  foreign key (positionID) references tblposition(positionID),  foreign key (mgmtID) references tblmanagement(mgmtID))",
        "CREATE TABLE tblreport (  reportID VARCHAR(15),  areaID VARCHAR(15), staffID VARCHAR(15), reportCollectionDate date,  creationDateTime datetime,  operationTimeStart time,  operationTimeEnd time,  garbageAmount int,  iFleetMap mediumtext, reportFeedback MEDIUMTEXT, readStatus char(1),  completionStatus char(1),  truckID varchar(15),  driverID varchar(15),  zoom double(2,2),  remark text,  PRIMARY KEY (reportID),  foreign key (areaID) references tblarea(areaID),  foreign key (truckID) references tbltruck(truckID),  foreign key (driverID) references tblstaff(staffID), foreign key (staffID) references tblstaff(staffID))",
        "CREATE TABLE tblmapcircle (  circleID int auto_increment,  radius varchar(50),  cLong double(10,7),  cLat double(10,7),  reportID varchar(15),  primary key (circleID),  foreign key (reportID) references tblreport(reportID))",
        "CREATE TABLE tblmaprect (  rectID int auto_increment,  neLat double(10,7),  neLng double(10,7),  swLat double(10,7),  swLng double(10,7),  reportID varchar(15),  primary key (rectID),  foreign key (reportID) references tblreport(reportID))",
        "CREATE TABLE tblbincenter (  binCenterID varchar(15),  areaID varchar(15),  binCenterName varchar(100),  binCenterLocation varchar(100),  binCenterStatus char(1),  creationDateTime datetime,  PRIMARY KEY (binCenterID),  foreign key (areaID) references tblarea(areaID))",
        "CREATE TABLE tbllostbinrecord (  idNo int auto_increment,  customerID VARCHAR(15),  serialNo varchar(15),  noOfBins int,  sharedBin boolean,  areaID varchar(15),  lossDate datetime,  reasons longtext,  PRIMARY KEY (idNo),  foreign key (customerID) references tblcustomer(customerID),  foreign key (areaID) references tblarea(areaID),  foreign key (serialNo) references tblbins(serialNo))",
        "CREATE TABLE tbltag (date datetime,  serialNo VARCHAR(15),  truckID varchar(15),  longitude double(10,7),  latitude double(10,7),  PRIMARY KEY (date, serialNo),  foreign key (truckID) references tbltruck(truckID))",
        "CREATE TABLE tbluser (userID VARCHAR(15), tamanID int , userEmail varchar(350),  password mediumtext,  contactNumber varchar(15), tradingLicense varchar(20),  name varchar(50), address varchar(200), companyName varchar(50), vCode varchar(5), status char(1), creationDateTime datetime, PRIMARY KEY (userID), UNIQUE KEY(userEmail))",
        "CREATE TABLE tblcomplaint ( complaintID varchar(25), userID VARCHAR(15), staffID varchar(15), complaintDate datetime, premiseType varchar(30), complaint mediumtext, days varchar(11) DEFAULT NULL, remarks longtext, status char(1), complaintAddress mediumtext, complaintImg mediumtext, readStat varchar(1), primary key (complaintID), foreign key (userID) references tbluser(userID), foreign key (staffID) references tblstaff(staffID))",
        "CREATE TABLE tblauthorization (taskID int auto_increment, date datetime, staffID varchar(15),action varchar(20),description mediumtext, rowID varchar(15),query mediumtext,authorize varchar(1),authorizedBy varchar(15), tblName varchar(50), PRIMARY KEY (taskID),foreign KEY (staffID) references tblstaff(staffID),foreign key (authorizedBy) references tblstaff(staffID))",
        "CREATE TABLE tblformauthorization (formentryID int auto_increment, creationDateTime dateTime, formID varchar(15), formType varchar(15), tblname varchar(50), preparedBy varchar(15), status char(1), PRIMARY KEY (formentryID), foreign KEY (preparedBy) references tblstaff(staffID))",
        "CREATE TABLE tblchat (chatID VARCHAR(15) PRIMARY KEY, sender VARCHAR(15), recipient VARCHAR(15), content MEDIUMTEXT, complaintID VARCHAR(25), creationDateTime DATETIME, status CHAR(1), readStat varchar(1), FOREIGN KEY(complaintID) REFERENCES tblcomplaint(complaintID))",
        "CREATE TABLE tblboundary (boundaryID VARCHAR(15), color CHAR(6), areaID VARCHAR(15), creationDateTime DATETIME, status CHAR(1), PRIMARY KEY(boundaryID), foreign key(areaID) references tblarea(areaID))",
        "CREATE TABLE tblboundaryplot (id INT NOT NULL AUTO_INCREMENT, boundaryID VARCHAR(15), lat DOUBLE(10, 7), lng DOUBLE(10, 7), ordering INT, status CHAR(1), PRIMARY KEY (id))",
        "CREATE TABLE tblannouncement(id int auto_increment, announcement mediumtext, announceDate date, announceLink mediumtext, target varchar(30), readStat varchar(1), PRIMARY KEY(id))",
        "CREATE TABLE tblcarouselimg(id int auto_increment, fileName varchar(255), PRIMARY KEY(id))",
        "CREATE TABLE tblnotif(notifID int auto_increment, userID varchar(15), notifDate datetime, notifText varchar(255), readStat varchar(1), PRIMARY KEY(notifID), FOREIGN KEY(userID) REFERENCES tbluser(userID))",
        "CREATE TABLE `tblbinrequest` (`reqID` int(15) NOT NULL AUTO_INCREMENT,`bdafID` varchar(15) DEFAULT '',`userID` varchar(15) NOT NULL,`dateRequest` datetime DEFAULT NULL,`name` varchar(300) DEFAULT NULL,`companyName` varchar(300) DEFAULT NULL,`companyAddress` mediumtext DEFAULT NULL,`contactNumber` varchar(12) DEFAULT NULL,`reason` varchar(20) DEFAULT NULL,`type` varchar(20) DEFAULT NULL,`requestDate` varchar(15) DEFAULT NULL,`requestAddress` mediumtext DEFAULT NULL,`remarks` varchar(300) DEFAULT NULL,`status` varchar(20) DEFAULT NULL, `rejectReason` varchar(200) DEFAULT NULL, `icImg` varchar(200) DEFAULT NULL,`utilityImg` varchar(200) DEFAULT NULL,`assessmentImg` varchar(200) DEFAULT NULL,`tradingImg` varchar(200) DEFAULT NULL,`binImg` varchar(200) DEFAULT NULL,`council` varchar(15) DEFAULT '',`acrSticker` varchar(50) DEFAULT 'NA',`acrfNumber` varchar(50) DEFAULT 'NA',`jobDesc` varchar(50) DEFAULT '',`binDelivered` mediumtext,`binPulled` mediumtext,`binSize` varchar(50) DEFAULT '',`unit` varchar(50) DEFAULT '',`beBins` varchar(15) DEFAULT NULL,`acrBins` varchar(15) DEFAULT NULL,`readStat` varchar(1) DEFAULT NULL,`policeImg` varchar(200) DEFAULT NULL,PRIMARY KEY (`reqID`))",
        "CREATE TABLE tblsatisfaction_compactor ( satisfactionCompactorID int(11) auto_increment, surveyType varchar(10), userID varchar(15), name varchar(200), location varchar(7),  companyName varchar(200), address mediumtext, number varchar(13), companyRating char(1), teamEfficiency char(1), collectionPromptness char(1), binHandling char(1), spillageControl char(1), queryResponse char(1), extraComment varchar(300), submissionDate datetime, readStat varchar(1), PRIMARY KEY(satisfactionCompactorID))",
        "CREATE TABLE tblsatisfaction_roro ( satisfactionRoroID int(11) auto_increment, surveyType varchar(10), userID varchar(15), name varchar(200), location varchar(7), companyName varchar(200), address mediumtext, number varchar(13), companyRating char(1), teamEfficiency char(1), collectionPromptness char(1), cleanliness char(1), physicalCondition char(1), queryResponse char(1), extraComment varchar(300), submissionDate datetime, readStat varchar(1), PRIMARY KEY(satisfactionRoroID))",
        "CREATE TABLE tblsatisfaction_scheduled ( satisfactionScheduledID int(11) auto_increment, userID varchar(15), name varchar(200), location varchar(7), companyName varchar(200), address mediumtext, number varchar(13), companyRating char(1), teamEfficiency char(1), healthAdherence char(1), regulationsAdherence char(1), queryResponse char(1), extraComment varchar(300), submissionDate datetime, readStat varchar(1), PRIMARY KEY(satisfactionScheduledID))",
        "CREATE TABLE tblhistory (historyID VARCHAR(15), title TINYTEXT, content MEDIUMTEXT, staffID VARCHAR(15), creationDateTime DATETIME, status CHAR(1), FOREIGN KEY(staffID) REFERENCES tblstaff(staffID), PRIMARY KEY (historyID))",
        "CREATE TABLE tblwaste (chartID int, userID varchar(15), monthYear varchar(11), waste int, PRIMARY KEY(chartID))",
        "CREATE TABLE tblenquiry (enquiryID int auto_increment, userID varchar(15), enquiry varchar(300), enqStatus varchar(30), submissionDate datetime, readStat varchar(1), PRIMARY KEY(enquiryID), FOREIGN KEY(userID) REFERENCES tbluser(userID))",
        "CREATE TABLE tblcomplaintofficer( coID varchar(15), complaintDate date,complaintTime time, sorce varchar(50), refNo varchar(100), name varchar(200), company varchar(200), telNo varchar(20), address varchar(300), under varchar(100), council varchar(100), type varchar(100), logisticsDate date, logisticsTime time, logisticsBy varchar(100), customerDate date, customerTime time, customerBy varchar(100), forwardedSub varchar(100), forwardedDate date, forwardedTime time, forwardedBy varchar(100), status varchar(50), statusDate date, statusTime time, remarks longtext, creationDateTime DATETIME, step int(1), compImg mediumText, logsImg mediumText, services varchar(3), custAction varchar(200), PRIMARY KEY (coID))",
        "CREATE TABLE `tbldbr` (`dbrID` varchar(15) NOT NULL,`creationDateTime` datetime DEFAULT NULL,`companyName` varchar(50) DEFAULT NULL,`address` mediumtext,`council` varchar(15) DEFAULT NULL,`contactPerson` varchar(50) DEFAULT NULL,`phoneNo` varchar(15) DEFAULT NULL,`comment` mediumtext,`repairBin` varchar(15) DEFAULT NULL,`replaceBin` varchar(15) DEFAULT NULL,`preparedBy` varchar(15) DEFAULT NULL,`authorizedBy` varchar(15) DEFAULT NULL,`authorizedDate` datetime DEFAULT NULL,`verifiedBy` varchar(15) DEFAULT NULL,`verifiedDate` datetime DEFAULT NULL,`rectifiedDate` datetime DEFAULT NULL,`cost` decimal(5,2) DEFAULT NULL,`status` char(1) DEFAULT NULL,`feedback` mediumtext,`remarks` mediumtext,`alternativeAction` mediumtext,PRIMARY KEY (`dbrID`))"
    ];
    
    for (i = 0; i < sqls.length; i += 1) {
        create_table(sqls[i]);
    }
    
    console.log('Tables created...');
}); // Complete
emitter.on('defaultUser', function () {
    'use strict';
    
    var management_sql = "INSERT INTO tblmanagement (mgmtName) VALUES ('create account'), ('edit account'), ('view account'), ('view role'), ('create truck'), ('edit truck'), ('view truck'), ('create zone'), ('edit zone'), ('view zone'), ('create area'), ('edit area'), ('view area'), ('add collection'), ('edit collection'), ('create bin'), ('edit bin'), ('view bin'), ('create acr'), ('edit acr'), ('view acr'), ('create database'), ('edit database'), ('view database'), ('edit inventory'), ('view inventory'), ('view authorization'), ('view formAuthorization'), ('view complaintlist'), ('view transactionLog'), ('create reporting'), ('edit reporting'), ('view reporting'), ('export reporting'), ('create dcsDetails'), ('edit dcsDetails'), ('view dcsDetails'), ('create delivery'), ('edit delivery'), ('view delivery'), ('create bdafDetails'), ('edit bdafDetails'), ('view bdafDetails'), ('create damagedlost'), ('edit damagedlost'), ('view damagedlost'), ('create dbdDetails'), ('edit dbdDetails'), ('view dbdDetails'), ('create blostDetails'), ('edit blostDetails'), ('view blostDetails'), ('upload banner'), ('send notif'), ('approve binrequest'), ('view feedback'), ('lgview acr'), ('bdview acr'), ('view damagedBin'), ('view lostBin'), ('create damagedBin'), ('create lostBin'), ('edit damagedBin'), ('edit lostBin'), ('create complaintofficer'), ('view complaintofficer'), ('edit complaintofficer'), ('checkView formAuthorization'), ('verifyView formAuthorization'), ('view enquiry'), ('checkView bdafDetails'), ('verifyView bdafDetails'), ('checkView dcsDetails'), ('verifyView dcsDetails'), ('checkView dbrDetails'), ('verifyView dbrDetails'), ('checkView dbdDetails'), ('verifyView dbdDetails'), ('checkView blostDetails'), ('create dbrDetails'), ('edit dbrDetails'), ('view dbrDetails'), ('view newBusiness'), ('create newBusiness'), ('edit newBusiness'), ('view binStock'), ('create binStock'), ('edit binStock'), ('check reporting'), ('show managerDashboard')",
        i,
        j,
        management_row = "EXPLAIN SELECT COUNT(*) FROM tblmanagement",
        access_sql = "INSERT INTO tblaccess (positionID, mgmtID, status) VALUES",
        admin_sql = "",
        admin_staff = "",
        dt = dateTime.create(),
        formatted = dt.format('Y-m-d H:M:S'),
        roleFormat = dt.format('Ymd'),
        roleID = "ATH" + roleFormat + "0001",
        staffID = "ACC" + roleFormat + "0001",
        roleIDmgr = "ATH" + roleFormat + "0002",
        sqlmgr = "",
        roleIDro = "ATH" + roleFormat + "0003",
        sqlro = "",
        roleIDdrv = "ATH" + roleFormat + "0004",
        sqldrv = "";
    
    db.query(management_sql, function (err, result) {
        if (err) {
            throw err;
        }
    });
    
    admin_sql = "INSERT INTO tblposition (positionID, positionName, creationDateTime, positionStatus) VALUES ('" + roleID + "', 'DEVELOPER', '" + formatted + "', 'A')";
    
    db.query(admin_sql, function (err, result) {
        if (err) {
            throw err;
        } else {
            var thePassword = bcrypt.hashSync('trienekens_developer', 10);
            admin_staff = "INSERT INTO tblstaff (staffID, username, password, positionID, creationDateTime, staffStatus) VALUE ('" + staffID + "', 'dteam@trienekens.com', '" + thePassword + "', '" + roleID + "', '" + formatted + "', 'A')";
            
            db.query(admin_staff, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    db.query(management_row, function (err, result) {
                        if (err) {
                            throw err;
                        } else {
                            var rows = result[0].rows;

                            for (j = 0; j < rows; j += 1) {
                                access_sql += " ('" + roleID + "', '" + (j + 1) + "', 'A')";
                                if (j !== (rows - 1)) {
                                    access_sql += ',';
                                }
                            }
                            db.query(access_sql, function (err, result) {
                                if (err) {
                                    throw err;
                                } else {
                                    console.log('Administrator generated...');
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    
    //create default manager
    sqlmgr = "INSERT INTO tblposition (positionID, positionName, creationDateTime, positionStatus) VALUES ('" + roleIDmgr + "', 'Manager', '" + formatted + "', 'A')";
    db.query(sqlmgr, function (err, result) {
        if (err) {
            throw err;
        } else {
            console.log("Manager Role generated");
        }
    });
    
    //create default reporting officer
    sqlro = "INSERT INTO tblposition (positionID, positionName, creationDateTime, positionStatus) VALUES ('" + roleIDro + "', 'Reporting Officer', '" + formatted + "', 'A')";
    db.query(sqlro, function (err, result) {
        if (err) {
            throw err;
        } else {
            console.log("Reporting Officer Role generated");
        }
    });
    
    //create default driver
    sqldrv = "INSERT INTO tblposition (positionID, positionName, creationDateTime, positionStatus) VALUES ('" + roleIDdrv + "', 'Driver', '" + formatted + "', 'A')";
    db.query(sqldrv, function (err, result) {
        if (err) {
            throw err;
        } else {
            console.log("Driver Role generated");
        }
    });
}); // Complete
/* Emitter Registered */

/* Emitter Registered */
// Insert Dummy Data 
//emitter.on('dummyData', function () {
//    'use strict';
//    var sqls, i;
//     
//    sqls = [
//        "insert into tblzone values('a001','Zone number 1','a',current_timestamp())",
//        "insert into tblposition values('200','tempBoss','a',current_timestamp())",
//        "insert into tblposition values('DRV','Driver','a',current_timestamp())",
//        "insert into tblposition values('GWK','General Worker','a',current_timestamp())",
//        "INSERT INTO tblposition VALUE ('a001', 'ADMINISTRATOR', 'A',current_timestamp())",
//        "insert into tblstaff values('a001','user1','user123','Jackson','ic123456','m','1999/12/12','123 Abc drive, Taman BDC','012345678','12345676','email@email.com','200','a',current_timestamp(),'this is an image')",
//        "insert into tblstaff values('a002','user1','user123','Roy','ic293024','m','1999/12/12','123 Abc drive, Taman BDC','012345678','12345676','email@email.com','DRV','a',current_timestamp(),'this is an image')",
//        "insert into tblstaff values('a003','user1','user123','Kevin','ic582045','m','1999/12/12','123 Abc drive, Taman BDC','012345678','12345676','email@email.com','DRV','a',current_timestamp(),'this is an image')",
//        "insert into tblstaff values('a004','user1','user123','Alvin','ic087006','m','1999/12/12','123 Abc drive, Taman BDC','012345678','12345676','email@email.com','GWK','a',current_timestamp(),'this is an image')",
//        "insert into tblstaff values('a005','user1','user123','Barry','ic152472','m','1999/12/12','123 Abc drive, Taman BDC','012345678','12345676','email@email.com','GWK','a',current_timestamp(),'this is an image')",
//        "insert into tblauthorization values(null,current_timestamp(),'a001','action','page info','row info','query here',true,'a001','table name')",
//        "insert into tblarea values('a001','a001','a001','area 1','seven times','44.21530','-99.70123','a',current_timestamp())",
//        "insert into tbltaman values(null,'a001','taman supreme','44.21530','-99.70123','a')",
//        "insert into tbltaman values(null,'a001','taman wan alwi','44.21530','-99.70123','a')",
//        "insert into tblcustomer values('CUS201907190001','1','mobi','mobi123','1234567','18092830','abc123','Mubashir', 'Mobi Company','316','lorong wan alwi 1','93350','kuching','a',current_timestamp())",
//        "insert into tblcustomer values('CUS201907190002','2','jake','jake123','1234567','1236989','abc123','Jake', 'Jake Company','846','lorong sekama 1','93350','kuching','a',current_timestamp())",
//        "insert into tblcomplainttype values(NULL,'Household')",
//        "insert into tblcomplainttype values(NULL,'Commercial')",
//        "insert into tblcomplaint values(NULL, 'CUS201907190001', current_timestamp(),'1','No garbage collectiomn','Garbage truck didnt come to collect','a')",
//        "insert into tblbins values('1','120','a','44.21530','-99.70123')",
//        "insert into tblmanagement values(NULL,'management1')",
//        "insert into tblbininventory values(current_date(),'a001','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1','1')",
//        "insert into tbltruck values('a001','transporter','1','1234','2019/12/12','a',current_timestamp())",
//        "insert into tbldbd  values(NULL,current_timestamp(),'a')",
//        "insert into tbldbdentry values(NULL,'1','1','a001','destroyed','car crash','n','y','50','i','2019/12/12')",
//        "insert into tbldcs values('a001',current_timestamp(),'a','a',current_date(),current_date()+interval 1 day,'a001','a001',current_date(), current_date()+interval 1 day, 'a001', current_timestamp(), 'a001')",
//        //"insert into tblacr values('a001','a001','a001','1','10','10',true,true,true,true,true,true,'remarks');",
//        //"insert into tblbdaf  values(NULL,current_timestamp(),'a')",
//        //"insert into tblbdafentry values(NULL, '1','1','a001','1','1','1','bin was delivered','no remarks',true)",
//        //"insert into tblwheelbindatabase values(NULL, current_timestamp(),'1','a001','1','a001','a','rc Dwell', 'comment', 'item type 1', 'path 1')",
//        "insert into tbluseractions values(current_timestamp(),'a001','delete','tblbins')",
//        "insert into tblaccess values('200','1','a')",
//        "insert into tblreport values('a001','a001',current_date(),current_timestamp(),current_time(),current_time(),'10','this is a map','a','a','a001','a001','0.11','no remark')",
//        "insert into tblmapcircle values('1','radius','44.21530','-99.70123','a001')",
//        "insert into tblmaprect values('1','44.21530','-99.70123','44.21530','-99.70123','a001')",
//        //"insert into tblacrfreq values('a001','a001',dayofweek(current_date()))",
//        "insert into tblbincenter values('a001','a001','bin center 1','tabuan bin center','a',current_timestamp())",
//        //"insert into tbllostbinrecord values(NULL,'1','1','1',false,'a001',current_date(),'no reason')",
//        "insert into tbltag values(null, current_timestamp(),'1','a001','44.21530','-99.70123')"
//    ];
//    
//    for (i = 0; i < sqls.length; i += 1) {
//        db.query(sqls[i], function (err, result) {
//            if (err) {
//                throw err;
//            }
//        });
//    }
//    console.log('Dummy Data Inserted...');
//}); // Complete

/* Emitter Registered */
// Insert Event scheduler 
//emitter.on('eventScheduler', function () {
//    'use strict';
//    var sqls, i;
//    
//    sqls = [
//        "create event updateInventory on schedule every 1 day starts concat(current_date(),' 23:59:59') do insert into tblbininventory values(current_date(),'0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0')",
//        "set global event_scheduler='ON'"
//    ];
//    
//    for (i = 0; i < sqls.length; i += 1) {
//        db.query(sqls[i], function (err, result) {
//            if (err) {
//                throw err;
//            }
//        });
//    }
//    console.log('Event Scheduler created...');
//}); // Complete

module.exports = db;
