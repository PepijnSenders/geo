var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

var GoogleCacheSchema = mongoose.Schema({

  service: String,
  query: String,
  result: Object

});

module.exports = exports = mongoose.model('GoogleCache', GoogleCacheSchema);