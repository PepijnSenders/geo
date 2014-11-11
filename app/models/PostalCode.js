var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

var PostalCodeSchema = mongoose.Schema({

  areaCode: Number,
  letterCombination: String,
  latitude: String,
  longitude: String,
  streetAddress: String,
  city: String,
  postalCode: String,
  loc: {
    type: [Number],
    index: '2dsphere'
  }

});

module.exports = exports = mongoose.model('PostalCode', PostalCodeSchema);