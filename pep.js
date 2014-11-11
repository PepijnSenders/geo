var sugar = require('sugar'),
    constants = require(__dirname + '/app/libs/constants')(),
    Database = require(global.APP_DIR + '/classes/Database')
    config = require(global.APP_DIR + '/config');

var database = new Database(true);
database.connect(config.get('database.name'));

var arguments = process.argv;

var operations = [
  'seed'
];

var operation = process.argv[2];
console.log(operation);

if (!~operations.indexOf(operation)) {
  console.log('Operations:\n');
  operations.forEach(function(operation) {
    console.log(operation + '\n');
  });

  return;
}

var operationHandlers = (function() {

  return {

    'seed': function() {
      var Seeder = require(global.APP_DIR + '/database/Seeder');

      Seeder.start();
    }

  };

})();

console.log(operationHandlers, operation);

operationHandlers[operation]();