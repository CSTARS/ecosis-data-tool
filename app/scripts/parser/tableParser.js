
exports.run = function(table, orientation, Esis) {
    if( table.length == 0 ) return [];

    var headerRange = getHeader(table);

    var globalMetadata = getHeaderData(headerRange, table);

    var start = (headerRange[1] == -1) ? 0 : headerRange[1]; 

    var spectra = [];
    var datarows = getDataRows(start, table, orientation);

    if( orientation == 'row' ) {
        for( var i = start+1; i < table.length; i++ ) {
            spectra.push(getSpectra(start, i, table, orientation, datarows));
        }
    } else {
        for( var i = 1; i < table[start].length; i++ ) {
            spectra.push(getSpectra(start, i, table, orientation, datarows));
        }
    }

    var attributes = [];
    if( orientation == 'row' ) {
        for( var i = 0; i < table[start].length; i++ ) {
            attributes.push(table[start][i]);
        }
    } else {
        for( var i = start; i < table.length; i++ ) {
            attributes.push(table[i][0]);
        }
    }

    // clean up any ecosis attribute names
    if( Esis ) {
        for( var i = 0; i < spectra.length; i++ ) {
            for( var key in spectra[i] ) {
                if( Esis.schemaAll[key] ) continue;

                var flat = key.replace(/\s/g, '').toLowerCase();
                if( Esis.schemaFlat[flat] !== undefined ) {
                    spectra[i][Esis.schemaFlat[flat]] = spectra[i][key];
                    delete spectra[key];
                }
            }
        }
    }

    return {
        spectra : spectra,
        attributes : attributes
    }
}

function getSpectra(start, index, table, orientation, datarows) {
    var spectra = {};
    var datapoints = [];

    if( orientation == 'row' ) {
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

function getDataRows(start, table, orientation) {
    var datarows = [];

    if( orientation == 'row' ) {
        for( var i = 0; i < table[start].length; i++ ) {
            if( isDataAttr(table[start][i]) ) datarows[i] = true;
            else datarows[i] = false;
        }
    } else {
        for( var i = start; i < table.length; i++ ) {
            if( isDataAttr(table[i][0]) ) datarows[i] = true;
            else datarows[i] = false;
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


function getHeaderData(range, table) {
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
        i++;
    }
    
    return [-1, -1];
}

function isEmptyRow(row) {
    for( var i = 0; i < row.length; i++ ) {
        if( row[i] != '' ) return false;
    }
    return true;
}