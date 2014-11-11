var mongoose = require('mongoose'),
    config = require(global.APP_DIR + '/config');

/**
 * @class Database
 */
var Database = function(silent) {
  this.connection = mongoose.connection;
  this.silent = silent;
};

Object.merge(Database.prototype, {

  /**
   * Connect to the database with given config
   * @param  {String} config
   * @return {Mongoose.driver} driver
   */
  connect: function (config) {
    this.driver = mongoose.connect(config, {
      poolSize: 5
    });

    this.connection.on('error', this.onConnectionError.bind(this));
    this.connection.on('open', this.onConnectionSuccess.bind(this));

    return this.driver;
  },

  /**
   * Return mongoose driver
   * @return {Mongoose.driver} driver
   */
  getDriver: function () {
    return this.driver;
  },

  /**
   * Do on connection error
   * @return {void}
   */
  onConnectionError: function () {
    if (!this.silent) {
      console.error('Database error: ', arguments);
    }
  },

  /**
   * Do on connection success
   * @return {void}
   */
  onConnectionSuccess: function () {
    if (!this.silent) {
      console.log('Database success: ', arguments);
    }
  }

});

module.exports = exports = Database;