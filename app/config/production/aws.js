module.exports = exports = (function() {

  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    bucket: process.env.AWS_BUCKET,
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  };

})();