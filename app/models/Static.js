var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    Point = require(global.APP_DIR + '/models/Point'),
    Q = require('q'),
    Google = require(global.APP_DIR + '/libs/Google');

var StaticSchema = new mongoose.Schema({

  width: Number,
  height: Number,
  zoom: Number,
  scale: Number,
  maptype: String,
  language: String,
  region: String,
  markers: String,
  path: String,
  visible: String,
  style: String,

  point: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Point'
  }

});

StaticSchema.virtual('size').get(function() {
  return this.width + 'x' + this.height;
});

StaticSchema.methods = (function() {

  return {
    getPoint: function() {
      var getPointDeferred = Q.defer();

      Point.findOne({
        _id: this.point
      }, function(err, point) {
        if (err) {
          return getPointDeferred.reject(err);
        }
        getPointDeferred.resolve(point);
      });

      return getPointDeferred.promise;
    },

    staticmap: function() {
      var staticmapDefer = Q.defer();

      var static = this;

      this.getPoint()
        .then(function(point) {
          static.center = point.location.join(',');
          console.log(static);

          return Google.staticmap(static);
        })
        .then(function(result) {
          console.log(result);
        })
        .catch(function(result) {
          console.log(result);
        });

      return staticmapDefer.promise;
    }
  };

})();

StaticSchema.pre('save', function(next) {
  this.staticmap()
    .then(next);
});

module.exports = exports = mongoose.model('Static', StaticSchema);