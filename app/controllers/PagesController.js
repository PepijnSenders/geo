module.exports = exports = {

  hello: function(req, res) {
    res.render('pages/index', {
      lat: req.param('lat'),
      lon: req.param('lon')
    });
  }

};