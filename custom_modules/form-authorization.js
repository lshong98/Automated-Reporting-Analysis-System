var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var dateTime = require('node-datetime');

app.get('/getAllForms', function (req, res) {
    'use strict';
    
    var sql = "SELECT creationDateTime as date, formID, formType, preparedBy, status from tblformauthorization WHERE status = 'P'";
    database.query(sql, function (err, result) { 
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("ALL TASKS COLLECTED"); 
    });
}); // Complete

app.post('/approveForm', function (req, res) {
    'use strict';
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    
    var sql = "UPDATE tblformauthorization SET status = 'G', authorizedBy = '" + req.body.approvedBy + "' WHERE formID = '"+ req.body.id + "'";
    var findSQL = "SELECT action, query, tblName FROM tblauthorization WHERE taskID = '" + req.body.id + "' LIMIT 0, 1";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        
        database.query(findSQL, function (err, result) {
            if (err) {
                throw err;
            }
            
            if (result[0].action == "add" && result[0].tblName == "tblstaff") {
                f.makeID("account", formatted).then(function (ID) {
                    var firstPosition = (result[0].query).indexOf('ACC');
                    var lastPosition = firstPosition + 15;
                    var oldID = (result[0].query).substring(firstPosition, lastPosition);
                    result[0].query = (result[0].query).replace(oldID, ID);
                    f.insertNewData(result[0].query, req, res);
                });
            }
        });
    });
});

app.post('/rejectForm', function (req, res) {
    'use strict';
    var sql = "UPDATE tblformauthorization SET authorize = 'R', authorizedBy = '" + req.body.approvedBy + "' WHERE formID = '"+ req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Form Rejected", "details": {"formID": req.body.formID}});
    });
});

app.post('/getFormDetails', function (req, res) {
    'use strict';
    var sql = "select preparedBy, creationDateTime from tbl"  + req.body.formType + " where " + req.body.formType + "ID = '" + req.body.formID + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("Get PreparedBy: " + result);
    });
});

app.post('/getFormStatus', function (req, res) {
    'use strict';
    var sql = "select status from tbl"  + req.body.formType + " where " + req.body.formType + "ID = '" + req.body.formID + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("Get Status: " + result);
    });
});

app.post('/sendFormForAuthorization', function (req, res) {
    'use strict';

    console.log(req.body);
    var sql = "insert into tblformauthorization (formID, formType, tblname, preparedBy, status) value ('" + req.body.formID + "', '" + req.body.formType + "', 'tbl" + req.body.formType + "', '" + req.body.preparedBy + "', 'P')";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Task sent for Authorization!", "details": {"formID": req.body.formID}});
    });

    var updatesql = "update tbl" + req.body.formType + " set status = 'P' where " + req.body.formType + "ID = '" + req.body.formID + "'";

    database.query(updatesql, function (err, result) {
        if (err) {
            throw err;
        }
    });
});

module.exports = app;