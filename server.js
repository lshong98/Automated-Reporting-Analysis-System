/*jslint node:true*/
var variable = require('./variable');
var express = variable.express;
var app = variable.app;
var server = variable.server;
var SVR_PORT = variable.SVR_PORT;
var emitter = variable.emitter;
var fs = variable.fs;
var upload = variable.upload;
var FCMAdmin = variable.FCMAdmin; 
var FCMServiceAccount = variable.FCMServiceAccount;
var dateTime = require('node-datetime');
var nodemailer = require('nodemailer');

var requestHandler = require('./requestHandlers');
var database = require('./custom_modules/database-management');
var accountManagement = require('./custom_modules/account-management');
var acrManagement = require('./custom_modules/acr-management');
var areaManagement = require('./custom_modules/area-management');
var zoneManagement = require('./custom_modules/zone-management');
var bincenterManagement = require('./custom_modules/bincenter-management');
var f = require('./custom_modules/function-management');
var reportManagement = require('./custom_modules/report-management');
var roleManagement = require('./custom_modules/role-management');
var truckManagement = require('./custom_modules/truck-management');
var zoneManagement = require('./custom_modules/zone-management');
var transactionLog = require('./custom_modules/transaction-log');
var authorization = require('./custom_modules/authorization');
var formAuthorization = require('./custom_modules/form-authorization');
var databaseBinManagement = require('./custom_modules/bin-database');
var binInventoryManagement = require('./custom_modules/bin-inventory');
var chatManagement = require('./custom_modules/chat-management');
var deliveryManagement = require('./custom_modules/delivery-management');
var damagedBin = require('./custom_modules/damaged-bin');
var boundaryManagement = require('./custom_modules/boundary-management');
var socketManagement = require('./custom_modules/socket-management');
var complaintManagement = require('./custom_modules/complaint-management');
var custApp = require('./custom_modules/cust-app');

// Parse JSON bodies (as sent by API clients)
app.use(express.json({limit: '50mb'}));
// Parse URL-encoded bodies (as sent by HTML forms)
//app.use(express.urlencoded());

//Use express file upload
app.use(upload());

//FCM
FCMAdmin.initializeApp({
    credential: FCMAdmin.credential.cert(FCMServiceAccount),
    databaseURL: "https://trienekens-994df.firebaseio.com"
});

app.post('/sendNotifToDevice', function (req, res) {
    'use strict';
    
    var topic = req.body.target;

    var payloadWithTopic = {
        'notification':
            {
                'title': req.body.title,
                'body': req.body.message
            },
        topic: topic
    };

    console.log(req.body);
    console.log(req.body.target);
    console.log(req.body.title);
    console.log(req.body.message);

    //var target = req.body.target;
    // if(target == "all"){
    //     console.log("all customers have been selected");
    //     FCMAdmin.messaging().sendToDevice(token, payload, options)
    //     .then(function(response){
    //         console.log("Message sent successfully");
    //     }).catch(function(err){
    //         console.log(err);
    //     });
    // }
    //else{
    FCMAdmin.messaging().send(payloadWithTopic)
        .then(function (response) {
            console.log("Topic message sent successfully");
        }).catch(function (err) {
            console.log(err);
        });
    //}
});

app.post('/insertAnnouncement', function(req, res){
    'use strict';
    var target = req.body.target;
    var message = req.body.message;
    var date = dateTime.create().format('Y-m-d');
    var sql = "INSERT INTO tblannouncement(announcement, announceDate, target) VALUES('"+message+"','"+date+"','"+target+"')";
    database.query(sql, function(err, result){
        if(!err){
            console.log("announcement inserted");
        }
    });
});

app.get('/fetchCarouselImg', function (req, res) {
    'use strict';
    var sql = "", output = {}, i = 0;
    
    sql = "SELECT * FROM tblcarouselimg";
    output.output = [];
    database.query(sql, function (err, result) {
        for (i = 0; i < result.length; i += 1) {
            output.output.push({"imageName": result[i].fileName, "id": result[i].id});
        }
        console.log(output);
        res.json(output);
        res.end();
    });
});

app.get('/getAllSchedule', function (req, res) {
    'use strict';

    var sql = "", output = [], i = 0;
    
    sql = "SELECT * FROM tblschedule";
    database.query(sql, function (err, result) {
        for (i = 0; i < result.length; i += 1) {
            output.push(result[i]);
        }
        console.log(output);
        res.json(output);
        res.end();
    });
});

app.get('/getAreas', function(req, res){
    'use strict';

    var sql = "SELECT * FROM tblarea";
    var output = [];
    database.query(sql, function(err, result){
        for (var i=0; i<result.length; i++){
            output.push(result[i]);
        }
        console.log(output);
        res.json(output);
        res.end();
    });
});

app.get('/getPendingUser', function (req, res) {
    'use strict';

    var sql = "", output = [], i = 0;
    
    sql = "SELECT * FROM tblcustomer WHERE status = 0";
    database.query(sql, function (err, result) {
        for (i = 0; i < result.length; i += 1) {
            output.push(result[i]);
        }
        console.log(output);
        res.json(output);
        res.end();
    });
});

app.get('/getPendingBinRequest', function (req, res) {
    'use strict';

    var sql = "", output = [], i = 0;
    
    sql = "SELECT reqID, requestDate, binType, reason, remarks, tblbinrequest.status, CONCAT(houseNo, ' ', streetNo, ', ', postCode, ' ', city, ', ', State) AS address, contactNumber FROM tblbinrequest JOIN tbluser WHERE tblbinrequest.userID = tbluser.userID";
    database.query(sql, function (err, result) {
        if(result!=undefined){
            for (i = 0; i < result.length; i += 1) {
                output.push(result[i]);
            }
            console.log(output);
            res.json(output);
            res.end();
        }
    });
});

app.post('/updatePendingUser', function (req, res) {
    'use strict';
    console.log(req.body);
    var sql = "UPDATE tblcustomer SET status = '"+req.body.status+"' WHERE customerID = '"+req.body.pendingID+"'";
    var transporter, subject, text, email, mailOptions;
    var date = dateTime.create().format('Y-m-d H:i:s');
    var tbluserSql = "INSERT INTO tbluser(customerID,userEmail,password,status,creationDate) VALUES('"+req.body.pendingID+"','"+req.body.email+"','"+req.body.pass+"',1,'"+date+"')";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'registercustomerapp@gmail.com',
                pass: 'trienekens123'
            }
        });

        if(req.body.status == 1){
            text = "Dear user, we are pleased to inform you that your registration has been approved. You can log in to our app using the email and password that you have entered during registration. ";
            database.query(tbluserSql, function(err, result){
                if(err){
                    throw err;
                }
                console.log("Succeess");
            });
        }else{
            text = "Dear user, we regret to inform you that your registration has been declined. We apologise for any inconveniences caused.";
        }

        subject = "Trienekens Account Status";
        email = req.body.email;
        mailOptions = {
            from: 'registercustomerapp@gmail.com',
            to: email,
            subject: subject,
            text: text
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                res.send("Mail Failed");
                res.end();
                console.log(error);
            }
            console.log("Email sent: "+info.response);
        });
        res.send("User Status Updated");
        res.end();
    });
});

app.post('/updateBinRequest', function (req, res) {
    'use strict';
    console.log(req.body);
    var sql = "UPDATE tblbinrequest SET status = '" + req.body.status + "' WHERE reqID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.send("Bin Request Updated");
        res.end();
    });
});

app.post('/deleteCarouselImg', function (req, res) {
    'use strict';
    console.log(req.body);
    
    var imgDir = "", sql = "";
    
    imgDir = "images/img/" + req.body.name;
    sql = "DELETE FROM tblcarouselimg WHERE id = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        fs.unlink(imgDir, function (err) {
            if (err) {
                throw err;
            }
            console.log("Image Deleted");
            res.send("Image Deleted");
            res.end();
        });
    });
});

app.post('/editCollectionSchedule', function (req, res) {
    'use strict';
    console.log(req.body);
    var sql = "UPDATE tblschedule SET mon = '" + req.body.mon + "', tue = '" + req.body.tue + "', wed = '" + req.body.wed + "', thur = '" + req.body.thur + "', fri = '" + req.body.fri + "', sat = '" + req.body.sat + "' WHERE areaID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Updated");
    });
});

// app.get('/customerFeedbackMunicipal', function(req, res){
//     'use strict';
//     var sql = "SELECT * FROM tblsatisfaction_municipal";
//     var compRate = 0, teamEff = 0, collPrompt = 0, binHand = 0, spillCtrl = 0, qryResp = 0, comments = [];
//     var json = {};
//     database.query(sql, function(err,result){
//         console.log(result);
//         var totalReview = result.length;
//         for(var i = 0; i<totalReview; i++){
//             compRate += parseInt(result[i].companyRating);
//             teamEff += parseInt(result[i].teamEfficiency);
//             collPrompt += parseInt(result[i].collectionPromptness);
//             binHand += parseInt(result[i].binHandling);
//             spillCtrl += parseInt(result[i].spillageControl);
//             qryResp += parseInt(result[i].queryResponse);
//             if(result[i].extraComment != "" && result[i].extraComment != null){
//                 comments.push(result[i].extraComment);
//             }
//         }
//         json = {"compRate":compRate/totalReview,"teamEff":teamEff/totalReview,"collPrompt":collPrompt/totalReview,"binHand":binHand/totalReview,"spillCtrl":spillCtrl/totalReview,"qryResp":qryResp/totalReview,"comments":comments};
//         res.json(json);
//         res.end();
//     });
// });

app.get('/customerFeedbackMunicipal', function(req, res){
    'use strict';
    var sql = "SELECT 'companyRating' as source, companyRating AS category, COUNT(companyRating) AS value FROM tblsatisfaction_municipal GROUP BY companyRating UNION SELECT 'teamEfficiency' as source, teamEfficiency AS category, COUNT(teamEfficiency) AS value FROM tblsatisfaction_municipal GROUP BY teamEfficiency UNION SELECT 'collectionPromptness' as source, collectionPromptness AS category, COUNT(collectionPromptness) AS value FROM tblsatisfaction_municipal GROUP BY collectionPromptness UNION SELECT 'binHandling' as source, binHandling AS category, COUNT(binHandling) AS value FROM tblsatisfaction_municipal GROUP BY binHandling UNION SELECT 'spillageControl' as source, teamEfficiency AS category, COUNT(spillageControl) AS value FROM tblsatisfaction_municipal GROUP BY spillageControl UNION SELECT 'queryResponse' as source, queryResponse AS category, COUNT(queryResponse) AS value FROM tblsatisfaction_municipal GROUP BY queryResponse";
    var sqlComments = "SELECT extraComment FROM tblsatisfaction_municipal";
    var compRateUS, teamEffUS, collPromptUS, binHandUS, spillCtrlUS, qryRespUS, comments = [];
    var compRateS, teamEffS, collPromptS, binHandS, spillCtrlS, qryRespS;
    var compRateAvg, teamEffAvg, collPromptAvg, binHandAvg, spillCtrlAvg, qryRespAvg;
    var json = {};
    database.query(sql, function(err,result){
        for(var i = 0; i<result.length; i++){
            if(result[i].source == "companyRating" && result[i].category == "1"){
                compRateUS = result[i].value;
            }else if(result[i].source == "companyRating" && result[i].category == "2"){
                compRateAvg = result[i].value;
            }else if(result[i].source == "companyRating" && result[i].category == "3"){
                compRateS = result[i].value;
            }

            if(result[i].source == "teamEfficiency" && result[i].category == "1"){
                teamEffUS = result[i].value;
            }else if(result[i].source == "teamEfficiency" && result[i].category == "2"){
                teamEffAvg = result[i].value;
            }else if(result[i].source == "teamEfficiency" && result[i].category == "3"){
                teamEffS = result[i].value;
            }

            if(result[i].source == "collectionPromptness" && result[i].category == "1"){
                collPromptUS = result[i].value;
            }else if(result[i].source == "collectionPromptness" && result[i].category == "2"){
                collPromptAvg = result[i].value;
            }else if(result[i].source == "collectionPromptness" && result[i].category == "3"){
                collPromptS = result[i].value;
            }

            if(result[i].source == "binHandling" && result[i].category == "1"){
                binHandUS = result[i].value;
            }else if(result[i].source == "binHandling" && result[i].category == "2"){
                binHandAvg = result[i].value;
            }else if(result[i].source == "binHandling" && result[i].category == "3"){
                binHandS = result[i].value;
            }

            if(result[i].source == "spillageControl" && result[i].category == "1"){
                spillCtrlUS = result[i].value;
            }else if(result[i].source == "spillageControl" && result[i].category == "2"){
                spillCtrlAvg = result[i].value;
            }else if(result[i].source == "spillageControl" && result[i].category == "3"){
                spillCtrlS = result[i].value;
            }

            if(result[i].source == "queryResponse" && result[i].category == "1"){
                qryRespUS = result[i].value;
            }else if(result[i].source == "queryResponse" && result[i].category == "2"){
                qryRespAvg = result[i].value;
            }else if(result[i].source == "queryResponse" && result[i].category == "3"){
                qryRespS = result[i].value;
            }
        }

        database.query(sqlComments, function(err, result){
            for(var i = 0; i<result.length; i++){
                if(result[i].extraComment != "" && result[i].extraComment != null){
                    comments.push(result[i].extraComment);
                }
            }
            json = {"compRateUS":compRateUS,"compRateAvg":compRateAvg,"compRateS":compRateS,"teamEffUS":teamEffUS,"teamEffAvg":teamEffAvg,"teamEffS":teamEffS,"collPromptUS":collPromptUS,"collPromptAvg":collPromptAvg,"collPromptS":collPromptS,"binHandUS":binHandUS,"binHandAvg":binHandAvg,"binHandS":binHandS,"spillCtrlUS":spillCtrlUS,"spillCtrlAvg":spillCtrlAvg,"spillCtrlS":spillCtrlS,"qryRespUS":qryRespUS,"qryRespAvg":qryRespAvg,"qryRespS":qryRespS,"comments":comments};
            res.json(json);
            res.end();
        });
    });
});

// app.get('/customerFeedbackCommercial', function(req, res){
//     'use strict';
//     var sql = "SELECT * FROM tblsatisfaction_commercial";
//     var compRate = 0, teamEff = 0, collPrompt = 0, cleanliness = 0, physicalCond = 0, qryResp = 0, comments = [];
//     var json = {};
//     database.query(sql, function(err,result){
//         console.log(result);
//         var totalReview = result.length;
//         for(var i = 0; i<totalReview; i++){
//             compRate += parseInt(result[i].companyRating);
//             teamEff += parseInt(result[i].teamEfficiency);
//             collPrompt += parseInt(result[i].collectionPromptness);
//             cleanliness += parseInt(result[i].cleanliness);
//             physicalCond += parseInt(result[i].physicalCondition);
//             qryResp += parseInt(result[i].queryResponse);
//             if(result[i].extraComment != "" && result[i].extraComment != null){
//                 comments.push(result[i].extraComment);
//             }
//         }
//         json = {"compRate":compRate/totalReview,"teamEff":teamEff/totalReview,"collPrompt":collPrompt/totalReview,"cleanliness":cleanliness/totalReview,"physicalCond":physicalCond/totalReview,"qryResp":qryResp/totalReview,"comments":comments};
//         res.json(json);
//         res.end();
//     });
// });

app.get('/customerFeedbackCommercial', function(req, res){
    'use strict';
    var sql = "SELECT 'companyRating' as source, companyRating AS category, COUNT(companyRating) AS value FROM tblsatisfaction_commercial GROUP BY companyRating UNION SELECT 'teamEfficiency' as source, teamEfficiency AS category, COUNT(teamEfficiency) AS value FROM tblsatisfaction_commercial GROUP BY teamEfficiency UNION SELECT 'collectionPromptness' as source, collectionPromptness AS category, COUNT(collectionPromptness) AS value FROM tblsatisfaction_commercial GROUP BY collectionPromptness UNION SELECT 'cleanliness' as source, cleanliness AS category, COUNT(cleanliness) AS value FROM tblsatisfaction_commercial GROUP BY cleanliness UNION SELECT 'physicalCondition' as source, physicalCondition AS category, COUNT(physicalCondition) AS value FROM tblsatisfaction_commercial GROUP BY physicalCondition UNION SELECT 'queryResponse' as source, queryResponse AS category, COUNT(queryResponse) AS value FROM tblsatisfaction_commercial GROUP BY queryResponse";
    var sqlComments = "SELECT extraComment FROM tblsatisfaction_commercial";
    var compRateUS, teamEffUS, collPromptUS, cleanlinessUS, physicalCondUS, qryRespUS, comments = [];
    var compRateS, teamEffS, collPromptS, cleanlinessS, physicalCondS, qryRespS;
    var compRateAvg, teamEffAvg, collPromptAvg, cleanlinessAvg, physicalCondAvg, qryRespAvg;
    var json = {};
    database.query(sql, function(err,result){
        for(var i = 0; i<result.length; i++){
            if(result[i].source == "companyRating" && result[i].category == "1"){
                compRateUS = result[i].value;
            }else if(result[i].source == "companyRating" && result[i].category == "2"){
                compRateAvg = result[i].value;
            }else if(result[i].source == "companyRating" && result[i].category == "3"){
                compRateS = result[i].value;
            }

            if(result[i].source == "teamEfficiency" && result[i].category == "1"){
                teamEffUS = result[i].value;
            }else if(result[i].source == "teamEfficiency" && result[i].category == "2"){
                teamEffAvg = result[i].value;
            }else if(result[i].source == "teamEfficiency" && result[i].category == "3"){
                teamEffS = result[i].value;
            }

            if(result[i].source == "collectionPromptness" && result[i].category == "1"){
                collPromptUS = result[i].value;
            }else if(result[i].source == "collectionPromptness" && result[i].category == "2"){
                collPromptAvg = result[i].value;
            }else if(result[i].source == "collectionPromptness" && result[i].category == "3"){
                collPromptS = result[i].value;
            }

            if(result[i].source == "cleanliness" && result[i].category == "1"){
                cleanlinessUS = result[i].value;
            }else if(result[i].source == "cleanliness" && result[i].category == "2"){
                cleanlinessAvg = result[i].value;
            }else if(result[i].source == "cleanliness" && result[i].category == "3"){
                cleanlinessS = result[i].value;
            }

            if(result[i].source == "physicalCondition" && result[i].category == "1"){
                physicalCondUS = result[i].value;
            }else if(result[i].source == "physicalCondition" && result[i].category == "2"){
                physicalCondAvg = result[i].value;
            }else if(result[i].source == "physicalCondition" && result[i].category == "3"){
                physicalCondS = result[i].value;
            }

            if(result[i].source == "queryResponse" && result[i].category == "1"){
                qryRespUS = result[i].value;
            }else if(result[i].source == "queryResponse" && result[i].category == "2"){
                qryRespAvg = result[i].value;
            }else if(result[i].source == "queryResponse" && result[i].category == "3"){
                qryRespS = result[i].value;
            }
        }

        database.query(sqlComments, function(err, result){
            for(var i = 0; i<result.length; i++){
                if(result[i].extraComment != "" && result[i].extraComment != null){
                    comments.push(result[i].extraComment);
                }
            }
            json = {"compRateUS":compRateUS,"compRateAvg":compRateAvg,"compRateS":compRateS,"teamEffUS":teamEffUS,"teamEffAvg":teamEffAvg,"teamEffS":teamEffS,"collPromptUS":collPromptUS,"collPromptAvg":collPromptAvg,"collPromptS":collPromptS,"cleanlinessUS":cleanlinessUS,"cleanlinessAvg":cleanlinessAvg,"cleanlinessS":cleanlinessS,"physicalCondUS":physicalCondUS,"physicalCondAvg":physicalCondAvg,"physicalCondS":physicalCondS,"qryRespUS":qryRespUS,"qryRespAvg":qryRespAvg,"qryRespS":qryRespS,"comments":comments};
            res.json(json);
            res.end();
        });
    });
});

// app.get('/customerFeedbackScheduled', function(req, res){
//     'use strict';
//     var sql = "SELECT * FROM tblsatisfaction_scheduled";
//     var compRate = 0, teamEff = 0, healthAdh = 0, regAdh = 0, qryResp = 0, comments = [];
//     var json = {};
//     database.query(sql, function(err,result){
//         console.log(result);
//         var totalReview = result.length;
//         for(var i = 0; i<totalReview; i++){
//             compRate += parseInt(result[i].companyRating);
//             teamEff += parseInt(result[i].teamEfficiency);
//             healthAdh += parseInt(result[i].healthAdherence);
//             regAdh += parseInt(result[i].regulationsAdherence);
//             qryResp += parseInt(result[i].queryResponse);
//             if(result[i].extraComment != "" && result[i].extraComment != null){
//                 comments.push(result[i].extraComment);
//             }
//         }
//         json = {"compRate":compRate/totalReview,"teamEff":teamEff/totalReview,"healthAdh":healthAdh/totalReview,"regAdh":regAdh/totalReview,"qryResp":qryResp/totalReview,"comments":comments};
//         res.json(json);
//         res.end();
//     });
// });

app.get('/customerFeedbackScheduled', function(req, res){
    'use strict';
    var sql = "SELECT 'companyRating' as source, companyRating AS category, COUNT(companyRating) AS value FROM tblsatisfaction_scheduled GROUP BY companyRating UNION SELECT 'teamEfficiency' as source, teamEfficiency AS category, COUNT(teamEfficiency) AS value FROM tblsatisfaction_scheduled GROUP BY teamEfficiency UNION SELECT 'healthAdherence' as source, healthAdherence AS category, COUNT(healthAdherence) AS value FROM tblsatisfaction_scheduled GROUP BY healthAdherence UNION SELECT 'regulationsAdherence' as source, regulationsAdherence AS category, COUNT(regulationsAdherence) AS value FROM tblsatisfaction_scheduled GROUP BY regulationsAdherence UNION SELECT 'queryResponse' as source, queryResponse AS category, COUNT(queryResponse) AS value FROM tblsatisfaction_scheduled GROUP BY queryResponse";
    var sqlComments = "SELECT extraComment FROM tblsatisfaction_scheduled";
    var compRateUS, teamEffUS, healthAdhUS, regAdhUS, qryRespUS, comments = [];
    var compRateS, teamEffS, healthAdhS, regAdhS, qryRespS;
    var compRateAvg, teamEffAvg, healthAdhAvg, regAdhAvg, qryRespAvg;
    var json = {};
    database.query(sql, function(err,result){
        for(var i = 0; i<result.length; i++){
            if(result[i].source == "companyRating" && result[i].category == "1"){
                compRateUS = result[i].value;
            }else if(result[i].source == "companyRating" && result[i].category == "2"){
                compRateAvg = result[i].value;
            }else if(result[i].source == "companyRating" && result[i].category == "3"){
                compRateS = result[i].value;
            }

            if(result[i].source == "teamEfficiency" && result[i].category == "1"){
                teamEffUS = result[i].value;
            }else if(result[i].source == "teamEfficiency" && result[i].category == "2"){
                teamEffAvg = result[i].value;
            }else if(result[i].source == "teamEfficiency" && result[i].category == "3"){
                teamEffS = result[i].value;
            }

            if(result[i].source == "healthAdherence" && result[i].category == "1"){
                healthAdhUS = result[i].value;
            }else if(result[i].source == "healthAdherence" && result[i].category == "2"){
                healthAdhAvg = result[i].value;
            }else if(result[i].source == "healthAdherence" && result[i].category == "3"){
                healthAdhS = result[i].value;
            }

            if(result[i].source == "regulationsAdherence" && result[i].category == "1"){
                regAdhUS = result[i].value;
            }else if(result[i].source == "regulationsAdherence" && result[i].category == "2"){
                regAdhAvg = result[i].value;
            }else if(result[i].source == "regulationsAdherence" && result[i].category == "3"){
                regAdhS = result[i].value;
            }

            if(result[i].source == "queryResponse" && result[i].category == "1"){
                qryRespUS = result[i].value;
            }else if(result[i].source == "queryResponse" && result[i].category == "2"){
                qryRespAvg = result[i].value;
            }else if(result[i].source == "queryResponse" && result[i].category == "3"){
                qryRespS = result[i].value;
            }
        }

        database.query(sqlComments, function(err, result){
            for(var i = 0; i<result.length; i++){
                if(result[i].extraComment != "" && result[i].extraComment != null){
                    comments.push(result[i].extraComment);
                }
            }
            json = {"compRateUS":compRateUS,"compRateAvg":compRateAvg,"compRateS":compRateS,"teamEffUS":teamEffUS,"teamEffAvg":teamEffAvg,"teamEffS":teamEffS,"healthAdhUS":healthAdhUS,"healthAdhAvg":healthAdhAvg,"healthAdhS":healthAdhS,"regAdhUS":regAdhUS,"regAdhAvg":regAdhAvg,"regAdhS":regAdhS,"qryRespUS":qryRespUS,"qryRespAvg":qryRespAvg,"qryRespS":qryRespS,"comments":comments};
            res.json(json);
            res.end();
        });
    });
});

app.get('/unreadSatisfaction', function(req, res){
    'use strict';
    var municipal = "SELECT count(readStat) as unread FROM tblsatisfaction_municipal WHERE readStat = 'u'";
    var commercial = "SELECT count(readStat) as unread FROM tblsatisfaction_commercial WHERE readStat = 'u'";
    var scheduled = "SELECT count(readStat) as unread FROM tblsatisfaction_scheduled WHERE readStat = 'u'";
    var unreadMunicipal, unreadCommercial, unreadScheduled, json = {};

    database.query(municipal, function(err, result){
        unreadMunicipal = result[0].unread;
        database.query(commercial, function(err, result){
            unreadCommercial = result[0].unread;
            database.query(scheduled, function(err, result){
                unreadScheduled = result[0].unread;
                json = {"municipal":unreadMunicipal,"commercial":unreadCommercial,"scheduled":unreadScheduled};
                res.json(json);
                res.end();
            });
        });
    });
});


app.get('/readSatisfactionMunicipal', function(req, res){
    'use strict';
    var sql = "UPDATE tblsatisfaction_municipal SET readStat = 'r'";
    database.query(sql, function(err, result){
        res.send("New Satisfaction Read");
        res.end();
    });
});

app.get('/readSatisfactionCommercial', function(req, res){
    'use strict';
    var sql = "UPDATE tblsatisfaction_commercial SET readStat = 'r'";
    database.query(sql, function(err, result){
        res.send("New Satisfaction Read");
        res.end();
    });
});

app.get('/readSatisfactionScheduled', function(req, res){
    'use strict';
    var sql = "UPDATE tblsatisfaction_scheduled SET readStat = 'r'";
    database.query(sql, function(err, result){
        res.send("New Satisfaction Read");
        res.end();
    });
});

app.post('/uploadCarouselImg', function (req, res) {
    'use strict';
    //console.log(req.files);
    
    if (req.files) {
        var file = req.files.carouselImg,
        allowed = ["png", "jpg", "jpeg"],
        fileExt, actualFileExt, i, sql;

        for(var x = 0;x<file.length;x++){
            fileExt = file[x].name.split('.');
            actualFileExt = fileExt[1].toLowerCase();

            for (i = 0; i < allowed.length; i += 1) {
                if (actualFileExt == allowed[i]) {
                    if (file[x].size <= 2000000) {
                        sql = "INSERT INTO tblcarouselimg(fileName) VALUES('" + file[x].name + "')";
                        database.query(sql, function (err, result) {
                            if (err) {
                                throw err;
                            }
                            //console.log("Image Uploaded");
                        });
                        file[x].mv('./images/img/' + file[x].name, function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                }
            }
        }

        if(file.length == undefined){
            fileExt = file.name.split('.');
            actualFileExt = fileExt[1].toLowerCase();

            for(i=0;i<allowed.length;i++){
                if(actualFileExt == allowed[i]){
                    if(file.size <= 2000000){
                        sql = "INSERT INTO tblcarouselimg(fileName) VALUES('"+file.name+"')";
                        database.query(sql, function(err, result){
                            if(err){
                                throw err;
                            }
                            //console.log("Image Uploaded");
                        });
                        file.mv('./images/img/'+file.name, function(err){
                            if(err){
                                throw err;
                            }
                        });
                    }
                }
            }
        }
        res.redirect('/pages/#/upload-image-carousel');
//        console.log("fileExt: " + fileExt);
//        console.log("actualFileExt: ", actualFileExt);
    }
});

app.post('/loadMenu', function (req, res) {
    'use strict';
    var content = '', sql;
    console.log("position: "+req.body.position);
    
    if (req.body.position === "Manager") {
        content += '<li data-ng-show="navigation.manager" class="menu__item" role="menuitem"><a class="menu__link" href="#/dashboard-manager"><i class="fa fa-tachometer-alt"></i> Manager Dashboard</a></li>';
    } else if (req.body.position === "Reporting Officer") {
        content += '<li data-ng-show="navigation.officer" class="menu__item" role="menuitem"><a class="menu__link" href="#/dashboard-officer"><i class="fa fa-tachometer-alt"></i> Officer Dashboard</a></li>';
    }
    
    sql = "SELECT tblmanagement.mgmtName, tblaccess.status FROM tblaccess INNER JOIN tblmanagement ON tblmanagement.mgmtID = tblaccess.mgmtID JOIN tblposition ON tblposition.positionID = tblaccess.positionID WHERE tblposition.positionName = '" + req.body.position + "' AND tblaccess.status = 'A'";
    
    database.query(sql, function (err, result) {
        result.forEach(function (key, value) {
            if ((key.mgmtName).indexOf("view") !== -1 || (key.mgmtName).indexOf("upload") !== -1 || (key.mgmtName).indexOf("send") !== -1 || (key.mgmtName).indexOf("approve") !== -1 || (key.mgmtName).indexOf("lgview") !== -1 || (key.mgmtName).indexOf("bdview") !== -1) {
                content += f.menuItem(key.mgmtName, key.status);
            }
        });
        
        content += '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/logout"><i class="fa fa-power-off"></i> Logout</a></li>';
        
        res.json({"content": content});
        res.end();
    });
    
});

app.post('/getAreaLngLat', function (req, res) {
    'use strict';
    var sql = "SELECT longitude, latitude FROM tblarea WHERE areaID = '" + req.body.areaCode + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/updateAreaLngLat', function (req, res) {
    'use strict';
    var sql = "UPDATE tblarea SET longitude = '" + req.body.lng + "', latitude = '" + req.body.lat + "' WHERE areaID = '" + req.body.areaCode + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        result.type = "success";
        result.msg = "Area's Longitude and Latitude has been added";
        res.json(result);
    });
}); // Complete

// Visualization Management
app.post('/getDataVisualization', function (req, res) {
    'use strict';
    
    var sql = "SELECT a.areaID, a.areaName, r.reportCollectionDate, r.operationTimeStart, r.operationTimeEnd, r.garbageAmount, r.completionStatus FROM tblreport r INNER JOIN tblarea a ON r.areaID = a.areaID WHERE r.reportCollectionDate BETWEEN '" + req.body.dateStart + "' AND '" + req.body.dateEnd + "' ORDER BY r.reportCollectionDate";
    
    if (req.body.zoneID !== '') {
        sql = "SELECT a.areaID, a.areaName, r.reportCollectionDate, r.operationTimeStart, r.operationTimeEnd, r.garbageAmount, r.completionStatus FROM tblreport r INNER JOIN tblarea a ON r.areaID = a.areaID WHERE r.reportCollectionDate BETWEEN '" + req.body.dateStart + "' AND '" + req.body.dateEnd + "' AND a.zoneID = '" + req.body.zoneID + "' ORDER BY r.reportCollectionDate";
    }
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getDataVisualizationGroupByDate', function (req, res) {
    'use strict';
    
    var sql = "SELECT r.reportCollectionDate, SUM(r.operationTimeStart) AS 'operationTimeStart', SUM(r.operationTimeEnd) AS 'operationTimeEnd', SUM(r.garbageAmount) AS 'garbageAmount' FROM tblreport r INNER JOIN tblarea a ON  r.areaID = a.areaID WHERE r.reportCollectionDate BETWEEN '" + req.body.dateStart + "' AND '" + req.body.dateEnd + "' GROUP BY r.reportCollectionDate ORDER BY r.reportCollectionDate";
    
    if (req.body.zoneID !== '') {
        sql = "SELECT r.reportCollectionDate, SUM(r.operationTimeStart) AS 'operationTimeStart', SUM(r.operationTimeEnd) AS 'operationTimeEnd', SUM(r.garbageAmount) AS 'garbageAmount' FROM tblreport r INNER JOIN tblarea a ON  r.areaID = a.areaID WHERE r.reportCollectionDate BETWEEN '" + req.body.dateStart + "' AND '" + req.body.dateEnd + "' AND a.zoneID = '" + req.body.zoneID + "' GROUP BY r.reportCollectionDate ORDER BY r.reportCollectionDate";
    }
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//get count
app.get('/getCount', function (req, res) {
    'use strict';
    var results = {};
    
    f.waterfallQuery("SELECT COUNT(*) AS zone FROM tblzone").then(function (zone) {
        results.zone = zone.zone;
        return f.waterfallQuery("SELECT COUNT(*) AS area FROM tblarea");
    }).then(function (area) {
        results.area = area.area;
        return f.waterfallQuery("SELECT COUNT(*) AS acr FROM tblacr");
    }).then(function (acr) {
        results.acr = acr.acr;
        return f.waterfallQuery("SELECT COUNT(*) AS bin FROM tblbincenter");
    }).then(function (bin) {
        results.bin = bin.bin;
        return f.waterfallQuery("SELECT COUNT(*) AS truck FROM tbltruck");
    }).then(function (truck) {
        results.truck = truck.truck;
        return f.waterfallQuery("SELECT COUNT(*) AS staff FROM tblstaff");
    }).then(function (staff) {
        results.staff = staff.staff;
        return f.waterfallQuery("SELECT COUNT(*) AS complaint FROM tblcomplaint WHERE status != 'c'");
    }).then(function (complaint) {
        results.complaint = complaint.complaint;
        return f.waterfallQuery("SELECT COUNT(*) AS completeReport FROM tblreport WHERE completionStatus = 'N' AND DATE(creationDateTime)= CURRENT_DATE");
    }).then(function (completeReport) {
        results.completeReport = completeReport.completeReport;
        return f.waterfallQuery("SELECT COUNT(*) AS incompleteReport FROM tblreport WHERE completionStatus = 'A'");
    }).then(function (incompleteReport) {
        results.incompleteReport = incompleteReport.incompleteReport;
        res.json(results);
        res.end();
    });
});

app.post('/getTodayAreaCount', function (req, res) {
    'use strict';
    var sql = "SELECT COUNT(*) AS todayAreaCount FROM tblarea WHERE collection_frequency LIKE '%" + req.body.day + "%'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/getUnsubmitted', function (req, res) {
    'use strict';
    
    var sql = "SELECT DISTINCT CONCAT(tblzone.zoneCode,tblarea.areaCode) AS area, tblstaff.staffName AS staff FROM tblarea INNER JOIN tblstaff ON tblarea.staffID = tblstaff.staffID JOIN tblzone on tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaID NOT IN (SELECT tblreport.areaID FROM tblreport WHERE DATE(tblreport.creationDateTime) = CURDATE()) AND tblarea.collection_frequency LIKE '%" + req.body.day + "%'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getSubmitted', function (req, res) {
    'use strict';
    
    var sql = "SELECT DISTINCT CONCAT(tblzone.zoneCode,tblarea.areaCode) AS area, tblstaff.staffName AS staff FROM tblarea INNER JOIN tblstaff ON tblarea.staffID = tblstaff.staffID JOIN tblzone on tblarea.zoneID = tblzone.zoneID INNER JOIN tblreport ON tblreport.areaID = tblarea.areaID WHERE tblarea.collection_frequency LIKE '%" + req.body.day + "%' AND DATE(tblreport.creationDateTime) = CURDATE()";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

app.post('/updateAreaLngLat', function (req, res) {
    'use strict';
    var sql = "UPDATE tblarea SET longitude = '" + req.body.lng + "', latitude = '" + req.body.lat + "' WHERE areaID = '" + req.body.areaCode + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete


//get all customer lng and lat
app.get('/getLngLat', function (req, res) {
    'use strict';
    
    var sql = "SELECT longitude, latitude FROM tblbins";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
//        SELECT serialNo, longitude, latitude, mystatus FROM (SELECT serialNo, latitude, longitude, 'NOT COLLECTED' AS mystatus FROM tblbins WHERE serialNo NOT IN (SELECT serialNo FROM tbltag WHERE date = CURRENT_DATE) UNION ALL SELECT serialNo, latitude, longitude, 'COLLECTED' AS mystatus FROM tbltag WHERE serialNo NOT IN (SELECT serialNo FROM tblbins WHERE serialNo NOT IN (SELECT serialNo FROM tbltag WHERE date = CURRENT_DATE))) AS t ORDER BY serialNo
    });
});

//get lng and lat of collected customer's bin 
app.get('/getCollectedLngLat', function (req, res) {
    'use strict';
    var sql = "SELECT tblbins.longitude AS longitude, tblbins.latitude AS latitude FROM tblbins JOIN tbltag on tblbins.serialNo = tbltag.serialNo WHERE tbltag.date = CURDATE()";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        res.end();
    });
});

app.get('/livemap', function (req, res) {
    'use strict';
    
    var sql = "SELECT serialNo, longitude, latitude, status FROM (SELECT serialNo, latitude, longitude, 'NOT COLLECTED' AS status FROM tblbins WHERE serialNo NOT IN (SELECT serialNo FROM tbltag WHERE date >= CURRENT_DATE) UNION ALL SELECT b.serialNo, b.latitude, b.longitude, 'COLLECTED' AS status FROM tbltag t, tblbins b WHERE b.serialNo NOT IN (SELECT serialNo FROM tblbins WHERE serialNo NOT IN (SELECT serialNo FROM tbltag WHERE date >= CURRENT_DATE))) AS t ORDER BY serialNo";
    
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

app.get('/insertTag', function (req, res) {
    'use strict';

    f.waterfallQuery("SELECT truckID FROM tbltruck WHERE truckNum = '" + req.query.truckID + "'").then(function (truck) {
        var sql = "INSERT INTO tbltag (date, serialNo, truckID, longitude, latitude) VALUES ('" + req.query.date + "', '" + req.query.serialNo + "', '" + truck.truckID + "', '" + req.query.longitude + "', '" + req.query.latitude + "')";
        database.query(sql, function (err, result) {
            if (err) {
                res.end();
                throw err;
            } else {
                console.log("Tag inserted:{'" + req.query.date + "', '" + req.query.serialNo + "', '" + req.query.truckID + "', '" + req.query.longitude + "', '" + req.query.latitude + "'}");
                emitter.emit('live map');
                res.end();
            }
        });
    });
});

//app.post('/emailandupdate', function (req, res) {
//    'use strict';
//    var transporter, subject, text, email, mailOptions;
//    
//    transporter = nodemailer.createTransport({
//        service: 'gmail',
//        auth: {
//            user: process.env.EMAIL,
//            pass: process.env.PASSWORD
//        }
//    });
////    
////    var subject = "testinggg using nodemailer";
////    var text = "testinggg";
////    var email = "lshong9899@gmail.com";
//        
//    subject = req.body.subject;
//    text = req.body.text;
//    email = req.body.email;
//    
//    mailOptions = {
//        from: process.env.EMAIL,
//        to: email,
//        subject: subject,
//        text: text
//    };
//
//    transporter.sendMail(mailOptions, function (error, info) {
//        if (error) {
//            console.log(error);
//        } else {
//            console.log('Email sent: ' + info.response);
////        res.json({"status": "success"});
//            var sql = "UPDATE tblcomplaint SET status = '" + req.body.status + "' WHERE complaintID = '" + req.body.id + "'";
//            database.query(sql, function (err, result) {
//                if (err) {
//                    throw err;
//                }
//                res.json({"status": "success"});
//            });
//        }
//    });
//});

////emailing service for complaint
//app.post('/emailService',function(req,res){
//    'use strict';
//    console.log("testing");
//    var transporter = nodemailer.createTransport({
//      service: 'gmail',
//      auth: {
//        user: process.env.EMAIL,
//        pass: process.env.PASSWORD
//      }
//    });
////    
////    var subject = "testinggg using nodemailer";
////    var text = "testinggg";
////    var email = "lshong9899@gmail.com";
//        
//    var subject = req.body.subject;
//    var text = req.body.text;
//    var email = req.body.email;
//    
//    var mailOptions = {
//      from: process.env.EMAIL,
//      to: email,
//      subject: subject,
//      text: text
//    };
//
//    transporter.sendMail(mailOptions, function(error, info){
//      if (error) {
//        console.log(error);
//      } else {
//        console.log('Email sent: ' + info.response);
//          res.json({"status": "success"});
//      }
//    });
//    
//});

server.listen(process.env.PORT || SVR_PORT, function () {
    'use strict';
    console.log('Server is running on port ' + SVR_PORT);
});

app.use('/', requestHandler);
app.use('/', accountManagement);
app.use('/', acrManagement);
app.use('/', areaManagement);
app.use('/', bincenterManagement);
app.use('/', reportManagement);
app.use('/', roleManagement);
app.use('/', truckManagement);
app.use('/', zoneManagement);
app.use('/', transactionLog);
app.use('/', authorization);
app.use('/', databaseBinManagement);
app.use('/', binInventoryManagement);
app.use('/', chatManagement);
app.use('/', deliveryManagement);
app.use('/', damagedBin);
app.use('/', formAuthorization);
app.use('/', boundaryManagement);
app.use('/', socketManagement);
app.use('/', complaintManagement);
app.use('/', custApp);
