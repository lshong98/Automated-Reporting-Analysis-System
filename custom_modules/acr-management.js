var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// ACR Management
app.post('/addDcs',function(req,res){
    'use strict';
    console.log(req.body);
    f.makeID("dcs", req.body.creationDate).then(function (ID) {
        
        var sql = "INSERT INTO tbldcs (dcsID, creationDateTime, driver, periodFrom, periodTo, replacementDriver, replacementPeriodFrom, replacementPeriodTo, status) VALUE ('" + ID + "', '" + req.body.creationDate + "' , '" + req.body.driver + "', '" + req.body.periodFrom + "', '" + req.body.periodTo + "', '" + req.body.replacementDriver + "', '" + req.body.replacementPeriodFrom + "', '" + req.body.replacementPeriodTo + "', 'A')";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            // for (i = 0; i < days.length; i += 1) {
            //     if (req.body.days[days[i]] != undefined) {
            //         var sql = "INSERT INTO tblacrfreq (acrID, areaID, day) VALUE ('" + acrID + "', '" + req.body.area + "', '" + days[i] + "')";
            //         database.query(sql, function (err, result) {
            //             if (err) {
            //                 throw err;
            //             }
            //         });
            //     }
            // }
            res.json({"status": "success", "message": "ACR created!", "details": {"dcsID": ID}});
        });
    });
}); // Complete
app.get('/getAllDcs', function(req,res){
    'use strict';
    var sql = "SELECT dcsID AS id, creationDateTime, driver, periodFrom, periodTo, replacementDriver, replacementPeriodFrom, replacementPeriodTo, status from tbldcs";
    //var sql = "SELECT DISTINCT a.acrID AS id, a.acrName AS name, a.acrPhoneNo AS phone, a.acrAddress AS address, DATE_FORMAT(a.acrPeriod, '%d %M %Y') as enddate, c.areaName as area,(CASE WHEN a.acrStatus = 'A' THEN 'ACTIVE' WHEN a.acrStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblacr a INNER JOIN tblacrfreq b ON a.acrID = b.acrID INNER JOIN tblarea c ON c.areaID = b.areaID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        }
        res.json(result);
    }); 
});

app.post('/getDcsDetails', function(req,res){
    'use strict';
    console.log("HELLO FROM THE SERVER");
    console.log(req.body);
    var sql = "SELECT d.acrID, c.companyName, concat(c.houseNo, c.streetNo, c.postCode, c.city) as address, d.areaID, d.beBins, d.acrBins, d.mon, d.tue, d.wed, d.thu, d.fri, d.sat, d.remarks from tbldcsentry as d inner join tblcustomer as c on d.customerID = c.customerID where d.dcsID = '" + req.body.id + "'";
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

app.post('/addDcsEntry',function(req,res){ 
    'use strict';
    //console.log("DCS ID: " + req.body.dcsID);
    var sql = "INSERT INTO tbldcsentry (idNo, dcsID, customerID, beBins, acrBins, mon, tue, wed, thu, fri, sat, remarks) VALUE ('" + null + "', '" + req.body.dcsID + "' , '"  + req.body.customerID + "', '"  + req.body.beBins + "', '" + req.body.acrBins + "', '" + req.body.mon + "', '" + req.body.tue + "', '" + req.body.wed + "', '" + req.body.thu + "', '" + req.body.fri + "', '"+ req.body.sat + "', '" + req.body.remarks + "')";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.json({"status": "success", "message": "ACR created!", "details": {"dcsID": req.body.dcsID}});
    });
}); // Complete

app.post('/getCustomerID', function(req,res){
    'use strict';
    console.log(req.body);
    var sql = "SELECT customerID from tblcustomer where companyName = '" + req.body.companyName + "' and houseNo = '" + req.body.houseNo + "' and streetNo = '" + req.body.streetNo + "' and postCode = '" + req.body.postCode + "' and city = '" + req.body.city + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        }
        res.json(result);
        console.log("Customer ID:" + result);  
    }); 
});

module.exports = app; 