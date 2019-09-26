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

module.exports = app;