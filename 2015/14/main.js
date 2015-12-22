var commander = require('commander');
var fs = require('fs');
var readline = require('readline');

var program = commander
    .usage('<file>')
    .option('-t, --time <time>', 'duration of olympics in seconds', 2503)
    .parse(process.argv);

if (program.args.length == 0) {
    program.help();
}

var reindeers = {};

function readLine(line) {
    var match = line.match(/(\w+) can fly (\d+) km\/s for (\d+) seconds, but then must rest for (\d+) seconds/);
    reindeers[match[1]] = {
        speed: parseInt(match[2]),
        fly: parseInt(match[3]),
        rest: parseInt(match[4])
    };
}

function printScoreboard(scoreboard) {
    Object.keys(scoreboard)
    .map(function(name) {
        return [name, scoreboard[name].distance, scoreboard[name].score];
    })
    .sort(function(a, b) {
        return a[2] - b[2];
    })
    .forEach(function(sb) {
        console.log(sb[0] + ': ' + sb[1] + ' km / ' + sb[2] + ' points');
    });
}

function runOlympics(timeLimit) {
    var scoreboard =  Object.keys(reindeers).reduce(function(acc, name) {
        acc[name] = {
            flying: true,
            distance: 0,
            score: 0,
            time: reindeers[name].fly
        };
        return acc;
    }, {});

    for (var t=0; t < timeLimit; t++) {
        Object.keys(scoreboard).forEach(function(name) {
            var s = scoreboard[name];
            var spec = reindeers[name];
            if (s.time > 0 && s.flying) {
                s.distance += spec.speed;
            }
            s.time -= 1;
            if (s.time === 0) {
                s.flying = !s.flying;
                s.time = s.flying ? spec.fly : spec.rest
            }
        });
        var leaders = Object.keys(scoreboard).reduce(function(acc, name) {
            var distance = scoreboard[name].distance;
            var maxDistance = acc.length ? acc[0][1] : null;
            if (maxDistance === null || maxDistance === distance) {
                acc.push([name, distance]);
            } else if (maxDistance !== null && maxDistance < distance) {
                acc = [[name, distance]];
            }
            return acc;
        }, []);
        leaders.forEach(function(val) {
            scoreboard[val[0]].score += 1;
        });
    }
    return scoreboard;
}

readline.createInterface({
    input: fs.createReadStream(program.args[0], {encoding: 'utf-8'}),
    terminal: false
})
.on('line', readLine)
.on('close', function() {
    var scoreboard = runOlympics(program.time);
    console.log('Reindeer Olympics');
    console.log('time: ' + program.time + 's');
    console.log('-----------------');
    printScoreboard(scoreboard);
});
