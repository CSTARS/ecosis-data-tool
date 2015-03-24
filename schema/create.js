var csv = require("fast-csv");
var fs = require("fs");


load(function(data){
    create(data);
});


function load(callback) {
    var data = [];
    csv
        .fromPath(__dirname+'/data/schema.csv')
        .on('data', function(row){
            data.push(row);
        })
        .on('end', function(){
            callback(data);
        });
}

function create(data) {
    var schema = {};

    readCategories(1, data, schema, function(){
        write(schema);
    });
}

function readCategories(row, data, schema, callback) {
    var catName = data[row][0];
    schema[catName] = [];

    row++;
    while( data[row][0] == '' ) {
        var level = 1;
        var name = data[row][1];
        
        // check for level 2 data
        if( name == '' ) {
            level = 2;
            name = data[row][2];
        }

        var input = data[row][3];
        var units = data[row][4];

        var vocabulary = null;
        if( data[row][6].indexOf(',') > -1 ) {
            vocabulary = data[row][6].split(',');
            for( var i = 0; i < vocabulary.length; i++ ) {
                vocabulary[i] = prepVocab(vocabulary[i])
            }
            vocabulary.sort();
        }

        if( name != '' ) {
            schema[catName].push({
                name : name,
                level : level,
                input : input,
                units : units,
                vocabulary : vocabulary
            });
        }

        row++;
        if( row == data.length ) return callback();
    }

    if( row == data.length ) return callback();
    readCategories(row, data, schema, callback);
}

function write(schema) {
    fs.writeFileSync(__dirname+'/../app/schema.json', JSON.stringify(schema, '', '  '));
    console.log('done.');
}

function prepVocab(txt) {
    var parts = txt.trim().split(' ');
    for( var i = 0; i < parts.length; i++ ) {
        if( parts[i].length > 0 ) parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    }
    return parts.join(' ');
}