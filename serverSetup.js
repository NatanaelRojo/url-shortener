const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
require('dotenv').config();

function serverSetup(app) {
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/public', express.static(`${process.cwd()}/public`));
}

module.exports = serverSetup;