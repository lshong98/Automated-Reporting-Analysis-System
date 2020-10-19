/*jslint node:true*/
var variable = require('../variable');
var express = variable.express;
var dateTime = variable.dateTime;
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var fs = require('fs');
const e = require('express');

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

    console.log(req.body);
    
    var sql = "INSERT INTO tblacrdatabase (`Serial_No`, `Brand`, `Bin_Size`, `Date_of_Application`, `Name`, `Tel_Contact`, `IC_Number`, `Company_Name`, `Billing_Address`, `Place_of_service_Lot_No`, `Frequency`, `Type_of_Premise`, `ACR_Serial_No`, `Council_Serial_No`, `Remarks`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`, `Council`) VALUES ('" + req.body.serialNo + "', '" + req.body.brand + "', '" + req.body.binSize + "', '" + req.body.dateOfApplication + "', '" + req.body.name + "', '" + req.body.contact + "', '" + req.body.ic + "', '" + req.body.company + "', '" + req.body.billAddress + "', '" + req.body.serviceAddress + "', '" + req.body.frequency + "', '" + req.body.typeOfPremise + "', '" + req.body.acrSerialNo + "', '" + req.body.councilSerialNo + "', '" + req.body.remarks + "', '" + req.body.mon + "', '" + req.body.tue + "', '" + req.body.wed + "', '" + req.body.thu + "', '" + req.body.fri + "', '" + req.body.sat + "', '" + req.body.sun + "', '" + req.body.council + "')"

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json({"status": "success"});
    });
});

module.exports = app;