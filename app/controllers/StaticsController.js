var Static = require(global.APP_DIR + '/models/Static');

module.exports = exports = {

  index: function(req, res) {
    try {
      var params = req.expects({
        width: {
          type: 'number',
          default: 500
        },
        height: {
          type: 'number',
          default: 500
        },
        zoom: {
          type: 'number',
          default: 10
        },
        scale: {
          type: 'number',
          default: 1
        },
        maptype: {
          type: 'string',
          validations: 'regex:/roadmap|satellite|terrain|hybrid/',
          default: 'roadmap'
        },
        language: {
          type: 'string',
          default: 'en'
        },
        region: {
          type: 'string'
        },
        markers: {
          type: 'string'
        },
        path: {
          type: 'string'
        },
        visible: {
          type: 'string'
        },
        style: {
          type: 'string'
        }
      });
    } catch (errors) {
      return res.status(400).send({
        message: errors
      });
    }


    var static = new Static(params);
    static.point = req.points['center'];
    static.save(function(err) {
      console.log(err);
    });
  },

  path: function(req, res) {

  },

  grid: function(req, res) {

  },

  zoom: function(req, res) {

  }

};