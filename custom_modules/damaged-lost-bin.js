var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// ACR Management
app.post('/addBlost',function(req,res){
    'use strict';
    console.log("HELLO FROM THE SERVER");
    f.makeID("blost", req.body.creationDate).then(function (ID) {
        
        var sql = "INSERT INTO tblblost (blostID, creationDateTime, preparedBy, status) VALUE ('" + ID + "', '" + req.body.date + "' , '" + req.body.preparedBy +  "', 'A')";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }

            res.json({"status": "success", "message": "BLOST created!", "details": {"blostID": ID}});
        });
    });
}); // Complete
app.post('/getAllBlost', function(req,res){
    'use strict';
    var sql = "SELECT blostID as id, creationDateTime as date, preparedBy, authorizedBy, authorizedDate, status from tblblost";
        
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
        console.log("GET ALL BLOST: " + result);
    });  
});

app.post('/getBlostInfo',function(req,res){ 
    'use strict';
    //console.log("DCS ID: " + req.body.dcsID);
    var sql = "SELECT * from tblblost where blostID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) { 
            throw err;
        }

        res.json(result);
    });
}); // Complete

app.post('/getBlostDetails', function(req,res){
    'use strict';
    console.log("GET BDAF DETAILS: HELLO FROM THE SERVER");
    console.log(req.body);

    
    var sql = "SELECT b.blostID, c.name as contactPerson, c.companyName, concat(c.houseNo, ', ', c.streetNo, ', ', c.postCode, ', ', c.city) as address, c.contactNumber as contactNo, a.areaID, db.size, db.serialNo, b.sharedBin, b.dateOfLoss, b.reasonForLoss from tblcustomer as c inner join tblwheelbindatabase as wbd on c.customerID = wbd.customerID innerjoin tblbins as db on wbd.serialNo = db.serialNo inner join tblblostentry as b on b.serialNo = db.serialNo inner join tblarea as a on db.areaID = a.areaID where b.blostID = '" + req.body.id + "'";
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

app.post('/addBlostEntry',function(req,res){ 
    'use strict';
    //console.log("DCS ID: " + req.body.dcsID);
    if(req.body.binDelivered == ''){
        req.body.binDelivered = null; 
    }

    if(req.body.binPulled == ''){
        req.body.binPulled = null;
    }
    var sql = "INSERT INTO tblblostentry (idNo, blostID, customerID, serialNo, sharedBin, dateOfLoss, reasonForLoss, status) VALUE ('" + null + "', '" + req.body.blostID + "' , '"  + req.body.customerID + "', '"  + req.body.serialNo + "', '" + req.body.sharedBin + "', '" + req.body.dateOfLoss + "', '" + req.body.reasonForLoss + "', '" + req.body.status + "')";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.json({"status": "success", "message": "BLOST entry added!", "details": {"BLOSTID": req.body.blostID}});
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

app.post('/getBlostInfo',function(req,res){ 
    'use strict';
    //console.log("DCS ID: " + req.body.dcsID);
    var sql = "SELECT * from tblblost where blostID = '" + req.body.id + "'";
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