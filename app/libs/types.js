module.exports = exports = {

	string: function(value) {
		if (value) {
			return String(value + '');
		} else {
			return String('');
		}
	},

	number: function(value) {
		if (typeof value === 'string') {
			return parseInt(value, 10);
		} else if (typeof value === 'number') {
			return value;
		} else {
			return 0;
		}
	},

	float: function(value) {
		if (typeof value === 'number' || typeof value === 'string') {
			return parseFloat(value);
		} else {
			return 0;
		}
	},

	boolean: function(value) {
		console.log(value);
		if (typeof value === 'string') {
			return value === 'true' || value === '1';
		} else if (typeof value === 'number') {
			return value === 1;
		} else if (typeof value === 'boolean') {
			return value;
		} else {
			return false;
		}
	},

	object: function(value) {
		if (typeof value === 'string') {
			try {
				return JSON.parse(value);
			} catch (e) {
				console.error('Error parsing ' + value + ' to type object.', e);
				return {};
			}
		} else if (typeof value === 'object') {
			return value;
		} else {
			return {};
		}
	},

	array: function(value) {
		if (typeof value === 'string') {
			return value.split('|');
		} else if (typeof value === 'object') {
			return value;
		} else {
			return [];
		}
	}

};