var express = require('express');
var app = express();
var database = require('./database-management');
var f = require('./function-management'); 
 
// ACR Management
app.post('/addDcs',function(req,res){
    'use strict';

    f.makeID("dcs", req.body.creationDate).then(function (ID) {
         
        var sql = "INSERT INTO tbldcs (dcsID, creationDateTime, driverID, areaID, periodFrom, periodTo, replacementDriverID, replacementPeriodFrom, replacementPeriodTo, preparedBy, status) VALUE ('" + ID + "', '" + req.body.creationDate + "' , '" + req.body.driverID + "', '" +  req.body.areaID + "', '" + req.body.periodFrom + "', '" + req.body.periodTo + "', '" + req.body.replacementDriverID + "', '" + req.body.replacementPeriodFrom + "', '" + req.body.replacementPeriodTo + "', '" + req.body.preparedBy + "', 'A')";
        console.log(sql); 
        database.query(sql, function (err, result) {
            if (err) { 
                throw err;
            }
            // for (i = 0; i < days.length; i += 1) {
            //     if (req.body.days[days[i]] != undefined) {
            //         var sql = "INSERT INTO tblacrfreq (acrID, areaID, day) VALUE ('" + acrID + "', '" + req.body.area + "', '" + days[i] + "')";
            //         database.query(sql, function (err, result) {
            //             if (err) {
            //                 throw err;
            //             }
            //         }); 
            //     }
            // }
            res.json({"status": "success", "message": "ACR created!", "details": {"dcsID": ID}});
        });
    });
}); // Complete
app.post('/getAllDcs', function(req,res){
    'use strict'; 

    var sql = "SELECT dcsID AS id, creationDateTime, driverID, periodFrom, periodTo, replacementDriverID, replacementPeriodFrom, replacementPeriodTo, (CASE WHEN status = 'A' THEN 'ACTIVE' WHEN status = 'I' THEN 'INACTIVE'  WHEN status = 'P' THEN 'PENDING' WHEN status = 'G' THEN 'APPROVED' WHEN status = 'C' THEN 'COMPLETE' WHEN status = 'R' THEN 'CORRECTION REQUIRED' END) AS status from tbldcs where status != 'I'";
    //var sql = "SELECT DISTINCT a.acrID AS id, a.acrName AS name, a.acrPhoneNo AS phone, a.acrAddress AS address, DATE_FORMAT(a.acrPeriod, '%d %M %Y') as enddate, c.areaName as area,(CASE WHEN a.acrStatus = 'A' THEN 'ACTIVE' WHEN a.acrStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblacr a INNER JOIN tblacrfreq b ON a.acrID = b.acrID INNER JOIN tblarea c ON c.areaID = b.areaID";
    
    // if(req.body.status){
    //     sql += " WHERE status = 'A'";
    // }else{
    //     sql += " WHERE status = 'I'";
    // }
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        }
        res.json(result);
    }); 
});

app.post('/getAllAcr', function(req,res){
    'use strict'; 
    var sql = "SELECT a.acrID, a.areaID, c.companyName, concat(c.houseNo, ', ', c.streetNo, ', ', c.postCode, ', ', c.city) as address, a.from, a.to, a.beBins, a.acrBins, a.mon, a.tue, a.wed, a.thu, a.fri, a.sat, a.remarks FROM tblacr as a inner join tblcustomer as c on a.customerID = c.customerID";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        }
        res.json(result);
    }); 
});

app.post('/getDcsDetails', function(req,res){
    'use strict';
    //var sql = "SELECT a.acrID, a.areaID, c.companyName, concat(c.houseNo, ', ', c.streetNo, ', ', c.postCode, ', ', c.city) as address, a.from, a.to, a.beBins, a.acrBins, a.mon, a.tue, a.wed, a.thu, a.fri, a.sat, a.remarks FROM tblacr as a inner join tblcustomer as c on a.customerID = c.customerID WHERE a.from BETWEEN '" + req.body.periodFrom + "' AND '" + req.body.periodTo + "' OR a.to BETWEEN '" + req.body.periodFrom + "' AND '" + req.body.periodTo + "'";
    
    var sql = "SELECT a.acrID, a.areaID, c.companyName, concat(c.houseNo, ', ', c.streetNo, ', ', c.postCode, ', ', c.city) as address, a.from, a.to, a.beBins, a.acrBins, a.mon, a.tue, a.wed, a.thu, a.fri, a.sat, a.remarks FROM tblacr a inner join tblcustomer c on a.customerID = c.customerID WHERE a.dcsID = '" + req.body.dcsID + "'";
    
console.log(sql);
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        } 
         
        res.json(result); 
    });
});  


app.post('/addDcsEntry',function(req,res){ 
    'use strict';
console.log("TEST")
    f.makeID("acr", req.body.creationDate).then(function (ID) {

        var sql = "SELECT areaID FROM tbltaman t inner join tblcustomer c on c.tamanID = t.tamanID WHERE customerID = '" + req.body.customerID + "'";

        database.query(sql, function (err, result) { 
            if (err) {
                console.log("err1")
                throw err;
            }

            var areaID = result[0].areaID;
            

            sql = "INSERT INTO tblacr (acrID, dcsID, creationDateTime, customerID, beBins, acrBins, areaID, mon, tue, wed, thu, fri, sat, remarks) VALUE ('" + ID + "', '" + req.body.dcsID + "' , '"  + req.body.creationDate + "', '" + req.body.customerID + "', '"  + req.body.beBins + "', '" + req.body.acrBins + "', '" + areaID + "', '"+ req.body.mon + "', '" + req.body.tue + "', '" + req.body.wed + "', '" + req.body.thu + "', '" + req.body.fri + "', '"+ req.body.sat + "', '" + req.body.remarks + "')";
             
            database.query(sql, function (err, result) {
            if (err) {
                console.log("err2")
                throw err;

            }

                 

                    res.json({"status": "success", "message": "ACR created!", "details": {"acrID": ID}});
              

            
           });
 
        });

        
});
}); // Complete
 
app.post('/addAcr',function(req,res){ 
    'use strict';

        var sql = "INSERT INTO tblacr (acrID, `from`, `to`, customerID, beBins, acrBins, mon, tue, wed, thu, fri, sat, remarks) VALUE ('" + req.body.acrID + "', '" + req.body.from + "', '" + req.body.to + "', '" + req.body.customerID + "', '" + req.body.beBins + "', '" + req.body.acrBins + "', '" + req.body.mon + "', '" + req.body.tue + "', '" + req.body.wed + "', '" + req.body.thu + "', '" + req.body.fri + "', '" + req.body.sat + "', '" + req.body.remarks + "')";

        database.query(sql, function (err, result) { 
        if (err) {
            throw err;

        }

                

                res.json({"status": "success", "message": "ACR created!", "details": {"acrID": req.body.acrID}});
            

        
        });

}); // Complete

app.post('/updateAcr', function(req,res){
    'use strict';

    var sql = "UPDATE tblacr SET `from` = '" + req.body.from + "', `to` = '" + req.body.to + "', customerID = '" + req.body.customerID + "', beBins = '" + req.body.beBins + "', acrBins = '" + req.body.acrBins + "', mon = " + req.body.mon + ", tue = " + req.body.tue + ", wed = " + req.body.wed + ", thu = " + req.body.thu + ", fri = " + req.body.fri + ", sat = " + req.body.sat + ", remarks = '" + req.body.remarks + "' WHERE acrID = '" + req.body.acrID + "'";
    //var sql = "SELECT DISTINCT a.acrID AS id, a.acrName AS name, a.acrPhoneNo AS phone, a.acrAddress AS address, DATE_FORMAT(a.acrPeriod, '%d %M %Y') as enddate, c.areaName as area,(CASE WHEN a.acrStatus = 'A' THEN 'ACTIVE' WHEN a.acrStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblacr a INNER JOIN tblacrfreq b ON a.acrID = b.acrID INNER JOIN tblarea c ON c.areaID = b.areaID";

    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        } 
         
        res.json(result);
    });
}); 

app.post('/updateDcsEntry', function(req,res){
    'use strict';

    var sql = "UPDATE tblacr SET customerID = '" + req.body.customerID + "', beBins = '" + req.body.beBins + "', acrBins = '" + req.body.acrBins + "', mon = " + req.body.mon + ", tue = " + req.body.tue + ", wed = " + req.body.wed + ", thu = " + req.body.thu + ", fri = " + req.body.fri + ", sat = " + req.body.sat + ", remarks = '" + req.body.remarks + "' WHERE acrID = '" + req.body.acrID + "'";
    //var sql = "SELECT DISTINCT a.acrID AS id, a.acrName AS name, a.acrPhoneNo AS phone, a.acrAddress AS address, DATE_FORMAT(a.acrPeriod, '%d %M %Y') as enddate, c.areaName as area,(CASE WHEN a.acrStatus = 'A' THEN 'ACTIVE' WHEN a.acrStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblacr a INNER JOIN tblacrfreq b ON a.acrID = b.acrID INNER JOIN tblarea c ON c.areaID = b.areaID";

    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        } 
         
        res.json(result);
    });
}); 

app.post('/deleteAcr', function(req,res){
    'use strict';

    var sql = "DELETE FROM tblacr WHERE acrID = '" + req.body.acrID + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        } 
         
        
        res.json({"status": "success", "message": "ACR created!", "details": {"acrID": req.body.acrID}});

    });
}); 

app.get('/getCustomerList', function(req,res){
    'use strict';
    
    var sql = "SELECT * from tblcustomer";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        }
        res.json(result);
    }); 
});

app.post('/getDcsInfo',function(req,res){ 
    'use strict';

    var sql = "SELECT * from tbldcs where dcsID = '" + req.body.id + "'";
    database.query(sql, function (err, result) { 
        if (err) { 
            throw err;
        }

        res.json(result);
    });
}); // Complete

app.post('/filterAddress',function(req,res){ 
    'use strict';

    var sql = "SELECT * from tblcustomer where companyName = '" + req.body.companyName + "'";
    database.query(sql, function (err, result) {
        if (err) { 
            throw err;
        }

        res.json(result); 
    });
}); // Complete

app.post('/filterArea',function(req,res){ 
    'use strict';

    var sql = "SELECT * from tblarea where driverID = '" + req.body.driverID + "'";
    database.query(sql, function (err, result) {
        if (err) { 
            throw err;
        }

        res.json(result);

    });
}); // Complete 

app.post('/getAreaList',function(req,res){ 
    'use strict';
    console.log("GETTING AREA LIST")
    var sql = "SELECT concat(z.zoneCode, a.areaCode) as areaCode from tblzone z inner join tblarea a on z.zoneID = a.zoneID";
    database.query(sql, function (err, result) {
        if (err) { 
            throw err;
        }

        res.json(result);

    });
}); // Complete

app.post('/getStaffList', function(req,res){
    'use strict';


    var positionID = '';

    var sql = "SELECT positionID from tblposition WHERE positionName = '" + req.body.position + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err; 
        }

        var newsql = "SELECT * from tblstaff where positionID = '" + result[0].positionID + "'";

    database.query(newsql, function (err, result) {
        if (err) {
            throw err; 
        }
        res.json(result);

    }); 
    }); 
    
});

app.post('/completeDcs',function(req,res){ 
    'use strict';


    var sql = "update tbldcs set status = 'C' where status = 'G' AND periodTo < '" + req.body.date + "'";
    database.query(sql, function (err, result) {
        if (err) { 
            throw err;
        }

        res.json(result);
    });
}); // Complete
module.exports = app; 