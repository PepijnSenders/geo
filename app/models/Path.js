var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    Q = require('q'),
    Point = require(global.APP_DIR + '/models/Point');

var PathSchema = mongoose.Schema({

  origin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Point'
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Point'
  },
  width: Number,
  height: Number

});

PathSchema.methods = (function() {

  return {

    getPath: function() {
      var getPathDeferred = Q.defer();

      mongoose.model('Path', PathSchema)
        .findOne(this)
        .populate('origin', 'destination')
        .exec(function(err, path) {
          if (path) {
            getPathDeferred.resolve(path);
          } else {
            getPathDeferred.reject();
          }
        });

      return getPathDeferred.promise;
    },

    buildPath: function() {
      var buildPathDeferred = Q.defer();

      var path = this;

      Q.allSettled([
        Point.getPoint(this.origin),
        Point.getPoint(this.destination)
      ]).then(function(resolves) {
        var origin = resolves[0].value,
            destination = resolves[1].value;

        var directions = origin.directionsTo(destination),
            distance = origin.distanceTo(destination);

        var zoom = origin.arbitraryZoom(destination, path.width, path.height, 2000, 2000);
      }).catch(function() {
        console.log(arguments);
      });

      return buildPathDeferred.promise;
    }

  };

})();

module.exports = exports = mongoose.model('Path', PathSchema);