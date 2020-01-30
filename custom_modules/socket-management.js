/*jslint node:true*/
var variable = require('../variable');
var database = require('./database-management');
var express = variable.express;
var app = express();
var emitter = variable.emitter;
var io = variable.io;

var users = [];
var connections = [];
var connectedUserList = [];

//------------------------------------------------------------------------------------------
// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function (comparer) {
    'use strict';
    var i = 0;
    
    for (i = 0; i < this.length; i += 1) {
        if (comparer(this[i])) {
            return true;
        }
    }
    return false;
};

// adds an element to the array if it does not already exist using a comparer 
// function
Array.prototype.pushIfNotExist = function (element, comparer) {
    'use strict';
    var i = 0;
    
    if (!this.inArray(comparer)) {
        this.push(element);
    } else {
        for (i = 0; i < this.length; i += 1) {
            if (this[i].user == element.user) {
                this[i].socketID = element.socketID;
            }
        }
    }
};

function searchSocketID(userKey, myArray) {
    'use strict';
    var i = 0;
    
    for (i = 0; i < myArray.length; i += 1) {
        if (myArray[i].user === userKey) {
            return myArray[i];
        }
    }
}

function updateUsernames() {
    'use strict';
    io.sockets.emit('get users', users);
}
//------------------------------------------------------------------------------------------

var roomManager = "manager";

io.sockets.on('connection', function (socket) {
    'use strict';
    
    var channels = [{"chat-channel": []}], i = 0, channelName = "";
    
//    if(socket.readyState === socket.CLOSED){
//        console.log('closee');
//    }
    
    //--- Create Channels
//    var sql = "SELECT positionName AS position FROM tblposition WHERE positionStatus = 'A'";
//    database.query(sql, function (err, result) {
//        if (err) {
//            throw err;
//        } else {
//            for (i = 0; i < result.length; i += 1) {
//                channelName = result[i].position;
//                channels[channelName] = [];
//            }
//        }
//    });
    
    
    //---
    
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);
    // Disconnect
    socket.on('disconnect', function (data) {
        emitter.removeAllListeners('customer to staff message', this);
        emitter.removeAllListeners('live map', this);
        emitter.removeAllListeners('new complaint from mobile', this);
        emitter.removeAllListeners('create new user', this);
        emitter.removeAllListeners('create new truck', this);
        emitter.removeAllListeners('create new zone', this);
        emitter.removeAllListeners('create new area', this);
        emitter.removeAllListeners('create new bin', this);
        socket.removeAllListeners();
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });
    
    socket.on('socketID', function (data) {
        connectedUserList.pushIfNotExist(data, function (e) {
            return e.user === data.user;
        });
        console.log(connectedUserList);
    });
    
//    socket.on('room', function (who) {
//        'use strict';
//        
//        var sql = "SELECT tblposition.positionName AS position FROM tblstaff JOIN tblposition ON tblstaff.positionID = tblposition.positionID WHERE tblstaff.staffID = '" + who + "' LIMIT 0, 1";
//        database.query(sql, function (err, result) {
//            if (err) {
//                throw err;
//            } else {
//                channels[result[0].position].push(socket);
//                channels["chat-channel"].push();
//                socket.join(result[0].position);
//            }
//        });
//    });
    
    socket.on('room', function (room) {
        socket.join(room);
    });
    
    socket.on('make report', function (data) {
        var sql = "SELECT staffName AS name, staffPic AS avatar FROM tblstaff WHERE staffID = '" + data.owner + "' LIMIT 0, 1";
        
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            if (result[0].avatar === "") {
                result[0].avatar = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";
            }
            io.sockets.in(roomManager).emit('receive report notification', {
                id: data.reportID,
                name: result[0].name,
                avatar: result[0].avatar
            });
        });
    });
    
    socket.on('authorize request', function () {
        var sql = "";
        //if (data.action === "create user") {
        sql = "SELECT COUNT(*) AS row FROM tblauthorization WHERE authorize = 'M'";
        //}
        
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            } else {
                io.sockets.in(roomManager).emit('receive authorize action', {
                    num: result[0].row
                });
            }
        });
    });

    //to update notification badge everytime app user submits form
    emitter.on('satisfaction form', function () {
        var sql = "SELECT count(readStat) as unread FROM tblsatisfaction_municipal WHERE readStat = 'u'";
        var sql2 = "SELECT count(readStat) as unread FROM tblsatisfaction_commercial WHERE readStat = 'u'";
        var sql3 = "SELECT count(readStat) as unread FROM tblsatisfaction_scheduled WHERE readStat = 'u'";
        var municipalUnread, commercialUnread, scheduledUnread, totalUnread;
        database.query(sql, function (err, result) {
            municipalUnread = result[0].unread;
            database.query(sql2, function (err, result) {
                commercialUnread = result[0].unread;
                database.query(sql3, function (err, result) {
                    scheduledUnread = result[0].unread;
                    totalUnread = parseInt(municipalUnread, 10) + parseInt(commercialUnread, 10) + parseInt(scheduledUnread, 10);
                    io.sockets.in(roomManager).emit('new satisfaction', {
                        unread: totalUnread
                    });
                });
            });
        });
    });

    emitter.on('enquiry', function () {
        var sql = "SELECT count(readStat) as unread FROM tblenquiry WHERE readStat = 'u'";
        database.query(sql, function (err, result) {
            io.sockets.in(roomManager).emit('new enquiry', {
                unread: result[0].unread
            });
        });
     });
 
     emitter.on('binrequest', function () {
         var sql = "SELECT count(readStat) as unread FROM tblbinrequest WHERE readStat = 'u'";
         database.query(sql, function (err, result) {
             io.sockets.in(roomManager).emit('new binrequest', {
                 unread: result[0].unread
             });
         });
     });

    emitter.on('complaint', function () {
        var sql = "SELECT count(readStat) as unread FROM tblcomplaint WHERE readStat = 'u'";
        database.query(sql, function (err, result) {
            io.sockets.in(roomManager).emit('new complaint', {
                unread: result[0].unread
            });
        });
    });

    //to keep the value of the notification if it's unread when officer logs in
    socket.on('satisfaction form', function () {
        var sql = "SELECT count(readStat) as unread FROM tblsatisfaction_municipal WHERE readStat = 'u'";
        var sql2 = "SELECT count(readStat) as unread FROM tblsatisfaction_commercial WHERE readStat = 'u'";
        var sql3 = "SELECT count(readStat) as unread FROM tblsatisfaction_scheduled WHERE readStat = 'u'";
        var municipalUnread, commercialUnread, scheduledUnread, totalUnread;
        database.query(sql, function (err, result) {
            municipalUnread = result[0].unread;
            database.query(sql2, function (err, result) {
                commercialUnread = result[0].unread;
                database.query(sql3, function (err, result) {
                    scheduledUnread = result[0].unread;
                    totalUnread = parseInt(municipalUnread, 10) + parseInt(commercialUnread, 10) + parseInt(scheduledUnread, 10);
                    io.sockets.in(roomManager).emit('new satisfaction', {
                        unread: totalUnread
                    });
                });
            });
        });
    });

    socket.on('enquiry', function () {
        var sql = "SELECT count(readStat) as unread FROM tblenquiry WHERE readStat = 'u'";
        database.query(sql, function (err, result) {
            io.sockets.in(roomManager).emit('new enquiry', {
                unread: result[0].unread
            });
        });
     });
 
//     socket.on('binrequest', function () {
//         var sql = "SELECT count(readStat) as unread FROM tblbinrequest WHERE readStat = 'u'";
//         database.query(sql, function (err, result) {
//             io.sockets.in(roomManager).emit('new binrequest', {
//                 unread: result[0].unread
//             });
//         });
//     });

     socket.on('complaint', function () {
        var sql = "SELECT count(readStat) as unread FROM tblcomplaint WHERE readStat = 'u'";
        database.query(sql, function (err, result) {
            io.sockets.in(roomManager).emit('new complaint', {
                unread: result[0].unread
            });
        });
    });

    //Update notif badge count after it is read
    socket.on('municipal satisfaction', function () {
        var sql = "SELECT count(readStat) as unread FROM tblsatisfaction_municipal WHERE readStat = 'u'";
        database.query(sql, function (err, result) {
            io.sockets.in(roomManager).emit('read municipal', {
                unread: result[0].unread
            });
        });
    });

    socket.on('commercial satisfaction', function () {
        var sql = "SELECT count(readStat) as unread FROM tblsatisfaction_commercial WHERE readStat = 'u'";
        database.query(sql, function (err, result) {
            io.sockets.in(roomManager).emit('read commercial', {
                unread: result[0].unread
            });
        });
    });

    socket.on('scheduled satisfaction', function () {
        var sql = "SELECT count(readStat) as unread FROM tblsatisfaction_scheduled WHERE readStat = 'u'";
        database.query(sql, function (err, result) {
            io.sockets.in(roomManager).emit('read scheduled', {
                unread: result[0].unread
            });
        });
    });

    socket.on('enquiry read', function () {
        var sql = "SELECT count(readStat) as unread FROM tblenquiry WHERE readStat = 'u'";
        database.query(sql, function (err, result) {
            io.sockets.in(roomManager).emit('read enquiry', {
                unread: result[0].unread
            });
        });
    });

    socket.on('binrequest read', function () {
        var sql = "SELECT count(readStat) as unread FROM tblbinrequest WHERE readStat = 'u'";
        database.query(sql, function (err, result) {
            io.sockets.in(roomManager).emit('read binrequest', {
                unread: result[0].unread
            });
        });
    });

    socket.on('complaint read', function () {
        var sql = "SELECT count(readStat) as unread FROM tblcomplaint WHERE readStat = 'u'";
        database.query(sql, function (err, result) {
            io.sockets.in(roomManager).emit('read complaint', {
                unread: result[0].unread
            });
        });
    });
    
    socket.on('authorize form request', function () {
        var sql = "SELECT COUNT(*) AS row FROM tblformauthorization";
        
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            } else {
                io.sockets.in(roomManager).emit('receive form authorize action', {
                    num: result[0].row
                });
            }
        });
    });
    
    emitter.on('live map', function () {
        var sql = "SELECT serialNo FROM tbltag WHERE date >= CURRENT_DATE ORDER BY date DESC LIMIT 0, 1";
        
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            } else {
                io.sockets.in(roomManager).emit('synchronize map', {
                    "serialNumber": result[0].serialNo,
                    "status": "COLLECTED"
                });
            }
        });
    });
    
    //Create New User
    emitter.on('create new user', function () {
        var latestData = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name, tblstaff.username, tblposition.positionName AS position, (CASE WHEN tblstaff.staffStatus = 'A' THEN 'ACTIVE' WHEN tblstaff.staffStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblstaff INNER JOIN tblposition ON tblposition.positionID = tblstaff.positionID ORDER BY tblstaff.creationDateTime DESC LIMIT 0, 1";
        
        database.query(latestData, function (err, result) {
            socket.broadcast.emit('append user list', {
                id: result[0].id,
                name: result[0].name,
                username: result[0].username,
                position: result[0].position,
                status: result[0].status
            });
        });
    });
    
    //Create New Truck
    emitter.on('create new truck', function () {
        var latestData = "SELECT truckID AS id, transporter, truckTon AS ton, truckNum AS no, truckExpiryStatus AS roadtax, (CASE WHEN truckStatus = 'A' THEN 'ACTIVE' WHEN truckStatus = 'I' THEN 'INACTIVE' END) AS status FROM tbltruck ORDER BY creationDateTime DESC LIMIT 0, 1";
        
        database.query(latestData, function (err, result) {
            socket.broadcast.emit('append truck list', result[0]);
        });
    });
    
    //Create New Zone
    emitter.on('create new zone', function (data) {
        var latestData = "SELECT zoneID AS id, zoneCode AS code, zoneName AS name, (CASE WHEN zoneStatus = 'A' THEN 'ACTIVE' WHEN zoneStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblzone ORDER BY creationDateTime DESC LIMIT 0, 1";
        
        database.query(latestData, function (err, result) {
            socket.broadcast.emit('append zone list', result[0]);
        });
    });
    
    //Create New Area
    emitter.on('create new area', function (data) {
        var latestData = "SELECT a.areaID AS id, a.areaCode AS code, a.areaName AS name, z.zoneID as zone, z.zoneCode as zoneCode, z.zoneName as zoneName, s.staffID as staff, s.staffName as staffName, collection_frequency as collectionFrequency, (CASE WHEN areaStatus = 'A' THEN 'ACTIVE' WHEN areaStatus = 'I' THEN 'INACTIVE' END) as status FROM tblarea a INNER JOIN tblzone z ON a.zoneID = z.zoneID INNER JOIN tblstaff s ON a.staffID = s.staffID ORDER BY a.creationDateTime DESC LIMIT 0, 1";
        
        database.query(latestData, function (err, result) {
            socket.broadcast.emit('append area list', result[0]);
        });
    });
    
    //Create New Bin
    emitter.on('create new bin', function (data) {
        var latestData = "SELECT tblbincenter.binCenterID AS id, CONCAT(tblzone.zoneCode, tblarea.areaCode) AS areaCode, tblarea.areaID AS area, tblbincenter.binCenterName as name, tblbincenter.binCenterLocation AS location, (CASE WHEN tblbincenter.binCenterStatus = 'A' THEN 'ACTIVE' WHEN tblbincenter.binCenterStatus = 'I' THEN 'INACTIVE' END) AS status FROM tblbincenter JOIN tblarea ON tblbincenter.areaID = tblarea.areaID JOIN tblzone ON tblzone.zoneID = tblarea.zoneID ORDER BY tblbincenter.creationDateTime DESC LIMIT 0, 1";
        
        database.query(latestData, function (err, result) {
            socket.broadcast.emit('append bin list', result[0]);
        });
    });
    
    // New User
//    socket.on('new user', function (data, callback) {
//        callback(true);
//        socket.username = data;
//        users.push(socket.username);
//        updateUsernames();
//    });
    
    emitter.on('customer to staff message', function (complaintID) {
        var sql = "SELECT content AS content, sender AS sender, recipient AS recipient, TIME_FORMAT(creationDateTime, '%H:%i') AS date FROM tblchat WHERE complaintID = '" + complaintID + "' ORDER BY creationDateTime DESC LIMIT 0, 1";
        
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            } else {
                var resultObject = searchSocketID(result[0].recipient, connectedUserList);
                var flag = false,
                    i = 0;
                
                for (i = 0; i < connectedUserList.length; i += 1) {
                    if (connectedUserList[i].socketID === socket.id) {
                        if (connectedUserList[i].position == "Manager") {
                            flag = true;
                        }
                    }
                }

                // Manager Group
                if (flag == true) {
                    io.sockets.in(roomManager).emit('new message', {
                        "content": result[0].content,
                        "sender": result[0].sender,
                        "recipient": result[0].recipient,
                        "date": result[0].date
                    });
                    flag = false;
                } else {
                    // PM
                    if (typeof (resultObject) !== 'undefined') {
                        io.to(resultObject.socketID).emit('new message', {
                            "content": result[0].content,
                            "sender": result[0].sender,
                            "recipient": result[0].recipient,
                            "date": result[0].date
                        });
                    }
                }
            }
        });
    });
    
    emitter.on('new complaint from mobile', function () {
        var sql = "SELECT premiseType AS type FROM tblcomplaint ORDER BY complaintDate DESC LIMIT 0, 1";
        
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            } else {
                io.sockets.in(roomManager).emit('new complaint to web', {
                    "premise": result[0].type
                });
            }
        });
    });
    //---
});

module.exports = app;