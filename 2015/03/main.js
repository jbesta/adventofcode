var program = require('commander');
var fs = require('fs');

program
	.usage('<file>')
	.option('-r, --robot', 'adds Robo-Santa')
	.parse(process.argv);

var visitedHouses = {};

function Santa(x, y) {
	this.position = [x, y];
}

Santa.prototype.positionToString = function() {
	return this.position[0] + ',' + this.position[1];
};

Santa.prototype.move = function (x, y) {
	this.position[0] += x;
	this.position[1] += y;
	visitedHouses[this.positionToString()] = 1;
	return this;
};

Santa.prototype.numVisitedHouses = function() {
	return ;
};

var santa = new Santa(0, 0);
var roboSanta = new Santa(0, 0);
var moveNumber = 0;

var readStream = fs.createReadStream(program.args[0])
readStream.setEncoding('UTF-8');
readStream
	.on('data', function(chunk) {
		chunk.split('').forEach(function(dir) {
			var actor = (program.robot && moveNumber % 2 == 1) ? roboSanta : santa;
			if (dir == '^') { actor.move(0, 1); }
			if (dir == '>') { actor.move(1, 0); }
			if (dir == 'v') { actor.move(0, -1); }
			if (dir == '<') { actor.move(-1, 0); }
			moveNumber += 1;
		});
	})
	.on('end', function() {
		console.log('Visited houses: ' + Object.keys(visitedHouses).length);
	});
