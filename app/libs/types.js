/**
 * @class types
 * @type {Object}
 */
module.exports = exports = {

  /**
   * Cast value to string
   * @param  {Mixed} value
   * @return {String}
   */
  string: function(value) {
    if (value) {
      return String(value + '');
    } else {
      return String('');
    }
  },

  /**
   * Cast value to number
   * @param  {Mixed} value
   * @return {Number}
   */
  number: function(value) {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    } else if (typeof value === 'number') {
      return value;
    } else {
      return 0;
    }
  },

  /**
   * Cast value to float
   * @param  {Mixed} value
   * @return {Number}
   */
  float: function(value) {
    if (typeof value === 'number' || typeof value === 'string') {
      return parseFloat(value);
    } else {
      return 0;
    }
  },

  /**
   * Cast value to boolean
   * @param  {Mixed} value
   * @return {Boolean}
   */
  boolean: function(value) {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    } else if (typeof value === 'number') {
      return value === 1;
    } else if (typeof value === 'boolean') {
      return value;
    } else {
      return false;
    }
  },

  /**
   * Cast value to object
   * @param  {Mixed} value
   * @return {Object}
   */
  object: function(value) {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('Error parsing ' + value + ' to type object.', e);
        return {};
      }
    } else if (typeof value === 'object') {
      return value;
    } else {
      return {};
    }
  },

  /**
   * Cast value to array
   * @param  {Mixed} value
   * @return {Object}
   */
  array: function(value) {
    if (typeof value === 'string') {
      return value.split('|');
    } else if (typeof value === 'object') {
      return value;
    } else {
      return [];
    }
  }

};