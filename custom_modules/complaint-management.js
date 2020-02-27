/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
//var variable = require('../variable');
var fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    keyFilename: './trienekens-management-9f941010219d.json',
    projectId: 'trienekens-management'
});
const bucketName = 'trienekens-management-images';
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
            var histUpdateList = histdata[0].histUpdateList + "Logistics update status on: " + req.body.statusdate + ", " + req.body.statustime + " - " + req.body.status +  "\n";

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
            var histUpdateList = histdata[0].histUpdateList + "CMS status update on: " + req.body.cmsdate + ", " + req.body.cmstime + " - " + req.body.cmsstatus + "\n";

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
app.get('/getComplaintList', function(req, res) {
    'use strict';

    var sql = "",
        readComplaintSql = "";

    sql = "SELECT tblcomplaint.complaintDate AS 'date', tblcomplaint.complaint AS 'title', tbluser.name AS  'customer', tblcomplaint.premiseType AS 'type', tblarea.areaName AS 'area', CONCAT(tblzone.zoneCode,tblarea.areaCode) AS 'code', tblcomplaint.complaintID AS ' complaintID', (CASE WHEN tblcomplaint.status = 'c' THEN 'Closed' WHEN tblcomplaint.status = 'p' THEN 'Pending' WHEN tblcomplaint.status = 'i' THEN 'Invalid' WHEN tblcomplaint.status ='o' THEN 'Open' END) AS status, tblcomplaint.readStat AS 'readStat' FROM tblcomplaint JOIN tbluser ON tbluser.userID = tblcomplaint.userID LEFT OUTER JOIN tbltaman ON tbltaman.tamanID = tbluser.tamanID LEFT OUTER JOIN tblarea ON tblarea.areaID = tbltaman.areaID LEFT OUTER JOIN tblzone ON tblzone.zoneID = tblarea.zoneID ORDER BY date DESC";
    //readComplaintSql = "UPDATE tblcomplaint SET readStat = 'r'";

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
app.post('/readComplaint', function(req, res) {
    'use strict';
    var sql = "UPDATE tblcomplaint SET readStat = 'r'";
    database.query(sql, function(err, result) {
        res.send("Complaint Read");
        res.end();
    });
});

//get complaint detail by id
app.post('/getComplaintDetail', function(req, res) {
    'use strict';
    var sql = "SELECT co.complaintID, co.premiseType, co.complaint, co.staffID, co.remarks, co.complaintImg, co.complaintDate, cu.name, cu.contactNumber, co.complaintAddress AS address, a.areaID, a.areaName, CONCAT(z.zoneCode,a.areaCode) AS 'code', (CASE WHEN co.status = 'o' THEN 'Open' WHEN co.status = 'p' THEN 'Pending' WHEN co.status = 'i' THEN 'Invalid' WHEN co.status = 'c' THEN 'Closed' END) AS status from tblcomplaint co JOIN tbluser cu ON co.userID = cu.userID LEFT OUTER JOIN tbltaman ON tbltaman.tamanID = cu.tamanID LEFT OUTER JOIN tblarea a ON a.areaID = tbltaman.areaID LEFT OUTER JOIN tblzone z ON z.zoneID = a.zoneID WHERE co.complaintID = '" + req.body.id + "'";

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


        images = images[0] + "|" + images[1] + "|" + images[2];
        var nameFormatted = req.body.compName.replace("'", "\\'");
        var companyFormatted = req.body.compCompany.replace("'", "\\'");
        var addressFormatted = req.body.compAddress.replace("'", "\\'");

        var sql = "INSERT INTO tblcomplaintofficer(coID,complaintDate, complaintTime, sorce, refNo, name, company, telNo, address, type, logisticsDate, logisticsTime, logisticsBy, creationDateTime, compImg, step, services, readState, logsReadState) VALUE ('" + ID + "', '" + req.body.compDate + "', '" + req.body.compTime + "', '" + req.body.compSource + "', '" + req.body.compRefNo + "', '" + nameFormatted + "', '" + companyFormatted + "', '" + req.body.compPhone + "', '" + addressFormatted + "','" + req.body.compType + "', '" + req.body.compLogDate + "', '" + req.body.compLogTime + "', '" + req.body.compLogBy + "', '" + req.body.creationDate + "', '" + images + "', 1, '" + req.body.services + "', 'r', 'u')";
console.log(sql);
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

app.get('/getComplaintOfficerList', function(req, res) {
    'use strict';
    var sql = "SELECT tblcomplaintofficer.coID AS 'coID', CONCAT(tblcomplaintofficer.complaintDate,' ',tblcomplaintofficer.complaintTime) AS 'complaintDate', tblcomplaintofficer.name AS 'name', tblcomplaintofficer.company AS 'company', tblcomplaintofficer.step AS 'step', tblcomplaintofficer.services  AS 'services', tblcomplaintofficer.creationDateTime, CONCAT(tblcomplaintofficer.statusDate,' ',tblcomplaintofficer.statusTime) AS logisticsDateTime, CONCAT(tblcomplaintofficer.customerDate,' ',tblcomplaintofficer.customerTime) AS customerDateTime, tblcomplaintofficer.status AS 'lgStatus', tblcomplaintofficer.custStatus AS 'bdStatus', tblcomplaintofficer.cmsStatus AS 'cmsStatus', tblcomplaintofficer.readState AS 'readState' FROM tblcomplaintofficer ORDER BY tblcomplaintofficer.creationDateTime DESC";

    database.query(sql, function(err, result) {

        if (err) {
            throw err;
        }
        res.json(result);
    });

});

app.get('/getLogisticsComplaintList', function(req, res) {
    'use strict';
    var sql = "SELECT tblcomplaintofficer.coID AS 'coID', tblcomplaintofficer.complaintDate AS 'complaintDate', tblcomplaintofficer.name AS 'name', tblcomplaintofficer.company AS 'company', tblcomplaintofficer.step AS 'step', tblcomplaintofficer.services AS 'services', tblcomplaintofficer.status = 'status', tblstaff.staffName AS 'staff', tblcomplaintofficer.logsReadState AS 'logsReadState' FROM tblcomplaintofficer LEFT JOIN tblstaff ON tblcomplaintofficer.logisticsBy = tblstaff.staffID WHERE step >= 1 ORDER BY tblcomplaintofficer.complaintDate DESC";

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
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

    var sql = "SELECT tblcomplaintofficer.complaintDate as 'complaintDate', tblcomplaintofficer.complaintTime as 'complaintTime', tblcomplaintofficer.sorce as 'sorce', tblcomplaintofficer.refNo as 'refNo', tblcomplaintofficer.name as 'name', tblcomplaintofficer.company as 'company', tblcomplaintofficer.telNo as 'telNo', tblcomplaintofficer.address as 'address', tblcomplaintofficer.type as 'type', tblcomplaintofficer.step AS 'step', tblcomplaintofficer.logisticsDate as 'logisticsDate', tblcomplaintofficer.logisticsTime as 'logisticsTime', tblstaff.staffName as 'logisticsBy', tblcomplaintofficer.compImg as 'compImg' FROM tblcomplaintofficer LEFT JOIN tblstaff ON tblcomplaintofficer.logisticsBy = tblstaff.staffID WHERE coID = '" + req.body.coID + "'";


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

    var sql = "SELECT tblcomplaintofficer.under AS 'area', tblcomplaintofficer.council AS 'council', tblcomplaintofficer.forwardedSub AS 'sub', tblcomplaintofficer.forwardedDate AS 'subDate', tblcomplaintofficer.forwardedTime AS 'subTime', tblstaff.staffName AS 'subBy', tblcomplaintofficer.status AS 'status', tblcomplaintofficer.statusDate AS 'statusDate', tblcomplaintofficer.statusTime AS 'statusTime', tblcomplaintofficer.remarks AS 'remarks', tblcomplaintofficer.logsImg AS 'logsImg', tblcomplaintofficer.custStatus AS 'custStatus', tblcomplaintofficer.customerDate AS 'custDate', tblcomplaintofficer.customerTime AS 'custTime', tblcomplaintofficer.customerBy AS 'custBy', tblcomplaintofficer.contactStatus AS 'contactStatus', tblcomplaintofficer.cmsStatus AS 'cmsStatus' FROM tblcomplaintofficer LEFT JOIN tblstaff ON tblcomplaintofficer.forwardedBy = tblstaff.staffID WHERE coID = '" + req.body.coID + "'";

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
    
    images = images[0] + "|" + images[1] + "|" + images[2];
    

    var remarkFormatted = req.body.remark.replace("'", "\\'");

    if (req.body.subDate == null || req.body.subTime == null) {
        var sql = "UPDATE tblcomplaintofficer SET under = '" + req.body.areaUnder + "', council = '" + req.body.areaCouncil + "', forwardedSub = '" + req.body.sub + "', forwardedDate = " + req.body.subDate + ", forwardedTime = " + req.body.subTime + ", forwardedBy = '" + req.body.by + "',  status = '" + req.body.status + "', statusDate = '" + req.body.statusDate + "', statusTime = '" + req.body.statusTime + "', remarks = '" + remarkFormatted + "', logsImg = '" + images + "', step = 2, readState = 'u', logsReadState = 'r' WHERE coID = '" + req.body.coID + "' ";
    } else {
        var sql = "UPDATE tblcomplaintofficer SET under = '" + req.body.areaUnder + "', council = '" + req.body.areaCouncil + "', forwardedSub = '" + req.body.sub + "', forwardedDate = '" + req.body.subDate + "', forwardedTime = '" + req.body.subTime + "', forwardedBy = '" + req.body.by + "',  status = '" + req.body.status + "', statusDate = '" + req.body.statusDate + "', statusTime = '" + req.body.statusTime + "', remarks = '" + remarkFormatted + "', logsImg = '" + images + "', step = 2, readState = 'u', logsReadState = 'r' WHERE coID = '" + req.body.coID + "' ";
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
    
    images = images[0] + "|" + images[1] + "|" + images[2];
    
    if(req.body.department === "LG"){
        var sql = "UPDATE tblcomplaintofficer SET compImg = '" + images + "' WHERE coID = '" + req.body.coID + "'";
    }else if(req.body.department === "BD"){
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

    var sql = "UPDATE tblcomplaintofficer SET customerDate = '" + req.body.custDate + "', customerTime = '" + req.body.custTime + "', customerBy = '" + req.body.custBy + "', step = 3, custStatus = '" + req.body.custStatus + "', contactStatus = '" + req.body.contactStatus + "', cmsStatus = '" + req.body.cmsStatus + "', readState = 'r', logsReadState = 'u' WHERE coID = '" + req.body.coID + "' ";

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({
            "message": "Information updated",
            "status": "success"
        });
    });
});

app.post('/verifyAppComp', function(req, res) {
    'use strict';

    f.makeID("complaint", req.body.creationDate).then(function(ID) {
        var sql = "INSERT INTO tblcomplaintofficer(coID,complaintDate, complaintTime, sorce, refNo, name, telNo, address, type, logisticsDate, logisticsTime, logisticsBy, creationDateTime, compImg, step, services, readState, logsReadState) VALUE ('" + ID + "', '" + req.body.date + "', '" + req.body.time + "', '" + req.body.source + "', '" + req.body.refNo + "', '" + req.body.name + "', '" + req.body.telNo + "', '" + req.body.address + "','" + req.body.type + "', '" + req.body.forwardLogisticsDate + "', '" + req.body.forwardLogisticsTime + "', '" + req.body.forwardLogisticsBy + "', '" + req.body.creationDate + "', '" + req.body.img + "', 1, '" + req.body.services + "', 'r', 'u')";

        database.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.json({ "status": "success", "message": "Complaint Sent to Logistics" });
        });
    });
});

app.post('/setIncharge', function(req, res) {
    'use strict';
    if (req.body.staffID == null) {
        var sql = "UPDATE tblcomplaint SET staffID = " + req.body.staffID;
    } else {
        var sql = "UPDATE tblcomplaint SET staffID = '" + req.body.staffID + "'";
    }

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

module.exports = app;