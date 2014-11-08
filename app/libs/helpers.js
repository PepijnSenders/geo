/**
 * Helpers for jade templates
 * @type   {Function}
 * @param  {Express.req} req
 * @return {Object} Helpers
 */
module.exports = exports = function(req) {

  var helpers = {
    /**
     * Exposed request protocol
     * @type {String}
     */
    protocol: req.protocol,
    /**
     * Exposed request host
     * @type {String}
     */
    host: req.get('host'),
    /**
     * Exposed request originalUrl
     * @type {String}
     */
    originalUrl: req.originalUrl,
    /**
     * Global environment
     * @type {String}
     */
    env: global.ENV,
    /**
     * Global port
     * @type {Number}
     */
    port: global.PORT,

    /**
     * Get base url of request
     * @return {String}
     */
    getBase: function() {
      return helpers.protocol + '://' + helpers.host;
    },

    /**
     * Get full url of request
     * @return {String}
     */
    getUrl: function() {
      return helpers.getBase() + helpers.originalUrl;
    }
  };

  return helpers;

};