var commander = require('commander');
var fs = require('fs');
var readline = require('readline');

var program = commander
    .usage('<file>')
    .option('-c, --capacity <capacity>', 'number of liters to fill in containers', 150)
    .parse(process.argv);

if (program.args.length == 0) {
    program.help();
}

const compareAsc = function(a, b) { return a - b; };
const compareDesc = function(a, b) { return b - a; };

var containers = [];

function readLine(line) {
    containers.push(parseInt(line));
}

function countCombinations() {
    var count = 0;

    function recursive(i, volume) {
        var partial = volume + containers[i];

        if (partial === program.capacity) {
            count += 1;
        }

        if ((i + 1) >= containers.length) {
            return;
        }

        recursive(i + 1, partial);
        recursive(i + 1, volume);
    }

    recursive(0, 0);

    return count;
}

function countWays() {
    var count = 0;
    var min = containers.length;
    function recursive(i, m, volume) {
        var partial = volume + containers[i];
        var mp = m + 1;

        if (partial === program.capacity) {
            if (mp < min) {
                min = mp;
                count = 1;
            } else if (mp == min) {
                count += 1;
            }
        }

        if ((i + 1) >= containers.length) {
            return;
        }

        recursive(i + 1, mp, partial);
        recursive(i + 1, m, volume);
    }
    
    recursive(0, 0, 0);

    return count;
}

readline.createInterface({
    input: fs.createReadStream(program.args[0], {encoding: 'utf-8'}),
    terminal: false
})
.on('line', readLine)
.on('close', function() {
    console.log('combinations: ' + countCombinations());
    console.log('ways: ' + countWays());
});
