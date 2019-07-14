var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');


app.get('/getAllDatabaseBin', function (req, res) {
    'use strict';
    var sql = "select wbd.idNo as id,wbd.date as date, customer.name as name, customer.ic as icNo, bins.serialNo, 'rc dwell' as rcDwell, customer.houseNo, taman.tamanName as tmnKpg, customer.postCode as areaCode, wbd.activeStatus as status, 'comment' as comment, bins.size as binSize, 'address' as address, customer.name as companyName, acr.acrID as acrfSerialNo, 'item type' as itemType, 'path' as path from tblwheelbindatabase as wbd left join tblbins as bins on wbd.serialNo = bins.serialNo left join tblacr as acr on wbd.acrID = acr.acrID left join tblcustomer as customer on wbd.customerID = customer.customerID left join tbltaman as taman on customer.tamanID = taman.tamanID where wbd.activeStatus = 'a'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        //console.log("script success");
        //console.log(result);
        res.json(result);
        
    });
});

app.post('/deleteDatabaseBin', function (req, res) {
    'use strict';
    var sql = `update tblwheelbindatabase set activeStatus = 'i' where idNo='${req.body.id}';`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        //console.log("delete script success");
        console.log(result);
        res.json(result);
        
    });
});

app.post('/addCustomer', function (req, res) {
    'use strict';
    console.log(`${req.body.tamanID}`);
    console.log(`${req.body.username}`);
    console.log(`${req.body.status}`);
    var sql = `insert into tblcustomer values(NULL,'${req.body.tamanID}','${req.body.username}','${req.body.password}','${req.body.contactNumber}','${req.body.ic}','${req.body.tradingLicense}','${req.body.name}', '${req.body.companyName}','${req.body.houseNo}','${req.body.streetNo}','${req.body.postCode}','${req.body.city}','${req.body.status}',current_timestamp())`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Add Customer success");
        console.log(result);
        res.json({"status": "success", "message": "Customer created successfully!"});
        
    });
});

app.get('/getAllTaman', function (req, res) {
    'use strict';
    var sql = `select * from tbltaman`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        //console.log("Taman query success");
       // console.log(result);
        res.json(result);
        
    });
});


module.exports = app;