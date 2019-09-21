var express = require('express');
var app = express();
var EventEmitter = require('events');
var emitter = new EventEmitter();
var dateTime = require('node-datetime');
var f = require('./function-management');
var database = require('./database-management');
var socket = require('./socket-management');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

//SELECT customerID AS id FROM tblcustomer UNION SELECT staffID AS id FROM tblstaff

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
                        emitter.emit('customer to staff message', 1);
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


//Customer to staff
app.post('/sendMessage', function(req, resp){ 
    'use strict';

    var data;
    var userID, staffID;
    var date = dateTime.create().format('Y-m-d H:M:S');
    //var msgs = [];

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });
    
    req.addListener('end', function () {
        var sql = "SELECT tblcustomer.customerID, tblcomplaint.staffID FROM tblcustomer, tblcomplaint WHERE tblcustomer.userEmail = '" + data.user + "' OR tblcomplaint.complaintID = '" + data.id + "' LIMIT 0, 1";
        database.query(sql, function (err, result) {
            if (err) {
                resp.send("error getting user id");
                resp.end();
                throw err;
            } else {
                f.makeID('chat', date).then(function (ID) {
                    sql = "INSERT INTO tblchat (chatID, sender, recipient, content, complaintID, creationDateTime, status) VALUE ('" + ID + "', '" + result[0].customerID + "', '" + result[0].staffID + "', '" + data.message + "', '" + data.id + "', '" + date + "', 'A')";
                    database.query(sql, function (err, result) {
                        if (err) {
                            resp.send("Error Sending Message");
                            resp.end();
                            throw err;
                        } else {
                            resp.send("Message Sent");
                            resp.end();
                            console.log('ok');
                            emitter.emit('customer to staff message', data.id);
                        }
                    });
                });
            }
        });
    });

//    req.addListener('end', function(){
//        var sqlUser = "SELECT customerID FROM tblcustomer WHERE userEmail ='" + data.user + "'";
//        var sqlStaff = "SELECT staffID FROM tblcomplaint WHERE complaintID = '" + data.id + "'";
//        db.query(sqlUser, function(err, res){
//            if(!err){
//                userID = res[0].customerID;
//                db.query(sqlStaff, function(err, res){
//                    if(!err){
//                        staffID = res[0].staffID;
//                        console.log("id: " + staffID);
//                        var sql = "INSERT INTO tblchat (sender, recipient, content, complaintID, creationDateTime) VALUES ('"+userID+"','"+staffID+"','"+data.message+"','"+data.id+"','"+date+"')";
//                        db.query(sql, function(err, res){
//                            if(err){
//                                resp.send("Error Sending Message");
//                                throw err;
//                            }
//                            resp.send("Message Sent");
//                            emitter.emit('customer to staff message');
//                        });
//                    }
//                });
//            }else{
//                resp.send("error getting user id");
//            }
//        });
//    });
});

app.post('/getMessage', function(req, resp){ 
    'use strict';
    var data;
    var userID;
    var msgs = [];

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function(err, res){
            if(!err){
                userID = res[0].userID;
                var sql = "SELECT content, creationDateTime, CASE WHEN sender = '"+userID+"' THEN 'me' ELSE 'officer' END AS sender FROM tblchat WHERE complaintID = '"+data.id+"' ORDER BY creationDateTime ASC";
                //var sql2 = "SELECT message as offmsg, createdAt as offtime from tblchat WHERE complaintID ='"+data.id+"' AND sender!='"+userID+"' ORDER BY createdAt ASC";
                database.query(sql, function(err, res){
                    if(res != undefined){
                        for(var i = 0; i<res.length; i++){
                            msgs.push(res[i]);
                        }
                        //console.log(msgs);
                        if(msgs == null){
                            resp.send("No Messages");
                        }
                        resp.json(msgs);
                        // db.query(sql2, function(err, res){
                        //     for(var x = 0; x<res.length; x++){
                        //         msgs.push(res[x]);
                        //     }
                            
                        // });
                    }
                });
            }else{
                resp.send("error getting user id");
            }
        });
    });
});

app.post('/getChats', function(req, resp){
    'use strict';

    var data, userID, info = [];
    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var sqlUser = "SELECT customerID FROM tblcustomer WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function(err, res){
            if(!err){
                userID = res[0].customerID;
                var sql = "SELECT * FROM tblcomplaint WHERE customerID = '"+userID+"'";
                database.query(sql, function(err, res){
                    if(err){
                        resp.send("Error");
                    }
                    for(var i = 0; i<res.length; i++){
                        info.push(res[i]);
                    }
                    //console.log(info);
                    if(info == null){
                        resp.send("No Chats");
                    }
                    resp.json(info);
                });
            }else{
                resp.send("error getting user id");
            }
        });
    });
});

module.exports = app;