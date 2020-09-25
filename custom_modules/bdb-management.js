/*jslint node:true*/
var variable = require('../variable');
var express = variable.express;
var bcrypt = variable.bcrypt;
var dateTime = variable.dateTime;
var app = express();
var database = require('./database-management');
var f = require('./function-management');

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
    var icPic = req.body.icPic.replace(/'/g,"\\'");
    var sescoPic = req.body.sescoPic.replace(/'/g,"\\'");
    var kwbPic = req.body.kwbPic.replace(/'/g,"\\'");
    var communal = req.body.communal.replace(/'/g,"\\'");
    var council = req.body.council.replace(/'/g,"\\'");
    var binStatus = req.body.binStatus.replace(/'/g,"\\'");
    var comment = req.body.comment.replace(/'/g,"\\'");
    var writtenOff = req.body.writtenOff.replace(/'/g,"\\'");
    var rcDwell = req.body.rcDwell.replace(/'/g,"\\'");
    var binCentre = req.body.binCentre.replace(/'/g,"\\'");
    var acrfSerialNo = req.body.acrfSerialNo.replace(/'/g,"\\'");

    var sql= "INSERT INTO tblbindatabase(serialNo, brand, size, binInUse, date, name, contact, ic, propertyNo, tmnkpg, address, company, typeOfPro, icPic, sescoPic, kwbPic, communal, council, binStatus, comment, writtenOff, rcDwell, binCentre, acrfSerialNo) VALUE ('" + serialNo + "', '" + brand + "', '" + binSize + "', '" + binInUse + "', '" + date + "', '" + name + "', '" + contact + "', '" + ic + "', '" + propertyNo + "', '" + tmnkpg + "', '" + address + "', '" + company + "', '" + typeOfPro + "', '" + icPic + "', '" + sescoPic + "', '" + kwbPic + "', '" + communal + "', '" + council + "', '" + binStatus + "', '" + comment + "', '" + writtenOff + "', '" + rcDwell + "', '" + binCentre + "', '" + acrfSerialNo + "')";

    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Submit Successfull"});
    });
});

app.post('/editBinDatabase', function(req, res){
    'use strict';

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
    var icPic = req.body.icPic.replace(/'/g,"\\'");
    var sescoPic = req.body.sescoPic.replace(/'/g,"\\'");
    var kwbPic = req.body.kwbPic.replace(/'/g,"\\'");
    var communal = req.body.communal.replace(/'/g,"\\'");
    var council = req.body.council.replace(/'/g,"\\'");
    var binStatus = req.body.binStatus.replace(/'/g,"\\'");
    var comment = req.body.comment.replace(/'/g,"\\'");
    var writtenOff = req.body.writtenOff.replace(/'/g,"\\'");
    var rcDwell = req.body.rcDwell.replace(/'/g,"\\'");
    var binCentre = req.body.binCentre.replace(/'/g,"\\'");
    var acrfSerialNo = req.body.acrfSerialNo.replace(/'/g,"\\'");    
    var id = req.body.id;

    var sql= "UPDATE tblbindatabase SET serialNo = '" + serialNo + "', brand = '" + brand + "', size = ' " + binSize + "', binInUse = '" + binInUse + "', date = '" + date + "', name = '" + name + "', contact = '" + contact + "', ic ='" + ic + "', propertyNo = '" + propertyNo + "', tmnkpg = '" + tmnkpg + "', address = '" + address + "', company = '" + company + "', typeOfPro = '" + typeOfPro + "', icPic = '" + icPic + "', sescoPic = '" + sescoPic + "', kwbPic = '" + kwbPic + "', communal = '" + communal + "', council = '" + council + "', binStatus = '" + binStatus + "', comment = '" + comment + "', writtenOff = '" + writtenOff + "', rcDwell = '" + rcDwell + "', binCentre = '" + binCentre + "', acrfSerialNo = '" + acrfSerialNo + "' WHERE id = '" + id + "'";

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
module.exports = app;