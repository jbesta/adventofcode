function whatFloor(input) {
    return input.split('').reduce(function(acc, character) {
        if (character == '(') { acc += 1; }
        else if (character == ')') { acc -= 1; }
        return acc;
    }, 0);
}

function findPosition(input) {
	function findPositionRecursive(input, index, floor) {
		var character = input.charAt(index);
		if (character == '(') { floor += 1; }
		else if (character == ')') { floor -= 1; }
		if (floor == -1) { return index + 1; }
		if (index + 1 >= input.length) { return -1; }
		return findPositionRecursive(input, index + 1, floor);
	}

	return findPositionRecursive(input, 0, 0);
}
