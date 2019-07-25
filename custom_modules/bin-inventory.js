var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');


app.get('/getAllInventoryRecords', function (req, res) {
    'use strict';
    var sql = "SELECT * from tblbininventory;";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("script success");
        console.log(result);
    });
});

app.post('/editNewMgbStock', function(req,res){
    'use strict';
    console.log(req.body);
    var sql = `update tblbininventory set doNo='${req.body.doNo}', inNew120 = '${req.body.inNew120}', inNew240 = '${req.body.inNew240}', inNew660 = '${req.body.inNew660}', inNew1000 = '${req.body.inNew1000}', outNew120 = '${req.body.outNew120}', outNew240 = '${req.body.outNew240}', outNew660 = '${req.body.outNew660}', outNew1000 = '${req.body.outNew1000}' where date = '${req.body.date}';`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("script success");
        console.log(result);
    });
});

app.post('/editReusableMgbStock', function(req,res){
    'use strict';
    console.log(req.body);
    var sql = `update tblbininventory set inReusable120 = '${req.body.inReusable120}', inReusable240 = '${req.body.inReusable240}', inReusable660 = '${req.body.inReusable660}', inReusable1000 = '${req.body.inReusable1000}', outReusable120 = '${req.body.outReusable120}', outReusable240 = '${req.body.outReusable240}', outReusable660 = '${req.body.outReusable660}', outReusable1000 = '${req.body.outReusable1000}' where date = '${req.body.date}';`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("script success");
        console.log(result);
    });
});

module.exports = app;