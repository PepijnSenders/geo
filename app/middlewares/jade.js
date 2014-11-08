var helpers = require(global.APP_DIR + '/libs/helpers');

/**
 * @class  Jade middleware
 * @type   {Function}
 * @param  {Express.req} req
 * @param  {Express.res} res
 * @param  {Function}    next
 * @return {void}
 */
module.exports = exports = function (req, res, next) {
  Object.merge(req.app.locals, helpers(req));

  next();
};