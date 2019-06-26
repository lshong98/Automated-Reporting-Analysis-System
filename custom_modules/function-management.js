var express = require('express');
var app = express();
var database = require('./database-management');

function makeID(keyword, creationDate) {
    var table, property, header, ID;
    var getDateArr, row, stringRow, prefix, i, generatedID;
    var getDate = creationDate.split(' ');
    
    switch (keyword) {
        case "account":
            table = "tblstaff";
            property = "staffID";
            header = "ACC";
            break;
        case "truck":
            table = "tbltruck";
            property = "truckID";
            header = "TRK";
            break;
        case "zone":
            table = "tblzone";
            property = "zoneID";
            header = "ZON";
            break;
        case "area":
            table = "tblarea";
            property = "areaID";
            header = "ARE";
            break;
        case "bin":
            table = "tblbin";
            property = "binID";
            header = "BIN";
            break;
        case "role":
            table = "tblposition";
            property = "positionID";
            header = "ATH";
            break;
        case "acr":
            table = "tblacr";
            property = "acrID";
            header = "ACR";
            break;
        case "report":
            table = "tblreport";
            property = "reportID";
            header = "RPT";
            break;
        default: break;
    }
    
    var sql = "SELECT " + property + " FROM " + table + " WHERE creationDateTime LIKE '%" + getDate[0] + "%'";
    return new Promise(resolve => {
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }

            getDateArr = getDate[0].split('-');

            row = result.length;
            row += 1;
            stringRow = row.toString();
            prefix = '';
            for (i = stringRow.length; i < 4; i += 1) {
                prefix += '0';
            }
            ID = header + getDateArr[0] + getDateArr[1] + getDateArr[2] + prefix + row;
            resolve(ID);
        });
    });
};

function checkAuthority(keyword, whoIs) {
    'use strict';
    
    var sql;
    
    switch (keyword) {
        case "create account":
            sql = "SELECT tblaccess.status FROM tblstaff JOIN tblposition ON tblstaff.positionID = tblposition.positionID JOIN tblaccess ON tblposition.positionID = tblaccess.positionID JOIN tblmanagement ON tblmanagement.mgmtID = tblaccess.mgmtID WHERE tblmanagement.mgmtName = 'create account' AND tblstaff.staffID = '" + whoIs + "'";
            break;
    }
    return new Promise(resolve => {
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            resolve(result[0].status);
        });
    });
};

exports.makeID = makeID;
exports.checkAuthority = checkAuthority;