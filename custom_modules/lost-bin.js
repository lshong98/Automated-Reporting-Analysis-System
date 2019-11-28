/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// ACR Management
app.post('/addBlost', function (req, res) {
    'use strict';
    console.log("HELLO FROM THE SERVER");
    f.makeID("blost", req.body.creationDate).then(function (ID) {
        
        var sql = "INSERT INTO tblblost (blostID, creationDateTime, preparedBy, status) VALUE ('" + ID + "', '" + req.body.creationDate + "' , '" + req.body.preparedBy +  "', 'A')";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }

            res.json({"status": "success", "message": "BLOST created!", "details": {"blostID": ID}});
        });
    });
}); // Complete
app.post('/getAllBlost', function (req, res) {
    'use strict';
    var sql = "SELECT blostID as id, creationDateTime as date, preparedBy, authorizedBy, authorizedDate, status, feedback from tblblost";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("GET ALL BLOST: " + result);
    });
});

app.post('/getBlostInfo', function (req, res) {
    'use strict';
    //console.log("DCS ID: " + req.body.dcsID);
    var sql = "SELECT * from tblblost where blostID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.json(result);
    });
}); // Complete

app.post('/getBlostDetails', function (req, res) {
    'use strict';
    console.log("GET BLOST DETAILS:");
    
    var sql = "SELECT b.id, b.name, b.phoneNo, b.address, b.binSize, b.noOfBins, b.collectionArea, b.sharedBin, b.dateOfLoss, b.reason FROM tblblostentry b where b.blostID = '" + req.body.id + "'";
    //var sql = "SELECT DISTINCT a.acrID AS id, a.acrName AS name, a.acrPhoneNo AS phone, a.acrAddress AS address, DATE_FORMAT(a.acrPeriod, '%d %M %Y') as enddate, c.areaName as area,(CASE WHEN a.acrStatus = 'A' THEN 'ACTIVE' WHEN a.acrStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblacr a INNER JOIN tblacrfreq b ON a.acrID = b.acrID INNER JOIN tblarea c ON c.areaID = b.areaID";
    
    console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
         
        res.json(result);
        console.log(result);
    });
});
 
app.post('/addBlostEntry', function (req, res) {
    'use strict';

    var sql = "INSERT INTO tblblostentry (blostID, name, address, phoneNo, collectionArea, binSize, noOfBins, sharedBin, dateOfLoss, reason) VALUE ('" + req.body.blostID + "', '"  + req.body.name + "', '" + req.body.address + "', '"  + req.body.phoneNo + "', '" + req.body.collectionArea + "', '" + req.body.binSize + "', '" + req.body.noOfBins + "', '" + req.body.sharedBin + "', '" + req.body.formattedDateOfLoss + "', '" + req.body.reason + "')";
    console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.json({"status": "success", "message": "BLOST entry added!", "details": {"BLOSTID": req.body.blostID}});
    });
}); // Complete

app.post('/editBlostEntry', function (req, res) {
    'use strict';

    var sql = "UPDATE tblblostentry SET name = '" + req.body.name + "', address = '" +req.body.address + "', phoneNo = '" + req.body.phoneNo + "', collectionArea = '" + req.body.collectionArea + "', binSize = '" + req.body.collectionArea + "', noOfBins = '" + req.body.noOfBins + "', sharedBin = '" + req.body.sharedBin + "', dateOfLoss = '" + req.body.dateOfLoss + "', reason = '" + req.body.reason + "' WHERE id = '" + req.body.id + "'";
    console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.json({"status": "success", "message": "BLOST entry updated!", "details": {"BLOSTID": req.body.blostID}});
    });
}); // Complete


app.get('/getBlostCustomerList', function (req, res) {
    'use strict';
    console.log(req.body);
    var sql = "SELECT CONCAT(COALESCE(concat(companyName, ', '), ''), name) as name, address FROM tbluser";
    
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

app.post('/getBlostInfo', function (req, res) {
    'use strict';
    //console.log("DCS ID: " + req.body.dcsID);
    var sql = "SELECT * from tblblost where blostID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.json(result);
    });
}); // Complete

app.post('/getStaffList', function (req, res) {
    'use strict';
    console.log("GET STAFF LIST: " + req.body);
    var sql = "SELECT * from tblstaff where positionID = '" + req.body.positionID + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log(result);
    });
});

app.get('/getBinList', function (req, res) {
    'use strict';
    console.log(req.body);
    var sql = "SELECT DISTINCT * from tblwheelbindatabase where activeStatus = 'a' and customerID is not null";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log(result);
    });
});

app.post('/getAreaList', function (req, res) {
    'use strict';
    console.log("GETTING AREA LIST");
    var sql = "SELECT concat(z.zoneCode, a.areaCode) as areaCode from tblzone z inner join tblarea a on z.zoneID = a.zoneID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.json(result);

    });
}); // Complete


module.exports = app;