var Static = require(global.APP_DIR + '/models/Static'),
		Path = require(global.APP_DIR + '/models/Path'),
		request = require('request');

module.exports = exports = {

	index: function(req, res) {
		try {
			var params = req.expects(Static.getDefaultParams({
				json: {
					type: 'boolean',
					default: true
				}
			}));
		} catch (errors) {
			return res.status(400).send({
				message: errors
			});
		}

		var sendResponse = function(status, static) {
			if (params.json) {
				res.status(status).send(static);
			} else {
				res.status(status);
				res.writeHead(200, {
					'Content-Type': 'image/png'
				});
				request.get(static.url).pipe(res);
			}
		};

		var static = new Static(params);
		static.point = req.points['center'];
		static.getStatic()
		.then(function(static) {
			sendResponse(200, static);
		})
		.catch(function() {
			static.save(function(err) {
				sendResponse(201, static);
			});
		});
	},

	path: function(req, res) {
		try {
			var params = req.expects(Static.getDefaultParams({
				debug: {
					type: 'boolean',
					default: false
				},
				adjacent: {
					type: 'boolean',
					default: 0
				}
			}));
		} catch (errors) {
			return res.status(400).send({
				message: errors
			});
		}

		var path = new Path(params);
		path.origin = req.points['origin'];
		path.destination = req.points['destination'];
		path.getPath()
		.then(function() {

		})
		.catch(function() {
			path.buildPath()
			.then(function() {

			})
			.catch(function() {
				console.log(arguments);
			});
		});
	},

	grid: function(req, res) {

	},

	zoom: function(req, res) {

	}

};