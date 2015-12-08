var program = require('commander');
var fs = require('fs');
var crypto = require('crypto');

program
	.usage('<key>')
	.option('-n, --number <n>', 'Number of leading zeroes required in hash', parseInt)
	.parse(process.argv);

if (program.args.length == 0) {
	console.error('No key provided');
	process.exit(1);
}

var leadingZeroes = program.number || 5;
var secretKey = program.args[0];
var startStr = Array(leadingZeroes + 1).join('0')

for (var i = 1, found = false; !found; i++) {
	var str = '' + secretKey + i;
	var hash = crypto.createHash('md5').update(str).digest("hex");
	if (hash.indexOf(startStr) === 0) {
		console.log('Answer: ' + i + ', hash: ' + hash);
		found = true;
	}
	if (i % 10000 === 0) {
		console.info('trying: ' + i);
	}
}
