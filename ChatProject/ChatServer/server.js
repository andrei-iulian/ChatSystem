const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http').Server(app);
const fs = require('fs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist/ChatProject')));

require('./routes/api.js')(app, fs);

var host = '127.0.0.1';
var port = 3000;

var server = http.listen(port, host, function() {
    console.log("Server is listening on " + host + ':' + port);
});