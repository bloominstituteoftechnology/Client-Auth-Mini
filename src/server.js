/*
  eslint
    quote-props: 0
    quotes: 0
*/
const bodyParser = require('body-parser');
const express = require('express');
// const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

const server = express();
// to enable parsing of json bodies for post requests
server.use(bodyParser.json());

// enable CORS
const corsOptions = {
  "origin": "http://localhost:3000",
  "credentials": true
};
server.use(cors(corsOptions));

// initialize passport
server.use(passport.initialize());

// Completed TODO: implement routes
require('./routes')(server);

module.exports = { server };
