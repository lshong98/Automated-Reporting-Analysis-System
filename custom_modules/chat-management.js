var express = require('express');
var app = express();
var dateTime = require('node-datetime');
var f = require('./function-management');
var database = require('./database-management');

// Staff to Customer
app.post('/messageSend', function (req, res) {
    'use strict';
    
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    
    var sql = "SELECT customerID AS id FROM tblcomplaint WHERE complaintID = '" + req.body.id + "' LIMIT 0, 1";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        } else {
            req.body.recipient = result[0].id;
            
            f.makeID("chat", formatted).then(function (ID) {
                var sql = "INSERT INTO tblchat (chatID, sender, recipient, content, complaintID, creationDateTime, status) VALUE ('" + ID + "', '" + req.body.sender + "', '" + req.body.recipient + "', '" + req.body.content + "', '" + req.body.id + "', '" + formatted + "', 'A')";
                database.query(sql, function (err, result) {
                    if (err) {
                        res.json({"status": "error", "message": "Something error!"});
                        res.end();
                        throw err;
                    } else {
                        res.end();
                        // Emitter
                    }
                });
            });
        }
    });
});

// Customer to Staff
app.post('/messageSend-customer', function (req, res) {
    'use strict';
    
    
});

app.post('/chatList', function (req, res) {
    'use strict';
    
    var sql = "SELECT content, sender, recipient, TIME_FORMAT(creationDateTime, '%H:%i') AS date FROM tblchat WHERE complaintID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        } else {
            res.json(result);
        }
    });
});

module.exports = app;