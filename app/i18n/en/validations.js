/**
 * @class validations
 * @type {Object}
 */
module.exports = exports = {

  after: 'The {{=it.attribute}} must be a date after {{=it.date}}.',
  alpha: 'The {{=it.attribute}} may only contain letters.',
  alphaDash: 'The {{=it.attribute}} may only contain letters, numbers, and dashes.',
  alphaNum: 'The {{=it.attribute}} may only contain letters and numbers.',
  before: 'The {{=it.attribute}} must be a date before {{=it.date}}.',
  date: 'The {{=it.attribute}} is not a valid date.',
  email: 'The {{=it.attribute}} must be a valid email address.',
  max: 'The {{=it.attribute}} may not be greater than {{=it.max}}.',
  min: 'The {{=it.attribute}} must be at least {{=it.min}}.',
  numeric: 'The {{=it.attribute}} must be a number.',
  regex: 'The {{=it.attribute}} format is invalid.',
  required: 'The {{=it.attribute}} field is required.',
  url: 'The {{=it.attribute}} format is invalid.',

  nonExistingValidation: 'The {{=it.validation}} validation doesn\'t exist.'

};