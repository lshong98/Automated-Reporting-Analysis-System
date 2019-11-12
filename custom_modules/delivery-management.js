/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// ACR Management
app.post('/addBdaf', function (req, res) {
    'use strict';

    f.makeID("bdaf", req.body.creationDate).then(function (ID) {
        
        var sql = "INSERT INTO tblbdaf (bdafID, creationDateTime, driverID, staffID, status) VALUE ('" + ID + "', '" + req.body.date + "' , '" + req.body.driverID + "', '" + req.body.staffID + "', 'A')";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
 
            res.json({"status": "success", "message": "BDAF created!", "details": {"bdafID": ID}});
        });
    });
}); // Complete
app.post('/getAllBdaf', function (req, res) {
    'use strict';
    var sql = "SELECT b.bdafID AS id, b.creationDateTime as date, b.driverID as driver, b.staffID as generalWorker, b.authorizedBy, b.authorizedDate, b.status from tblbdaf as b";
        
    if (req.body.status) {
        sql += " WHERE status = 'A'";
    } else {
        sql += " WHERE status = 'I'";
    }
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("GET ALL BDAF: " + result);
    });
});

app.post('/getBdafDetails', function (req, res) {
    'use strict';
    console.log("GET BDAF DETAILS: HELLO FROM THE SERVER");
    console.log(req.body);

    
    var sql = "SELECT company, address, council, contactPerson, contactNo, acrSticker, acrID, jobDesc, binSize, unit, remarks, binDelivered, binPulled FROM tblbdafentry where bdafID = '" + req.body.id + "'";
    //var sql = "SELECT DISTINCT a.acrID AS id, a.acrName AS name, a.acrPhoneNo AS phone, a.acrAddress AS address, DATE_FORMAT(a.acrPeriod, '%d %M %Y') as enddate, c.areaName as area,(CASE WHEN a.acrStatus = 'A' THEN 'ACTIVE' WHEN a.acrStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblacr a INNER JOIN tblacrfreq b ON a.acrID = b.acrID INNER JOIN tblarea c ON c.areaID = b.areaID";
    console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
         
        res.json(result);
        console.log(result);
    });
});

//IF CUSTOMER CANNOT REGISTER
app.post('/addBdafEntry', function (req, res) {
    'use strict';
    //console.log("DCS ID: " + req.body.dcsID); 
    if (req.body.binDelivered == '') { 
        req.body.binDelivered = null;
    }

    if (req.body.binPulled == '') {
        req.body.binPulled = null;
    }
    var sql = "INSERT INTO tblbdafentry (bdafID, company, address, council, contactPerson, contactNo, acrSticker, acrID, jobDesc, binSize, unit, remarks, binDelivered, binPulled) VALUE ('" + req.body.bdafID + "' , '"  + req.body.company + "', '"  + req.body.address + "', '" + req.body.council + "', '" + req.body.contactPerson + "', '" + req.body.contactNo + "', '" + req.body.acrSticker + "', '" + req.body.acrID+ "', '" + req.body.jobDesc + "', '" + req.body.binSize + "', '" + req.body.unit + "', '" + req.body.remarks +  "')";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.json({"status": "success", "message": "BDAF entry added!", "details": {"bdafID": req.body.bdafID}});
    });
}); // Complete

//IF CUSTOMER CAN REGISTER
// app.post('/addBdafEntry', function (req, res) {
//     'use strict';
//     //console.log("DCS ID: " + req.body.dcsID);
//     if (req.body.binDelivered == '') {
//         req.body.binDelivered = null;
//     }

//     if (req.body.binPulled == '') {
//         req.body.binPulled = null;
//     }
//     var sql = "INSERT INTO tblbdafentry (bdafID, company, address, council, contactPerson, contactNo, acrSticker, acrID, jobDesc, binSize, unit, remarks, binDelivered, binPulled) VALUE ('" + req.body.bdafID + "' , '"  + req.body.company + "', '"  + req.body.address + "', '" + req.body.council + "', '" + req.body.contactPerson + "', '" + req.body.contactNo + "', '" + req.body.acrSticker + "', '" + req.body.acrID+ "', '" + req.body.jobDesc + "', '" + req.body.binSize + "', '" + req.body.unit + "', '" + req.body.remarks +  "')";
//     database.query(sql, function (err, result) {
//         if (err) {
//             throw err;
//         }

//         res.json({"status": "success", "message": "BDAF entry added!", "details": {"bdafID": req.body.bdafID}});
//     });
// }); // Complete



app.post('/getBdafInfo', function (req, res) {
    'use strict';
    //console.log("DCS ID: " + req.body.dcsID);
    var sql = "SELECT * from tblbdaf where bdafID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
 
        res.json(result);
    });
}); // Complete




module.exports = app;