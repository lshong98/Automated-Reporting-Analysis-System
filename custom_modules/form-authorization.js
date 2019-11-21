/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var dateTime = require('node-datetime');


app.post('/checkForm', function (req, res) {
    'use strict';
    var dt = dateTime.create(),
        formatted = dt.format('Y-m-d H:M:S'),
        sql = "UPDATE tbl" + req.body.formType + " set status = 'K', authorizedDate = '" + formatted + "', authorizedBy = '" + req.body.authorizedBy + "' where " + req.body.formType + "ID = '" + req.body.formID + "'";


    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({
            "status": "success",
            "message": "Form Checked",
            "details": {
                "formID": req.body.formID
            }
        });
    });
});

app.post('/verifyForm', function (req, res) {
    'use strict';
    var dt = dateTime.create(),
        formatted = dt.format('Y-m-d H:M:S'),
        sql = "UPDATE tbl" + req.body.formType + " set status = 'C', verifiedDate = '" + formatted + "', verifiedBy = '" + req.body.verifiedBy + "' where " + req.body.formType + "ID = '" + req.body.formID + "'";


    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({
            "status": "success",
            "message": "Form Verified",
            "details": {
                "formID": req.body.formID
            }
        });
    });
});



app.post('/rejectForm', function (req, res) {
    'use strict';

        var sql = "UPDATE tbl" + req.body.formType + " set status = 'R', feedback = '" + req.body.feedback + "' where " + req.body.formType + "ID = '" + req.body.formID + "'";

        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json({
                "status": "success",
                "message": "Form Rejected",
                "details": {
                    "formID": req.body.formID
                }
            });
        });
});

app.post('/getFormDetails', function (req, res) {
    'use strict';
    var sql = "select preparedBy, creationDateTime from tbl" + req.body.formType + " where " + req.body.formType + "ID = '" + req.body.formID + "'";
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
    var sql = "select status from tbl" + req.body.formType + " where " + req.body.formType + "ID = '" + req.body.formID + "'";
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
    var sql = "update tbl" + req.body.formType + " set status = 'P' where " + req.body.formType + "ID = '" + req.body.formID + "'";

    console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.json({
            "status": "success",
            "message": "Task sent for Authorization!",
            "details": {
                "formID": req.body.formID
            }
        });
    });
});

app.post('/sendFormForVerification', function (req, res) {
    'use strict';

    var sql = "update tbl" + req.body.formType + " set status = 'K' where " + req.body.formType + "ID = '" + req.body.formID + "'";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.json({
            "status": "success",
            "message": "Task sent for Verfication!",
            "details": {
                "formID": req.body.formID
            }
        });
    });
});


// app.get('/getAllForms', function (req, res) {
//     'use strict';

//     var sql = "SELECT creationDateTime as date, dcsID as formID, preparedBy, authorizedBy, status from tbldcs WHERE status != 'I' AND status != 'C' AND status !='A' UNION SELECT creationDateTime as date, bdafID as formID, preparedBy, authorizedBy, status from tblbdaf WHERE status != 'I' AND status != 'C' AND status !='A' UNION SELECT creationDateTime as date, blostID as formID, preparedBy, authorizedBy, status from tblblost WHERE status != 'I' AND status != 'C' AND status !='A'";
//     database.query(sql, function (err, result) {
//         if (err) {
//             throw err;
//         }
//         res.json(result);
//         console.log("ALL FORMS COLLECTED");
//     });
// }); // Complete

// app.get('/getAllCompletedBdaf', function (req, res) {
//     'use strict';

//     var sql = "SELECT creationDateTime as date, bdafID, preparedBy, authorizedBy, status from tblbdaf WHERE status != 'I' AND status != 'C' AND status !='A' UNION SELECT creationDateTime as date, bdafID as formID, preparedBy, authorizedBy, status from tblbdaf WHERE status != 'I' AND status != 'C' AND status !='A' UNION SELECT creationDateTime as date, blostID as formID, preparedBy, authorizedBy, status from tblblost WHERE status != 'I' AND status != 'C' AND status !='A'";
//     database.query(sql, function (err, result) {
//         if (err) {
//             throw err;
//         }
//         res.json(result);
//         console.log("ALL FORMS COLLECTED");
//     });
// }); // Complete

// app.get('/getAllCheckedBdaf', function (req, res) {
//     'use strict';

//     var sql = "SELECT creationDateTime as date, dcsID as formID, preparedBy, authorizedBy, status from tbldcs WHERE status != 'I' AND status != 'C' AND status !='A' UNION SELECT creationDateTime as date, bdafID as formID, preparedBy, authorizedBy, status from tblbdaf WHERE status != 'I' AND status != 'C' AND status !='A' UNION SELECT creationDateTime as date, blostID as formID, preparedBy, authorizedBy, status from tblblost WHERE status != 'I' AND status != 'C' AND status !='A'";
//     database.query(sql, function (err, result) {
//         if (err) {
//             throw err;
//         }
//         res.json(result);
//         console.log("ALL FORMS COLLECTED");
//     });
// }); // Complete

// app.get('/getAllCompletedBlost', function (req, res) {
//     'use strict';

//     var sql = "SELECT creationDateTime as date, blostID as formID, preparedBy, status from tblblost WHERE status != 'I' AND status != 'C' AND status !='A'";
//     database.query(sql, function (err, result) {
//         if (err) {
//             throw err;
//         }
//         res.json(result);
//         console.log("ALL FORMS COLLECTED");
//     });
// }); // Complete
module.exports = app;