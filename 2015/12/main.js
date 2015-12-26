var fs = require('fs')

function hasRedPropertyValue(obj) {
	return Object.keys(obj).reduce(function(acc, key) {
		return acc | (obj[key] === 'red');
	}, false);
}

function processRecursive(obj, sum) {
	if (typeof obj == 'string') {
		return sum;
	} else if (typeof obj == 'number') {
		return sum + obj;
	} else if (Array.isArray(obj)) {
		return sum + obj.reduce(function(acc, val) {
			return acc + processRecursive(val, 0);
		}, 0);
	} else if (typeof obj == 'object') {
		if (!hasRedPropertyValue(obj)) {
			sum += Object.keys(obj).reduce(function(acc, key) {
				return acc + processRecursive(obj[key], 0);
			}, 0);
		}
		return sum;
	} else {
		throw new Error('Unknown type: ' + typeof obj);
	}
}

function processData(data) {
	var json = JSON.parse(data);
	return processRecursive(json, 0);
}

fs.readFile(process.argv[2], 'utf-8', function(err, data) {
	if (err) throw err;
	console.log('counts: ' + processData(data))
})
