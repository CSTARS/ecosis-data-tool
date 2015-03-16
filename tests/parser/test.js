var importer = require('../../app/scripts/import/index.js');
var tableParser = require('../../app/scripts/parser/tableParser.js');

var file = process.argv[2];
var orientation = 'row';

if( process.argv.length > 3 ) orientation = process.argv[3];

var t = new Date().getTime();

importer.run(file, onImportComplete);

function onImportComplete(err, tables) {
    if( err ) console.log(err);
    
    console.log('parsed');
    logTime();
    t = new Date().getTime();

    var data = tableParser.run(tables[0], orientation);


    console.log('converted ('+orientation+'): '+data.length);
    logTime();

    var schema = getSchema(data);
    console.log(schema.metadata);
    console.log(schema.data);
}

function getSchema(spectra) {
    var attributes = {};
    var data = {};
    var c = 0;

    for( var i = 0; i < spectra.length; i++ ) {

        for( var key in spectra[i] ) {
            if( key == '__info' ) continue;

            if( key == 'datapoints' ) {
                for( var j = 0; j < spectra[i].datapoints.length; j++ ) {
                    if( !data[spectra[i].datapoints[j].key] ) data[spectra[i].datapoints[j].key] = 1;
                }
                continue;
            }

            if( !attributes[key] ) attributes[key] = 1;
        }

        c++;
    }

    var metadata = [];
    var d = [];

    for( var key in attributes ) metadata.push(key);
    for( var key in data ) d.push(key);

    return {
        metadata : metadata,
        data : d
    }
}

function logTime() {
    console.log((new Date().getTime() - t)+'ms');
}