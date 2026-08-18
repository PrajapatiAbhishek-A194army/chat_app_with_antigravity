'use strict';

const dotenv = require('dotenv');
dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  env: process.env.NODE_ENV || 'development',
};

module.exports = config;
