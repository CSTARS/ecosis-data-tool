var fs = require('fs');
var archiver = require('archiver');
var rimraf = require('rimraf');
var csv = require('fast-csv');
var dataToArray = require('./dataToArrays');


exports.run = function(dir, name, schema, spectra, callback) {
    if( !fs.existsSync(dir) ) return callback({error: true, message: 'invalid directory'});

    name = name.replace(/ /g, '_').replace(/\W/g, '');

    if( fs.existsSync(dir+'/'+name+'.zip') ) fs.unlinkSync(dir+'/'+name+'.zip');

    if( fs.existsSync(dir+'/'+name) ) {
        rimraf(dir+'/'+name, function(){
            create(dir, name, schema, spectra, callback);
        });
    } else {
        create(dir, name, schema, spectra, callback);
    }
}

function create(dir, name, schema, spectra, callback) {
    fs.mkdirSync(dir+'/'+name);

    var arrays = dataToArray.run(schema, spectra);

    // write dot file for importer

    var info = {
        'data.csv' : {
            type : 'data',
            orientation : 'row'
        },
        'metadata.csv' : {
            type : 'metadata',
            orientation : 'row',
            join : 'guid'
        }
    }
    fs.writeFileSync(dir+'/'+name+'/.ecosis', JSON.stringify(info, '', '  '), 'utf-8');

    writeCsv(dir+'/'+name, 'data', arrays.data, function(){
        writeCsv(dir+'/'+name, 'metadata', arrays.metadata, function(){
            zipDir(dir, name, function(){
                cleanup(dir+'/'+name, callback);
            });
        });
    });
}

function zipDir(dir, name, callback) {
    var ws = fs.createWriteStream(dir+'/'+name+'.zip');
    var archive = archiver('zip');

    ws.on('close', callback);

    archive.pipe(ws);
    archive.bulk([
        { expand: true, cwd: dir+'/'+name, src: ['.ecosis', '**'], dest: ''}
    ]);
    archive.finalize();
}

function writeCsv(dir, type, data, callback) {
    var ws = fs.createWriteStream(dir+'/'+type+'.csv');

    csv
        .write(data, {headers: true})
        .pipe(ws)
        .on("finish", callback);
}

function cleanup(dir, callback) {
    rimraf(dir, callback);
}