var fs = require('fs');
var readline = require('readline');
var program = require('commander');

program
	.arguments('<file>')
	.option('-s, --steps <steps>', 'how many mapping steps will be invoked', 100)
	.option('-c, --corners', 'enables stuck corners')
	.parse(process.argv);

if (program.args.length === 0) {
	console.log('No file given');
	process.exit(1);
}

var lights = [];

function readLine(line) {
	lights.push(line.split('').map(function(val) {
		return val === '#';
	}));
}

function countFor(x, y, lights) {
	return (y >= 0 && x >= 0 & y < lights.length && x < lights[y].length && lights[y][x]) && 1 || 0;
}

function mapLight(x, y, lights) {
	var count = 0;
	count += countFor(x - 1, y - 1, lights);
	count += countFor(x, y - 1, lights);
	count += countFor(x + 1, y - 1, lights);
	count += countFor(x - 1, y, lights);
	count += countFor(x + 1, y, lights);
	count += countFor(x - 1, y + 1, lights);
	count += countFor(x, y + 1, lights);
	count += countFor(x + 1, y + 1, lights);
	return lights[y][x] ? (count == 2 || count == 3) : count == 3;
}

function turnOnCorners(lights) {
	lights[0][0] = true;
	lights[0][lights.length - 1] = true;
	lights[lights.length - 1][0] = true;
	lights[lights.length - 1][lights.length - 1] = true;
}

function nextState(lights) {
	var next = [];
	for (var y = 0; y < lights.length; y++) {
		var nextRow = [];
		for (var x = 0; x < lights[y].length; x++) {
			nextRow.push(mapLight(x, y, lights));
		}
		next.push(nextRow);
	}
	return next;
}

function printGrid(grid) {
	for (var y = 0; y < grid.length; y++) {
		var line = [];
		for (var x = 0; x < grid[y].length; x++) {
			line.push(grid[y][x] && '#' || '.');
		};
		console.log(line.join(''));
	}
	console.log();
}

function repeatTimes(repeat, lights) {
	var state = lights;
	if (program.corners) { turnOnCorners(state); }
	for (var i = 0; i < repeat; i++) {
		state = nextState(state);
		if (program.corners) { turnOnCorners(state); }
	}
	return state;
}

function countLights(lights) {
	return lights.reduce(function(a1, row) {
		return a1 + row.reduce(function(a2, isOn) {
			if (isOn) { a2 += 1; }
			return a2;
		}, 0);
	}, 0);
}

readline.createInterface({
	input: require('fs').createReadStream(program.args[0]),
	terminal: false
})
.on('line', readLine)
.on('close', function() {
	console.log('Steps: ' + program.steps);
	console.log('Lights at beginning: ' + countLights(lights));
	console.log('Lights after: ' + countLights(repeatTimes(program.steps, lights)));
});
