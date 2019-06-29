var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');


app.get('/getAllTransaction', function (req, res) {
    'use strict';
    var sql = "SELECT date, description, staffID, authorizedBy from tbllog";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("script success");
    });
});

module.exports = app;