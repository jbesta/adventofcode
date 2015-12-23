var commander = require('commander');
var fs = require('fs');
var readline = require('readline');

var program = commander
    .usage('<file>')
    .option('-r, --retroencabulator', 'determines if MFCSAM has outdated retroencabulator', false)
    .parse(process.argv);

if (program.args.length == 0) {
    program.help();
}

var tape = {
    children: 3,
    cats: 7,
    samoyeds: 2,
    pomeranians: 3,
    akitas: 0,
    vizslas: 0,
    goldfish: 5,
    trees: 3,
    cars: 2,
    perfumes: 1
};

var aunts = {};

function readLine(line) {
    var match = line.match(/^Sue (\d+): (.*)$/);
    var number = parseInt(match[1]);
    var things = match[2].split(',').reduce(function(things, val) {
        var kv = val.split(':');
        things[kv[0].trim()] = parseInt(kv[1]);
        return things;
    }, {});
    aunts[number] = things;
}

function compareCounts(name, a, b) {
    if (program.retroencabulator) {
        if (name === 'cats' || name === 'trees') {
            return a > b;
        }
        if (name == 'pomeranians' || name == 'goldfish') {
            return a < b;
        }
        return a === b;
    } else {
        return a === b;
    }
}

function matchTape(things, tape) {
    return Object.keys(things).reduce(function(acc, name) {
        return acc && compareCounts(name, things[name], tape[name]);
    }, true);
}

function findAunt(aunts, tape) {
    return Object.keys(aunts).reduce(function(matches, number) {
        if (matchTape(aunts[number], tape)) {
            matches.push(number);
        }
        return matches;
    }, []);
}

readline.createInterface({
    input: fs.createReadStream(program.args[0], {encoding: 'utf-8'}),
    terminal: false
})
.on('line', readLine)
.on('close', function() {
    console.log(findAunt(aunts, tape));
});
