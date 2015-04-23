module.exports = exports = {

  hello: function(req, res) {
    res.render('pages/index', {
      lat: req.params.lat || req.query.lat,
      lon: req.params.lon || req.query.lon
    });
  }

};