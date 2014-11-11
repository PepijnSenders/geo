module.exports = exports = {
  'fn': (function() {

    var PostalCode = require(global.APP_DIR + '/models/PostalCode'),
        Static = require(global.APP_DIR + '/models/Static'),
        Point = require(global.APP_DIR + '/models/Point'),
        Q = require('q'),
        im = require('imagemagick');

    return function() {

      var width = 500,
          height = 500,
          zoom = 18,
          waves = 2,
          maptype = 'satellite';

      this.findPostalCodes = function() {
        var findPostalCodesDeferred = Q.defer();

        PostalCode.find().skip(1000).limit(1).exec(function(err, documents) {
          findPostalCodesDeferred.resolve(documents);
        });

        return findPostalCodesDeferred.promise;
      };

      this.getCapillaryWaves = function(postalCodes) {
        var getCapillaryWavesDeferred = Q.defer();

        var capillaryWavesCollection = [];
        var getCapillary = (function(postalCode) {
          var originPoint = new Point();

          originPoint.location = postalCode.loc.reverse();
          originPoint.lat = originPoint.location[0];
          originPoint.lon = originPoint.location[1];

          originPoint.capillaryWaves(waves, width, height, zoom)
            .then(function(capillaryWaves) {
              capillaryWavesCollection.push(capillaryWaves);
              console.log(postalCodes.length);
              if (postalCodes.length) {
                getCapillary(postalCodes.shift());
              } else {
                getCapillaryWavesDeferred.resolve({
                  postalCode: postalCode,
                  capillaryWavesCollection: capillaryWavesCollection
                });
              }
            });
        })(postalCodes.shift());

        return getCapillaryWavesDeferred.promise;
      };

      this.fillStatics = function(capillaryWavesCollection) {
        var fillStaticsDeferred = Q.defer();

        var staticPromises = [];

        capillaryWavesCollection.capillaryWavesCollection.forEach(function(capillaryWaves, capillaryWavesCollectionIndex) {
          capillaryWaves.forEach(function(y, yIndex) {
            y.forEach(function(x, xIndex) {
              var static = new Static();

              static.point = x;
              static.width = width;
              static.height = height;
              static.zoom = zoom;
              static.maptype = maptype;

              capillaryWavesCollection.capillaryWavesCollection[capillaryWavesCollectionIndex][yIndex][xIndex] = static;

              staticPromises.push(static.getStatic().then(function(static) {
                capillaryWavesCollection.capillaryWavesCollection[this.capillaryWavesCollectionIndex][this.yIndex][this.xIndex] = static;
                return static;
              }.bind({
                capillaryWavesCollectionIndex: capillaryWavesCollectionIndex,
                yIndex: yIndex,
                xIndex: xIndex
              })));
            });
          });
        });

        var staticPromisesAfter = [];
        Q.allSettled(staticPromises)
          .then(function(resolves) {
            resolves.forEach(function(resolve) {
              if (resolve.state === 'fulfilled') {
                var deferred = Q.defer();

                deferred.resolve(resolve.value);

                staticPromisesAfter.push(deferred.promise);
              } else {
                staticPromisesAfter.push(Q.nbind(resolve.reason.save, resolve.reason)());
              }
            });

            return Q.allSettled(staticPromisesAfter);
          })
          .then(function() {
            fillStaticsDeferred.resolve(capillaryWavesCollection);
          })
          .catch(function() {
            fillStaticsDeferred.reject.apply(this, arguments);
          });

        return fillStaticsDeferred.promise;
      };

      this.montage = function(paths, filename) {
        var montageDeferred = Q.defer();

        im.montage(paths.concat([
          '-tile',
          (waves * 2) + 'x' + (waves * 2),
          '-geometry',
          width + 'x' + height,
          filename
        ]), function() {
          montageDeferred.resolve();
        });

        return montageDeferred.promise;
      };

      this.scale = function(filename) {
        var scaleDeferred = Q.defer();

        im.convert([
          filename,
          '-scale',
          'x70%',
          filename
        ], function() {
          scaleDeferred.resolve();
        });

        return scaleDeferred.promise;
      };

      this.distort = function(filename) {
        var distortDeferred = Q.defer();

        im.convert([
          filename,
          '-distort',
          'Perspective',
          '"' + (width * waves) + ',' + (height * waves) + '"',
          filename
        ], function() {
          console.log(arguments);
        });

        return distortDeferred.promise;
      };

      var nplImagesFn = this;

      this.findPostalCodes()
        .then(function(postalCodes) {
          return nplImagesFn.getCapillaryWaves(postalCodes);
        })
        .then(function(capillaryWavesCollection) {
          return nplImagesFn.fillStatics(capillaryWavesCollection);
        })
        .then(function(staticsCollection) {
          var promises = [];
          staticsCollection.capillaryWavesCollection.forEach(function(statics) {
            var paths = [];

            statics.forEach(function(row) {
              row.forEach(function(static) {
                paths.push(static.path);
              });
            });

            var filename = global.TMP_DIR + '/' + staticsCollection.postalCode._id + '.jpg';

            nplImagesFn.montage(paths, filename)
              .then(function() {
                return nplImagesFn.scale(filename);
              })
              .then(function() {
                return nplImagesFn.distort(filename);
              });
          });

          return Q.allSettled(promises);
        })
        .then(function() {

        })
        .catch(function() {
          console.log(arguments);
        });

    };

  })()
};