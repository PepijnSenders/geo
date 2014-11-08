module.exports = exports = {

  index: function(req, res) {
    try {
      var params = req.expects({
        center: {
          type: 'string',
          validations: 'required'
        },
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
          type: 'number'
        },
        format: {
          type: 'string'
        },
        maptype: {
          type: 'string'
        },
        language: {
          type: 'string'
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
        },
        size: {
          type: 'string'
        }
      });
    } catch(errors) {

    }
  },

  path: function(req, res) {

  },

  grid: function(req, res) {

  },

  zoom: function(req, res) {

  }

};