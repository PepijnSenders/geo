module.exports = exports = {
  'mongoimport': {
    path: global.APP_DIR + '/storage/postalCodes.json',
    collection: 'postalcodes'
  },
  'fn': (function() {

    return function() {};

    // var PostalCode = require(global.APP_DIR + '/models/PostalCode'),
    //     Point = require(global.APP_DIR + '/models/Point'),
    //     Q = require('q');

    // return function() {

    //   this.findPostalCodes = function() {
    //     var findPostalCodesDeferred = Q.defer();

    //     PostalCode.find().limit(100).exec(function(err, documents) {
    //       findPostalCodesDeferred.resolve(documents);
    //     });

    //     return findPostalCodesDeferred.promise;
    //   };

    //   this.findPostalCodes()
    //     .then(function(postalCodes) {
    //       var savePoint = (function(postalCode) {
    //         var point = new Point();

    //         point.location = [postalCode.latitude, postalCode.longitude];
    //         point.lon = postalCode.longitude;
    //         point.lat = postalCode.latitude;

    //         point.save(function(err) {
    //           console.error(err);
    //           delete postalCode.loc;
    //           delete postalCode.longitude;
    //           delete postalCode.latitude
    //           savePoint(postalCodes.shift());
    //         });
    //       })(postalCodes.shift());
    //     });

    // };

  })()
};