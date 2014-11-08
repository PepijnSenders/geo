var phantom = require('phantom');

var _renderHtml = function(url, cb) {
  var _page;
  phantom.create(function(ph) {
    ph.createPage(function(page) {
      _page = page;
      _page.set('loadImages', false);
      _page.set('localToRemoteUrlAccessEnabled', true);

      var _called = false;

      _page.set('onCallback', function() {
        if (_called) return;
        _called = true;
        _page.evaluate(function() {
          return document.documentElement.innerHTML;
        }, cb);
        _page.close();
      });

      _page.set('onInitialized', function() {
        _page.evaluate(function() {
          setTimeout(function() {
            window.callPhantom();
          }, 10000);
        });
      });

      _page.open(url);
    });
  });
};

module.exports = exports = function(req, res, next) {

  if (req.headers['user-agent'].match(/bot|googlebot|crawler|spider|robot|crawling|curl|python\-requests|facebookexternalhit|arachmo|B\-l\-i\-t\-z\-B\-O\-T/i)) {
    _renderHtml(req.protocol + '://' + req.get('host') + req.originalUrl, function(result) {
      res.status(200).send(result);
    });
  } else {
    next();
  }

};