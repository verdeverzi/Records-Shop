const mongoose = require('mongoose');

const { Schema } = mongoose;

const RecordSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  year: {
    type: Number,
    required: true,
  },

  artist: {
    type: String,
    required: true,
  },

  img: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Record', RecordSchema);
