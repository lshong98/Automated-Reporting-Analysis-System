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
    
    var log = [],
        zone_id = req.body.zone.id,
        in_charge_staff_id = req.body.staff.id,
        driver_id = req.body.driver.id,
        area_name = req.body.name,
        area_code = req.body.code,
        transporter = req.body.transporter,
        branch = req.body.branch,
        created_on = req.body.creationDate,
        staff_id = req.body.iam;
    
    f.makeID("area", req.body.creationDate).then(function (ID) {
        var sql = "INSERT INTO tblarea (areaID, zoneID, staffID, driverID, areaName, areaCode, transporter, branch, creationDateTime, areaStatus) VALUE ('" + ID + "', '" + zone_id + "', '" + in_charge_staff_id + "', '" + driver_id + "', '" + area_name + "', '" + area_code + "','" + transporter + "', '" + branch + "', '" + created_on + "', 'A')";
        
        f.sendForAuthorization(created_on, staff_id, "add", "Create new area", ID, "tblarea", "\"" + sql + "\"");
        
        f.waterfallQuery("SELECT s.staffName AS name, p.positionName AS positoin FROM tblstaff s JOIN tblposition p ON s.positionID = p.positionID WHERE s.staffID = '" + staff_id + "' LIMIT 0, 1").then(function (staff_info) {
            log.staff_name = staff_info.name;
            log.position_name = staff_info.position;
            
            var content = "";
            
            content = ""+log.staff_name+" would like to create a new area. Area details shown below:\n";
            content += 'Area Code: ' + area_code + '\n';
            content += 'Area Name: ' + area_name + '\n';
            content += 'Belonging to: ' + zone_id + '\n';
            content += 'Driver: ' + driver_id + '\n';
            content += 'Transporter: ' + transporter + '\n';
            content += 'Reporting Officer: ' + in_charge_staff_id + '\n';
            
            f.log(created_on, "Request to create new area.", content, staff_id);
            res.json({"status": "success", "message": "Request pending.."});
            res.end();
        });
    });
}); // Complete

// Load all area in management
app.get('/getAllArea', function (req, res) {
    'use strict';
    var sql = "SELECT a.areaID AS id, a.areaCode AS code, a.areaName AS name, z.zoneID as zone, z.zoneCode as zoneCode, z.zoneName as zoneName, s.staffID as staff, s.staffName as staffName, collection_frequency as collectionFrequency, a.transporter as transporter, (CASE WHEN areaStatus = 'A' THEN 'ACTIVE' WHEN areaStatus = 'I' THEN 'INACTIVE' END) as status FROM tblarea a INNER JOIN tblzone z ON a.zoneID = z.zoneID INNER JOIN tblstaff s ON a.staffID = s.staffID ORDER BY areaID DESC";
    
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
    var sql = "SELECT tblzone.zoneID AS zoneID, tblzone.zoneName AS zoneName, GROUP_CONCAT(tblarea.areaID) AS id, GROUP_CONCAT(tblarea.areaName) AS name, GROUP_CONCAT(CONCAT(tblzone.zoneCode, tblarea.areaCode)) AS code,  GROUP_CONCAT((CASE WHEN tblarea.transporter = '0' THEN 'N/A' WHEN tblarea.transporter = '1' THEN 'TS' WHEN tblarea.transporter = '2' THEN 'TAK' WHEN tblarea.transporter = '3' THEN 'MP' END)) AS subcon,MAX(tblarea.branch) AS branch FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID WHERE tblarea.areaStatus = 'A' GROUP BY tblzone.zoneID";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete
//for staff list in area management

app.get('/getAreaCFList', function(req, res){
    'use strict';

    var sql = "SELECT tblarea.areaID, CONCAT(tblzone.zoneCode, tblarea.areaCode) AS code, tblarea.collection_frequency AS 'cf' FROM tblzone JOIN tblarea ON tblzone.zoneID = tblarea.zoneID";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
})

app.get('/getReportingOfficerList', function (req, res) {
    'use strict';
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name FROM tblstaff INNER JOIN tblaccess ON tblstaff.positionID = tblaccess.positionID INNER JOIN tblmanagement ON tblmanagement.mgmtID = tblaccess.mgmtID WHERE tblmanagement.mgmtName = 'create reporting' AND tblaccess.status = 'A' AND tblstaff.staffStatus = 'A'";
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
    
    var information = [],
        dt = dateTime.create().format('Y-m-d H:M:S'),
        area_id = req.body.id,
        area_name = req.body.name,
        area_code = req.body.code,
        driver_id = req.body.driver,
        transporter = req.body.transporter,
        collection_frequency = req.body.frequency,
        branch = req.body.branch,
        area_status = req.body.status === "Active" ? 'A' : 'I',
        staff_id = req.body.iam;
    
    f.waterfallQuery("SELECT s.staffID, z.zoneID FROM tblstaff s, tblzone z WHERE s.staffName = '" + req.body.staff + "' AND z.zoneName = '" + req.body.zone + "' LIMIT 0, 1").then(function (id) {
        information.staffID = id.staffID;
        information.zoneID = id.zoneID;
        return f.waterfallQuery("SELECT * FROM tblarea WHERE areaID = '" + area_id + "' LIMIT 0, 1");
    }).then(function (original_information) {
        information.original = original_information;
        return f.waterfallQuery("SELECT s.staffName AS name, p.positionName AS position FROM tblstaff s JOIN tblposition p ON s.positionID = p.positionID WHERE s.staffID = '" + staff_id + "' LIMIT 0, 1");
    }).then(function (staff_info) {
        information.staff_name = staff_info.name;
        information.position_name = staff_info.position;
        
        var sql = "UPDATE tblarea SET areaName = '" + area_name.replace(/'/g,"\\\\\'") + "', areaCode = '" + area_code.replace(/'/g,"\\\\\'") + "', zoneID = '" + information.zoneID + "', staffID = '" + information.staffID + "', driverID = '" + driver_id + "', transporter = '" + transporter + "', branch = '" + branch + "', collection_frequency = '" + collection_frequency + "', areaStatus = '" + area_status + "' WHERE areaID = '" + area_id + "'";
        var content = "";

        content = "" + information.staff_name + " would like to update area details. The changes shown below:\n";
        content += 'Area Code: <s>' + information.original.areaCode + '</s> to ' + area_code + '\n';
        content += 'Area Name: <s>' + information.original.areaName + '</s> to ' + area_name + '\n';
        content += 'Belonging to: <s>' + information.original.zoneID + '</s> to ' + information.zoneID + '\n';
        content += 'Collection Frequency: <s>' + information.original.collection_frequency + '</s> to ' + collection_frequency + '\n';
        content += 'Driver: <s>' + information.original.driverID + '</s> to ' + driver_id + '\n';
        content += 'Transporter: <s>' + information.original.transporter + '</s> to ' + transporter + '\n';
        content += 'Branch: <s>' + information.original.branch + '</s> to ' + branch + '\n';
        content += 'Reporting Officer: <s>' + information.original.staffID + '</s> to ' + information.staffID + '\n';
        content += 'Area Status: <s>' + information.original.areaStatus + '</s> to ' + area_status + '\n';

        f.sendForAuthorization(dt, staff_id, "update", "Update area", area_id, "tblarea", "\"" + sql + "\"");
        f.log(dt, "Request to update area details.", content, staff_id);
        res.json({"status": "success", "message": "Request pending.."});
        res.end();
    });
    
}); // Complete

// Load specific area
app.post('/thisArea', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblarea.areaID AS id, tblarea.areaCode AS code, tblarea.areaName AS name, tblarea.driverID AS driver, tblarea.transporter AS transporter, tblarea.branch AS branch, tblstaff.staffName AS staff, tblzone.zoneName AS zone, (CASE WHEN tblarea.areaStatus = 'A' THEN 'Active' WHEN tblarea.areaStatus = 'I' THEN 'Inactive' END) AS status, collection_frequency AS frequency FROM tblarea JOIN tblzone ON tblarea.zoneID = tblzone.zoneID JOIN tblstaff ON tblarea.staffID = tblstaff.staffID WHERE tblarea.areaID = '" + req.body.id + "' LIMIT 0, 1";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

// Create Area Collection
app.post('/addCollection', function (req, res) {
    'use strict';
    
    var dt = dateTime.create().format('Y-m-d H:M:S'),
    address = req.body.address.replace(/'/g,"\\'");

    var sql = "INSERT INTO tbltaman(areaID, tamanName) VALUE ('" + req.body.area + "', '" + address + "')";
    console.log(sql);
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
    

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Taman Has been deleted"});
        res.end();
    });     
    
});

// Update Area Collection
app.post('/updateCollection', function (req, res) {
    'use strict';
    
    var dt = dateTime.create().format('Y-m-d H:M:S'),
        sql = "UPDATE tbltaman SET tamanName = '" + req.body.address + "' WHERE tamanID = '" + req.body.id + "'";

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