var fs = require('fs');

/**
 * @class Config
 * @type {Object}
 */
module.exports = exports = {

  /**
   * Get value from config file
   * @param  {String} value
   * @return {String} configValue
   */
  get: function (value) {
    var keys = value.split('.');

    var namespace = keys[0];

    return this._getConfig(namespace)[keys[1]];
  },

  /**
   * Set value from config file
   * @param  {String} name
   * @param  {String} value
   * @param  {String} newValue
   * @return {Object} config
   */
  set: function (name, value, newValue) {
    var config = this._getConfig(name);

    config[value] = newValue;

    return config;
  },

  /**
   * Get config file for environment
   * @private
   * @param  {String} namespace
   * @return {Object} config
   */
  _getConfig: function (namespace) {
    var path = global.APP_DIR +  '/config/' + global.ENV + '/' + namespace;
    if (fs.existsSync(path + '.js')) {
      return require(path);
    } else {
      throw 'Config file not found';
    }
  }

};