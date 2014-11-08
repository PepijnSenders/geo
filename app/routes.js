var PagesController = require(global.APP_DIR + '/controllers/PagesController'),
    StaticsController = require(global.APP_DIR + '/controllers/StaticsController');

/**
 * @class  Routes
 * @type   {Function}
 * @param  {Express.app} app
 */
module.exports = exports = function(app) {
  app.get('/', PagesController.hello);

  app.get('/statics', StaticsController.index);
  app.get('/statics/path', StaticsController.path);
  app.get('/statics/grid', StaticsController.grid);
  app.get('/statics/zoom', StaticsController.zoom);
};