function Parser() {
    this._result = {};
    this.parseLine = this.parseLine.bind(this);
}

Parser.prototype.parseLine = function(line) {
    var match = line.match(/(Hit Points|Damage): (\d+)/);
    if (!match) {
        throw new Error('Invalid input: ' + line);
    }
    var value = parseInt(match[2]);
    if (match[1] == 'Hit Points') {
        this._result.hp = value;
    } else if(match[1] == 'Damage') {
        this._result.damage = value;
    }
}

Parser.prototype.getResult = function() {
    return this._result;
}

module.exports = Parser;
