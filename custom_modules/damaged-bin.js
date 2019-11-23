/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');

// ADD
app.post('/addDbr', function (req, res) {
    'use strict';
    console.log("HELLO FROM THE SERVER");
    f.makeID("dbr", req.body.creationDate).then(function (ID) {
        
        var sql = "INSERT INTO tbldbr (dbrID, creationDateTime, preparedBy, companyName, address, contactPerson, phoneNo, comment, status) VALUE ('" + ID + "', '" + req.body.creationDate + "' , '" + req.body.preparedBy + "' , '" + req.body.companyName + "' , '" + req.body.address + "' , '" + req.body.contactPerson + "' , '" + req.body.phoneNo + "' , '" + req.body.comment +  "', 'A')";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }

            sql = "INSERT INTO tbldbrentry (id, dbrID) VALUES ('null', '" + ID + "'), ('null', '" + ID + "'), ('null', '" + ID + "'), ('null', '" + ID + "'), ('null', '" + ID + "')";
            database.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
            });

            res.json({"status": "success", "message": "DBR created!", "details": {"dbrID": ID}});
        });

    });
}); // Complete

app.post('/addDbd', function (req, res) {
    'use strict';
    console.log("HELLO FROM THE SERVER");
    f.makeID("dbd", req.body.creationDate).then(function (ID) {
        
        console.log("dbdID: " + ID)
        var sql = "INSERT INTO tbldbd (dbdID, creationDateTime, periodFrom, periodTo, preparedBy, status) VALUE ('" + ID + "', '" + req.body.creationDate + "' , '" + req.body.periodFrom + "' , '" + req.body.periodTo + "' , '" + req.body.preparedBy +  "', 'A')";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }

            res.json({"status": "success", "message": "DBD created!", "details": {"dbdID": ID}});
        });
    });
}); // Complete


// GET ALL
app.post('/getAllDbr', function (req, res) {
    'use strict';
    var sql = "SELECT dbrID as id, creationDateTime as date, preparedBy, authorizedBy, authorizedDate, verifiedBy, verifiedDate, status from tbldbr";
        
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        } 
        res.json(result);
        console.log("GET ALL DBR: " + result);
    });
});

app.post('/getAllDbd', function (req, res) {
    'use strict';
    //var sql = "SELECT b.council, b.creationDateTime as date, db.areaCode, b.companyName, b.address, db.binSize, db.serialNo as damagedBinNo, db.damageCode, db.damageReason, b.preparedBy, b.repairBin, b.replaceBin, b.cost, b.status, b.rectifiedDate FROM tbldbr b inner join tbldbrentry db on b.dbrID = db.dbrID WHERE (b.creationDateTime  BETWEEN '" + req.body.periodFrom + "' AND '" + req.body.periodTo + "')";
        
    var sql = "SELECT dbdID as id, periodFrom, periodTo, preparedBy, authorizedBy, verifiedBy, status FROM tbldbd";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
        console.log("GET ALL DBR: " + result);
    });
});

app.post('/getDbrInfo', function (req, res) {
    'use strict';

    var sql = "SELECT * FROM tbldbr where dbrID = '" + req.body.id + "'";

    console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
         
        res.json(result);
        console.log(result);
    });
});

app.post('/getDbdInfo', function (req, res) {
    'use strict';

    var sql = "SELECT * FROM tbldbd where dbdID = '" + req.body.id + "'";

    console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
         
        res.json(result);
        console.log(result);
    });
});



app.post('/getDbrDetails', function (req, res) {
    'use strict';

    var sql = "SELECT * FROM tbldbrentry where dbrID = '" + req.body.id + "'";

    console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
         
        res.json(result);
        console.log(result);
    });
});

app.post('/getDbdDetails', function (req, res) {
    'use strict';

    console.log(req.body);
    var sql = "SELECT * FROM tbldbr WHERE (creationDateTime  BETWEEN '" + req.body.periodFrom + "' AND '" + req.body.periodTo + "')";
    

    console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
         
        res.json(result);
        console.log(result);
    });
});

app.post('/getDbdDetailsDetails', function (req, res) {
    'use strict';

    console.log(req.body);
    var sql = "SELECT * FROM tbldbrentry WHERE dbrID = '" + req.body.dbrID + "'";
    

    console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
         
        res.json(result);
        console.log(result);
    });
});

app.post('/addBdafEntry', function (req, res) {
    'use strict';
    //console.log("DCS ID: " + req.body.dcsID);
    if (req.body.binDelivered == '') {
        req.body.binDelivered = null;
    }

    if (req.body.binPulled == '') {
        req.body.binPulled = null;
    }
    var sql = "INSERT INTO tblbdafentry (idNo, bdafID, customerID, acrID, acrSticker, serialNo, binDelivered, binPulled, jobDesc, remarks, completed) VALUE ('" + null + "', '" + req.body.bdafID + "' , '"  + req.body.customerID + "', '"  + req.body.acrID + "', '" + req.body.acrSticker + "', '" + req.body.serialNo + "', '" + req.body.binDelivered + "', '" + req.body.binPulled + "', '" + req.body.jobDesc + "', '" + req.body.remarks + "', '" + req.body.completed + "')";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.json({"status": "success", "message": "BDAF entry added!", "details": {"bdafID": req.body.bdafJD}});
    }); 
}); // Complete

app.post('/updateDbrBD', function (req, res) {
    'use strict';
    var sql = "UPDATE tbldbr SET cost = '" + req.body.cost + "', alternativeAction = '" + req.body.alternativeAction + "' WHERE dbrID = '" + req.body.dbrID + "'";
        
    console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        } 
        res.json(result);
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

app.post('/getBdafInfo', function (req, res) {
    'use strict';
    //console.log("DCS ID: " + req.body.dcsID);
    var sql = "SELECT * from tblbdaf where bdafID = '" + req.body.id + "'";
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

module.exports = app;