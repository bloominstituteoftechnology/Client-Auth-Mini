/*
  eslint
    quote-props: 0
    quotes: 0
*/
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const server = express();
// to enable parsing of json bodies for post requests
server.use(bodyParser.json());

// enable CORS
const corsOptions = {
  "origin": "http://localhost:65226",
  "credentials": true
};
server.use(cors(corsOptions));

// Completed TODO: implement routes
require('./routes')(server);

module.exports = { server };
