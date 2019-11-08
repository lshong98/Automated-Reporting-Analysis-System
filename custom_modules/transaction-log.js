/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');


app.get('/getAllTransaction', function (req, res) {
    'use strict';
    var sql = "SELECT date, description, staffID, authorizedBy from tbllog ORDER BY date DESC";
    database.query(sql, function (err, result) {
        if (err) {
            res.end();
            throw err;
        } else {
            res.json(result);
            res.end();
        }
    });
});

app.get('/historyList', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblhistory.content AS content, DATE_FORMAT(tblhistory.creationDateTime, '%d-%b-%y %H:%i') AS date, tblstaff.staffName AS staff FROM tblhistory JOIN tblstaff ON tblhistory.staffID = tblstaff.staffID ORDER BY tblhistory.creationDateTime DESC";
    database.query(sql, function (err, result) {
        if (err) {
            res.end();
            throw err;
        } else {
            res.json(result);
            res.end();
        }
    });
});

module.exports = app;