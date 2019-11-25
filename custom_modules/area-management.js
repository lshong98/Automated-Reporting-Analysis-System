/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var variable = require('../variable');
var dateTime = variable.dateTime;

// Create Area
app.post('/addArea', function (req, res) {
    'use strict';
    f.makeID("area", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblarea (areaID, zoneID, staffID, driverID, areaName, areaCode, creationDateTime, areaStatus) VALUE ('" + ID + "', '" + req.body.zone.id + "', '" + req.body.staff.id + "', '" + req.body.driver.id + "', '" + req.body.name + "', '" + req.body.code + "','" + req.body.creationDate + "', 'A')";
        
        f.sendForAuthorization(req.body.creationDate, req.body.iam, "add", "Create new area", ID, "tblarea", "\"" + sql + "\"");
        f.logTransaction(req.body.creationDate, req.body.iam, "add", "Request to create new area", ID, "tblarea");
        f.log(req.body.creationDate, "Request to create new area.", req.body.iam);
        res.json({"status": "success", "message": "Request pending.."});
        res.end();
    });
}); // Complete

// Load all area in management
app.get('/getAllArea', function (req, res) {
    'use strict';
    var sql = "SELECT a.areaID AS id, a.areaCode AS code, a.areaName AS name, z.zoneID as zone, z.zoneCode as zoneCode, z.zoneName as zoneName, s.staffID as staff, s.staffName as staffName, collection_frequency as collectionFrequency, (CASE WHEN areaStatus = 'A' THEN 'ACTIVE' WHEN areaStatus = 'I' THEN 'INACTIVE' END) as status FROM tblarea a INNER JOIN tblzone z ON a.zoneID = z.zoneID INNER JOIN tblstaff s ON a.staffID = s.staffID";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

// Used in comboBox - Zone with area
app.get('/getAreaList', function (req, res) {
    'use strict';
    var sql = "SELECT tblzone.zoneID AS zoneID, tblzone.zoneName AS zoneName, GROUP_CONCAT(tblarea.areaID) AS id, GROUP_CONCAT(tblarea.areaName) AS name, GROUP_CONCAT(CONCAT(tblzone.zoneCode, tblarea.areaCode)) AS code FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaStatus = 'A' GROUP BY tblzone.zoneID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.get('/getAreaCodeList', function (req, res) {
    'use strict';
    var sql = "SELECT CONCAT(tblzone.zoneCode, tblarea.areaCode) AS code, tblarea.areaID FROM tblzone JOIN tblarea ON tblzone.zoneID = tblarea.areaID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getAreaCode', function (req, res) {
    'use strict';
    var sql = "SELECT CONCAT(tblzone.zoneCode, tblarea.areaCode) AS code FROM tblzone JOIN tblarea ON tblzone.zoneID = tblarea.zoneID WHERE tblarea.areaID = '" + req.body.areaID + "' ";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

// Update specific area information
app.post('/updateArea', function (req, res) {
    'use strict';
    
    var information = {},
        dt = dateTime.create().format('Y-m-d H:M:S');
    
    f.waterfallQuery("SELECT staffID FROM tblstaff WHERE staffName = '" + req.body.staff + "' LIMIT 0, 1").then(function (staffID) {
        information.staffID = staffID.staffID;
        return f.waterfallQuery("SELECT zoneID FROM tblzone WHERE zoneName = '" + req.body.zone + "' LIMIT 0, 1");
    }).then(function (zoneID) {
        information.zoneID = zoneID.zoneID;
        req.body.status = req.body.status === "Active" ? 'A' : 'I';
        
        var sql = "UPDATE tblarea SET areaName = '" + req.body.name + "', areaCode = '" + req.body.code + "', zoneID = '" + information.zoneID + "', staffID = '" + information.staffID + "', driverID = '" + req.body.driver + "', collection_frequency = '" + req.body.frequency + "', areaStatus = '" + req.body.status + "' WHERE areaID = '" + req.body.id + "'";
        
        f.sendForAuthorization(dt, req.body.iam, "update", "Update area", req.body.id, "tblarea", "\"" + sql + "\"");
        //f.logTransaction(dt, req.body.iam, "update", "Request to update area", req.body.id, "tblarea");
        f.log(dt, "Request to update area.", req.body.iam);
        res.json({"status": "success", "message": "Request pending.."});
        res.end();
    });
}); // Complete

//app.post('/updateTamanSet',function (req, res){
//    'use strict';
//    
//    for(var i=0; i<req.body.length; i++){
//        var sql="INSERT INTO tbltaman(areaID, tamanName) VALUE ('" + req.body.area + "', '" + req.body.taman[i] + "')";
//        
//        database.query(sql, function (err, result) {
//            if (err) {
//                throw err;
//            }
//        });
//    }
//});

// Load specific area
app.post('/thisArea', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblarea.areaID AS id, tblarea.areaCode AS code, tblarea.areaName AS name, tblarea.driverID AS driver, tblstaff.staffName AS staff, tblzone.zoneName AS zone, (CASE WHEN tblarea.areaStatus = 'A' THEN 'Active' WHEN tblarea.areaStatus = 'I' THEN 'Inactive' END) AS status, collection_frequency AS frequency FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID JOIN tblstaff ON tblarea.staffID = tblstaff.staffID WHERE tblarea.areaID = '" + req.body.id + "' LIMIT 0, 1";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//app.post('/thisAreaDriver', function(req,res){
//    'use strict';
//    
//    var sql="SELECT tblarea.driverID AS driver FROM tblarea JOIN tblstaff ON tblarea.driverID = tblstaff.staffID WHERE tblarea.areaID = '" + req.body.id + "' LIMIT 0,1 "
//    
//    database.query(sql, function (err, result) {
//        if (err) {
//            throw err;
//        }
//        res.json(result);
//    });
//});

// Create Area Collection
app.post('/addCollection', function (req, res) {
    'use strict';
    
    var dt = dateTime.create().format('Y-m-d H:M:S'),
        sql = "INSERT INTO tbltaman(areaID, tamanName) VALUE ('" + req.body.area + "', '" + req.body.address + "')";
    
    //f.sendForAuthorization(dt, req.body.iam, "add", "Create new area collection", '', "tbltaman", "\"" + sql + "\"");
    //f.logTransaction(dt, req.body.iam, "add", "Request to create new area collection", '', "tbltaman");
    //f.log(dt, "Request to create new area collection.", req.body.iam);
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Taman Has been added"});
        res.end();
    });    
    
});

// Load Area Collection
app.post('/getCollection', function (req, res) {
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

// Delete Area Collection
app.post('/deleteCollection', function (req, res) {
    'use strict';
    
    var dt = dateTime.create().format('Y-m-d H:M:S'),
        sql = "DELETE FROM tbltaman WHERE tamanID = '" + req.body.id + "'";
    
    //f.sendForAuthorization(dt, req.body.iam, "delete", "Delete area collection", req.body.id, "tbltaman", "\"" + sql + "\"");
    //f.logTransaction(dt, req.body.iam, "delete", "Request to delete area collection", req.body.id, "tbltaman");
    //f.log(dt, "Request to delete area collection.", req.body.iam);

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Taman Has been deleted"});
        res.end();
    });     
    
//    database.query(sql, function (err, result) {
//        if (err) {
//            res.end();
//            throw err;
//        } else {
//            f.logTransaction(dt, req.body.iam, "delete", "Delete Area Collection - " + req.body.address + "", '', req.body.id, "tbltaman");
//            res.json({"status": "success", "message": "Delete successfully!"});
//            res.end();
//        }
//    });
});

// Update Area Collection
app.post('/updateCollection', function (req, res) {
    'use strict';
    
    var dt = dateTime.create().format('Y-m-d H:M:S'),
        sql = "UPDATE tbltaman SET tamanName = '" + req.body.address + "' WHERE tamanID = '" + req.body.id + "'";
    
    //f.sendForAuthorization(dt, req.body.iam, "update", "Update area collection", req.body.id, "tbltaman", "\"" + sql + "\"");
    //f.logTransaction(dt, req.body.iam, "update", "Request to update area collection", req.body.id, "tbltaman");
    //f.log(dt, "Request to update area collection.", req.body.iam);
    
//    database.query(sql, function (err, result) {
//        if (err) {
//            res.end();
//            throw err;
//        } else {
//            f.logTransaction(dt, req.body.iam, "update", "Update Area Collection - " + req.body.address + "", '', req.body.id, "tbltaman");
//            res.json({"status": "success", "message": "taman updated!"});
//            res.end();
//        }
//    });

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Taman Has been updated"});
        res.end();
    });      
});

app.post('/getGoogleLocation', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblarea.areaName AS area, tblzone.zoneName AS zone FROM tblarea INNER JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaID = '" + req.body.areaCode + "' LIMIT 0, 1";
    console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
module.exports = app;