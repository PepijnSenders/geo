var Point = require(global.APP_DIR + '/models/Point'),
    Q = require('q');

module.exports = exports = function (req, res, next) {
  var center = req.param('center');

  if (typeof req.query === 'object') {
    var intersection = Object.getOwnPropertyNames(req.query).intersect(['center', 'start-point', 'end-point']);

    if (intersection.length > 0) {
      req.points = {};

      var pointPromises = intersection.map(function(prop) {
        return Q.nbind(Point.findOne, Point)({
          center: req.query[prop]
        });
      });

      Q.allSettled(pointPromises)
        .then(function(resolves) {
          var pointSavePromises = [];
          for (var index in resolves) {
            var resolve = resolves[index];

            if (typeof resolve.value === 'object') {
              req.points[intersection[index]] = resolve.value;
            } else {
              var point = new Point();

              point.center = center;

              pointSavePromises.push(Q.nbind(point.save, point)());

              req.points[intersection[index]] = point;
            }
          }
          return Q.allSettled(pointSavePromises);
        })
        .then(function(resolves) {
          console.log(resolves, req.points);
          next();
        })
        .catch(function() {
          console.log(arguments);
        });
    }
  }
};