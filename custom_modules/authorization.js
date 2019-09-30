var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var dateTime = require('node-datetime');

app.get('/getAllTasks', function (req, res) {
    'use strict';
    
    var sql = "SELECT taskId, date, staffID, action, description, rowID, query, authorize, tblName from tblauthorization WHERE authorize = 'M'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        }
        res.json(result);
        console.log("ALL TASKS COLLECTED");
    });
}); // Complete

app.post('/approveTask', function (req, res) {
    'use strict';
    var dt = dateTime.create(),
        formatted = dt.format('Y-m-d H:M:S'),
        content = "";
    
    var sql = "UPDATE tblauthorization SET authorize = 'Y', authorizedBy = '" + req.body.approvedBy + "' WHERE taskID = '"+ req.body.id + "'";
    var findSQL = "SELECT action, description, authorize, query, tblName FROM tblauthorization WHERE taskID = '" + req.body.id + "' LIMIT 0, 1";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        
        database.query(findSQL, function (err, result) {
            if (err) {
                throw err;
            }
            
            content = result[0].description + " approved.";
            
            if (result[0].action == "add" && result[0].tblName == "tblstaff") {
                f.makeID("account", formatted).then(function (ID) {
                    var firstPosition = (result[0].query).indexOf('ACC');
                    var lastPosition = firstPosition + 15;
                    var oldID = (result[0].query).substring(firstPosition, lastPosition);
                    result[0].query = (result[0].query).replace(oldID, ID);
                    f.insertNewData(result[0].query, req, res);
                    f.log(formatted, content, req.body.approvedBy);
                });
            } else {
                f.log(formatted, content, req.body.approvedBy);
                f.insertNewData(result[0].query, req, res);
            }
        });
    });
});

app.post('/rejectTask', function (req, res) {
    'use strict';
    var sql = "UPDATE tblauthorization SET authorize = 'N', authorizedBy = '" + req.body.rejectedBy + "' WHERE taskID = '"+ req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("Task Rejected.");
    });
});

module.exports = app;