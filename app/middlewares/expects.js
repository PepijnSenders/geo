var validations = require(global.APP_DIR + '/libs/validations'),
    types = require(global.APP_DIR + '/libs/types'),
    i18n = require(global.APP_DIR + '/i18n');

/**
 * @class  Expects
 * @type   {Function}
 * @param  {Express.req}   req
 * @param  {Express.res}   res
 * @param  {Function}      next
 * @return {void}
 */
module.exports = exports = function(req, res, next) {

  req.expects = function(params) {
    var _params = {}, _errors = [];

    for (var attribute in params) {
      var args = params[attribute];
      if ('default' in args && !req.param(attribute)) {
        _params[attribute] = args.default;
      } else {
        _params[attribute] = req.param(attribute);
      }
      if ('type' in args && args.type in types) {
        _params[attribute] = types[args.type](_params[attribute]);
      }
      if ('validations' in args) {
        var _validations = args.validations.split('|');
        if (!!~_validations.indexOf('required') || !validations.required(_params[attribute])) {
          _validations.forEach(function(validation) {
            var validationValue;
            if (validation.match(':')) {
              var validationKeys = validation.split(':');
              validation = validationKeys[0];
              validationValue = validationKeys[1];
            }
            if (validation in validations) {
              var message = validations[validation](attribute, _params[attribute], validationValue);
              if (message) {
                _errors.push(message);
              }
            } else {
              _errors.push(i18n.get('validations.nonExistingValidation', {
                validation: validation
              }));
            }
          });
        }
      }
    }

    if (_errors.length) {
      throw _errors;
    } else {
      return _params;
    }
  };

  next();

};