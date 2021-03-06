var mongoose = require('mongoose'),
timestamps = require('mongoose-timestamp'),
Q = require('q'),
Point = require(global.APP_DIR + '/models/Point'),
Grid = require(global.APP_DIR + '/models/Grid');

var PathSchema = mongoose.Schema({

	origin: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Point'
	},
	destination: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Point'
	},
	width: Number,
	height: Number,
	adjacent: Number,
	zoom: Number

});

PathSchema.methods = (function() {

	return {

		getPath: function() {
			var getPathDeferred = Q.defer();

			mongoose.model('Path', PathSchema)
			.findOne(this)
			.populate('origin', 'destination')
			.exec(function(err, path) {
				if (path) {
					getPathDeferred.resolve(path);
				} else {
					getPathDeferred.reject();
				}
			});

			return getPathDeferred.promise;
		},

		getTiles: function(directions) {
			var getTilesDeferred = Q.defer();

			var path = this;

			Q.allSettled([
				Point.getPoint(this.origin),
				Point.getPoint(this.destination)
			]).then(function(resolves) {
				var origin = resolves[0].value,
				destination = resolves[1].value;

				if (path.adjacent > 0) {
					var newOrigin = origin;
					for (var tile = 0; tile < path.adjacent; tile++) {
						var α;
						if (directions.west && directions.north) {
							α = 225;
						} else if (directions.west && directions.south) {
							α = 45;
						} else if (directions.east && directions.north) {
							α = 315;
						} else {
							α = 135;
						}
						newOrigin = newOrigin.adjacent(α, path.width, path.height, path.zoom);
					}

					getTilesDeferred.resolve({
						path: path,
						directions: directions,
						tiles: newOrigin.tilesInZoom(destination, path.width, path.height, path.zoom),
					});
				} else {
					getTilesDeferred.resolve({
						path: path,
						directions: directions,
						tiles: origin.tilesInZoom(destination, path.width, path.height, path.zoom)
					});
				}
			});

			return getTilesDeferred.promise;
		},

		buildPath: function() {
			var buildPathDeferred = Q.defer();

			var path = this;

			Q.allSettled([
				Point.getPoint(this.origin),
				Point.getPoint(this.destination)
			]).then(function(resolves) {
				var origin = resolves[0].value,
				destination = resolves[1].value;

				var directions = origin.directionsTo(destination),
				distance = origin.distanceTo(destination);

				path.zoom = origin.arbitraryZoom(destination, path.width, path.height, 2000, 2000);

				return path.getTiles(directions);
			}).then(function(options) {
				var grid = new Grid(options.tiles);

				grid.fill(options);
			}).catch(function() {
				console.log(arguments);
			});

			return buildPathDeferred.promise;
		}

	};

})();

module.exports = exports = mongoose.model('Path', PathSchema);