const STATE_A = 0;
const STATE_B = 1;
const STATE_C = 2;
const STATE_D = 3;
const STATE_E = 4;
var RE_HEX = /[\dabcdef]/;

function Parser() {}

Parser.prototype._parseError = function(character) {
	var err = new Error('Unexpected character ' + character);
	err.name = 'ParseError';
	throw err;
}

Parser.prototype.countString = function(str) {
	var codeLength = 0;
	var memoryLength = 0;
	var state = STATE_A;
	var parser = this;

	function readCharacter(character) {
		codeLength += 1;	

		switch (state) {
			case STATE_A:
				if (character == '"') {
					state = STATE_B;
				} else {
					parser._parseError(character);
				}
				break;
			case STATE_B:
				if (character == '\\') {
					state = STATE_C;
				} else if (character == '"') {
					state = STATE_A;	
				} else {
					memoryLength += 1;	
				}
				break;
			case STATE_C:
				if (character == '\\' || character == '\"') {
					memoryLength += 1;
					state = STATE_B;
				} else if (character == 'x') {
					state = STATE_D;
				} else {
					parser._parseError(character);
				}
				break;
			case STATE_D:
				if (RE_HEX.test(character)) {
					state = STATE_E;
				} else {
					parser._parseError(character);
				}
				break;
			case STATE_E:
				if (RE_HEX.test(character)) {
					memoryLength += 1;
					state = STATE_B;
				} else {
					parser._parseError(character);
				}
				break;
		}
	}

	for (var pos = 0; pos < str.length; pos++) {
		readCharacter(str.charAt(pos));
	}

	return {
		codeLength: codeLength,
		memoryLength: memoryLength
	};
}

Parser.prototype.encodeString = function(str) {
	function encode(str) {
		return str
			.replace(/\\/g, '\\\\')
			.replace(/"/g, '\\"');
	}

	return '"' + encode(str) + '"';
}

module.exports = Parser;
