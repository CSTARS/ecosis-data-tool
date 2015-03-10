
exports.run = function(table, format) {
    var headerRange = getHeader(table);
    var globalMetadata = getHeaderData(headerRange, table);

    var start = (headerRange[1] == -1) ? 0 : headerRange[1]; 

    var spectra = [];
    var datarows = getDataRows(start, table, format);

    if( format == 'row' ) {
        for( var i = start+1; i < table.length; i++ ) {
            spectra.push(getSpectra(start, i, table, 'row', datarows));
        }
    } else {
        for( var i = 0; i < table[start].length; i++ ) {
            spectra.push(getSpectra(start, i, table, 'row', datarows));
        }
    }

    return spectra;
}

function getSpectra(start, index, table, format, datarows) {
    var spectra = {};
    var datapoints = [];

    if( format == 'row' ) {
        for( var i = 0; i < table[start].length; i++ ) {
            if( table[index].length <= i ) break;

            var val = table[index][i] || '';
            if( datarows[i] ) datapoints.push({key: table[start][i], value: val });
            else spectra[table[start][i]] = val;
        }
    } else {
        for( var i = start; i < table.length; i++ ) {
            var val = table[i][index] || '';

            if( datarows[i] ) datapoints.push({key: table[i][0], value: val });
            else spectra[table[i][0]] = val;
        }
    }

    spectra.datapoints = datapoints;
    return spectra;
}

function getDataRows(start, table, format) {
    var datarows = [];

    if( format == 'row' ) {
        for( var i = 0; i < table[start].length; i++ ) {
            if( isDataAttr(table[start][i]) ) datarow[i] = true;
            else datarow[i] = false;
        }
    } else {
        for( var i = start; i < table.length; i++ ) {
            if( isDataAttr(table[i][0]) ) datarow[i] = true;
            else datarow[i] = false;
        }
    }

    return datarows;
}

function isDataAttr(attr) {
    attr = attr.trim().split(' ')[0];

    if( attr.match(/^-?\d+\.?\d*$/) || attr.match(/^-?\d*\.\d+$/) ) return true;
    if( attr.match(/.*__d$/) ) return true;

    return false;
}


function getHeaderRange(range, table) {
    if( range[0] == -1 || range[1] == -1 ) return {};

    var metadata = {};
    for(var i = range[0]; i < range[1]; i++ ) {
        metadata[table[i][0]] = table[i][1] || '';
    }
    return metadata;
}

function getHeader(table) {
    var i = 0;
    if( isEmptyRow(table[0]) ) {
        while( i < table.length ) {
            if( !isEmptyRow(table[i]) ) break;
            i++;
        }
    }
    var start = i;

    while( i < table.length ) {
        if( isEmptyRow(table[i]) ) {
            return [start, i];
        }
    }
    
    return [-1, -1];
}

function isEmptyRow(row) {
    for( var i = 0; i < row.length; i++ ) {
        if( row[i] != '' ) return false;
    }
    return true;
}