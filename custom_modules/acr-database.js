/*jslint node:true*/
var variable = require('../variable');
var express = variable.express;
var dateTime = variable.dateTime;
var app = express();
var database = require('./database-management');
var f = require('./function-management');
var fs = require('fs');
const e = require('express');

module.exports = app;