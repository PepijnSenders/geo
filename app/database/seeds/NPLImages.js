module.exports = exports = {
  'fn': (function() {

    var PostalCode = require(global.APP_DIR + '/models/PostalCode'),
        Static = require(global.APP_DIR + '/models/Static'),
        Point = require(global.APP_DIR + '/models/Point'),
        Q = require('q');

    return function() {

      this.findPostalCodes = function() {
        var findPostalCodesDeferred = Q.defer();

        PostalCode.find().skip(1000).limit(1).exec(function(err, documents) {
          findPostalCodesDeferred.resolve(documents);
        });

        return findPostalCodesDeferred.promise;
      };

      this.findPostalCodes()
        .then(function(postalCodes) {
          var promises = [];

          var getCapillary = (function(postalCode) {
            var originPoint = new Point();

            originPoint.location = postalCodes[i].loc.reverse();
            originPoint.lat = originPoint.location[0];
            originPoint.lon = originPoint.location[1];

            var width = 500,
                height = 500,
                zoom = 18,
                waves = 2;

            originPoint.capillaryWaves(waves, width, height, zoom)
              .then(function() {
                getCapillary(postalCodes.shift());
              });
          })(postalCodes.shift());
        })
        .then(function() {

        });

    };

  })()
};