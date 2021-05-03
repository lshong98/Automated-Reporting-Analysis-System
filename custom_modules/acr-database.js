/*jslint node:true*/
var variable = require('../variable');
var express = variable.express;
var dateTime = variable.dateTime;
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var fs = require('fs');
const e = require('express');
const { type } = require('os');

app.post('/getAcrdbList',function(req, res){
    'use strict';

    var sql= "SELECT `id` AS 'id', `Serial_No` as 'serialNo', `Brand` AS 'brand', `Bin_Size` AS 'binSize', `council` AS 'council', `Date_of_Application` AS 'dateOfApplication', `status` AS 'binStatus', `area` AS 'area' ,`Name` AS 'name', `Tel_Contact` AS 'contact', `IC_Number` AS 'ic', `Company_Name` AS 'company', `Billing_Address` AS 'billAddress', `Place_of_Service_Lot_No` AS 'serviceAddress', `Frequency` AS 'frequency', `Type_of_Premise` AS 'typeOfPremise', `ACR_Serial_No` AS 'acrSerialNo', `Council_Serial_No` AS 'councilSerialNo', `Remarks` AS 'remarks', `Mon` AS 'mon', `Tue` AS 'tue', `Wed` AS 'wed', `Thu` AS 'thu', `Fri` AS 'fri', `Sat` AS 'sat', `Sun` AS 'sun' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status LIKE '%" + req.body.status + "%' ORDER BY council, company, binStatus, binSize";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    });

});

app.post('/addAcrDB', function(req, res){
    'use strict';
    
    var
    serialNo = req.body.serialNo,
    brand = req.body.brand,
    size = req.body.binSize,
    date = req.body.dateOfApplication,
    name = req.body.name.replace(/'/g,"\\'"),
    contact = req.body.contact.replace(/'/g,"\\'"),
    ic = req.body.ic.replace(/'/g,"\\'"),
    company = req.body.company.replace(/'/g,"\\'"),
    billAddress = req.body.billAddress.replace(/'/g,"\\'"),
    serviceAddress = req.body.serviceAddress.replace(/'/g,"\\'"),
    typeOfPremise = req.body.typeOfPremise,
    acrSerialNo = req.body.acrSerialNo,
    councilSerialNo = req.body.councilSerialNo,
    remarks = req.body.remarks.replace(/'/g,"\\'"),
    mon = req.body.mon,
    tue = req.body.tue,
    wed = req.body.wed,
    thu = req.body.thu,
    fri = req.body.fri,
    sat = req.body.sat,
    sun = req.body.sun,
    council = req.body.council
    ;



    var sql = "INSERT INTO tblacrdatabase (`Serial_No`, `Brand`, `Bin_Size`, `Date_of_Application`, `Name`, `Tel_Contact`, `IC_Number`, `Company_Name`, `Billing_Address`, `Place_of_service_Lot_No`, `Frequency`, `Type_of_Premise`, `ACR_Serial_No`, `Council_Serial_No`, `Remarks`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`, `Council`, `status`) VALUES ('" + serialNo + "', '" + brand + "', '" + size + "', '" + date + "', '" + name + "', '" + contact + "', '" + ic + "', '" + company + "', '" + billAddress + "', '" + serviceAddress + "', '" + req.body.frequency + "', '" + typeOfPremise + "', '" + acrSerialNo + "', '" + councilSerialNo + "', '" + remarks + "', '" + mon + "', '" + tue + "', '" + wed + "', '" + thu + "', '" + fri + "', '" + sat + "', '" + sun + "', '" + council + "', '0')";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }else{
            var sql2 = "UPDATE tblbindatabase SET `name` = '" + name + "', `contact` = '" + contact + "', ic = '" + ic + "', address = '" + serviceAddress + "', company = '" + company + "', typeOfPro = '" + typeOfPremise + "', binStatus = 'ACR', binInUse = 'Active', date = '" + date +"', council = '" + council + "', changesDate = NOW() WHERE serialNo = '" + serialNo + "'";
            database.query(sql2, function(err, result){
                if(err){
                    throw err;
                }else{
                    res.json({"status": "success"});
                }
            });
        }
    });
});

app.post('/getAcrDbDetail', function(req, res){
    'use strict';

    var sql = "SELECT `id` AS 'id', `Serial_No` as 'serialNo', `Brand` AS 'brand', `Bin_Size` AS 'binSize', `council` AS 'council', `Date_of_Application` AS 'dateOfApplication', `status` AS 'binStatus', `area` AS 'area', `Name` AS 'name', `Tel_Contact` AS 'contact', `IC_Number` AS 'ic', `Company_Name` AS 'company', `Billing_Address` AS 'billAddress', `Place_of_Service_Lot_No` AS 'serviceAddress', `Type_of_Premise` AS 'typeOfPremise', `ACR_Serial_No` AS 'acrSerialNo', `Council_Serial_No` AS 'councilSerialNo', `Remarks` AS 'remarks', `Mon` AS 'mon', `Tue` AS 'tue', `Wed` AS 'wed', `Thu` AS 'thu', `Fri` AS 'fri', `Sat` AS 'sat', `Sun` AS 'sun' FROM tblacrdatabase WHERE id = '" + req.body.id + "'";
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    });
});

app.post('/saveAcrdbEdit', function(req, res){
    'use strict';

    Object.keys(req.body).forEach(function (property) {
        if (req.body[property] == null ) {
            req.body[property] = '';
        }
      });
        
    var 
    serialNo = req.body.serialNo.replace(/'/g,"\\'"),
    brand = req.body.brand.replace(/'/g,"\\'"),
    binSize = req.body.binSize.replace(/'/g,"\\'"),
    dateOfApplication = req.body.saveDateOfApplication,
    name = req.body.name.replace(/'/g,"\\'"),
    contact = req.body.contact.replace(/'/g,"\\'"),
    ic = req.body.ic.replace(/'/g,"\\'"),
    company = req.body.company.replace(/'/g,"\\'"), 
    billingAddress = req.body.billAddress.replace(/'/g,"\\'"), 
    serviceAddress = req.body.serviceAddress.replace(/'/g,"\\'"),
    binStatus1 = req.body.binStatus,
    binStatus2 = "",
    area = req.body.area,
    typeOfPremise = req.body.typeOfPremise.replace(/'/g,"\\'"), 
    acrSerialNo = req.body.acrSerialNo.replace(/'/g,"\\'"), 
    councilSerialNo = req.body.councilSerialNo.replace(/'/g,"\\'"),
    mon = req.body.checkMon,
    tue = req.body.checkTue,
    wed = req.body.checkWed,
    thu = req.body.checkThu,
    fri = req.body.checkFri,
    sat = req.body.checkSat,
    sun = req.body.checkSun,
    council = req.body.council,
    remarks = req.body.remarks;

    if(mon == true){
        mon = 'X';
    }else{
        mon = '';
    }
    if(tue == true){
        tue = 'X';
    }else{
        tue = '';
    }
    if(wed == true){
        wed = 'X';
    }else{
        wed = '';
    }
    if(thu == true){
        thu = 'X';
    }else{
        thu = '';
    }
    if(fri == true){
        fri = 'X';
    }else{
        fri = '';
    }
    if(sat == true){
        sat = 'X';
    }else{
        sat = '';
    }
    if(sun == true){
        sun = 'X';
    }else{
        sun = '';
    }

    if(binStatus1 == 0){
        binStatus2 = "Active";
    }else{
        binStatus2 = "Inactive";
    }


    var sql = "UPDATE tblacrdatabase SET `Serial_No` = '" + serialNo + "', `Brand` = '" + brand + "', `Bin_Size` = '" + binSize + "', `Date_of_Application` = '" + dateOfApplication + "', `status` = '" + binStatus1 + "', `area` = '" + area + "', `Name` = '" + name + "', `Tel_Contact` = '" + contact + "', `IC_Number` = '" + ic + "', `Company_Name`= '" + company + "', `Billing_Address` = '" + billingAddress + "', `Place_of_Service_Lot_No` = '" + serviceAddress + "', `Type_of_Premise` = '" + typeOfPremise + "', `ACR_Serial_No` = '" + acrSerialNo + "', `Council_Serial_No` = '" + councilSerialNo +"', `Remarks` = '" + remarks + "', `Mon` = '" + mon + "', `Tue` = '" + tue + "', `Wed`= '" + wed + "', `Thu` = '" + thu + "', `Fri` = '" + fri + "', `Sat` = '" + sat + "', `Sun` = '" + sun + "', `council` = '" + council + "' WHERE id = '" + req.body.id + "'";
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }else{
            var sql2 = "UPDATE tblbindatabase SET `name` = '" + name + "', `contact` = '" + contact + "', ic = '" + ic + "', address = '" + serviceAddress + "', company = '" + company + "', typeOfPro = '" + typeOfPremise + "', binInUse = '" + binStatus2 + "', date = '" + dateOfApplication +"', council = '" + council + "' WHERE serialNo = '" + serialNo + "';";
            database.query(sql2, function(err, result){
                if(err){
                    throw err;
                }else{
                    res.json({"status": "success"});
                }
            });
        }
    });
});

app.post('/deleteAcrdb', function(req, res){
    'use strict';
    var sql = "UPDATE tblacrdatabase SET status = 0 WHERE id = '" + req.body.id + "';";
    
    database.query(sql,function(err,result){
        if(err){
            throw err;
        }else{
            res.json({"status":"success", "message":"ACR has been deleted."});
        }
        
    });
})

app.post('/getAcrdbCustList', function(req, res){
    'use strict';
    
    var sql = "SELECT a.company, a.status, a.acrCustID, a.council, a.cost, a.entitlement, a.total, b.be, c.bin1000L, c.bin660L, c.bin240L, c.bin120L, c.na, d.activeCount, e.postponedCount, f.terminatedCount FROM (SELECT tblacrcust.company AS 'company', (CASE WHEN tblacrcust.custStatus = '0' THEN 'Active' WHEN tblacrcust.custStatus = '1' THEN 'Postponed' WHEN tblacrcust.custStatus = '2' THEN 'Terminated' WHEN tblacrcust.custStatus = '3' THEN 'Terminated' END) AS 'status', tblacrcust.acrCustID AS 'acrCustID', tblacrcust.council AS 'council', tblacrcust.cost AS 'cost', tblacrcust.entitlement AS 'entitlement', tblacrcust.totalCost AS 'total' FROM tblacrcust WHERE tblacrcust.council LIKE '%" + req.body.council + "%')a LEFT JOIN (SELECT tblbindatabase.acrCustID AS 'acrCustID', COUNT(tblbindatabase.id) AS 'be' FROM tblbindatabase WHERE tblbindatabase.binStatus = 'BE'  GROUP BY tblbindatabase.acrCustID)b ON a.acrCustID = b.acrCustID LEFT JOIN (SELECT a.acrCustID, a.council, b.bin1000L, c.bin660L, d.bin240L, e.bin120L, f.na FROM (SELECT tblacrcust.acrCustID AS 'acrCustID', tblacrcust.council AS 'council' FROM tblacrcust WHERE council LIKE '%" + req.body.council + "%' GROUP BY tblacrcust.acrCustID, tblacrcust.council)a LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'bin1000L' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status LIKE '%" + req.body.status + "%' AND Bin_Size = '1000L' GROUP BY tblacrdatabase.acrCustID)b ON a.acrCustID = b.acrCustID LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'bin660L' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status LIKE '%" + req.body.status + "%' AND Bin_Size = '660L' GROUP BY tblacrdatabase.acrCustID)c ON a.acrCustID = c.acrCustID LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'bin240L' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status LIKE '%" + req.body.status + "%' AND Bin_Size = '240L' GROUP BY tblacrdatabase.acrCustID)d ON a.acrCustID = d.acrCustID LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'bin120L' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status LIKE '%" + req.body.status + "%' AND Bin_Size = '120L' GROUP BY tblacrdatabase.acrCustID)e ON a.acrCustID = e.acrCustID LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'na' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status LIKE '%" + req.body.status + "%' AND Bin_Size IS NULL GROUP BY tblacrdatabase.acrCustID)f ON a.acrCustID = f.acrCustID)c ON a.acrCustID = c.acrCustID  AND a.council = c.council LEFT JOIN (SELECT COUNT(*) AS 'activeCount', tblacrdatabase.acrCustID AS 'acrCustID' FROM tblacrdatabase WHERE tblacrdatabase.status='0' GROUP BY tblacrdatabase.acrCustID)d ON a.acrCustID = d.acrCustID LEFT JOIN (SELECT COUNT(*) AS 'postponedCount', tblacrdatabase.acrCustID AS 'acrCustID' FROM tblacrdatabase WHERE tblacrdatabase.status='1' GROUP BY tblacrdatabase.acrCustID)e ON a.acrCustID = e.acrCustID LEFT JOIN (SELECT COUNT(*) AS 'terminatedCount', tblacrdatabase.acrCustID AS 'acrCustID' FROM tblacrdatabase WHERE tblacrdatabase.status='2' OR  tblacrdatabase.status='3' GROUP BY tblacrdatabase.acrCustID)f ON a.acrCustID = f.acrCustID ORDER BY  a.council, a.company ASC;";
console.log(sql);
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    });
});

app.post('/getAcrdbCustDetails', function(req, res){
    'use strict';

    var sql="SELECT tblacrcust.company AS 'company', tblacrcust.name AS 'name', tblacrcust.contact AS 'contact', tblacrcust.ic AS 'ic', tblacrcust.council AS 'council', tblacrcust.cost AS 'cost', tblacrcust.entitlement AS 'entitlement', tblacrcust.totalCost AS 'totalCost' FROM tblacrcust WHERE acrCustID = '" + req.body.acrCustID + "'";
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    });
});

app.post('/getAcrdbCustBEBin', function(req, res){
    'use strict';

    var sql = "SELECT id AS 'id', serialNo AS 'serialNo', brand AS 'brand', size AS 'size', binInUse AS 'binInUse', date AS 'date', name AS 'name', binStatus AS 'binStatus' FROM tblbindatabase WHERE acrCustID = '" + req.body.acrCustID + "' AND binStatus = 'BE' ORDER BY 'binStatus'";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    });
});

app.post('/getAcrdbCustAcrBin', function(req, res){
    'use strict';

    var sql = "SELECT `id` AS 'id', `Serial_No` AS 'serialNo', `Brand` AS 'brand', `Bin_Size` AS 'binSize', `Date_of_Application` AS 'date', `Frequency` AS 'frequency', `Place_of_Service_Lot_No` AS 'address', `Name` AS 'name' FROM tblacrdatabase WHERE acrCustID = '" + req.body.acrCustID + "'";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    });
});

app.post('/submitAcrdbCustEdit', function(req,res){
    'use strict';

    var company = req.body.company.replace(/'/g,"\\'");
    var council = req.body.council;
    var name = req.body.name.replace(/'/g,"\\'");
    var ic = req.body.ic.replace(/'/g,"\\'");
    var contact = req.body.contact.replace(/'/g,"\\'");
    var cost = req.body.cost;
    var entitlement = req.body.entitlement;
    var totalCost = req.body.totalCost;

    var sql = "UPDATE tblacrcust SET company = '" + company + "', council = '" + council + "', name = '" + name + "', ic = '" + ic + "', contact = '" + contact + "', cost = '" + cost + "', entitlement = '" + entitlement + "', totalCost = '" + totalCost + "' WHERE acrCustID = '" + req.body.acrCustID + "'";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json({"status":"success"});
    });
})

app.post('/getAcrdbBillingMatchingList', function(req, res){
    'use strict';
    
    // var sql = "SELECT a.company, a.acrCustID, a.cost, a.entitlement, a.totalCost, a.council, b.bin1000L, b.bin660L, b.bin240L, b.bin120L, b.na, c.amount AS 'histPayment', c.date AS 'histPaymentDate' FROM tblacrcust a  LEFT JOIN (SELECT a.acrCustID, a.council, b.bin1000L, c.bin660L, d.bin240L, e.bin120L, f.na FROM (SELECT tblacrcust.acrCustID AS 'acrCustID', tblacrcust.council AS 'council' FROM tblacrcust WHERE council LIKE '%" + req.body.council + "%' GROUP BY tblacrcust.acrCustID, tblacrcust.council)a LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'bin1000L' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status = '0' AND Bin_Size = '1000L' GROUP BY tblacrdatabase.acrCustID)b ON a.acrCustID = b.acrCustID LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'bin660L' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status = '0' AND Bin_Size = '660L' GROUP BY tblacrdatabase.acrCustID)c ON a.acrCustID = c.acrCustID LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'bin240L' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status = '0' AND Bin_Size = '240L' GROUP BY tblacrdatabase.acrCustID)d ON a.acrCustID = d.acrCustID LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'bin120L' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status = '0' AND Bin_Size = '120L' GROUP BY tblacrdatabase.acrCustID)e ON a.acrCustID = e.acrCustID LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'na' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status = '0' AND Bin_Size IS NULL GROUP BY tblacrdatabase.acrCustID)f ON a.acrCustID = f.acrCustID)b ON a.acrCustID = b.acrCustID  AND a.council = b.council LEFT JOIN  (SELECT acrCustID AS 'acrCustID', amount AS 'amount', MAX(date) AS 'date' FROM tblacrpaymenthist GROUP BY acrCustID) c ON a.acrCustID = c.acrCustID WHERE a.council LIKE '%" + req.body.council + "%' AND a.custStatus = '0'";
    var sql = "SELECT a.company, a.acrCustID, a.cost, a.entitlement, a.totalCost, a.council, b.bin1000L, b.bin660L, b.bin240L, b.bin120L, b.na, c.amount AS 'histPayment', c.date AS 'histPaymentDate' FROM tblacrcust a  LEFT JOIN (SELECT a.acrCustID, a.council, b.bin1000L, c.bin660L, d.bin240L, e.bin120L, f.na FROM (SELECT tblacrcust.acrCustID AS 'acrCustID', tblacrcust.council AS 'council' FROM tblacrcust WHERE council LIKE '%" + req.body.council + "%' GROUP BY tblacrcust.acrCustID, tblacrcust.council)a LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'bin1000L' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status = '0' AND Bin_Size = '1000L' GROUP BY tblacrdatabase.acrCustID)b ON a.acrCustID = b.acrCustID LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'bin660L' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status = '0' AND Bin_Size = '660L' GROUP BY tblacrdatabase.acrCustID)c ON a.acrCustID = c.acrCustID LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'bin240L' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status = '0' AND Bin_Size = '240L' GROUP BY tblacrdatabase.acrCustID)d ON a.acrCustID = d.acrCustID LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'bin120L' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status = '0' AND Bin_Size = '120L' GROUP BY tblacrdatabase.acrCustID)e ON a.acrCustID = e.acrCustID LEFT JOIN (SELECT tblacrdatabase.acrCustID AS 'acrCustID', COUNT(tblacrdatabase.id) AS 'na' FROM tblacrdatabase WHERE council LIKE '%" + req.body.council + "%' AND status = '0' AND Bin_Size IS NULL GROUP BY tblacrdatabase.acrCustID)f ON a.acrCustID = f.acrCustID)b ON a.acrCustID = b.acrCustID  AND a.council = b.council LEFT JOIN  (SELECT a.id, a.acrCustID AS 'acrCustID', b.amount AS 'amount', b.date AS 'date' FROM (SELECT acrCustID AS 'acrCustID', MAX(id) AS 'id' FROM tblacrpaymenthist GROUP BY acrCustID)a LEFT JOIN tblacrpaymenthist b ON a.id = b.id) c ON a.acrCustID = c.acrCustID WHERE a.council LIKE '%" + req.body.council + "%' AND a.custStatus = '0'";
    console.log(sql);
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    });
});

app.post('/submitTruckCollectionRecord', function(req,res){
    'use strict';

    var sql = "INSERT INTO tbltruckcollectionrecord (device, location, zoneIn, zoneOut, duration, position, distance, myDate) VALUES ?";
    var myObj = req.body;
    var myData = [];

    for(var i=0; i<myObj.length; i++){
        for(var j=0; j<myObj[i].data.length; j++){
            myData.push([myObj[i].device, myObj[i].data[j].location, myObj[i].data[j].zoneIn, myObj[i].data[j].zoneOut, myObj[i].data[j].duration, myObj[i].data[j].position, myObj[i].data[j].distance, myObj[i].data[j].date]);
        }
    }
    database.query(sql,[myData], function(err){
        if(err){
            throw err;
        }else{
            res.json({status: "success"});
        }
    })

});

app.get('/getTruckCollectionRecord', function(req,res){
    'use strict';

    var sql="SELECT * FROM tbltruckcollectionrecord ORDER BY myDate DESC, device, zoneIn";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    })
});

app.post('/updateACRCustCompanyName', function(req,res){
    var sql="UPDATE tblacrcust SET company = '" + req.body.company + "' WHERE acrCustID = '" + req.body.id + "'";

    database.query(sql, function(err){
        if(err){
            throw err;
        }else{
            res.json({status: "success"});
        }
    })
});

app.post('/updateAcrBilling', function(req,res){
    'use strict';

    var sql = 'INSERT INTO tblacrpaymenthist(acrCustID, amount, date) VALUES ?';
    var myObj = req.body;
    var myData = [];

    for(var i=0; i<myObj.length; i++){
        myData.push([myObj[i].acrCustID, myObj[i].amount, myObj[i].date])
    }
   
    database.query(sql,[myData], function(err){
        if(err){
            throw err;
        }else{
            res.json({status: "success"});
        }
    })
});

module.exports = app;