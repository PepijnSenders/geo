module.exports = exports = (function() {

  var AWS = require('aws-sdk'),
      Q = require('q'),
      fs = require('fs'),
      path = require('path'),
      config = require(global.APP_DIR + '/config');

  AWS.config.update({
    accessKeyId: config.get('aws.accessKeyId'),
    region: config.get('aws.region'),
    secretAccessKey: config.get('aws.secretAccessKey')
  });

  var aws = {

    _buildUrl: function(filename) {
      return 'https://s3.' + config.get('aws.region') + '.amazonaws.com/' + config.get('aws.bucket') + '/' + filename;
    },

    uploadFile: function(filePath) {
      var uploadFileDeferred = Q.defer();

      fs.readFile(filePath, function(err, body) {
        var filename = path.basename(filePath);
        aws.getBucket().putObject({
          Key: filename,
          Body: body,
          ACL: 'public-read-write'
        }, function() {
          uploadFileDeferred.resolve({
            url: aws._buildUrl(filename),
            path: filePath
          });
        });
      });

      return uploadFileDeferred.promise;
    },

    getBucket: function() {
      return new AWS.S3({
        params: {
          Bucket: config.get('aws.bucket')
        }
      });
    }

  };

  return aws;

})();