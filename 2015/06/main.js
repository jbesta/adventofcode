var program = require('commander')
	.option('-b, --brightness')
	.parse(process.argv);

var reader = require('readline').createInterface({
	input: require('fs').createReadStream(program.args[0]),
	terminal: false
});

function Lights(size) {
	this.size = size;
	this.lights = []
	for (var i = 0; i < size; i++) {
		var arr = new Array(size);
		for (var j = 0; j < size; j++) {
			arr[j] = false;
		}
		this.lights[i] = arr;
	}
}

Lights.prototype.toggle = function(x, y) {
	this.lights[x][y] = !this.lights[x][y];
};

Lights.prototype.turnOn = function(x, y) {
	this.lights[x][y] = true;
}

Lights.prototype.turnOff = function(x, y) {
	this.lights[x][y] = false;
}

Lights.prototype.report = function() {
	var _this = this;
	var total = this.size * this.size;
	var others = this.lights.map(function(r) {
		return r.reduce(function(acc, on) {
			if (!on) { acc += 1; }
			return acc;
		}, 0);
	}).reduce(function(acc, n) {
		return acc + n;
	}, 0);
	var turnedOn = total - others;
	console.log('Turned on: ' + turnedOn);
};

function Lights2(size) {
	this.size = size;
	this.lights = []
	for (var i = 0; i < size; i++) {
		var arr = new Array(size);
		for (var j = 0; j < size; j++) {
			arr[j] = 0;
		}
		this.lights[i] = arr;
	}
}

Lights2.prototype.toggle = function(x, y) {
	this.lights[x][y] += 2;
};

Lights2.prototype.turnOn = function(x, y) {
	this.lights[x][y] += 1;
}

Lights2.prototype.turnOff = function(x, y) {
	if (this.lights[x][y] > 0) {
		this.lights[x][y] -= 1;
	}
}

Lights2.prototype.report = function(turnedOn) {
	var brightness = this.lights.map(function(r) {
		return r.reduce(sum, 0);
	}).reduce(sum, 0);
	console.log('Brightness: ' + brightness);
};

function sum(a, b) {
	return a + b;
}

function capitalize(str) {
	return str && (str.charAt(0).toUpperCase() + str.substring(1));
}

function parsePoint(point) {
	return point.split(',').map(function(p) { return parseInt(p, 10); });
}

function readLine(line) {
	console.log(line);
	var parts = line.split(' ');
	var operation = parts[0];
	var from;
	var to;
	if (parts[0] == 'toggle') {
		from = parsePoint(parts[1]);
		to = parsePoint(parts[3]);
	}
	if (parts[0] == 'turn') {
		operation = 'turn' + capitalize(parts[1]);
		from = parsePoint(parts[2]);
		to = parsePoint(parts[4]);
	}

	var fromX = Math.min(from[0], to[0]);
	var toX = Math.max(from[0], to[0]);
	var fromY = Math.min(from[1], to[1]);
	var toY = Math.max(from[1], to[1]);

	for(var x = fromX; x <= toX; x++) {
		for (var y = fromY; y <= toY; y++) {
			lights[operation](x, y);
		}
	}
}

const SIZE = 1000;
var lights;
if (program.brightness) {
	lights = new Lights2(SIZE);
} else {
	lights = new Lights(SIZE);
}

reader.on('line', function(line) {
	readLine(line);
});

reader.on('close', function() {
	lights.report();	
});
