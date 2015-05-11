var csv = require("fast-csv");
var fs = require("fs");

var column = {
  category : 0,
  l1 : 1,
  l2 : 2,
  inputType : 3,
  allowOther : 4,
  spectraLevel : 5,
  units : 6,
  comment : 7,
  controlledVocab : 8,
  description : 9
}


load(function(data){
    create(data);
});


function load(callback) {
    var data = [];
    csv
        .fromPath(__dirname+'/data/schema_v1.csv')
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
    var catName = data[row][column.category];
    schema[catName] = [];

    row++;
    while( data[row][column.category] == '' ) {
        var level = 1;
        var name = data[row][column.l1];

        // check for level 2 data
        if( name == '' ) {
            level = 2;
            name = data[row][column.l2];
        }

        var input = data[row][column.inputType];
        var units = data[row][column.units];
        var spectraLevel = data[row][column.spectraLevel] == 'TRUE' ? true : false;

        var vocabulary = null;
        if( data[row][column.controlledVocab].indexOf(',') > -1 ) {
            vocabulary = data[row][column.controlledVocab].split(',');
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
                spectraLevel: spectraLevel,
                vocabulary : vocabulary,
                description : data[row][column.description] || '',
                allowOther : data[row][column.allowOther] == 'TRUE' ? true : false
            });
        }

        row++;
        if( row == data.length ) return callback();
    }

    if( row == data.length ) return callback();
    readCategories(row, data, schema, callback);
}

function write(schema) {
    if( schema[""] ) delete schema[""];

    fs.writeFileSync(__dirname+'/../app/schema.json', JSON.stringify(schema, '', '  '));
    console.log('done.');
}

function prepVocab(txt) {
    return txt.trim();
    //var parts = txt.trim().split(' ');
    //for( var i = 0; i < parts.length; i++ ) {
    //    if( parts[i].length > 0 ) parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    //}
    //return parts.join(' ');
}
