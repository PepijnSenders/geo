var Point = require(global.APP_DIR + '/models/Point'),
    Q = require('q');

module.exports = exports = function (req, res, next) {
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

            if (typeof resolve.value === 'object' && resolve.value) {
              req.points[intersection[index]] = resolve.value;
            } else {
              var point = new Point();

              point.center = req.query[intersection[index]];

              pointSavePromises.push(Q.nbind(point.save, point)());

              req.points[intersection[index]] = point;
            }
          }
          return Q.allSettled(pointSavePromises);
        })
        .then(function(resolves) {
          next();
        })
        .catch(function(err) {
          res.status(500, {
            message: err
          });
        });
    }
  }
};