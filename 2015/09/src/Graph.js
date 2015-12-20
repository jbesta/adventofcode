function Graph() {
	this._adjMap = {};
}

Graph.prototype.edge = function(from, to, cost) {
	if (!this._adjMap[from]) { this._adjMap[from] = {}; }
	if (!this._adjMap[to]) { this._adjMap[to] = {}; }
	this._adjMap[from][to] = cost;
	this._adjMap[to][from] = cost;
}

function bruteForceRouteDistance(from, route, distance, adjMap, initialDistance, comparator) {
	var toVisit = Object.keys(adjMap[from]).filter(function(city) {
		return route.indexOf(city) == -1;
	});

	if (toVisit.length === 0) {
		return distance;
	}

	return toVisit.reduce(function(acc, to) {
		return comparator(acc, bruteForceRouteDistance(to, route.concat([from]),
			distance + adjMap[from][to], adjMap, initialDistance, comparator));
	}, initialDistance);
}

function bruteForceRoute(adjMap, initialDistance, comparator) {
	return Object.keys(adjMap).reduce(function(acc, city) {
		return comparator(acc, bruteForceRouteDistance(city, [], 0, adjMap, initialDistance, comparator));
	}, initialDistance);
}

//
// brute force algorithm
// applicable to small number of nodes
// complexity: O(N!)
//
Graph.prototype.shortestRoute = function() {
	return bruteForceRoute(this._adjMap, Number.MAX_VALUE, function(a, b) {
		return a < b ? a : b;
	});
}

//
// brute force algorithm
// applicable to small number of nodes
// complexity: O(N!)
//
Graph.prototype.longestRoute = function() {
	return bruteForceRoute(this._adjMap, 0, function(a, b) {
		return a > b ? a : b;
	});
}

module.exports = Graph;
