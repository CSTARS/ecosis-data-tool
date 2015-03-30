var uuid = require('node-uuid');

exports.run = dataToArrays;

function dataToArrays(schema, spectra) {
    console.log(schema);

    var headers = getHeaders(schema, spectra);

    var data = getData(headers.data, spectra);
    var metadata = getMetadata(headers.metadata, spectra);

    return {
        data : data,
        metadata : metadata
    }
}

function getMetadata(headers, spectra) {
    var metadata = [];

    var i, j, sp, row = [];
    for( var i = 0; i < headers.length; i++ ) {
        row.push(headers[i].key);
    }
    metadata.push(row);
    

    for( i = 0; i < spectra.length; i++ ) {
        sp = spectra[i];

        row = [];
        for( j = 0; j < headers.length; j++ ) {
            row.push(sp[headers[j].org] === undefined ? '' : sp[headers[j].org]);
        }

        metadata.push(row);
    }
    return metadata;
}

function getData(headers, spectra) {
    var data = [];

    var i, j, sp, row = [];
    for( var i = 0; i < headers.length; i++ ) {
        row.push(headers[i].key);
    }
    data.push(row);

    for( i = 0; i < spectra.length; i++ ) {
        sp = spectra[i];

        row = [];
        for( j = 0; j < headers.length; j++ ) {
            row.push(sp[headers[j].org] === undefined ? '' : sp[headers[j].org]);
        }
        data.push(row);
    }
    return data;
}


function getHeaders(schema, spectra) {
    var headers = {
        metadata : {},
        data : {}
    }

    var i, j, sp, key;

    /*for( i = 0; i < spectra.length; i++ ) {
        sp = spectra[i];

        for( key in sp ) {
            if( key == '__data' || key == '__info' || key == 'datapoints' ) continue;
            
            if( !headers.metadata[key] ) headers.metadata[key] = 1;
        }

        sp.__data = {};
        for( j = 0; j < sp.datapoints.length; j++ ) {
            sp.__data[sp.datapoints[j].key] = sp.datapoints[j].value;
            if( !headers.data[sp.datapoints[j].key] ) headers.data[sp.datapoints[j].key] = 1;
        }

        sp.guid = uuid.v4();
        sp.__data.guid = sp.guid;
    }*/

    for( i = 0; i < spectra.length; i++ ) {
        sp = spectra[i];

        for( key in sp ) {
            if( key == 'datapoints' ) continue;
            
            if( !headers.metadata[key] ) headers.metadata[key] = 1;
        }

        for( j = 0; j < sp.datapoints.length; j++ ) {
            sp[sp.datapoints[j].key] = sp.datapoints[j].value;
            if( !headers.data[sp.datapoints[j].key] ) headers.data[sp.datapoints[j].key] = 1;
        }

        sp.guid = uuid.v4();
        delete sp.datapoints;
    }

    var metadata = [];
    var data = [];
    for( key in headers.metadata ) metadata.push(processHeaderKey(key, schema));
    for( key in headers.data ) data.push(processHeaderKey(key, schema));

    metadata.sort(function(a, b){
        if( a.key > b.key ) return 1;
        if( a.key < b.key ) return -1;
        return 0;
    });
    data.sort(function(a, b){
        if( a.key > b.key ) return 1;
        if( a.key < b.key ) return -1;
        return 0;
    });

    metadata.splice(0, 0, {org: 'guid', key: 'guid'});
    data.splice(0, 0, {org: 'guid', key: 'guid'});

    return {
        metadata : metadata,
        data : data
    }
}

function processHeaderKey(key, schema) {
    var org = key;

    if( schema[org] ) {
        if( schema[org].type == 'data' && !(org.match(/\d+\.?\d*/) || org.match(/\d*\.\d+/)) ) {
            key = key.trim()+'__d';
        }

        if( schema[org].units ) {
            key = key.trim()+' ('+schema[org].units+')';
        }
    }

    return {
        key : key,
        org : schema[org] ? schema[org].original : key
    };
}