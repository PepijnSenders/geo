var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    Q = require('q'),
    Google = require(global.APP_DIR + '/libs/Google')
    Number = require(global.APP_DIR + '/libs/Number');

var PointSchema = new mongoose.Schema({

  location: {
    type: [Number],
    index: '2dsphere'
  },
  lat: Number,
  lon: Number,
  center: String

});

PointSchema.methods = (function() {

  return {

    directionsTo: function(destination) {
      var originX = this.lonToX(), originY = this.latToY();
      var destinationX = destination.lonToX(), destinationY = destination.latToY();

      return {
        north: originY >= destinationY,
        south: originY < destinationY,
        west: originX >= destinationX,
        east: originX < destinationX
      };
    },

    distanceTo: function(destination) {
      if (typeof precision == 'undefined') precision = 4;

      var R = require(global.APP_DIR + '/models/Point').radius;
      var φ1 = this.lat.toRadians(),  λ1 = this.lon.toRadians();
      var φ2 = destination.lat.toRadians(), λ2 = destination.lon.toRadians();
      var Δφ = φ2 - φ1;
      var Δλ = λ2 - λ1;

      var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ/2) * Math.sin(Δλ/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c;

      return d.toPrecisionFixed(Number(precision));
    },

    geometry: function(width, height, zoom) {
      var Point = require(global.APP_DIR + '/models/Point');

      var Δx = Math.round(width / 2), Δy = Math.round(height / 2);

      var quarters = {
        north: this.adjustLatByPixels(Δy * -1, zoom),
        south: this.adjustLatByPixels(Δy, zoom),
        west: this.adjustLonByPixels(Δx * -1, zoom),
        east: this.adjustLonByPixels(Δx, zoom)
      };

      var geometry = {
        quarters: quarters,
        bounds: {
          northWest: new Point({
            lat: quarters.north,
            lon: quarters.west
          }),
          northEast: new Point({
            lat: quarters.north,
            lon: quarters.east
          }),
          southWest: new Point({
            lat: quarters.south,
            lon: quarters.west
          }),
          southEast: new Point({
            lat: quarters.south,
            lon: quarters.east
          })
        }
      };

      return geometry;
    },

    adjacent: function(α, width, height, zoom) {
      var Point = require(global.APP_DIR + '/models/Point');
      var geometry = this.geometry(width, height, zoom);

      var sideX = Math.abs(geometry.bounds.northWest.lon - geometry.bounds.northEast.lon),
      sideY = Math.abs(geometry.bounds.northWest.lat - geometry.bounds.southWest.lat);

      α = Math.abs(α) % 360;
      var αMax = Math.atan(sideY / sideX),
      opposite, adjacent, lat, lon;

      αMax = αMax.toDegrees();

      // Right side of tile
      if (α < αMax || α >= (360 - αMax)) {
        opposite = Math.tan(α.toRadians()) * sideX;
        lat = this.lat + opposite;
        lon = this.lon + sideX;
      }

      // Bottom side of tile
      if ((180 - αMax) > α && α >= αMax) {
        adjacent = sideY / Math.tan(α.toRadians());
        lat = this.lat + sideY;
        lon = this.lon + adjacent;
      }

      // Left side of tile
      if ((180 + αMax) > α && α >= (180 - αMax)) {
        opposite = 2 * (Math.tan(α.toRadians()) * (sideX / 2));
        lat = this.lat + opposite;
        lon = this.lon - sideX;
      }

      // Top side of tile
      if ((360 - αMax) > α && α >= (180 + αMax)) {
        adjacent = sideY / Math.tan(α.toRadians());
        lat = this.lat - sideY;
        lon = this.lon + adjacent;
      }

      var adjacentPoint = new Point({
        lat: lat,
        lon: lon
      });
      adjacentPoint.angle = α;

      return adjacentPoint;
    },

    tilesInZoom: function(destination, width, height, zoom) {
      var Point = require(global.APP_DIR + '/models/Point');

      var originGeometry = this.geometry(width, height, zoom),
          destinationGeometry = destination.geometry(width, height, zoom);

      var directions = this.directionsTo(destination);

      var ΔxTile = originGeometry.bounds.northWest.distanceTo(originGeometry.bounds.northEast),
          ΔyTile = originGeometry.bounds.northWest.distanceTo(originGeometry.bounds.southWest);


      var Δx, Δy;
      if (directions.north) {
        Δy = originGeometry.bounds.southWest.distanceTo(new Point({
          lat: destinationGeometry.quarters.north,
          lon: originGeometry.bounds.southWest.lon
        }));
      } else {
        Δy = originGeometry.bounds.northWest.distanceTo(new Point({
          lat: destinationGeometry.quarters.south,
          lon: originGeometry.bounds.northWest.lon
        }));
      }

      if (directions.west) {
        Δx = originGeometry.bounds.southEast.distanceTo(new Point({
          lat: originGeometry.bounds.southEast.lat,
          lon: destinationGeometry.quarters.west
        }));
      } else {
        Δx = originGeometry.bounds.southWest.distanceTo(new Point({
          lat: originGeometry.bounds.southWest.lat,
          lon: destinationGeometry.quarters.east
        }));
      }

      return {
        x: Math.ceil(Δx / ΔxTile),
        y: Math.ceil(Δy / ΔyTile)
      };
    },

    arbitraryZoom: function(destination, width, height, canvasWidth, canvasHeight) {
      var Point = require(global.APP_DIR + '/models/Point');

      var Δx = Math.abs(this.lonToX() - destination.lonToX()),
          Δy = Math.abs(this.latToY() - destination.latToY());

      var virtualOrigin = new Point({
        lat: this.xToLon(0),
        lon: this.yToLat(0)
      }),
      virtualDestination = new Point({
        lat: this.xToLon(Δx / Math.ceil(canvasWidth / width)),
        lon: this.yToLat(Δy / Math.ceil(canvasHeight / height))
      });

      var WORLD_DIM = { height: 256, width: 256 },
          ZOOM_MAX = 21;

      function zoom (mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
      }

      function latRad (lat) {
        var sin = Math.sin(lat * Math.PI / 180);
        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
      }

      var latFraction = (latRad(virtualOrigin.lat) - latRad(virtualDestination.lat)) / Math.PI;

      var lonDiff = virtualOrigin.lon - virtualDestination.lon;
      var lonFraction = ((lonDiff < 0) ? (lonDiff + 360) : lonDiff) / 360;

      var latZoom = zoom(height, WORLD_DIM.height, latFraction);
      var lonZoom = zoom(width, WORLD_DIM.width, lonFraction);

      return Math.min(latZoom, lonZoom, ZOOM_MAX);
    },

    yToLat: function(y) {
      var Point = require(global.APP_DIR + '/models/Point');
      return (Math.PI / 2 - 2 *
        Math.atan(Math.exp((Math.round(y) - Point.offset) /
          Point.mercatorRadius))) * 180 / Math.PI;
    },

    latToY: function() {
      var Point = require(global.APP_DIR + '/models/Point');
      return Math.round(Point.offset - Point.mercatorRadius *
        Math.log((1 + Math.sin(this.lat * Math.PI / 180)) /
          (1 - Math.sin(this.lat * Math.PI / 180))) / 2);
    },

    xToLon: function(x) {
      var Point = require(global.APP_DIR + '/models/Point');
      return ((Math.round(x) - Point.offset) / Point.mercatorRadius) * 180/ Math.PI;
    },

    lonToX: function() {
      var Point = require(global.APP_DIR + '/models/Point');
      return Math.round(Point.offset + Point.mercatorRadius * this.lon * Math.PI / 180);
    },

    adjustLatByPixels: function (Δy, zoom) {
      return this.yToLat(this.latToY(this.lat) + (Δy << (21 - zoom)));
    },

    adjustLonByPixels: function (Δx, zoom) {
      return this.xToLon(this.lonToX(this.lon) + (Δx << (21 - zoom)));
    },

    geocode: function() {
      var geocodeDeferred = Q.defer();

      var point = this;

      Google.geocode({
        address: this.center
      }).then(function(result) {
        point.location = [result.geometry.location.lat, result.geometry.location.lng];
        point.lat = point.location[0];
        point.lon = point.location[1];
        geocodeDeferred.resolve();
      }).catch(function(err) {
        geocodeDeferred.reject(err);
      });

      return geocodeDeferred.promise;
    }

  };

})();

PointSchema.statics = (function() {

  return {

    getPoint: function(_id) {
      var getPointDeferred = Q.defer();

      require(global.APP_DIR + '/models/Point').findOne({
        _id: _id
      }, function(err, point) {
        if (err) {
          return getPointDeferred.reject(err);
        }
        getPointDeferred.resolve(point);
      });

      return getPointDeferred.promise;
    },

    radius: 6371,
    offset: 268435456,
    mercatorRadius: 85445659.44705395

  };

})();

PointSchema.pre('save', function(next) {
  this.geocode()
  .then(next);
});

PointSchema.plugin(timestamps);
module.exports = exports = mongoose.model('Point', PointSchema);