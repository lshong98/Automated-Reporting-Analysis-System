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
var nodemailer = require('nodemailer');
var Joi = require('joi');
var fs = require('fs');
var upload = require('express-fileupload');
var FCMAdmin = require("firebase-admin");
var FCMServiceAccount = require("./trienekens-994df-d5d29b87e6a8.json");

var SVR_PORT = process.env.SERVER_PORT || 3000;

exports.express = express;
exports.app = app;
exports.server = server;
exports.io = io;
exports.SVR_PORT = SVR_PORT;
exports.emitter = emitter;
exports.fs = fs;
exports.upload = upload;
exports.FCMAdmin = FCMAdmin;
exports.FCMServiceAccount = FCMServiceAccount;