var fs = require('fs');
var readline = require('readline');
var program = require('commander');
var Parser = require('./src/Parser');

program
	.arguments('<file>')
	.option('-e, --encoded', 'compute for encoded version of strings')
	.parse(process.argv);

if (program.args.length === 0) {
	console.log('No file given');
	process.exit(1);
}

var parser = new Parser();
var codeLength = 0;
var memoryLength = 0;

readline.createInterface({
	input: require('fs').createReadStream(program.args[0]),
	terminal: false
})
.on('line', function(line) {
	if (program.encoded) {
		line = 	parser.encodeString(line);
	}
	var response = parser.countString(line);
	codeLength += response.codeLength;
	memoryLength += response.memoryLength;
})
.on('close', function() {
	console.log('encoded mode: ' + (!!program.encoded));
	console.log('code length: ' + codeLength);
	console.log('memory length: ' + memoryLength);
	console.log('difference: ' + (codeLength - memoryLength));
});
