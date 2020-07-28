/*jslint node:true*/
// var express = require('express');
// var app = express();
// var server = require('http').createServer(app);
// var SVR_PORT = 3000;
// var path = require('path');
// var upload = require('express-fileupload');

// var database = require('./custom_modules/database-management');

var variable = require('../variable');
//var EventEmitter = require('events');
//var emitter = new EventEmitter();
var bcrypt = variable.bcrypt;
var emitter = variable.emitter;
var express = variable.express;
var app = express();
var dateTime = variable.dateTime;
var f = require('./function-management');
var database = require('./database-management');
var socket = require('./socket-management');
var upload = variable.upload;
var nodemailer = variable.nodemailer;
var path = variable.path;
var fs = variable.fs;
var io = variable.io;
var stream = require('stream');
var util = variable.util;
const webPushPublicVapidKey = 'BKRH77GzVVAdLbU9ZAblIjl_zKYZzLlJQCRZXsdawtS--XnMPIQUN3QXJ87R9qgNITl7gkHjepq4wsm2SVxq6to';
const saltRounds = 10;
const {
    Storage
} = require('@google-cloud/storage');
const storage = new Storage({
    keyFilename: './trienekens-management-portal-5c3ad8aa7ee2.json',
    projectId: 'trienekens-management-portal'
});
const bucket = storage.bucket('trienekens-management-portal-images');

const {
    google
} = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const mailer_cred = require('../custapp-mailer-credentials.json');
const mailer_id = mailer_cred.client_id;
const mailer_sec = mailer_cred.client_secret;
const mailer_ref_tkn = mailer_cred.refresh_token;

const oauth2Client = new OAuth2(
    mailer_id,
    mailer_sec,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: mailer_ref_tkn
});

const accessToken = oauth2Client.getAccessToken();

const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: "trienekensmobileapp@gmail.com",
        clientId: mailer_id,
        clientSecret: mailer_sec,
        refreshToken: mailer_ref_tkn,
        accessToken: accessToken
    }
});

//const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'registercustomerapp@gmail.com',
//         pass: 'trienekens321'
//     }
// });

// var socket = io.connect();

// var mysql = require('mysql');
// var bcrypt = require('bcryptjs');
// var dateTime = require('node-datetime');

//var EventEmitter = require('events');
//var emitter = new EventEmitter();
//var express = require('express');
//var app = express();
//var dateTime = require('node-datetime');
//var f = require('./function-management');
//var database = require('./database-management');
//var upload = require('express-fileupload');
//var nodemailer = require('nodemailer');
//var path = require('path');
//var fs = require('fs');

app.use(upload());
app.use('/img', express.static(__dirname + '/img'));
//app.use(express.static(__dirname + '/pendingImg'));

var imgPath = path.join(__dirname + '/img');

app.post('/loginCustServiceApp', function (req, resp) {
    'use strict';
    var data;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });
    req.addListener('end', function () {
        var sql = "SELECT * FROM tbluser WHERE userEmail = '" + data.email + "'";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            if (result[0] == undefined) {
                resp.send("User undefined");
            } else {
                var transporter, subject, text, email, mailOptions, vCode;

                bcrypt.compare(data.pass, result[0].password, function(err, compRes) {
                    if (compRes) {
                        if (result[0].status == 1) {
                            resp.send("Login Success");
                        } else {
                            // transporter = nodemailer.createTransport({
                            //     service: 'gmail',
                            //     auth: {
                            //         user: 'trienekensmobileapp@gmail.com',
                            //         pass: 'trienekens321'
                            //     }
                            // });
                            vCode = Math.floor(Math.random() * 90000) + 10000;
                            subject = "Trienekens App Verification Code";
                            text = "Your Verification Code is: " + vCode;
                            email = data.email;
                            mailOptions = {
                                from: 'trienekensmobileapp@gmail.com',
                                to: email,
                                subject: subject,
                                text: text
                            };
    
    
                            var updateCode = "UPDATE tbluser SET vCode ='" + vCode + "' WHERE userEmail ='" + data.email + "'";
    
                            smtpTransport.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                    resp.send("Mail Failed");
                                }
                                database.query(updateCode, function (err, res) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        resp.send("Activate Acc " + data.email);
                                    }
                                });
                            });
                        }
                    } else {
                        console.log("login failed");
                        resp.send("Failed");
                    }
                });
                /*
                if ((result[0].userEmail == data.email) && (isPassMatch)) {
                    if (result[0].status == 1) {
                        resp.send("Login Success");
                    } else {
                        // transporter = nodemailer.createTransport({
                        //     service: 'gmail',
                        //     auth: {
                        //         user: 'trienekensmobileapp@gmail.com',
                        //         pass: 'trienekens321'
                        //     }
                        // });
                        vCode = Math.floor(Math.random() * 90000) + 10000;
                        subject = "Trienekens App Verification Code";
                        text = "Your Verification Code is: " + vCode;
                        email = data.email;
                        console.log("vCode: " + vCode);
                        mailOptions = {
                            from: 'trienekensmobileapp@gmail.com',
                            to: email,
                            subject: subject,
                            text: text
                        };


                        var updateCode = "UPDATE tbluser SET vCode ='" + vCode + "' WHERE userEmail ='" + data.email + "'";

                        smtpTransport.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                                resp.send("Mail Failed");
                            }
                            //console.log("Email sent: " + info.response);
                            database.query(updateCode, function (err, res) {
                                if (err) {
                                    throw err;
                                } else {
                                    //console.log("Registered");
                                    resp.send("Activate Acc " + data.email);
                                }
                            });
                        });
                    }
                } else {
                    console.log("login failed");
                    resp.send("Failed");
                }*/
            }
        });
    });
});

//unused method - commented for reference
//get customer's area ID
// app.post('/getAreaID', function (req, resp) {
//     'use strict';
//     var data, tamanID, areaID;

//     req.addListener('data', function (postDataChunk) {
//         data = JSON.parse(postDataChunk);
//     });

//     req.addListener('end', function () {
//         var sql = "SELECT tamanID FROM tbluser WHERE userEmail = '" + data.email + "'";
//         database.query(sql, function (err, res) {
//             console.log(res);
//             if(err){
//                 console.log(err);
//             }
//             if (res[0].tamanID != null) {
//                 tamanID = res[0].tamanID;
//                 var getAreaSql = "SELECT areaID FROM tbltaman WHERE tamanID = " + tamanID;
//                 database.query(getAreaSql, function (err, res) {
//                     console.log(res[0]);
//                     areaID = res[0].areaID;
//                     resp.send(areaID);
//                 });
//             }else{
//                 resp.send("");
//             }
//         });
//     });
// });

//unused method - commented for reference
//insert fcm token to db
// app.post('/insertToken', function (req, resp) {
//     'use strict';
//     var data, msg;

//     req.addListener('data', function (postDataChunk) {
//         data = JSON.parse(postDataChunk);
//     });
//     req.addListener('end', function () {
//         console.log(data);
//         var checkSql = "SELECT fcm_token FROM fcm_info";
//         var insertSql = "INSERT INTO fcm_info(fcm_token) values('" + data.token + "')";
//         database.query(checkSql, function (err, res) {
//             for (var i = 0; i < res.length; i++) {
//                 var existingTokens = res[i].fcm_token;
//                 //console.log(res[i].fcm_token);
//                 if (data.token == existingTokens) {
//                     msg = "Token already exists";
//                     resp.send(msg);
//                 }
//             }

//             if (msg != "Token already exists") {
//                 database.query(insertSql, function (error, result) {
//                     if (!error) {
//                         resp.send("inserted");
//                     } else {
//                         console.log(error);
//                         resp.send("failed to insert");
//                     }
//                 });
//             }
//         });
//     });

// });

app.get('/getImages', function (req, resp) {
    'use strict';

    var results = {};
    results["output"] = [];
    var sql = "SELECT * FROM tblcarouselimg";

    database.query(sql, function (err, res) {
        for (var i = 0; i < res.length; i++) {
            results["output"].push({
                "imageName": res[i].fileName,
                "id": res[i].id
            });
        }
        resp.json(results);
    });
});

app.post('/getNotifs', function (req, resp) {
    'use strict';

    var data;
    var results = {};
    results["response"] = [];
    results["announcements"] = [];
    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sql = "SELECT notifID, notifText, notifDate, (SELECT COUNT(readStat) FROM tblnotif WHERE tbluser.userEmail = '" + data.email + "' AND readStat = 'u' AND tblnotif.userID = tbluser.userID) as unread FROM tblnotif JOIN tbluser WHERE tbluser.userEmail = '" + data.email + "' AND tbluser.userID = tblnotif.userID ORDER BY notifID DESC, notifDate DESC";
        var sql2 = "SELECT id, announcement, announceDate, announceLink, (SELECT COUNT(readStat) FROM tblannouncement WHERE readStat = 'u') as unread FROM tblannouncement WHERE target = 'TriAllUsers' ORDER BY announceDate DESC";

        database.query(sql, function (err, res) {
            if (!err) {
                for (var i = 0; i < res.length; i++) {
                    results["response"].push({
                        "notifID": res[i].notifID,
                        "notif": res[i].notifText,
                        "notifDate": res[i].notifDate,
                        "unread": res[i].unread
                    });
                }
                //console.log(res[0].unread);

                database.query(sql2, function (err, res) {
                    if (!err) {
                        for (var i = 0; i < res.length; i++) {
                            results["announcements"].push({
                                "id": res[i].id,
                                "announce": res[i].announcement,
                                "announceDate": res[i].announceDate,
                                "announceLink": res[i].announceLink,
                                "unread": res[i].unread
                            });
                        }
                        if (data.areaID != "") {
                            var sql3 = "SELECT announcement, announceDate, announceLink, (SELECT COUNT(readStat) FROM tblannouncement WHERE readStat = 'u') as unread FROM tblannouncement WHERE target = '" + data.areaID + "' ORDER BY announceDate DESC";
                            database.query(sql3, function (err, res) {
                                if (!err) {
                                    for (var i = 0; i < res.length; i++) {
                                        results["announcements"].push({
                                            "id": res[i].id,
                                            "announce": res[i].announcement,
                                            "announceDate": res[i].announceDate,
                                            "announceLink": res[i].announceLink,
                                            "unread": res[i].unread
                                        });
                                    }
                                    resp.json(results);
                                }
                            });
                        } else {
                            resp.json(results);
                        }
                    }
                });
            }
        });
    });
});

app.post('/getNotifUrl', function (req, resp) {
    'use strict';
    var data;
    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT announceLink FROM tblannouncement WHERE id ='" + data.title + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                resp.send(res[0].announceLink);
            } else {
                resp.send("error");
            }
        });
    });
});

app.post('/updateNotifStat', function (req, resp) {
    'use strict';

    var data, userID;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.email + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                console.log( "updateNotifStat:" + util.inspect(res[0], false, null, true));
                userID = res[0].userID;
                var readStat = "UPDATE tblnotif SET readStat = 'r' WHERE userID = '" + userID + "'";
                database.query(readStat, function (err, res) {
                    if (!err) {
                        resp.send("Notif read");
                    }
                });
            } else {
                resp.send("error getting user id");
            }
        });
    });

});

app.post('/insertNotif', function (req, resp) {
    'use strict';

    var data;
    var userID;
    var date = dateTime.create().format('Y-m-d');

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.email + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                var insertSql = "INSERT INTO tblnotif(userID, notifDate, notifText, readStat) VALUES('" + userID + "', NOW(), '" + data.text + "','u')";
                database.query(insertSql, function (err, res) {
                    if (!err) {
                        resp.send("Notif Inserted");
                    } else {
                        resp.send("error inserting notif");
                    }
                });
            } else {
                resp.send("error getting user id");
            }
        });
    });
});

app.post('/binRequest', function (req, resp) {
    'use strict';
    var data;
    var userID, name, contactNumber, companyName, date, remarks;
    var reqID = 0;
    var brHistUpdate = "Customer request pending.\n";
    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT * FROM tbluser WHERE userEmail ='" + data.user + "'";
        date = data.date;
        companyName = "";
        remarks = data.remarks.replace(/'/g,"\\'");

        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                name = res[0].name;
                contactNumber = res[0].contactNumber;
                if (data.name != "" && data.companyName != "" && data.companyAddress != "" && data.contactNumber != "") {
                    companyName = data.companyName.replace(/'/g,"\\'");
                    var insertSql = "INSERT INTO tblbinrequest(userID,dateRequest,name ,companyName, companyAddress, contactNumber,reason,type,requestDate,requestAddress,remarks,status, readStat, brHistUpdate) VALUES('" + userID +"', NOW(), '" + data.name + "','" + companyName + "','" + data.companyAddress + "','" + data.contactNumber + "','" + data.reason + "','" + data.type + "','" + data.requestDate + "','" + data.requestAddress + "','" + remarks + "','" + data.status + "', 'u', '" + brHistUpdate + "')";
                } else {
                    var insertSql = "INSERT INTO tblbinrequest(userID,dateRequest,name ,companyName, contactNumber,reason,type,requestDate,requestAddress,remarks,status, readStat, brHistUpdate) VALUES('" + userID + "', NOW(), '" + name + "','" + companyName + "','" + contactNumber + "','" + data.reason + "','" + data.type + "','" + data.requestDate + "','" + data.requestAddress + "','" + remarks + "','" + data.status + "', 'u', '" + brHistUpdate + "')";
                }

                database.query(insertSql, function (err, res) {
                    if (!err) {
                        var sqlRequestID = "SELECT MAX(reqID) AS max FROM tblbinrequest";
                        database.query(sqlRequestID, function (err, res) {
                            reqID = res[0].max;
                            if((data.reason).includes('Roro')){
                                emitter.emit('binrequest');
                            }
                            var jsonResp = {"msg":"Submit Request Successfully",
                                            "reqID": reqID};
                            if (data.name != "" && data.companyName != "" && data.companyAddress != "" && data.contactNumber != ""){
                                jsonResp.name = data.name;
                            } else {
                                jsonResp.name = name;
                            }
                            resp.json(jsonResp);
                            //resp.send("Submit Request Successfully " + reqID);
                        });
                    } else {
                        resp.send("Failed to Submit Request" + err);
                    }
                });
            } else {
                resp.send("error getting user id");
            }
        });
    });
});

app.post('/uploadBinRequestImage', rawBody, function (req, resp) {

    'use strict';
    var data, sql, userID;
    data = JSON.parse(req.rawBody);
    var urlArray = [];
    console.log(data);
    //Lost bin
    if (typeof data.BinRequestICLost !== 'undefined' && typeof data.BinRequestPolice !== 'undefined' && typeof data.BinRequestUtility !== 'undefined') { 
console.log("lostbin image");
       var async = require('async');
       if (typeof data.BinRequestAssessment !== 'undefined') { // lost residential with Assessment bill image
           // sql = "UPDATE tblbinrequest SET icImg ='/images/BinReqImg/BinRequestICLost_" + data.cID + ".jpg',utilityImg ='/images/BinReqImg/BinRequestUtility_" + data.cID + ".jpg',assessmentImg ='/images/BinReqImg/BinRequestAssessment_" + data.cID + ".jpg',policeImg ='/images/BinReqImg/BinRequestPolice_" + data.cID + ".jpg'  WHERE reqID =" + data.cID + "";
           async.each(["BinRequestICLost", "BinRequestPolice", "BinRequestUtility", "BinRequestAssessment"], function (file, callback) {

               var fileName = "images/BinReqImg/" + file + "_" + data.cID + ".jpg";
               var bufferFile = Buffer.from(data[file], 'base64');
               var bufferStream = new stream.PassThrough();
               bufferStream.end(bufferFile);
               var imgFile = bucket.file(fileName);

               var publicUrl = 'https://storage.googleapis.com/trienekens-management-portal-images/' + fileName;
               urlArray.push(publicUrl);

               bufferStream.pipe(imgFile.createWriteStream({
                       metadata: {
                           contentType: 'image/jpeg',
                           metadata: {
                               custom: 'metadata'
                           }
                       },
                       public: true,
                       validation: 'md5'
                   }))
                   .on('error', function (err) {
                       console.log(err);
                   })
                   .on('finish', function () {
                       console.log("image uploaded to cloud storage");
                       callback();
                   });

               //save file to local folder
               // fs.writeFile(__dirname + '/../images/BinReqImg/' + file + '_' + data.cID + '.jpg', Buffer.from(data[file], 'base64'), function (err) {
               // 	if (err) {
               // 		console.log(err);
               // 	} else {
               // 		console.log(file + '.json was updated.');
               // 	}

               // 	callback();
               // });

           }, function (err) {
               if (err) {
                   console.log(err);
               } else {
                   sql = "UPDATE tblbinrequest SET icImg ='" + urlArray[0] + "',utilityImg ='" + urlArray[2] + "',assessmentImg ='" + urlArray[3] + "',policeImg ='" + urlArray[1] + "'  WHERE reqID =" + data.cID + "";
                   database.query(sql, function (err, res) {
                       if (!err) {
                           emitter.emit('binrequest');
                           resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
                       } else {
                           resp.send("Please Try Again");
                       }
                   });
               }
           });
       } else { // lost residential without assessment bill image
           //sql = "UPDATE tblbinrequest SET icImg ='/images/BinReqImg/BinRequestICLost_" + data.cID + ".jpg',utilityImg ='/images/BinReqImg/BinRequestUtility_" + data.cID + ".jpg',policeImg ='/images/BinReqImg/BinRequestPolice_" + data.cID + ".jpg' WHERE reqID =" + data.cID + "";
           async.each(["BinRequestICLost", "BinRequestPolice", "BinRequestUtility"], function (file, callback) {

               var fileName = "images/BinReqImg/" + file + "_" + data.cID + ".jpg";
               var bufferFile = Buffer.from(data[file], 'base64');
               var bufferStream = new stream.PassThrough();
               bufferStream.end(bufferFile);
               var imgFile = bucket.file(fileName);

               var publicUrl = 'https://storage.googleapis.com/trienekens-management-portal-images/' + fileName;
               urlArray.push(publicUrl);

               bufferStream.pipe(imgFile.createWriteStream({
                       metadata: {
                           contentType: 'image/jpeg',
                           metadata: {
                               custom: 'metadata'
                           }
                       },
                       public: true,
                       validation: 'md5'
                   }))
                   .on('error', function (err) {
                       console.log(err);
                   })
                   .on('finish', function () {
                       console.log("image uploaded to cloud storage");
                       callback();
                   });

           }, function (err) {
               if (err) {
                   console.log(err);
               } else {
                   sql = "UPDATE tblbinrequest SET icImg ='" + urlArray[0] + "',utilityImg ='" + urlArray[2] + "',policeImg ='" + urlArray[1] + "'  WHERE reqID =" + data.cID + "";
                   database.query(sql, function (err, res) {
                       if (!err) {
                           console.log(urlArray);
                           emitter.emit('binrequest');
                           resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
                       } else {
                           resp.send("Please Try Again");
                       }
                   });
               }
           });
       }
    }
    else if(typeof data.DmgBinRequestBin !== 'undefined'){
        var async = require('async');
        if (typeof data.DmgBinRequestAssessment !== 'undefined') { // dmg residential with Assessment bill image
            async.each(["DmgBinRequestIC", "DmgBinRequestBin", "DmgBinRequestUtility", "DmgBinRequestAssessment"], function (file, callback) {
 
                var fileName = "images/BinReqImg/" + file + "_" + data.cID + ".jpg";
                var bufferFile = Buffer.from(data[file], 'base64');
                var bufferStream = new stream.PassThrough();
                bufferStream.end(bufferFile);
                var imgFile = bucket.file(fileName);
 
                var publicUrl = 'https://storage.googleapis.com/trienekens-management-portal-images/' + fileName;
                urlArray.push(publicUrl);
 
                bufferStream.pipe(imgFile.createWriteStream({
                        metadata: {
                            contentType: 'image/jpeg',
                            metadata: {
                                custom: 'metadata'
                            }
                        },
                        public: true,
                        validation: 'md5'
                    }))
                    .on('error', function (err) {
                        console.log(err);
                    })
                    .on('finish', function () {
                        console.log("image uploaded to cloud storage");
                        callback();
                    });
 
                //save file to local folder
                // fs.writeFile(__dirname + '/../images/BinReqImg/' + file + '_' + data.cID + '.jpg', Buffer.from(data[file], 'base64'), function (err) {
                // 	if (err) {
                // 		console.log(err);
                // 	} else {
                // 		console.log(file + '.json was updated.');
                // 	}
 
                // 	callback();
                // });
 
            }, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    sql = "UPDATE tblbinrequest SET icImg ='" + urlArray[0] + "',utilityImg ='" + urlArray[2] + "',assessmentImg ='" + urlArray[3] + "',binImg ='" + urlArray[1] + "'  WHERE reqID =" + data.cID + "";
                    database.query(sql, function (err, res) {
                        if (!err) {
                            emitter.emit('binrequest');
                            resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
                        } else {
                            resp.send("Please Try Again");
                        }
                    });
                }
            });
        } else { // dmg residential without assessment bill image
            //sql = "UPDATE tblbinrequest SET icImg ='/images/BinReqImg/BinRequestICLost_" + data.cID + ".jpg',utilityImg ='/images/BinReqImg/BinRequestUtility_" + data.cID + ".jpg',policeImg ='/images/BinReqImg/BinRequestPolice_" + data.cID + ".jpg' WHERE reqID =" + data.cID + "";
            async.each(["DmgBinRequestIC", "DmgBinRequestBin", "DmgBinRequestUtility"], function (file, callback) {
 
                var fileName = "images/BinReqImg/" + file + "_" + data.cID + ".jpg";
                var bufferFile = Buffer.from(data[file], 'base64');
                var bufferStream = new stream.PassThrough();
                bufferStream.end(bufferFile);
                var imgFile = bucket.file(fileName);
 
                var publicUrl = 'https://storage.googleapis.com/trienekens-management-portal-images/' + fileName;
                urlArray.push(publicUrl);
 
                bufferStream.pipe(imgFile.createWriteStream({
                        metadata: {
                            contentType: 'image/jpeg',
                            metadata: {
                                custom: 'metadata'
                            }
                        },
                        public: true,
                        validation: 'md5'
                    }))
                    .on('error', function (err) {
                        console.log(err);
                    })
                    .on('finish', function () {
                        console.log("image uploaded to cloud storage");
                        callback();
                    });
 
            }, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    sql = "UPDATE tblbinrequest SET icImg ='" + urlArray[0] + "',utilityImg ='" + urlArray[2] + "',binImg ='" + urlArray[1] + "'  WHERE reqID =" + data.cID + "";
                    database.query(sql, function (err, res) {
                        if (!err) {
                            console.log(urlArray);
                            emitter.emit('binrequest');
                            resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
                        } else {
                            resp.send("Please Try Again");
                        }
                    });
                }
            });
        }  
    }
    //Damaged bin
    else if (typeof data.BinRequestBin !== 'undefined') { 

       //refer to complaint upload img. remember to delete service key json file
       var fileName = "images/BinReqImg/BinRequestBin_" + data.cID + ".jpg";
       var bufferFile = Buffer.from(data.BinRequestBin, 'base64');
       var bufferStream = new stream.PassThrough();
       bufferStream.end(bufferFile);
       var imgFile = bucket.file(fileName);

       bufferStream.pipe(imgFile.createWriteStream({
               metadata: {
                   contentType: 'image/jpeg',
                   metadata: {
                       custom: 'metadata'
                   }
               },
               public: true,
               validation: 'md5'
           }))
           .on('error', function (err) {
               console.log(err);
           })
           .on('finish', function () {
               var publicUrl = 'https://storage.googleapis.com/trienekens-management-portal-images/' + fileName;
               sql = "UPDATE tblbinrequest SET binImg ='" + publicUrl + "' WHERE reqID =" + data.cID + "";
               database.query(sql, function (err, res) {
                   if (!err) {
                       emitter.emit('binrequest');
                       resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
                       console.log("image uploaded to cloud storage");
                   } else {
                       resp.send("Please Try Again");
                       console.log(err);
                   }
               });
           });
    } 
    // newbin
   else {
       console.log(req.rawBody);

       var async = require('async');
       if (typeof data.BinRequestTrading !== 'undefined' && typeof data.BinRequestAssessment !== 'undefined') { //new bin commercial with assessment image
           //sql = "UPDATE tblbinrequest SET icImg ='/images/BinReqImg/BinRequestIC_" + data.cID + ".jpg',utilityImg ='/images/BinReqImg/BinRequestUtility_" + data.cID + ".jpg',assessmentImg ='/images/BinReqImg/BinRequestAssessment_" + data.cID + ".jpg',tradingImg ='/images/BinReqImg/BinRequestTrading_" + data.cID + ".jpg'  WHERE reqID =" + data.cID + "";
           async.each(["BinRequestIC", "BinRequestUtility", "BinRequestAssessment", "BinRequestTrading"], function (file, callback) {

               var fileName = "images/BinReqImg/" + file + "_" + data.cID + ".jpg";
               var bufferFile = Buffer.from(data[file], 'base64');
               var bufferStream = new stream.PassThrough();
               bufferStream.end(bufferFile);
               var imgFile = bucket.file(fileName);

               var publicUrl = 'https://storage.googleapis.com/trienekens-management-portal-images/' + fileName;
               urlArray.push(publicUrl);

               bufferStream.pipe(imgFile.createWriteStream({
                       metadata: {
                           contentType: 'image/jpeg',
                           metadata: {
                               custom: 'metadata'
                           }
                       },
                       public: true,
                       validation: 'md5'
                   }))
                   .on('error', function (err) {
                       console.log(err);
                   })
                   .on('finish', function () {
                       console.log("image uploaded to cloud storage");
                       callback();
                   });

               //save to local folder
               // fs.writeFile(__dirname + '/../images/BinReqImg/' + file + '_' + data.cID + '.jpg', Buffer.from(data[file], 'base64'), function (err) {
               // 	if (err) {
               // 		console.log(err);
               // 	} else {
               // 		console.log(file + '.json was updated.');
               // 	}

               // 	callback();
               // });

           }, function (err) {
               if (err) {
                   console.log(err);
               } else {
                   sql = "UPDATE tblbinrequest SET icImg ='" + urlArray[0] + "',utilityImg ='" + urlArray[1] + "',assessmentImg ='" + urlArray[2] + "',tradingImg ='" + urlArray[3] + "'  WHERE reqID =" + data.cID + "";
                   database.query(sql, function (err, res) {
                       if (!err) {
                           console.log(urlArray);
                           emitter.emit('binrequest');
                           resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
                       } else {
                           resp.send("Please Try Again");
                       }
                   });
                   console.log("success");
               }
           });
       } else if(typeof data.BinRequestTrading !== 'undefined' && typeof data.BinRequestAssessment == 'undefined'){ //new bin commercial without assessment bill image
           async.each(["BinRequestIC", "BinRequestUtility", "BinRequestTrading"], function (file, callback) {

               var fileName = "images/BinReqImg/" + file + "_" + data.cID + ".jpg";
               var bufferFile = Buffer.from(data[file], 'base64');
               var bufferStream = new stream.PassThrough();
               bufferStream.end(bufferFile);
               var imgFile = bucket.file(fileName);

               var publicUrl = 'https://storage.googleapis.com/trienekens-management-portal-images/' + fileName;
               urlArray.push(publicUrl);

               bufferStream.pipe(imgFile.createWriteStream({
                       metadata: {
                           contentType: 'image/jpeg',
                           metadata: {
                               custom: 'metadata'
                           }
                       },
                       public: true,
                       validation: 'md5'
                   }))
                   .on('error', function (err) {
                       console.log(err);
                   })
                   .on('finish', function () {
                       console.log("image uploaded to cloud storage");
                       callback();
                   });

               //save to local folder
               // fs.writeFile(__dirname + '/../images/BinReqImg/' + file + '_' + data.cID + '.jpg', Buffer.from(data[file], 'base64'), function (err) {
               // 	if (err) {
               // 		console.log(err);
               // 	} else {
               // 		console.log(file + '.json was updated.');
               // 	}

               // 	callback();
               // });

           }, function (err) {
               if (err) {
                   console.log(err);
               } else {
                   sql = "UPDATE tblbinrequest SET icImg ='" + urlArray[0] + "',utilityImg ='" + urlArray[1] + "',tradingImg ='" + urlArray[2] + "'  WHERE reqID =" + data.cID + "";
                   database.query(sql, function (err, res) {
                       if (!err) {
                           console.log(urlArray);
                           emitter.emit('binrequest');
                           resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
                       } else {
                           resp.send("Please Try Again");
                       }
                   });
                   console.log("success");
               }
           });
       } else if(typeof data.BinRequestTrading == 'undefined' && typeof data.BinRequestAssessment !== 'undefined'){ //new bin residential with assessment bill image
           //sql = "UPDATE tblbinrequest SET icImg ='/images/BinReqImg/BinRequestIC_" + data.cID + ".jpg',utilityImg ='/images/BinReqImg/BinRequestUtility_" + data.cID + ".jpg',assessmentImg ='/images/BinReqImg/BinRequestAssessment_" + data.cID + ".jpg' WHERE reqID =" + data.cID + "";
           async.each(["BinRequestIC", "BinRequestUtility", "BinRequestAssessment"], function (file, callback) {

               var fileName = "images/BinReqImg/" + file + "_" + data.cID + ".jpg";
               var bufferFile = Buffer.from(data[file], 'base64');
               var bufferStream = new stream.PassThrough();
               bufferStream.end(bufferFile);
               var imgFile = bucket.file(fileName);

               var publicUrl = 'https://storage.googleapis.com/trienekens-management-portal-images/' + fileName;
               urlArray.push(publicUrl);

               bufferStream.pipe(imgFile.createWriteStream({
                       metadata: {
                           contentType: 'image/jpeg',
                           metadata: {
                               custom: 'metadata'
                           }
                       },
                       public: true,
                       validation: 'md5'
                   }))
                   .on('error', function (err) {
                       console.log(err);
                   })
                   .on('finish', function () {
                       console.log("image uploaded to cloud storage");
                       callback();
                   });

               //save to local folder
               // fs.writeFile(__dirname + '/../images/BinReqImg/' + file + '_' + data.cID + '.jpg', Buffer.from(data[file], 'base64'), function (err) {
               // 	if (err) {
               // 		console.log(err);
               // 	} else {
               // 		console.log(file + '.json was updated.');
               // 	}

               // 	callback();
               // });

           }, function (err) {
               if (err) {
                   console.log(err);
               } else {
                   sql = "UPDATE tblbinrequest SET icImg ='" + urlArray[0] + "',utilityImg ='" + urlArray[1] + "',assessmentImg ='" + urlArray[2] + "'  WHERE reqID =" + data.cID + "";
                   database.query(sql, function (err, res) {
                       if (!err) {
                           console.log(urlArray);
                           emitter.emit('binrequest');
                           resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
                       } else {
                           resp.send("Please Try Again");
                       }
                   });
               }
           });
       } else if(typeof data.BinRequestTrading == 'undefined' && typeof data.BinRequestAssessment == 'undefined'){ //new bin residential without assessment bill image
           async.each(["BinRequestIC", "BinRequestUtility"], function (file, callback) {

               var fileName = "images/BinReqImg/" + file + "_" + data.cID + ".jpg";
               var bufferFile = Buffer.from(data[file], 'base64');
               var bufferStream = new stream.PassThrough();
               bufferStream.end(bufferFile);
               var imgFile = bucket.file(fileName);

               var publicUrl = 'https://storage.googleapis.com/trienekens-management-portal-images/' + fileName;
               urlArray.push(publicUrl);

               bufferStream.pipe(imgFile.createWriteStream({
                       metadata: {
                           contentType: 'image/jpeg',
                           metadata: {
                               custom: 'metadata'
                           }
                       },
                       public: true,
                       validation: 'md5'
                   }))
                   .on('error', function (err) {
                       console.log(err);
                   })
                   .on('finish', function () {
                       console.log("image uploaded to cloud storage");
                       callback();
                   });

           }, function (err) {
               if (err) {
                   console.log(err);
               } else {
                   sql = "UPDATE tblbinrequest SET icImg ='" + urlArray[0] + "',utilityImg ='" + urlArray[1] + "' WHERE reqID =" + data.cID + "";
                   database.query(sql, function (err, res) {
                       if (!err) {
                           console.log(urlArray);
                           emitter.emit('binrequest');
                           resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
                       } else {
                           resp.send("Please Try Again");
                       }
                   });
               }
           });
       }
   }
});

app.post('/getSchedule', function (req, resp) {
    'use strict';

    var data;
    var tamanID;
    var results = [];
    var json = {};

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlTaman = "SELECT tamanID FROM tbluser WHERE userEmail ='" + data.email + "'";
        database.query(sqlTaman, function (err, res) {
            if (res[0] != undefined) {
                if (res[0].tamanID != null) {
                    tamanID = res[0].tamanID;
                    var sqlarea = "SELECT areaID FROM tbltaman WHERE tamanID = '" + tamanID + "'";
                    database.query(sqlarea, function (err, res) {
                        var areaID = res[0].areaID;
                        var sqlSched = "SELECT collection_frequency FROM tblarea WHERE areaID = '" + areaID + "'";
                        database.query(sqlSched, function (err, res) {
                            if (!err) {
                                results = res[0].collection_frequency.split(",");
                                // for (var i = 0; i < res.length; i++) {
                                //     if (res[i].mon == 1) {
                                //         results.push("Monday");
                                //     }
                                //     if (res[i].tue == 1) {
                                //         results.push("Tuesday");
                                //     }
                                //     if (res[i].wed == 1) {
                                //         results.push("Wednesday");
                                //     }
                                //     if (res[i].thur == 1) {
                                //         results.push("Thursday");
                                //     }
                                //     if (res[i].fri == 1) {
                                //         results.push("Friday");
                                //     }
                                //     if (res[i].sat == 1) {
                                //         results.push("Saturday");
                                //     }
                                // }

                                for (var i = 0; i < results.length; i++) {
                                    json[i] = results[i];
                                }
                                resp.json(json);
                            }
                        });
                    });
                } else {
                    resp.send("");
                }
            } else {
                resp.send("error getting user id");
            }
        });
    });
});

app.post('/complaint', function (req, resp) {
    'use strict';
    var data;
    var userID;
    var premiseComp = "";
    var date = dateTime.create().format('Y-m-d H:M:S');
    var complaintID = 0;
    var sqlComplaintID = "SELECT MAX(complaintID) AS max FROM tblcomplaint";
    var dateID = dateTime.create().format('YmdHMS');

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });
    req.addListener('end', function () {
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                //database.query(sql, function(err, res){
                //if(!err){
                database.query(sqlComplaintID, function (err, res) {
                    // if(res[0].max == undefined){
                    //     complaintID = 1;
                    // }else{
                    //     complaintID = res[0].max;
                    //     complaintID = parseInt(complaintID) + 1;
                    // }
                    complaintID = "COM" + userID + dateID;
                    
                    //check whether premise got value 21/07/2020
                    if(data.premiseComp == null || data.premiseComp == ""){
                        premiseComp = "Household";
                    }else{
                        premiseComp = data.premiseComp;
                    }

                    if (data.compRemarks == null || data.compRemarks == "") {
                        var formattedcomplaint = data.complaint.replace(/'/g,"\\'");
                        var sql = "INSERT INTO tblcomplaint (complaintID, userID, premiseType, complaint, days, complaintDate, complaintAddress, readStat, premiseComp, status) VALUES ('" + complaintID + "','" + userID + "','" + data.premise + "','" + formattedcomplaint + "','" + data.days + "', NOW(),'" + data.compAdd + "', 'u', '" + premiseComp + "', 'p')";
                        //                        var sql = "INSERT INTO tblcomplaint (complaintID, userID, premiseType, complaint, days, complaintDate, complaintAddress, readStat) VALUES ('" + complaintID + "','" + userID + "','" + data.premise + "','" + data.complaint + "','" + data.days + "','" + date + "','" + data.compAdd + "', 'u')";
                    } else {
                        var formattedcomplaint = data.complaint.replace(/'/g,"\\'");
                        var remarks = data.compRemarks.replace(/'/g,"\\'");
                        var sql = "INSERT INTO tblcomplaint (complaintID, userID, premiseType, complaint, days, remarks, complaintDate, complaintAddress, readStat, premiseComp, status) VALUES ('" + complaintID + "','" + userID + "','" + data.premise + "','" + formattedcomplaint + "','" + data.days + "','" + remarks + "', NOW(),'" + data.compAdd + "', 'u', '" + premiseComp + "', 'p')";
                        //                        var sql = "INSERT INTO tblcomplaint (complaintID, userID, premiseType, complaint, days, remarks, complaintDate, complaintAddress, readStat) VALUES ('" + complaintID + "','" + userID + "','" + data.premise + "','" + data.complaint + "','" + data.days + "','" + data.compRemarks + "','" + date + "','" + data.compAdd + "', 'u')";
                    }
                    database.query(sql, function (err, res) {
                        if (!err) {
                            emitter.emit('complaint');
                            resp.send("Complaint Submitted for Complaint ID " + complaintID);
                        } else {
                            resp.send("Failed to Submit");
                            throw err;
                        }
                    });
                });
                //}else{
                //}
                //});
            } else {
                resp.send("error getting user id");
            }
        });
    });
});

app.post('/satisfaction', function (req, resp) {
    'use strict';
    var data;
    var userID, name, company, number, extraComment;
    var date = dateTime.create().format('Y-m-d H:M:S');

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var satisfactionType = data.satisfactionType;
        var sqlUser = "SELECT * FROM tbluser WHERE userEmail ='" + data.user + "'";
        company = data.companyName.replace(/'/g,"\\'");
        extraComment = data.extraComment.replace(/'/g,"\\'");

        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                name = res[0].name;
                number = res[0].contactNumber;
                var sql;

                if (satisfactionType == "compactor") {
                    sql = "INSERT INTO tblsatisfaction_compactor (surveyType, userID, name, location, companyName, address, number, companyRating, teamEfficiency, collectionPromptness, binHandling, spillageControl, queryResponse, extraComment, submissionDate, readStat) VALUES ('" +
                        data.surveyType + "','" + userID + "','" + name + "','" + data.location + "','" + company + "','" + data.address + "','" + number + "','" + parseInt(data.companyRating) + "','" + parseInt(data.teamEfficiency) + "','" + parseInt(data.collectionPromptness) +
                        "','" + parseInt(data.binHandling) + "','" + parseInt(data.spillageControl) + "','" + parseInt(data.queryResponse) + "','" +
                        extraComment + "','" + date + "', 'u')";
                } else if (satisfactionType == "roro") {
                    sql = "INSERT INTO tblsatisfaction_roro (surveyType, userID, name, location, companyName, address, number, companyRating, teamEfficiency, collectionPromptness, cleanliness, physicalCondition, queryResponse, extraComment, submissionDate, readStat) VALUES ('" +
                        data.surveyType + "','" + userID + "','" + name + "','" + data.location + "','" + company + "','" + data.address + "','" + number + "','" + parseInt(data.companyRating) + "','" + parseInt(data.teamEfficiency) + "','" + parseInt(data.collectionPromptness) +
                        "','" + parseInt(data.cleanliness) + "','" + parseInt(data.physicalCondition) + "','" + parseInt(data.queryResponse) + "','" +
                        extraComment + "','" + date + "', 'u')";
                } else if (satisfactionType == "scheduled") {
                    sql = "INSERT INTO tblsatisfaction_scheduled (userID, name, location, companyName, address, number, companyRating, teamEfficiency, healthAdherence, regulationsAdherence, queryResponse, extraComment, submissionDate, readStat) VALUES ('" +
                        userID + "','" + name + "','" + data.location + "','" + company + "','" + data.address + "','" + number + "','" + parseInt(data.companyRating) + "','" + parseInt(data.teamEfficiency) + "','" + parseInt(data.healthAdherence) + "','" + parseInt(data.regulationsAdherence) + "','" + parseInt(data.queryResponse) + "','" + extraComment + "','" + date + "', 'u')";
                }

                database.query(sql, function (err, res) {
                    if (!err) {
                        //emitter.emit('satisfaction form');
                        resp.send("Satisfaction Survey Submitted");
                    } else {
                        console.log(err);
                        resp.send("Failed to Submit");
                    }
                });
            } else {
                resp.send("error getting user id");
            }
        });
    });
});

app.post('/enquiry', function (req, resp) {
    'use strict';
    var data;
    var name, phone;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {

        var sqlUser = "SELECT * FROM tbluser WHERE userEmail ='" + data.user + "'";

        database.query(sqlUser, function (err, res) {
            if (!err) {
                name = res[0].name;
                phone = res[0].contactNumber;

                var mailOptions = {
                    from: "trienekensmobileapp@gmail.com",
                    to: "customercare@trienekens.com.my",
                    subject: data.subject,
                    generateTextFromHTML: true,
                    html: "<p><b>Name: </b>" + name + "</p>" + "<p><b>Contact Number: </b>" + phone + "<p><b>Email: </b>" + data.user + "</p><p><b>Enquiry:</b></p><p>" + data.enquiry + "</p><br/><p>This enquiry is sent via the Trienekens Customer Service App.</p>"
                };

                smtpTransport.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        resp.send("Failed to Submit");
                        console.log(error);
                    } else {
                        resp.send("Enquiry Submitted");
                    }
                });
            } else {
                resp.send("error getting user email");
            }
        });
    });
});

// app.post('/sendMessage', function(req, resp){ 
//     'use strict';

//     var data;
//     var userID, staffID;
//     var date = dateTime.create().format('Y-m-d H:M:S');
//     //var msgs = [];

//     req.addListener('data', function(postDataChunk){
//         data = JSON.parse(postDataChunk);
//     });

//     req.addListener('end', function(){
//         var sqlUser = "SELECT customerID FROM tblcustomer WHERE userEmail ='" + data.user + "'";
//         var sqlStaff = "SELECT staffID FROM tblcomplaint WHERE complaintID = '" +data.id + "'";
//         database.query(sqlUser, function(err, res){
//             if(!err){
//                 userID = res[0].customerID;
//                 database.query(sqlStaff, function(err, res){
//                     if(!err){
//                         staffID = res[0].staffID;
//                         console.log("id: " + staffID);
//                         var sql = "INSERT INTO tblchat (sender, recipient, content, complaintID, creationDateTime) VALUES ('"+userID+"','"+staffID+"','"+data.message+"','"+data.id+"','"+date+"')";
//                         database.query(sql, function(err, res){
//                             if(err){
//                                 resp.send("Error Sending Message");
//                                 throw err;
//                             }
//                             resp.send("Message Sent");
//                         });
//                     }
//                 });
//             }else{
//                 resp.send("error getting user id");
//             }
//         });
//     });
// });

// app.post('/getMessage', function(req, resp){ 
//     'use strict';
//     var data;
//     var userID;
//     var msgs = [];

//     req.addListener('data', function(postDataChunk){
//         data = JSON.parse(postDataChunk);
//     });

//     req.addListener('end', function(){
//         var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
//         database.query(sqlUser, function(err, res){
//             if(!err){
//                 userID = res[0].userID;
//                 var sql = "SELECT content, creationDateTime, CASE WHEN sender = '"+userID+"' THEN 'me' ELSE 'officer' END AS sender FROM tblchat WHERE complaintID = '"+data.id+"' ORDER BY creationDateTime ASC";
//                 //var sql2 = "SELECT message as offmsg, createdAt as offtime from tblchat WHERE complaintID ='"+data.id+"' AND sender!='"+userID+"' ORDER BY createdAt ASC";
//                 database.query(sql, function(err, res){
//                     if(res != undefined){
//                         for(var i = 0; i<res.length; i++){
//                             msgs.push(res[i]);
//                         }
//                         console.log(msgs);
//                         if(msgs == null){
//                             resp.send("No Messages");
//                         }
//                         resp.json(msgs);
//                         // db.query(sql2, function(err, res){
//                         //     for(var x = 0; x<res.length; x++){
//                         //         msgs.push(res[x]);
//                         //     }

//                         // });
//                     }
//                 });
//             }else{
//                 resp.send("error getting user id");
//             }
//         });
//     });
// });

// app.post('/getChats', function(req, resp){
//     'use strict';

//     var data, userID, info = [];
//     req.addListener('data', function(postDataChunk){
//         data = JSON.parse(postDataChunk);
//     });

//     req.addListener('end', function(){
//         var sqlUser = "SELECT customerID FROM tblcustomer WHERE userEmail ='" + data.user + "'";
//         database.query(sqlUser, function(err, res){
//             if(!err){
//                 userID = res[0].customerID;
//                 var sql = "SELECT * FROM tblcomplaint WHERE customerID = '"+userID+"'";
//                 database.query(sql, function(err, res){
//                     if(err){
//                         resp.send("Error");
//                     }
//                     for(var i = 0; i<res.length; i++){
//                         info.push(res[i]);
//                     }
//                     console.log(info);
//                     if(info == null){
//                         resp.send("No Chats");
//                     }
//                     resp.json(info);
//                 });
//             }else{
//                 resp.send("error getting user id");
//             }
//         });
//     });
// });

app.post('/checkIC', function (req, resp) {
    'use strict';

    var data;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sql = "SELECT * FROM tblcustomer WHERE ic = '" + data.ic + "'";
        database.query(sql, function (err, res) {
            if (res[0] != undefined) {
                if (res[0].status == 1) {
                    var sqlUser = "SELECT * FROM tbluser WHERE customerID = '" + res[0].customerID + "'";
                    database.query(sqlUser, function (err, res) {
                        if (res[0] != undefined) {
                            resp.send("Has Acc");
                        } else {
                            resp.send("No Acc");
                        }
                    });
                } else if (res[0].status == 0) {
                    resp.send("Pending");
                } else {
                    resp.send("Rejected");
                }
            } else {
                resp.send("Not Customer");
            }

            if (err) {
                resp.send("Error");
                throw err;
            }
        });
    });
});

app.post('/checkValidity', function (req, resp) {
    'use strict';
    var data;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlEmail = "SELECT * FROM tbluser";
        var mailMatch = false;
        var pnoMatch = false;
        database.query(sqlEmail, function (err, res) {

            if (res!=undefined){
                for (var i = 0; i < res.length; i++) {

                    if (res[i].userEmail == data.email) {
                        mailMatch = true;
                    }
                    // if (res[i].contactNumber == data.pno) {
                    //     pnoMatch = true;
                    // }
                }
    
                if (pnoMatch == true && mailMatch == true) {
                    resp.send("2 Errors");
                } else if (pnoMatch == true && mailMatch == false) {
                    resp.send("Pno Taken");
                } else if (pnoMatch == false && mailMatch == true) {
                    resp.send("Email Taken");
                } else {
                    resp.send("Valid Info");
                }
            }

            if (err) {
                resp.send("Error");
                throw err;
            }
        });
    });
});

app.post('/checkTL', function (req, resp) {
    'use strict';

    var data;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sql = "SELECT * FROM tblcustomer WHERE tradingLicense = '" + data.tl + "'";
        database.query(sql, function (err, res) {
            if (res[0] != undefined) {
                resp.send("TL Error");
            } else {
                resp.send("TL OK");
            }

            if (err) {
                resp.send("Error");
                throw err;
            }
        });
    });
});



app.post('/checkEmail', function (req, resp) {
    'use strict';

    var data;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sql = "SELECT * FROM tblcustomer WHERE ic = '" + data.ic + "'";
        database.query(sql, function (err, res) {
            if (res[0] != undefined) {
                resp.send(res[0].userEmail);
            }

            if (err) {
                throw err;
            }
        });
    });
});

app.post('/NewRegister', function (req, resp) {
    'use strict';

    var data, transporter, subject, text, email, mailOptions, vCode, address, name;
    var userID = 0;
    var date = dateTime.create().format('Y-m-d H:M:S');

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        // transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: 'trienekensmobileapp@gmail.com',
        //         pass: 'trienekens321'
        //     }
        // });
        vCode = Math.floor(Math.random() * 90000) + 10000;
        subject = "Trienekens App Verification Code";
        text = "Thank You for Signing Up to the Trienekens App. Your Verification Code is: " + vCode;
        email = data.email;
        mailOptions = {
            from: 'trienekensmobileapp@gmail.com',
            to: email,
            subject: subject,
            text: text
        };

        var sql = "SELECT MAX(CAST(userID as signed)) as max FROM tbluser";
        database.query(sql, function (err, res) {
            userID = res[0].max;
            userID = parseInt(userID) + 1;

            if (data.add1 != "" && data.add2 != "") {
                address = data.add1 + " " + data.add2;
                address = address.replace(/'/g,"\\'");
            } else if (data.add1 != "" && data.add2 == "") {
                address = data.add1;
                address = address.replace(/'/g,"\\'");
            }
            name = data.name.replace(/'/g,"\\'");

            bcrypt.hash(data.pass, saltRounds, function(err, hash) {

                var sql3;

                if (address == undefined) {                
                    sql3 = "INSERT INTO tbluser (userID, name, userEmail, password, contactNumber, vCode, creationDateTime) VALUES ('" + userID + "','" + name + "','" + data.email + "','" + hash + "','" + data.pno + "','" + vCode + "','" + date + "')";
                } else {
                    sql3 = "INSERT INTO tbluser (userID, name, userEmail, password, contactNumber, address, vCode, creationDateTime) VALUES ('" + userID + "','" + name + "','" + data.email + "','" + hash + "','" + data.pno + "','" + address + "','" + vCode + "','" + date + "')";
                }

                smtpTransport.sendMail(mailOptions, function (error, info) {
                    try{
                        database.query(sql3, function (err, res) {
                            if (err) {
                                resp.send(err);
                                console.log(err);
                                throw err;
                            } else {
                                //console.log("Registered");
                                resp.send("Registered");
                            }   
                        });
                    }catch(error){
                        console.log(error);
                    }
                    
//                    if (error) {
//                        console.log(error);
//                        resp.send("Mail Failed");
//                    }
                    
                    //console.log("Email sent: " + info.response);
//                    database.query(sql3, function (err, res) {
//                        if (err) {
//                            resp.send(err);
//                            console.log(err);
//                            throw err;
//                        } else {
//                            //console.log("Registered");
//                            resp.send("Registered");
//                        }
//                    });
                });
            });
        });
    });
});


app.post('/registerAcc', function (req, resp) {
    'use strict';

    var data, transporter, subject, text, email, mailOptions, vCode;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fravleinulan@gmail.com',
                pass: 'trienekens123'
            }
        });
        vCode = Math.floor(Math.random() * 90000) + 10000;
        subject = "Trienekens App Verification Code";
        text = "Thank You for Signing Up to the Trienekens App. Your Verification Code is: " + vCode;
        email = data.email;
        mailOptions = {
            from: 'fravleinulan@gmail.com',
            to: email,
            subject: subject,
            text: text
        };

        var sql = "SELECT customerID from tblcustomer WHERE ic='" + data.ic + "'";
        database.query(sql, function (err, res) {
            if (err) {
                resp.send("Failed");
                throw err;
            }

            var userID = res[0].customerID;
            var sql2 = "INSERT INTO tbluser (customerID, userEmail, password, vCode) VALUES ('" + userID + "','" + data.email + "','" + data.pass + "','" + vCode + "')";
            var sql3 = "UPDATE tblcustomer SET userEmail = '" + data.email + "' WHERE ic ='" + data.ic + "'";

            smtpTransport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    resp.send("Mail Failed");
                    console.log(error);
                }
                database.query(sql2, function (err, res) {
                    if (err) {
                        throw err;
                    }
                    database.query(sql3, function (err, res) {
                        if (err) {
                            throw err;
                        }
                        resp.send("Registered");
                    });
                });
            });
        });
    });
});

app.post('/registerNew', function (req, resp) {
    'use strict';

    var data, custID = 0,
        tamanID, date = dateTime.create().format('Y-m-d H:i:s');

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var custIdSql = "SELECT MAX(customerID) AS max FROM tblcustomer";
        var sqlTaman = "SELECT tamanID FROM tbltaman WHERE tamanName = '" + data.tmn + "'";
        var sqlTradeLic = "SELECT tradingLicense from tblcustomer WHERE tradingLicense='" + data.tl + "'";
        var sqlInsert;
        database.query(custIdSql, function (err, res) {
            custID = res[0].max;
            custID = parseInt(custID) + 1;
            database.query(sqlTaman, function (err, res) {
                if (err) {
                    resp.send("Taman ID Fetch Error");
                }
                tamanID = res[0].tamanID;
                database.query(sqlTradeLic, function (err, res) {
                    if (res[0] == undefined) {
                        sqlInsert = "INSERT INTO tblcustomer (customerID, tamanID, userEmail, password, name, contactNumber, ic, houseNo, streetNo, postCode, city, State, status, creationDateTime) VALUES ('" + custID + "','" + tamanID + "','" + data.email + "','" + data.pass + "','" + data.name + "','" + data.pno + "','" + data.ic + "','" + data.hno + "','" + data.lrg + "','" + data.pcode + "','" + data.city + "','" + data.state + "',0,'" + date + "')";
                        database.query(sqlInsert, function (err, res) {
                            if (!err) {
                                resp.send("Registered");
                            } else {
                                resp.send("Failed");
                            }
                        });
                    } else {
                        sqlInsert = "INSERT INTO tblcustomer (customerID, tamanID, userEmail, password, name, contactNumber, ic, houseNo, streetNo, postCode, city, State, tradingLicense, status, creationDateTime) VALUES ('" + custID + "','" + tamanID + "','" + data.email + "','" + data.pass + "','" + data.name + "','" + data.pno + "','" + data.ic + "','" + data.hno + "','" + data.lrg + "','" + data.pcode + "','" + data.city + "','" + data.state + "','" + data.tl + "',0,'" + date + "')";
                        database.query(sqlInsert, function (err, res) {
                            if (!err) {
                                resp.send("Registered");
                            } else {
                                resp.send("Failed");
                            }
                        });
                    }
                });
            });
        });
    });
});

app.post('/verifyAcc', function (req, resp) {
    'use strict';
    var data;
    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });
    req.addListener('end', function () {
        var sql = "SELECT vCode FROM tbluser WHERE userEmail = '" + data.email + "'";
        database.query(sql, function (err, res) {
            if (err) {
                resp.send("Failed to Register");
                throw err;
            }
            if (res[0].vCode == data.vcode) {
                var sql2 = "UPDATE tbluser SET status = 1 WHERE userEmail ='" + data.email + "'";
                database.query(sql2, function (err, res) {
                    if (err) {
                        throw err;
                    }
                    resp.send("Successfully Registered");
                });
            } else {
                resp.send("Invalid Verification Code");
            }
        });
    });
});

app.post('/getInfo', function (req, resp) {
    'use strict';
    var data;
    var info = {};

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sql = "SELECT * FROM tbluser WHERE userEmail = '" + data.user + "'";
        database.query(sql, function (err, res) {
            console.log( "getInfo:" + util.inspect(res[0], false, null, true));
            console.log( "getInfo:" + res[0].address);
            if (res != undefined) {
                if (res[0].address == undefined || res[0].address == null) {
                    info["pno"] = res[0].contactNumber;
                    resp.json(info);
                } else {
                    info["pno"] = res[0].contactNumber;
                    info["add"] = res[0].address;
                    resp.json(info);
                }
            }
        });
    });
});

app.post('/getTaman', function (req, resp) {
    'use strict';
    var data;
    var info = [];

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sql = "SELECT tamanName FROM tbltaman ORDER BY tamanName ASC";
        database.query(sql, function (err, res) {
            for (var i = 0; i < res.length; i++) {
                info.push(res[i]);
            }
            resp.json(info);
        });
    });
});

app.post('/checkUpdate', function (req, resp) {
    'use strict';
    var data;
    var pass;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        if (data.newp != "") {
            pass = data.newp;
        } else {
            pass = data.oldp;
        }

        var sql = "SELECT * FROM tbluser WHERE userEmail !='" + data.oriemail + "'";
        var mailMatch = false;
        var pnoMatch = false;
        var passError = false;
        var error = "OK";
        database.query(sql, function (err, res) {

            for (var i = 0; i < res.length; i++) {

                if (res[i].userEmail == data.email) {
                    mailMatch = true;
                    error = "";
                }

                if (res[i].contactNumber == data.pno) {
                    pnoMatch = true;
                    error = "";
                }

            }

            var sqlCheckPass = "SELECT password FROM tbluser WHERE userEmail = '" + data.oriemail + "'";
            
            database.query(sqlCheckPass, function (err, res) {

                bcrypt.compare(data.oldp, res[0].password, function(err, compRes) {
                    
                    if (!(compRes)) {
                        passError = true;
                        error = "";
                    } else {
                        passError = false;
                    }
                });

                if (mailMatch) {
                    error = error + "Mail";
                }

                if (pnoMatch) {
                    error = error + "Phone";
                }

                if (passError) {
                    error = error + "Pass";
                }

                console.log(error);
                resp.send(error);

                if (err) {
                    throw err;
                }
            });

            if (err) {
                throw err;
            }
        });
    });
});

app.post('/updateAcc', function (req, resp) {
    'use strict';
    var data;
    var pass;
    var taman = [];
    var changes = [];
    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        if (data.newp != "") {
            pass = data.newp;
        } else {
            pass = data.oldp;
        }

        //  console.log("TAMAN VALUE: " + data.tmn);

        if (data.changes.includes("Mail")) {
            changes.push("Email Address");
        }

        if (data.changes.includes("Phone")) {
            changes.push("Phone Number");
        }

        if (data.changes.includes("Add")) {
            changes.push("Address");
        }

        if (data.changes.includes("Pass")) {
            changes.push("Password");
        }

        var changesText = "";

        for (var i = 0; i < changes.length; i++) {
            changesText = changesText + (i + 1) + ". " + changes[i] + "<br>";
        }

        //        console.log("CHANGES TEXT:::::" + changesText);

        var mailOptions = {
            from: "trienekensmobileapp@gmail.com",
            to: data.email,
            subject: "Trienekens Customer App Account Details Updated",
            generateTextFromHTML: true,
            html: "<p>Your Trienekens Customer App Account details has been updated. Changes were made to your: </p> </br>" + changesText
        };

        smtpTransport.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
        });

        bcrypt.hash(pass, saltRounds, function(err, hash) {
            
            var sqlUpdate;

            if (data.add != undefined) {
                sqlUpdate = "UPDATE tbluser SET userEmail = '" + data.email + "',password='" + hash + "',contactNumber='" + data.pno + "',address='" + data.add + "' WHERE userEmail = '" + data.oriemail + "'";
            } else {
                sqlUpdate = "UPDATE tbluser SET userEmail = '" + data.email + "',password='" + hash + "',contactNumber='" + data.pno + "' WHERE userEmail = '" + data.oriemail + "'";
            }

            database.query(sqlUpdate, function (err, res) {
                if (err) {
                    throw err;
                }
                resp.send("Updated");
            });
        });
    });
});

app.post('/getRequestList', function (req, resp) {
    'use strict';
    var data;
    var userID;
    var msgs = [];

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                var sql = "SELECT * FROM tblbinrequest WHERE userID = '" + userID + "' ORDER BY reqID DESC, requestDate DESC";
                //var sql2 = "SELECT message as offmsg, createdAt as offtime from tblchat WHERE complaintID ='"+data.id+"' AND sender!='"+userID+"' ORDER BY createdAt ASC";
                database.query(sql, function (err, res) {
                    if (res != undefined) {
                        for (var i = 0; i < res.length; i++) {
                            msgs.push(res[i]);
                        }
                        if (msgs == null) {
                            resp.send("No Requests");
                        }
                        resp.json(msgs);
                        // db.query(sql2, function(err, res){
                        //     for(var x = 0; x<res.length; x++){
                        //         msgs.push(res[x]);
                        //     }

                        // });
                    }
                });
            } else {
                resp.send("error getting user id");
            }
        });
    });
});

app.post('/deleteBinReq', function(req, res){
    'use strict';
    console.log(req.body.binReqID);
    var sql = "DELETE FROM tblbinrequest WHERE reqID = '" + req.body.binReqID + "'";

    database.query(sql, function (err, result){
        if(err){
            throw err;
        }else{
            res.send({"status": "success","message": "Deleted Success"});
        }
    })

});

app.post('/getFilterExportBinReqReport', function (req, res){
    'use strict';
    var sql = "SELECT tblbinrequest.reqID AS 'reqID',  tbluser.name AS 'name', tblbinrequest.dateRequest AS 'dateRequest', tblbinrequest.companyName AS 'companyName', tblbinrequest.contactNumber AS 'contactNumber', tblbinrequest.reason AS 'reason', tblbinrequest.type AS 'type', tblbinrequest.requestAddress AS 'requestAddress', tblbinrequest.remarks AS 'remarks', tblbinrequest.status AS 'status', tblbinrequest.rejectReason AS 'rejectReason', tblbinrequest.rejectExtraInfo AS 'rejectExtraInfo' FROM tblbinrequest JOIN tbluser ON tblbinrequest.userID = tbluser.userID WHERE dateRequest between '" + req.body.startDate +"' AND '" + req.body.endDate + "' ORDER BY dateRequest";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/cancelBinRequest', function (req, resp) {
    'use strict';
    var data;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });


    req.addListener('end', function () {

        var sql = "UPDATE tblbinrequest SET status = 'Cancelled' WHERE reqID = " + parseInt(data.requestID);

        database.query(sql, function (err, res) {
            if (!err) {
                resp.send("Bin Request Cancellation Success");
            } else {
                resp.send("Bin Request Cancellation Failed");
            }
        });

    });
});

app.post('/getUserID', function (req, resp) {
    'use strict';

    var data, userID;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                resp.send(userID);
            }
        });
    });
});

app.post('/getwasteChart', function (req, resp) {
    'use strict';
    var data;
    var userID;
    var msgs = [];

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                var sql = "SELECT * FROM tblwaste WHERE userID = '" + userID + "'";
                //var sql2 = "SELECT message as offmsg, createdAt as offtime from tblchat WHERE complaintID ='"+data.id+"' AND sender!='"+userID+"' ORDER BY createdAt ASC";
                database.query(sql, function (err, res) {
                    if (res != undefined) {
                        for (var i = 0; i < res.length; i++) {
                            msgs.push(res[i]);
                        }
                        if (msgs == null) {
                            resp.send("No Data");
                        }
                        resp.json(msgs);
                        // db.query(sql2, function(err, res){
                        //     for(var x = 0; x<res.length; x++){
                        //         msgs.push(res[x]);
                        //     }

                        // });
                    }
                });
            } else {
                resp.send("error getting user id");
            }
        });
    });
});

function rawBody(req, res, next) {
    var chunks = [];

    req.on('data', function (chunk) {
        chunks.push(chunk);
    });

    req.on('end', function () {
        var buffer = Buffer.concat(chunks);

        req.bodyLength = buffer.length;
        req.rawBody = buffer;
        next();
    });

    req.on('error', function (err) {
        console.log(err);
    });
}

app.post('/uploadRegNewImage', rawBody, function (req, resp) {
    // if(req.rawBody && req.bodyLength > 0){
    //     console.log(req.rawBody);
    // }
    'use strict';
    var data, sql;

    // req.addListener('data', function(postDataChunk){
    //     data = JSON.parse(postDataChunk);
    // });

    // req.addListener('end', function(){
    //     console.log(data);
    // });

    data = JSON.parse(req.rawBody);
    sql = "UPDATE tblcustomer SET imgPath ='pendingImg/" + data.ic + ".jpg' WHERE ic ='" + data.ic + "'";
    fs.writeFile(__dirname + '/../images/pendingImg/' + data.ic + '.jpg', Buffer.from(data.image, 'base64'), function (err) {
        if (err) {
            console.log(err);
        } else {
            database.query(sql, function (err, res) {
                if (!err) {
                    resp.send("Information Has Been Submitted! We Will Be In Contact Soon. Thank You!");
                } else {
                    resp.send("Please Try Again");
                }
            });
        }
    });

    //var data, chunks = [];

    // req.addListener('data', function(postDataChunk){
    //     // chunks.push(postDataChunk);
    //     data = new Buffer(postDataChunk, 'base64');
    // });

    // req.addListener('end', function(){
    //     //console.log(data);
    //     //var buffer = Buffer.from(chunks, 'base64');
    //     var text = data.toString('utf-8');
    //     console.log(text);
    // });
});

app.post('/uploadComplaintImage', rawBody, function (req, resp) {

    'use strict';
    var data, sql;
    data = JSON.parse(req.rawBody);
    var date = dateTime.create().format('YmdHMS');
    var fileName = "images/complaintImg/complaintcase_" + data.cID + ".jpg";
    var bufferFile = Buffer.from(data.complaintImage, 'base64');
    var bufferStream = new stream.PassThrough();
    bufferStream.end(bufferFile);
    var file = bucket.file(fileName);

    bufferStream.pipe(file.createWriteStream({
            metadata: {
                contentType: 'image/jpeg',
                metadata: {
                    custom: 'metadata'
                }
            },
            public: true,
            validation: 'md5'
        }))
        .on('error', function (err) {
            console.log(err);
        })
        .on('finish', function () {
            var publicUrl = 'https://storage.googleapis.com/trienekens-management-portal-images/' + fileName;
            sql = "UPDATE tblcomplaint SET complaintImg ='" + publicUrl + "' WHERE complaintID ='" + data.cID + "'";
            database.query(sql, function (err, res) {
                if (!err) {
                    //emitter.emit('complaint');
                    resp.send("Complaint has been submitted. We will review the complaint and take any necessary actions.");
                } else {
                    resp.send("Please Try Again");
                    console.log(err);
                }
            });
        });

    //save images to local folder
    // fs.writeFile(__dirname + '/../images/complaintImg/complaintcase_' + data.cID + '.jpg', Buffer.from(data.complaintImage, 'base64'), function (err) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         database.query(sql, function (err, res) {
    // if (!err) {
    //     resp.send("Complaint has been submitted. We will review the complaint and take any necessary actions.");
    // } else {
    //     resp.send("Please Try Again");
    //     console.log(err);
    // }
    //         });
    //         console.log("success");
    //     }
    // });
});

app.post('/resetPassword', function (req, resp) {
    'use strict';

    var data, transporter, subject, text, email, mailOptions, newPass;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {

        newPass = Math.floor(Math.random() * 90000) + 10000;
        subject = "Trienekens App Password Reset";
        text = "Your new password is: " + newPass + ". Please change your password when you login.";
        email = data.email;

        mailOptions = {
            from: 'trienekensmobileapp@gmail.com',
            to: email,
            subject: subject,
            text: text
        };

        var sql = "SELECT userID from tbluser WHERE userEmail = '" + data.email + "'";

        database.query(sql, function (err, res) {
            if (err) {
                resp.send("Get userID Failed");
                console.log(err);
                throw err;
            } else {
                if (res[0] != undefined) {
                    var userID = res[0].userID;

                    bcrypt.hash((newPass.toString()), saltRounds, function(err, hash) {
                        var sql2 = "UPDATE tbluser SET password = '" + hash + "' WHERE userID = '" + userID + "'";

                        database.query(sql2, function (err, res) {
                            if (err) {
                                resp.send("Update Password Failed");
                                console.log(err);
                                throw err;
                            } else {
                                smtpTransport.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        resp.send("Mail Failed");
                                        console.log(error);
                                    } else {
                                        resp.send("Mail Sent");
                                    }
                                });
                            }
                        });
                    });
                } else {
                    resp.send("User does not exist");
                }
            }
        });
    });
});

app.post('/getComplaintIDs', function (req, res) {
    'use strict';
    var data,
        IDs = {};
    IDs["ids"] = [];
    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail = '" + data.email + "'";
        database.query(sqlUser, function (err, result) {
            if (err) {
                throw err;
            }
            var userID = result[0].userID;
            var sql = "SELECT complaintID FROM tblcomplaint WHERE userID = '" + userID + "'";
            database.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                for (var i = 0; i < result.length; i++) {
                    IDs["ids"].push({
                        "id": result[i].complaintID
                    });
                }
                res.send(IDs);
            });
        });
    });
});

app.post('/getBinReqIDs', function (req, res) {
    'use strict';
    var data,
        IDs = {};
    IDs["ids"] = [];
    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail = '" + data.email + "'";
        database.query(sqlUser, function (err, result) {
            if (err) {
                throw err;
            }
            var userID = result[0].userID;
            var sql = "SELECT reqID FROM tblbinrequest WHERE userID = '" + userID + "'";
            database.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                for (var i = 0; i < result.length; i++) {
                    IDs["ids"].push({
                        "id": result[i].reqID
                    });
                }
                res.send(IDs);
            });
        });
    });
});

app.post('/getUnreadMsg', function (req, res) {
    'use strict';
    var data, results = {},
        userID;
    results["unread"] = [];
    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail = '" + data.email + "'";
        database.query(sqlUser, function (err, result) {
            if (err) {
                throw err;
            }
            if (result[0] != undefined) {
                userID = result[0].userID;
                var sql = "SELECT complaintID, COUNT(readStat) as unread FROM tblchat WHERE readStat = 'u' AND recipient = '" + userID + "' GROUP BY complaintID ORDER BY complaintID ASC";
                database.query(sql, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    for (var i = 0; i < result.length; i++) {
                        results["unread"].push({
                            "id": result[i].complaintID,
                            "value": result[i].unread
                        });
                    }

                    res.json(results);
                });
            }
        });
    });
});

app.post('/updateReadStat', function (req, res) {
    'use strict';
    var data, userID;
    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail = '" + data.email + "'";
        database.query(sqlUser, function (err, result) {
            if (err) {
                throw err;
            }
            userID = result[0].userID;
            var sql = "UPDATE tblchat SET readStat = 'r' WHERE complaintID = '" + data.compID + "' AND recipient = '" + userID + "' AND readStat = 'u'";
            database.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                res.send("Message read");
            });
        });
    });
});

app.get('/getBoundaryIDs', function (req, res) {
    'use strict';
    var sql = "SELECT * FROM tblboundary";
    database.query(sql, function (error, result) {
        if (error) {
            res.end();
            throw error;
        }
        res.json(result);
        res.end();
    });
});

app.get('/getBoundaryLatLng', function (req, res) {
    'use strict';
    var sql = "SELECT tblboundaryplot.boundaryID AS id, tblboundary.color, tblboundaryplot.lat, tblboundaryplot.lng, tblarea.areaCode AS area, tblzone.zoneCode AS zone, tblboundary.areaID, tblarea.collection_frequency FROM tblboundaryplot JOIN tblboundary ON tblboundaryplot.boundaryID = tblboundary.boundaryID JOIN tblarea ON tblarea.areaID = tblboundary.areaID JOIN tblzone ON tblzone.zoneID = tblarea.zoneID WHERE tblboundary.status = 'A' ORDER BY tblboundaryplot.boundaryID ASC, tblboundaryplot.ordering ASC";
    database.query(sql, function (error, result) {
        if (error) {
            res.end();
            throw error;
        }
        res.json(result);
        res.end();
    });
});

//retrieve unread records for web portal

app.get('/unreadCustFeedbackCount', function (req, res) {
    'use strict';
    var sql = "SELECT count(readStat) as unread FROM tblsatisfaction_compactor WHERE readStat = 'u'";
    var sql2 = "SELECT count(readStat) as unread FROM tblsatisfaction_roro WHERE readStat = 'u'";
    var sql3 = "SELECT count(readStat) as unread FROM tblsatisfaction_scheduled WHERE readStat = 'u'";
    var municipalUnread, commercialUnread, scheduledUnread, totalUnread;
    database.query(sql, function (err, result) {
        if (result != undefined) {
            municipalUnread = result[0].unread;
            database.query(sql2, function (err, result) {
                commercialUnread = result[0].unread;
                database.query(sql3, function (err, result) {
                    scheduledUnread = result[0].unread;
                    totalUnread = parseInt(municipalUnread, 10) + parseInt(commercialUnread, 10) + parseInt(scheduledUnread, 10);
                    // io.sockets.in(roomManager).emit('new satisfaction', {
                    //     "unread": totalUnread
                    // });
                    res.send(totalUnread.toString());
                });
            });
        }
    });
});

app.get('/unreadEnquiryCount', function (req, res) {
    'use strict';
    var sql = "SELECT count(readStat) as unread FROM tblenquiry WHERE readStat = 'u'";
        database.query(sql, function (err, result) {
            //console.log("enquiry emitter fired from trienekensjs");
            // io.sockets.in(roomManager).emit('new enquiry', {
            //     "unread": result[0].unread
            // });
            var unread = result[0].unread;
            res.send(unread.toString());
        });
});

app.get('/unreadBinRequestCount', function (req, res) {
    'use strict';
    var sql = "SELECT count(readStat) as unread, (SELECT count(readStat) FROM tblbinrequest WHERE readStat = 'u' AND reason LIKE 'Roro%') as unreadRoro FROM tblbinrequest WHERE readStat = 'u'";
    database.query(sql, function (err, result) {
        // io.sockets.in(roomManager).emit('new enquiry', {
        //     "unread": result[0].unread
        // });
        var unread = result[0].unread;
        var unreadRoro = result[0].unreadRoro;
        var unreadNonRoro = unread - unreadRoro;
        var json = {
            'unread': unread,
            'unreadRoro': unreadRoro,
            'unreadNonRoro': unreadNonRoro
        };
        res.json(json);
    });
});

app.get('/unreadComplaintCount', function (req, res) {
    'use strict';
    var sql = "SELECT count(readStat) as unread FROM tblcomplaint WHERE readStat = 'u'";
    database.query(sql, function (err, result) {
        // io.sockets.in(roomManager).emit('new enquiry', {
        //     "unread": result[0].unread
        // });
        var unread = result[0].unread;
        res.send(unread.toString());
    });
});

module.exports = app;
