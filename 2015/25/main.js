var fs = require('fs');
var program = require('commander');

program
    .arguments('<file>')
    .parse(process.argv);


if (program.args.length === 0) {
    console.log('No file given');
    process.exit(1);
}

var input = fs.readFileSync(program.args[0], 'utf-8');
var match = input.match(/Enter the code at row (\d+), column (\d+)/);
if (!match) {
    console.log('Invalid input: ' + input);
    process.exit(1);
}
var row = parseInt(match[1]);
var col = parseInt(match[2]);

function modPow(base, exp, mod) {
    if (exp == 0) {
        return 1;
    }
    if (exp % 2 == 0) {
        return Math.pow(modPow(base, (exp / 2), mod), 2) % mod;
    } 
    return (base * modPow(base, (exp - 1), mod)) % mod;
}

function findCode(row, col, first, factor, mod) {
    var exponent = (col + row - 2) * (col + row - 1) / 2 + col - 1;
    return (first * modPow(factor, exponent, mod)) % mod;
}

console.log('Machine code: ' + findCode(row, col, 20151125, 252533, 33554393));
