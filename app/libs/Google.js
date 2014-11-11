module.exports = exports = (function() {

  var url = require('url'),
      request = require('request'),
      im = require('imagemagick'),
      aws = require(global.APP_DIR + '/libs/aws'),
      Q = require('q'),
      config = require(global.APP_DIR + '/config')
      GoogleCache = require(global.APP_DIR + '/models/GoogleCache'),
      fs = require('fs'),
      path = require('path'),
      uniqid = require('uniqid');

  var _bases = {
    'staticmap': 'https://maps.googleapis.com/maps/api/staticmap',
    'geocode': 'https://maps.googleapis.com/maps/api/geocode/json',
    'streetview': 'https://maps.googleapis.com/maps/api/streetview'
  };

  var Google = {

    downloadImage: function(options) {
      var downloadImageDeferred = Q.defer();

      var tmpFile = global.TMP_DIR + '/static-' + uniqid() + '.png';
      var stream = fs.createWriteStream(tmpFile);

      request(options.url, function(err, response, body) {
        downloadImageDeferred.resolve(tmpFile);
      }).pipe(stream);

      return downloadImageDeferred.promise;
    },

    cropImage: function(options) {
      var cropImageDeferred = Q.defer();

      im.convert([
        '-gravity',
        'Center',
        options.path,
        '-crop',
        options.realSize,
        options.path
      ], function(err, stdout) {
        if (err) {
          return cropImageDeferred.reject();
        }
        cropImageDeferred.resolve(options.path);
      });

      return cropImageDeferred.promise;
    },

    staticmap: function(options) {
      var staticmapDefer = Q.defer();

      this.downloadImage({
        url: url.format(this.buildUrl(_bases['staticmap'], options))
      }).then(function(tmpPath) {
        return Google.cropImage({
          path: tmpPath,
          realSize: options.realSize
        });
      }).then(function(tmpPath) {
        return aws.uploadFile(tmpPath);
      }).then(function(url) {
        staticmapDefer.resolve(url);
      }).catch(function(err) {
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

    buildUrl: function(base, query) {
      var requestUrl = url.parse(base);

      requestUrl.query = query;
      requestUrl.query.key = config.get('google.key');

      return requestUrl;
    },

    request: function(base, query) {
      var requestDeferred = Q.defer();

      var requestUrl = this.buildUrl(base, query);

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

  return Google;

})();