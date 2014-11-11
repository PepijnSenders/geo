module.exports = exports = {
  'fn': (function() {

    var PostalCode = require(global.APP_DIR + '/models/PostalCode'),
        Static = require(global.APP_DIR + '/models/Static'),
        Q = require('q');

    return function() {

      this.findPostalCodes = function() {
        var findPostalCodesDeferred = Q.defer();

        PostalCode.find().sort('-createdAt').limit(10).exec(function(err, documents) {
          findPostalCodesDeferred.resolve(documents);
        });

        return findPostalCodesDeferred.promise;
      };

      this.findPostalCodes()
        .then(function(postalCodes) {
          var static = new Static();

          static.width = 500;
          static.height = 500;
          static.maptype = satellite;

        });

    };

  })()
};