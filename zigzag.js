
/**
 * Convert a string to its zigzag pattern reading.
 * @param {string} s - input string
 * @param {number} numRows - number of rows for the zigzag
 * @return {string} - converted string
 */
function convert(s, numRows) {

    if (numRows === 1 || numRows >= s.length) {
        return s;
    }

    var rows = new Array(numRows);
    for (var i = 0; i < numRows; i++) {
        rows[i] = '';
    }
    var currRow = 0;
    var goingDown = false;

    for (var i = 0; i < s.length; i++) {
        rows[currRow] += s[i];

        if (currRow === 0 || currRow === numRows - 1) {
            goingDown = !goingDown;
        }
        currRow += goingDown ? 1 : -1;
    }

    return rows.join('');
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        convert: convert
    };
}


