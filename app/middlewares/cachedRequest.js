var Cache = require(global.APP_DIR + '/models/Cache');

module.exports = exports = function (req, res, next) {
  var url = req.protocol + '://' + req.get('host') + req.originalUrl;

  Cache.findOne({
    url: url
  }, function(err, document) {
    if (document) {
      res.status(304).send(document.response);
    } else {
      next();
    }
  });
};