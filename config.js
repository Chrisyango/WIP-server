'use strict';

exports.PORT = process.env.PORT || 8080;
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://webuser:webuser@ds011258.mlab.com:11258/workinprogress';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/thinkful-backend-test'
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';