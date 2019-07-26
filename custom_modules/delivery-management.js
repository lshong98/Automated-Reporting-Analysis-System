var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// ACR Management
app.post('/addBdaf',function(req,res){
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
app.post('/getAllBdaf', function(req,res){
    'use strict';
    var sql = "SELECT b.bdafID AS id, b.creationDateTime as date, b.driverID as driver, b.staffID as generalWorker, b.authorizedBy, b.authorizedDate, b.status from tblbdaf as b";
        
    if(req.body.status){
        sql += " WHERE status = 'A'";
    }else{
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

app.post('/getBdafDetails', function(req,res){
    'use strict';
    console.log("GET BDAF DETAILS: HELLO FROM THE SERVER");
    console.log(req.body);

    
    var sql = "SELECT b.bdafID, concat(c.houseNo, ', ', c.streetNo, ', ', c.postCode, ', ', c.city) as location, c.name as contactPerson, c.contactNumber as contactNo, b.acrID, b.acrSticker, b.jobDesc, db.size as binSize, b.serialNo, b.remarks, b.binDelivered, b.binPulled, b.completed from tblcustomer as c inner join tblbdafentry as b on b.customerID = c.customerID inner join tblbins as db on b.serialNo = db.serialNo where b.bdafID = '" + req.body.id + "'";
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

app.post('/addBdafEntry',function(req,res){ 
    'use strict';
    //console.log("DCS ID: " + req.body.dcsID);
    if(req.body.binDelivered == ''){
        req.body.binDelivered = null; 
    }

    if(req.body.binPulled == ''){
        req.body.binPulled = null;
    }
    var sql = "INSERT INTO tblbdafentry (idNo, bdafID, customerID, acrID, acrSticker, serialNo, binDelivered, binPulled, jobDesc, remarks, completed) VALUE ('" + null + "', '" + req.body.bdafID + "' , '"  + req.body.customerID + "', '"  + req.body.acrID + "', '" + req.body.acrSticker + "', '" + req.body.serialNo + "', '" + req.body.binDelivered + "', '" + req.body.binPulled + "', '" + req.body.jobDesc + "', '" + req.body.remarks + "', '"+ req.body.completed + "')";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.json({"status": "success", "message": "BDAF entry added!", "details": {"bdafID": req.body.bdafID}});
    });
}); // Complete


app.get('/getCustomerList', function(req,res){
    'use strict';
    console.log(req.body);
    var sql = "SELECT * from tblcustomer";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        }
        res.json(result);
        console.log(result);
    }); 
}); 

app.get('/getAcrList', function(req,res){
    'use strict';
    console.log(req.body);
    var sql = "SELECT * from tblacr";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        }
        res.json(result);
        console.log(result);
    }); 
});

app.post('/getBdafInfo',function(req,res){ 
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

app.post('/getStaffList', function(req,res){
    'use strict';
    console.log("GET STAFF LIST: " + req.body);
    var sql = "SELECT * from tblstaff where positionID = '" + req.body.positionID + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        }
        res.json(result); 
        console.log(result); 
    }); 
});

app.get('/getBinList', function(req,res){
    'use strict';
    console.log(req.body);
    var sql = "SELECT * from tblwheelbindatabase where activeStatus = 'A' and customerID is not null";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        }
        res.json(result);
        console.log(result);
    }); 
});

module.exports = app; 