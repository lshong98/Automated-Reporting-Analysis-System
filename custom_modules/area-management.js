var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// Area Management
app.post('/addArea', function (req, res) {
    'use strict';
    f.makeID("area", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblarea (areaID, zoneID, staffID, areaName, creationDateTime, areaStatus) VALUE ('" + ID + "', '" + req.body.zone.id + "', '" + req.body.staff.id + "', '" + req.body.name + "', '" + req.body.creationDate + "', 'A')";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "details": {"areaID": ID}});
        });
    });
}); // Complete
app.get('/getAllArea', function (req, res) {
    'use strict';
    var sql = "SELECT a.areaID AS id, a.areaName AS name, z.zoneID as zone, z.zoneName as zoneName, s.staffID as staff, s.staffName as staffName, collection_frequency as collectionFrequency, (CASE WHEN areaStatus = 'A' THEN 'ACTIVE' WHEN areaStatus = 'I' THEN 'INACTIVE' END) as status FROM tblarea a INNER JOIN tblzone z ON a.zoneID = z.zoneID INNER JOIN tblstaff s ON a.staffID = s.staffID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
app.get('/getAreaList', function (req, res) {
    'use strict';
    var sql = "SELECT tblzone.zoneID AS zoneID, tblzone.zoneName AS zoneName, GROUP_CONCAT(tblarea.areaID) AS id, GROUP_CONCAT(tblarea.areaName) AS name FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaStatus = 'A' GROUP BY tblzone.zoneID";
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
app.post('/updateArea',function(req,res){
    'use strict';
    
    var sql = "SELECT staffID FROM tblstaff WHERE staffName = '" + req.body.staff + "' LIMIT 0, 1";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        var staffID = result[0].staffID;
        
        var sql = "SELECT zoneID FROM tblzone WHERE zoneName = '" + req.body.zone + "' LIMIT 0, 1";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            var zoneID = result[0].zoneID;
            
            req.body.status = req.body.status == 'Active' ? 'A' : 'I';
            var sql = "UPDATE tblarea SET areaName = '" + req.body.name+ "', zoneID = '" + zoneID + "', staffID = '" + staffID +"', collection_frequency = '" + req.body.frequency + "', areaStatus = '" + req.body.status + "' WHERE areaID = '"+ req.body.id + "'";
            
            database.query(sql, function (err, result) {
                if (err) {
                    res.json({"status": "error", "message": "Update failed."});
                    throw err;
                }
                res.json({"status": "success", "message": "Area Information Updated."});
            });
        });
    });
}); // Complete
app.post('/thisArea', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblarea.areaID AS id, tblarea.areaName AS name, tblstaff.staffName AS staff, tblzone.zoneName AS zone, (CASE WHEN tblarea.areaStatus = 'A' THEN 'Active' WHEN tblarea.areaStatus = 'I' THEN 'Inactive' END) AS status, collection_frequency AS frequency FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID JOIN tblstaff ON tblarea.staffID = tblstaff.staffID WHERE tblarea.areaID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/addCollection', function (req, res) {
    'use strict';
    
    var sql = "INSERT INTO tbltaman(areaID, tamanName) VALUE ('" + req.body.area + "', '" + req.body.address + "')";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Taman Added!", "details": {"id": result.insertId}});
    });
});
app.post('/getCollection', function (req, res){
    'use strict';

    var sql = "SELECT tamanID AS id, tamanName AS address FROM tbltaman WHERE areaID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        res.end();
    });
});
app.post('/deleteCollection', function (req, res) {
    'user strict';
    
    var sql = "DELETE FROM tbltaman WHERE tamanID = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Delete successfully!"});
    });
});
app.post('/updateCollection', function (req, res) {
    'use strict';
    
    var sql = "UPDATE tbltaman SET tamanName = '" + req.body.address + "' WHERE tamanID = '" + req.body.id + "'";
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "taman updated!"});
    });
});

module.exports = app;