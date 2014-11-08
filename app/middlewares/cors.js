/**
 * @class  CORS middleware
 * @type   {Function}
 * @param  {Express.req} req
 * @param  {Express.res} res
 * @param  {Function}    next
 * @return {void}
 */
module.exports = exports = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Access-Token, X-Forwarded-For');

  if (req.method === 'OPTIONS') {
    res.status(200).send({});
  } else {
    next();
  }
};