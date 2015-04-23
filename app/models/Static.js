var mongoose = require('mongoose'),
timestamps = require('mongoose-timestamp'),
Point = require(global.APP_DIR + '/models/Point'),
Q = require('q'),
Google = require(global.APP_DIR + '/libs/Google');

var StaticSchema = new mongoose.Schema({

	width: Number,
	height: Number,
	zoom: Number,
	scale: Number,
	maptype: String,
	language: String,
	region: String,
	markers: String,
	path: String,
	visible: String,
	style: String,
	url: String,
	path: String,

	point: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Point'
	}

});

StaticSchema.virtual('size').get(function() {
	var offset = 60;
	return this.width + 'x' + (this.height + offset * 2);
});

StaticSchema.virtual('realSize').get(function() {
	var offset = 60;
	return this.width + 'x' + this.height + '+0+0';
});

StaticSchema.methods = (function() {

	return {

		_getParameters: function() {
			var params = {};

			var keys = [
				'width',
				'height',
				'zoom',
				'scale',
				'maptype',
				'language',
				'region',
				'markers',
				'path',
				'visible',
				'style',
				'url',
				'path',
				'point'
			];

			var static = this;

			keys.forEach(function(key) {
				if (static[key]) {
					params[key] = static[key];
				}
			});

			return params;
		},

		getStatic: function() {
			var getStaticDeferred = Q.defer();

			var model = this;

			mongoose.model('Static', StaticSchema)
			.findOne(this._getParameters())
			.populate('point').exec(function(err, static) {
				if (static) {
					getStaticDeferred.resolve(static);
				} else {
					getStaticDeferred.reject(model);
				}
			});

			return getStaticDeferred.promise;
		},

		staticmap: function() {
			var staticmapDefer = Q.defer();

			var static = this;

			Point.getPoint(this.point)
			.then(function(point) {
				return Google.staticmap({
					center: point.location.join(','),
					size: static.size,
					realSize: static.realSize,
					width: static.width,
					height: static.height,
					zoom: static.zoom,
					scale: static.scale,
					maptype: static.maptype,
					language: static.language,
					region: static.region,
					markers: static.markers,
					path: static.path,
					visible: static.visible,
					style: static.style,
					_id: static._id
				});
			})
			.then(function(result) {
				static.url = result.url;
				static.path = result.path;
				staticmapDefer.resolve(static);
			})
			.catch(function(err) {
				staticmapDefer.reject(err);
			});

			return staticmapDefer.promise;
		}
	};

})();

StaticSchema.statics = (function() {

	return {
		getDefaultParams: function(params) {
			return Object.merge({
				width: {
					type: 'number',
					default: 500
				},
				height: {
					type: 'number',
					default: 500
				},
				zoom: {
					type: 'number',
					default: 10
				},
				scale: {
					type: 'number',
					default: 1
				},
				maptype: {
					type: 'string',
					validations: 'regex:/roadmap|satellite|terrain|hybrid/',
					default: 'roadmap'
				},
				language: {
					type: 'string',
					default: 'en'
				},
				region: {
					type: 'string'
				},
				markers: {
					type: 'string'
				},
				path: {
					type: 'string'
				},
				visible: {
					type: 'string'
				},
				style: {
					type: 'string'
				}
			}, params);
		}
	};

})();

StaticSchema.pre('save', function(next) {
	this.staticmap()
	.then(function(static) {
		next();
	})
	.catch(function() {
		console.log(arguments);
	});
});

module.exports = exports = mongoose.model('Static', StaticSchema);