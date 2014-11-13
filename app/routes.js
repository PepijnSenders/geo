var PagesController = require(global.APP_DIR + '/controllers/PagesController'),
    StaticsController = require(global.APP_DIR + '/controllers/StaticsController'),
    cachedRequest = require(global.APP_DIR + '/middlewares/cachedRequest'),
    resolvePoint = require(global.APP_DIR + '/middlewares/resolvePoint');

/**
 * @class  Routes
 * @type   {Function}
 * @param  {Express.app} app
 */
module.exports = exports = function(app) {
  app.get('/', PagesController.hello);

  app.get('/statics', resolvePoint, StaticsController.index);
  app.get('/statics/path', resolvePoint, StaticsController.path);
  app.get('/statics/grid', resolvePoint, StaticsController.grid);
  app.get('/statics/zoom', resolvePoint, StaticsController.zoom);
  // app.get('/statics/')

};