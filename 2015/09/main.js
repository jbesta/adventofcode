var fs = require('fs');
var readline = require('readline');
var program = require('commander');
var Graph = require('./src/Graph');

program
	.arguments('<file>')
	.option('-l, --longest', 'computes longest distance')
	.parse(process.argv);

if (program.args.length === 0) {
	console.log('No file given');
	process.exit(1);
}

var graph = new Graph();

function readLine(line) {
	var parts = line.split(' = ');
	var distance = parseInt(parts[1]);
	var cities = parts[0].split(' to ');
	graph.edge(cities[0], cities[1], distance);
}

readline.createInterface({
	input: require('fs').createReadStream(program.args[0]),
	terminal: false
})
.on('line', readLine)
.on('close', function() {
	var algorithm = program.longest ? 'longestRoute' : 'shortestRoute';
	console.log('distance: ' + graph[algorithm]());
});
