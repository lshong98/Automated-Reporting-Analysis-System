var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var moment = require('moment');


app.get('/getAllDatabaseBin', function (req, res) {
    'use strict';
    var sql = "select wbd.idNo as id,wbd.date as date, customer.name as name, customer.ic as icNo, bins.serialNo, wbd.rcDwell as rcDwell, customer.houseNo, taman.tamanName as tmnKpg, customer.postCode as areaCode, wbd.activeStatus as status, wbd.comment as comment, bins.size as binSize, concat(customer.houseNo,' ',customer.streetNo,' ',taman.tamanName) as address, customer.name as companyName, acr.acrID as acrfSerialNo, wbd.itemType as itemType, wbd.path as path from tblwheelbindatabase as wbd left join tblbins as bins on wbd.serialNo = bins.serialNo left join tblacr as acr on wbd.acrID = acr.acrID left join tblcustomer as customer on wbd.customerID = customer.customerID left join tbltaman as taman on customer.tamanID = taman.tamanID where wbd.activeStatus = 'a'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        } 
        //console.log("script success");
        //console.log(result);
        res.json(result);
        
    });
});

app.post('/deleteDatabaseBin', function (req, res) {
    'use strict';
    var sql = `update tblwheelbindatabase set activeStatus = 'i' where idNo='${req.body.id}';`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        //console.log("delete script success");
        console.log(result);
        res.json(result);
        
    });
});

app.post('/addDatabaseBin', function (req, res) {
    'use strict';

    let current_datetime = req.body.date;
    let formatted_date = moment(current_datetime).format("YYYY-MM-DD hh:mm:ss");
    //console.log(formatted_date);

    var sql = `insert into tblwheelbindatabase values(NULL,'${formatted_date}','${req.body.customerID}','${req.body.areaID}','${req.body.serialNo}','${req.body.acrID}','${req.body.activeStatus}','${req.body.rcDwell}', '${req.body.comment}','${req.body.itemType}','${req.body.path}')`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Add WBD entry success");
        console.log(result);
        res.json({"status": "success", "message": "WBD Entry created successfully!"});
        
    });
});

app.post('/editDatabaseBin', function (req, res) {
    'use strict';

    var sql = `update tblwheelbindatabase set date ='${req.body.date}', customerID = '${req.body.customerID}', areaID = 'a001', serialNo = '${req.body.serialNo}', acrID = '${req.body.acrID}', activeStatus = '${req.body.activeStatus}', rcDwell = '${req.body.rcDwell}', comment = '${req.body.comment}', itemType = '${req.body.itemType}', path = '${req.body.path}' where idNo = ${req.body.idNo}`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Update WBD entry success");
        console.log(result);
        res.json({"status": "success", "message": "WBD Entry updated successfully!"});
        
    });
});

app.put('/editDatabaseBin', function (req, res) {
    'use strict';

    console.log(`${req.body.customerID}`);
    console.log(`${req}`);

    var sql = `update tblwheelbindatabase set date ='${req.body.date}', customerID = '${req.body.customerID}', areaID = '${req.body.areaCode}', serialNo = '${req.body.serialNo}', acrID = '${req.body.acrID}', activeStatus = '${req.body.activeStatus}', rcDwell = '${req.body.rcDwell}', comment = '${req.body.comment}', itemType = '${req.body.itemType}', path = '${req.body.path}' where idNo = ${req.body.idNo}`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Update WBD entry success");
        console.log(result);
        res.json({"status": "success", "message": "WBD Entry updated successfully!"});
        
    });
});

app.post('/addCustomer', function (req, res) {
    'use strict';
    // console.log(`${req.body.tamanID}`);
    // console.log(`${req.body.username}`);
    // console.log(`${req.body.status}`);

    // let current_datetime = new Date()
    // let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();

    //console.log(formatted_date);

    req.body.customerID = f.makeID('customer',req.body.creationDateTime).then(function(ID){
        //console.log(`${ID}`);
        var sql = "insert into tblcustomer values('"+ ID +"', '"+ req.body.tamanID +"','" + req.body.username +"','" + req.body.password +"','" + req.body.contactNumber +"','" + req.body.ic +"','" + req.body.tradingLicense +"','" + req.body.name +"', '" + req.body.companyName +"','" + req.body.houseNo +"','" + req.body.streetNo +"','" + req.body.postCode +"','" + req.body.city +"','" + req.body.status +"',current_timestamp())";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            console.log("Add Customer success");
            console.log(result);
            res.json({"status": "success", "message": `Customer: ${ID} created successfully!`});
                
    });
    });
});

app.get('/getAllTaman', function (req, res) {
    'use strict';
    var sql = `select * from tbltaman`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        //console.log("Taman query success");
       // console.log(result);
        res.json(result);
        
    });
});

app.get('/getAllArea', function (req, res) {
    'use strict';
    var sql = `select * from tblarea`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        //console.log("Taman query success");
       // console.log(result);
        res.json(result);
        
    });
});

app.get('/getAllCustomer', function (req, res) {
    'use strict';
    var sql = `select * from tblcustomer`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        //console.log("Taman query success");
       // console.log(result);
        res.json(result);
        
    });
});

app.get('/getAllBins', function (req, res) {
    'use strict';
    var sql = `select * from tblbins`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        //console.log("Taman query success");
       // console.log(result);
        res.json(result);
        
    });
});

app.get('/getAllAcr', function (req, res) {
    'use strict';
    var sql = `select * from tblacr`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        //console.log("Taman query success");
       // console.log(result);
        res.json(result);
        
    });
});

app.post('/addBin', function (req, res) {
    'use strict';

    var sql = `insert into tblbins values('${req.body.serialNo}','${req.body.size}','${req.body.status}','${req.body.longitude}','${req.body.latitude}')`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Add Bin success");
        console.log(result);
        res.json({"status": "success", "message": `Bin number ${req.body.serialNo} created successfully!`});
        
    });
});

app.post('/addTaman', function (req, res) {
    'use strict';

    var sql = `insert into tbltaman values(null,'${req.body.areaID}','${req.body.tamanName}','${req.body.longitude}','${req.body.latitude}','${req.body.areaCollStatus}')`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Add Taman success");
        console.log(result);
        res.json({"status": "success", "message": `Taman created successfully!`});
        
    });
});


module.exports = app;