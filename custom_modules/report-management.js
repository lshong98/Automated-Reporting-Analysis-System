var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// Report Management
app.post('/addReport',function(req,res){
    'use strict';
    f.makeID('report',req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblreport (reportID, areaID, reportCollectionDate, operationTimeStart, operationTimeEnd, garbageAmount, iFleetMap, readStatus, completionStatus, truckID, driverID, remark, creationDateTime) VALUE ('" + ID + "', '" + req.body.areaCode + "', '" + req.body.collectionDate + "', '" + req.body.format_startTime + "', '" + req.body.format_endTime + "', '" + req.body.ton + "', '" + req.body.ifleetImg + "', 'I', '" + req.body.status+ "','" + req.body.truck + "', '" + req.body.driver + "', '" + req.body.remark + "','" + req.body.creationDate + "')";
        var i = 0, j = 0;
        var reportID = ID;
        
        database.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            if (Object.keys(req.body.marker).length > 0) {
                for (i = 0; i < Object.keys(req.body.marker).length; i++) {
                    var circleSQL = "INSERT INTO tblmapcircle (radius, cLong, cLat, reportID) VALUE ('" + req.body.marker[i].radius + "', '" + req.body.marker[i].cLong + "', '" + req.body.marker[i].cLat + "', '" + reportID + "')";

                    database.query(circleSQL, function (err, result) {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
            if (Object.keys(req.body.rectangle).length > 0) {
                for (j = 0; j < Object.keys(req.body.rectangle).length; j++) {
                    var rectSQL = "INSERT INTO tblmaprect (neLat, neLng, swLat, swLng, reportID) VALUE ('" + req.body.rectangle[j].neLat + "', '" + req.body.rectangle[j].neLng + "', '" + req.body.rectangle[j].swLat + "', '" + req.body.rectangle[j].swLng + "', '" + reportID + "')";
                    
                    database.query(rectSQL, function (err, result) {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
            res.json({"status": "success", "details": {"reportID": reportID}});
        });
    });
}); // Complete
app.post('/editReport',function(req,res){
    'use strict';
    
    var sql = "UPDATE tblreport SET reportCollectionDate = '" + req.body.date + "', operationTimeStart = '" + req.body.format_startTime + "', operationTimeEnd = '" + req.body.format_endTime + "', garbageAmount = '" + req.body.ton + "', iFleetMap = '"+ req.body.ifleet + "', completionStatus = '" + req.body.status + "', truckID = '" + req.body.truckID + "', driverID = '" + req.body.driverID + "', remark = '" + req.body.remark + "' WHERE reportID = '" + req.body.id + "'";
    var i = 0, j = 0;
    
    database.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Something wrong!"});
            throw err;
        }

        if (Object.keys(req.body.marker).length > 0) {
            var dltCircleSQL = "DELETE FROM tblmapcircle WHERE reportID = '" + req.body.id + "'";
            
            database.query(dltCircleSQL, function (err, result) {
                if (err) {
                    throw err;
                }
            });           
            
            
            for (i = 0; i < Object.keys(req.body.marker).length; i++) {
                var circleSQL = "INSERT INTO tblmapcircle (radius, cLong, cLat, reportID) VALUE ('" + req.body.marker[i].radius + "', '" + req.body.marker[i].cLong + "', '" + req.body.marker[i].cLat + "', '" + req.body.id + "')";


                database.query(circleSQL, function (err, result) {
                    if (err) {
                        throw err;
                    }
                });
            }
        }
        if (Object.keys(req.body.rectangle).length > 0) {
            
            var dltRectSQL = "DELETE FROM tblmaprect WHERE reportID = '" + req.body.id + "'";
            
            database.query(dltRectSQL, function (err, result) {
                if (err) {
                    throw err;
                }
            }); 
            
            for (j = 0; j < Object.keys(req.body.rectangle).length; j++) {
                var rectSQL = "INSERT INTO tblmaprect (neLat, neLng, swLat, swLng, reportID) VALUE ('" + req.body.rectangle[j].neLat + "', '" + req.body.rectangle[j].neLng + "', '" + req.body.rectangle[j].swLat + "', '" + req.body.rectangle[j].swLng + "', '" + req.body.id + "')";

                database.query(rectSQL, function (err, result) {
                    if (err) {
                        throw err;
                    }
                });
            }
        }        
        res.json({"status": "success", "message": "report edited!"});
    });
});
app.post('/getReport', function(req, res){
    'use strict';
    var sql = "SELECT tblreport.reportID AS id, tblreport.areaID AS area, CONCAT(tblzone.zoneCode, tblarea.areaCode) AS areaCode, tblreport.reportCollectionDate AS date, tblreport.operationTimeStart AS startTime, tblreport.operationTimeEnd AS endTime, tblreport.remark, tblarea.latitude AS lat, tblarea.longitude AS lng, tblreport.garbageAmount AS ton, tblreport.iFleetMap AS ifleet, tbltruck.truckNum AS truck, tbltruck.truckID as truckID, tbltruck.transporter AS transporter, tblstaff.staffName AS driver, tblstaff.staffID AS driverID, GROUP_CONCAT(tbltaman.tamanName) AS collection, tblarea.collection_frequency AS frequency, tblreport.completionStatus as status FROM tblreport JOIN tbltruck ON tbltruck.truckID = tblreport.truckID JOIN tblstaff ON tblreport.driverID = tblstaff.staffID JOIN tblarea ON tblarea.areaID = tblreport.areaID JOIN tbltaman ON tbltaman.areaID = tblarea.areaID JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblreport.reportID = '" + req.body.reportID + "' GROUP BY tblreport.areaID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Wait for area_collection
app.post('/getReportingAreaList', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblzone.zoneID AS zoneID, tblzone.zoneName AS zoneName, GROUP_CONCAT(tblarea.areaID) AS id, GROUP_CONCAT(tblarea.areaName) AS name, GROUP_CONCAT(CONCAT(tblzone.zoneCode, tblarea.areaCode)) AS areaCode FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaStatus = 'A' AND tblarea.staffID = '" + req.body.officerid + "' AND tblarea.collection_frequency LIKE '%" + req.body.day + "%' GROUP BY tblzone.zoneID";
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/getPassReportingAreaList', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblzone.zoneID AS zoneID, tblzone.zoneName AS zoneName, GROUP_CONCAT(tblarea.areaID) AS id, GROUP_CONCAT(tblarea.areaName) AS name, GROUP_CONCAT(CONCAT(tblzone.zoneCode, tblarea.areaCode)) AS areaCode FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaStatus = 'A' AND tblarea.staffID = '" + req.body.officerid + "' AND (tblarea.collection_frequency LIKE '%" + req.body.day1 + "%' OR tblarea.collection_frequency LIKE '%" + req.body.day2 + "%') AND tblarea.areaID NOT IN (SELECT tblreport.areaID FROM tblreport WHERE tblreport.creationDateTime BETWEEN '" + req.body.date2+ "' AND CURDATE() + 1 )GROUP BY tblzone.zoneID";
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/getReportBinCenter', function(req,res){
    'use strict';
    
    var sql = "SELECT binCenterName AS name FROM tblbincenter WHERE areaID = '" + req.body.areaID + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/getReportingStaff',function(req,res){
    'use strict';
    
    var sql = "SELECT tblstaff.staffName FROM tblstaff JOIN tblarea ON tblstaff.staffID = tblarea.staffID WHERE tblarea.areaID = '" + req.body.areaID + "' ";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//app.post('/getPeriodForReportACR',function (req, res){
//    'use strict';
//    
//    var sql = "SELECT tbldcs.periodFrom as 'periodFrom', tbldcs.periodTo as 'periodTo' FROM tbldcs WHERE tbldcs.areaID  = '" + req.body.area + "' AND tbldcs.driverID = '" + req.body.driverID + "' AND CURDATE() BETWEEN tbldcs.periodFrom AND tbldcs.periodTo";
//    database.query(sql, function (err, result) {
//        if (err) {
//            throw err;
//        }
//        res.json(result);
//    });
//});
//app.post('/getReportACR', function (req, res) {
//
//    'use strict';
//    
////    var sql = "SELECT tblacr.acrName AS name FROM tblacrfreq JOIN tblreport ON tblreport.areaID = tblacrfreq.areaID JOIN tblacr ON tblacr.acrID = tblacrfreq.acrID WHERE tblreport.reportID = '" + req.body.reportID + "' GROUP BY tblacr.acrName";
////    var sql = "SELECT tblcustomer.name FROM tblcustomer JOIN tblacr ON tblcustomer.customerID = tblacr.customerID JOIN tbldcs ON tblacr.dcsID = tbldcs.dcsID WHERE tbldcs.areaID = '" + req.body.area + "' AND ('" + req.body.date + "' BETWEEN tbldcs.periodFrom AND tbldcs.periodTo) AND tbldcs.driverID = '" + req.body.driverID + "'";
////    var sql = "SELECT tblcustomer.name as 'name' FROM tblcustomer JOIN tblacr ON tblcustomer.customerID = tblacr.customerID WHERE tblacr.from BETWEEN '" + req.body.periodFrom + "' AND '" + req.body.periodTo + "' OR tblacr.to BETWEEN '" + req.body.periodFrom + "' AND '" + req.body.periodTo + "'";
//    
//    database.query(sql, function (err, result) {
//        if (err) {
//            throw err;
//        }
//        res.json(result);
//    });
//});

app.post('/getReportACR', function(req, res){
    'use strict';
    f.waterfallQuery("SELECT tbldcs.dcsID FROM tbldcs WHERE tbldcs.areaID LIKE '%" + req.body.area +"%' AND CURDATE() BETWEEN tbldcs.periodFrom and tbldcs.periodTo").then(function(dcs){
        if(dcs == null){
            res.json(null);
        }else{
            if(req.body.todayday == "sun"){
                res.json(null);
            }else{
                var sql = "SELECT tblcustomer.name, tblacr.mon, tblacr.tue, tblacr.wed, tblacr.thu, tblacr.fri, tblacr.sat FROM tblcustomer JOIN tblacr ON tblcustomer.customerID = tblacr.customerID WHERE tblacr.dcsID LIKE '%" + dcs.dcsID + "%' AND tblacr."+ req.body.todayday + " = 1";

                database.query(sql, function(err, result){
                    if(err){
                        throw err;
                    }
                    else{
                        res.json(result);
                        res.end();
                    }
                });
            }
        }
    });


});

app.post('/getReportCircle', function(req,res){
    'use strict';
    
    var sql = "SELECT radius, cLong, cLat FROM tblmapcircle WHERE reportID = '" + req.body.reportID + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getReportRect', function (req, res) {
    'use strict';
    var sql = "SELECT neLat, neLng, swLat, swLng FROM tblmaprect WHERE reportID = '" + req.body.reportID + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.get('/getReportList', function(req, res){
    'use strict';
    
    var sql = "SELECT reportID AS reportID, CONCAT(tblzone.zoneCode, tblarea.areaCode) AS area, reportCollectionDate AS date, tbltruck.truckNum AS truck, tblreport.completionStatus AS status, tblreport.remark AS remark FROM tblreport JOIN tblarea ON tblreport.areaID = tblarea.areaID JOIN tblzone ON tblarea.zoneID = tblzone.zoneID JOIN tbltruck ON tblreport.truckID = tbltruck.truckID ORDER BY tblreport.creationDateTime DESC";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/getInitTruck',function(req,res){
    'use strict';
    
    var sql="SELECT tbltruck.truckID, tbltruck.truckNum FROM tbltruck INNER JOIN tbltag ON tbltruck.truckID = tbltag.truckID INNER JOIN tblwheelbindatabase on tbltag.serialNo = tblwheelbindatabase.serialNo WHERE tblwheelbindatabase.areaID = '" + req.body.areaCode+ "' LIMIT 0, 1";
    

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        
    }); 
});

app.post('/getInitTime', function(req,res){
    'use strict';
    
    var result = {};
    f.waterfallQuery("SELECT DATE_FORMAT(tbltag.date,'%H:%i:%s') AS stime FROM tbltag JOIN tblwheelbindatabase ON tbltag.serialNo = tblwheelbindatabase.serialNo WHERE tbltag.date >= CURRENT_DATE AND tblwheelbindatabase.areaID = '" + req.body.areaCode + "' AND tblwheelbindatabase.activeStatus = 'a' ORDER BY tbltag.date ASC LIMIT 0,1").then(function(time){
        if(time == null){
            result.stime = 0;
        }else{
            result.stime = time.stime;
        }
        
        return f.waterfallQuery("SELECT DATE_FORMAT(tbltag.date,'%H:%i:%s') AS etime FROM tbltag JOIN tblwheelbindatabase ON tbltag.serialNo = tblwheelbindatabase.serialNo WHERE tbltag.date >= CURRENT_DATE AND tblwheelbindatabase.areaID = '" + req.body.areaCode + "' AND tblwheelbindatabase.activeStatus = 'a' ORDER BY tbltag.date DESC LIMIT 0,1");
    }).then(function(time){
        if(time == null){
            result.etime = 0;
        }else{
            result.etime = time.etime;
        }
        res.json(result);
        res.end();
    });
});

app.post('/getInitStatus',function(req,res){
    'use strict';
   
    var count = {};
    f.waterfallQuery("SELECT COUNT(*) AS initcount FROM tblwheelbindatabase WHERE activeStatus = 'a' AND areaID = '" + req.body.areaCode + "'").then(function (initcount){
        count.initcount = initcount.initcount;
        return f.waterfallQuery("SELECT COUNT(DISTINCT tbltag.serialNo) AS 'actualcount' FROM tbltag JOIN tblwheelbindatabase ON tbltag.serialNo = tblwheelbindatabase.serialNo WHERE tbltag.date >= CURRENT_DATE AND tblwheelbindatabase.areaID = '"+ req.body.areaCode+"' AND tblwheelbindatabase.activeStatus = 'a'");
    }).then(function (actualcount){
        count.actualcount = actualcount.actualcount;
        res.json(count);
        res.end();
    });
});

app.post('/getInitDriver',function(req,res){
    'use strict';
    
    var sql = " SELECT tblstaff.staffID AS 'driver' FROM tblstaff JOIN tblarea ON tblstaff.staffID = tblarea.driverID WHERE tblarea.areaID = '" + req.body.area + "' ";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    }); 
    
});

app.post('/getReportOfficerTodayUnsubmitted',function(req,res){
    'use strict';
    
    var sql = "SELECT DISTINCT CONCAT(tblzone.zoneCode,tblarea.areaCode) AS area FROM tblarea JOIN tblzone on tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaID NOT IN (SELECT tblreport.areaID FROM tblreport WHERE DATE(tblreport.creationDateTime) = CURDATE()) AND tblarea.collection_frequency LIKE '%" + req.body.day + "%' AND tblarea.staffID = '" + req.body.officerid + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });    
    
});

app.post('/getReportOfficerTodaySubmitted',function(req,res){
    'use strict';
    
    var sql = "SELECT DISTINCT CONCAT(tblzone.zoneCode,tblarea.areaCode) AS area FROM tblarea JOIN tblzone on tblarea.zoneID = tblzone.zoneID INNER JOIN tblreport ON tblreport.areaID = tblarea.areaID WHERE tblarea.collection_frequency LIKE '%" + req.body.day + "%' AND DATE(tblreport.creationDateTime) = CURDATE() AND tblarea.staffID = '" + req.body.officerid + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });    
    
});
module.exports = app;