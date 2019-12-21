/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
//var variable = require('../variable');

app.post('/updateComplaintStatus', function (req, res) {
    'use strict';
    var sql = "UPDATE tblcomplaint SET status = (CASE WHEN '" + req.body.status + "' = 'Confirmation' THEN 'c' WHEN '" + req.body.status + "' = 'Pending' THEN 'p' WHEN '" + req.body.status + "' = 'In progress' THEN 'i' WHEN '" + req.body.status + "' = 'Done' THEN 'd' END) WHERE complaintID = '" + req.body.id + "'",
        status = {
            "status": ""
        };
    database.query(sql, function (err, result) {
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
app.get('/getComplaintList', function (req, res) {
    'use strict';
    
    var sql = "",
        readComplaintSql = "";
    
    sql = "SELECT tblcomplaint.complaintDate AS 'date', tblcomplaint.complaint AS 'title', tbluser.name AS  'customer', tblcomplaint.premiseType AS 'type', tblarea.areaName AS 'area', CONCAT(tblzone.zoneCode,tblarea.areaCode) AS 'code', tblcomplaint.complaintID AS ' complaintID', (CASE WHEN tblcomplaint.status = 'c' THEN 'Confirmation' WHEN tblcomplaint.status = 'p' THEN 'Pending' WHEN tblcomplaint.status = 'i' THEN 'In progress' WHEN tblcomplaint.status ='d' THEN 'Done' END) AS status FROM tblcomplaint JOIN tbluser ON tbluser.userID = tblcomplaint.userID LEFT OUTER JOIN tbltaman ON tbltaman.tamanID = tbluser.tamanID LEFT OUTER JOIN tblarea ON tblarea.areaID = tbltaman.areaID LEFT OUTER JOIN tblzone ON tblzone.zoneID = tblarea.zoneID ORDER BY date DESC";
    readComplaintSql = "UPDATE tblcomplaint SET readStat = 'r'";

    database.query(readComplaintSql, function (err, result) {
        if (err) {
            throw err;
        }
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            //res.send("New Complaint Read");
            res.json(result);
        });
    });
});

app.get('/getComplaintLoc', function (req, res) {
    'use strict';
    var sql = "SELECT tblcomplaint.complaintID, tblcomplaint.complaintDate AS 'date', tbltaman.longitude AS 'longitude', tbltaman.latitude AS 'latitude', tblarea.areaName AS 'area', CONCAT(tblzone.zoneCode,tblarea.areaCode) AS 'code', tbltaman.tamanName as 'taman', tbluser.name AS 'customer', tblcomplaint.status AS 'status' FROM tbluser JOIN tbltaman ON tbluser.tamanID = tbltaman.tamanID JOIN tblarea ON tblarea.areaID = tbltaman.areaID JOIN tblcomplaint ON tblcomplaint.userID = tbluser.userID JOIN tblzone ON tblzone.zoneID = tblarea.zoneID";
    
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
    var sql = "SELECT co.complaintID, co.premiseType, co.complaint, co.staffID, co.remarks, co.complaintImg, co.complaintDate, cu.name, co.complaintAddress AS address, a.areaID, a.areaName, CONCAT(z.zoneCode,a.areaCode) AS 'code', (CASE WHEN co.status = 'c' THEN 'Confirmation' WHEN co.status = 'p' THEN 'Pending' WHEN co.status = 'i' THEN 'In progress' WHEN co.status = 'd' THEN 'Done' END) AS status from tblcomplaint co JOIN tbluser cu ON co.userID = cu.userID LEFT OUTER JOIN tbltaman ON tbltaman.tamanID = cu.tamanID LEFT OUTER JOIN tblarea a ON a.areaID = tbltaman.areaID LEFT OUTER JOIN tblzone z ON z.zoneID = a.zoneID WHERE co.complaintID = '" + req.body.id + "'";

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
    
    sql = "SELECT tblreport.reportID AS id, tblreport.areaID AS area, tblreport.reportCollectionDate AS date, tblreport.operationTimeStart AS startTime, tblreport.operationTimeEnd AS endTime, tblreport.remark, tblreport.garbageAmount AS ton, tblreport.iFleetMap AS ifleet, tbltruck.truckNum AS truck, tbltruck.truckID as truckID, tbltruck.transporter AS transporter, tblstaff.staffName AS driver, tblstaff.staffID AS driverID, GROUP_CONCAT(tbltaman.tamanName) AS collection, tblarea.collection_frequency AS frequency, tblreport.completionStatus as status FROM tblreport JOIN tbltruck ON tbltruck.truckID = tblreport.truckID JOIN tblstaff ON tblreport.driverID = tblstaff.staffID JOIN tblarea ON tblarea.areaID = tblreport.areaID JOIN tbltaman ON tbltaman.areaID = tblarea.areaID WHERE tblreport.reportID = '" + req.body.reportID + "' GROUP BY tblreport.areaID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }else{
            database.query("SELECT tblstaff.staffName FROM tblstaff JOIN tblreport ON tblstaff.staffID = tblreport.staffID WHERE tblreport.reportID = '" + req.body.reportID + "' ", function(err2, area){
                if(err){
                    throw err;
                }else{
                   result[0].reportingStaff = area[0].staffName;


                    content += '<div class="row"><div class="col-md-12"><table border="1"><thead><tr><th colspan="2">IVWM INSPECTION REPORT ID: ' + result[0].id + '</th><th>Completion Status:' + result[0].status + '</th><th>Collection Date: ' + result[0].date + '</th><th>Garbage Amount(ton): ' + result[0].ton + '</th><th>Time Start: ' + result[0].startTime + '</th><th>Time End: ' + result[0].endTime + '</th><th>Reporting Staff: ' + result[0].reportingStaff + '</th></tr><tr><th>Area</th><th>Collection Area</th><th>COLLECTION FREQUENCY</th><th>BIN CENTERS</th><th>ACR CUSTOMER</th><th>TRANSPORTER</th><th>TRUCK NO.</th><th>DRIVER</th></tr></thead><tbody><tr><td>' + result[0].area + '</td><td>' + result[0].collection + '</td><td>' + result[0].frequency + '</td><td >programReplaceBinHere</td><td>programReplaceACRHere</td><td>' + result[0].transporter + '</td><td>' + result[0].truck + '</td><td>' + result[0].driver + '</td></tr><tr><td>Remarks:</td><td colspan="7">' + result[0].remark + '</td></tr></tbody></table></div></div>';

                    res.json({"content": content, "result": result});
                }
            });
        }
    });
    
});

app.post('/submitOfficeMadeComplaint', function (req, res) {
    'use strict';
    f.makeID("complaint", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblcomplaintofficer(coID,complaintDate, complaintTime, sorce, refNo, name, company, telNo, address, under, council, type, logisticsDate, logisticsTime, logisticsBy, customerDate, customerTime, customerBy, recordedDate, recordedTime, recordedBy, forwardedSub, forwardedDate, forwardedTime, forwardedBy, status, statusClosed, statusDate, statusTime, statusBy, remarks, creationDateTime) VALUE ('" + ID + "', '" + req.body.compDate + "', '" + req.body.compTime + "', '" + req.body.compSource + "', '" + req.body.compRefNo + "', '" + req.body.compName + "', '" + req.body.compCompany + "', '" + req.body.compPhone + "', '" + req.body.compAddress + "', '" + req.body.compUnder + "', '" + req.body.compCouncil + "', '" + req.body.compType + "', '" + req.body.compLogDate + "', '" + req.body.compLogTime + "', '" + req.body.compLogBy + "', '" + req.body.compCIDate + "', '" + req.body.compCITime + "', '" + req.body.compCIBy + "', '" + req.body.compRCDate + "', '" + req.body.compRCTime + "', '" + req.body.compRCBy + "', '" + req.body.compSub + "', '" + req.body.compSubDate + "', '" + req.body.compSubTime + "', '" + req.body.compSubBy + "', '" + req.body.compStatus + "', '" + req.body.compClosed + "', '" + req.body.compSDate + "', '" + req.body.compSTime + "', '" + req.body.compSBy + "', '" + req.body.compRemark + "', '" + req.body.creationDate + "')";
        
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "message": "Complaint Submitted"});
        });
    });
    
});


app.post('/editOfficeMadeComplaint', function (req, res) {
    'use strict';

    var sql = "UPDATE tblcomplaintofficer SET complaintDate = '" + req.body.complaintDate + "', complaintTime = '" + req.body.complaintTime + "', sorce = '" + req.body.sorce + "', refNo = '" + req.body.refNo + "', name = '" + req.body.name + "', company = '" + req.body.company + "', telNo = '" + req.body.telNo + "', address = '" + req.body.address + "' , under = '" + req.body.under + "' , council = '" + req.body.council + "' , type = '" + req.body.type + "' , logisticsDate = '" + req.body.logisticsDate + "' , logisticsTime = '" + req.body.logisticsTime + "' , logisticsBy = '" + req.body.logisticsBy + "' , customerDate = '" + req.body.customerDate + "', customerTime = '" + req.body.customerTime + "' , customerBy = '" + req.body.customerBy + "' , recordedDate = '" + req.body.recordedDate + "', recordedTime = '" + req.body.recordedTime + "' , recordedBy = '" + req.body.recordedBy + "' , forwardedSub = '" + req.body.forwardedSub + "' , forwardedDate = '" + req.body.forwardedDate + "' , forwardedTime = '" + req.body.forwardedTime + "', forwardedBy = '" + req.body.forwardedBy + "', status = '" + req.body.status + "', statusClosed = '" + req.body.statusClosed + "', statusDate = '" + req.body.statusDate + "' , statusTime = '" + req.body.statusTime + "' , statusBy = '" + req.body.statusBy + "', remarks = '" + req.body.remarks + "' WHERE coID = '" + req.body.coID + "'";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Complaint Editted"});
    });
    
});

app.get('/getComplaintOfficerList', function (req, res) {
    'use strict';
    var sql = "SELECT tblcomplaintofficer.coID AS 'coID', tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.name AS 'name', tblcomplaintofficer.company AS 'company', tblcomplaintofficer.council AS 'council' FROM tblcomplaintofficer ORDER BY tblcomplaintofficer.complaintDate DESC";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
    
});

app.post('/getComplaintOfficerDetail', function (req, res) {
    'use strict';
    
    var sql = "SELECT * FROM tblcomplaintofficer WHERE coID = '" + req.body.coID + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success"});
    });
});

app.post('/setIncharge', function(req,res){
    'use strict';
    
    var sql = "UPDATE tblcomplaint SET staffID = '" + req.body.staffID + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });    
});

module.exports = app;