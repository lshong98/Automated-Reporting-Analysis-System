/*jslint node:true*/
// var express = require('express');
// var app = express();
// var server = require('http').createServer(app);
// var SVR_PORT = 3000;
// var path = require('path');
// var upload = require('express-fileupload');

// var database = require('./custom_modules/database-management');

var variable = require('../variable');
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
        console.log(data);
        var sql = "SELECT * FROM tbluser WHERE userEmail = '" + data.email + "'";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            if (result[0] == undefined) {
                resp.send("User undefined");
            } else {
                var transporter, subject, text, email, mailOptions, vCode;
                if (result[0].userEmail == data.email && result[0].password == data.pass) {
                    if (result[0].status == 1) {
                        resp.send("Login Success");
                    } else {
                        transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'registercustomerapp@gmail.com',
                                pass: 'trienekens321'
                            }
                        });
                        vCode = Math.floor(Math.random() * 90000) + 10000;
                        subject = "Trienekens App Verification Code";
                        text = "Your Verification Code is: " + vCode;
                        email = data.email;
                        console.log("vCode: " + vCode);
                        mailOptions = {
                            from: 'registercustomerapp@gmail.com',
                            to: email,
                            subject: subject,
                            text: text
                        };


                        var updateCode = "UPDATE tbluser SET vCode ='" + vCode + "' WHERE userEmail ='" + data.email + "'";

                        transporter.sendMail(mailOptions, function (error, info) {
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
                }
            }
            console.log(result[0]);
        });
    });
});

app.post('/getAreaID', function (req, resp) {
    'use strict';
    var data, tamanID, areaID;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sql = "SELECT tamanID FROM tbluser WHERE userEmail = '" + data.email + "'";
        database.query(sql, function (err, res) {
            console.log(res);
            if(err){
                console.log(err);
            }
            if (res[0].tamanID != null) {
                tamanID = res[0].tamanID;
                var getAreaSql = "SELECT areaID FROM tbltaman WHERE tamanID = " + tamanID;
                database.query(getAreaSql, function (err, res) {
                    console.log(res[0]);
                    areaID = res[0].areaID;
                    resp.send(areaID);
                });
            }else{
                resp.send("");
            }
        });
    });
});

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
        console.log(results);
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
        console.log(data);
        var sql = "SELECT *, (SELECT COUNT(readStat) FROM tblnotif WHERE tbluser.userEmail = '"+data.email+"' AND readStat = 'u' AND tblnotif.userID = tbluser.userID) as unread FROM tblnotif JOIN tbluser WHERE tbluser.userEmail = '"+data.email+"' AND tbluser.userID = tblnotif.userID ORDER BY notifID DESC, notifDate DESC";
        var sql2 = "SELECT *, (SELECT COUNT(readStat) FROM tblannouncement WHERE readStat = 'u') as unread FROM tblannouncement WHERE target = 'TriAllUsers' ORDER BY announceDate DESC";

        database.query(sql, function (err, res) {
            if (!err) {
                for (var i = 0; i < res.length; i++) {
                    results["response"].push({
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
                                "announce": res[i].announcement,
                                "announceDate": res[i].announceDate,
                                "unread": res[i].unread
                            });
                        }
                        if(data.areaID != ""){
                            var sql3 = "SELECT *, (SELECT COUNT(readStat) FROM tblannouncement WHERE readStat = 'u') as unread FROM tblannouncement WHERE target = '" + data.areaID + "' ORDER BY announceDate DESC";
                            database.query(sql3, function (err, res) {
                                if (!err) {
                                    for (var i = 0; i < res.length; i++) {
                                        results["announcements"].push({
                                            "announce": res[i].announcement,
                                            "announceDate": res[i].announceDate,
                                            "unread": res[i].unread
                                        });
                                    }
                                    console.log(results);
                                    resp.json(results);
                                }
                            });
                        }else{
                            console.log(results);
                            resp.json(results);
                        }
                    }
                });
            }
        });
    });
});

app.post('/updateNotifStat', function(req, resp){
    'use strict';

    var data, userID;

    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.email + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                var readStat = "UPDATE tblnotif SET readStat = 'r' WHERE userID = '"+userID+"'";
                database.query(readStat, function(err, res){
                    if(!err){
                        resp.send("Notif read");
                    }
                });
            } else {
                resp.send("error getting user id");
            }
        });
    })

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
        console.log(data);
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.email + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                console.log("user id: " + userID);
                var insertSql = "INSERT INTO tblnotif(userID, notifDate, notifText, readStat) VALUES('" + userID + "','" + date + "','" + data.text + "','u')";
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
    var userID, name, contactNumber, companyName;
    var date = dateTime.create().format('Y-m-d');
	var reqID = 0;
    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        var sqlUser = "SELECT * FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                name = res[0].name;
                contactNumber = res[0].contactNumber;
                if(res[0].companyName != null || res[0].companyName != undefined || res[0].companyName != ""){
                    companyName = res[0].companyName;
                }else{
                    companyName = "";
                }
                console.log("user id: " + userID);
                if(data.name != "" && data.companyName != "" && data.companyAddress != "" && data.contactNumber != ""){
                    var insertSql = "INSERT INTO tblbinrequest(userID,dateRequest,name ,companyName, companyAddress, contactNumber,reason,type,requestDate,requestAddress,remarks,status) VALUES('" + userID + "','" + date + "','" + data.name + "','" + data.companyName + "','" + data.companyAddress + "','" + data.contactNumber + "','" + data.reason + "','" + data.type + "','" + data.requestDate + "','" + data.requestAddress + "','" + data.remarks + "','" + data.status + "')";
                }else{
                    var insertSql = "INSERT INTO tblbinrequest(userID,dateRequest,name ,companyName, contactNumber,reason,type,requestDate,requestAddress,remarks,status) VALUES('" + userID + "','" + date + "','" + name + "','" + companyName + "','" + contactNumber + "','" + data.reason + "','" + data.type + "','" + data.requestDate + "','" + data.requestAddress + "','" + data.remarks + "','" + data.status + "')";
                }
                
                database.query(insertSql, function (err, res) {
                    if (!err) {
                        var sqlRequestID = "SELECT MAX(reqID) AS max FROM tblbinrequest";
                        database.query(sqlRequestID, function (err, res) {
                            reqID = res[0].max;
                            resp.send("Submit Request Successfully " + reqID);
                        });
                    } else {
                        resp.send("Failed to Submit Request"+err);
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
	//console.log(data.BinRequestICLost);

	if (typeof data.BinRequestICLost !== 'undefined') {
		console.log(req.rawBody);
		var async = require('async');
		if (typeof data.BinRequestAssessment !== 'undefined') {
            sql = "UPDATE tblbinrequest SET icImg ='/images/BinReqImg/BinRequestIC_" + data.cID + ".jpg',utilityImg ='BinReqImg/BinRequestUtility_" + data.cID + ".jpg',assessmentImg ='BinReqImg/BinRequestAssessment_" + data.cID + ".jpg',tradingImg ='BinReqImg/BinRequestAssessment_" + data.cID + ".jpg'  WHERE reqID =" + data.cID + "";
			async.each(["BinRequestICLost", "BinRequestPolice", "BinRequestUtility", "BinRequestAssessment"], function (file, callback) {

				fs.writeFile(__dirname + '/../images/BinReqImg/' + file + '_' + data.cID + '.jpg', Buffer.from(data[file], 'base64'), function (err) {
					if (err) {
						console.log(err);
					} else {
						console.log(file + '.json was updated.');
					}

					callback();
				});

			}, function (err) {
				if (err) {
					console.log(err);
				} else {
					database.query(sql, function (err, res) {
						if (!err) {
							resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
						} else {
							resp.send("Please Try Again");
						}
					});
					console.log("success");
				}
			});
		} else {
            sql = "UPDATE tblbinrequest SET icImg ='/images/BinReqImg/BinRequestIC_" + data.cID + ".jpg',utilityImg ='BinReqImg/BinRequestUtility_" + data.cID + ".jpg',assessmentImg ='BinReqImg/BinRequestPolice_" + data.cID + ".jpg' WHERE reqID =" + data.cID + "";
			async.each(["BinRequestICLost", "BinRequestPolice", "BinRequestUtility"], function (file, callback) {

				fs.writeFile(__dirname + '/../images/BinReqImg/' + file + '_' + data.cID + '.jpg', Buffer.from(data[file], 'base64'), function (err) {
					if (err) {
						console.log(err);
					} else {
						console.log(file + '.json was updated.');
					}

					callback();
				});

			}, function (err) {
				if (err) {
					console.log(err);
				} else {
					database.query(sql, function (err, res) {
						if (!err) {
							resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
						} else {
							resp.send("Please Try Again");
						}
					});
					console.log("success");
				}
			});
		}
	} else if (typeof data.BinRequestBin !== 'undefined') {
		sql = "UPDATE tblbinrequest SET binImg ='/images/BinReqImg/BinRequestBin_" + data.cID + ".jpg' WHERE reqID =" + data.cID + "";
		console.log(sql);
		console.log(req.rawBody);
		//console.log(data);
		fs.writeFile(__dirname + '/../images/BinReqImg/BinRequestBin_' + data.cID + '.jpg', Buffer.from(data.BinRequestBin, 'base64'), function (err) {
			if (err) {
				console.log(err);
			} else {
				database.query(sql, function (err, res) {
					if (!err) {
						resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
					} else {
						resp.send("Please Try Again");
					}
				});
				console.log("success");
			}
		});
	} else {
		//console.log(sql);
		console.log(req.rawBody);

		var async = require('async');
		if (typeof data.BinRequestTrading !== 'undefined') {
            sql = "UPDATE tblbinrequest SET icImg ='/images/BinReqImg/BinRequestIC_" + data.cID + ".jpg',utilityImg ='BinReqImg/BinRequestUtility_" + data.cID + ".jpg',assessmentImg ='BinReqImg/BinRequestAssessment_" + data.cID + ".jpg',tradingImg ='BinReqImg/BinRequestTrading_" + data.cID + ".jpg'  WHERE reqID =" + data.cID + "";
			async.each(["BinRequestIC", "BinRequestUtility", "BinRequestAssessment", "BinRequestTrading"], function (file, callback) {

				fs.writeFile(__dirname + '/../images/BinReqImg/' + file + '_' + data.cID + '.jpg', Buffer.from(data[file], 'base64'), function (err) {
					if (err) {
						console.log(err);
					} else {
						console.log(file + '.json was updated.');
					}

					callback();
				});

			}, function (err) {
				if (err) {
					console.log(err);
				} else {
					database.query(sql, function (err, res) {
						if (!err) {
							resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
						} else {
							resp.send("Please Try Again");
						}
					});
					console.log("success");
				}
			});
		} else {
            sql = "UPDATE tblbinrequest SET icImg ='/images/BinReqImg/BinRequestIC_" + data.cID + ".jpg',utilityImg ='BinReqImg/BinRequestUtility_" + data.cID + ".jpg',assessmentImg ='BinReqImg/BinRequestAssessment_" + data.cID + ".jpg' WHERE reqID =" + data.cID + "";
			async.each(["BinRequestIC", "BinRequestUtility", "BinRequestAssessment"], function (file, callback) {

				fs.writeFile(__dirname + '/../images/BinReqImg/' + file + '_' + data.cID + '.jpg', Buffer.from(data[file], 'base64'), function (err) {
					if (err) {
						console.log(err);
					} else {
						console.log(file + '.json was updated.');
					}

					callback();
				});

			}, function (err) {
				if (err) {
					console.log(err);
				} else {
					database.query(sql, function (err, res) {
						if (!err) {
							resp.send("Your Request has been submitted. We will review the request and get back to you shortly.");
						} else {
							resp.send("Please Try Again");
						}
					});
					console.log("success");
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
        console.log(data);
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
                                console.log(json);
                                resp.json(json);
                            }
                        });
                    });                    
                }else{
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
                    console.log("complaintID = " + res[0].max);
                    // if(res[0].max == undefined){
                    //     complaintID = 1;
                    // }else{
                    //     complaintID = res[0].max;
                    //     complaintID = parseInt(complaintID) + 1;
                    // }
                    complaintID = "COM"+userID+dateID;
                    if (data.compRemarks == null || data.compRemarks == "") {
                        var sql = "INSERT INTO tblcomplaint (complaintID, userID, staffID, premiseType, complaint, complaintDate, complaintAddress, readStat) VALUES ('" + complaintID + "','" + userID + "','ACC201908080002','" + data.premise + "','" + data.complaint + "','" + date + "','" + data.compAdd + "', 'u')";
                    } else {
                        var sql = "INSERT INTO tblcomplaint (complaintID, userID, staffID, premiseType, complaint, remarks, complaintDate, complaintAddress, readStat) VALUES ('" + complaintID + "','" + userID + "','ACC201908080002','" + data.premise + "','" + data.complaint + "','" + data.compRemarks + "','" + date + "','" + data.compAdd + "', 'u')";
                    }
                    database.query(sql, function (err, res) {
                        if (!err) {
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
    var userID, name, company, number;
    var date = dateTime.create().format('Y-m-d H:M:S');

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () 
	{
		var satisfactionType = data.satisfactionType;
        var sqlUser = "SELECT * FROM tbluser WHERE userEmail ='" + data.user + "'";
		
        database.query(sqlUser, function (err, res) 
		{
            if (!err) 
			{
                userID = res[0].userID;
                name = res[0].name;
                company = res[0].companyName;
                number = res[0].contactNumber;
				var sql;
				
				if(satisfactionType == "municipal") 
				{
					sql = "INSERT INTO tblsatisfaction_municipal (userID, companyRating, teamEfficiency, collectionPromptness, binHandling, spillageControl, queryResponse, extraComment, submissionDate, readStat, name, company, number) VALUES ('" +
						userID + "','" + parseInt(data.companyRating) + "','" + parseInt(data.teamEfficiency) + "','" + parseInt(data.collectionPromptness) +
						"','" + parseInt(data.binHandling) + "','" + parseInt(data.spillageControl) + "','" + parseInt(data.queryResponse) + "','" +
						data.extraComment + "','" + date + "','" + "u','"+name+"','"+company+"','"+number+"')";
				} 
				else if(satisfactionType == "commercial") 
				{
					sql = "INSERT INTO tblsatisfaction_commercial (userID, companyRating, teamEfficiency, collectionPromptness, cleanliness, physicalCondition, queryResponse, extraComment, submissionDate, readStat, name, company, number) VALUES ('" +
                    userID + "','" + parseInt(data.companyRating) + "','" + parseInt(data.teamEfficiency) + "','" + parseInt(data.collectionPromptness) +
                    "','" + parseInt(data.cleanliness) + "','" + parseInt(data.physicalCondition) + "','" + parseInt(data.queryResponse) + "','" +
                    data.extraComment + "','" + date + "','" + "u','"+name+"','"+company+"','"+number+"')";
				} 
				else if(satisfactionType == "scheduled") 
				{
					sql = "INSERT INTO tblsatisfaction_scheduled (userID, companyRating, teamEfficiency, healthAdherence, regulationsAdherence, queryResponse, extraComment, submissionDate, readStat, name, company, number) VALUES ('" +
                    userID + "','" + parseInt(data.companyRating) + "','" + parseInt(data.teamEfficiency) + "','" + parseInt(data.healthAdherence) + "','" + parseInt(data.regulationsAdherence) + "','" + parseInt(data.queryResponse) + "','" +
                    data.extraComment + "','" + date + "','" + "u','"+name+"','"+company+"','"+number+"')";
				}

                database.query(sql, function (err, res) 
				{
                    if (!err) {
                        resp.send("Satisfaction Survey Submitted");
                    } else {
                        resp.send("Failed to Submit");
                    }
                });
            } 
			else 
			{
                resp.send("error getting user id");
            }
        });
    });
}); 

app.post('/enquiry', function (req, resp) {
    'use strict';
    var data;
    var userID;
    var date = dateTime.create().format('Y-m-d H:M:S');

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () 
	{
		var satisfactionType = data.satisfactionType;
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
		
        database.query(sqlUser, function (err, res) 
		{
            if (!err) 
			{
                userID = res[0].userID;
				var sql;
				
				sql = "INSERT INTO tblenquiry (userID, enquiry, enqStatus, submissionDate, readStat) VALUES ('" +
						userID + "','" + data.enquiry + "','New', '" + date + "','u')";

                database.query(sql, function (err, res) 
				{
                    if (!err) {
                        resp.send("Enquiry Submitted");
                    } else {
                        resp.send("Failed to Submit");
                    }
                });
            } 
			else 
			{
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

app.post('/checkIC', function (req, resp) {
    'use strict';

    var data;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        console.log(data.ic);
        var sql = "SELECT * FROM tblcustomer WHERE ic = '" + data.ic + "'";
        database.query(sql, function (err, res) {
            console.log(res[0]);
            if (res[0] != undefined) {
                if (res[0].status == 1) {
                    console.log("Approved Customer");
                    var sqlUser = "SELECT * FROM tbluser WHERE customerID = '" + res[0].customerID + "'";
                    database.query(sqlUser, function (err, res) {
                        if (res[0] != undefined) {
                            resp.send("Has Acc");
                        } else {
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
            console.log("hello from Register NameCheck(email)");
            console.log(res);

            for (var i = 0; i < res.length; i++) {

                if (res[i].userEmail == data.email) {
                    mailMatch = true;
                }

                if (res[i].contactNumber == data.pno) {
                    pnoMatch = true;
                }

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

            if (err) {
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
        console.log(data.ic);
        var sql = "SELECT * FROM tblcustomer WHERE tradingLicense = '" + data.tl + "'";
        database.query(sql, function (err, res) {
            console.log(res[0]);
            if (res[0] != undefined) {
                console.log("TL Taken");
                resp.send("TL Error");
            } else {
                console.log("Available TL");
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
        console.log(data);
        var sql = "SELECT * FROM tblcustomer WHERE ic = '" + data.ic + "'";
        database.query(sql, function (err, res) {
            console.log("hello from /checkEmail");
            console.log(res[0].userEmail);
            if (res[0] != undefined) {
                console.log(res[0].userEmail);
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

    var data, transporter, subject, text, email, mailOptions, vCode, address;
    var userID = 0;
    var date = dateTime.create().format('Y-m-d H:M:S');

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'registercustomerapp@gmail.com',
                pass: 'trienekens321'
            }
        });
        vCode = Math.floor(Math.random() * 90000) + 10000;
        subject = "Trienekens App Verification Code";
        text = "Thank You for Signing Up to the Trienekens App. Your Verification Code is: " + vCode;
        email = data.email;
        console.log("vCode: " + vCode);
        mailOptions = {
            from: 'registercustomerapp@gmail.com',
            to: email,
            subject: subject,
            text: text
        };

        var sql = "SELECT MAX(CAST(userID as signed)) as max FROM tbluser";
        database.query(sql, function (err, res) {
            userID = res[0].max;
            userID = parseInt(userID) + 1;
            
            if(data.add1 != "" && data.add2 != ""){
                address = data.add1 + " " + data.add2;
            } else if (data.add1 != "" && data.add2 == "") {
                address = data.add1;                
            }
            
            console.log("ADDRESS: " + address);

            if(address == undefined){
                
                var sql3 = "INSERT INTO tbluser (userID, name, userEmail, password, contactNumber, vCode, creationDateTime) VALUES ('" + userID + "','" + data.name + "','" + data.email + "','" + data.pass + "','" + data.pno + "','" + vCode + "','" + date + "')";

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        resp.send("Mail Failed");
                    }
                    //console.log("Email sent: " + info.response);
                    database.query(sql3, function (err, res) {
                        if (err) {
                            resp.send(err);
                            console.log(err);
                            throw err;
                        }else{
                            //console.log("Registered");
                            resp.send("Registered");
                        }
                    });
                });
                
            } else {
                
                var sql3 = "INSERT INTO tbluser (userID, name, userEmail, password, contactNumber, address, vCode, creationDateTime) VALUES ('" + userID + "','" + data.name + "','" + data.email + "','" + data.pass + "','" + data.pno + "','" + address + "','" + vCode + "','" + date + "')";

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        resp.send("Mail Failed");
                    }
                    //console.log("Email sent: " + info.response);
                    database.query(sql3, function (err, res) {
                        if (err) {
                            resp.send(err);
                            console.log(err);
                            throw err;
                        }else{
                            //console.log("Registered");
                            resp.send("Registered");
                        }
                    });
                });
                
            }
            
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
        console.log("vCode: " + vCode);
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

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    resp.send("Mail Failed");
                    console.log(error);
                }
                console.log("Email sent: " + info.response);
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
                    console.log(res[0]);
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
        console.log(data);
        database.query(sql, function (err, res) {
            console.log(res);
            if (err) {
                resp.send("Failed to Register");
                throw err;
            }
            if (res[0].vCode == data.vcode) {
                var sql2 = "UPDATE tbluser SET status = 1 WHERE userEmail ='" + data.email + "'";
                database.query(sql2, function (err, res) {
                    console.log(res[0]);
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
        console.log(data.user);
        database.query(sql, function (err, res) {
            console.log(res);
            if(res[0] != undefined){
                if (res[0].address == undefined) {
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
                //console.log(JSON.parse(info));
                //console.log(info);
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
            console.log("hello from Register NameCheck(email)");
            console.log(res);

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
                console.log(res);
                if (data.oldp != res[0].password) {
                    passError = true;
                    error = "";
                } else {
                    passError = false;
                }
                
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
    var pass;;
    var taman = []
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
        
        if(data.add != undefined){
            var sqlUpdate = "UPDATE tbluser SET userEmail = '" + data.email + "',password='" + pass + "',contactNumber='" + data.pno + "',address='" + data.add + "' WHERE userEmail = '" + data.oriemail + "'";
            database.query(sqlUpdate, function(err, res){
                if(err){
                    throw err;
                }
                resp.send("Updated");
            });
        } else {
    //      console.log("ENETER NO TAMAN UPDATE");
            var sqlUpdate = "UPDATE tbluser SET userEmail = '" + data.email + "',password='" + pass + "',contactNumber='" + data.pno + "' WHERE userEmail = '" + data.oriemail + "'";
            database.query(sqlUpdate, function(err, res){
                if(err){
                    throw err;
                }
                resp.send("Updated");
            });
        }
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
        console.log(data);
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail ='" + data.user + "'";
        database.query(sqlUser, function (err, res) {
            if (!err) {
                userID = res[0].userID;
                var sql = "SELECT * FROM tblbinrequest WHERE userID = '" + userID + "'";
                //var sql2 = "SELECT message as offmsg, createdAt as offtime from tblchat WHERE complaintID ='"+data.id+"' AND sender!='"+userID+"' ORDER BY createdAt ASC";
                database.query(sql, function (err, res) {
                    if (res != undefined) {
                        for (var i = 0; i < res.length; i++) {
                            msgs.push(res[i]);
                        }
                        console.log(msgs);
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
                console.log("hello from getUserID");
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
                        console.log(msgs);
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
    console.log(sql);
    console.log(req.rawBody);
    //console.log(data);
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
    var date = dateTime.create().format('YmdHMS');

    data = JSON.parse(req.rawBody);
    sql = "UPDATE tblcomplaint SET complaintImg ='/images/complaintImg/complaintcase_" + data.cID + ".jpg' WHERE complaintID ='" + data.cID + "'";
    console.log(sql);
    console.log(req.rawBody);
    //console.log(data);
    fs.writeFile(__dirname + '/../images/complaintImg/complaintcase_' + data.cID + '.jpg', Buffer.from(data.complaintImage, 'base64'), function (err) {
        if (err) {
            console.log(err);
        } else {
            database.query(sql, function (err, res) {
                if (!err) {
                    resp.send("Complaint has been submitted. We will review the complaint and take any necessary actions.");
                } else {
                    resp.send("Please Try Again");
                    console.log(err);
                }
            });
            console.log("success");
        }
    });
});

app.post('/resetPassword', function (req, resp) {
    'use strict';

    var data, transporter, subject, text, email, mailOptions, newPass;

    req.addListener('data', function (postDataChunk) {
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function () {

        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'registercustomerapp@gmail.com',
                pass: 'trienekens321'
            }
        });

        newPass = Math.floor(Math.random() * 90000) + 10000;
        subject = "Trienekens App Password Reset";
        text = "Your new password is: " + newPass + ". Please change your password when you login.";
        email = data.email;

        mailOptions = {
            from: 'registercustomerapp@gmail.com',
            to: email,
            subject: subject,
            text: text
        };

        console.log("New Password: " + newPass);

        var sql = "SELECT userID from tbluser WHERE userEmail = '" + data.email + "'";
        
        database.query(sql, function (err, res) {
            if (err) 
            {
                resp.send("Get userID Failed");
                console.log(err);
                throw err;
            }
            else 
            {
                var userID = res[0].userID;
                var sql2 = "UPDATE tbluser SET password = '" + newPass + "' WHERE userID = '" + userID + "'";
    
                database.query(sql2, function (err, res) {
                    if (err) 
                    {
                        resp.send("Update Password Failed");
                        console.log(err);
                        throw err;
                    }
                    else 
                    {
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                resp.send("Mail Failed");
                                console.log(error);
                            } else {
                                resp.send("Mail Sent");
                            }
                        });
                    }
                });
            }
        });
    });
});

app.post('/getComplaintIDs', function(req, res){
    'use strict';
    var data,
    IDs = {};
    IDs["ids"] = [];
    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        console.log(data.email);
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail = '"+data.email+"'";
        database.query(sqlUser, function(err, result){
            if(err){
                throw err;
            }
            var userID = result[0].userID;
            var sql = "SELECT complaintID FROM tblcomplaint WHERE userID = '"+userID+"'";
            database.query(sql, function(err, result){
                if(err){
                    throw err;
                }
                for(var i = 0; i<result.length; i++){
                    IDs["ids"].push({
                        "id":result[i].complaintID
                    });
                }
                res.send(IDs);
            });
        });
    });
});

app.post('/getBinReqIDs', function(req, res){
    'use strict';
    var data,
    IDs = {};
    IDs["ids"] = [];
    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        console.log(data.email);
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail = '"+data.email+"'";
        database.query(sqlUser, function(err, result){
            if(err){
                throw err;
            }
            var userID = result[0].userID;
            var sql = "SELECT reqID FROM tblbinrequest WHERE userID = '"+userID+"'";
            database.query(sql, function(err, result){
                if(err){
                    throw err;
                }
                for(var i = 0; i<result.length; i++){
                    IDs["ids"].push({
                        "id":result[i].reqID
                    });
                }
                res.send(IDs);
            });
        });
    });
});

app.post('/getUnreadMsg', function(req, res){
    'use strict';
    var data, results = {}, userID;
    results["unread"] = [];
    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail = '"+data.email+"'";
        database.query(sqlUser, function(err, result){
            if(err){
                throw err;
            }
            if(result[0]!=undefined){
                userID = result[0].userID;
                var sql = "SELECT complaintID, COUNT(readStat) as unread FROM tblchat WHERE readStat = 'u' AND recipient = '"+userID+"' GROUP BY complaintID ORDER BY complaintID ASC";
                database.query(sql, function(err, result){
                    if(err){
                        throw err;
                    }
                    for(var i=0; i< result.length; i++){
                        results["unread"].push({
                            "id":result[i].complaintID,
                            "value": result[i].unread
                        });
                    }
    
                    res.json(results);
                });
            }
        });
    });
});

app.post('/updateReadStat', function(req, res){
    'use strict';
    var data, userID;
    req.addListener('data', function(postDataChunk){
        data = JSON.parse(postDataChunk);
    });

    req.addListener('end', function(){
        var sqlUser = "SELECT userID FROM tbluser WHERE userEmail = '"+data.email+"'";
        database.query(sqlUser, function(err, result){
            if(err){
                throw err;
            }
            userID = result[0].userID;
            var sql = "UPDATE tblchat SET readStat = 'r' WHERE complaintID = '"+data.compID+"' AND recipient = '"+userID+"' AND readStat = 'u'";
            database.query(sql, function(err, result){
                if(err){
                    throw err;
                }
                res.send("Message read");
            });
        });
    });
});

app.get('/getBoundaryIDs', function(req, res){
    'use strict';
    var sql = "SELECT * FROM tblboundary";
    database.query(sql, function(error, result){
        if(error){
            res.end();
            throw error;
        }
        res.json(result);
        res.end();
    });
});

app.get('/getBoundaryLatLng', function(req, res){
    'use strict';
    var sql = "SELECT tblboundaryplot.boundaryID AS id, tblboundary.color, tblboundaryplot.lat, tblboundaryplot.lng, tblarea.areaCode AS area, tblzone.zoneCode AS zone, tblboundary.areaID, tblarea.collection_frequency FROM tblboundaryplot JOIN tblboundary ON tblboundaryplot.boundaryID = tblboundary.boundaryID JOIN tblarea ON tblarea.areaID = tblboundary.areaID JOIN tblzone ON tblzone.zoneID = tblarea.zoneID WHERE tblboundary.status = 'A' ORDER BY tblboundaryplot.boundaryID ASC, tblboundaryplot.ordering ASC";
    database.query(sql, function(error, result){
        if(error){
            res.end();
            throw error;
        }
        res.json(result);
        res.end();
    });
});

module.exports = app;
