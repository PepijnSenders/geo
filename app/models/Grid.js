var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp');

var GridSchema = mongoose.Schema({

  grid: [Array],
  x: Number,
  y: Number

});

GridSchema.methods = (function() {

  return {

    fromTiles: function(x, y) {
      var Grid = require(global.APP_DIR + '/models/Grid');


    }

  };

})();

module.exports = exports = mongoose.model('Grid', GridSchema);