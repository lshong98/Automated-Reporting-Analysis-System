var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// Report Management
app.post('/addReport',function(req,res){
    'use strict';
    f.makeID('report',req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblreport (reportID, areaID, reportCollectionDate, operationTimeStart, operationTimeEnd, garbageAmount, iFleetMap, readStatus, completionStatus, truckID, driverID, remark, creationDateTime) VALUE ('" + ID + "', '" + req.body.areaCode + "', '" + req.body.collectionDate + "', '" + req.body.startTime + "', '" + req.body.endTime + "', '" + req.body.ton + "', '" + req.body.ifleetImg + "', 'I', '" + req.body.status+ "','" + req.body.truck + "', '" + req.body.driver + "', '" + req.body.remark + "','" + req.body.creationDate + "')";
        var i = 0, j = 0;
        var reportID = ID;
        
        database.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            if (Object.keys(req.body.marker).length > 0) {
                for (i = 0; i < Object.keys(req.body.marker).length; i++) {
                    var circleSQL = "INSERT INTO tblmapcircle (radius, cLong, cLat, reportID) VALUE ('" + req.body.marker[i].radius + "', '" + req.body.marker[i].lng + "', '" + req.body.marker[i].lat + "', '" + reportID + "')";

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
    
    var sql = "UPDATE tblreport SET reportCollectionDate = '" + req.body.date + "', operationTimeStart = '" + req.body.startTime + "', operationTimeEnd = '" + req.body.endTime + "', garbageAmount = '" + req.body.ton + "', iFleetMap = '"+ req.body.ifleet + "', completionStatus = '" + req.body.status + "', truckID = '" + req.body.truckID + "', driverID = '" + req.body.driverID + "', remark = '" + req.body.remark + "' WHERE reportID = '" + req.body.id + "'";
    
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
                
                console.log(circleSQL);

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
    var sql = "SELECT tblreport.reportID AS id, tblreport.areaID AS area, tblreport.reportCollectionDate AS date, tblreport.operationTimeStart AS startTime, tblreport.operationTimeEnd AS endTime, tblreport.remark, tblarea.latitude AS lat, tblarea.longitude AS lng, tblreport.garbageAmount AS ton, tblreport.iFleetMap AS ifleet, tbltruck.truckNum AS truck, tbltruck.truckID as truckID, tbltruck.transporter AS transporter, tblstaff.staffName AS driver, tblstaff.staffID AS driverID, GROUP_CONCAT(area_collection.areaAddress) AS collection, tblarea.collection_frequency AS frequency, tblreport.completionStatus as status FROM tblreport JOIN tbltruck ON tbltruck.truckID = tblreport.truckID JOIN tblstaff ON tblreport.driverID = tblstaff.staffID JOIN area_collection ON tblreport.areaID = area_collection.areaID JOIN tblarea ON tblarea.areaID = tblreport.areaID WHERE tblreport.reportID = '" + req.body.reportID + "' GROUP BY tblreport.areaID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Wait for area_collection
app.post('/getReportingAreaList', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblzone.zoneID AS zoneID, tblzone.zoneName AS zoneName, GROUP_CONCAT(tblarea.areaID) AS id, GROUP_CONCAT(tblarea.areaName) AS name FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaStatus = 'A' AND tblarea.staffID = '" + req.body.officerid + "'GROUP BY tblzone.zoneID";
    
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
//app.post('/getReportACR', function (req, res) {
//    'use strict';
//    
//    var sql = "SELECT tblacr.acrName AS name FROM tblacrfreq JOIN tblreport ON tblreport.areaID = tblacrfreq.areaID JOIN tblacr ON tblacr.acrID = tblacrfreq.acrID WHERE tblreport.reportID = '" + req.body.reportID + "' GROUP BY tblacr.acrName";
//    
//    database.query(sql, function (err, result) {
//        if (err) {
//            throw err;
//        }
//        res.json(result);
//    });
//});
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
    
    var sql ="SELECT reportID, reportCollectionDate, tblarea.areaName, completionStatus, garbageAmount, remark FROM tblreport INNER JOIN tblarea ON tblreport.areaID = tblarea.areaID ORDER BY reportCollectionDate DESC";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
app.post('/getGoogleLocation', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblarea.areaName AS area, tblzone.zoneName AS zone FROM tblarea INNER JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaID = '" + req.body.areaCode + "' LIMIT 0, 1";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

module.exports = app;