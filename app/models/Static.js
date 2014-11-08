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
  url: String,

  point: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Point'
  }

});

StaticSchema.virtual('size').get(function() {
  var offset = 30;
  return this.width + 'x' + (this.height + offset * 2);
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

    getStatic: function() {
      var getStaticDeferred = Q.defer();

      console.log(this);

      mongoose.model('Static', StaticSchema)
        .findOne({
          width: this.width,
          height: this.height,
          zoom: this.zoom,
          scale: this.scale,
          maptype: this.maptype,
          language: this.language,
          region: this.region,
          markers: this.markers,
          path: this.path,
          visible: this.visible,
          style: this.style,
          point: this.point
        }).populate('point').exec(function(err, static) {
          if (static) {
            getStaticDeferred.resolve(static);
          } else {
            getStaticDeferred.reject();
          }
        });

      return getStaticDeferred.promise;
    },

    staticmap: function() {
      var staticmapDefer = Q.defer();

      var static = this;

      this.getPoint()
        .then(function(point) {
          return Google.staticmap({
            center: point.location.join(','),
            size: static.size,
            width: static.width,
            height: static.height,
            zoom: static.zoom,
            scale: static.scale,
            maptype: static.maptype,
            language: static.language,
            region: static.region,
            markers: static.markers,
            path: static.path,
            visible: static.visible,
            style: static.style
          });
        })
        .then(function(result) {
          static.url = result;
          staticmapDefer.resolve(static);
        })
        .catch(function(err) {
          staticmapDefer.reject(err);
        });

      return staticmapDefer.promise;
    }
  };

})();

StaticSchema.pre('save', function(next) {
  this.staticmap()
    .then(function(static) {
      console.log('after', static);
      next();
    });
});

module.exports = exports = mongoose.model('Static', StaticSchema);