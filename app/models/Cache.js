var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

var CacheSchema = new mongoose.Schema({

  url: String,
  response: Object

});

CacheSchema.plugin(timestamps);
module.exports = exports = mongoose.model('Cache', CacheSchema);