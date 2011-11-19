////////////////////////////////////
// test.js - NODEjs simple server //
////////////////////////////////////

var path = require('path');
var express = require('express');

app = express.createServer();

var oneYear = 31557600000;
var dir = path.dirname(__dirname);
app.use(express.static(dir));

app.listen(2080);