var fs = require('fs');
var readline = require('readline');
var program = require('commander');

program
    .arguments('<file>')
    .option('-s, --spoons <spoons>', 'how many spoons is available', 100)
    .option('-c, --calories <calories>', 'how many calories should cookie have', parseInt, void(0))
    .parse(process.argv);

if (program.args.length === 0) {
    console.log('No file given');
    process.exit(1);
}

function Parser() {
    this.result = [];
    this.parseLine = this.parseLine.bind(this);
    this.getResult = this.getResult.bind(this);
}

Parser.prototype.parseLine = function(line) {
    var parts = line.split(':');
    var properties = parts[1].split(',')
        .reduce(function(obj, str) {
            var match = str.match(/(\w+) (-?\d+)/);
            obj[match[1]] = parseInt(match[2]);
            return obj;
        }, {});
    this.result.push({
        name: parts[0],
        properties: properties
    });
}

Parser.prototype.getResult = function() {
    return this.result;
};

function permutations(list) {
    if (list.length == 0) { return [[]]; }
    var result = [];
    for (var i = 0; i < list.length; i++) {
        var copy = Object.create(list);
        var head = copy.splice(i, 1);
        var rest = permutations(copy);
        for (var j = 0; j < rest.length; j++) {
            var next = head.concat(rest[j]);
            result.push(next);
        }
    }
    return result;
}

function unique(arr) {
    var hash = {}, result = [];
    for ( var i = 0, l = arr.length; i < l; ++i ) {
        if ( !hash.hasOwnProperty(arr[i]) ) {
            hash[ arr[i] ] = true;
            result.push(arr[i]);
        }
    }
    return result;
}

function partitions(n, k) {
    function recursive(n, k, pre) {
        if (n < 0) { return []; }
        if (k == 1) { return n <= pre ? [[n]] : []; }
        var ret = [];
        for (var i = Math.min(pre, n); i >= 0; i--) {
            var partial = recursive(n - i, k - 1, i);
            ret = ret.concat(partial
                .map(function(a) {
                    return [i].concat(a);
                }));
        }
        return ret;
    }

    return recursive(n, k, n);
}

function allPartitions(n, k) {
    var result = [];
    partitions(n, k).forEach(function(p) {
        permutations(p).forEach(function(c) {
            result.push(c);
        });
    });
    return unique(result);
}

function sum(a, b) { return a + b; }
function product(a, b) { return a * b; }

function scoreForConfiguration(configuration, properties) {
    return ['capacity', 'durability', 'flavor', 'texture'].map(function(prop) {
        var propScore = propertySumForConfiguration(prop, configuration, properties);
        return Math.max(propScore, 0);
    }).reduce(product, 1);
}

function caloriesForConfiguration(configuration, properties) {
    return propertySumForConfiguration('calories', configuration, properties);
}

function propertySumForConfiguration(prop, configuration, properties) {
    return configuration.map(function(count, index) {
        return count * properties[index][prop];
    }).reduce(sum, 0);
}

function findRecipe(ingredients, spoons, calories) {
    var ingredientsCount = ingredients.length;
    var properties = ingredients.map(function(def) {
        return def.properties;
    });
    return allPartitions(spoons, 4).reduce(function(best, configuration) {
        if (!calories || calories == caloriesForConfiguration(configuration, properties)) {
            var score = scoreForConfiguration(configuration, properties);
            if (score > best.score) {
                best.score = score;
                best.configuration = configuration;
            }
        }
        return best;
    }, {score: 0, configuration: null});
}

var parser = new Parser();
readline.createInterface({
    input: require('fs').createReadStream(program.args[0]),
    terminal: false
})
.on('line', parser.parseLine)
.on('close', function() {
    console.log('Teaspoons: ' + program.spoons);
    console.log('Calories: ' + (program.calories ? program.calories : false));
    console.log('Finding recipe ...');
    var recipe = findRecipe(parser.getResult(), program.spoons, program.calories);
    console.log(recipe);
});
