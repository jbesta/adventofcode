var fs = require('fs');
var readline = require('readline');
var program = require('commander');
var _ = require('lodash');
var inherit = require('inherit');
var Parser = require('./lib/Parser');
var Heuristics = require('./lib/Heuristics');

program
    .arguments('<file>')
    .usage('[options] <file>')
    // .option('-e, --expensive', 'find the most expensive items and still loose', false)
    .option('-t, --time [limit]', 'specify time [limit] for simulation in seconds', (val) => parseInt(val), 60)
    .option('-i, --iterations <iterations>', 'specify number of iterations, discards -t', (val) => parseInt(val))
    .option('-h, --heuristic [heuristic]', 'specify [heuristic] for selecting spells [random, cheapest, defender, healer]', 'random')
    .option('-s, --sudden-death', 'if enabled at the start of each turn player loses 1 hp')
    .option('-v, --verbose', 'increase output of program', (v, total) => total + 1, 0)
    .parse(process.argv);

if (program.args.length === 0) {
    console.log('No file given');
    process.exit(1);
}

const SPELLS = JSON.parse(fs.readFileSync('spells.json', 'utf-8'));

const Functions = {
    millisToSeconds: function(millis) {
        return Math.floor(0.001 * millis);
    }
};

const ERROR_DEAD_PLAYER = 'DeadPlayerError';
const ERROR_DEAD_BOSS = 'DeadBossError';
const ERROR_NO_SPELL_AVAILABLE = 'NoSpellAvailableError';
const ERROR_NOT_ENOUGH_MANA = 'NotEnoughManaError';

function throwError(name, properties) {
    var error = new Error();
    error.name = name || 'Error';
    _.extend(error, properties || {});
    throw error;
}

function Actor(params) {
    this.effects = [];
    _.extend(this, params);
}

Actor.prototype.hit = function(damage) {
    var injury = Math.max(damage - this.armor, 1);
    this.hp -= injury;
    return injury;
};

Actor.prototype.applyEffects = function(oponent) {
    var player = this;
    this.effects.forEach(function(e) {
        var effectInfo = '';
        switch (e.type) {
            case 'mana':
                player.mana += e.amount;
                if (program.verbose > 1) {
                    effectInfo = e.name + ' provides ' + e.amount + ' mana';
                }
                break;
            case 'damage':
                oponent.hp -= e.amount;
                if (program.verbose > 1) {
                    effectInfo += (!effectInfo ? e.name + ' provides ': ', ') + e.amount + ' damage';
                }
                break;
            case 'armor':
                if (e.duration == e.timer) {
                    player.armor += e.amount;
                    if (program.verbose > 1) {
                        effectInfo += (!effectInfo ? e.name + ' increases ': ', ') + e.amount + ' armor';
                    }
                }
                break;
            default:
                throwError('InvalidEffectType');
        }
        e.timer -= 1;
        if (e.type == 'armor' && e.timer <= 0) {
            player.armor -= e.amount;
            if (program.verbose > 1) {
                effectInfo += (!effectInfo ? e.name + ' decreases ': ', -') + e.amount + ' armor';
            }
        }
        if (program.verbose > 1) {
            effectInfo += '; its timer is now ' + e.timer + '.';
            console.log(effectInfo);
        }
    });
    this.effects = this.effects.filter(function(e) {
        if (program.verbose > 1 && e.timer <= 0) {
            console.log(e.name + ' wears off');
        }
        return e.timer > 0;
    });
}

var Player = inherit(Actor, {
    _selectSpell: function() {
        const runningEffectTypes = this.effects.map((e) => e.type);
        const availableSpells = _.chain(SPELLS)
            .filter(function(s) {
                return _.isUndefined(s.effect) || !_.contains(runningEffectTypes, s.effect.type);
            })
            .value();
        if (availableSpells.length == 0) {
            if (program.verbose > 1) {
                console.log('Player has no available spell and loses');
            }
            throwError(ERROR_NO_SPELL_AVAILABLE, {winning: false});
        }

        return this.heuristic(this, availableSpells);
    },

    _castSpell: function(spell, oponent) {
        //console.log(this.mana + ': ' + JSON.stringify(spell));
        if (this.mana < spell.cost) {
            if (program.verbose > 1) {
                console.log('Player has not enough mana and loses');    
            }
            throwError(ERROR_NOT_ENOUGH_MANA, {winning: false});
        }
        this.mana -= spell.cost;
        this.cost += spell.cost;
        if (program.verbose > 1) {
            var actionInfo = this.name + ' casts ' + spell.name;
        }
        if (spell.damage) {
            var injury = oponent.hit(spell.damage);
            if (program.verbose > 1) {
                actionInfo += ', dealing ' + injury + ' damage';
            }
        }
        if (spell.hp) {
            this.hp += spell.hp;
            if (program.verbose > 1) {
                actionInfo += ', and healing ' + spell.hp + ' hp';
            }
        }
        if (spell.effect) {
            this.effects.push(_.extend(
                _.clone(spell.effect),
                {name: spell.name, timer: spell.effect.duration}
            ));
        }
        if (program.verbose > 1) {
            console.log(actionInfo);
        }
    },

    makeTurn: function(oponent) {
        this._castSpell(this._selectSpell(), oponent);
    }
});

var Boss = inherit(Actor, {
    makeTurn: function(oponent) {
        var injury = oponent.hit(this.damage);
        if (program.verbose > 1) {
            console.log(this.name + ' attacks for ' + injury + ' damage');
        }
    }
});

function Game(player, boss) {
    this.player = player;
    this.boss = boss;
}

Game.prototype.run = function() {
    var attacker = this.player;
    var defender = this.boss;
    while (true) {
        if (program.verbose > 1) {
            console.log('-- ' + attacker.name + ' turn --' );
            console.log('- ' + this.player.name + ' has ' + this.player.hp + ' hp, ' +
                this.player.armor + ' armor, ' + this.player.mana + ' mana');
            console.log('- ' + this.boss.name + ' has ' + this.boss.hp + ' hp');
        }
        if (program.suddenDeath) {
            var playerInjury = this.player.hit(1);
            if (program.verbose > 1) {
                console.log(this.player.name + ' loses ' + playerInjury + ' hp');
            }
            this._testGameOver();
        }
        this.player.applyEffects(this.boss);
        this._testGameOver();
        attacker.makeTurn(defender);
        this._testGameOver();
        defender = [attacker, attacker = defender][0]; // swap
        if (program.verbose > 1) {
            console.log();
        }
    }
}

Game.prototype._testGameOver = function() {
    if (this.player.hp <= 0) {
        if (program.verbose > 1) {
            console.log(this.player.name + ' is dead');
        }
        throwError(ERROR_DEAD_PLAYER, {winning: false});
    }
    if (this.boss.hp <= 0) {
        if (program.verbose > 1) {
            console.log(this.boss.name + ' is dead');
        }
        throwError(ERROR_DEAD_BOSS, {winning: true});
    }
}

function run(boss, heuristic, iterationLimit, timeLimitMillis) {
    var playerParams = {name: 'Player', hp: 50, mana: 500, armor: 0, cost: 0};
    if (!Heuristics[heuristic]) { heuristic = 'random'; }
    playerParams.heuristic = Heuristics[heuristic];
    var bossParams = _.extend(boss, {name: 'Boss', armor: 0});
    var startTimeMillis = new Date().getTime();
    var iteration = 0;
    var statistics = {
        cost: Number.MAX_VALUE,
        winning: 0,
        losing: 0,
        total: 0,
        reasons: {
            deadBoss: 0,
            deadPlayer: 0,
            outOfMana: 0,
            outOfSpells: 0,
            other: 0
        }
    };
    console.log('Finding least amount of mana...');
    if (iterationLimit) {
        console.log('Iteration limit: ' + iterationLimit);
    } else {
        console.log('Time limit: ' + Functions.millisToSeconds(timeLimitMillis) + 's');
    }
    console.log('Sudden death: ' + !!program.suddenDeath);
    console.log('Heuristic: ' + heuristic);
    while (true) {
        var player = new Player(_.clone(playerParams));
        var boss = new Boss(_.clone(bossParams));
        try {
            new Game(player, boss).run();
        } catch (e) {
            switch (e.name) {
                case ERROR_DEAD_PLAYER: statistics.reasons.deadPlayer += 1; break;
                case ERROR_DEAD_BOSS: statistics.reasons.deadBoss += 1; break;
                case ERROR_NO_SPELL_AVAILABLE: statistics.reasons.outOfSpells += 1; break;
                case ERROR_NOT_ENOUGH_MANA: statistics.reasons.outOfMana += 1; break;
                default:
                    statistics.reasons.other += 1;
                    throw e;
            }
            statistics.total += 1;
            if (e.winning) {
                statistics.winning += 1;
                if (player.cost < statistics.cost) {
                   statistics.cost = player.cost;
                }
            } else {
                statistics.losing += 1;
            }
            if (program.verbose && statistics.total % 1000 == 0) {
                var runInfo = 'Games: ' + statistics.total;
                if (iterationLimit) {
                    runInfo += ', remaining iterations: ' + (iterationLimit - iteration);
                } else {
                    runInfo += ', remaining time: ' + Functions.millisToSeconds(timeLimitMillis - (new Date().getTime() - startTimeMillis)) + 's';
                }
                runInfo += ', cost: ' + statistics.cost;
                console.log(runInfo);
            }
        }
        iteration += 1;
        if (iterationLimit && iteration >= iterationLimit) {
            break;
        } else if ((new Date().getTime() - startTimeMillis) > timeLimitMillis) {
            break;
        }
    }
    if (statistics.cost == Number.MAX_VALUE) {
        statistics.cost = -1;
    }
    statistics.successIndex = (100 * (statistics.winning / statistics.total)).toFixed(2) + '%';
    console.log('Result: ' + JSON.stringify(statistics, null, 4));
}

const parser = new Parser();

readline.createInterface({
    input: require('fs').createReadStream(program.args[0]),
    terminal: false
})
.on('line', parser.parseLine)
.on('close', function() {
    run(parser.getResult(), program.heuristic, program.iterations, program.time * 1000);
});
