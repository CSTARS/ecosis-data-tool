var importer = require('../../app/scripts/import/index.js');
var tableParser = require('../../app/scripts/parser/tableParser.js');

var file = process.argv[2];


if( process.argv.length > 3 ) orientation = process.argv[3];

var t = new Date().getTime();


importer.run(file, onImportComplete);

function onImportComplete(err, tables, parser) {
    if( err ) console.log(err);
    
    console.log('parsed');
    logTime();
    t = new Date().getTime();

    if( parser == 'zip' ) {
        var zipResp = tables;

        for( var i = 0; i < zipResp.files.length; i++ ) {
            if( zipResp.files[i].error ) continue;

            var orientation = 'column';
            var isMetdata = false;
            var name = zipResp.files[i].name.replace(/.*\//,'');

            if( zipResp.defaultConfig && zipResp.defaultConfig[name] ) {
                orientation = zipResp.defaultConfig[name].orientation;
                if( zipResp.defaultConfig[name].type == 'metadata' ) {
                    isMetdata = true;
                }
            }

            for( var j = 0; j < zipResp.files[i].tables.length; j++ ) {
                var data = tableParser.run(zipResp.files[i].tables[j], orientation);
                console.log('converted '+name+' '+isMetdata+' ('+orientation+'): '+data.spectra.length);
                logTime();
            }
        }


    } else {
        console.log('error: wrong parser returned')
    }

    
}


function logTime() {
    console.log((new Date().getTime() - t)+'ms');
}