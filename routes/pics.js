'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Pic = require('../models/pic');

router.use(passport.authenticate('jwt',
  {session: false, failWithError: true})
);

/* ========== GET/READ ALL ITEM ========== */
router.get('/pic', (req, res, next) => {
  Pic.find()
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/pic/:id', (req, res, next) => {
  const {id} = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Pic.findOne({_id: id})
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(next);
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/pic', (req, res, next) => {
  const { title, alt, src, likes, username } = req.body;
  const created = Date.now();

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { title, alt, src, likes, username, created };

  Pic.create(newItem)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== UPDATE AN ITEM ========== */
router.put('/pic/:id', (req, res, next) => {
  const { id } = req.params;
  const { likes, comments } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const updateItem = { likes, comments };

  const options = { new: true };

  Pic.findByIdAndUpdate(id, updateItem, options)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/pic/:id', (req, res, next) => {
  const {id} = req.params;

  Pic.findOneAndRemove({_id: id})
    .then(count => {
      if (count) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(next);
});

module.exports = router;