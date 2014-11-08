var i18n = require(global.APP_DIR + '/i18n');

/**
 * @class validations
 * @type  {Object}
 */
module.exports = exports = {

  /**
   * Validate after
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @param  {String} after
   * @return {String|undefined}
   */
  after: function(attribute, value, after) {
    try {
      var d = this._makeDate(attribute, value), after = this._makeDate('after', after);

      if (d.getTime() < after.getTime()) {
        return i18n.get('validations.after', {
          attribute: attribute,
          after: after
        });
      }
    } catch (e) {
      return e;
    }
  },

  /**
   * Validate alpha
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @return {String|undefined}
   */
  alpha: function(attribute, value) {
    try {
      if (!value.match(/[a-z]/i)) {
        return i18n.get('validations.alpha', {
          attribute: attribute
        });
      }
    } catch (e) {
      return i18n.get('validations.regex', {
        attribute: attribute
      });
    }
  },

  /**
   * Validate alphaDash
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @return {String|undefined}
   */
  alphaDash: function(attribute, value) {
    try {
      if (!value.match(/[a-zA-Z0-9-_]/)) {
        return i18n.get('validations.alphaDash', {
          attribute: attribute
        });
      }
    } catch (e) {
      return i18n.get('validations.regex', {
        attribute: attribute
      });
    }
  },

  /**
   * Validate alphaNum
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @return {String|undefined}
   */
  alphaNum: function(attribute, value) {
    try {
      if (!value.match(/[a-zA-Z0-9]/)) {
        return i18n.get('validations.alphaNum', {
          attribute: attribute
        });
      }
    } catch (e) {
      return i18n.get('validations.regex', {
        attribute: attribute
      });
    }
  },

  /**
   * Validate before
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @param  {String} before
   * @return {String|undefined}
   */
  before: function(attribute, value, before) {
    try {
      var d = this._makeDate(attribute, value), before = this._makeDate('before', before);

      if (d.getTime() > before.getTime()) {
        return i18n.get('validations.before', {
          attribute: attribute,
          before: before
        });
      }
    } catch (e) {
      return e;
    }
  },

  /**
   * Validate date
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @return {String|undefined}
   */
  date: function(attribute, value) {
    try {
      var d = this._makeDate(attribute, value);
    } catch (e) {
      return e;
    }
  },

  /**
   * Validate email
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @return {String|undefined}
   */
  email: function(attribute, value) {
    try {
      if (!value.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        return i18n.get('validations.email', {
          attribute: attribute
        });
      }
    } catch (e) {
      return i18n.get('validations.regex', {
        attribute: attribute
      });
    }
  },

  /**
   * Validate max
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @param  {String} max
   * @return {String|undefined}
   */
  max: function(attribute, value, max) {
    if (parseInt(value, 10) > parseInt(max, 10)) {
      return i18n.get('validations.max', {
        attribute: attribute,
        max: max
      });
    }
  },

  /**
   * Validate min
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @param  {String} min
   * @return {String|undefined}
   */
  min: function(attribute, value, min) {
    if (parseInt(value, 10) < parseInt(min, 10)) {
      return i18n.get('validations.min', {
        attribute: attribute,
        min: min
      });
    }
  },

  /**
   * Validate numeric
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @return {String|undefined}
   */
  numeric: function(attribute, value) {
    try {
      if (!value.match(/[0-9]/)) {
        return i18n.get('validations.numeric', {
          attribute: attribute
        });
      }
    } catch (e) {
      return i18n.get('validations.regex', {
        attribute: attribute
      });
    }
  },

  /**
   * Validate regex
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @param  {String} regex
   * @return {String|undefined}
   */
  regex: function(attribute, value, regex) {
    try {
      if (!value.match(regex)) {
        return i18n.get('validations.regex', {
          attribute: attribute
        });
      }
    } catch (e) {
      return i18n.get('validations.regex', {
        attribute: attribute
      });
    }
  },

  /**
   * Validate required
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @return {String|undefined}
   */
  required: function(attribute, value) {
    if (typeof value !== 'number' && !value) {
      return i18n.get('validations.required', {
        attribute: attribute
      });
    }
  },

  /**
   * Validate url
   * @param  {String} attribute
   * @param  {Mixed}  value
   * @return {String|undefined}
   */
  url: function(attribute, value) {
    try {
      if (!value.match(/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi)) {
        return i18n.get('validations.url', {
          attribute: attribute
        });
      }
    } catch (e) {
      return i18n.get('validations.regex', {
        attribute: attribute
      });
    }
  },

  /**
   * Make date or throw error
   * @private
   * @param  {String} attribute
   * @param  {String} date
   * @throws {e}
   * @return {String}
   */
  _makeDate: function(attribute, date) {
    var d = new Date(date);
    if (isNaN(d.getTime())) {
      throw i18n.get('validations.date', {
        attribute: date
      });
    }
    return d;
  }

};