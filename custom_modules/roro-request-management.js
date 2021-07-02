/*jslint node:true*/
var variable = require('../variable');
var express = variable.express;
var app = express();
var database = require('./database-management');
// var f = require('./function-management');

//This is an example of post request, allow others to send in data
app.post('/addRoroRequest', function(req,res){
    'use strict';
    
    //you can get the sent data in 'req' parameter
    //received data must be in json format like below
    //{"reqDate": "2021-06-06", "address": "Taman ABC", "remarks": "My Remarks", "type": "1", "userID": "20", "status": "1", "amount":"1", "size":"16"}

    //you can get your json data in this way
    //req.body.[YOURJSONKEY]
    
    //for example this is an add roro request from the mobile app
    //once user submit the form
    //you have to call this post request so it will insert data into our database
    //so first, you create your sql first
    var sql = "INSERT INTO tblrororequest (reqDate, address, remarks, type, userID, status, amount, size, recordDate) VALUE ('" + req.body.reqDate + "', '" + req.body.address + "', '" + req.body.remarks + "', '" + req.body.type + "', '" + req.body.userID + "', '" + req.body.status + "', '" + req.body.amount + "', '" + req.body.size + "', NOW())";

    //then run your sql
    database.query(sql, function(err, result) {
        //if any error it will show in your terminal
        if (err) {
            throw err;
        }
        //if no then it will reaponse a success status back to the caller
        //this is just an example of response, you can create your own
        res.json({"status":"success"});
    });
});

//This is an example of get request, not allow others to send in data
app.get('/getRoroRequest', function(req,res){
    'use strict';

    //for example you want to retrieve data from database
    //write your query
    var sql = "SELECT * FROM tblrororequest";

    //run it
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result); //response your resule
    });
});

module.exports = app;