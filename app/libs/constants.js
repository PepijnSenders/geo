/**
 * Define constants
 * @type {Function}
 * @return {Object} global
 */
var constants = function () {
  global.APP_DIR = __dirname + '/../../app';
  global.PUBLIC_DIR = __dirname + '/../../public';

  global.ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
  global.PORT = process.env.PORT ? process.env.PORT : 4000;

  return global;
};

module.exports = exports = constants;