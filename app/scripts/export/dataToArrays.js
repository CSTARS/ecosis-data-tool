var uuid = require('node-uuid');

exports.run = dataToArrays;

function dataToArrays(spectra) {
    var headers = getHeaders(spectra);

    var data = getData(headers.data, spectra);
    var metadata = getMetadata(headers.metadata, spectra);

    return {
        data : data,
        metadata : metadata
    }
}

function getMetadata(headers, spectra) {
    var metadata = [headers];

    var i, j, sp, row;

    for( i = 0; i < spectra.length; i++ ) {
        sp = spectra[i];

        row = [];
        for( j = 0; j < headers.length; j++ ) {
            row.push(sp[headers[j]] === undefined ? '' : sp[headers[j]]);
        }

        delete sp.guid;
        metadata.push(row);
    }
    return metadata;
}

function getData(headers, spectra) {
    var data = [headers];

    var i, j, sp, row;

    for( i = 0; i < spectra.length; i++ ) {
        sp = spectra[i];

        row = [];
        for( j = 0; j < headers.length; j++ ) {
            row.push(sp.__data[headers[j]] === undefined ? '' : sp.__data[headers[j]]);
        }
        data.push(row);
        delete sp.__data;
    }
    return data;
}


function getHeaders(spectra) {
    var headers = {
        metadata : {},
        data : {}
    }

    var i, j, sp, key;

    for( i = 0; i < spectra.length; i++ ) {
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
    }

    var metadata = [];
    var data = [];
    for( key in headers.metadata ) metadata.push(key);
    for( key in headers.data ) data.push(key);

    metadata.sort(function(a, b){
        if( a > b ) return 1;
        if( a < b ) return -1;
        return 0;
    });
    data.sort(function(a, b){
        if( a > b ) return 1;
        if( a < b ) return -1;
        return 0;
    });

    metadata.splice(0, 0, 'guid');
    data.splice(0, 0, 'guid');

    return {
        metadata : metadata,
        data : data
    }
}