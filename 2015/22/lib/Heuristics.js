var _ = require('lodash');

function cheapest(player, spells) {
    return _.sortBy(spells, function(s) {
        s.cost;
    }).shift();
}

function random(player, spells) {
    return _.shuffle(spells).shift();
}

function findSpell(name, spells) {
    return _.filter(spells, function(s) { return s.name == name; }).shift();
}

function defender(player, spells) {
    var spell;
    if (spell = findSpell('Recharge', spells)) {
        return spell;
    }
    if (spell = findSpell('Poison', spells)) {
        return spell;
    }
    if (spell = findSpell('Shield', spells)) {
        return spell;
    }

    return random(player, spells);
}

function healer(player, spells) {
    if (spell = findSpell('Recharge', spells)) {
        return spell;
    }
    if (spell = findSpell('Poison', spells)) {
        return spell;
    }
    if (spell = findSpell('Drain', spells)) {
        return spell;
    }

    return random(player, spells);
}

exports.cheapest = cheapest;
exports.random = random;
exports.defender = defender;
exports.healer = healer;
