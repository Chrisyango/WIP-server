'use strict';

const mongoose = require('mongoose');

const PicSchema = new mongoose.Schema({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  comments: {
    type: Array,
    required: true
  },
  created: {
    type: Number,
    required: true
  }
});

PicSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  } 
});

const Pic = mongoose.model('Pic', PicSchema);

module.exports = Pic;