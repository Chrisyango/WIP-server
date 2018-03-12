'use strict';

const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');
const User = require('../models/user');

const seedUsers = require('../db/users');

mongoose.connect(DATABASE_URL)
  .then(() => {
    return mongoose.connection.db.dropDatabase()
      .then(result => {
        console.info(`Dropped Database: ${result}`);
      });
  })
  .then(() => {
    return User.insertMany(seedUsers)
      .then(results => {
        console.info(`Inserted ${results.length} Users`);
      });
  })
  .then(() => {
    return mongoose.disconnect()
      .then(() => {
        console.info('Disconnected');
      });
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });