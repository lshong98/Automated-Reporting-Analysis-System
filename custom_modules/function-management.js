/*jslint node:true*/
var express = require('express');
var app = express();
var database = require('./database-management');
var variable = require('../variable');
var dateTime = variable.dateTime;

function makeID(keyword, creationDate) {
    'use strict';
    var table, property, header, ID,
        getDateArr, row, stringRow, prefix, i, generatedID,
        getDate = creationDate.split(' '),
        sql = "";
    
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
        header = "BDF";
        break;
    case "dbd":
        table = "tbldbd";
        property = "dbdID";
        header = "DBD";
        break;
    case "dbr":
        table = "tbldbr";
        property = "dbrID";
        header = "DBR";
        break;
    case "blost":
        table = "tblblost";
        property = "blostID";
        header = "BST";
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
    case "history": 
        table = "tblhistory";
        property = "historyID";
        header = "HIS";
        break; 
    case "complaint":
        table = "tblcomplaintofficer";
        property = "coID";
        header = "CMP";
        break;
    default:
        break;
    }
    
    sql = "SELECT " + property + " FROM " + table + " WHERE creationDateTime LIKE '%" + getDate[0] + "%'";
    console.log(sql);
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
}

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
    });
}

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

function logTransaction(date, staffID, action, description, rowID, tblName) {
    var sql = "INSERT INTO tbllog (date, staffID, authorizedBy, action, description, rowID, tblName) VALUE ('" + date + "', '" + staffID + "', NULL, '" + action + "', '" + description + "', '" + rowID + "', '" + tblName + "')";
    
//    database.query(sql, function (err, result) {
//        if (err) {
//            throw err;
//        }
//    });
}

function sendForAuthorization(date, staffId, action, description, rowID, tblName, query) {
    var dt = dateTime.create().format('Y-m-d H:M:S');
    console.log(dt);
    var sql = "INSERT INTO tblauthorization (date, staffId, action, description, authorizedBy, rowID, tblName, authorize, query) VALUES (now(), \"" + staffId + "\", \"" + action + "\", \"" + description +  "\", NULL, \"" + rowID +"\", \""+ tblName + "\", 'M', " + query + ")";

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
        case "show managerDashboard":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.managerDashboard.view == \'A\'" role="menuitem"><a class="menu__link" href="#/dashboard-manager"><i class="fa fa-tachometer-alt"></i> Manager Dashboard</a></li>';
            }
        case "create reporting":
            if (status == 'A') {
                return '<li data-ng-show="navigation.officer" class="menu__item" role="menuitem"><a class="menu__link" href="#/dashboard-officer"><i class="fa fa-tachometer-alt"></i> Officer Dashboard</a></li>';
            }
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
        case "view newBusiness":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.newBusiness.view == \'A\'" role="menuitem"><a class="menu__link" href="#/new-business"><i class="fas fa-dumpster"></i> New Business</a></li>';
            }
        case "view binStock":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.binStock.view == \'A\'" role="menuitem"><a class="menu__link" href="#/bin-stock"><i class="fas fa-dumpster"></i> Bin Stock</a></li>';
            }
        case "view authorization":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.authorization.view == \'A\'" role="menuitem"><a class="menu__link" href="#/authorization"><i class="fas fa-clipboard-check"></i> Task Authorization <span class="authorization"></span></a></li>';
            }
        case "view formAuthorization":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.formAuthorization.view == \'A\'" role="menuitem"><a class="menu__link" href="#/form-authorization"><i class="fas fa-clipboard-check"></i> Form Authorization <span class="form-authorization"></span></a></li>';
            }
        case "view complaintlist": 
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.complaintlist.view == \'A\'" role="menuitem"><a class="menu__link" href="#/complaint-module"><i class="fas fa-bullhorn"></i> Complaint Module <span class="complaint"></span></a></li>';
            }
        case "view complaintofficer": 
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.complaintofficer.view == \'A\'" role="menuitem"><a class="menu__link" href="#/complaint-officer"><i class="fas fa-bullhorn"></i> Complaint Officer </a></li>';
            }
        case "view transactionLog":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/history"><i class="fa fa-bell"></i> Transaction Log</a></li>';
            }
        case "view delivery":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.delivery.view == \'A\'" role="menuitem"><a class="menu__link" href="#/delivery-management"><i class="fas fa-truck-loading"></i> Delivery Management</a></li>';
        }
        case "view damagedBin":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.damagedBin.view == \'A\'" role="menuitem"><a class="menu__link" href="#/damaged-bin"><i class="fas fa-dumpster-fire"></i> Damaged Bin Management</a></li>';
        }
        case "view lostBin":
            if (status == 'A') {
                return '<li class="menu__item" data-ng-show="show.lostBin.view == \'A\'" role="menuitem"><a class="menu__link" href="#/lost-bin"><i class="fas fa-truck-loading"></i> Lost Bin Management</a></li>';
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
        case "send notif":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/post-announcement"><i class="fa fa-file"></i> Post Announcements</a></li>';
            }
        case "approve binrequest":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/manage-bin-request"><i class="fa fa-file"></i> Manage Bin Request <span class="binrequest"></span></a></li>';
            }
        case "view feedback":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/customer-feedback"><i class="fa fa-file"></i> Customer Feedback <span class="satisfaction"></span></a></li>';
            }
        case "view enquiry":
            if (status == 'A') {
                return '<li class="menu__item" role="menuitem"><a class="menu__link" href="#/customer-enquiry"><i class="fa fa-file"></i> Customer Enquiry <span class="enquiry"></span></a></li>';
            }
    }
}

function insertNewData(query, req, res) {
    var dt = dateTime.create().format('Y-m-d H:M:S');
    database.query(query, function (err, result) {
        if (err) {
            throw err;
        }
        res.json({"status": "success", "message": "Task Approved."})
        res.end();
    });
}

function log(dt, title, content, staff) {
    var sql = "";
    
    database.query("SELECT now() AS serverdate",function(err,result){
        
        if(err){
            throw err;
        }

        dt = dateTime.create();
        dt._now = result[0].serverdate;
        dt = dt.format('Y-m-d H:M:S');
        makeID('history', dt).then(function (ID) {
            sql = "INSERT INTO tblhistory (historyID, title, content, staffID, creationDateTime, status) VALUE ('" + ID + "', '" + title + "', '" + content + "', '" + staff + "', now(), 'A')";
            database.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
            });
        });
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
exports.log = log;