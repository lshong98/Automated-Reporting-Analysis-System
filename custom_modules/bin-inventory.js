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

module.exports = app;