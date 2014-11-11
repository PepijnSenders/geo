module.exports = exports = (function() {

  var spawn = require('child_process').spawn,
      fs = require('fs'),
      Q = require('q'),
      path = require('path'),
      config = require(global.APP_DIR + '/config'),
      mongoUri = require('mongo-uri');

  return {

    _getFiles: function() {
      var getFilesDeferred = Q.defer();

      fs.readdir(global.APP_DIR + '/database/seeds', function(err, files) {
        var filteredFiles = files.filter(function(file) {
          return path.extname(file) === '.js';
        });

        var requiredObjects = [];
        for (var i = 0; i < filteredFiles.length; i++) {
          requiredObjects.push(require(global.APP_DIR + '/database/seeds/' + filteredFiles[i]));
        }

        getFilesDeferred.resolve(requiredObjects);
      });

      return getFilesDeferred.promise;
    },

    _mongoimport: function(data) {
      var mongoimportDeferred = Q.defer();

      mongoimportDeferred.resolve();

      // var uri = mongoUri.parse(config.get('database.name'));

      // var params = [];

      // if (uri.hosts && uri.hosts.length && uri.hosts[0]) {
      //   params.push('--host');
      //   params.push(uri.hosts[0]);
      // }
      // if (uri.ports && uri.ports.length && uri.ports[0]) {
      //   params.push('--port');
      //   params.push(uri.ports[0]);
      // }
      // if (uri.username) {
      //   params.push('--username');
      //   params.push(uri.username);
      // }
      // if (uri.password) {
      //   params.push('--password');
      //   params.push(uri.password);
      // }
      // if (data.collection) {
      //   params.push('--collection');
      //   params.push(data.collection);
      // }
      // if (uri.database) {
      //   params.push('--db');
      //   params.push(uri.database);
      // }
      // if (data.path) {
      //   params.push('--file');
      //   params.push(data.path);
      // }

      // var importSpawn = spawn('mongoimport', params);

      // importSpawn.stdout.on('data', function(data) {
      //   console.log('stdout:' + data);
      // });

      // var errorMesssages = [];
      // importSpawn.stderr.on('data', function(data) {
      //   errorMesssages.push(data);
      // });

      // importSpawn.on('close', function(errors) {
      //   if (errors > 0) {
      //     mongoimportDeferred.reject(errorMesssages);
      //   } else {
      //     mongoimportDeferred.resolve();
      //   }
      // });

      return mongoimportDeferred.promise;
    },

    _fn: function(fn) {
      fn.call();
    },

    start: function() {
      var Seeder = this;

      this._getFiles()
        .then(function(requiredObjects) {
          var promises = [];

          for (var i = 0; i < requiredObjects.length; i++) {
            var requiredObject = requiredObjects[i];
            for (var key in requiredObject) {
              var privateFn = '_' + key;
              if (privateFn in Seeder) {
                promises.push(Seeder[privateFn](requiredObject[key]));
              }
            }
          }

          return Q.allSettled(promises);
        })
        .then(function() {

        })
        .catch(function(errors) {
          console.log(arguments);
        });
    }

  };

})();