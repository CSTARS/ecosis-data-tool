var xlsx = require('./xlsx.js');
var xls = require('./xls.js');
var csv = require('./csv.js');
var spectra = require('./spectra.js');


exports.run = function(file, callback) {
    if( file.match(/.*\.xlsx/) ) {
        xlsx.run(file, callback);
    } else if( file.match(/.*\.xls/) ) {
        xls.run(file, callback);
    } else if( file.match(/.*\.csv/) ) {
        csv.run(file, ',', function(err, resp){
            callback(err, [resp]);
        });
    } else if( file.match(/.*\.tsv/) || file.match(/.*\.spectra/) ) {
        csv.run(file, '\t', function(err, resp){
            callback(err, [resp]);
        });
    } else {
        alert('not supported')
    }
}