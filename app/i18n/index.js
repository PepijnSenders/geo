var doT = require('dot'),
    fs = require('fs'),
    config = require(global.APP_DIR + '/config');

/**
 * @class i18n
 * @type {Object}
 */
module.exports = exports = {

  /**
   * Default language
   * @type {String}
   */
  defaultLanguage: 'en',

  /**
   * Get translation
   * @param  {String} value
   * @param  {Object} templateValues
   * @return {String}
   */
  get: function(value, templateValues) {
    var keys = value.split('.');

    var namespace = keys[0];

    if (templateValues && typeof templateValues === 'object') {
      var tmpl = doT.template(this._getTranslations(namespace)[keys[1]]);
      return tmpl(templateValues);
    } else {
      return this._getTranslations(namespace)[keys[1]];
    }
  },

  /**
   * Get language file for namespace
   * @private
   * @param  {String} namespace
   * @return {Object} config
   */
  _getTranslations: function (namespace) {
    var path = global.APP_DIR +  '/i18n/' + config.get('app.lang') + '/' + namespace;
    if (fs.existsSync(path + '.js')) {
      return require(path);
    } else {
      throw 'Language file not found';
    }
  }

};