var readline = require('readline');
var program = require('commander');

program
	.option('-t, --type [type]', '"paper" or "ribbon"', 'paper')
	.parse(process.argv);

var lineReader = readline.createInterface({
	input: require('fs').createReadStream(program.args[0]),
	terminal: false
});

function Paper() { this.total = 0; }

Paper.prototype.plus = function(dimensions) {
	var x = dimensions[0];
	var y = dimensions[1];
	var z = dimensions[2];
	var a = x * y;
	var b = y * z;
	var c = x * z;

	this.total += 2 * a + 2 * b + 2 * c + Math.min(a, b, c);
};

Paper.prototype.printResult = function() {
	console.log('required paper: ' + this.total);
}

function Ribbon() { this.total = 0; }

Ribbon.prototype.plus = function(dimensions) {
	var x = dimensions[0];
	var y = dimensions[1];
	var z = dimensions[2];
	var a = x * y;
	var b = y * z;
	var c = x * z;

	this.total += Math.min(2 * (x + y), 2 * (x + z), 2 * (y + z)) + x * y * z;
};

Ribbon.prototype.printResult = function() {
	console.log('required ribbon: ' + this.total);
};

var algorithm;

if (program.type == 'paper') {
	algorithm = new Paper();
} else {
	algorithm = new Ribbon();
}

lineReader.on('line', function(line) {
	algorithm.plus(parseLine(line));
});

lineReader.on('close', function() {
	algorithm.printResult();
})

function parseLine(line) {
	return line.split('x').map(function(n) {
		return parseInt(n);
	});
}
