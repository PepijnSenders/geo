var url = require('url');

module.exports = exports = (function() {

  var _bases = {
    'staticmap': 'https://maps.googleapis.com/maps/api/staticmap',
    'geocode': 'https://maps.googleapis.com/maps/api/geocode/json',
    'streetview': 'https://maps.googleapis.com/maps/api/streetview'
  };

  return {

    geocode: function(options) {
      var geocodeDeferred = Q.defer();



      return geocodeDeferred.promise;
    },

    request: function(base, query) {
      var requestDeferred = Q.defer();

      var requestUrl = url.parse(_bases[base]);

      Object.merge(requestUrl.query, query);
      requestUrl.query.key = config.get('google.key');

      request(url.format(requestUrl), function(err, response, body) {
        if (err) {
          return requestDeferred.reject(err);
        }

        try {
          body = JSON.parse(body);
        } catch(err) {
          return requestDeferred.reject(err);
        }

        if (!body.results.length) {
          return requestDeferred.reject(body.status);
        }

        var result = body.results[0];

        requestDeferred.resolve(result);
      });

      return requestDeferred.promise;
    }

  };

})();