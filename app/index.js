if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    sugar = require('sugar'),
    constants = require(__dirname + '/libs/constants')(),
    Number = require(global.APP_DIR + '/libs/Number'),
    routes = require(global.APP_DIR + '/routes'),
    expects = require(global.APP_DIR + '/middlewares/expects'),
    cors = require(global.APP_DIR + '/middlewares/cors'),
    jade = require(global.APP_DIR + '/middlewares/jade'),
    cachedRequest = require(global.APP_DIR + '/middlewares/cachedRequest'),
    resolvePoint = require(global.APP_DIR + '/middlewares/resolvePoint'),
    Database = require(global.APP_DIR + '/classes/Database'),
    config = require(global.APP_DIR + '/config');

app.use(logger('dev'));
app.use(bodyParser.json());

app.use(cors);
app.use(cachedRequest);
app.use(resolvePoint);
app.use(expects);
app.use(jade);

var database = new Database();
database.connect(config.get('database.name'));

app.set('view engine', 'jade');
app.set('public', global.PUBLIC_DIR);
app.set('showStackError', true);
app.set('views', global.APP_DIR + '/views');

app.use(express.static(global.PUBLIC_DIR));

app.listen(config.get('app.port'));
console.log('\nListening on port ' + config.get('app.port') + '\nIn environment ' + global.ENV + '\n');

routes(app);

module.exports = exports = app;