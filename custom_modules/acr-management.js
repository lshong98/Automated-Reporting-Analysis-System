var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// ACR Management
app.post('/addAcr',function(req,res){
    'use strict';
    var i, days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    
    f.makeID("acr", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblacr (acrID, acrName, acrPhoneNo, acrAddress, acrPeriod, acrStatus, creationDateTime) VALUE ('" + ID + "', '" + req.body.name + "' , '" + req.body.phone + "', '" + req.body.address + "', '" + req.body.enddate + "', 'A', '" + req.body.creationDate + "')";
        var acrID = ID;
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            for (i = 0; i < days.length; i += 1) {
                if (req.body.days[days[i]] != undefined) {
                    var sql = "INSERT INTO tblacrfreq (acrID, areaID, day) VALUE ('" + acrID + "', '" + req.body.area + "', '" + days[i] + "')";
                    database.query(sql, function (err, result) {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
            res.json({"status": "success", "message": "ACR created!", "details": {"acrID": acrID}});
        });
    });
}); // Complete
app.get('/getAllAcr', function(req,res){
    'use strict';
    
    var sql = "SELECT DISTINCT a.acrID AS id, a.acrName AS name, a.acrPhoneNo AS phone, a.acrAddress AS address, DATE_FORMAT(a.acrPeriod, '%d %M %Y') as enddate, c.areaName as area,(CASE WHEN a.acrStatus = 'A' THEN 'ACTIVE' WHEN a.acrStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblacr a INNER JOIN tblacrfreq b ON a.acrID = b.acrID INNER JOIN tblarea c ON c.areaID = b.areaID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.get('/getScheduleList', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblacr.acrName AS name, GROUP_CONCAT(tblacrfreq.day) AS days FROM tblacr JOIN tblacrfreq ON tblacr.acrID = tblacrfreq.acrID GROUP BY tblacr.acrID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        res.end();
    });
});

module.exports = app;