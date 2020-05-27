/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var fs = require('fs');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage({
    keyFilename: './trienekens-management-portal-5c3ad8aa7ee2.json',
    projectId: 'trienekens-management-portal'
});
const bucketName = 'trienekens-management-portal-images';
const local_directory = './images/daily-report';
const lh_directory = local_directory + '/lh';
const rttb_directory = local_directory + '/rttb';
const wt_directory = local_directory + '/wt';
const gpswox_directory = local_directory + '/gpswox';

app.post('/convertreport', function (req, res) {
    var sql = "SELECT reportID AS id, iFleetMap AS image FROM tblreport WHERE iFleetMap != '' AND iFleetMap LIKE '%;base64,%' ORDER BY creationDateTime DESC LIMIT 0, 1";

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        } else {
            for (var i = 0; i < result.length; i++) {
                var base64Image = (result[i].image).split(';base64,').pop();
                var extension = (result[i].image).split(';base64,')[0].split('/')[1];
                var image_path = '/' + result[i].id + '.' + extension;
                var local_store_path = 'images/daily-report' + image_path,
                    public_url = 'https://storage.googleapis.com/' + bucketName + '/' + local_store_path;
                
                fs.writeFile(local_store_path, base64Image, {encoding: 'base64'}, async function (err) {
                    if (err) throw err;

                    await storage.bucket(bucketName).upload('./' + local_store_path, {
                        gzip: true,
                        metadata: {
                            cacheControl: 'public, no-cache',
                        },
                        public: true,
                        destination: local_store_path
                    });
                });
                var update_sql = "UPDATE tblreport SET iFleetMap = '" + public_url + "' WHERE reportID = '" + result[i].id + "'";

                database.query(update_sql, function (err, result) {
                    if (err) {
                        throw err;
                    }
                });
            }
            res.json({"message": "success"});
        }
    });
});

// Report Management
app.post('/addReport', function (req, res) {
    'use strict';
    
    var area_code = req.body.areaCode,
        collection_date = req.body.collectionDate,
        operation_start = req.body.format_startTime,
        operation_end = req.body.format_endTime,
        tonnage = req.body.ton,
        lh = req.body.lh,
        rttb = req.body.rttb,
        wt = req.body.wt,
        gpswox = req.body.gpswox,
        //image = req.body.ifleetImg,
        read_status = 'I',
        complete_status = req.body.status,
        truck_id = req.body.truck,
        driver_id = req.body.driver,
        remark = req.body.remark.replace("'", "\\'"),
        created_on = req.body.creationDate,
        staff_id = req.body.staffID,
        colDay = req.body.colDay;
    
    if (!fs.existsSync(local_directory)) {
        fs.mkdirSync(local_directory);
    }
    if (!fs.existsSync(lh_directory)) {
        fs.mkdirSync(lh_directory);
    }
    if (!fs.existsSync(rttb_directory)) {
        fs.mkdirSync(rttb_directory);
    }
    if (!fs.existsSync(wt_directory)) {
        fs.mkdirSync(wt_directory);
    }
    if (!fs.existsSync(gpswox_directory)) {
        fs.mkdirSync(gpswox_directory);
    }
    
    function makeImage (image, directory, ID) {
        var base64Image = image.split(';base64,').pop();
        var extension = image.split(';base64,')[0].split('/')[1];
        var image_path = '/' + ID + '.' + extension;
        var local_store_path = 'images/daily-report/'+ directory + image_path,
            public_url = 'https://storage.googleapis.com/' + bucketName + '/' + local_store_path;
        
        fs.writeFile(local_store_path, base64Image, {encoding: 'base64'}, async function (err) {
            if (err) throw err;

            await storage.bucket(bucketName).upload('./' + local_store_path, {
                gzip: true,
                metadata: {
                    cacheControl: 'public, no-cache',
                },
                public: true,
                destination: local_store_path
            });
        });
        return public_url;
    }
    
    f.makeID('report', created_on).then(function (ID) {
        if (lh !== '') {
            lh = makeImage(lh, "lh", ID);
        } else {
            lh = '';
        }
        if (rttb !== '') {
            rttb = makeImage(rttb, "rttb", ID);
        } else {
            rttb = '';
        }
        if (wt !== '') {
            wt = makeImage(wt, "wt", ID);
        } else {
            wt = '';
        }
        if (gpswox !== '') {
            gpswox = makeImage(gpswox, "gpswox", ID);
        } else {
            gpswox = '';
        }
            
            var sql = "INSERT INTO tblreport (reportID, areaID, reportCollectionDate, operationTimeStart, operationTimeEnd, garbageAmount, lh, rttb, wt, gpswox, reportFeedback, readStatus, completionStatus, truckID, driverID, remark, creationDateTime, staffID, colDay) VALUE ('" + ID + "', '" + area_code + "', '" + collection_date + "', '" + operation_start + "', '" + operation_end + "', '" + tonnage + "', '" + lh + "', '" + rttb + "', '" + wt + "', '" + gpswox + "', '', '" + read_status + "', '" + complete_status + "', '" + truck_id + "', '" + driver_id + "', '" + remark + "', '" + created_on + "', '" + staff_id + "', '" + colDay + "')",
                reportID = ID;

            database.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    res.json({"status": "success", "details": {"reportID": reportID}});
                }
            });
        //});
        {
        //With hand-draw circle
//        var sql = "INSERT INTO tblreport (reportID, areaID, reportCollectionDate, operationTimeStart, operationTimeEnd, garbageAmount, iFleetMap, reportFeedback, readStatus, completionStatus, truckID, driverID, remark, creationDateTime, staffID) VALUE ('" + ID + "', '" + req.body.areaCode + "', '" + req.body.collectionDate + "', '" + req.body.format_startTime + "', '" + req.body.format_endTime + "', '" + req.body.ton + "', '" + req.body.ifleetImg + "', '', 'I', '" + req.body.status + "','" + req.body.truck + "', '" + req.body.driver + "', '" + req.body.remark + "','" + req.body.creationDate + "', '" + req.body.staffID + "')",
//            i = 0,
//            j = 0,
//            reportID = ID;
//        
//        database.query(sql, function (err, result) {
//            if (err) {
//                throw err;
//            }
//            if (Object.keys(req.body.marker).length > 0) {
//                for (i = 0; i < Object.keys(req.body.marker).length; i += 1) {
//                    var circleSQL = "INSERT INTO tblmapcircle (radius, cLong, cLat, reportID) VALUE ('" + req.body.marker[i].radius + "', '" + req.body.marker[i].cLong + "', '" + req.body.marker[i].cLat + "', '" + reportID + "')";
//
//                    database.query(circleSQL, function (err, result) {
//                        if (err) {
//                            throw err;
//                        }
//                    });
//                }
//            }
//            if (Object.keys(req.body.rectangle).length > 0) {
//                for (j = 0; j < Object.keys(req.body.rectangle).length; j += 1) {
//                    var rectSQL = "INSERT INTO tblmaprect (neLat, neLng, swLat, swLng, reportID) VALUE ('" + req.body.rectangle[j].neLat + "', '" + req.body.rectangle[j].neLng + "', '" + req.body.rectangle[j].swLat + "', '" + req.body.rectangle[j].swLng + "', '" + reportID + "')";
//                    
//                    database.query(rectSQL, function (err, result) {
//                        if (err) {
//                            throw err;
//                        }
//                    });
//                }
//            }
//            res.json({"status": "success", "details": {"reportID": reportID}});
//        });
        }
    });
}); // Complete
app.post('/report_feedback', function (req, res) {
    'use strict';
    
    var feedback = req.body.feedback,
        report_id = req.body.id;
    
    var sql = "UPDATE tblreport SET reportFeedback = '" + feedback + "' WHERE reportID = '" + report_id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            res.end();
            throw err;
        } else {
            res.json({"status": "success", "message": "Feedback submitted."});
            res.end();
        }
    });
});
app.post('/editReport', function (req, res) {
    'use strict';
    
    var image = req.body.ifleet,
        report_id = req.body.id,
        collection_date = req.body.date,
        operation_start = req.body.format_startTime,
        operation_end = req.body.format_endTime,
        tonnage = req.body.ton,
        status = req.body.status,
        truck_id = req.body.truckID,
        driver_id = req.body.driverID,
        remark = req.body.remark.replace("'", "\\'"),
        colDay = req.body.colDay,
        lh = req.body.lh,
        rttb = req.body.rttb,
        wt = req.body.wt,
        gpswox = req.body.gpswox;
    
    function makeImage (image, directory, ID) {
        var base64Image = image.split(';base64,').pop();
        var extension = image.split(';base64,')[0].split('/')[1];
        var image_path = '/' + ID + '.' + extension;
        var local_store_path = 'images/daily-report/'+ directory + image_path,
            public_url = 'https://storage.googleapis.com/' + bucketName + '/' + local_store_path;
        
        fs.writeFile(local_store_path, base64Image, {encoding: 'base64'}, async function (err) {
            if (err) throw err;

            await storage.bucket(bucketName).upload('./' + local_store_path, {
                gzip: true,
                metadata: {
                    cacheControl: 'public, no-cache',
                },
                public: true,
                destination: local_store_path
            });
        });
        return public_url;
    }
    
    if (!fs.existsSync(local_directory)) {
        fs.mkdirSync(local_directory);
    }
    if (lh !== null) {
        if (lh !== '' && lh.search('googleapis') >= 0) {
            lh = req.body.lh;
        } else if (lh !== '' && lh.search('googleapis') === -1) {
            lh = makeImage(lh, "lh", report_id);
        } else {
            lh = '';
        }
    } else {
        lh = '';
    }
    
    if (rttb !== null) {
        if (rttb !== '' && rttb.search('googleapis') >= 0) {
            rttb = req.body.rttb;
        } else if (rttb !== '' && rttb.search('googleapis') === -1) {
            rttb = makeImage(rttb, "rttb", report_id);
        } else {
            rttb = '';
        }
    } else {
        rttb = '';
    }
    
    if (wt !== null) {
        if (wt !== '' && wt.search('googleapis') >= 0) {
            wt = req.body.wt;
        } else if (wt !== '' && wt.search('googleapis') === -1) {
            wt = makeImage(wt, "wt", report_id);
        } else {
            wt = '';
        }
    } else {
        wt = '';
    }
    
    if (gpswox !== null) {
        if (gpswox !== '' && gpswox.search('googleapis') >= 0) {
            gpswox = req.body.gpswox;
        } else if (gpswox !== '' && gpswox.search('googleapis') === -1) {
            gpswox = makeImage(gpswox, "gpswox", report_id);
        } else {
            gpswox = '';
        }
    } else {
        gpswox = '';
    }
    
    
//    if (image !== '' && image.search('googleapis') >= 0) {
//        image = req.body.ifleet;
//    } else if (image !== '' && image.search('googleapis') === -1) {
//        let base64Image = image.split(';base64,').pop();
//        var extension = image.split(';base64,')[0].split('/')[1];
//        var image_path = '/' + report_id + '.' + extension;
//        var local_store_path = 'images/daily-report' + image_path,
//            public_url = 'https://storage.googleapis.com/' + bucketName + '/' + local_store_path;
//            
//        fs.writeFile(local_store_path, base64Image, {encoding: 'base64'}, async function (err) {
//            if (err) throw err;
//
//            await storage.bucket(bucketName).upload('./' + local_store_path, {
//                gzip: true,
//                metadata: {
//                    cacheControl: 'public, no-cache',
//                },
//                public: true,
//                destination: local_store_path
//            });
//        });
//        image = public_url;
//    } else {
//        image = '';
//    }
//    
    var sql = "UPDATE tblreport SET reportCollectionDate = '" + collection_date + "', operationTimeStart = '" + operation_start + "', operationTimeEnd = '" + operation_end + "', garbageAmount = '" + tonnage + "', lh = '" + lh + "', rttb = '" + rttb + "', wt = '" + wt + "', gpswox = '" + gpswox + "', completionStatus = '" + status + "', truckID = '" + truck_id + "', driverID = '" + driver_id + "', remark = '" + remark + "', colDay = '" + colDay + "' WHERE reportID = '" + report_id + "'",
        i = 0,
        j = 0;
    
    database.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Something wrong!"});
            throw err;
        }

//        if (Object.keys(req.body.marker).length > 0) {
//            var dltCircleSQL = "DELETE FROM tblmapcircle WHERE reportID = '" + req.body.id + "'";
//            
//            database.query(dltCircleSQL, function (err, result) {
//                if (err) {
//                    throw err;
//                }
//            });
//            
//            
//            for (i = 0; i < Object.keys(req.body.marker).length; i += 1) {
//                var circleSQL = "INSERT INTO tblmapcircle (radius, cLong, cLat, reportID) VALUE ('" + req.body.marker[i].radius + "', '" + req.body.marker[i].cLong + "', '" + req.body.marker[i].cLat + "', '" + req.body.id + "')";
//
//
//                database.query(circleSQL, function (err, result) {
//                    if (err) {
//                        throw err;
//                    }
//                });
//            }
//        }
//        if (Object.keys(req.body.rectangle).length > 0) {
//            
//            var dltRectSQL = "DELETE FROM tblmaprect WHERE reportID = '" + req.body.id + "'";
//            
//            database.query(dltRectSQL, function (err, result) {
//                if (err) {
//                    throw err;
//                }
//            });
//            
//            for (j = 0; j < Object.keys(req.body.rectangle).length; j += 1) {
//                var rectSQL = "INSERT INTO tblmaprect (neLat, neLng, swLat, swLng, reportID) VALUE ('" + req.body.rectangle[j].neLat + "', '" + req.body.rectangle[j].neLng + "', '" + req.body.rectangle[j].swLat + "', '" + req.body.rectangle[j].swLng + "', '" + req.body.id + "')";
//
//                database.query(rectSQL, function (err, result) {
//                    if (err) {
//                        throw err;
//                    }
//                });
//            }
//        }
        res.json({"status": "success", "message": "report edited!"});
    });
});
app.post('/getReport', function (req, res) {
    'use strict';
    var sql = "SELECT tblreport.reportID AS id, tblreport.areaID AS area, CONCAT(tblzone.zoneCode, tblarea.areaCode) AS areaCode, tblreport.reportCollectionDate AS date, tblreport.operationTimeStart AS startTime, tblreport.operationTimeEnd AS endTime, tblreport.remark, tblreport.reportFeedback AS feedback, tblarea.latitude AS lat, tblarea.longitude AS lng, tblreport.garbageAmount AS ton, tblreport.lh AS lh, tblreport.rttb AS rttb, tblreport.wt AS wt, tblreport.gpswox AS gpswox, tbltruck.truckNum AS truck, tbltruck.truckID as truckID, tbltruck.transporter AS transporter, tblstaff.staffName AS driver, tblstaff.staffID AS driverID, GROUP_CONCAT(tbltaman.tamanName) AS collection, tblarea.collection_frequency AS frequency, tblreport.completionStatus as status FROM tblreport JOIN tbltruck ON tbltruck.truckID = tblreport.truckID JOIN tblstaff ON tblreport.driverID = tblstaff.staffID JOIN tblarea ON tblarea.areaID = tblreport.areaID JOIN tbltaman ON tbltaman.areaID = tblarea.areaID JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblreport.reportID = '" + req.body.reportID + "' GROUP BY tblreport.areaID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        if(req.body.check == "A"){
            var updateRead = "UPDATE tblreport SET readStatus = 'C' WHERE reportID = '" + req.body.reportID + "'";

            database.query(updateRead, function(err2, result2){
                if(err2){
                    throw err2;
                }

                res.json(result);
            });
        }else{
            res.json(result);
        }
        
    });
}); // Wait for area_collection
app.post('/getReportingAreaList', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblzone.zoneID AS zoneID, tblzone.zoneName AS zoneName, GROUP_CONCAT(tblarea.areaID) AS id, GROUP_CONCAT(tblarea.areaName) AS name, GROUP_CONCAT(CONCAT(tblzone.zoneCode, tblarea.areaCode)) AS areaCode FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaStatus = 'A' AND tblarea.staffID = '" + req.body.officerid + "' AND tblarea.collection_frequency LIKE '%" + req.body.day + "%' GROUP BY tblzone.zoneID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/getPassReportingAreaList', function (req, res) {
    'use strict';
    
//    var sql = "SELECT tblzone.zoneID AS zoneID, tblzone.zoneName AS zoneName, GROUP_CONCAT(tblarea.areaID) AS id, GROUP_CONCAT(tblarea.areaName) AS name, GROUP_CONCAT(CONCAT(tblzone.zoneCode, tblarea.areaCode)) AS areaCode FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaStatus = 'A' AND tblarea.staffID = '" + req.body.officerid + "' AND (tblarea.collection_frequency LIKE '%" + req.body.day1 + "%' OR tblarea.collection_frequency LIKE '%" + req.body.day2 + "%') AND tblarea.areaID NOT IN (SELECT tblreport.areaID FROM tblreport WHERE tblreport.creationDateTime BETWEEN '" + req.body.date2 + "' AND CURDATE() + 1 )GROUP BY tblzone.zoneID";
    
    var sql = "SELECT tblzone.zoneID AS zoneID, tblzone.zoneName AS zoneName, GROUP_CONCAT(tblarea.areaID) AS id, GROUP_CONCAT(tblarea.areaName) AS name, GROUP_CONCAT(CONCAT(tblzone.zoneCode, tblarea.areaCode)) AS areaCode FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaStatus = 'A' AND tblarea.staffID = '" + req.body.officerid + "' AND (tblarea.collection_frequency LIKE '%" + req.body.day1 + "%' OR tblarea.collection_frequency LIKE '%" + req.body.day2 + "%') AND tblarea.areaID NOT IN (SELECT tblreport.areaID FROM tblreport WHERE tblreport.creationDateTime BETWEEN '" + req.body.date2 + "' AND CURDATE() + 1 AND (tblreport.colDay LIKE '%" + req.body.day1 + "%' OR tblreport.colDay LIKE '%" + req.body.day2 + "%'))GROUP BY tblzone.zoneID";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/getReportBinCenter', function (req, res) {
    'use strict';
    
    var sql = "SELECT binCenterName AS name FROM tblbincenter WHERE areaID = '" + req.body.areaID + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/getReportingStaff', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblstaff.staffName FROM tblstaff JOIN tblreport ON tblstaff.staffID = tblreport.staffID WHERE tblreport.reportID = '" + req.body.reportID + "' ";

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

app.post('/getReportACR', function (req, res) {
    'use strict';
    f.waterfallQuery("SELECT tbldcs.dcsID FROM tbldcs WHERE tbldcs.areaID LIKE '%" + req.body.area + "%' AND CURDATE() BETWEEN tbldcs.periodFrom and tbldcs.periodTo").then(function (dcs) {
        if (dcs == null) {
            res.json(null);
        } else {
            if (req.body.todayday == "sun") {
                res.json(null);
            } else {
                var sql = "SELECT tbluser.name, tblacr.mon, tblacr.tue, tblacr.wed, tblacr.thu, tblacr.fri, tblacr.sat FROM tbluser JOIN tblacr ON tbluser.userID = tblacr.userID WHERE tblacr.dcsID LIKE '%" + dcs.dcsID + "%' AND tblacr." + req.body.todayday + " = 1";

                database.query(sql, function (err, result) {
                    if (err) {
                        throw err;
                    } else {
                        res.json(result);
                        res.end();
                    }
                });
            }
        }
    });


});

app.post('/getReportCircle', function (req, res) {
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
app.get('/getReportList', function (req, res) {
    'use strict';
    
    var sql = "SELECT reportID AS reportID, CONCAT(tblzone.zoneCode, tblarea.areaCode) AS area, reportCollectionDate AS date, DATE_FORMAT(tblreport.creationDateTime, '%Y-%m-%d %r') AS sdate, tblstaff.staffName AS staffName, tbltruck.truckNum AS truck, tblreport.garbageAmount AS ton, tblreport.completionStatus AS status, tblreport.remark AS remark, tblreport.reportFeedback AS feedback, tblreport.readStatus AS readStatus FROM tblreport JOIN tblstaff ON tblstaff.staffID = tblreport.staffID  JOIN tblarea ON tblreport.areaID = tblarea.areaID JOIN tblzone ON tblarea.zoneID = tblzone.zoneID JOIN tbltruck ON tblreport.truckID = tbltruck.truckID ORDER BY tblreport.creationDateTime DESC";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/getInitTruck', function (req, res) {
    'use strict';
    
    var sql = "SELECT tbltruck.truckID, tbltruck.truckNum FROM tbltruck INNER JOIN tbltag ON tbltruck.truckID = tbltag.truckID INNER JOIN tblwheelbindatabase on tbltag.serialNo = tblwheelbindatabase.serialNo WHERE tblwheelbindatabase.areaID = '" + req.body.areaCode + "' LIMIT 0, 1";
    

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/getInitTime', function (req, res) {
    'use strict';
    
    var result = {};
    f.waterfallQuery("SELECT DATE_FORMAT(tbltag.date,'%H:%i:%s') AS stime FROM tbltag JOIN tblwheelbindatabase ON tbltag.serialNo = tblwheelbindatabase.serialNo WHERE tbltag.date >= CURRENT_DATE AND tblwheelbindatabase.areaID = '" + req.body.areaCode + "' AND tblwheelbindatabase.activeStatus = 'a' ORDER BY tbltag.date ASC LIMIT 0,1").then(function (time) {
        if (time == null) {
            result.stime = 0;
        } else {
            result.stime = time.stime;
        }
        
        return f.waterfallQuery("SELECT DATE_FORMAT(tbltag.date,'%H:%i:%s') AS etime FROM tbltag JOIN tblwheelbindatabase ON tbltag.serialNo = tblwheelbindatabase.serialNo WHERE tbltag.date >= CURRENT_DATE AND tblwheelbindatabase.areaID = '" + req.body.areaCode + "' AND tblwheelbindatabase.activeStatus = 'a' ORDER BY tbltag.date DESC LIMIT 0,1");
    }).then(function (time) {
        if (time == null) {
            result.etime = 0;
        } else {
            result.etime = time.etime;
        }
        res.json(result);
        res.end();
    });
});

app.post('/getInitStatus', function (req, res) {
    'use strict';
   
    var count = {};
    f.waterfallQuery("SELECT COUNT(*) AS initcount FROM tblwheelbindatabase WHERE activeStatus = 'a' AND areaID = '" + req.body.areaCode + "'").then(function (initcount) {
        count.initcount = initcount.initcount;
        return f.waterfallQuery("SELECT COUNT(DISTINCT tbltag.serialNo) AS 'actualcount' FROM tbltag JOIN tblwheelbindatabase ON tbltag.serialNo = tblwheelbindatabase.serialNo WHERE tbltag.date >= CURRENT_DATE AND tblwheelbindatabase.areaID = '" + req.body.areaCode + "' AND tblwheelbindatabase.activeStatus = 'a'");
    }).then(function (actualcount) {
        count.actualcount = actualcount.actualcount;
        res.json(count);
        res.end();
    });
});

app.post('/getInitDriver', function (req, res) {
    'use strict';
    
    var sql = " SELECT tblstaff.staffID AS 'driver' FROM tblstaff JOIN tblarea ON tblstaff.staffID = tblarea.driverID WHERE tblarea.areaID = '" + req.body.area + "' ";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/getReportOfficerTodayUnsubmitted', function (req, res) {
    'use strict';
    
    var sql = "SELECT DISTINCT CONCAT(tblzone.zoneCode,tblarea.areaCode) AS area FROM tblarea JOIN tblzone on tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaID NOT IN (SELECT tblreport.areaID FROM tblreport WHERE DATE(tblreport.creationDateTime) = CURDATE()) AND tblarea.collection_frequency LIKE '%" + req.body.day + "%' AND tblarea.staffID = '" + req.body.officerid + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/getReportOfficerTodaySubmitted', function (req, res) {
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