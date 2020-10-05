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

    var sql= "INSERT INTO tblbindatabase(serialNo, brand, size, binInUse, date, name, contact, ic, propertyNo, tmnkpg, address, company, typeOfPro, pic, communal, council, binStatus, comment, writtenOff) VALUE ('" + serialNo + "', '" + brand + "', '" + binSize + "', '" + binInUse + "', '" + date + "', '" + name + "', '" + contact + "', '" + ic + "', '" + propertyNo + "', '" + tmnkpg + "', '" + address + "', '" + company + "', '" + typeOfPro + "', '" + pic + "', '" + communal + "', '" + council + "', '" + binStatus + "', '" + comment + "', '" + writtenOff + "')";
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

    var serialNo = req.body.serialNo.replace(/'/g,"\\'");
    var brand = req.body.brand.replace(/'/g,"\\'");
    var binSize = req.body.size.replace(/'/g,"\\'");
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
    var pic = req.body.newPic;
    var communal = req.body.communal.replace(/'/g,"\\'");
    var council = req.body.council.replace(/'/g,"\\'");
    var binStatus = req.body.binStatus.replace(/'/g,"\\'");
    var comment = req.body.comment.replace(/'/g,"\\'");
    var writtenOff = req.body.writtenOff.replace(/'/g,"\\'");  
    var id = req.body.id;

    if (pic !== '') {
        pic = makeImage(pic, serialNo);
        var sql= "UPDATE tblbindatabase SET serialNo = '" + serialNo + "', brand = '" + brand + "', size = ' " + binSize + "', binInUse = '" + binInUse + "', date = '" + date + "', name = '" + name + "', contact = '" + contact + "', ic ='" + ic + "', propertyNo = '" + propertyNo + "', tmnkpg = '" + tmnkpg + "', address = '" + address + "', company = '" + company + "', typeOfPro = '" + typeOfPro + "', pic = '" + pic + "', communal = '" + communal + "', council = '" + council + "', binStatus = '" + binStatus + "', comment = '" + comment + "', writtenOff = '" + writtenOff + "' WHERE id = '" + id + "'";
    } else {
        var sql= "UPDATE tblbindatabase SET serialNo = '" + serialNo + "', brand = '" + brand + "', size = ' " + binSize + "', binInUse = '" + binInUse + "', date = '" + date + "', name = '" + name + "', contact = '" + contact + "', ic ='" + ic + "', propertyNo = '" + propertyNo + "', tmnkpg = '" + tmnkpg + "', address = '" + address + "', company = '" + company + "', typeOfPro = '" + typeOfPro + "', communal = '" + communal + "', council = '" + council + "', binStatus = '" + binStatus + "', comment = '" + comment + "', writtenOff = '" + writtenOff + "' WHERE id = '" + id + "'";
    }

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Edit Successfull"});
    });
});

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
    console.log(req.body);
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
module.exports = app;