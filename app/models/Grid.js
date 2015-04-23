var mongoose = require('mongoose'),
timestamps = require('mongoose-timestamp');

var GridSchema = mongoose.Schema({

	grid: [Array],
	x: Number,
	y: Number

});

GridSchema.methods = (function() {

	return {

		// angles: {
		// 	north: 90,
		// 	west: 180,
		// 	south: 270,
		// 	east: 0
		// },

		getStartPoints: function(directions) {
			return {
				x: directions.west ? this.x - 1 : 0,
				y: directions.north ? this.y - 1 : 0
			};
		},

		initialize: function() {
			this.grid = [];
			for (var y = 0; y < this.y; y++) {
				this.grid[y] = [];
				for (var x = 0; x < this.x; x++) {
					this.grid[y][x] = {};
				}
			}
		},

		points: function(startPoint, path) {
			var grid = this.grid;

			for (var y = 0; y < this.y; y++) {
				for (var x = 0; x < this.x; x++) {
					var angle = 270 + (Math.PI / 2 - Math.atan2(y, x)).toDegrees()
					var static = new Static({
						point: startPoint.adjacent(angle, path.width * x, path.height * y, path.zoom),
						width: path.width,
						height: path.height,
						zoom: path.zoom
					});

					// static.getStatic()
					// 	.then(function(static) {
					// 		grid[y][x] = static;
					// 	})
					// 	.catch(function() {
					// 		static.save(function(err) {
					// 			grid[y][x] = static;
					// 		});
					// 	});
				}
			}
		},

		getStartPoint: function(options, path) {
			var start = this.getStartPoints(options.directions);

			if (start.x !== 0 || start.y !== 0) {
				var startPoint;
				if (start.x === 0) {
					startPoint = path.origin.adjacent(90, path.width * start.y, 0, path.zoom);
				} else if (start.y === 0) {
					startPoint = path.origin.adjacent(180, path.width * start.x, 0, path.zoom);
				} else {
					startPoint = path.destination;
				}
			} else {
				startPoint = path.origin;
			}

			return startPoint;
		},

		fill: function(options) {
			this.initialize();

			var path = options.path;
			var startPoint = this.getStartPoint(options, path);

			this.points(startPoint, path);
		}
	};

})();

module.exports = exports = mongoose.model('Grid', GridSchema);