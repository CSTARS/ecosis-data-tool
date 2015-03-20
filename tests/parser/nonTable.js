var importer = require('../../app/scripts/import/index.js');

var file = process.argv[2];

var t = new Date().getTime();

importer.run(file, onImportComplete);

function onImportComplete(err, spectra) {
    if( err ) console.log(err);
    
    console.log('parsed');
    logTime();

    console.log(spectra[0]);
}

function logTime() {
    console.log((new Date().getTime() - t)+'ms');
}