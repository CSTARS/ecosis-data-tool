var unzip = require('adm-zip');
var fs = require('fs');
var os = require('os');
var async = require('async');
var uuid = require('node-uuid');
var rimraf = require('rimraf');
var xlsx = require('./xlsx.js');
var xls = require('./xls.js');
var csv = require('./csv.js');
var spectra = require('./spectra.js');

function run(file, callback) {

    if( file.match(/.*\.zip/) ) {
        zip(file, callback);
    } else if( file.match(/.*\.xlsx/) ) {
        xlsx.run(file, function(err, resp){
            callback(err, resp, 'xlsx');
        });
    } else if( file.match(/.*\.xls/) ) {
        xls.run(file, function(err, resp){
            callback(err, resp, 'xls');
        });
    } else if( file.match(/.*\.csv/) ) {
        csv.run(file, ',', function(err, resp){
            callback(err, [resp], 'csv');
        });
    } else if( file.match(/.*\.tsv/) || file.match(/.*\.spectra/) ) {
        csv.run(file, '\t', function(err, resp){
            callback(err, [resp], 'tsv');
        });
    } else {
        console.log('Running spectra importer... ');
        spectra.run(file, function(err, resp){
            callback(err, resp, 'spectra');
        });
    }
}
exports.run = run;


function zip(file, callback) {
     var zip = new unzip(file);

    var zipEntries = zip.getEntries(); // an array of ZipEntry records

    var files = [];

    for( var i = 0; i < zipEntries.length; i++ ) {
        if( zipEntries[i].isDirectory ) continue;

        files.push(zipEntries[i].entryName);
    }

    var folder = os.tmpdir()+uuid.v4();
    zip.extractAllTo(folder, true);

    var resp = {
        defaultConfig : null,
        files : []
    }

    async.eachSeries(
        files, 
        function(file, next){
            if( file.match(/.*\.ecosis$/) ) {
                try {
                    var json = JSON.parse(fs.readFileSync(folder+'/'+file, 'utf-8'));
                    resp.defaultConfig = json;
                } catch(e) {}

                next();
                return;

            // ignore all other dot files 
            } else if ( file.replace(/.*\//,'').charAt(0) == '.' ) {
                next();
                return;
            }

            run(folder+'/'+file, function(err, tables, parser){
                var f = {
                    name : file,
                    parser : parser
                }

                if( err ) {
                    f.error = true;
                } else {
                    f.tables = tables || [];
                }

                resp.files.push(f);
                next();
            }); 
        },
        function(err){

            // cleanup
            rimraf(folder, function(){
                callback(err, resp, 'zip');
            });    
        }
    );
}
