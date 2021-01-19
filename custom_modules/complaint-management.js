/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
//var variable = require('../variable');
var fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const e = require('express');
const storage = new Storage({
    keyFilename: './trienekens-management-portal-5c3ad8aa7ee2.json',
    projectId: 'trienekens-management-portal'
});
const bucketName = 'trienekens-management-portal-images';
const local_directory = './images/complaintOfficer';
const local_lg_directory = './images/complaintOfficer/lg-images';
const local_bd_directory = './images/complaintOfficer/bd-images';

app.post('/updateComplaintStatus', function(req, res) {
    'use strict';
    var sql = "UPDATE tblcomplaint SET status = (CASE WHEN '" + req.body.status + "' = 'Open' THEN 'o' WHEN '" + req.body.status + "' = 'Pending' THEN 'p' WHEN '" + req.body.status + "' = 'Invalid' THEN 'i' WHEN '" + req.body.status + "' = 'Closed' THEN 'c' END) WHERE complaintID = '" + req.body.id + "'",
        status = {
            "status": ""
        };
    database.query(sql, function(err, result) {
        if (err) {

            status.status = "error";
            res.json(status);
            throw err;
        } else {
            status.status = "success";
            res.json(status);
        }
    });
});

app.post('/updateComplaintDetailsStatus', function(req, res) {
    'use strict';
    
    database.query("SELECT histUpdateList FROM tblcomplaintofficer WHERE coID = '" + req.body.coID + "'", function(err, histdata){
        if (err){
            throw err;
        }else{
            if(histdata[0].histUpdateList == null){
                histdata[0].histUpdateList = "";
            }
            var histUpdateList = histdata[0].histUpdateList + "Logistics update CMS Status on: " + req.body.statusdate + ", " + req.body.statustime + " - " + req.body.status +  "\n";

            var sql = "UPDATE tblcomplaintofficer SET status = '" + req.body.status + "', readState = 'u', logsReadState = 'r', histUpdateList = '" + histUpdateList + "' WHERE coID = '" + req.body.coID + "' ";

            var status = {
                "status": ""
            };
            database.query(sql, function(err, result) {
                if (err) {

                    status.status = "error";
                    res.json(status);
                    throw err;
                } else {
                    status.status = "success";
                    res.json(status);
                }
            });
        }
    });
});

app.post('/updateComplaintDetailsCustStatus', function(req, res) {
    'use strict';
    
    database.query("SELECT histUpdateList FROM tblcomplaintofficer WHERE coID = '" + req.body.coID + "'", function(err, histdata){
        if (err){
            throw err;
        }else{    
            if(histdata[0].histUpdateList == null){
                histdata[0].histUpdateList = "";
            }            
            var histUpdateList = histdata[0].histUpdateList + "BD update status on: " + req.body.statusDate + ", " + req.body.statusTime + " - " + req.body.status + "\n";
            
            var sql = "UPDATE tblcomplaintofficer SET custStatus = '" + req.body.status + "', readState = 'r', logsReadState = 'u', histUpdateList = '" + histUpdateList + "' WHERE coID = '" + req.body.coID + "' ";

            var status = {
                "status": ""
            };
            database.query(sql, function(err, result) {
                if (err) {

                    status.status = "error";
                    res.json(status);
                    throw err;
                } else {
                    status.status = "success";
                    res.json(status);
                }
            });
        }
    });
});

app.post('/updateCMSStatus', function(req, res) {
    'use strict';
    
    database.query("SELECT histUpdateList FROM tblcomplaintofficer WHERE coID = '" + req.body.coID + "'", function(err, histdata){
        if (err){
            throw err;
        }else{
            if(histdata[0].histUpdateList == null){
                histdata[0].histUpdateList = "";
            }            
            var histUpdateList = histdata[0].histUpdateList + "CMS validity update on: " + req.body.cmsdate + ", " + req.body.cmstime + " - " + req.body.cmsstatus + "\n";

            var sql = "UPDATE tblcomplaintofficer SET cmsStatus = '" + req.body.cmsstatus + "', histUpdateList = '" + histUpdateList + "' WHERE coID = '" + req.body.coID + "' ";

            var status = {
                "status": ""
            };
            database.query(sql, function(err, result) {
                if (err) {

                    status.status = "error";
                    res.json(status);
                    throw err;
                } else {
                    status.status = "success";
                    res.json(status);
                }
            });            
        }
    });
    
    
    

});


app.post('/logsOfficerUpdateRemarks', function(req, res) {
    'use strict';
    var sql = "UPDATE tblcomplaintofficer SET remarks = '" + req.body.recordremarks + "', readState = 'u', logsReadState = 'r' WHERE coID = '" + req.body.coID + "' ";

    var status = {
        "status": ""
    };

    database.query(sql, function(err, result) {
        if (err) {

            status.status = "error";
            res.json(status);
            throw err;
        } else {
            status.status = "success";
            res.json(status);
        }
    });
});


//complaint module
app.post('/getComplaintList', function(req, res) {
    'use strict';

    var sql = "",
        readComplaintSql = "";

    if(req.body.zon == ""){
        sql = "SELECT * FROM (SELECT tblcomplaint.complaintDate AS 'date', tblcomplaint.complaint AS 'title', tbluser.name AS  'customer', tblcomplaint.premiseType AS 'type', tblarea.areaName AS 'area', CONCAT(tblzone.zoneCode,tblarea.areaCode) AS 'code', tblcomplaint.complaintID AS ' complaintID', (CASE WHEN tblcomplaint.status = 'c' THEN 'Closed' WHEN tblcomplaint.status = 'p' THEN 'Pending' WHEN tblcomplaint.status = 'i' THEN 'Invalid' WHEN tblcomplaint.status ='o' THEN 'Open' END) AS status, tblcomplaint.readStat AS 'readStat' FROM tblcomplaint JOIN tbluser ON tbluser.userID = tblcomplaint.userID LEFT OUTER JOIN tbltaman ON tbltaman.tamanID = tbluser.tamanID LEFT OUTER JOIN tblarea ON tblarea.areaID = tbltaman.areaID LEFT OUTER JOIN tblzone ON tblzone.zoneID = tblarea.zoneID) t1 LEFT OUTER JOIN (SELECT complaintID as 'chatCompID', COUNT(readStat) as 'unread' from tblchat WHERE readStat = 'u' and recipient LIKE 'A%' GROUP BY complaintID) t2 ON t1.complaintID = t2.chatCompID ORDER BY t1.date DESC";
    }else{
        sql = "SELECT * FROM (SELECT tblcomplaint.complaintDate AS 'date', tblcomplaint.complaint AS 'title', tbluser.name AS  'customer', tblcomplaint.premiseType AS 'type', tblarea.areaName AS 'area', CONCAT(tblzone.zoneCode,tblarea.areaCode) AS 'code', tblcomplaint.complaintID AS ' complaintID', (CASE WHEN tblcomplaint.status = 'c' THEN 'Closed' WHEN tblcomplaint.status = 'p' THEN 'Pending' WHEN tblcomplaint.status = 'i' THEN 'Invalid' WHEN tblcomplaint.status ='o' THEN 'Open' END) AS status, tblcomplaint.readStat AS 'readStat' FROM tblcomplaint JOIN tbluser ON tbluser.userID = tblcomplaint.userID LEFT OUTER JOIN tbltaman ON tbltaman.tamanID = tbluser.tamanID LEFT OUTER JOIN tblarea ON tblarea.areaID = tbltaman.areaID LEFT OUTER JOIN tblzone ON tblzone.zoneID = tblarea.zoneID WHERE tblcomplaint.zon = '" + req.body.zon + "') t1 LEFT OUTER JOIN (SELECT complaintID as 'chatCompID', COUNT(readStat) as 'unread' from tblchat WHERE readStat = 'u' and recipient LIKE 'A%' GROUP BY complaintID) t2 ON t1.complaintID = t2.chatCompID ORDER BY t1.date DESC";
    }
    

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        //res.send("New Complaint Read");
        res.json(result);
    });
});

app.get('/getComplaintLoc', function(req, res) {
    'use strict';
    var sql = "SELECT tblcomplaint.complaintID, tblcomplaint.complaintDate AS 'date', tbltaman.longitude AS 'longitude', tbltaman.latitude AS 'latitude', tblarea.areaName AS 'area', CONCAT(tblzone.zoneCode,tblarea.areaCode) AS 'code', tbltaman.tamanName as 'taman', tbluser.name AS 'customer', tblcomplaint.status AS 'status' FROM tbluser JOIN tbltaman ON tbluser.tamanID = tbltaman.tamanID JOIN tblarea ON tblarea.areaID = tbltaman.areaID JOIN tblcomplaint ON tblcomplaint.userID = tbluser.userID JOIN tblzone ON tblzone.zoneID = tblarea.zoneID";

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//read complaint
// app.post('/readComplaint', function(req, res) {
//     'use strict';
//     var sql = "UPDATE tblcomplaint SET readStat = 'r'";
//     database.query(sql, function(err, result) {
//         res.send("Complaint Read");
//         res.end();
//     });
// });

//get complaint detail by id
app.post('/getComplaintDetail', function(req, res) {
    'use strict';
    var sql = "SELECT co.complaintID, co.premiseType, co.complaint, co.premiseComp, co.staffID, co.remarks, co.complaintImg, co.complaintDate, cu.name, cu.contactNumber, co.complaintAddress AS address, a.areaID, a.areaName, CONCAT(z.zoneCode,a.areaCode) AS 'code', (CASE WHEN co.status = 'o' THEN 'Open' WHEN co.status = 'p' THEN 'Pending' WHEN co.status = 'i' THEN 'Invalid' WHEN co.status = 'c' THEN 'Closed' END) AS status from tblcomplaint co JOIN tbluser cu ON co.userID = cu.userID LEFT OUTER JOIN tbltaman ON tbltaman.tamanID = cu.tamanID LEFT OUTER JOIN tblarea a ON a.areaID = tbltaman.areaID LEFT OUTER JOIN tblzone z ON z.zoneID = a.zoneID WHERE co.complaintID = '" + req.body.id + "'";

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        } else {
            database.query("UPDATE tblcomplaint SET readStat = 'r' WHERE complaintID = '" + req.body.id + "' ", function(err2, result2) {
                if (err) {
                    throw err2;
                } else {
                    res.json(result);
                }
            });
        }

    });
});

//get report date list for complaint by id
app.post('/getDateListForComplaint', function(req, res) {
    'use strict';
    var sql = "SELECT reportID, reportCollectionDate as date FROM tblreport WHERE areaID = '" + req.body.id + "' ORDER BY reportCollectionDate DESC";

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getReportForComplaint', function(req, res) {
    'use strict';
    var content = '',
        sql;

    sql = "SELECT tblreport.reportID AS id, tblreport.areaID AS area, tblreport.reportCollectionDate AS date, tblreport.operationTimeStart AS startTime, tblreport.operationTimeEnd AS endTime, tblreport.remark, tblreport.garbageAmount AS ton, tblreport.iFleetMap AS ifleet, tbltruck.truckNum AS truck, tbltruck.truckID as truckID, tbltruck.transporter AS transporter, tblstaff.staffName AS driver, tblstaff.staffID AS driverID, GROUP_CONCAT(tbltaman.tamanName) AS collection, tblarea.collection_frequency AS frequency, tblreport.completionStatus as status FROM tblreport JOIN tbltruck ON tbltruck.truckID = tblreport.truckID JOIN tblstaff ON tblreport.driverID = tblstaff.staffID JOIN tblarea ON tblarea.areaID = tblreport.areaID JOIN tbltaman ON tbltaman.areaID = tblarea.areaID WHERE tblreport.reportID = '" + req.body.reportID + "' GROUP BY tblreport.areaID";
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        } else {
            database.query("SELECT tblstaff.staffName FROM tblstaff JOIN tblreport ON tblstaff.staffID = tblreport.staffID WHERE tblreport.reportID = '" + req.body.reportID + "' ", function(err2, area) {
                if (err) {
                    throw err;
                } else {
                    result[0].reportingStaff = area[0].staffName;


                    content += '<div class="row"><div class="col-md-12"><table border="1"><thead><tr><th colspan="2">IVWM INSPECTION REPORT ID: ' + result[0].id + '</th><th>Completion Status:' + result[0].status + '</th><th>Collection Date: ' + result[0].date + '</th><th>Garbage Amount(ton): ' + result[0].ton + '</th><th>Time Start: ' + result[0].startTime + '</th><th>Time End: ' + result[0].endTime + '</th><th>Reporting Staff: ' + result[0].reportingStaff + '</th></tr><tr><th>Area</th><th>Collection Area</th><th>COLLECTION FREQUENCY</th><th>BIN CENTERS</th><th>ACR CUSTOMER</th><th>TRANSPORTER</th><th>TRUCK NO.</th><th>DRIVER</th></tr></thead><tbody><tr><td>' + result[0].area + '</td><td>' + result[0].collection + '</td><td>' + result[0].frequency + '</td><td >programReplaceBinHere</td><td>programReplaceACRHere</td><td>' + result[0].transporter + '</td><td>' + result[0].truck + '</td><td>' + result[0].driver + '</td></tr><tr><td>Remarks:</td><td colspan="7">' + result[0].remark + '</td></tr></tbody></table></div></div>';

                    res.json({ "content": content, "result": result });
                }
            });
        }
    });

});

app.post('/submitOfficeMadeComplaint', function(req, res) {
    'use strict';

    var images = req.body.compImg.split("|");

    if (!fs.existsSync(local_directory)) {
        fs.mkdirSync(local_directory);
    }
    if (!fs.existsSync(local_lg_directory)) {
        fs.mkdirSync(local_lg_directory);
    }

    f.makeID("complaint", req.body.creationDate).then(function(ID) {

        images.forEach(function(image, index) {
            if (image !== 'undefined') {
                let base64Image = image.split(';base64,').pop();
                var extension = image.split(';base64,')[0].split('/')[1];
                var image_path = '/' + ID + '(' + index + ')' + '.' + extension;
                var local_store_path = 'images/complaintOfficer/lg-images' + image_path,
                    public_url = 'https://storage.googleapis.com/' + bucketName + '/' + local_store_path;

                fs.writeFile(local_store_path, base64Image, { encoding: 'base64' }, async function(err) {
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
                images[index] = public_url;
            } else {
                images[index] = 'undefined';
            }
        });


        images = images[0] + "|" + images[1] + "|" + images[2] + "|" + images[3];
        var nameFormatted = req.body.compName.replace(/'/g,"\\'");
        var companyFormatted = req.body.compCompany.replace(/'/g,"\\'");
        var addressFormatted = req.body.compAddress.replace(/'/g,"\\'");
        var compTypeFormatted = req.body.compType.replace(/'/g,"\\'");
        var sql = "INSERT INTO tblcomplaintofficer(coID,complaintDate, complaintTime, sorce, refNo, name, company, telNo, address, type, typeCode, logisticsDate, logisticsTime, logisticsBy, creationDateTime, compImg, step, services, readState, logsReadState, status, custStatus, activeStatus, zon) VALUE ('" + ID + "', date(now()), time(now()), '" + req.body.compSource + "', '" + req.body.compRefNo + "', '" + nameFormatted + "', '" + companyFormatted + "', '" + req.body.compPhone + "', '" + addressFormatted + "','" + compTypeFormatted + "', '" + req.body.compTypeCode + "', date(now()), time(now()), '" + req.body.compLogBy + "', now(), '" + images + "', 1, '" + req.body.services + "', 'r', 'u', 'open', 'open', '1', '" + req.body.zon + "')";

        database.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.json({ "status": "success", "message": "Complaint Submitted" });
        });
    });

});


app.post('/editOfficeMadeComplaint', function(req, res) {
    'use strict';

    var sql = "UPDATE tblcomplaintofficer SET complaintDate = '" + req.body.complaintDate + "', complaintTime = '" + req.body.complaintTime + "', sorce = '" + req.body.sorce + "', refNo = '" + req.body.refNo + "', name = '" + req.body.name + "', company = '" + req.body.company + "', telNo = '" + req.body.telNo + "', address = '" + req.body.address + "' , under = '" + req.body.under + "' , council = '" + req.body.council + "' , type = '" + req.body.type + "' , logisticsDate = '" + req.body.logisticsDate + "' , logisticsTime = '" + req.body.logisticsTime + "' , logisticsBy = '" + req.body.logisticsBy + "' , customerDate = '" + req.body.customerDate + "', customerTime = '" + req.body.customerTime + "' , customerBy = '" + req.body.customerBy + "' , recordedDate = '" + req.body.recordedDate + "', recordedTime = '" + req.body.recordedTime + "' , recordedBy = '" + req.body.recordedBy + "' , forwardedSub = '" + req.body.forwardedSub + "' , forwardedDate = '" + req.body.forwardedDate + "' , forwardedTime = '" + req.body.forwardedTime + "', forwardedBy = '" + req.body.forwardedBy + "', status = '" + req.body.status + "', statusClosed = '" + req.body.statusClosed + "', statusDate = '" + req.body.statusDate + "' , statusTime = '" + req.body.statusTime + "' , statusBy = '" + req.body.statusBy + "', remarks = '" + req.body.remarks + "' WHERE coID = '" + req.body.coID + "'";

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({ "status": "success", "message": "Complaint Editted" });
    });

});

app.post('/updateWCD', function(req,res){
    'use strict';
    
    var sql="UPDATE tblcomplaintofficer SET wasteColDT = '" + req.body.data + "' WHERE coID = '" + req.body.coID + "'";
    
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({ "status": "success", "message": "Waste of Complaint Updated" });
    });    
});

app.post('/submitEditTOC', function(req,res){
    'use strict';
    
    var sql="UPDATE tblcomplaintofficer SET type = '" + req.body.type + "' WHERE coID = '" + req.body.coID + "'";
    
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({ "status": "success", "message": "Type of Services Editted" });
    });    
});

app.post('/getComplaintOfficerList', function(req, res) {
    'use strict';

    if(req.body.zon == ''){
        var sql = "SELECT tblcomplaintofficer.coID AS 'coID', CONCAT(tblcomplaintofficer.complaintDate,' ',tblcomplaintofficer.complaintTime) AS 'complaintDate', tblcomplaintofficer.bdKPI AS 'bdKPI', bdKPIAchieve AS 'bdKPIAchieve', tblcomplaintofficer.name AS 'name', tblcomplaintofficer.company AS 'company', tblcomplaintofficer.step AS 'step', tblcomplaintofficer.services  AS 'services', tblcomplaintofficer.creationDateTime, CONCAT(tblcomplaintofficer.statusDate,' ',tblcomplaintofficer.statusTime) AS logisticsDateTime, CONCAT(tblcomplaintofficer.customerDate,' ',tblcomplaintofficer.customerTime) AS customerDateTime, tblcomplaintofficer.status AS 'lgStatus', tblcomplaintofficer.custStatus AS 'bdStatus', tblcomplaintofficer.cmsStatus AS 'cmsStatus', tblcomplaintofficer.readState AS 'readState', tblcomplaintofficer.contactStatus AS 'contactStatus' FROM tblcomplaintofficer WHERE tblcomplaintofficer.activeStatus = '1' ORDER BY tblcomplaintofficer.creationDateTime DESC";
    }else{
        var sql = "SELECT tblcomplaintofficer.coID AS 'coID', CONCAT(tblcomplaintofficer.complaintDate,' ',tblcomplaintofficer.complaintTime) AS 'complaintDate', tblcomplaintofficer.bdKPI AS 'bdKPI', bdKPIAchieve AS 'bdKPIAchieve', tblcomplaintofficer.name AS 'name', tblcomplaintofficer.company AS 'company', tblcomplaintofficer.step AS 'step', tblcomplaintofficer.services  AS 'services', tblcomplaintofficer.creationDateTime, CONCAT(tblcomplaintofficer.statusDate,' ',tblcomplaintofficer.statusTime) AS logisticsDateTime, CONCAT(tblcomplaintofficer.customerDate,' ',tblcomplaintofficer.customerTime) AS customerDateTime, tblcomplaintofficer.status AS 'lgStatus', tblcomplaintofficer.custStatus AS 'bdStatus', tblcomplaintofficer.cmsStatus AS 'cmsStatus', tblcomplaintofficer.readState AS 'readState', tblcomplaintofficer.contactStatus AS 'contactStatus' FROM tblcomplaintofficer WHERE tblcomplaintofficer.activeStatus = '1' AND zon = '" + req.body.zon + "' ORDER BY tblcomplaintofficer.creationDateTime DESC";
    }

    database.query(sql, function(err, result) {

        if (err) {
            throw err;
        }
        res.json(result);
    });

});

app.post('/getLogisticsComplaintList', function(req, res) {
    'use strict';

    if(req.body.zon == ''){
        var sql = "SELECT tblcomplaintofficer.coID AS 'coID', tblcomplaintofficer.complaintDate AS 'complaintDate', CONCAT(tblcomplaintofficer.statusDate,' ',tblcomplaintofficer.statusTime) AS logisticsDateTime, tblcomplaintofficer.name AS 'name', tblcomplaintofficer.company AS 'company', tblcomplaintofficer.reason AS 'reason', tblcomplaintofficer.step AS 'step', tblcomplaintofficer.services AS 'services', tblcomplaintofficer.status AS 'status', tblstaff.staffName AS 'staff', tblcomplaintofficer.logsReadState AS 'logsReadState', (SELECT tblstaff.staffName FROM tblstaff WHERE tblstaff.staffID = tblcomplaintofficer.logisticsReview) AS 'logsReview', tblcomplaintofficer.lgKPI AS 'lgKPI', tblcomplaintofficer.lgKPIAchieve AS 'lgKPIAchieve' FROM tblcomplaintofficer LEFT JOIN tblstaff ON tblcomplaintofficer.logisticsBy = tblstaff.staffID WHERE step >= 1 AND tblcomplaintofficer.activeStatus = '1' ORDER BY tblcomplaintofficer.creationDateTime DESC";
    }else{
        var sql = "SELECT tblcomplaintofficer.coID AS 'coID', tblcomplaintofficer.complaintDate AS 'complaintDate', CONCAT(tblcomplaintofficer.statusDate,' ',tblcomplaintofficer.statusTime) AS logisticsDateTime, tblcomplaintofficer.name AS 'name', tblcomplaintofficer.company AS 'company', tblcomplaintofficer.reason AS 'reason', tblcomplaintofficer.step AS 'step', tblcomplaintofficer.services AS 'services', tblcomplaintofficer.status AS 'status', tblstaff.staffName AS 'staff', tblcomplaintofficer.logsReadState AS 'logsReadState', (SELECT tblstaff.staffName FROM tblstaff WHERE tblstaff.staffID = tblcomplaintofficer.logisticsReview) AS 'logsReview', tblcomplaintofficer.lgKPI AS 'lgKPI', tblcomplaintofficer.lgKPIAchieve AS 'lgKPIAchieve' FROM tblcomplaintofficer LEFT JOIN tblstaff ON tblcomplaintofficer.logisticsBy = tblstaff.staffID WHERE step >= 1 AND tblcomplaintofficer.activeStatus = '1' AND zon = '" + req.body.zon + "' ORDER BY tblcomplaintofficer.creationDateTime DESC";
    }
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});

app.get('/getComplaintExportList', function(req, res){
    'use strict';
    
    var sql="SELECT CONCAT(tblcomplaintofficer.complaintDate,' ',tblcomplaintofficer.complaintTime) AS 'complaintDate',  CONCAT(tblcomplaintofficer.statusDate,' ',tblcomplaintofficer.statusTime) AS logisticsDateTime, CONCAT(tblcomplaintofficer.customerDate,' ',tblcomplaintofficer.customerTime) AS customerDateTime, (CASE WHEN tblcomplaintofficer.services = '1' THEN 'Compactor' WHEN tblcomplaintofficer.services = '2' THEN 'Hooklift' WHEN tblcomplaintofficer.services = '3' THEN 'Scheduled Waste' END) AS 'services', tblcomplaintofficer.type, tblcomplaintofficer.forwardedSub AS 'forwardedSub', tblcomplaintofficer.name AS 'name', tblcomplaintofficer.sorce AS 'source', tblcomplaintofficer.company AS 'company', tblcomplaintofficer.address AS 'address', tblcomplaintofficer.status AS 'lgStatus', tblcomplaintofficer.custStatus AS 'bdStatus', (CASE WHEN tblcomplaintofficer.cmsStatus = '1' THEN 'Valid' WHEN tblcomplaintofficer.cmsStatus = '2' THEN 'Invalid' WHEN tblcomplaintofficer.cmsStatus = '3' THEN 'To Be Reviewed' END) AS 'cmsStatus', SUBSTRING_INDEX(tblcomplaintofficer.under, ',' , -1) AS 'area', (SELECT tblstaff.staffName FROM tblstaff WHERE staffID = tblcomplaintofficer.driver) AS 'driver', tblcomplaintofficer.remarks AS 'remarks', tblcomplaintofficer.wasteColDT AS 'wasteColDT', (SELECT tblstaff.staffName FROM tblstaff WHERE tblstaff.staffID = tblcomplaintofficer.forwardedBy) AS 'respondent', (SELECT tblstaff.staffName FROM tblstaff WHERE tblstaff.staffID = tblcomplaintofficer.logisticsReview) AS 'logisticsReview', (SELECT tblstaff.staffName FROM tblstaff WHERE tblstaff.staffID = tblcomplaintofficer.customerReview) AS 'customerReview', tblcomplaintofficer.zon AS 'zon' from tblcomplaintofficer WHERE tblcomplaintofficer.activeStatus = '1' ORDER BY zon DESC, creationDateTime DESC";
    
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    })
});

app.post('/getCmsDailyReportList', function(req, res){
    'use strict';

    var sql="SELECT tblcomplaintofficer.coID AS 'coID', tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.complaintTime AS 'complaintTime', tblcomplaintofficer.services AS 'services', tblcomplaintofficer.name AS 'name',CONCAT(tblcomplaintofficer.complaintDate,' ',tblcomplaintofficer.complaintTime) AS 'complaintDateTime', tblcomplaintofficer.type as 'type', tblcomplaintofficer.forwardedSub AS 'subcon', tblcomplaintofficer.under AS 'area', tblstaff.staffName AS 'driver', tblcomplaintofficer.statusDate AS 'statusDate', tblcomplaintofficer.statusTime AS 'statusTime', CONCAT(tblcomplaintofficer.forwardedDate,' ',tblcomplaintofficer.forwardedTime) AS 'forwardSubconDateTime', tblcomplaintofficer.wasteColDT AS 'wasteColDT', tblcomplaintofficer.remarks AS 'remarks', (SELECT tblstaff.staffName FROM tblstaff WHERE tblstaff.staffID = tblcomplaintofficer.logisticsReview) AS 'logsReview', tblcomplaintofficer.logisticsReviewDate AS 'logsReviewDate', tblcomplaintofficer.reason AS 'reason', tblcomplaintofficer.trucK AS 'truck' FROM tblcomplaintofficer LEFT JOIN tblstaff ON tblcomplaintofficer.driver = tblstaff.staffID WHERE tblcomplaintofficer.activeStatus = 1 AND tblcomplaintofficer.services = '" + req.body.services + "' AND tblcomplaintofficer.zon = '" + req.body.zon + "' AND tblcomplaintofficer.complaintDate BETWEEN '" + req.body.startDate + "' AND '" + req.body.endDate + "' ORDER BY complaintDateTime DESC";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});

app.post('/getCmsDatasheet', function(req ,res){
    'use strict';

    var sql= "SELECT tblcomplaintofficer.coID AS 'coID', tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.complaintTime AS 'complaintTime', tblcomplaintofficer.customerDate AS 'customerDate', tblcomplaintofficer.customerTime AS 'customerTime', tblcomplaintofficer.services AS 'services', tblcomplaintofficer.under AS 'area', tblcomplaintofficer.forwardedSub AS 'subcon', tblcomplaintofficer.name AS 'name', tblcomplaintofficer.company AS 'company', tblcomplaintofficer.address AS 'address', tblcomplaintofficer.type AS 'type', tblcomplaintofficer.remarks AS 'remarks', tblcomplaintofficer.wasteColDT AS 'wasteColDT', tblstaff.staffName AS 'driver', tblcomplaintofficer.typeCode AS 'typeCode' FROM tblcomplaintofficer LEFT JOIN tblstaff ON tblcomplaintofficer.driver = tblstaff.staffID WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND tblcomplaintofficer.services = '" + req.body.services + "' AND tblcomplaintofficer.complaintDate BETWEEN '" + req.body.startDate + "' AND '" + req.body.endDate + "'  ORDER BY complaintDate DESC";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});

app.post('/getComplaintOfficerDetail', function(req, res) {
    'use strict';

    var sql = "SELECT * FROM tblcomplaintofficer WHERE coID = '" + req.body.coID + "'";

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        } else {

            database.query("UPDATE tblcomplaintofficer SET readState = 'r' WHERE coID = '" + req.body.coID + "' ", function(err2, result2) {
                if (err) {
                    throw err2;
                } else {
                    res.json({
                        "data": result,
                        "status": "success"
                    });
                }
            });
        }
    });
});

app.post('/getLogisticsComplaintDetail', function(req, res) {
    'use strict';

    var sql = "SELECT tblcomplaintofficer.complaintDate as 'complaintDate', tblcomplaintofficer.complaintTime as 'complaintTime', tblcomplaintofficer.sorce as 'sorce', tblcomplaintofficer.refNo as 'refNo', tblcomplaintofficer.name as 'name', tblcomplaintofficer.company as 'company', tblcomplaintofficer.telNo as 'telNo', tblcomplaintofficer.address as 'address', tblcomplaintofficer.services as 'services', tblcomplaintofficer.type as 'type', tblcomplaintofficer.step AS 'step', tblcomplaintofficer.logisticsDate as 'logisticsDate', tblcomplaintofficer.logisticsTime as 'logisticsTime', tblstaff.staffName as 'logisticsBy', tblcomplaintofficer.compImg as 'compImg', tblcomplaintofficer.zon AS 'zon' FROM tblcomplaintofficer LEFT JOIN tblstaff ON tblcomplaintofficer.logisticsBy = tblstaff.staffID WHERE coID = '" + req.body.coID + "'";


    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        } else {

            database.query("UPDATE tblcomplaintofficer SET logsReadState = 'r' WHERE coID = '" + req.body.coID + "' ", function(err2, result2) {
                if (err) {
                    throw err2;
                } else {
                    res.json({
                        "data": result,
                        "status": "success"
                    });
                }
            });
        }

    });
});

app.post('/getLogisticsFullComplaintDetail', function(req, res) {
    'use strict';

    var sql = "SELECT tblcomplaintofficer.under AS 'area', tblcomplaintofficer.council AS 'council', tblcomplaintofficer.forwardedSub AS 'sub', tblcomplaintofficer.forwardedDate AS 'subDate', tblcomplaintofficer.forwardedTime AS 'subTime', tblstaff.staffName AS 'subBy', tblcomplaintofficer.status AS 'status', tblcomplaintofficer.statusDate AS 'statusDate', tblcomplaintofficer.statusTime AS 'statusTime', tblcomplaintofficer.remarks AS 'remarks', tblcomplaintofficer.logsImg AS 'logsImg', tblcomplaintofficer.custStatus AS 'custStatus', tblcomplaintofficer.customerDate AS 'custDate', tblcomplaintofficer.customerTime AS 'custTime', tblcomplaintofficer.customerBy AS 'custBy', tblcomplaintofficer.contactStatus AS 'contactStatus', tblcomplaintofficer.cmsStatus AS 'cmsStatus', tblcomplaintofficer.driver AS 'driver', tblcomplaintofficer.logisticsReview AS 'logisticsReview', tblcomplaintofficer.wasteColDT AS 'wasteColDT', tblcomplaintofficer.truck AS 'truck', tblcomplaintofficer.reason AS 'reason' FROM tblcomplaintofficer LEFT JOIN tblstaff ON tblcomplaintofficer.forwardedBy = tblstaff.staffID WHERE coID = '" + req.body.coID + "'";

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({
            "data": result,
            "status": "success"
        });
    });
});

app.post('/submitLogisticsComplaint', function(req, res) {
    'use strict';

    var images = req.body.logsImg.split("|");

    if (!fs.existsSync(local_directory)) {
        fs.mkdirSync(local_directory);
    }
    if (!fs.existsSync(local_bd_directory)) {
        fs.mkdirSync(local_bd_directory);
    }

    images.forEach(function(image, index){
        if (image !== 'undefined') {
            let base64Image = image.split(';base64,').pop();
            var extension = image.split(';base64,')[0].split('/')[1];
            var image_path = '/' + req.body.coID + '(' + index + ')' + '.' + extension;
            var local_store_path = 'images/complaintOfficer/bd-images' + image_path,
                public_url = 'https://storage.googleapis.com/' + bucketName + '/' + local_store_path;

            fs.writeFile(local_store_path, base64Image, { encoding: 'base64' }, async function(err) {
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
            images[index] = public_url;
        } else {
            images[index] = 'undefined';
        }
    });
    
    images = images[0] + "|" + images[1] + "|" + images[2] + "|" +images[3];
    console.log(req.body.wasteColDT);

    var remarkFormatted = req.body.remark.replace(/'/g,"\\'");

    if (req.body.subDate == null || req.body.subTime == null) {
        var sql = "UPDATE tblcomplaintofficer SET under = '" + req.body.areaUnder + "', council = '" + req.body.areaCouncil + "', forwardedSub = '" + req.body.sub + "', forwardedDate = " + req.body.subDate + ", forwardedTime = " + req.body.subTime + ", forwardedBy = '" + req.body.by + "', cmsStatus = '" + req.body.cmsStatus + "', status = '" + req.body.status + "', statusDate = date(now()) , statusTime = time(now()), remarks = '" + remarkFormatted + "', logsImg = '" + images + "', step = 2, readState = 'u', logsReadState = 'r', driver = '" + req.body.driver + "', wasteColDT = '" + req.body.wasteColDT + "', truck = '" + req.body.truck + "', reason = '" + req.body.reason + "', lgKPI = '" + req.body.lgKPI + "', lgKPIAchieve = '" + req.body.lgKPIAchieve + "' WHERE coID = '" + req.body.coID + "' ";
    } else {
        var sql = "UPDATE tblcomplaintofficer SET under = '" + req.body.areaUnder + "', council = '" + req.body.areaCouncil + "', forwardedSub = '" + req.body.sub + "', forwardedDate = '" + req.body.subDate + "', forwardedTime = '" + req.body.subTime + "', forwardedBy = '" + req.body.by + "', cmsStatus = '" + req.body.cmsStatus + "',  status = '" + req.body.status + "', statusDate = date(now()) , statusTime =  time(now()) , remarks = '" + remarkFormatted + "', logsImg = '" + images + "', step = 2, readState = 'u', logsReadState = 'r', driver = '" + req.body.driver + "', wasteColDT = '" + req.body.wasteColDT + "', truck = '" + req.body.truck + "', reason = '" + req.body.reason + "', lgKPI = '" + req.body.lgKPI + "', lgKPIAchieve = '" + req.body.lgKPIAchieve + "' WHERE coID = '" + req.body.coID + "' ";
    }

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({
            "message": "Complaint Submitted",
            "status": "success"
        });
    });
});

app.post('/updateLogisticsCMSEdit', function(req, res){
    'use strict';
    var sql = "UPDATE tblcomplaintofficer SET under = '" + req.body.area + "', council = '" + req.body.council + "', forwardedSub = '" + req.body.sub + "', truck = '" + req.body.truck + "', driver = '" + req.body.driver + "', reason = '" + req.body.reason + "' WHERE coID = '" + req.body.coID + "'";

    database.query(sql, function(err, result){
        if (err) {
            throw err;
        }
        res.json({
            "message": "Data updated",
            "status": "success"
        });
    })
})

app.post('/updateComplaintImages', function(req, res) {
    'use strict';
    
    var images = req.body.images.split("|");
    
    images.forEach(function(image, index){
        if (image !== '' && image.search('googleapis') >= 0) {
            images[index] = image;
        }else if(image !== '' && image.search('googleapis') === -1){
            let base64Image = image.split(';base64,').pop();
            var extension = image.split(';base64,')[0].split('/')[1];
            var image_path = '/' + req.body.coID + '(' + index + ')' + '.' + extension;
            var local_store_path = 'images/complaintOfficer/bd-images' + image_path,
                public_url = 'https://storage.googleapis.com/' + bucketName + '/' + local_store_path;

            fs.writeFile(local_store_path, base64Image, { encoding: 'base64' }, async function(err) {
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
            images[index] = public_url;
        } else {
            images[index] = 'undefined';
        }
    });
    
    if(req.body.department === "LG"){
        images = images[0] + "|" + images[1] + "|" + images[2] + "|" + images[3];
        var sql = "UPDATE tblcomplaintofficer SET compImg = '" + images + "' WHERE coID = '" + req.body.coID + "'";
    }else if(req.body.department === "BD"){
        images = images[0] + "|" + images[1] + "|" + images[2] + "|" + images[3];
        var sql = "UPDATE tblcomplaintofficer SET logsImg = '" + images + "' WHERE coID = '" + req.body.coID + "'";
    }
    
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({
            "message": "Images Updated",
            "status": "success"
        });
    });
    
});

app.post('/updateCustInformation', function(req, res) {
    'use strict';

    var sql = "UPDATE tblcomplaintofficer SET customerDate = '" + req.body.custDate + "', customerTime = '" + req.body.custTime + "', customerBy = '" + req.body.custBy + "', step = 3, custStatus = '" + req.body.custStatus + "', contactStatus = '" + req.body.contactStatus + "', readState = 'r', logsReadState = 'u', bdKPI = '" + req.body.bdKPI + "', bdKPIAchieve = '" + req.body.bdKPIAchieve + "' WHERE coID = '" + req.body.coID + "' ";

    console.log("UPDATE tblcomplaint SET status = 'i' WHERE complaintID = '" + req.body.refNo + "'");
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }else{
            if(req.body.custStatus == 'closed' && req.body.sorce == 'Mobile App'){
                database.query("UPDATE tblcomplaint SET status = 'c' WHERE complaintID = '" + req.body.refNo + "'",function(err2, result2){
                    if(err2){
                        throw err2;
                    }
                    res.json({
                        "message": "Information updated",
                        "status": "success"
                    });
                })
            }else{
                res.json({
                    "message": "Information updated",
                    "status": "success"
                });
            }
        }
    });
});

app.post('/updateComplaintReview', function(req, res) {
    'use strict';

    if(req.body.department === "LG"){
        var sql = "UPDATE tblcomplaintofficer SET logisticsReview = '" + req.body.staffID + "', logisticsReviewDate = date(now()) WHERE coID = '" + req.body.coID + "'";
    }else if(req.body.department === "BD"){
        var sql = "UPDATE tblcomplaintofficer SET customerReview = '" + req.body.staffID + "' WHERE coID = '" + req.body.coID + "'";
    }

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({
            "message": "Complaint is Reviewed",
            "status": "success"
        });
    });
});

app.post('/updateComplaintReviewDaily', function(req, res) {
    'use strict';

    console.log(req.body.coID.length);
    var sql = "UPDATE tblcomplaintofficer SET logisticsReview = '" + req.body.staffID + "', logisticsReviewDate = date(now()) WHERE";

    for(var i=0; i<req.body.coID.length; i++){
        if(i != 0){
            sql += 'OR';
        }
        sql += " coID = '" + req.body.coID[i] + "'"
    }

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({
            "message": "Complaint is Reviewed",
            "status": "success"
        });
    });
});

app.post('/verifyAppComp', function(req, res) {
    'use strict';
    if(req.body.img == null){
        req.body.img = "";
    }
    
    var typeFormatted = req.body.type.replace(/'/g,"\\'");

    f.makeID("complaint", req.body.creationDate).then(function(ID) {
        var sql = "INSERT INTO tblcomplaintofficer(coID,complaintDate, complaintTime, sorce, refNo, name, company, telNo, address, type, typeCode, logisticsDate, logisticsTime, logisticsBy, creationDateTime, compImg, step, services, readState, logsReadState, cmsStatus, activeStatus, status, custStatus, zon) VALUE ('" + ID + "', date(now()), time(now()), '" + req.body.source + "', '" + req.body.refNo + "', '" + req.body.name + "', '" + req.body.company + "','" + req.body.telNo + "', '" + req.body.address + "','" + typeFormatted + "', '" + req.body.typeCode + "','" + req.body.forwardLogisticsDate + "', '" + req.body.forwardLogisticsTime + "', '" + req.body.forwardLogisticsBy + "', '" + req.body.creationDate + "', '" + req.body.img + "', 1, '" + req.body.services + "', 'r', 'u', '" + req.body.cmsStatus + "', '1', '" + req.body.lgStatus + "', '" + req.body.bdStatus + "', '" + req.body.zon + "')";

        database.query(sql, function(err, result) {
            if (err) {
                throw err;
            }else{
                var sql2=" UPDATE tblcomplaint SET status = 'o' WHERE complaintID = '" + req.body.refNo + "'";
                database.query(sql2, function(err2, result2){
                    if(err){
                        throw err;
                    }else{
                        res.json({ "status": "success", "message": "Complaint Sent to Logistics" });
                    }
                });
            }
        });
    });
});

app.post('/setAppNotApplicable', function(req, res){
    'use strict';

    var sql = "UPDATE tblcomplaint SET status = 'i' WHERE complaintID = '" + req.body.complaintID + "'";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }else{
            res.json({ "status": "success", "message": "Status 'Invalid' has been update" });
        }
    });

});

app.post('/setIncharge', function(req, res) {
    'use strict';
    if (req.body.staffID == null) {
        var sql = "UPDATE tblcomplaint SET staffID = " + req.body.staffID + " WHERE complaintID = '" + req.body.complaintID + "'";
    } else {
        var sql = "UPDATE tblcomplaint SET staffID = '" + req.body.staffID + "' WHERE complaintID = '" + req.body.complaintID + "'";
    }

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/deleteComplaint', function(req,res){
   'use strict';
    var sql = "UPDATE tblcomplaintofficer SET activeStatus = 0 WHERE coID = '" + req.body.coID+ "';";
    
    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json({"status":"success", "message":"Complaint has been deleted."});
        }
        
    });
});

app.post('/getCmsStatistics', function(req,res){
    'use strict';
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var result = {}

    f.waterfallQuery("SELECT COUNT(*) AS 'tsCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND forwardedSub = 'Trienekens' AND services = '1' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "' ").then(function(tsCount){
        result.tsCount = tsCount.tsCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'mpCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND forwardedSub = 'Mega Power' AND services = '1' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(mpCount){
        result.mpCount = mpCount.mpCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'takCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND forwardedSub = 'TAK' AND services = '1' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(takCount){
        result.takCount = takCount.takCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'roroTSCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND forwardedSub = 'Trienekens' AND services = '2' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(roroTSCount){
        result.roroTSCount = roroTSCount.roroTSCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'roroMPCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND forwardedSub = 'Mega Power' AND services = '2' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(roroMPCount){
        result.roroMPCount = roroMPCount.roroMPCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'roroTAKCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND forwardedSub = 'TAK' AND services = '2' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(roroTAKCount){
        result.roroTAKCount = roroTAKCount.roroTAKCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'mbksCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND services = '1' AND council = 'MBKS' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(mbksCount){
        result.mbksCount = mbksCount.mbksCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'dbkuCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND services = '1' AND council = 'DBKU' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(dbkuCount){
        result.dbkuCount = dbkuCount.dbkuCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'mppCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND services = '1' AND council = 'MPP' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(mppCount){
        result.mppCount = mppCount.mppCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'mdsCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND services = '1' AND council = 'MDS' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(mdsCount){
        result.mdsCount = mdsCount.mdsCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'scheduledCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND services = '3' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(scheduledCount){
        result.scheduledCount = scheduledCount.scheduledCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'validMWCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND cmsStatus = '1' AND services = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(validMWCount){
        result.validMWCount = validMWCount.validMWCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'validROROCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND cmsStatus = '1' AND services = '2' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(validROROCount){
        result.validROROCount = validROROCount.validROROCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'validScheduledCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND cmsStatus = '1' AND services = '3' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(validScheduledCount){
        result.validScheduledCount = validScheduledCount.validScheduledCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'invalidCount' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND cmsStatus = '2' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(invalidCount){
        result.invalidCount = invalidCount.invalidCount;
        return f.waterfallQuery("SELECT COUNT(*) AS 'missColCountTS' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '1' AND forwardedSub = 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(missColCountTS){
        result.missColCountTS = missColCountTS.missColCountTS;
        return f.waterfallQuery("SELECT COUNT(*) AS 'shortageMPCountTS' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '2' AND forwardedSub = 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(shortageMPCountTS){
        result.shortageMPCountTS = shortageMPCountTS.shortageMPCountTS;
        return f.waterfallQuery("SELECT COUNT(*) AS 'truckBDCountTS' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '3' AND forwardedSub = 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(truckBDCountTS){
        result.truckBDCountTS = truckBDCountTS.truckBDCountTS;
        return f.waterfallQuery("SELECT COUNT(*) AS 'truckFullCountTS' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '4' AND forwardedSub = 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(truckFullCountTS){
        result.truckFullCountTS = truckFullCountTS.truckFullCountTS;
        return f.waterfallQuery("SELECT COUNT(*) AS 'binNSBCountTS' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '5' AND forwardedSub = 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(binNSBCountTS){
        result.binNSBCountTS = binNSBCountTS.binNSBCountTS;
        return f.waterfallQuery("SELECT COUNT(*) AS 'lechateCountTS' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '6' AND forwardedSub = 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(lechateCountTS){
        result.lechateCountTS = lechateCountTS.lechateCountTS;
        return f.waterfallQuery("SELECT COUNT(*) AS 'otherCountTS' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '7' AND forwardedSub = 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(otherCountTS){
        result.otherCountTS = otherCountTS.otherCountTS;
        return f.waterfallQuery("SELECT COUNT(*) AS 'roroReasonCountTS' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '8' AND forwardedSub = 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(roroReasonCountTS){
        result.roroReasonCountTS = roroReasonCountTS.roroReasonCountTS;
        return f.waterfallQuery("SELECT COUNT(*) AS 'spillageCountTS' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '9' AND forwardedSub = 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(spillageCountTS){
        result.spillageCountTS = spillageCountTS.spillageCountTS;
        return f.waterfallQuery("SELECT COUNT(*) AS 'notWearingPPECountTS' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '10' AND forwardedSub = 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(notWearingPPECountTS){
        result.notWearingPPECountTS = notWearingPPECountTS.notWearingPPECountTS;
        return f.waterfallQuery("SELECT COUNT(*) AS 'missColCountMP' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '1' AND forwardedSub = 'Mega Power' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(missColCountMP){
        result.missColCountMP = missColCountMP.missColCountMP;
        return f.waterfallQuery("SELECT COUNT(*) AS 'shortageMPCountMP' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '2' AND forwardedSub = 'Mega Power' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(shortageMPCountMP){
        result.shortageMPCountMP = shortageMPCountMP.shortageMPCountMP;
        return f.waterfallQuery("SELECT COUNT(*) AS 'truckBDCountMP' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '3' AND forwardedSub = 'Mega Power' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(truckBDCountMP){
        result.truckBDCountMP = truckBDCountMP.truckBDCountMP;
        return f.waterfallQuery("SELECT COUNT(*) AS 'truckFullCountMP' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '4' AND forwardedSub = 'Mega Power' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(truckFullCountMP){
        result.truckFullCountMP = truckFullCountMP.truckFullCountMP;
        return f.waterfallQuery("SELECT COUNT(*) AS 'binNSBCountMP' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '5' AND forwardedSub = 'Mega Power' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(binNSBCountMP){
        result.binNSBCountMP = binNSBCountMP.binNSBCountMP;
        return f.waterfallQuery("SELECT COUNT(*) AS 'lechateCountMP' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '6' AND forwardedSub = 'Mega Power' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(lechateCountMP){
        result.lechateCountMP = lechateCountMP.lechateCountMP;
        return f.waterfallQuery("SELECT COUNT(*) AS 'otherCountMP' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '7' AND forwardedSub = 'Mega Power' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(otherCountMP){
        result.otherCountMP = otherCountMP.otherCountMP;
        return f.waterfallQuery("SELECT COUNT(*) AS 'roroReasonCountMP' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '8' AND forwardedSub = 'Mega Power' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(roroReasonCountMP){
        result.roroReasonCountMP = roroReasonCountMP.roroReasonCountMP;
        return f.waterfallQuery("SELECT COUNT(*) AS 'spillageCountMP' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '9' AND forwardedSub = 'Mega Power' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(spillageCountMP){
        result.spillageCountMP = spillageCountMP.spillageCountMP;
        return f.waterfallQuery("SELECT COUNT(*) AS 'notWearingPPECountMP' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '10' AND forwardedSub = 'Mega Power' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(notWearingPPECountMP){
        result.notWearingPPECountMP = notWearingPPECountMP.notWearingPPECountMP;
        return f.waterfallQuery("SELECT COUNT(*) AS 'missColCountTAK' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '1' AND forwardedSub = 'TAK' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(missColCountTAK){
        result.missColCountTAK = missColCountTAK.missColCountTAK;
        return f.waterfallQuery("SELECT COUNT(*) AS 'shortageMPCountTAK' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '2' AND forwardedSub = 'TAK' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(shortageMPCountTAK){
        result.shortageMPCountTAK = shortageMPCountTAK.shortageMPCountTAK;
        return f.waterfallQuery("SELECT COUNT(*) AS 'truckBDCountTAK' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '3' AND forwardedSub = 'TAK' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(truckBDCountTAK){
        result.truckBDCountTAK = truckBDCountTAK.truckBDCountTAK;
        return f.waterfallQuery("SELECT COUNT(*) AS 'truckFullCountTAK' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '4' AND forwardedSub = 'TAK' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(truckFullCountTAK){
        result.truckFullCountTAK = truckFullCountTAK.truckFullCountTAK;
        return f.waterfallQuery("SELECT COUNT(*) AS 'binNSBCountTAK' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '5' AND forwardedSub = 'TAK' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(binNSBCountTAK){
        result.binNSBCountTAK = binNSBCountTAK.binNSBCountTAK;
        return f.waterfallQuery("SELECT COUNT(*) AS 'lechateCountTAK' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '6' AND forwardedSub = 'TAK' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(lechateCountTAK){
        result.lechateCountTAK = lechateCountTAK.lechateCountTAK;
        return f.waterfallQuery("SELECT COUNT(*) AS 'otherCountTAK' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '7' AND forwardedSub = 'TAK' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(otherCountTAK){
        result.otherCountTAK = otherCountTAK.otherCountTAK;
        return f.waterfallQuery("SELECT COUNT(*) AS 'roroReasonCountTAK' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '8' AND forwardedSub = 'TAK' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(roroReasonCountTAK){
        result.roroReasonCountTAK = roroReasonCountTAK.roroReasonCountTAK;
        return f.waterfallQuery("SELECT COUNT(*) AS 'spillageCountTAK' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '9' AND forwardedSub = 'TAK' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(spillageCountTAK){
        result.spillageCountTAK = spillageCountTAK.spillageCountTAK;
        return f.waterfallQuery("SELECT COUNT(*) AS 'notWearingPPECountTAK' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '10' AND forwardedSub = 'TAK' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(notWearingPPECountTAK){
        result.notWearingPPECountTAK = notWearingPPECountTAK.notWearingPPECountTAK;
        return f.waterfallQuery("SELECT COUNT(*) AS 'missColCountOther' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '1' AND forwardedSub != 'TAK' AND forwardedSub != 'Mega Power' AND forwardedSub != 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(missColCountOther){
        result.missColCountOther = missColCountOther.missColCountOther;
        return f.waterfallQuery("SELECT COUNT(*) AS 'shortageMPCountOther' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '2' AND forwardedSub != 'TAK' AND forwardedSub != 'Mega Power' AND forwardedSub != 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(shortageMPCountOther){
        result.shortageMPCountOther = shortageMPCountOther.shortageMPCountOther;
        return f.waterfallQuery("SELECT COUNT(*) AS 'truckBDCountOther' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '3' AND forwardedSub != 'TAK' AND forwardedSub != 'Mega Power' AND forwardedSub != 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(truckBDCountOther){
        result.truckBDCountOther = truckBDCountOther.truckBDCountOther;
        return f.waterfallQuery("SELECT COUNT(*) AS 'truckFullCountOther' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '4' AND forwardedSub != 'TAK' AND forwardedSub != 'Mega Power' AND forwardedSub != 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(truckFullCountOther){
        result.truckFullCountOther = truckFullCountOther.truckFullCountOther;
        return f.waterfallQuery("SELECT COUNT(*) AS 'binNSBCountOther' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '5' AND forwardedSub != 'TAK' AND forwardedSub != 'Mega Power' AND forwardedSub != 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(binNSBCountOther){
        result.binNSBCountOther = binNSBCountOther.binNSBCountOther;
        return f.waterfallQuery("SELECT COUNT(*) AS 'lechateCountOther' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '6' AND forwardedSub != 'TAK' AND forwardedSub != 'Mega Power' AND forwardedSub != 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(lechateCountOther){
        result.lechateCountOther = lechateCountOther.lechateCountOther;
        return f.waterfallQuery("SELECT COUNT(*) AS 'otherCountOther' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '7' AND forwardedSub != 'TAK' AND forwardedSub != 'Mega Power' AND forwardedSub != 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(otherCountOther){
        result.otherCountOther = otherCountOther.otherCountOther;
        return f.waterfallQuery("SELECT COUNT(*) AS 'roroReasonCountOther' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '8' AND forwardedSub != 'TAK' AND forwardedSub != 'Mega Power' AND forwardedSub != 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(roroReasonCountOther){
        result.roroReasonCountOther = roroReasonCountOther.roroReasonCountOther;
        return f.waterfallQuery("SELECT COUNT(*) AS 'spillageCountOther' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '9' AND forwardedSub != 'TAK' AND forwardedSub != 'Mega Power' AND forwardedSub != 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(spillageCountOther){
        result.spillageCountOther = spillageCountOther.spillageCountOther;
        return f.waterfallQuery("SELECT COUNT(*) AS 'notWearingPPECountOther' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '10' AND forwardedSub != 'TAK' AND forwardedSub != 'Mega Power' AND forwardedSub != 'Trienekens' AND cmsStatus = '1' AND activeStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'");
    }).then(function(notWearingPPECountOther){
        result.notWearingPPECountOther = notWearingPPECountOther.notWearingPPECountOther;
        res.json(result);
        res.end(); 
    });

    
});

app.post('/getCmsStatisticsCategoryTruckBreakdown',function(req, res){
    'use strict';

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    var sql = "SELECT distinct tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.truck AS 'truck', tblcomplaintofficer.forwardedSub AS 'forwardedSub' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '3' AND cmsStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'";

    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});

app.post('/getCmsStatisticsCategoryTruckFull',function(req, res){
    'use strict';

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    var sql = "SELECT distinct tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.truck AS 'truck', tblcomplaintofficer.forwardedSub AS 'forwardedSub', tblcomplaintofficer.under AS 'area' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '4' AND cmsStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'";

    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});
app.post('/getCmsStatisticsCategoryShortageManpower',function(req, res){
    'use strict';

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    var sql = "SELECT distinct tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.truck AS 'truck', tblcomplaintofficer.forwardedSub AS 'forwardedSub', tblcomplaintofficer.under AS 'area' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '2' AND cmsStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'";

    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});
app.post('/getCmsStatisticsCategoryWasteNotCollected',function(req, res){
    'use strict';

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    var sql = "SELECT distinct tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.truck AS 'truck', tblcomplaintofficer.forwardedSub AS 'forwardedSub', tblcomplaintofficer.under AS 'area' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '1' AND cmsStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'";

    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});
app.post('/getCmsStatisticsCategoryBinNSB',function(req, res){
    'use strict';

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    var sql = "SELECT distinct tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.truck AS 'truck', tblcomplaintofficer.forwardedSub AS 'forwardedSub', tblcomplaintofficer.under AS 'area' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '5' AND cmsStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'";

    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});
app.post('/getCmsStatisticsCategoryOther',function(req, res){
    'use strict';

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    var sql = "SELECT distinct tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.truck AS 'truck', tblcomplaintofficer.forwardedSub AS 'forwardedSub' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '7' AND cmsStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'";

    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});
app.post('/getCmsStatisticsCategoryLeachate',function(req, res){
    'use strict';

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    var sql = "SELECT distinct tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.truck AS 'truck', tblcomplaintofficer.forwardedSub AS 'forwardedSub', tblcomplaintofficer.under AS 'area' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '6' AND cmsStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'";

    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});
app.post('/getCmsStatisticsCategoryRoro',function(req, res){
    'use strict';

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    var sql = "SELECT distinct tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.truck AS 'truck', tblcomplaintofficer.forwardedSub AS 'forwardedSub' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '8' AND cmsStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'";

    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});

app.post('/getCmsStatisticsCategorySpillage',function(req, res){
    'use strict';

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    var sql = "SELECT distinct tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.truck AS 'truck', tblcomplaintofficer.forwardedSub AS 'forwardedSub', tblcomplaintofficer.under AS 'area' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '9' AND cmsStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'";

    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});

app.post('/getCmsStatisticsCategoryNotWearingPPE',function(req, res){
    'use strict';

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    var sql = "SELECT distinct tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.forwardedSub AS 'forwardedSub' FROM tblcomplaintofficer WHERE tblcomplaintofficer.zon = '" + req.body.zon + "' AND reason = '10' AND cmsStatus = '1' AND complaintDate BETWEEN '" + startDate + "' AND '" + endDate + "'";

    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});

app.post('/getCmsSource', function(req,res){
    'use strict';
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var result = {};

    f.waterfallQuery("SELECT COUNT(*) AS 'telephone' FROM tblcomplaintofficer WHERE sorce = 'Telephone' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'").then(function(response){
        result.telephone = response.telephone;
        return f.waterfallQuery("SELECT COUNT(*) AS 'email' FROM tblcomplaintofficer WHERE sorce = 'Email' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'")
    }).then(function(response){
        result.email = response.email;
        return f.waterfallQuery("SELECT COUNT(*) AS 'fax' FROM tblcomplaintofficer WHERE sorce = 'Fax' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.fax = response.fax;
        return f.waterfallQuery("SELECT COUNT(*) AS 'mbks' FROM tblcomplaintofficer WHERE sorce = 'MBKS' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.mbks = response.mbks;
        return f.waterfallQuery("SELECT COUNT(*) AS 'dbku' FROM tblcomplaintofficer WHERE sorce = 'DBKU' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.dbku = response.dbku;
        return f.waterfallQuery("SELECT COUNT(*) AS 'mpp' FROM tblcomplaintofficer WHERE sorce = 'MPP' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.mpp = response.mpp;
        return f.waterfallQuery("SELECT COUNT(*) AS 'mds' FROM tblcomplaintofficer WHERE sorce = 'MDS' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.mds = response.mds;
        return f.waterfallQuery("SELECT COUNT(*) AS 'talikhidmat' FROM tblcomplaintofficer WHERE sorce = 'Talikhidmat' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.talikhidmat = response.talikhidmat;
        return f.waterfallQuery("SELECT COUNT(*) AS 'socialMedia' FROM tblcomplaintofficer WHERE sorce = 'Social Media' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.socialMedia = response.socialMedia;
        return f.waterfallQuery("SELECT COUNT(*) AS 'apps' FROM tblcomplaintofficer WHERE sorce = 'Mobile App' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.apps = response.apps;
        res.send(result);
        res.end();
    })
});

app.post('/getCmsBDStatisticsMW', function(req,res){
    'use strict';
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var result = {};

    f.waterfallQuery("SELECT COUNT(*) AS 'totalComp' FROM tblcomplaintofficer WHERE services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'").then(function(response){
        result.totalComp = response.totalComp;
        return f.waterfallQuery("SELECT COUNT(*) AS 'tsValid' FROM tblcomplaintofficer WHERE forwardedSub = 'Trienekens' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.tsValid = response.tsValid;
        return f.waterfallQuery("SELECT COUNT(*) AS 'mpValid' FROM tblcomplaintofficer WHERE forwardedSub = 'Mega Power' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.mpValid = response.mpValid;
        return f.waterfallQuery("SELECT COUNT(*) AS 'takValid' FROM tblcomplaintofficer WHERE forwardedSub = 'TAK' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.takValid = response.takValid;
        return f.waterfallQuery("SELECT COUNT(*) AS 'wasteNotCollected' FROM tblcomplaintofficer WHERE typeCode LIKE '%a%' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'")
    }).then(function(response){
        result.wasteNotCollected = response.wasteNotCollected;
        return f.waterfallQuery("SELECT COUNT(*) AS 'binNotPushBack' FROM tblcomplaintofficer WHERE typeCode LIKE '%b%' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.binNotPushBack = response.binNotPushBack;
        return f.waterfallQuery("SELECT COUNT(*) AS 'spillageWaste' FROM tblcomplaintofficer WHERE typeCode LIKE '%c%' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.spillageWaste = response.spillageWaste;
        return f.waterfallQuery("SELECT COUNT(*) AS 'spillageLeachate' FROM tblcomplaintofficer WHERE typeCode LIKE '%d%' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1' ");
    }).then(function(response){
        result.spillageLeachate = response.spillageLeachate;
        return f.waterfallQuery("SELECT COUNT(*) AS 'otherType' FROM tblcomplaintofficer WHERE typeCode LIKE '%l%' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1' ");
    }).then(function(response){
        result.otherType = response.otherType;
        return f.waterfallQuery("SELECT COUNT(*) AS 'dbku' FROM tblcomplaintofficer WHERE council = 'DBKU' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.dbku = response.dbku;
        return f.waterfallQuery("SELECT COUNT(*) AS 'mbks' FROM tblcomplaintofficer WHERE council = 'MBKS' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.mbks = response.mbks;
        return f.waterfallQuery("SELECT COUNT(*) AS 'mpp' FROM tblcomplaintofficer WHERE council = 'MPP' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.mpp = response.mpp;
        return f.waterfallQuery("SELECT COUNT(*) AS 'others' FROM tblcomplaintofficer WHERE council != 'DBKU' AND council != 'MBKS' AND council != 'MPP' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.others = response.others;
        return f.waterfallQuery("SELECT COUNT(*) AS 'achieveKPI' FROM tblcomplaintofficer WHERE bdKPIAchieve = 'A' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.achieveKPI = response.achieveKPI;
        return f.waterfallQuery("SELECT COUNT(*) AS 'notAchieveKPI' FROM tblcomplaintofficer WHERE bdKPIAchieve = 'N' AND services = '1' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.notAchieveKPI = response.notAchieveKPI;
        res.send(result);
        res.end();
    })
});

app.post('/getCmsBDStatisticsRoro', function(req,res){
    'use strict';
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var result = {};

    f.waterfallQuery("SELECT COUNT(*) AS 'totalComp' FROM tblcomplaintofficer WHERE services = '2' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'").then(function(response){
        result.totalComp = response.totalComp;
        return f.waterfallQuery("SELECT COUNT(*) AS 'tsValid' FROM tblcomplaintofficer WHERE forwardedSub = 'Trienekens' AND services = '2' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.tsValid = response.tsValid;
        return f.waterfallQuery("SELECT COUNT(*) AS 'mpValid' FROM tblcomplaintofficer WHERE forwardedSub = 'Mega Power' AND services = '2' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.mpValid = response.mpValid;
        return f.waterfallQuery("SELECT COUNT(*) AS 'takValid' FROM tblcomplaintofficer WHERE forwardedSub = 'TAK' AND services = '2' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.takValid = response.takValid;
        return f.waterfallQuery("SELECT COUNT(*) AS 'containerNotSent' FROM tblcomplaintofficer WHERE typeCode LIKE '%e%' AND services = '2' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'")
    }).then(function(response){
        result.containerNotSent = response.containerNotSent;
        return f.waterfallQuery("SELECT COUNT(*) AS 'containerNotExchanged' FROM tblcomplaintofficer WHERE typeCode LIKE '%f%' AND services = '2' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.containerNotExchanged = response.containerNotExchanged;
        return f.waterfallQuery("SELECT COUNT(*) AS 'containerNotPulled' FROM tblcomplaintofficer WHERE typeCode LIKE '%g%' AND services = '2' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.containerNotPulled = response.containerNotPulled;
        return f.waterfallQuery("SELECT COUNT(*) AS 'containerNotEmptied' FROM tblcomplaintofficer WHERE typeCode LIKE '%h%' AND services = '2' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1' ");
    }).then(function(response){
        result.containerNotEmptied = response.containerNotEmptied;
        return f.waterfallQuery("SELECT COUNT(*) AS 'otherType' FROM tblcomplaintofficer WHERE typeCode LIKE '%m%' AND services = '2' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1' ");
    }).then(function(response){
        result.otherType = response.otherType;
        return f.waterfallQuery("SELECT COUNT(*) AS 'achieveKPI' FROM tblcomplaintofficer WHERE bdKPIAchieve = 'A' AND services = '2' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.achieveKPI = response.achieveKPI;
        return f.waterfallQuery("SELECT COUNT(*) AS 'notAchieveKPI' FROM tblcomplaintofficer WHERE bdKPIAchieve = 'N' AND services = '2' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.notAchieveKPI = response.notAchieveKPI;
        res.send(result);
        res.end();
    })
});

app.post('/getCmsBDStatisticsSW', function(req,res){
    'use strict';
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var result = {};

    f.waterfallQuery("SELECT COUNT(*) AS 'totalComp' FROM tblcomplaintofficer WHERE services = '3' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'").then(function(response){
        result.totalComp = response.totalComp;
        return f.waterfallQuery("SELECT COUNT(*) AS 'tsValid' FROM tblcomplaintofficer WHERE forwardedSub = 'Trienekens' AND services = '3' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.tsValid = response.tsValid;
        return f.waterfallQuery("SELECT COUNT(*) AS 'otherSubconValid' FROM tblcomplaintofficer WHERE forwardedSub != 'Trienekens' AND services = '3' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.otherSubconValid = response.otherSubconValid;
        return f.waterfallQuery("SELECT COUNT(*) AS 'wasteNotCollected' FROM tblcomplaintofficer WHERE typeCode LIKE '%i%' AND services = '3' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'")
    }).then(function(response){
        result.wasteNotCollected = response.wasteNotCollected;
        return f.waterfallQuery("SELECT COUNT(*) AS 'spillage' FROM tblcomplaintofficer WHERE typeCode LIKE '%j%' AND services = '3' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.spillage = response.spillage;
        return f.waterfallQuery("SELECT COUNT(*) AS 'incompleteDocs' FROM tblcomplaintofficer WHERE typeCode LIKE '%k%' AND services = '3' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1'");
    }).then(function(response){
        result.incompleteDocs = response.incompleteDocs;
        return f.waterfallQuery("SELECT COUNT(*) AS 'others' FROM tblcomplaintofficer WHERE typeCode LIKE '%n%' AND services = '3' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "' AND cmsStatus = '1' ");
    }).then(function(response){
        result.others = response.others;
        return f.waterfallQuery("SELECT COUNT(*) AS 'achieveKPI' FROM tblcomplaintofficer WHERE bdKPIAchieve = 'A' AND services = '3' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.achieveKPI = response.achieveKPI;
        return f.waterfallQuery("SELECT COUNT(*) AS 'notAchieveKPI' FROM tblcomplaintofficer WHERE bdKPIAchieve = 'N' AND services = '2' AND activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'");
    }).then(function(response){
        result.notAchieveKPI = response.notAchieveKPI;
        res.send(result);
        res.end();
    })
});

app.post('/getCMSQOP', function(req, res){
    'use strict';
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var sql="SELECT coID AS 'coID', complaintDate AS 'complaintDate', services AS 'services', bdKPI AS 'bdKPI', bdKPIAchieve AS 'bdKPIAchieve' FROM tblcomplaintofficer WHERE activeStatus = '1' AND zon = '" + req.body.zon + "' AND complaintDate BETWEEN  '" + startDate + "' AND '" + endDate + "'";
console.log(sql);
    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
})

app.post('/changeCompTypeCode', function(req, res){
    'use strict';

    var sql = "UPDATE tblcomplaintofficer SET typeCode = '" + req.body.typeCode + "' WHERE coID = '" + req.body.coID + "'";

    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});

app.post('/setupBDKPI', function(req, res){
    'use strict';
console.log(req.body.coID);
    var sql = "UPDATE tblcomplaintofficer SET bdKPI = '" + req.body.bdKPI + "', bdKPIAchieve = '" + req.body.bdKPIAchieve + "' WHERE coID = '" + req.body.coID + "'";
console.log(sql);
    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});

app.post('/setupLGKPI', function(req, res){
    'use strict';
console.log(req.body.coID);
    var sql = "UPDATE tblcomplaintofficer SET lgKPI = '" + req.body.lgKPI + "', lgKPIAchieve = '" + req.body.lgKPIAchieve + "' WHERE coID = '" + req.body.coID + "'";
console.log(sql);
    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json(result);
        }
    });
});

module.exports = app;