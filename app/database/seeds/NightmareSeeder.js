module.exports = exports = {
  "fn": function() {
    var phantom = require('phantom'),
        im = require('imagemagick'),
        Q = require('q'),
        Google = require(global.APP_DIR + '/libs/Google'),
        PostalCode = require(global.APP_DIR + '/models/PostalCode');


    this.getPostalCodes = function() {
      var getPostalCodesDeferred = Q.defer();

      PostalCode
        .find({
          latitude: {
            $ne: 0
          },
          longitude: {
            $ne: 0
          },
          rendered: {
            $ne: true
          }
        })
        .limit(500)
        .exec(function(err, documents) {
          getPostalCodesDeferred.resolve(documents);
        });

      return getPostalCodesDeferred.promise;
    };

    this.getPage = function(url) {
      var getPageDeferred = Q.defer();

      phantom.create(function(ph) {
        ph.createPage(function(page) {
          page.set('viewportSize', {
            width: 2000,
            height: 2200
          });
          page.set('clipRect', {
            top: 0,
            left: 0,
            width: 2000,
            height: 2200
          });
          page.set('onCallback', function() {
            getPageDeferred.resolve(page);
          });
          page.open(url);
        });
      });

      return getPageDeferred.promise;
    };

    this.renderPage = function(path, page) {
      var renderPageDeferred = Q.defer();

      page.render(path);
      process.nextTick(function() {
        setTimeout(function() {
          renderPageDeferred.resolve(path);
        }, 500);
      });

      return renderPageDeferred.promise;
    };

    this.parsePage = function(postalCode) {
      var parsePageDeferred = Q.defer();

      var seeder = this;

      this.getPage('http://localhost:{port}?lon={lon}&lat={lat}'.assign({
        port: global.PORT,
        lon: postalCode.longitude,
        lat: postalCode.latitude
      }))
      .then(function(page) {
        var path = global.TMP_DIR + '/maps/' + postalCode.postalCode + '.jpg';
        return seeder.renderPage(path, page);
      })
      .then(function(path) {
        return Google.cropImage({
          path: path,
          realSize: '2000x2000+0+100'
        });
      })
      .then(function() {
        postalCode.rendered = true;
        return Q.nbind(postalCode.save, postalCode)();
      })
      .then(function() {
        parsePageDeferred.resolve();
      })
      .catch(function() {
        console.log(arguments);
      });

      return parsePageDeferred.promise;
    };

    var seeder = this;

    this.getPostalCodes()
      .then(function(postalCodes) {
        var parsePostalCode = function(postalCode) {
          var start = new Date();
          seeder.parsePage(postalCode)
            .then(function() {
              console.log('time: ', new Date() - start);
              if (postalCodes.length) {
                console.log(postalCodes.length);
                parsePostalCode(postalCodes.shift());
              } else {
                console.log('ready');
              }
            });
        };

        parsePostalCode(postalCodes.shift());
      })
      .catch(function() {
        console.log(arguments);
      });
  }
};