/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var moment = require('moment');


app.get('/getAllDatabaseBin', function (req, res) {
    'use strict';
    var sql = "select wbd.idNo as id,wbd.date as date, customer.name as name, customer.ic as icNo, bins.serialNo, wbd.rcDwell as rcDwell, customer.houseNo, taman.tamanName as tmnKpg, customer.postCode as areaCode, wbd.activeStatus as status, wbd.comment as comment, bins.size as binSize, concat(customer.houseNo,' ',customer.streetNo,' ',taman.tamanName) as address, customer.name as companyName, acr.acrID as acrfSerialNo from tblwheelbindatabase as wbd left join tblbins as bins on wbd.serialNo = bins.serialNo left join tblacr as acr on wbd.acrID = acr.acrID left join tblcustomer as customer on wbd.customerID = customer.customerID left join tbltaman as taman on customer.tamanID = taman.tamanID where wbd.activeStatus = 'a'";
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
    var sql = "UPDATE tblwheelbindatabase SET activeStatus = 'i' WHERE idNo = '" + req.body.id + "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log(result);
        res.json(result);
    });
});

app.post('/addDatabaseBin', function (req, res) {
    'use strict';

    let current_datetime = req.body.date;
    let formatted_date = moment(current_datetime).format("YYYY-MM-DD hh:mm:ss");

    var test_sql = `select * from tblwheelbindatabase where serialNo = '${req.body.serialNo}' and activeStatus = 'a'`;
    database.query(test_sql, function(err, result){
        if(err){
            throw err;
        }
        if(result.json !== null){
            var inactive_sql = `update tblwheelbindatabase set activeStatus = 'i' where serialNo = '${req.body.serialNo}'`;
            database.query(inactive_sql, function(err, result){
                console.log(result);
                console.log("Old bins deactivated");
            })
        }
    })

    function addBin(){
        if(req.body.acrID == 'null') {
            var sql = `insert into tblwheelbindatabase values(NULL,'${formatted_date}','${req.body.customerID}','${req.body.areaID}','${req.body.serialNo}',null,'a','${req.body.rcDwell}', '${req.body.comment}')`;
        }else{
            var sql = `insert into tblwheelbindatabase values(NULL,'${formatted_date}','${req.body.customerID}','${req.body.areaID}','${req.body.serialNo}','${req.body.acrID}','a','${req.body.rcDwell}', '${req.body.comment}')`;
        }
    
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            console.log("Add WBD entry success");
            console.log(result);
            res.json({"status": "success", "message": "WBD Entry created successfully!"});

            /*var refreshSql = `SELECT wbd.idNo as id,wbd.date as date, customer.name as name, customer.ic as icNo, bins.serialNo, wbd.rcDwell as rcDwell, customer.houseNo, taman.tamanName as tmnKpg, customer.postCode as areaCode, wbd.activeStatus as status, wbd.comment as comment, bins.size as binSize, concat(customer.houseNo,' ',customer.streetNo,' ',taman.tamanName) as address, customer.name as companyName, acr.acrID as acrfSerialNo from tblwheelbindatabase as wbd left join tblbins as bins on wbd.serialNo = bins.serialNo left join tblacr as acr on wbd.acrID = acr.acrID left join tblcustomer as customer on wbd.customerID = customer.customerID left join tbltaman as taman on customer.tamanID = taman.tamanID where wbd.activeStatus = 'a' ORDER BY idNo DESC LIMIT 1`;
            database.query(refreshSql, function(err,result){
                if(err){
                    throw err;
                }
                console.log(result);
                res.json(result);
            })*/
            
        });
    }

    setTimeout(addBin, 100);
});

app.get('/refreshDatabaseBin', function(req,res){
    'use strict';

    var refreshSql = `SELECT wbd.idNo as id,wbd.date as date, customer.name as name, customer.ic as icNo, bins.serialNo, wbd.rcDwell as rcDwell, customer.houseNo, taman.tamanName as tmnKpg, customer.postCode as areaCode, wbd.activeStatus as status, wbd.comment as comment, bins.size as binSize, concat(customer.houseNo,' ',customer.streetNo,' ',taman.tamanName) as address, customer.name as companyName, acr.acrID as acrfSerialNo from tblwheelbindatabase as wbd left join tblbins as bins on wbd.serialNo = bins.serialNo left join tblacr as acr on wbd.acrID = acr.acrID left join tblcustomer as customer on wbd.customerID = customer.customerID left join tbltaman as taman on customer.tamanID = taman.tamanID where wbd.activeStatus = 'a' ORDER BY idNo DESC LIMIT 1`;
    database.query(refreshSql, function(err, response){
        if(err){
            throw err;
        }
        console.log(response);
        res.json(response);
    })
})

app.put('/editDatabaseBin', function (req, res) {
    'use strict';

    /*var temp = 'null';

    if(req.body.acrID === 'null'){
        var sql = `update tblwheelbindatabase set date = '${req.body.date}', customerID = '${req.body.customerID}', areaID = '${req.body.areaCode}', serialNo = '${req.body.serialNo}', acrID = ${temp}, activeStatus = '${req.body.activeStatus}', rcDwell = '${req.body.rcDwell}', comment = '${req.body.comment}' where idNo = '${req.body.idNo}'`;
    } else{
        var sql = `update tblwheelbindatabase set date = '${req.body.date}', customerID = '${req.body.customerID}', areaID = '${req.body.areaCode}', serialNo = '${req.body.serialNo}', acrID = '${req.body.acrID}', activeStatus = '${req.body.activeStatus}', rcDwell = '${req.body.rcDwell}', comment = '${req.body.comment}' where idNo = '${req.body.idNo}'`;
    }

    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Update WBD entry success");
        console.log(result);
        res.json({"status": "success", "message": "WBD Entry updated successfully!"});
        
    });*/

    //New edit code
    var test_sql = `select * from tblwheelbindatabase where serialNo = '${req.body.serialNo}' and activeStatus = 'a'`;
    database.query(test_sql, function(err, result){
        if(err){
            throw err;
        }
        if(result.json !== null){
            var inactive_sql = `update tblwheelbindatabase set activeStatus = 'i' where serialNo = '${req.body.serialNo}'`;
            database.query(inactive_sql, function(err, result){
                console.log(result);
                console.log("Old bins deactivated");
            })
        }
    })

    function editBin(){
        var temp = 'null';

        if(req.body.acrID === 'null'){
            var sql = `update tblwheelbindatabase set date = '${req.body.date}', customerID = '${req.body.customerID}', areaID = '${req.body.areaCode}', serialNo = '${req.body.serialNo}', acrID = ${temp}, activeStatus = '${req.body.activeStatus}', rcDwell = '${req.body.rcDwell}', comment = '${req.body.comment}' where idNo = '${req.body.idNo}'`;
        } else{
            var sql = `update tblwheelbindatabase set date = '${req.body.date}', customerID = '${req.body.customerID}', areaID = '${req.body.areaCode}', serialNo = '${req.body.serialNo}', acrID = '${req.body.acrID}', activeStatus = '${req.body.activeStatus}', rcDwell = '${req.body.rcDwell}', comment = '${req.body.comment}' where idNo = '${req.body.idNo}'`;
        }
    
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            console.log("Update WBD entry success");
            console.log(result);
            res.json({"status": "success", "message": "WBD Entry updated successfully!"});
            
        });
    }

    setTimeout(editBin, 100);
});

app.post('/addCustomer', function (req, res) {
    'use strict';
    // console.log(`${req.body.tamanID}`);
    // console.log(`${req.body.username}`);
    // console.log(`${req.body.status}`);

    // let current_datetime = new Date()
    // let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();

    //console.log(formatted_date);

    req.body.customerID = f.makeID('customer', req.body.creationDateTime).then(function (ID) {
        //console.log(`${ID}`);
        var sql = "insert into tblcustomer values('" + ID + "', '" + req.body.tamanID + "','" + req.body.username + "','" + req.body.password + "','" + req.body.contactNumber + "','" + req.body.ic + "','" + req.body.tradingLicense + "','" + req.body.name + "', '" + req.body.companyName + "','" + req.body.houseNo + "','" + req.body.streetNo + "','" + req.body.postCode + "','" + req.body.city + "','" + req.body.state + "','" + req.body.status + "','" + req.body.imgPath + "', current_timestamp())";
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            console.log("Add Customer success");
            console.log(result);
            res.json({"status": "success", "message": "Customer: '" + ID + "' created successfully!"});
        });
    });
});

app.get('/getAllTaman', function (req, res) {
    'use strict';
    var sql = "select * from tbltaman";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        //console.log("Taman query success");
       // console.log(result);
        res.json(result);
        
    });
});

app.get('/getAllCustomers', function (req, res) {
    'use strict';
    var sql = `select * from tblcustomer`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        //console.log("Customer query success");
       // console.log(result);
        res.json(result);
        
    });
});

app.get('/getAllArea', function (req, res) {
    'use strict';
    var sql = "select * from tblarea";
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
    var sql = "select * from tblcustomer";
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
    var sql = "select * from tblbins";
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
    var sql = "select * from tblacr";
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

    var sql = `insert into tblbins values('${req.body.serialNo}','${req.body.size}','${req.body.status}','14.740889','14.740889')`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Add Bin success");
        console.log(result);
        res.json({"status": "success", "message": "Bin number '" + req.body.serialNo + "' created successfully!"});
        
    });
});

app.post('/addTaman', function (req, res) {
    'use strict';

    var sql = "INSERT INTO tbltaman VALUES (null, '" + req.body.areaID + "', '" + req.body.tamanName + "', '" + req.body.longitude + "', '" + req.body.latitude + "', '" + req.body.areaCollStatus + "')";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Add Taman success");
        console.log(result);
        res.json({"status": "success", "message": "Taman created successfully!"});
        
    });
});

app.get('/getBinHistory', function (req, res) {
    'use strict';

    var sql = "select wbd.idNo as id,wbd.date as date, customer.name as name, customer.ic as icNo, bins.serialNo, wbd.rcDwell as rcDwell, customer.houseNo, taman.tamanName as tmnKpg, customer.postCode as areaCode, wbd.activeStatus as status, wbd.comment as comment, bins.size as binSize, concat(customer.houseNo,' ',customer.streetNo,' ',taman.tamanName) as address, customer.name as companyName, acr.acrID as acrfSerialNo from tblwheelbindatabase as wbd left join tblbins as bins on wbd.serialNo = bins.serialNo left join tblacr as acr on wbd.acrID = acr.acrID left join tblcustomer as customer on wbd.customerID = customer.customerID left join tbltaman as taman on customer.tamanID = taman.tamanID";
    database.query(sql, function(err,result){
        if(err){
            throw err;
        }
        console.log("Get bin history success");
        console.log(result);
        res.json(result);
    });
});

// New Business Modules
app.put('/editCustomer', function (req, res) {
    'use strict';

    console.log(`${req.body.customerID}`);
    //console.log(`${req}`);

    var sql = `update tblcustomer set creationDateTime = '${req.body.creationDateTime}', name = '${req.body.name}', ic = '${req.body.ic}', contactNumber = '${req.body.contactNumber}', tradingLicense = '${req.body.tradingLicense}', city = '${req.body.city}', imgPath = '${req.body.imgPath}', status = '${req.body.status}', houseNo = '${req.body.houseNo}', streetNo = '${req.body.streetNo}', companyName = '${req.body.companyName}' where customerID = '${req.body.customerID}';`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Update Customer success");
        console.log(result);
        res.json({"status": "success", "message": "Customer updated successfully!"});
        
    });
});

app.post('/deleteCustomer', function (req, res) {
    'use strict';
    var sql = `delete from tblcustomer where customerID='${req.body.customerID}'`;
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        //console.log("delete script success");
        console.log(result);
        res.json(result);
        
    });
});

// BIN STOCK MODULE
app.put('/editBinStock', function(req, res){
    'use strict';

    var sql = `update tblbins set size='${req.body.size}', status='${req.body.status}' where serialNo ='${req.body.serialNo}'`;
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        console.log(result);
        res.json(result)
        //res.json({"status": "success", "message": "Bin updated successfully!"});
    })
})

app.post('/deleteBinStock', function(req, res){
    'use strict';

    var sql = `delete from tblbins where serialNo = '${req.body.serialNo}'`;
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        console.log('Delete bin stock bindatabase.js');
        console.log(result);
        res.json(result);
        res.json({"status":"success", "message":"Bin deleted successfully!"});
    })
})

// TAMAN MODULE
app.put('/editTaman', function(req, res){
    'use strict';

    //tamanID, areaID, tamanName, longitude, latitude, areaCollStatus

    var sql = `update tbltaman set areaID='${req.body.areaID}', tamanName='${req.body.tamanName}', longitude='${req.body.longitude}', latitude='${req.body.latitude}', areaCollStatus='${req.body.areaCollStatus}' where tamanID ='${req.body.tamanID}'`;
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        console.log(result);
        res.json(result)
        //res.json({"status": "success", "message": "Bin updated successfully!"});
    })
})

app.post('/deleteTaman', function(req, res){
    'use strict';

    console.log(req.body.tamanID);

    var sql = `delete from tbltaman where tamanID = '${req.body.tamanID}'`;
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        console.log(result);
        //res.json(result);
        //res.json({"status":"success", "message":"Taman deleted successfully!"});
        //res.json(result);
    })
})


module.exports = app;