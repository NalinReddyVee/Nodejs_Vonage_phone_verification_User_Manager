require('dotenv').config();
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./api/_middleware/error-handler');
const authorize = require('./api/_middleware/authorize');
const config = require('./api/config/config');
const os = require('os');
const { DateTime } = require('luxon');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// global error handler
app.use(errorHandler);

// api routes
app.use('/users', require('./api/users/users.controller'));
app.use('/verification', require('./api/verification/verification.controller'));

app.get('', function (req, res) {
    res.json({
        apiName: process.env.npm_package_name,
        apiVersion: process.env.npm_package_version,
        hostname: os.hostname(),
        startTime: DateTime.now()
            .minus(process.uptime() * 1000)
            .toLocaleString(DateTime.DATETIME_MED),
        uptime: Math.floor(process.uptime()) + 's'
    });
});

app.get('/*', function (req, res) {
    res.status(404).json();
});

// Initialize the app.
var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log('======= Server NOW RUNNING ON PORT:', port);
});