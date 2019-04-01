var express = require('express');
var sanitizer = require('sanitizer');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
var filename = 'iochat';
var parentDir = __dirname;
var styleDir = 'styles/';
var scriptDir = 'scripts/';
var imageDir = 'images/';
var fontDir = 'fonts/';
var pageDir = 'pages/';

//users = [];
//connections = [];

server.listen(process.env.PORT || 8080, function() {
    console.log('Server running...');
});

app.get('/', function(req, res) {
    res.sendFile('index.html', {root: parentDir});
});
//app.get('/trienekens-reporting-system', function(req, res){
//    res.sendFile('index.html', {root: parentDir});
//});

app.get('/pages', function (req, res) {
   res.sendFile('index.html', {root: pageDir}); 
});

/* Load CSS */
app.get('/bootstrapCSS', function(req, res) {
    res.sendFile('bootstrap-4.0.0/bootstrap.min.css', {root: styleDir});
});
app.get('/component.css', function(req, res) {
    res.sendFile('multi-level-menu/component.css', {root: styleDir});
});
app.get('/trienekens.css', function(req, res) {
    res.sendFile('trienekens.css', {root: styleDir});
});
app.get('/chart.css', function(req, res) {
    res.sendFile('highcharts-7.0.3/highcharts.css', {root: styleDir});
});
app.get('/fontawesome.css', function(req, res) {
    res.sendFile('font-awesome-5.7.2/fontawesome.min.css', {root: styleDir});
});
app.get('/bootstrap-selectCSS', function(req, res) {
    res.sendFile('bootstrap-select-1.13.7/bootstrap-select.min.css', {root: styleDir});
});
app.get('/bootstrap-datepickerCSS', function(req, res) {
    res.sendFile('bootstrap-datepicker/bootstrap-datepicker.standalone.min.css', {root: styleDir});
});
app.get('/clockpickerCSS', function(req, res) {
    res.sendFile('clockpicker-0.0.7/bootstrap-clockpicker.min.css', {root: styleDir});
});
/* Load CSS */

/*Load Font*/
app.get('/feather.eot', function(req, res) {
    res.sendFile('feather.eot?1gafuo', {root: fontDir});
});
app.get('/feather.svg', function(req, res) {
    res.sendFile('feather.svg', {root: fontDir});
});
app.get('/feather.ttf', function(req, res) {
    res.sendFile('feather.ttf', {root: fontDir});
});
app.get('/feather.woff', function(req, res) {
    res.sendFile('feather.woff', {root: fontDir});
});
app.get('/feather.woff2', function(req, res) {
    res.sendFile('feather.woff2', {root: fontDir});
});
app.get('/fa-solid-900.woff', function(req, res) {
    res.sendFile('fa-solid-900.woff', {root: fontDir});
});
app.get('/fa-solid-900.woff2', function(req, res) {
    res.sendFile('fa-solid-900.woff2', {root: fontDir});
});
app.get('/fa-solid-900.ttf', function(req, res) {
    res.sendFile('fa-solid-900.ttf', {root: fontDir});
});
/*Load Font*/

/*Load Image*/
app.get('/TrienekensLogo', function(req, res) {
    res.sendFile('TrienekensLogo.png', {root: imageDir});
});
app.get('/TrienekensLogo2', function(req, res) {
    res.sendFile('TrienekensLogo2.png', {root: imageDir});
});
/*Load Image*/


/* Load Script */
app.get('/jquery.js', function(req, res) {
    res.sendFile('jquery-3.3.1/jquery-3.3.1.min.js', {root: scriptDir});
});
app.get('/popper', function(req, res) {
    res.sendFile('/popper-1.12.9/popper.min.js', {root: scriptDir});
});
app.get('/bootstrapJS', function(req, res) {
    res.sendFile('bootstrap-4.0.0/bootstrap.min.js', {root: scriptDir});
});
app.get('/bootstrap-selectJS', function(req, res) {
    res.sendFile('bootstrap-select-1.13.7/bootstrap-select.min.js', {root: scriptDir});
});
app.get('/chart.js', function(req, res) {
    res.sendFile('highcharts-7.0.3/highcharts.js', {root: scriptDir});
});

app.get('/modernizr-custom.js', function(req, res) {
    res.sendFile('multi-level-menu/modernizr-custom.js', {root: scriptDir});
});

app.get('/classie.js', function(req, res) {
    res.sendFile('multi-level-menu/classie.js', {root: scriptDir});
});

app.get('/main.js', function(req, res) {
    res.sendFile('multi-level-menu/main.js', {root: scriptDir});
});

app.get('/angular.js', function(req, res) {
    res.sendFile('angular-1.6.9/angular.min.js', {root: scriptDir});
});
app.get('/angular-route.js', function(req, res) {
    res.sendFile('angular-1.6.9/angular-route.min.js', {root: scriptDir});
});
app.get('/router.js', function(req, res) {
    res.sendFile('router.js', {root: scriptDir});
});
app.get('/menu-setting.js', function(req, res) {
    res.sendFile('multi-level-menu/menu-setting.js', {root: scriptDir});
});
app.get('/reveal', function(req, res) {
    res.sendFile('scrollreveal.min.js', {root: scriptDir});
});
app.get('/bootstrap-datepickerJS', function(req, res) {
    res.sendFile('bootstrap-datepicker/bootstrap-datepicker.min.js', {root: scriptDir});
});
app.get('/clockpickerJS', function(req, res) {
    res.sendFile('clockpicker-0.0.7/bootstrap-clockpicker.js', {root: scriptDir});
});
//app.get('/index.js', function(req, res) {
//    res.sendFile('index.js', {root: scriptDir});
//});
/* Load Script */

/* Load Pages */
app.get('/dashboard-manager', function(req, res) {
    res.sendFile('dashboard-manager.html', {root: pageDir});
});
app.get('/dashboard-officer', function(req, res) {
    res.sendFile('dashboard-officer.html', {root: pageDir});
});
app.get('/account-management', function(req, res) {
    res.sendFile('account-management.html', {root: pageDir});
});
app.get('/account/:userID', function(req, res) {
    //res.send(req.params);
    console.log(sanitizer.escape(req.params.userID));
    res.sendFile('account.html', {root: pageDir});
});
app.get('/truck-management', function(req, res) {
    res.sendFile('truck-management.html', {root: pageDir});
});
app.get('/truck/:truckID', function(req, res) {
    res.sendFile('account.html', {root: pageDir});
});
app.get('/error', function(req, res) {
    res.sendFile('error-404.html', {root: pageDir});
});
app.get('/acr-management', function(req, res) {
    res.sendFile('acr-management.html', {root: pageDir});
});
app.get('/notification', function(req, res) {
    res.sendFile('notification.html', {root: pageDir});
});
app.get('/area-management', function(req, res) {
    res.sendFile('area-management.html', {root: pageDir});
});
app.get('/daily-report', function(req, res) {
    res.sendFile('daily-report.html', {root: pageDir});
});
/* Load Pages */

//io.sockets.on('connection', function(socket) {
//    connections.push(socket);
//    console.log('Connected: %s sockets connected', connections.length);
//    
//    // Disconnect
//    socket.on('disconnect', function(data) {
//        users.splice(users.indexOf(socket.username), 1);
//        updateUsernames();
//        connections.splice(connections.indexOf(socket), 1);
//        console.log('Disconnected: %s sockets connected', connections.length);
//    });
//    
//    //Send Message
//    socket.on('send message', function(data) {
//        io.sockets.emit('new message', {
//            msg: data,
//            user: socket.username
//        });
//    });
//    
//    // New User
//    socket.on('new user', function(data, callback) {
//        callback(true);
//        socket.username = data;
//        users.push(socket.username);
//        updateUsernames();
//    });
//    
//    function updateUsernames() {
//        io.sockets.emit('get users', users);
//    }
//});