/*jslint node:true*/
var variable = require('../variable');
var express = variable.express;
var dateTime = variable.dateTime;
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const e = require('express');
const storage = new Storage({
    keyFilename: './trienekens-management-portal-5c3ad8aa7ee2.json',
    projectId: 'trienekens-management-portal'
});
const bucketName = 'trienekens-management-portal-images';
const local_directory = './images/bin-database';


app.post('/getBinDatabaseList', function(req, res){
    'use strict';
    if(req.body.field == 'address'){
        var sql = "SELECT * FROM tblbindatabase WHERE address LIKE '%" +req.body.value + "%' OR tmnkpg LIKE '%" +req.body.value + "%'";
    }else if(req.body.field == 'serialNo'){
        var sql = "SELECT * FROM tblbindatabase WHERE serialNo LIKE '%" +req.body.value + "%' OR comment LIKE '%" +req.body.value + "%'";
    }else if(req.body.field == 'date'){
        
        if(req.body.value == null){
            var sql = "SELECT * FROM tblbindatabase WHERE date is NULL";
        }else{
            var sql = "SELECT * FROM tblbindatabase WHERE date = '" + req.body.value + "'";
        }
    }else if(req.body.field == 'keyInDate'){
        if(req.body.value == null){
            var sql = "SELECT * FROM tblbindatabase WHERE keyInDate is NULL";
        }else{
            var sql = "SELECT * FROM tblbindatabase WHERE keyInDate = '" + req.body.value + "'";
        }
    }else if(req.body.field == 'changesDate'){
        if(req.body.value == null){
            var sql = "SELECT * FROM tblbindatabase WHERE changesDate is NULL";
        }else{
            var sql = "SELECT * FROM tblbindatabase WHERE changesDate = '" + req.body.value + "'";
        }
        
    }else{
        var sql = "SELECT * FROM tblbindatabase WHERE " + req.body.field + " LIKE '%" +req.body.value + "%'";
    }

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });    
});

app.post('/addBinDatabase', function(req, res){
    'use strict';

    if (!fs.existsSync(local_directory)) {
        fs.mkdirSync(local_directory);
    }

    function makeImage (image, ID) {
        var base64Image = image.split(';base64,').pop();
        var extension = image.split(';base64,')[0].split('/')[1];
        var image_path = '/' + ID + '.' + extension;
        var local_store_path = 'images/bin-database'+ image_path,
            public_url = 'https://storage.googleapis.com/' + bucketName + '/' + local_store_path;
        
        fs.writeFile(local_store_path, base64Image, {encoding: 'base64'}, async function (err) {
            if (err) throw err;

            await storage.bucket(bucketName).upload('./' + local_store_path, {
                gzip: true,
                metadata: {
                    cacheControl: 'public, no-cache',
                },
                public: true,
                destination: local_store_path
            });
        });
        return public_url;
    }
        
    var serialNo = req.body.serialNo.replace(/'/g,"\\'");
    var brand = req.body.brand.replace(/'/g,"\\'");
    var binSize = req.body.binSize.replace(/'/g,"\\'");
    var binInUse = req.body.binInUse.replace(/'/g,"\\'");
    var date = req.body.date;
    var name = req.body.name.replace(/'/g,"\\'");
    var contact = req.body.contact.replace(/'/g,"\\'");
    var ic = req.body.ic.replace(/'/g,"\\'");
    var propertyNo = req.body.propertyNo.replace(/'/g,"\\'");
    var tmnkpg = req.body.tmnkpg.replace(/'/g,"\\'");
    var address = req.body.address.replace(/'/g,"\\'");
    var company = req.body.company.replace(/'/g,"\\'");
    var typeOfPro = req.body.typeOfPro.replace(/'/g,"\\'");
    var pic = req.body.pic;
    var communal = req.body.communal.replace(/'/g,"\\'");
    var council = req.body.council.replace(/'/g,"\\'");
    var binStatus = req.body.binStatus.replace(/'/g,"\\'");
    var comment = req.body.comment.replace(/'/g,"\\'");
    var writtenOff = req.body.writtenOff.replace(/'/g,"\\'");

    if (pic !== '') {
        pic = makeImage(pic, serialNo);
    } else {
        pic = '';
    }

    if(date == "" || date == null){
        var sql= "INSERT INTO tblbindatabase(serialNo, brand, size, binInUse, name, contact, ic, propertyNo, tmnkpg, address, company, typeOfPro, pic, communal, council, binStatus, comment, writtenOff, keyInDate) VALUE ('" + serialNo + "', '" + brand + "', '" + binSize + "', '" + binInUse + "', '" + name + "', '" + contact + "', '" + ic + "', '" + propertyNo + "', '" + tmnkpg + "', '" + address + "', '" + company + "', '" + typeOfPro + "', '" + pic + "', '" + communal + "', '" + council + "', '" + binStatus + "', '" + comment + "', '" + writtenOff + "', NOW())";
    }else{
        var sql= "INSERT INTO tblbindatabase(serialNo, brand, size, binInUse, date, name, contact, ic, propertyNo, tmnkpg, address, company, typeOfPro, pic, communal, council, binStatus, comment, writtenOff, keyInDate) VALUE ('" + serialNo + "', '" + brand + "', '" + binSize + "', '" + binInUse + "', '" + date + "', '" + name + "', '" + contact + "', '" + ic + "', '" + propertyNo + "', '" + tmnkpg + "', '" + address + "', '" + company + "', '" + typeOfPro + "', '" + pic + "', '" + communal + "', '" + council + "', '" + binStatus + "', '" + comment + "', '" + writtenOff + "', NOW())";
    }
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Submit Successfull"});
    });
});

app.post('/editBinDatabase', function(req, res){
    'use strict';

    if (!fs.existsSync(local_directory)) {
        fs.mkdirSync(local_directory);
    }

    function makeImage (image, ID) {
        var base64Image = image.split(';base64,').pop();
        var extension = image.split(';base64,')[0].split('/')[1];
        var image_path = '/' + ID + '.' + extension;
        var local_store_path = 'images/bin-database'+ image_path,
            public_url = 'https://storage.googleapis.com/' + bucketName + '/' + local_store_path;
        
        fs.writeFile(local_store_path, base64Image, {encoding: 'base64'}, async function (err) {
            if (err) throw err;

            await storage.bucket(bucketName).upload('./' + local_store_path, {
                gzip: true,
                metadata: {
                    cacheControl: 'public, no-cache',
                },
                public: true,
                destination: local_store_path
            });
        });
        return public_url;
    }

    var serialNo = req.body.serialNo.replace(/'/g,"\\\\'");
    var brand = req.body.brand.replace(/'/g,"\\\\'");
    var binSize = req.body.size.replace(/'/g,"\\\\'");
    var binInUse = req.body.binInUse.replace(/'/g,"\\\\'");
    var name = req.body.name.replace(/'/g,"\\\\'");
    var contact = req.body.contact.replace(/'/g,"\\\\'");
    var ic = req.body.ic.replace(/'/g,"\\\\'");
    var propertyNo = req.body.propertyNo.replace(/'/g,"\\\\'");
    var tmnkpg = req.body.tmnkpg.replace(/'/g,"\\\\'");
    var address = req.body.address.replace(/'/g,"\\\\'");
    var company = req.body.company.replace(/'/g,"\\\\'");
    var typeOfPro = req.body.typeOfPro.replace(/'/g,"\\\\'");
    var pic = req.body.newPic;
    var communal = req.body.communal.replace(/'/g,"\\\\'");
    var council = req.body.council.replace(/'/g,"\\\\'");
    var binStatus = req.body.binStatus.replace(/'/g,"\\\\'");
    var comment = req.body.comment.replace(/'/g,"\\\\'");
    var writtenOff = req.body.writtenOff.replace(/'/g,"\\\\'");  
    var id = req.body.id;
    if(req.body.date == '' || req.body.date == null){
        var date = null;
    }else{
        var date = "'" + req.body.date + "'";
    }

    if(req.body.keyInDate == '' || req.body.keyInDate == null){
        var keyInDate = null;
    }else{
        var keyInDate = "'" + req.body.keyInDate + "'";
    }

    if (pic !== '') {
        pic = makeImage(pic, serialNo);
        var editSql= "UPDATE tblbindatabase SET serialNo = '" + serialNo + "', brand = '" + brand + "', size = ' " + binSize + "', binInUse = '" + binInUse + "', date = " + date + ", name = '" + name + "', contact = '" + contact + "', ic ='" + ic + "', propertyNo = '" + propertyNo + "', tmnkpg = '" + tmnkpg + "', address = '" + address + "', company = '" + company + "', typeOfPro = '" + typeOfPro + "', pic = '" + pic + "', communal = '" + communal + "', council = '" + council + "', binStatus = '" + binStatus + "', comment = '" + comment + "', writtenOff = '" + writtenOff + "', keyInDate = " + keyInDate + " WHERE id = '" + id + "'";
    } else {
        var editSql= "UPDATE tblbindatabase SET serialNo = '" + serialNo + "', brand = '" + brand + "', size = ' " + binSize + "', binInUse = '" + binInUse + "', date = " + date + ", name = '" + name + "', contact = '" + contact + "', ic ='" + ic + "', propertyNo = '" + propertyNo + "', tmnkpg = '" + tmnkpg + "', address = '" + address + "', company = '" + company + "', typeOfPro = '" + typeOfPro + "', communal = '" + communal + "', council = '" + council + "', binStatus = '" + binStatus + "', comment = '" + comment + "', writtenOff = '" + writtenOff + "', keyInDate = " + keyInDate + " WHERE id = '" + id + "'";
    }

    var content = {
        'serialNo': serialNo,
        'brand': brand,
        'size': binSize,
        'binInUse': binInUse,
        'date': date,
        'name': name,
        'contact': contact,
        'ic':ic,
        'propertyNo': propertyNo,
        'tmnkpg': tmnkpg,
        'address': address,
        'company': company,
        'typeOfPro': typeOfPro,
        'communal': communal,
        'pic': pic,
        'council': council,
        'binStatus': binStatus,
        'comment': comment,
        'writtenOff': writtenOff,
        'keyInDate': keyInDate,
        'id': id
    }
    content = JSON.stringify(content);
    content = content.replace(/"/g,'\\"');
    var sql = "INSERT INTO tblbdblog (requestDate, requestor, action, insertQuery, content, status, changesDate, binID) VALUE (NOW(), '" + req.body.user + "', '1', \"" + editSql + "\", \"" + content + "\", 0, null, '" + id + "')";

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Edit Request Pending"});
    });
});

app.get('/getBdbHistList',function(req, res){
    'use strict';

    var sql = "SELECT tblbdblog.id AS 'id', tblbdblog.requestDate AS 'requestDate', tblstaff.staffName AS 'requestor', tblbdblog.insertQuery AS 'query', tblbdblog.content AS 'content', (CASE WHEN tblbdblog.status = '0' THEN 'Pending' WHEN tblbdblog.status = '1' THEN 'Approve' WHEN tblbdblog.status = '2' THEN 'Reject' END) AS 'status', tblbdblog.changesDate AS 'changesDate', (CASE WHEN tblbdblog.action = '1' THEN 'Edit' WHEN tblbdblog.action = '2' THEN 'Delete' END)AS 'action' FROM tblbdblog JOIN tblstaff ON tblbdblog.requestor = tblstaff.staffID ORDER BY tblbdblog.requestDate DESC";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    })
})

app.post('/getBdbHistDetail', function(req, res){
    'use strict';

    var sql = "SELECT tblbdblog.id AS 'id', tblbdblog.requestDate AS 'requestDate', tblbdblog.insertQuery AS 'query',tblstaff.staffName AS 'requestor', tblbdblog.insertQuery AS 'query', tblbdblog.content AS 'content', (CASE WHEN tblbdblog.status = '0' THEN 'Pending' WHEN tblbdblog.status = '1' THEN 'Approve' WHEN tblbdblog.status = '2' THEN 'Reject' END) AS 'status', tblbdblog.changesDate AS 'changesDate', (CASE WHEN tblbdblog.action = '1' THEN 'Edit' WHEN tblbdblog.action = '2' THEN 'Delete' END)AS 'action', tblbdblog.content AS 'content', tblbdblog.oldContent AS 'oldContent' FROM tblbdblog JOIN tblstaff ON tblbdblog.requestor = tblstaff.staffID WHERE tblbdblog.id = '" + req.body.id + "' ORDER BY tblbdblog.requestDate DESC";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    })
});

app.post('/getBdbOriDetail', function(req, res){
    'use strict';

    var sql= "SELECT * FROM tblbindatabase WHERE id = '" + req.body.id + "'";
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json(result);
    });

})

app.post('/deleteBindatabase', function(req, res){
    'use strict';
    var sql= "DELETE FROM tblbindatabase WHERE id = '" + req.body.id + "'";

    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json({"status": "success", "message": "Delete Successfull"});
    });
});

app.post('/addBatchesBinDB', function(req, res){
    'use strict';
    var sql = "INSERT INTO tblbindatabase (serialNo, brand, size, binInUse) VALUES";
    var num = req.body.serialNum;
    for(var i = 0; i < req.body.volume; i++){
        var serialNo = req.body.serialChar + num;
        sql += "('" + serialNo + "', '" + req.body.binBrand + "', '" + req.body.size + "', 'Inactive'),";
        num++;
    }
    sql = sql.replace(/.$/,";");
    
    database.query(sql, function(err, result){
        if(err){
            throw err;
        }
        res.json({"status": "success", "message": "Bins Added"});
    })
})

app.post('/bdbAprvRejEdit', function(req, res){
    'use strict';

    if(req.body.status == '1'){
        var sql = req.body.query;
        database.query(sql, function(err, result){
            if(err){
                throw err;
            }
            database.query("UPDATE tblbindatabase SET changesDate = NOW() WHERE id = '" + req.body.binId + "'", function(err, result){
                if(err){
                    throw err;
                }
            })
        })
    }
    var oldContent = req.body.oldContent.replace(/'/g,"\\'");
    var sql2 = "UPDATE tblbdblog SET changesDate = NOW(), status = '" + req.body.status + "', oldContent = '" + oldContent + "' WHERE id = '" + req.body.id + "'";
    database.query(sql2, function(err, result){
        if(err){
            throw err;
        }
        res.json({"status": "success", "message": "Success"});
    })
})

app.get('/getInitBinDatabase', function(req, res){
    'use strict';
    
    var sql= "SELECT * FROM tblbindatabase ORDER BY changesDate DESC LIMIT 0, 20";

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });   
})
module.exports = app;