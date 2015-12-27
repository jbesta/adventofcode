var fs = require('fs');
var readline = require('readline');
var program = require('commander');
var _ = require('lodash');
var Combinatorics = require('js-combinatorics');

program
    .arguments('<file>')
    .option('-e, --expensive', 'find the most expensive items and still loose', false)
    .parse(process.argv);

if (program.args.length === 0) {
    console.log('No file given');
    process.exit(1);
}

var oponent = {};

function parseLine(line) {
    var match = line.match(/(Hit Points|Damage|Armor): (\d+)/);
    if (!match) {
        throw new Error('Invalid input: ' + line);
    }
    var value = parseInt(match[2]);
    if (match[1] == 'Hit Points') {
        oponent.hp = value;
    } else if(match[1] == 'Damage') {
        oponent.damage = value;
    } else if (match[1] == 'Armor') {
        oponent.armor = value;
    }
}

const Functions = {
    mod: function(n, k) {
        return ((n % k) + k) % k;
    },
    sum: function(a, b) {
        return a + b;
    }
};

function range(start, end) {
    var arr = [];
    for (var i = start; i < end; i++) {
        arr.push(i);
    }
    return arr;
}

function run(oponent) {
    function fight(player, oponent) {
        player = _.extend({}, player);
        oponent = _.extend({}, oponent);
        var attacker = player;
        var defender = oponent;
        while (player.hp > 0 && oponent.hp > 0) {
            defender.hp -= Math.max(attacker.damage - defender.armor, 1);
            defender = [attacker, attacker = defender][0]; // swap
        }
        return oponent.hp <= 0;
    }

    function buyItems(weaponIndexes) {
        var armor = null;
        var r1, r2;
        var rings = [];
        var weapon = shopWeapons[weaponIndexes[0]];
        var items = [weapon];

        if (weaponIndexes[1] != -1) {
            armor = shopArmor[weaponIndexes[1]];
            items.push(armor);
        }
        if (weaponIndexes[2] != -1) {
            r1 = shopRings[weaponIndexes[2]];
            items.push(r1);
            rings.push(r1);
        }
        if (weaponIndexes[3] != -1) {
            r2 = shopRings[weaponIndexes[3]];
            items.push(r2);
            rings.push(r2);
        }

        return {
            player: {
                hp: 100,
                damage: items.map((i) => i.damage).reduce(Functions.sum, 0),
                armor: items.map((i) => i.armor).reduce(Functions.sum, 0)
            },
            cost: items.map((i) => i.cost).reduce(Functions.sum, 0),
            items: {
                weapon: weapon,
                armor: armor,
                rings: rings
            }
        };
    }

    var shop = JSON.parse(fs.readFileSync('shop.json', 'utf8'));
    var costComparator = function(item) { return item.cost; };
    var shopWeapons = _.sortBy(shop.weapons, costComparator);
    var shopArmor = _.sortBy(shop.armor, costComparator);
    var shopRings = _.sortBy(shop.rings, costComparator);
    
    var configurations = Combinatorics.cartesianProduct(
        range(0, shopWeapons.length),
        range(-1, shopArmor.length),
        range(-1, shopRings.length),
        range(-1, shopRings.length)
    );

    function findCheapestConfiguration() {
        var conf;
        while (conf = configurations.next()) {
            var receipt = buyItems(conf);
            if (fight(receipt.player, oponent)) {
                if (!best || best.cost > receipt.cost) {
                    best = receipt;
                }
            }
        }
    }

    function findMostExpensiveConfiguration() {
        var conf;
        while (conf = configurations.next()) {
            var receipt = buyItems(conf);
            if (!fight(receipt.player, oponent)) {
                if (!best || best.cost < receipt.cost) {
                    best = receipt;
                }
            }
        }
    }

    var best = null;
    if (program.expensive) {
        findMostExpensiveConfiguration();
    } else {
        findCheapestConfiguration();
    }

    console.log('cost: ' + best.cost);
    console.log('items: ' + JSON.stringify(best.items, null, 4));
}

readline.createInterface({
    input: require('fs').createReadStream(program.args[0]),
    terminal: false
})
.on('line', parseLine)
.on('close', function() {
    console.log((program.expensive ? 'Finding most expensive items to loose' : 'Finding cheapest items to win') + '...');
    run(oponent);
});
