var fs = require('fs');
var readline = require('readline');
var program = require('commander');

program
    .arguments('<file>')
    .parse(process.argv);

if (program.args.length === 0) {
    console.log('No file given');
    process.exit(1);
}

var units = {};

function parseLine(line) {
    var match = line.match(/(\w+) would (lose|gain) (\d+) happiness units by sitting next to (\w+)/);
    if (!units.hasOwnProperty(match[1])) {
        units[match[1]] = {};
    }
    var value = (match[2] == 'lose' ? -1 : 1) * parseInt(match[3]);
    units[match[1]][match[4]] = value;
}

function mod(n, k) {
    return ((n % k) + k) % k;
}

function happiness(seating, units) {
    return seating.reduce(function(score, name, index) {
        var left = seating[mod(index - 1, seating.length)]
        var right = seating[mod(index + 1, seating.length)];
        return score + units[name][left] + units[name][right];
    }, 0);
}

function findSeating(units) {
    var best = {
        score: 0,
        seating: null
    };

    function recursive(seating, remaining) {
        if (remaining.length == 0) {
            var score = happiness(seating, units);
            if (score > best.score) {
                best.score = score;
                best.seating = seating;
            }
        } else {
            remaining.forEach(function(p) { 
                var s = seating.concat([p]);
                var r = remaining.filter((n) => n != p);
                recursive(s, r);
            });
        }
    }

    recursive([], Object.keys(units));

    return best;
}

function includeMyself(units) {
    var names = Object.keys(units);
    var newUnits = names.reduce(function(newUnits, n1) {
        var scores = Object.keys(units[n1]).reduce(function(obj, n2) {
            obj[n2] = units[n1][n2];
            return obj;
        }, {});
        scores['me'] = 0;
        newUnits[n1] = scores;
        return newUnits;
    }, {});
    newUnits['me'] = names.reduce(function(obj, name) {
        obj[name] = 0;
        return obj;
    }, {});
    return newUnits;
}

readline.createInterface({
    input: require('fs').createReadStream(program.args[0]),
    terminal: false
})
.on('line', parseLine)
.on('close', function() {
    console.log('Part 1');
    console.log('Finding best seating...');
    var seating = findSeating(units);
    console.log('Seating: ' + seating.seating.join(', '));
    console.log('Happiness: ' + seating.score);
    console.log('Part 2');
    console.log('Finding best seating...');
    var seating = findSeating(includeMyself(units));
    console.log('Seating: ' + seating.seating.join(', '));
    console.log('Happiness: ' + seating.score);
});
