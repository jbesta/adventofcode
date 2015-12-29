var fs = require('fs');
var readline = require('readline');
var program = require('commander');
var _ = require('lodash');
var Combinatorics = require('js-combinatorics');

program
    .arguments('<file>')
    .parse(process.argv);

if (program.args.length === 0) {
    console.log('No file given');
    process.exit(1);
}

function Parser() {
    _.bindAll(this, 'parseLine');
    this._result = [];
}

Parser.prototype.parseLine = function(line) {
    var number = parseInt(line);
    if (isNaN(number)) {
        throw new Error('Invalid input: ' + line);
    }
    this._result.push(number);
};

Parser.prototype.getResult = function() {
    return this._result;
};

const Functions = {
    sum: function(a, b) {
        return a + b;
    },
    multiply: function(a, b) {
        return a * b;
    }
};

function findSmallestQuantumEntanglement(list, nGroups) {
    var listSum = list.reduce(Functions.sum, 0);
    var requiredSum = listSum / nGroups;
    for (var nItems = 1; nItems < list.length; nItems++) {
        var combinationIterator = Combinatorics.combination(list, nItems);
        var combination;
        var candidates = [];
        while (combination = combinationIterator.next()) {
            if (combination.reduce(Functions.sum, 0) === requiredSum) {
                candidates.push(combination.reduce(Functions.multiply, 1));
            }
        }
        if (candidates.length > 0) {
            return _.min(candidates);
        }
    }
}

var parser = new Parser();
readline.createInterface({
    input: require('fs').createReadStream(program.args[0]),
    terminal: false
})
.on('line', parser.parseLine)
.on('close', function() {
    console.log('Part 1: ' + findSmallestQuantumEntanglement(parser.getResult(), 3));
    console.log('Part 2: ' + findSmallestQuantumEntanglement(parser.getResult(), 4));
});
