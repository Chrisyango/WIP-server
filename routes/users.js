'use strict';

const express = require('express');
const router = express.Router();

const User = require('../models/user');

/* ========== GET/READ ALL ITEM ========== */
router.get('/users', (req, res, next) => {
  User.find()
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/users', (req, res, next) => {
  const {fullname, username, password, email} = req.body;

  const requiredFields = ['username', 'password', 'email', 'fullname'];
  const hasFields = requiredFields.every(field => {
    return req.body[field];
  });
  
  const stringFields = ['username', 'password', 'fullname', 'email'];
  const stringField = stringFields.every(field => {
    return field in req.body && typeof req.body[field] === 'string';
  });

  if (!hasFields) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: 'hasFields'
    });
  }

  if (!stringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: 'stringField'
    });
  }

  const trimmedField = requiredFields.every(field => {
    return req.body[field].trim() === req.body[field];
  });

  if (!trimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Field cannot start or end with whitespace',
      location: 'trimmedField'
    });
  }

  const fieldSize = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72
    }
  };

  const tooSmallField = Object.keys(fieldSize).find(field => {
    if ('min' in fieldSize[field] && 
       req.body[field].length < fieldSize[field].min) {
      return true;
    }
  });

  const tooLargeField = Object.keys(fieldSize).find(field => {
    if ('max' in fieldSize[field] &&
      req.body[field].length > fieldSize[field].max) {
      return true;
    }
  });

  if (tooSmallField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Username needs to be at least 1 character long and Password needs to be at least 8 characters long',
      location: 'tooSmallField'
    });
  }

  if (tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Password needs to be at most 72 characters long',
      location: 'tooLargeField'
    });
  }

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        fullname,
        email
      };
      return User.create(newUser);
    })
    .then(result => {
      return res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
      }
      next(err);
    });
});

module.exports = router;