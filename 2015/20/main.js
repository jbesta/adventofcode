function divisors(number) {
    var result = [1, number];
    var i = 2;
    while (i <= Math.sqrt(number)) {
        if (number % i == 0) {
            result.push(i);
            if (i != (number / i)) {
                result.push(number / i);
            }
        }
        i++;
    }
    return result.sort((a, b) => a - b);
}

function findHouseNumber(presents) {
    console.log('Step 1');
    console.log('Finding house number...');
    var n = presents / 10;
    for (var i = Math.floor(Math.sqrt(n)); i < n; i++) {
        var sum = divisors(i).reduce((a, b) => a + b, 0);
        if (sum >= n) {
            console.log('house number: ' + i);
            console.log('presents: ' + sum);
            break;
        }
    }
}

function findHouseNumber2(presents) {
    console.log('Step 2');
    console.log('Finding house number...');
    var n = presents / 11;
    for (var i = Math.floor(Math.sqrt(n)); i < n; i++) {
        var sum = divisors(i).filter((d) => (i / d) <= 50).reduce((a, b) => a + b, 0);
        if (sum >= n) {
            console.log('house number: ' + i);
            console.log('presents: ' + sum);
            break;
        }
    }
}

findHouseNumber(34000000);
findHouseNumber2(34000000);
