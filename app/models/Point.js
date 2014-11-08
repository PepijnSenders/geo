var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    Q = require('q'),
    Google = require(global.APP_DIR + '/libs/Google');

var PointSchema = new mongoose.Schema({

  location: {
    type: [Number],
    index: '2dsphere'
  },
  center: String

});

PointSchema.methods = (function() {

  return {
    geocode: function() {
      var geocodeDeferred = Q.defer();

      var point = this;

      Google.geocode({
        address: this.center
      }).then(function(result) {
        point.location = [result.geometry.location.lat, result.geometry.location.lng];
        geocodeDeferred.resolve();
      }).catch(function(err) {
        geocodeDeferred.reject(err);
      });

      return geocodeDeferred.promise;
    }
  };

})();

PointSchema.pre('save', function(next) {
  this.geocode()
    .then(next);
});

PointSchema.plugin(timestamps);
module.exports = exports = mongoose.model('Point', PointSchema);