if (typeof Number.prototype.toRadians == 'undefined') {
  Number.prototype.toRadians = function() {
    return this * Math.PI / 180;
  };
}

if (typeof Number.prototype.toDegrees == 'undefined') {
  Number.prototype.toDegrees = function() {
    return this * 180 / Math.PI;
  };
}

if (typeof Number.prototype.toPrecisionFixed == 'undefined') {
  Number.prototype.toPrecisionFixed = function(precision) {

    var n = this.toPrecision(precision);

    n = n.replace(/(.+)e\+(.+)/, function(n, sig, exp) {
      sig = sig.replace(/\./, '');
      l = sig.length - 1;
      while (exp-- > l) sig = sig + '0';
      return sig;
    });


    n = n.replace(/(.+)e-(.+)/, function(n, sig, exp) {
      sig = sig.replace(/\./, '');
      while (exp-- > 1) sig = '0' + sig;
      return '0.' + sig;
    });

    return Number(n);
  };
}

var significance = {
  'km': 1,
  'hm': 0.1,
  'dam': 0.01,
  'm': 0.001,
  'dm': 0.0001,
  'cm': 0.00001,
  'mm': 0.000001
};

if (typeof Number.prototype.transform == 'undefined') {
  Number.prototype.transform = function(format) {

    if (!(format in significance)) {
      throw 'No such format defined';
    }

    return significance[format] * this;
  };
}

module.exports = exports = Number;