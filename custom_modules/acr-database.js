/*jslint node:true*/
var variable = require('../variable');
var express = variable.express;
var dateTime = variable.dateTime;
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var fs = require('fs');
const e = require('express');
const { type } = require('os');

app.get('/getAcrdbList',function(req, res){
    'use strict';

    var sql= "SELECT `id` AS 'id', `Serial_No` as 'serialNo', `Brand` AS 'brand', `Bin_Size` AS 'binSize', `council` AS 'council', `Date_of_Application` AS 'dateOfApplication', `Name` AS 'name', `Tel_Contact` AS 'contact', `IC_Number` AS 'ic', `Company_Name` AS 'company', `Billing_Address` AS 'billAddress', `Place_of_Service_Lot_No` AS 'serviceAddress', `Frequency` AS 'frequency', `Type_of_Premise` AS 'typeOfPremise', `ACR_Serial_No` AS 'acrSerialNo', `Council_Serial_No` AS 'councilSerialNo', `Remarks` AS 'remarks', `Mon` AS 'mon', `Tue` AS 'tue', `Wed` AS 'wed', `Thu` AS 'thu', `Fri` AS 'fri', `Sat` AS 'sat', `Sun` AS 'sun' FROM tblacrdatabase ORDER BY id DESC";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    });

});

app.post('/addAcrDB', function(req, res){
    'use strict';
    
    var sql = "INSERT INTO tblacrdatabase (`Serial_No`, `Brand`, `Bin_Size`, `Date_of_Application`, `Name`, `Tel_Contact`, `IC_Number`, `Company_Name`, `Billing_Address`, `Place_of_service_Lot_No`, `Frequency`, `Type_of_Premise`, `ACR_Serial_No`, `Council_Serial_No`, `Remarks`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`, `Council`, `status`) VALUES ('" + req.body.serialNo + "', '" + req.body.brand + "', '" + req.body.binSize + "', '" + req.body.dateOfApplication + "', '" + req.body.name + "', '" + req.body.contact + "', '" + req.body.ic + "', '" + req.body.company + "', '" + req.body.billAddress + "', '" + req.body.serviceAddress + "', '" + req.body.frequency + "', '" + req.body.typeOfPremise + "', '" + req.body.acrSerialNo + "', '" + req.body.councilSerialNo + "', '" + req.body.remarks + "', '" + req.body.mon + "', '" + req.body.tue + "', '" + req.body.wed + "', '" + req.body.thu + "', '" + req.body.fri + "', '" + req.body.sat + "', '" + req.body.sun + "', '" + req.body.council + "', '1')"

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json({"status": "success"});
    });
});

app.post('/getAcrDbDetail', function(req, res){
    'use strict';

    var sql = "SELECT `id` AS 'id', `Serial_No` as 'serialNo', `Brand` AS 'brand', `Bin_Size` AS 'binSize', `council` AS 'council', `Date_of_Application` AS 'dateOfApplication', `Name` AS 'name', `Tel_Contact` AS 'contact', `IC_Number` AS 'ic', `Company_Name` AS 'company', `Billing_Address` AS 'billAddress', `Place_of_Service_Lot_No` AS 'serviceAddress', `Frequency` AS 'frequency', `Type_of_Premise` AS 'typeOfPremise', `ACR_Serial_No` AS 'acrSerialNo', `Council_Serial_No` AS 'councilSerialNo', `Remarks` AS 'remarks', `Mon` AS 'mon', `Tue` AS 'tue', `Wed` AS 'wed', `Thu` AS 'thu', `Fri` AS 'fri', `Sat` AS 'sat', `Sun` AS 'sun' FROM tblacrdatabase WHERE id = '" + req.body.id + "'";
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    });
});

app.post('/saveAcrdbEdit', function(req, res){
    'use strict';

    Object.keys(req.body).forEach(function (property) {
        if (req.body[property] == null ) {
            req.body[property] = '';
        }
      });
        
    var 
    serialNo = req.body.serialNo.replace(/'/g,"\\'"),
    brand = req.body.brand.replace(/'/g,"\\'"),
    binSize = req.body.binSize.replace(/'/g,"\\'"),
    dateOfApplication = req.body.saveDateOfApplication,
    name = req.body.name.replace(/'/g,"\\'"),
    contact = req.body.contact.replace(/'/g,"\\'"),
    ic = req.body.ic.replace(/'/g,"\\'"),
    company = req.body.company.replace(/'/g,"\\'"), 
    billingAddress = req.body.billAddress.replace(/'/g,"\\'"), 
    serviceAddress = req.body.serviceAddress.replace(/'/g,"\\'"),
    frequency = req.body.frequency.replace(/'/g,"\\'"), 
    typeOfPremise = req.body.typeOfPremise.replace(/'/g,"\\'"), 
    acrSerialNo = req.body.acrSerialNo.replace(/'/g,"\\'"), 
    councilSerialNo = req.body.councilSerialNo.replace(/'/g,"\\'"),
    mon = req.body.checkMon,
    tue = req.body.checkTue,
    wed = req.body.checkWed,
    thu = req.body.checkThu,
    fri = req.body.checkFri,
    sat = req.body.checkSat,
    sun = req.body.checkSun,
    council = req.body.council,
    remarks = req.body.remarks;

    if(mon == true){
        mon = 'X';
    }else{
        mon = '';
    }
    if(tue == true){
        tue = 'X';
    }else{
        tue = '';
    }
    if(wed == true){
        wed = 'X';
    }else{
        wed = '';
    }
    if(thu == true){
        thu = 'X';
    }else{
        thu = '';
    }
    if(fri == true){
        fri = 'X';
    }else{
        fri = '';
    }
    if(sat == true){
        sat = 'X';
    }else{
        sat = '';
    }
    if(sun == true){
        sun = 'X';
    }else{
        sun = '';
    }


    var sql = "UPDATE tblacrdatabase SET `Serial_No` = '" + serialNo + "', `Brand` = '" + brand + "', `Bin_Size` = '" + binSize + "', `Date_of_Application` = '" + dateOfApplication + "', `Name` = '" + name + "', `Tel_Contact` = '" + contact + "', `IC_Number` = '" + ic + "', `Company_Name`= '" + company + "', `Billing_Address` = '" + billingAddress + "', `Place_of_Service_Lot_No` = '" + serviceAddress + "', `Frequency` = '" + frequency + "', `Type_of_Premise` = '" + typeOfPremise + "', `ACR_Serial_No` = '" + acrSerialNo + "', `Council_Serial_No` = '" + councilSerialNo +"', `Remarks` = '" + remarks + "', `Mon` = '" + mon + "', `Tue` = '" + tue + "', `Wed`= '" + wed + "', `Thu` = '" + thu + "', `Fri` = '" + fri + "', `Sat` = '" + sat + "', `Sun` = '" + sun + "', `council` = '" + council + "' WHERE id = '" + req.body.id + "'";
console.log(sql);
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json({"status": "success"});
    });
});

module.exports = app;

app.post('/deleteAcrdb', function(req, res){
    'use strict';
    var sql = "UPDATE tblacrdatabase SET status = 0 WHERE id = '" + req.body.id + "';";
    
    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json({"status":"success", "message":"ACR has been deleted."});
        }
        
    });
})