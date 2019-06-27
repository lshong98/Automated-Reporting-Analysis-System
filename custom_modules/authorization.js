var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

app.get('/getAllTasks', function (req, res) {
    'use strict';
    
    var sql = "SELECT taskId, date, staffID, action, description, rowID, query, authorize, authorizedBy, tblName from tblAuthorization";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/approveTask', function (req, res) {
    'use strict';
    
    var sql = "UPDATE tblAuthorization SET authorize = 'Y' WHERE taskID = '"+ req.body.id + "'";
    console.log(req.body);
    console.log(sql);
    console.log("Query called");
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("Task Approved...");

    });

    // database.query(req.body.query, function (err, result) {
    //     if (err) {
    //         throw err;
    //     }
    //     res.json(result);
    //     console.log("Task Pushed to Database.");
    // });
});

app.post('/rejectTask', function (req, res) {
    'use strict';
    var sql = "UPDATE tblAuthorization SET authorize = 'N' WHERE taskID = '"+ req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("Task Rejected.");
    });
});

module.exports = app;