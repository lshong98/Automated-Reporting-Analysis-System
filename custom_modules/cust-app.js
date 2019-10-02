// var express = require('express');
// var app = express();
// var server = require('http').createServer(app);
// var SVR_PORT = 3000;
// var path = require('path');
// var upload = require('express-fileupload');

// var database = require('./custom_modules/database-management');

// var mysql = require('mysql');
// var bcrypt = require('bcryptjs');
// var dateTime = require('node-datetime');
// var EventEmitter = require('events');
// var emitter = new EventEmitter();
// var dateTime = require('node-datetime');
var nodemailer = require('nodemailer');

var express = require('express');
var app = express();
var dateTime = require('node-datetime');
var f = require('./function-management');
var database = require('./database-management');
var upload = require('express-fileupload');
var nodemailer = require('nodemailer');
var path = require('path');
var fs = require('fs');

app.use(upload());
app.use('/img', express.static(__dirname+'/img'));
//app.use(express.static(__dirname + '/pendingImg'));


// Cloud database access
// var DB_HOST = '35.247.180.192';
//var DB_USER = 'root';
//var DB_PASS = 'root';
//var DB_NAME = 'trienekenstest';

// Local database access
// var DB_HOST = 'localhost';
// var DB_USER = 'root';
// var DB_PASS = '';
// var DB_NAME = 'trienekens';

// Create connection 
// var db = mysql.createConnection({
//     host: DB_HOST,
//     user: DB_USER,
//     password: DB_PASS,
//     port: 3307
// });

var imgPath = path.join(__dirname+'/img');

// Connect
// db.connect(function (err) {
//     'use strict';
//     console.log("test");
//     if (err) {
//         throw err;
//     }
//     db.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name = "trienekens"', function (err, result) {

//         //if (result[0].schema_name === DB_NAME) {
//         db.query('USE ' + DB_NAME + '', function (err, result) {
//             if (err) {
//                 throw err;
//             }
//             console.log('MySQL Connected...');
//         });
//         //}

//     });
// });

app.post('/loginCustServiceApp', function (req, resp) {
    'use strict';
    var data;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });
    req.addListener('end', function () {
        console.log(data);
        var sql = "SELECT * FROM tbluser WHERE userEmail = '"+ data.email +"'";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            if(result[0] == undefined){
                resp.send("Your Account is still awaiting verification from our staff");
            }else{
                if (result[0].userEmail == data.email && result[0].password == data.pass) {
                    if(result[0].status == 1){
                        resp.send("Login Success");
                    }else{
                        resp.send("Activate Acc");
                    }
                }else{
                    resp.send("Failed");
                }
            }
            console.log(result[0]);
            //resp.json(result);

            //console.log(result);
            //console.log("userEmail: " + result[0].userEmail);
            //console.log("postDataEmail: "+data.email);
        });
    });
});

app.post('/getAreaID', function(req, resp){
    'use strict';
    var data, tamanID, areaID;

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var sql = "SELECT tamanID FROM tbluser WHERE userEmail = '"+data.email+"'";
        database.query(sql, function(err, res){
            tamanID = res[0].tamanID;
            var getAreaSql = "SELECT areaID FROM tbltaman WHERE tamanID = "+tamanID;
            database.query(getAreaSql, function(err, res){
                console.log(res[0]);
                areaID = res[0].areaID;
                resp.send(areaID);
            });
        });
    });
});

app.post('/insertToken', function(req, resp){
    'use strict';
    var data, msg;
    
    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });
    req.addListener('end', function () {
        console.log(data);
        var checkSql = "SELECT fcm_token FROM fcm_info";
        var insertSql = "INSERT INTO fcm_info(fcm_token) values('"+ data.token +"')";
        database.query(checkSql, function(err, res){
            for(var i = 0; i<res.length; i++){
                var existingTokens = res[i].fcm_token;
                //console.log(res[i].fcm_token);
                if(data.token == existingTokens){
                    msg = "Token already exists";
                    resp.send(msg);
                }
            }

            if(msg != "Token already exists"){
                database.query(insertSql, function(error, result){
                    if(!error){
                        resp.send("inserted");
                    }else{
                        console.log(error);
                        resp.send("failed to insert");
                    }
                });
            }
        });
    });
    
});

app.get('/getImages', function(req, resp){
    'use strict';

    var results = {};
    results["output"] = [];
    var sql = "SELECT * FROM tblcarouselimg";

    database.query(sql, function(err, res){
        for(var i = 0; i<res.length; i++){
            results["output"].push({"imageName":res[i].fileName, "id":res[i].id});
        }
        console.log(results);
        resp.json(results);
    });
});

app.post('/getNotifs', function(req, resp){
    'use strict';

    var data;
    var results = {};
    results["response"] = [];
    results["announcements"] = [];
    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        console.log(data);
        var sql = "SELECT * FROM tblnotif JOIN tbluser WHERE tbluser.userEmail = '"+ data.email +"' AND tbluser.userID = tblnotif.userID ORDER BY notifID DESC, notifDate DESC";
        var sql2 = "SELECT * FROM tblannouncement WHERE target = 'TriAllUsers' ORDER BY announceDate DESC";
        var sql3 = "SELECT * FROM tblannouncement WHERE target = '"+data.areaID+"'";

        database.query(sql, function(err, res){
            if(!err){
                for(var i = 0; i<res.length; i++){
                    results["response"].push({"notif":res[i].notifText, "notifDate":res[i].notifDate});
                }

                database.query(sql2, function(err, res){
                    if(!err){
                        for(var i = 0; i<res.length; i++){
                            results["announcements"].push({"announce":res[i].announcement, "announceDate":res[i].announceDate});
                        }
                        database.query(sql3, function(err, res){
                            if(!err){
                                for(var i = 0; i<res.length; i++){
                                    results["announcements"].push({"announce":res[i].announcement, "announceDate":res[i].announceDate});
                                }
                                console.log(results);
                                resp.json(results);
                            }
                        });
                    }
                });
            }
        });
    });
});

app.post('/insertNotif', function(req, resp){
    'use strict';

    var data;
    var userID;
    var date = dateTime.create().format('Y-m-d');

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        console.log(data);
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.email + "'";
        database.query(sqlUser, function(err, res){
            if(!err){
                userID = res[0].userID;
                console.log("user id: " + userID);
                var insertSql = "INSERT INTO tblnotif(userID, notifDate, notifText) VALUES('"+ userID + "','"+date+"','"+data.text+"')";
                database.query(insertSql, function(err, res){
                    if(!err){
                        resp.send("Notif Inserted");
                    }else{
                        resp.send("error inserting notif");
                    }
                });
            }else{
                resp.send("error getting user id");
            }
        });
    });
});

app.post('/binRequest', function(req, resp){
    'use strict';
    var data;
    var userID;
    var date = dateTime.create().format('Y-m-d');

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function(err, res){
            if(!err){
                userID = res[0].userID;
                console.log("user id: " + userID);
                var insertSql = "INSERT INTO tblbinrequest(userID,requestDate,binType,reason,remarks,status) VALUES('"+ userID + "','"+date+"','"+data.binType+"','"+ data.reason + "','"+data.remarks+"','"+data.status+"')";
                database.query(insertSql, function(err, res){
                    if(!err){
                        resp.send("Sucessfully Submit Request");
                    }else{
                        resp.send("Failed to Submit Request");
                    }
                });
            }else{
                resp.send("error getting user id");
            }
        });
    });
});

app.post('/getSchedule', function(req, resp){
    'use strict';

    var data;
    var tamanID;
    var results = [];
    var json = {};

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        console.log(data);
        var sqlTaman = "SELECT tamanID FROM tbluser WHERE userEmail ='" + data.email + "'";
        database.query(sqlTaman, function(err, res){
            if(res[0] != undefined){
                tamanID = res[0].tamanID;
                var sqlarea = "SELECT areaID FROM tbltaman WHERE tamanID = '"+tamanID+"'";
                database.query(sqlarea, function(err, res){
                    var areaID = res[0].areaID;
                    var sqlSched = "SELECT * FROM tblschedule WHERE areaID = '"+areaID+"'";
                    database.query(sqlSched, function(err, res){
                        if(!err){
                            for(var i=0; i<res.length; i++){
                                if(res[i].mon == 1){
                                    results.push("Monday");
                                }
                                if(res[i].tue == 1){
                                    results.push("Tuesday");
                                }
                                if(res[i].wed == 1){
                                    results.push("Wednesday");
                                }
                                if(res[i].thur == 1){
                                    results.push("Thursday");
                                }
                                if(res[i].fri == 1){
                                    results.push("Friday");
                                }
                                if(res[i].sat == 1){
                                    results.push("Saturday");
                                }
                            }
    
                            for(var i = 0; i<results.length; i++){
                                json[i] = results[i];
                            }
                            console.log(json);
                            resp.json(json);
                        }
                    });
                });
            }else{
                resp.send("error getting user id");
            }
        });
    });
});

app.post('/complaint', function(req, resp){
    'use strict';
    var data;
    var userID;
    var date = dateTime.create().format('Y-m-d H:M:S');
    var complaintID = 0;
    var sqlComplaintID = "SELECT MAX(complaintID) AS max FROM tblcomplaint";

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function(err, res){
            if(!err){
                userID = res[0].userID;
                //database.query(sql, function(err, res){
                    //if(!err){
                        database.query(sqlComplaintID, function (err, res) {
                            complaintID = res[0].max;
                            complaintID = parseInt(complaintID)+1;
                            if(data.compRemarks == null || data.compRemarks == ""){
                                var sql = "INSERT INTO tblcomplaint (complaintID, userID, staffID, premiseType, complaint, complaintDate, complaintAddress) VALUES ('" +complaintID+"','" +userID+"','ACC201908070001','"+data.premise+"','"+data.complaint+"','"+date+"','"+data.compAdd+"')";
                            }else{
                                var sql = "INSERT INTO tblcomplaint (complaintID, userID, staffID, premiseType, complaint, remarks, complaintDate, complaintAddress) VALUES ('" +complaintID+"','" +userID+"','ACC201908070001','"+data.premise+"','"+data.complaint+"','"+data.compRemarks+"','"+date+"','"+data.compAdd+"')";
                            }
                            database.query(sql, function(err, res){
                                if(!err){
                                    resp.send("Complaint Submitted for Complaint ID " + complaintID);
                                }else{
                                    resp.send("Failed to Submit");
                                    throw err;
                                }
                            });
                        });
                    //}else{
                    //}
                //});
            }else{
                resp.send("error getting user id");
            }
        });
    });
});

app.post('/satisfaction', function(req, resp){
    'use strict';
    var data;
    var userID;
    var date = dateTime.create().format('Y-m-d H:M:S');

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function(err, res){
            if(!err){
                userID = res[0].userID;
                var sql = "INSERT INTO tblsatisfaction (userID, companyRating, teamEfficiency, collectionPromptness, binHandling, spillageControl, queryResponse, extraComment, submissionDate) VALUES ('" 
                          + userID + "','" + parseInt(data.companyRating) + "','" + parseInt(data.teamEfficiency) + "','" + parseInt(data.collectionPromptness)
                          + "','" + parseInt(data.binHandling) + "','" + parseInt(data.spillageControl) + "','" + parseInt(data.queryResponse) + "','" 
                          + data.extraComment + "','" + date + "')";
                
                database.query(sql, function(err, res){
                    if(!err){
                        resp.send("Satisfaction Survey Submitted");
                    }else{
                        resp.send("Failed to Submit");
                    }
                });
            }else{
                resp.send("error getting user id");
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

app.post('/checkIC', function(req, resp){
    'use strict';

    var data;

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        console.log(data.ic);
        var sql = "SELECT * FROM tblcustomer WHERE ic = '"+data.ic+"'";
        database.query(sql, function(err, res){
            console.log(res[0]);
            if(res[0] != undefined){
                if(res[0].status == 1){
                    console.log("Approved Customer");
                    var sqlUser = "SELECT * FROM tbluser WHERE customerID = '"+res[0].customerID+"'";
                    database.query(sqlUser, function(err, res){
                        if(res[0] != undefined){
                            resp.send("Has Acc");
                        }else{
                            resp.send("No Acc");
                        }
                    });
                } else if (res[0].status == 0) {
                    console.log("Pending Customer");
                    resp.send("Pending");   
                } else {
                    console.log("Rejected Customer");
                    resp.send("Rejected");
                }
            } else {
                console.log("Not a Customer");
                resp.send("Not Customer");
            }

            if(err){
                resp.send("Error");
                throw err;
            }
        });
    });
});


app.post('/checkTL', function(req, resp){
    'use strict';

    var data;

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        console.log(data.ic);
        var sql = "SELECT * FROM tblcustomer WHERE tradingLicense = '"+data.tl+"'";
        database.query(sql, function(err, res){
            console.log(res[0]);
            if(res[0] != undefined){
                console.log("TL Taken");
                resp.send("TL Error");
            } else {
                console.log("Available TL");
                resp.send("TL OK");
            }

            if(err){
                resp.send("Error");
                throw err;
            }
        });
    });
});



app.post('/checkEmail', function(req, resp){
    'use strict';

    var data;

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        console.log(data);
        var sql = "SELECT * FROM tblcustomer WHERE ic = '"+data.ic+"'";
        database.query(sql, function(err, res){
            console.log("hello from /checkEmail");
            console.log(res[0].userEmail);
            if(res[0] != undefined){
                console.log(res[0].userEmail);
                resp.send(res[0].userEmail);
            }

            if(err){
                throw err;
            }
        });
    });
});

app.post('/registerAcc', function(req, resp){
    'use strict';

    var data, transporter, subject, text, email, mailOptions, vCode;

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
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
        console.log("vCode: "+vCode);
        mailOptions = {
            from: 'fravleinulan@gmail.com',
            to: email,
            subject: subject,
            text: text
        };

        var sql = "SELECT customerID from tblcustomer WHERE ic='"+data.ic+"'";
        database.query(sql, function(err, res){
            if(err){
                resp.send("Failed");
                throw err;
            }

            var userID = res[0].customerID;
            var sql2 = "INSERT INTO tbluser (customerID, userEmail, password, vCode) VALUES ('" +userID+"','"+data.email+"','"+data.pass+"','"+vCode+"')";
            var sql3 = "UPDATE tblcustomer SET userEmail = '"+data.email+"' WHERE ic ='"+data.ic+"'";
             
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    resp.send("Mail Failed");
                    console.log(error);
                }
                console.log("Email sent: "+info.response);
                database.query(sql2, function(err, res){
                    if(err){
                        throw err;
                    }
                    database.query(sql3, function(err, res){
                        if(err){
                            throw err;
                        }
                        resp.send("Registered");
                    });
                });
            });
        });
    });
});

app.post('/registerNew', function(req, resp){
    'use strict';

    var data, custID = 0, tamanID, date = dateTime.create().format('Y-m-d H:i:s');

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var custIdSql = "SELECT MAX(customerID) AS max FROM tblcustomer";
        var sqlTaman = "SELECT tamanID FROM tbltaman WHERE tamanName = '"+data.tmn+"'";
        var sqlTradeLic = "SELECT tradingLicense from tblcustomer WHERE tradingLicense='"+data.tl+"'";
        var sqlInsert;
        database.query(custIdSql, function(err, res){
            custID = res[0].max;
            custID = parseInt(custID)+1;
            database.query(sqlTaman, function(err, res){
                if(err){
                    resp.send("Taman ID Fetch Error");
                }
                tamanID = res[0].tamanID;
                database.query(sqlTradeLic, function(err, res){
                    console.log(res[0]);
                    if(res[0]==undefined){
                        sqlInsert = "INSERT INTO tblcustomer (customerID, tamanID, userEmail, password, name, contactNumber, ic, houseNo, streetNo, postCode, city, State, status, creationDateTime) VALUES ('"+custID+"','"+tamanID+"','"+data.email+"','"+data.pass+"','"+data.name+"','"+data.pno+"','"+data.ic+"','"+data.hno+"','"+data.lrg+"','"+data.pcode+"','"+data.city+"','"+data.state+"',0,'"+date+"')";
                        database.query(sqlInsert, function(err, res){
                            if(!err){
                                resp.send("Registered");
                            }else{
                                resp.send("Failed");
                            }
                        });
                    }else{
                        sqlInsert = "INSERT INTO tblcustomer (customerID, tamanID, userEmail, password, name, contactNumber, ic, houseNo, streetNo, postCode, city, State, tradingLicense, status, creationDateTime) VALUES ('"+custID+"','"+tamanID+"','"+data.email+"','"+data.pass+"','"+data.name+"','"+data.pno+"','"+data.ic+"','"+data.hno+"','"+data.lrg+"','"+data.pcode+"','"+data.city+"','"+data.state+"','"+data.tl+"',0,'"+date+"')";
                        database.query(sqlInsert, function(err, res){
                            if(!err){
                                resp.send("Registered");
                            }else{
                                resp.send("Failed");
                            }
                        });
                    }
                });
            });
        });
    });
});

app.post('/verifyAcc', function(req, resp){
    'use strict';
    var data;
    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });
    req.addListener('end', function(){
        var sql = "SELECT vCode FROM tbluser WHERE userEmail = '"+data.email+"'";
        database.query(sql, function(err, res){
            if(err){
                resp.send("Failed to Register");                
                throw err;
            }
            if(res[0].vCode == data.vcode){
                var sql2 = "UPDATE tbluser SET status = 1 WHERE userEmail ='"+data.email+"'";
                database.query(sql2, function(err, res){
                    if(err){
                        throw err;
                    }
                    resp.send("Successfully Registered");
                });
            }else{
                resp.send("Invalid Verification Code");
            }
        });
    });
});

app.post('/getInfo', function(req, resp){
    'use strict';
    var data;
    var info = {};

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var sql = "SELECT * FROM tbluser WHERE userEmail = '"+data.user+"'";
        database.query(sql, function(err, res){
            info["pno"] = res[0].contactNumber;
            info["hno"] = res[0].houseNo;
            info["lrg"] = res[0].streetNo;
            info["pcode"] = res[0].postCode;
            info["city"] = res[0].city;
            info["state"] = res[0].State;
            var sql2 = "SELECT tamanName FROM tbltaman WHERE tamanID = "+res[0].tamanID;
            database.query(sql2, function(err, res){
                info["tmn"] = res[0].tamanName;
                console.log(info);
                resp.json(info);
            });
        });
    });
});

app.post('/getTaman', function(req, resp){
    'use strict';
    var data;
    var info = [];

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var sql = "SELECT tamanName FROM tbltaman";
        database.query(sql, function(err, res){
            for(var i=0; i<res.length;i++){
                info.push(res[i]);
                //console.log(JSON.parse(info));
                //console.log(info);
            }
            resp.json(info);
        });
    });
});

app.post('/checkUpdate', function(req, resp){
    'use strict';
    var data;
    var pass;

    req.addListener('data',function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        if(data.newp != ""){
            pass = data.newp;
        }else{
            pass = data.oldp;
        }

        var sqlCheckMail = "SELECT userEmail FROM tbluser WHERE userEmail != '"+data.oriemail+"'";
        var sqlCheckPass = "SELECT password FROM tbluser WHERE userEmail = '"+data.oriemail+"'";

        database.query(sqlCheckMail, function(err, res){
            var emailError;
            for(var i=0;i<res.length;i++){
                if(res[i].userEmail == data.email){
                    emailError = 1;
                }else{
                    emailError = 0;
                }
            }
            console.log("email error: " + emailError);
            if(emailError == 1){
                database.query(sqlCheckPass, function(err, res){
                    if(data.oldp != res[0].password){
                        resp.send("2 Errors");
                        console.log("2 Errors");
                    }else{
                        resp.send("Email Taken");
                        console.log("Email Taken");
                    }
                });
            }else{
                database.query(sqlCheckPass, function(err, res){
                    console.log(res);
                    //console.log(res[0]);
                    //if(res[0] != undefined){
                        if(data.oldp != res[0].password){
                            resp.send("Wrong Password");
                            console.log("Wrong Password");
                        }else{
                            resp.send("Correct Password");
                            console.log("Correct Password");
                        }
                    //}
                });
            }
        });
    });
});

app.post('/updateAcc', function(req, resp){
    'use strict';
    var data;
    var pass;;
    var taman = []
    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        if(data.newp != ""){
            pass = data.newp;
        }else{
            pass = data.oldp;
        }
        var sqlTaman = "SELECT tamanID from tbltaman WHERE tamanName ='"+data.tmn+"'";
        database.query(sqlTaman, function(err, res){
            if(err){
                resp.send("Taman Error");
                throw err;
            }

            // for(var i = 0;i<res.length;i++){
            //     taman.push(res[i]);
            // }

            var sqlUpdate = "UPDATE tblcustomer SET userEmail = '"+data.email+"',contactNumber='"+data.pno+"',houseNo='"+data.hno+"',streetNo='"+data.lrg+"',tamanID='"+res[0].tamanID+"',postcode='"+data.pcode+"',city='"+data.city+"',State='"+data.state+"' WHERE userEmail = '"+data.oriemail+"'";
            var sqlUpdate2 = "UPDATE tbluser SET userEmail = '"+data.email+"',password='"+pass+"' WHERE userEmail = '"+data.oriemail+"'";
            database.query(sqlUpdate, function(err, res){
                if (err){
                    throw err;
                }
                database.query(sqlUpdate2, function(err, res){
                    if(err){
                        throw err;
                    }
                    resp.send("Updated");
                });
            });
        });
    });
});

app.post('/getRequestList', function(req, resp){ 
    'use strict';
    var data;
    var userID;
    var msgs = [];

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        console.log(data);
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function(err, res){
            if(!err){
                userID = res[0].userID;
                var sql = "SELECT * FROM tblbinrequest WHERE userID = '"+userID+"'";
                //var sql2 = "SELECT message as offmsg, createdAt as offtime from tblchat WHERE complaintID ='"+data.id+"' AND sender!='"+userID+"' ORDER BY createdAt ASC";
                database.query(sql, function(err, res){
                    if(res != undefined){
                        for(var i = 0; i<res.length; i++){
                            msgs.push(res[i]);
                        }
                        console.log(msgs);
                        if(msgs == null){
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
            }else{
                resp.send("error getting user id");
            }
        });
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

app.post('/getUserID', function(req, resp){
    'use strict';

    var data, userID;

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function(err, res){
            if(!err){
                userID = res[0].userID;
                resp.send(userID);
                console.log("hello from getUserID");
            }
        });
    });
});

app.post('/getwasteChart', function(req, resp){ 
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
                var sql = "SELECT * FROM tblwaste WHERE userID = '"+userID+"'";
                //var sql2 = "SELECT message as offmsg, createdAt as offtime from tblchat WHERE complaintID ='"+data.id+"' AND sender!='"+userID+"' ORDER BY createdAt ASC";
                database.query(sql, function(err, res){
                    if(res != undefined){
                        for(var i = 0; i<res.length; i++){
                            msgs.push(res[i]);
                        }
                        console.log(msgs);
                        if(msgs == null){
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
            }else{
                resp.send("error getting user id");
            }
        });
    });
});

function rawBody(req, res, next){
    var chunks = [];

    req.on('data', function(chunk){
        chunks.push(chunk);
    });

    req.on('end', function(){
        var buffer = Buffer.concat(chunks);

        req.bodyLength = buffer.length;
        req.rawBody = buffer;
        next();
    });

    req.on('error', function(err){
        console.log(err);
    });
}

app.post('/uploadRegNewImage', rawBody, function(req, resp){
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
    sql = "UPDATE tblcustomer SET imgPath ='pendingImg/"+data.ic+".jpg' WHERE ic ='"+data.ic+"'";
    console.log(sql);
    console.log(req.rawBody);
    //console.log(data);
    fs.writeFile(__dirname+'/../scripts/pendingImg/'+data.ic+'.jpg', Buffer.from(data.image, 'base64'), function(err){
        if (err){
            console.log(err);
        }else{
            database.query(sql, function(err, res){
                if(!err){
                    resp.send("Information Has Been Submitted! We Will Be In Contact Soon. Thank You!");
                }else{
                    resp.send("Please Try Again");
                }
            });
            console.log("success");
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
    sql = "UPDATE tblcomplaint SET complaintImg ='complaintImg/ComplaintCase_" + data.cID + ".jpg' WHERE complaintID =" + data.cID + "";
    console.log(sql);
    console.log(req.rawBody);
    //console.log(data);
    fs.writeFile(__dirname + '/../scripts/complaintImg/ComplaintCase_' + data.cID + '.jpg', Buffer.from(data.complaintImage, 'base64'), function (err) {
        if (err) {
            console.log(err);
        } else {
            database.query(sql, function (err, res) {
                if (!err) {
                    resp.send("Complaint has been submitted. We will review the complaint and take any necessary actions.");
                } else {
                    resp.send("Please Try Again");
                }
            });
            console.log("success");
        }
    });
});

// app.post('/uploadRegNewImage', function(req, resp){
//     'use strict';
//     // var data;

//     // req.addListener('data', function(postDataChunk){
//     //     data = JSON.parse(postDataChunk);
//     // });

//     // req.addListener('end', function(){

//     // });

//     fs.readFile(req.files.image.path, function(err, data){
//         var dirname = "../scripts/pendingImg/";
//         var newpath = dirname + req.files.image.originalFilename;
//         fs.writeFile(newpath, data, function(err){
//             if(err){
//                 resp.json({'response':"Error"});
//             }else{
//                 resp.json({'response':"Saved"});
//             }
//         })
//     })

// });

//app.use('/img', express.static(imgPath));
// app.get('/img', function(req,res){
//     res.sendFile(path.join(__dirname+'/img/image7.png'));
//     //res.sendFile(path.join(__dirname+'/img/image8.png'));
//     console.log('hello');
// });

// app.use('/img', express.static(__dirname+'/img'));

// server.listen(process.env.PORT || SVR_PORT, function () {
//     'use strict';
//     console.log("Server is running on port " + SVR_PORT + " ");
// });

module.exports = app;