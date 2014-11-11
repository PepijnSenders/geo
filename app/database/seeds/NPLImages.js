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

            im.montage(paths.concat([
              '-tile',
              '4x4',
              '-geometry',
              '500x500',
              filename
            ]), function() {
              var deferred = Q.defer();
              deferred.resolve();
              promises.push(deferred.promise);
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