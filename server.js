/*jslint node:true*/
var express = require('express');
var sanitizer = require('sanitizer');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var EventEmitter = require('events');
var dateTime = require('node-datetime');
var emitter = new EventEmitter();

var requestHandler = require('./requestHandlers');
var database = require('./custom_modules/database-management');
var accountManagement = require('./custom_modules/account-management');
var acrManagement = require('./custom_modules/acr-management');
var areaManagement = require('./custom_modules/area-management');
var zoneManagement = require('./custom_modules/zone-management');
var bincenterManagement = require('./custom_modules/bincenter-management');
var f = require('./custom_modules/function-management');
var reportManagement = require('./custom_modules/report-management');
var roleManagement = require('./custom_modules/role-management');
var truckManagement = require('./custom_modules/truck-management');
var zoneManagement = require('./custom_modules/zone-management');

users = [];
connections = [];
connectedUserList = [];

var obj = {
    "ID": '',
    "authStatus": ''
};

// Parse JSON bodies (as sent by API clients)
app.use(express.json({limit: '50mb'}));
// Parse URL-encoded bodies (as sent by HTML forms)
//app.use(express.urlencoded());


app.post('/navigationControl', function (req, res) {
    'use strict';
    
    var sql = "SELECT tblmanagement.mgmtName, tblaccess.status FROM tblaccess JOIN tblmanagement ON tblmanagement.mgmtID = tblaccess.mgmtID JOIN tblposition ON tblposition.positionID = tblaccess.positionID WHERE tblposition.positionName = '" + req.body.position + "' AND tblaccess.status = 'A'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

//});
app.post('/getAreaLngLat', function(req, res) {
    'use strict';
    var sql = "SELECT longitude, latitude FROM tblarea WHERE areaID = '" + req.body.areaCode+ "'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

app.post('/updateAreaLngLat', function(req, res) {
    'use strict';
    var sql = "UPDATE tblarea SET longitude = '" + req.body.lng + "', latitude = '" + req.body.lat+ "' WHERE areaID = '" + req.body.areaCode + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

// Visualization Management
app.post('/getDataVisualization', function(req, res){
    'use strict';
    
    var sql ="SELECT a.areaID, a.areaName, r.reportCollectionDate, r.operationTimeStart, r.operationTimeEnd, r.garbageAmount, r.completionStatus FROM tblreport r INNER JOIN tblarea a ON r.areaID = a.areaID WHERE r.reportCollectionDate BETWEEN '"+req.body.dateStart+"' AND '"+req.body.dateEnd+"' ORDER BY r.reportCollectionDate";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.post('/getDataVisualizationGroupByDate', function(req, res){
    'use strict';
    
    var sql ="SELECT reportCollectionDate, SUM(operationTimeStart) AS 'operationTimeStart', SUM(operationTimeEnd) AS 'operationTimeEnd', SUM(garbageAmount) AS 'garbageAmount' FROM tblreport WHERE reportCollectionDate BETWEEN '"+req.body.dateStart+"' AND '"+req.body.dateEnd+"' GROUP BY reportCollectionDate ORDER BY reportCollectionDate";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

// Driver
app.get('/getDriverList', function(req, res) {
    'use strict';
    var sql = "SELECT tblstaff.staffID AS id, tblstaff.staffName AS name FROM tblposition JOIN tblstaff ON tblstaff.positionID = tblposition.positionID WHERE tblposition.positionName = 'Driver' AND tblstaff.staffStatus = 'A'";
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

//get count
app.get('/getZoneCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblzone";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getAreaCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblarea";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getAcrCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblacr";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getBinCenterCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblbincenter";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getTruckCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tbltruck";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getUserCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'count' FROM tblstaff";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getReportCompleteCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'completeCount' FROM tblreport WHERE completionStatus = 'C'";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});
app.get('/getReportIncompleteCount',function(req,res){
    var sql="SELECT COUNT(*) AS 'incompleteCount' FROM tblreport WHERE completionStatus = 'I'";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });

});

//complaint module
app.get('/getComplaintList',function(req,res){
    var sql="SELECT tblComplaint.date AS 'date', tblComplaint.complaintTitle AS 'title', tblCustomer.name AS  'customer', tblComplaintType.complaintType AS 'type', tblArea.areaName AS 'area', tblComplaint.complaintID AS ' complaintID' FROM tblComplaint JOIN tblComplaintType ON tblComplaint.complaintType = tblComplaintType.complaintType JOIN tblCustomer ON tblCustomer.customerID = tblComplaint.customerID JOIN tblArea ON tblArea.areaID = tblCustomer.areaID";
     database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });    
});

app.get('/getComplaintLoc',function(req,res){
    
    var sql = "SELECT tblcomplaint.complaintID, tblarea.longitude AS 'longitude', tblarea.latitude AS 'latitude', tblarea.areaName AS 'area' FROM tblarea JOIN tblcustomer ON tblarea.areaID = tblcustomer.areaID JOIN tblcomplaint ON tblcomplaint.customerID = tblcustomer.customerID";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });        
});
//get complaint detail by id
app.post('/getComplaintDetail',function(req,res){
    'use strict';
    var sql = "SELECT t.complaint, co.complaintTitle, co.complaintContent, co.date, cu.name, CONCAT(cu.houseNo, ', ', cu.streetNo, ', ', cu.neighborhood, ', ', cu.neighborhood, ', ', cu.postCode, ', ', cu.city) AS address, a.areaID, a.areaName from tblComplaint co JOIN tblComplaintType t ON co.complaintType = t.complaintType JOIN tblCustomer cu ON co.customerID = cu.customerID JOIN tblArea a ON a.areaID = cu.areaID WHERE co.complaintID = '" + req.body.id + "'";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });        
});

//get report date list for complaint by id
app.post('/getDateListForComplaint',function(req,res){
    'use strict';
    var sql = "SELECT reportCollectionDate as date FROM tblreport WHERE areaID = '" + req.body.id + "'";

    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });        
});

app.post('/updateAreaLngLat', function(req, res) {
    'use strict';
    var sql = "UPDATE tblarea SET longitude = '" + req.body.lng + "', latitude = '" + req.body.lat+ "' WHERE areaID = '" + req.body.areaCode + "'";
    
    database.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
}); // Complete

//------------------------------------------------------------------------------------------
// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function(comparer) { 
    for(var i = 0; i < this.length; i++) { 
        if(comparer(this[i])) return true; 
    }
    return false; 
};

// adds an element to the array if it does not already exist using a comparer 
// function
Array.prototype.pushIfNotExist = function(element, comparer) { 
    if (!this.inArray(comparer)) {
        this.push(element);
    } else {
        for (var i = 0; i < this.length; i++) {
            if (this[i].user == element.user) {
                this[i].socketID = element.socketID;
            }
        }
    }
};
//------------------------------------------------------------------------------------------

var roomManager = "manager";

io.sockets.on('connection', function(socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);
    
    // Disconnect
    socket.on('disconnect', function(data) {
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });
    
    socket.on('socketID', function (data) {
        connectedUserList.pushIfNotExist(data, function(e) { 
            return e.user === data.user;
        });
        console.log(connectedUserList);
    });
    
    socket.on('room', function (room) {
        socket.join(room);
    });
    
    socket.on('make report', function (data) {
        var sql = "SELECT staffName AS name, staffPic AS avatar FROM tblstaff WHERE staffID = '" + data.owner + "' LIMIT 0, 1";
        
        database.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            if (result[0].avatar == "") {
                result[0].avatar = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";
            }
            io.sockets.in(roomManager).emit('receive report notification', {
                id: data.reportID,
                name: result[0].name,
                avatar: result[0].avatar
            });
        });
    });
    
    
    //Send Message
    socket.on('send message', function(data) {
        io.sockets.emit('new message', {
            msg: data,
            user: socket.username
        });
    });
    
    //Create New User
    socket.on('create new user', function(data) {
        socket.broadcast.emit('append user list', {
            id: data.id,
            name: data.name,
            username: data.username,
            position: data.position.name,
            status: 'ACTIVE'
        });
    });
    
    // New User
    socket.on('new user', function(data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    });
    
    function updateUsernames() {
        io.sockets.emit('get users', users);
    }
});

app.use('/', requestHandler);
app.use('/', accountManagement);
app.use('/', acrManagement);
app.use('/', areaManagement);
app.use('/', bincenterManagement);
app.use('/', reportManagement);
app.use('/', roleManagement);
app.use('/', truckManagement);
app.use('/', zoneManagement);