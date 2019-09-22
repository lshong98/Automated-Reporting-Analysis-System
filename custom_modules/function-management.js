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
        case "bincenter":
            table = "tblbincenter";
            property = "binCenterID";
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
        case "dcs":
            table = "tbldcs";
            property = "dcsID";
            header = "DCS";
            break;
        case "bdaf":
            table = "tblbdaf";
            property = "bdafID";
            header = "BDAF";
            break;
        case "dbd":
            table = "tbldbd";
            property = "dbdID";
            header = "DBD";
            break;
        case "blost":
            table = "tblblost";
            property = "blostID";
            header = "BLOST";
            break;
        case "customer":
            table = "tblcustomer";
            property = "customerID";
            header = "CUS";
            break;
        case "chat":
            table = "tblchat";
            property = "chatID";
            header = "CHT";
            break;
        case "boundary":
            table = "tblboundary";
            property = "boundaryID";
            header = "BND";
            break;
        default: break;
    }
    
    var sql = "SELECT " + property + " FROM " + table + " WHERE creationDateTime LIKE '%" + getDate[0] + "%'";
    return new Promise(function (resolve, reject) {
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
    console.log(database);
};

function boundaryID(date, polygons) {
    'use strict';
    
    date = date.split(' ');
    var prefix, ID, getDateArr, row, stringRow, i, header = "BND", boundaryJSON;
    
    var sql = "SELECT boundaryID FROM tblboundary WHERE creationDateTime LIKE '%" + date[0] + "%'";
    return new Promise(function (resolve, reject) {
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            } else {
                getDateArr = date[0].split('-');
                row = result.length;
                row += 1;
                stringRow = row.toString();
                prefix = '';
                for (i = stringRow.length; i < 4; i += 1) {
                    prefix += '0';
                }
                ID = header + getDateArr[0] + getDateArr[1] + getDateArr[2] + prefix + row;
                boundaryJSON = {"ID": ID, "polygons": polygons};
                resolve(boundaryJSON);
            }
        });
    })
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

function logTransaction(date, staffID, action, description, authorizedBy, rowID, tblName) {
    var sql = "INSERT INTO tbllog (date, staffID, authorizedBy, action, description, rowID, tblName) VALUE ('" + date + "', '" + staffID + "', NULL, '" + action + "', '" + description + "', '" + rowID + "', '" + tblName + "')";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        
    });
}

function sendForAuthorization(date, staffId, action, description, authorizedBy, rowID, tblName, query) {
    
    var sql = "INSERT INTO tblauthorization (date, staffId, action, description, authorizedBy, rowID, tblName, authorize, query) VALUES (\"" + date + "\", \"" + staffId + "\", \"" + action + "\", \"" + description +  "\", NULL, \"" + rowID +"\", \""+ tblName + "\", 'M', " + query + ")";
    
    //var sql = "INSERT INTO tblauthorization (date, staffID, action, description, rowID, tblName, authorize, query) VALUES ('"+ date +"', '"+ staffId +"', '"+ action +"', '"+ description +"', '"+ rowID +"', '"+ tblName +"', 'M', '"+ query +"')";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("sent for authorization");
    });
}

function menuItem(keyword, status) {
    switch (keyword) {
        case "view account":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.account.view == \'A\'" role="menuitem"><a class="menu__link" href="#/account-management"><i class="fa fa-users"></i> Account Management</a></li>';
            }
        case "view truck":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.truck.view == \'A\'" role="menuitem"><a class="menu__link" href="#/truck-management"><i class="fa fa-truck"></i> Truck Management</a></li>';
            }
        case "view zone":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.zone.view == \'A\'" role="menuitem"><a class="menu__link" href="#/zone-management"><i class="fa fa-vector-square"></i> Zone Management</a></li>';
            }
        case "view area":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.area.view == \'A\'" role="menuitem"><a class="menu__link" href="#/area-management"><i class="fa fa-map"></i> Area Management</a></li>';
            }
        case "view bin":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.bin.view == \'A\'" role="menuitem"><a class="menu__link" href="#/bin-management"><i class="fa fa-dumpster"></i> Bin Center Management</a></li>';
            }
        case "view acr":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.acr.view == \'A\'" role="menuitem"><a class="menu__link" href="#/acr-management"><i class="fa fa-bookmark"></i> ACR Management</a></li>';
            }
        case "view database":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.database.view == \'A\'" role="menuitem"><a class="menu__link" href="#/bin-database"><i class="fas fa-warehouse"></i> Wheel Bin Database</a></li>';
            }
        case "view inventory":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.inventory.view == \'A\'" role="menuitem"><a class="menu__link" href="#/bin-inventory"><i class="fas fa-dumpster"></i> Wheel Bin Inventory</a></li>';
            }
        case "view authorization":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.authorization.view == \'A\'" role="menuitem"><a class="menu__link" href="#/authorization"><i class="fas fa-clipboard-check"></i> Task Authorization <span class="authorization"></span></a></li>';
            }
        case "view formAuthorization":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.formAuthorization.view == \'A\'" role="menuitem"><a class="menu__link" href="#/form-authorization"><i class="fas fa-clipboard-check"></i> Form Authorization <span class="authorization"></span></a></li>';
            }
        case "view complaintlist":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.complaintlist.view == \'A\'" role="menuitem"><a class="menu__link" href="#/complaint-module"><i class="fas fa-bullhorn"></i> Complaint Module</a></li>';
            }
        case "view transactionLog":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/notification"><i class="fa fa-bell"></i> Transaction Log</a></li>';
            }
        case "view delivery":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.delivery.view == \'A\'" role="menuitem"><a class="menu__link" href="#/delivery-management"><i class="fas fa-truck-loading"></i> Delivery Management</a></li>';
        }
        case "view damagedlost":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.damagedlost.view == \'A\'" role="menuitem"><a class="menu__link" href="#/damaged-lost-bin"><i class="fas fa-dumpster-fire"></i> Damaged & Lost Bin Management</a></li>';
        }
        case "view role":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/role-management"><i class="fa fa-lock"></i> Role Management</a></li>';
            }
        case "view visualization":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/data-visualization"><i class="fa fa-chart-area"></i> Data Analysis &amp; Visualize</a></li>';
            }
        case "view reporting":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/reporting"><i class="fa fa-file"></i> Reporting</a></li>';
            }
        case "upload banner":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/upload-image-carousel"><i class="fa fa-file"></i> Upload Banner</a></li>';
            }
        case "approve user":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/approve-app-user"><i class="fa fa-file"></i> Approve Users</a></li>';
            }
        case "send notif":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/post-announcement"><i class="fa fa-file"></i> Post Announcements</a></li>';
            }
        case "approve binrequest":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/approve-bin-request"><i class="fa fa-file"></i> Approve Bin Request</a></li>';
            }
            case "view dcsDetails":
                    if (status == 'A') {
                        return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/approve-bin-request"><i class="fa fa-file"></i> DCS Details</a></li>';
                    } 
            case "view dbdDetails":
                    if (status == 'A') {
                        return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/approve-bin-request"><i class="fa fa-file"></i> DBD Details</a></li>';
                    }   
                    case "view blostDetails":
                            if (status == 'A') {
                                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/approve-bin-request"><i class="fa fa-file"></i> BLOST Details</a></li>';
                            } 
                            case "view bdafDetails":
                                    if (status == 'A') {
                                        return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/approve-bin-request"><i class="fa fa-file"></i> BDAF Details</a></li>';
                                    } 
        
    }
}

function insertNewData(query, req, res) {
    database.query(query, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Task Approved."})
        res.end();
    });
}

function waterfallQuery(query) {
    'use strict';
    return new Promise(function (resolve, reject) {
        database.query(query, function (err, result) {
            if (err) {
                throw err;
            } else {
                resolve(result[0]);
            }
        })
    });
}

exports.makeID = makeID;
exports.checkAuthority = checkAuthority;
exports.logTransaction = logTransaction;
exports.sendForAuthorization = sendForAuthorization;
exports.menuItem = menuItem;
exports.insertNewData = insertNewData;
exports.waterfallQuery = waterfallQuery;
exports.boundaryID = boundaryID;