var fs = require('fs');
var readline = require('readline');
var program = require('commander');
var _ = require('lodash');

program
    .arguments('<file>')
    .parse(process.argv);

if (program.args.length === 0) {
    console.log('No file given');
    process.exit(1);
}

function Parser() {
    this.parseLine = this.parseLine.bind(this);
    this.getResult = this.getResult.bind(this);
    this.reset();
}

Parser.prototype.reset = function() {
    this.result = {
        input: null,
        replacements: []
    };
    this._state = 0;
}

Parser.prototype.parseLine = function(line) {
    if (line.match(/^\s*$/)) {
        this._state = 1;
        return;
    }

    if (this._state == 0) {
        var match = line.match(/(\w+) => (\w+)/);
        this.result.replacements.push([match[1], match[2]]);
    } else {
        this.result.input = line;
    }
}

Parser.prototype.getResult = function() {
    return this.result;
};

function findCombinations(input, replacements) {
    var set = new Set();
    replacements.forEach(function(repl) {
        var match = repl[0];
        var replace = repl[1];
        var index;
        var start = 0;
        while ((index = input.indexOf(match, start)) > -1) {
            start = index + 1;
            set.add(input.substring(0, index) + replace + input.substring(index + match.length));
        }
    });
    return set.size;
}

function findMedicine(medicine, replacements, electron) {
    var orderedReplacements = _.chain(replacements)
        .sortBy(function(repl) { return repl[1].length; })
        .reverse()
        .value();

    var molecule = medicine;
    var steps = 0;
    while (true) {
        orderedReplacements.forEach(function(repl) {
            var match = repl[1];
            var replace = repl[0];
            var index;
            var start = 0;
            while ((index = molecule.indexOf(match, start)) > -1) {
                start = index + 1;
                molecule = molecule.substring(0, index) + replace + molecule.substring(index + match.length);
                steps += 1;
            }
        });
        console.log(steps + ' ' + molecule);
        if (molecule == electron) {
            break;
        }
    }

    return steps;
}

var parser = new Parser();
readline.createInterface({
    input: require('fs').createReadStream(program.args[0]),
    terminal: false
})
.on('line', parser.parseLine)
.on('close', function() {
    var input = parser.getResult();
    console.log('Finding combinations...');
    console.log('Combinations: ' + findCombinations(input.input, input.replacements))
    console.log('Steps to make medicine: ' + findMedicine(input.input, input.replacements, 'e'));
});
