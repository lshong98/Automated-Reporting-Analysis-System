/*jslint node:true*/

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bcrypt = require('bcryptjs');
var dateTime = require('node-datetime');
var EventEmitter = require('events');
var emitter = new EventEmitter();
var FCMAdmin = require("firebase-admin");
var FCMServiceAccount = require("./trienekens-994df-6c159f3db6fd.json");
var fs = require('fs');
var io = require('socket.io').listen(server);
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');
var path = require('path');
var sanitizer = require('sanitizer');
var upload = require('express-fileupload');
var webpush = require('web-push');
var bodyParser = require('body-parser');
var util = require('util');

var SVR_PORT = process.env.SERVER_PORT || 8080;

exports.app = app;
exports.bcrypt = bcrypt;
exports.dateTime = dateTime;
exports.express = express;
exports.emitter = emitter;
exports.fs = fs;
exports.FCMAdmin = FCMAdmin;
exports.FCMServiceAccount = FCMServiceAccount;
exports.io = io;
exports.nodemailer = nodemailer;
exports.schedule = schedule;
exports.path = path;
exports.server = server;
exports.SVR_PORT = SVR_PORT;
exports.upload = upload;
exports.util = util;
exports.webpush = webpush;
exports.bodyParser = bodyParser;