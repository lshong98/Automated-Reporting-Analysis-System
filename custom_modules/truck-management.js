var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// Truck Management
app.post('/addTruck', function (req, res) {
    'use strict';
    f.makeID("truck", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tbltruck (truckID, transporter, truckTon, truckNum, truckExpiryStatus, creationDateTime, truckStatus) VALUE ('" + ID + "', '" + req.body.transporter + "', '" + req.body.ton + "', '" + req.body.no + "', '" + req.body.roadtax + "', '" + req.body.creationDate + "', 'A')";
        database.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "details": {"truckID": ID}});
        });
    });
}); // Complete
app.post('/editTruck', function (req, res) {
    'use strict';
    
    req.body.status = req.body.status == "ACTIVE" ? 'A' : 'I';
    
    var sql = "UPDATE tbltruck SET transporter = '" + req.body.transporter + "', truckTon = '" + req.body.ton + "', truckNum = '" + req.body.no + "', truckExpiryStatus = '" + req.body.roadtax + "', truckStatus = '" + req.body.status + "' WHERE truckID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            res.json({"status": "error", "message": "Something wrong!"});
            throw err;
        }
        res.json({"status": "success", "message": "Truck edited!"});
    });
}); // Complete
app.get('/getTruckList', function (req, res) {
    'use strict';
    var sql = "SELECT truckID AS id, truckNum AS no FROM tbltruck WHERE truckStatus = 'A'";
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.get('/getAllTruck', function(req,res){
    'use strict';
    
    var sql = "SELECT truckID AS id, transporter, truckTon AS ton, truckNum AS no, truckExpiryStatus AS roadtax, (CASE WHEN truckStatus = 'A' THEN 'ACTIVE' WHEN truckStatus = 'I' THEN 'INACTIVE' END) AS status FROM tbltruck";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

module.exports = app;