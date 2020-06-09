/*jslint node:true */
var express = require('express');
var app = express();
var EventEmitter = require('events');
var emitter = new EventEmitter();
var dateTime = require('node-datetime');
var f = require('./function-management');
var database = require('./database-management');
var socket = require('./socket-management');
var variable = require('../variable');
var emitter = variable.emitter;
var io = variable.io;
var FCMAdmin = variable.FCMAdmin;
var FCMServiceAccount = variable.FCMServiceAccount;

//FCM to send notification to user when staff sends new message
// FCMAdmin.initializeApp({
//     credential: FCMAdmin.credential.cert(FCMServiceAccount),
//     databaseURL: "https://trienekens-994df.firebaseio.com"
// });

//SELECT customerID AS id FROM tblcustomer UNION SELECT staffID AS id FROM tblstaff

// Staff to Customer
app.post('/messageSend', function (req, res) {
    'use strict';
    
    var dt = dateTime.create(),
//        formatted = dt.format('Y-m-d H:M:S'),
        formatted = req.body.creationDateTime,
        sql = "SELECT userID AS id FROM tblcomplaint WHERE complaintID = '" + req.body.id + "' LIMIT 0, 1",
        topic = "TriComplaintID" + req.body.id;

    var payloadWithTopic = {
        'notification':
            {
                'title': "New Message",
                'body': req.body.content
            },
        topic: topic
    };
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        } else {
            req.body.recipient = result[0].id;
            
            f.makeID("chat", formatted).then(function (ID) {
                var sql = "INSERT INTO tblchat (chatID, sender, recipient, content, complaintID, creationDateTime, status, readStat) VALUE ('" + ID + "', '" + req.body.sender + "', '" + req.body.recipient + "', '" + req.body.content + "', '" + req.body.id + "', '" + formatted + "', 'A', 'u')";
                database.query(sql, function (err, result) {
                    if (err) {
                        res.json({"status": "error", "message": "Something error!"});
                        res.end();
                        throw err;
                    } else {
                        FCMAdmin.messaging().send(payloadWithTopic)
                            .then(function (response) {
                                console.log("Topic message sent successfully");
                            }).catch(function (err) {
                                console.log(err);
                            });
                        res.end();
                    }
                });
            });
        }
    });
});

app.post('/chatList', function (req, res) {
    'use strict';
    
    var sql = "SELECT content, sender, recipient, TIME_FORMAT(creationDateTime, '%H:%i') AS date, DATE_FORMAT(creationDateTime, '%Y-%m-%d %T') AS creationDateTime FROM tblchat WHERE complaintID = '" + req.body.id + "' ORDER BY creationDateTime ASC";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        } else {
            res.json(result);
        }
    });
});

//Customer to staff
app.post('/sendMessage', function (req, resp) {
    'use strict';
    var data;
    var userID, staffID;
    //process.env.TZ = 'Asia/Kuching';
    //var date = dateTime.create().format('Y-m-d H:M:S');
    var startTime = "08:30:00";
    var endTime = "17:30:00";
    var today = new Date();
    //var msgs = [];

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });
    
    req.addListener('end', function () {
        console.log(data.date);
        var date = data.date;
        var currentTime = date.substr(11, 18);
        var message, newID;
        var sql = "SELECT tbluser.userID, tblcomplaint.staffID FROM tbluser, tblcomplaint WHERE tbluser.userEmail = '" + data.user + "' OR tblcomplaint.complaintID = '" + data.id + "' AND tbluser.userID = tblcomplaint.userID LIMIT 0, 1";
        database.query(sql, function (err, result) {
            if (err) {
                resp.send("error getting user id");
                resp.end();
                throw err;
            } else {
                userID = result[0].userID;
                staffID = result[0].staffID;
                message = data.message.replace("'", "\\'");
                f.makeID('chat', date).then(function (ID) {
                    console.log(date);
                    newID = "CHT"+result[0].userID;
                    newID += ID.substring(3, ID.length);
                    sql = "INSERT INTO tblchat (chatID, sender, recipient, content, complaintID, creationDateTime, status, readStat) VALUE ('" + newID + "', '" + result[0].userID + "', '" + result[0].staffID + "', '" + message + "', '" + data.id + "', NOW()," + "'A','u')";
                    database.query(sql, function (err, result) {
                        if (err) {
                            resp.send("Error Sending Message");
                            resp.end();
                            throw err;
                        } else {
                            resp.send("Message Sent");
                            emitter.emit('customer to staff message', data.id);
                            if (currentTime <= startTime || currentTime >= endTime || today.getDay() == 6 || today.getDay() == 0) {
                                console.log("Enter Automated Function");
                                f.makeID('chat', date).then(function (ID) {
                                    newID = "CHT"+userID;
                                    newID += ID.substring(3, ID.length);
                                    var sql2 = "INSERT INTO tblchat (chatID, sender, recipient, content, complaintID, creationDateTime) VALUE ('" + newID + "', '" + staffID + "','" + userID + "','" + "Thank you for your message. We are currently closed as our regular business hours are from 8:30 am to 5:30 pm, Monday through Friday. We will get back to you as soon as possible. Thank you and have a nice day." + "','" + data.id + "', NOW())";
                                    
                                    database.query(sql2, function (err, res) {
                                        if (err) {
                                            throw err;
                                        }
                                    });
                                });
                            } else {
                                console.log("NO AUTOMATED MSG");
                            }
                            resp.end();
                        }
                    });
                });
            }
        });
    });
});

app.post('/getMessage', function (req, resp) {
    'use strict';
    var data,
        userID,
        msgs = [],
        i;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                var sql = "SELECT content, DATE_FORMAT(creationDateTime, '%Y-%m-%d %T') AS creationDateTime, CASE WHEN sender = '" + userID + "' THEN 'me' ELSE 'officer' END AS sender FROM tblchat WHERE complaintID = '" + data.id + "' ORDER BY creationDateTime ASC";
                //var sql2 = "SELECT message as offmsg, createdAt as offtime from tblchat WHERE complaintID ='"+data.id+"' AND sender!='"+userID+"' ORDER BY createdAt ASC";
                database.query(sql, function (err, res) {
                    if (res != undefined) {
                        for (i = 0; i < res.length; i += 1) {
                            msgs.push(res[i]);
                        }
                        //console.log(msgs);
                        if (msgs == null) {
                            resp.send("No Messages");
                        }
                        resp.json(msgs);
                        resp.end();
                        // db.query(sql2, function(err, res){
                        //     for(var x = 0; x<res.length; x++){
                        //         msgs.push(res[x]);
                        //     }
                            
                        // });
                    }
                });
            } else {
                resp.send("error getting user id");
                resp.end();
            }
        });
    });
});

app.post('/getChats', function (req, resp) {
    'use strict';

    var data, userID, info = [], i;
    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                var sql = "SELECT complaintID,userID,staffID, DATE_FORMAT(complaintDate, '%Y-%m-%d %T') AS date,premiseType,complaint,days,remarks,status,status,complaintAddress,readStat FROM tblcomplaint WHERE userID = '" + userID + "' ORDER BY complaintID DESC, complaintDate DESC";
                database.query(sql, function (err, res) {
                    if (err) {
                        resp.send("Error");
                        resp.end();
                    }
                    for (i = 0; i < res.length; i += 1) {
                        info.push(res[i]);
                    }
                    //console.log(info);
                    if (info == null) {
                        resp.send("No Chats");
                        resp.end();
                    }
                    resp.json(info);
                    resp.end();
                    console.log(sql);
                    console.log(info);
                });
            } else {
                resp.send("error getting user id");
                resp.end();
            }
        });
    });
});

module.exports = app;
