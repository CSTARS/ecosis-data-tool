var parse = require('csv-parse');
var fs = require('fs');

exports.run = function(file, delimiter, callback) {
    var input = fs.readFileSync(file);
    parse(input, {comment: '#', delimiter: delimiter}, callback);
}
