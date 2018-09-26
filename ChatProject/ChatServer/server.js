const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http').Server(app);
const MongoClient = require('mongodb').MongoClient;
const io = require('socket.io')(http);
const formidable = require('formidable');

const url = 'mongodb://localhost:27017';

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist/ChatProject')));
app.use('/images', express.static(path.join(__dirname, './userimages')));


var host = '127.0.0.1';
var port = 3000;

MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
    if (err) {return console.log(err)}

    const dbName = 'chat';
    const db = client.db(dbName);

    require('./routes/api.js')(app, formidable, db);
    require('./socket.js')(db, io);

    var server = http.listen(port, host, function() {
        console.log("Server is listening on " + host + ':' + port);
    });
});