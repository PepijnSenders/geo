module.exports = exports = {
  // 'fn': (function() {

  //   var PostalCode = require(global.APP_DIR + '/models/PostalCode'),
  //       Static = require(global.APP_DIR + '/models/Static'),
  //       Point = require(global.APP_DIR + '/models/Point'),
  //       Q = require('q'),
  //       spawn = require('child_process').spawn,
  //       im = require('imagemagick');

  //   return function() {

  //     var width = 500,
  //         height = 500,
  //         zoom = 18,
  //         waves = 2,
  //         maptype = 'satellite',
  //         distortPercentage = 0.2,
  //         limit = 50;

  //     this.findPostalCodes = function() {
  //       var findPostalCodesDeferred = Q.defer();

  //       PostalCode.find({
  //         latitude: {
  //           $ne: 0
  //         },
  //         longitude: {
  //           $ne: 0
  //         }
  //       }).limit(limit).exec(function(err, documents) {
  //         findPostalCodesDeferred.resolve(documents);
  //       });

  //       return findPostalCodesDeferred.promise;
  //     };

  //     this.getCapillaryWaves = function(postalCodes) {
  //       var getCapillaryWavesDeferred = Q.defer();

  //       var capillaryWavesCollection = [];

  //       var getCapillary = function(postalCode) {
  //         var originPoint = new Point();

  //         originPoint.location = postalCode.loc.reverse();
  //         originPoint.lat = originPoint.location[0];
  //         originPoint.lon = originPoint.location[1];

  //         originPoint.capillaryWaves(waves, width, height, zoom)
  //           .then(function(capillaryWaves) {
  //             capillaryWavesCollection.push({
  //               waves: capillaryWaves,
  //               postalCode: postalCode
  //             });
  //             if (postalCodes.length) {
  //               getCapillary(postalCodes.shift());
  //             } else {
  //               getCapillaryWavesDeferred.resolve(capillaryWavesCollection);
  //             }
  //           }).catch(function() {
  //             console.log(arguments);
  //           });
  //       };

  //       getCapillary(postalCodes.shift());

  //       return getCapillaryWavesDeferred.promise;
  //     };

  //     this.fillStatic = function(point) {
  //       var fillStaticDeferred = Q.defer();

  //       var static = new Static();

  //       static.point = point;
  //       static.width = width;
  //       static.height = height;
  //       static.zoom = zoom;
  //       static.maptype = maptype;

  //       static.getStatic().then(function(static) {
  //         fillStaticDeferred.resolve(static);
  //       }).catch(function() {
  //         var static = this.static;
  //         static.save(function(err) {
  //           if (err) {
  //             fillStaticDeferred.reject(err);
  //           } else {
  //             fillStaticDeferred.resolve(static);
  //           }
  //         });
  //       }.bind({
  //         static: static
  //       }));

  //       return fillStaticDeferred.promise;
  //     };

  //     this.montage = function(paths, filename) {
  //       var montageDeferred = Q.defer();

  //       im.montage(paths.concat([
  //         '-tile',
  //         (waves * 2) + 'x' + (waves * 2),
  //         '-geometry',
  //         width + 'x' + height,
  //         filename
  //       ]), function() {
  //         montageDeferred.resolve();
  //       });

  //       return montageDeferred.promise;
  //     };

  //     this.scale = function(filename) {
  //       var scaleDeferred = Q.defer();

  //       im.convert([
  //         filename,
  //         '-quality',
  //         70,
  //         '-scale',
  //         'x70%',
  //         filename
  //       ], function() {
  //         scaleDeferred.resolve();
  //       });

  //       return scaleDeferred.promise;
  //     };

  //     this.distort = function(filename) {
  //       var distortDeferred = Q.defer();

  //       var totalWidth = width * waves * 2,
  //           totalHeight = height * waves * 2;

  //       var params = [
  //         filename,
  //         '-matte',
  //         '-virtual-pixel',
  //         'transparent',
  //         '-distort',
  //         'Perspective "{left},{top} {newLeft},{top}   {left},{bottom} {left},{bottom}   {right},{bottom} {right},{bottom}    {right},{top} {newRight},{top}"'.assign({
  //           left: 0,
  //           top: 0,
  //           newLeft: totalWidth * distortPercentage,
  //           bottom: totalHeight,
  //           right: totalWidth,
  //           newRight: totalWidth - totalWidth * distortPercentage
  //         }),
  //         filename
  //       ];

  //       im.convert(params, function() {
  //         console.log(arguments);
  //       });

  //       return distortDeferred.promise;
  //     };

  //     var nplImagesFn = this;

  //     this.findPostalCodes()
  //       .then(function(postalCodes) {
  //         return nplImagesFn.getCapillaryWaves(postalCodes);
  //       })
  //       .then(function(staticsCollection) {
  //         var fillStaticsDeferred = Q.defer();

  //         var shiftCollection = staticsCollection.slice(0);

  //         var fillStatics = function(statics) {
  //           console.log('fillStatics', shiftCollection.length);

  //           var promises = [];

  //           statics.waves.forEach(function(row, rowIndex) {
  //             row.forEach(function(point, cellIndex) {
  //               promises.push(nplImagesFn.fillStatic(point)
  //                 .then(function(static) {
  //                   staticsCollection[staticsCollection.length - shiftCollection.length - 1].waves[rowIndex][cellIndex] = static;
  //                 })
  //                 .catch(function() {
  //                   console.log(arguments);
  //                 }));
  //             });
  //           });

  //           Q.allSettled(promises)
  //             .then(function() {
  //               if (shiftCollection.length) {
  //                 fillStatics(shiftCollection.shift());
  //               } else {
  //                 fillStaticsDeferred.resolve(staticsCollection);
  //               }
  //             })
  //             .catch(function() {
  //               console.log(arguments);
  //             });
  //         };

  //         fillStatics(shiftCollection.shift());

  //         return fillStaticsDeferred.promise;
  //       })
  //       .then(function(staticsCollection) {
  //         var montageDeferred = Q.defer();

  //         var shiftCollection = staticsCollection.slice(0);

  //         var montage = function(statics) {
  //           console.log('montage', shiftCollection.length);
  //           var paths = [];

  //           statics.waves.forEach(function(row) {
  //             row.forEach(function(static) {
  //               paths.push(static.path);
  //             });
  //           });

  //           var filename = global.TMP_DIR + '/postalcodes/' + statics.postalCode.postalCode + '.jpg';

  //           nplImagesFn.montage(paths, filename).then(function() {
  //             if (shiftCollection.length) {
  //               montage(shiftCollection.shift());
  //             } else {
  //               montageDeferred.resolve(staticsCollection);
  //             }
  //           });
  //         };

  //         montage(shiftCollection.shift());

  //         return montageDeferred.promise;
  //       })
  //       .then(function(staticsCollection) {
  //         console.log('montages ready');
  //         // var scaleDeferred = Q.defer();

  //         // var shiftCollection = staticsCollection.slice(0);

  //         // var scale = function(statics) {
  //         //   console.log('scale', shiftCollection.length);
  //         //   var paths = [];

  //         //   statics.waves.forEach(function(row) {
  //         //     row.forEach(function(static) {
  //         //       paths.push(static.path);
  //         //     });
  //         //   });

  //         //   var filename = global.TMP_DIR + '/postalcodes/' + statics.postalCode.postalCode + '.png';

  //         //   nplImagesFn.scale(filename).then(function() {
  //         //     if (shiftCollection.length) {
  //         //       scale(shiftCollection.shift());
  //         //     } else {
  //         //       scaleDeferred.resolve(staticsCollection);
  //         //     }
  //         //   });
  //         // };

  //         // scale(shiftCollection.shift());

  //         // return scaleDeferred.promise;
  //       })
  //       .then(function() {
  //         console.log('done');
  //       })
  //       .catch(function() {
  //         console.log(arguments);
  //       });

  //   };

  // })()
};