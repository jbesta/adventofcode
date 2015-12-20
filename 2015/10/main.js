var program = require('commander');

program
	.arguments('input')
	.description('Elves Look, Elves Say')
	.usage('[options] <input>')
 	.option('-c, --cycles <n>', 'number of cycles', parseInt)
 	.parse(process.argv);

if (program.args.length === 0) {
	program.help();
}

var cycles = program.cycles || 1;

function lookAndSay(input) {
	return input.split('')
		.reduce(function(acc, character) {
			if (acc.length === 0 || acc[acc.length - 1].charAt(0) !== character) { 
				acc.push(character);
			} else {
				acc[acc.length - 1] += character;
			}
			return acc;
		}, [])
		.reduce(function(acc, str) {
			return acc + str.length + str.charAt(0);
		}, '');
}

var input = program.args[0];
var output = input;
for (var i=0; i < cycles; i++) {
	output = lookAndSay(output);
}

console.log(output.length);
