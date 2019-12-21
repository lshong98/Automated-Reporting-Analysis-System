var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

app.get('/getBinList', function (req, res) {
    'use strict';
    console.log(req.body);
    var sql = "SELECT * from tblwheelbindatabase where activeStatus = 'A' and customerID is not null";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log(result);
    });
});

app.get('/getBinSize', function (req, res) {

    var sql = "SELECT DISTINCT concat(size, 'L') as binSize FROM tblbins"
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log(result);
    });

});

app.post('/getStaffList', function (req, res) {
    'use strict';
    console.log("GET STAFF LIST: " + req.body);

    var positionID = '';

    var sql = "SELECT positionID from tblposition WHERE positionName = '" + req.body.position + "'";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log(result[0].positionID);
        positionID = result[0].positionID;
 
        var newsql = "SELECT * from tblstaff where positionID = '" + result[0].positionID + "'";

        database.query(newsql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json(result);
            console.log("STAFF LIST: " + result);
        });
    });

});

app.get('/getCustomerList', function (req, res) {
    'use strict';
    console.log(req.body);
    var sql = "SELECT * from tblcustomer";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log(result);
    });
});

app.get('/getAcrList', function (req, res) {
    'use strict';
    console.log(req.body);
    var sql = "SELECT * from tblacr";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log(result); 
    });
});

app.post('/getUnassignedBinRequests', function (req, res) {
    'use strict';
    var sql = "SELECT reqID, if(TYPE = 'Residential',requestAddress, concat(companyName, ', ', companyAddress)) as location, name as contactPerson, contactNumber as contactNo, type, dateRequest, requestDate, reason, remarks, status FROM tblbinrequest WHERE status = 'approved'";


    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});



module.exports = app;