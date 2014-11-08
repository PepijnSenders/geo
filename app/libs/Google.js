var url = require('url'),
    request = require('request'),
    Q = require('q'),
    config = require(global.APP_DIR + '/config')
    GoogleCache = require(global.APP_DIR + '/models/GoogleCache');

module.exports = exports = (function() {

  var _bases = {
    'staticmap': 'https://maps.googleapis.com/maps/api/staticmap',
    'geocode': 'https://maps.googleapis.com/maps/api/geocode/json',
    'streetview': 'https://maps.googleapis.com/maps/api/streetview'
  };

  return {

    staticmap: function(options) {
      var staticmapDefer = Q.defer();

      this.request(_bases['staticmap'], options).then(function(result) {
        console.log(result);
      }).catch(function(err) {
        console.log(err);
        staticmapDefer.reject(err);
      });

      return staticmapDefer.promise;
    },

    geocode: function(options) {
      var geocodeDeferred = Q.defer();

      this.request(_bases['geocode'], {
        address: options.address,
        components: options.components,
        bounds: options.bounds,
        language: options.language,
        region: options.region
      }).then(function(result) {
        if (result.status === 'OK' && result.results.length > 0) {
          geocodeDeferred.resolve(result.results[0]);
        } else {
          geocodeDeferred.reject('Address not resolved');
        }
      }).catch(function(err) {
        geocodeDeferred.reject(err);
      });

      return geocodeDeferred.promise;
    },

    getCached: function(service, query) {
      var getCachedDeferred = Q.defer();

      GoogleCache.findOne({
        service: service,
        query: query
      }, function(err, document) {
        if (document) {
          getCachedDeferred.resolve(document);
        } else {
          getCachedDeferred.reject(err ? err : null);
        }
      });

      return getCachedDeferred.promise;
    },

    request: function(base, query) {
      var requestDeferred = Q.defer();

      var requestUrl = url.parse(base);

      requestUrl.query = query;
      requestUrl.query.key = config.get('google.key');

      var service = base,
          query = JSON.stringify(requestUrl.query);

      this.getCached(service, query).then(function(document) {
        requestDeferred.resolve(document.result);
      }).catch(function() {
        request(url.format(requestUrl), function(err, response, body) {
          if (err) {
            return requestDeferred.reject(err);
          }

          try {
            body = JSON.parse(body);
          } catch(err) {
            // Image response
            return requestDeferred.resolve(body);
          }

          if (!body.results.length) {
            return requestDeferred.reject(body.status);
          }

          var googleCache = new GoogleCache();
          googleCache.service = service;
          googleCache.query = query;
          googleCache.result = body;

          googleCache.save(function(err) {
            if (err) {
              return requestDeferred.reject(err);
            }
            requestDeferred.resolve(googleCache.result);
          });
        });
      });

      return requestDeferred.promise;
    }

  };

})();