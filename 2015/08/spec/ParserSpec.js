var Parser = require('../src/Parser');

describe('Parser', function() {
	describe('countString', function() {
		function runTest(str, expectedCodeLength, expectedMemoryLength) {
			var parser = new Parser();
			var response = parser.countString(str);
			expect(response.codeLength).toBe(expectedCodeLength);
			expect(response.memoryLength).toBe(expectedMemoryLength);
		}

		it('passes basic test', function() {
			runTest('"qxfcsmh"', 9, 7);
			runTest('"ffsfyxbyuhqkpwatkjgudo"', 24, 22);
		});

		it('accepts empty strings', function() {
			runTest('""', 2, 0);
		});

		it('accepts escape sequences', function() {
			runTest('"byc\\x9dyxuafof\\\\\\xa6uf\\\\axfozomj\\\\olh\\x6a"', 43, 29);
		});
	});

	describe('encodeString', function() {
		var parser = new Parser();

		function runTest(string, expected) {
			expect(parser.encodeString(string)).toBe(expected);
		}

		it('encodes empty string', function() {
			runTest('""', '"\\"\\""');
		});

		it('encodes basic string', function() {
			runTest('"abc"', '"\\"abc\\""');
			runTest('"aaa\\"aaa"', '"\\"aaa\\\\\\"aaa\\""');
		});

		it('encodes string with escape sequence', function() {
			runTest('"\\x27"', '"\\"\\\\x27\\""');
		});
	});
});
