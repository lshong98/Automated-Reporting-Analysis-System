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
        console.log("ALL FORMS COLLECTED"); 
    });
}); // Complete

app.post('/approveForm', function (req, res) {
    'use strict';
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    
    
    var sql = "UPDATE tblformauthorization SET status = 'G' WHERE formID = '"+ req.body.formID + "'";
    var formsql = "UPDATE tbl" + req.body.formType + " set status = 'G', authorizedBy = '" + req.body.authorizedBy + "' where " + req.body.formType + "ID = '"+ req.body.formID + "'";
    
    console.log(sql);
    console.log(formsql); 
    console.log(req.body.formID);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        
        database.query(formsql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "message": "Form Rejected", "details": {"formID": req.body.formID}});
        });
    });
});

app.post('/rejectForm', function (req, res) {
    'use strict';
    var sql = "UPDATE tblformauthorization SET status = 'R' WHERE formID = '"+ req.body.formID + "'";
    var formsql = "UPDATE tbl" + req.body.formType + " set status = 'R', authorizedBy = '" + req.body.authorizedBy + "' where " + req.body.formType + "ID = '"+ req.body.formID + "'";
    
    console.log(sql);
    console.log(formsql); 
    console.log(req.body.formID);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        
        database.query(formsql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({"status": "success", "message": "Form Rejected", "details": {"formID": req.body.formID}});
        });
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