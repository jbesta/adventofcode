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

var machine = {
    sp: 0,
    instructions: [],
    registers: {
        a: 0,
        b: 0
    },
    hlf: function(register) {
        this._store(register, this.registers[register] / 2);
        this.sp += 1;
    },
    tpl: function(register) {
        this._store(register, this.registers[register] * 3);
        this.sp += 1;
    },
    inc: function(register) {
        this._store(register, this.registers[register] + 1);
        this.sp += 1;
    },
    jmp: function(offset) {
        this.sp += offset;
    },
    jie: function(register, offset) {
        if (this.registers[register] % 2 == 0) {
            this.sp += offset;
        } else {
            this.sp += 1;
        }
    },
    jio: function(register, offset) {
        if (this.registers[register] == 1) {
            this.sp += offset;
        } else {
            this.sp += 1;
        }
    },
    _store: function(register, value) {
        this.registers[register] = Math.max(Math.floor(value), 0);
    },
    run: function(options) {
        _.extend(this, _.defaultsDeep(_.pick(options || {}, 'sp', 'registers'), {
            sp: 0,
            registers: {
                a: 0,
                b: 0
            }
        }));

        while (this.sp >= 0 && this.sp < this.instructions.length) {
            var instruction = this.instructions[this.sp];
            instruction.call(this, this);
        }
    }
};

function parseLine(line) {
    var r;
    var match;
    if (match = line.match(/hlf (\w)/)) {
        machine.instructions.push(() => machine.hlf(match[1]));
    } else if (match = line.match(/tpl (\w)/)) {
        machine.instructions.push(() => machine.tpl(match[1]));
    } else if (match = line.match(/inc (\w)/)) {
        machine.instructions.push(() => machine.inc(match[1]));
    } else if (match = line.match(/jmp ([+-]?\d+)/)) {
        var offset = parseInt(match[1]);
        machine.instructions.push(() => machine.jmp(offset));
    } else if (match = line.match(/jie (\w), ([+-]?\d+)/)) {
        var offset = parseInt(match[2]);
        machine.instructions.push(() => machine.jie(match[1], offset));
    } else if (match = line.match(/jio (\w), ([+-]?\d+)/)) {
        var offset = parseInt(match[2]);
        machine.instructions.push(() => machine.jio(match[1], offset));
    } else {
        throw new Error('Unknown instruction: ' + line);
    }
}

readline.createInterface({
    input: require('fs').createReadStream(program.args[0]),
    terminal: false
})
.on('line', parseLine)
.on('close', function() {
    console.log('Part 1');
    machine.run();
    console.log('b: ' + machine.registers.b);
    console.log('Part 2');
    machine.run({registers: {a: 1 }});
    console.log('b: ' + machine.registers.b);
});
