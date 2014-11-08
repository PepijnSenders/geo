var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

var PointSchema = new mongoose.Schema({

  location: {
    type: [Number],
    index: '2dsphere'
  },
  center: String

});

var Point = {

};

PointSchema.plugin(timestamps);
module.exports = exports = mongoose.model('Point', PointSchema);