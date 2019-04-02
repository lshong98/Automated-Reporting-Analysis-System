const express = require('express');
const sanitizer = require('sanitizer');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const path = require('path');
const mysql = require('mysql');
const dbName = 'trienekens';

// Set static path
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'pages')));
app.use(express.static(path.join(__dirname, 'fonts')));
app.use(express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: '../' + __dirname});
});
app.get('/pages', (req, res) => {
   res.sendFile('pages/index.html', {root: __dirname}); 
});
app.get('/dashboard-manager', (req, res) => {
    res.sendFile('pages/dashboard-manager.html', {root: __dirname});
});
app.get('/dashboard-officer', (req, res) => {
    res.sendFile('pages/dashboard-officer.html', {root: __dirname});
});
app.get('/account-management', (req, res) => {
    res.sendFile('pages/account-management.html', {root: __dirname});
});
app.get('/truck-management', (req, res) => {
    res.sendFile('pages/truck-management.html', {root: __dirname});
});
app.get('/area-management', (req, res) => {
    res.sendFile('pages/area-management.html', {root: __dirname});
});
app.get('/dashboard-officer', (req, res) => {
    res.sendFile('pages/dashboard-officer.html', {root: __dirname});
});
app.get('/acr-management', function(req, res) {
    res.sendFile('pages/acr-management.html', {root: __dirname});
});
app.get('/notification', function(req, res) {
    res.sendFile('pages/notification.html', {root: __dirname});
});
app.get('/daily-report', function(req, res) {
    res.sendFile('pages/daily-report.html', {root: __dirname});
});
app.get('/error', function(req, res) {
    res.sendFile('pages/error-404.html', {root: __dirname});
});

// Create connection
//const db = mysql.createConnection({
//    host: '',
//    user: '',
//    password: '',
//    database: dbName
//});

// Connect
//db.connect((err) => {
//    if (err) {
//        throw err;
//    }
//    console.log('MySQL Connected...');
//});

// Create DB
//app.get('/createdb', (req, res) => {
//    let sql = `CREATE DATABASE ${dbName}`;
//    db.query(sql, (err, result) => {
//        if (err) throw err;
//        console.log(result);
//        res.send('Database created');
//    });
//});

// Create table
//app.get('/createtables', (req, res) => {
//    let sqls = [
//        "CREATE TABLE table1 (id int primary key auto_increment)",
//        "CREATE TABLE table2 (id int primary key auto_increment)"
//               ];
//    for (var i = 0; i < sqls.length; i++) {
//        db.query(sqls[i], (err, result) => {
//            if (err) throw err;
//            console.log(result);
//            res.send('Tables created');
//        });
//    }
//    //let sql = 'CREATE TABLE posts (id int AUTO_INCREMENT, title VARCHAR(255), body VARCHAR(255), PRIMARY KEY (id))';
//});

const port = 3000;

server.listen(port, () => console.log(`Server is running on port ${port}`));