Esis.files = (function(){

    var files = [];

    function add(name, parser) {
        files.push({
            name : name,
            parser : parser,
            sheets : []
        });
        return files.length - 1;
    }

    function addSheet(fileIndex, type, orientation, table) {
        files[fileIndex].sheets.push({
            type : type,
            orientation : orientation,
            table : table
        });
        return files[fileIndex].sheets.length - 1;
    }

    function setSheetSpectra(fileIndex, sheetIndex, spectra) {
        files[fileIndex].sheets[sheetIndex].spectra = spectra;
        _setSchema(files[fileIndex].sheets[sheetIndex]);

        delete files[fileIndex].sheets[sheetIndex].metadata;
    }

    function setSheetMetadata(fileIndex, sheetIndex, metadata) {
        files[fileIndex].sheets[sheetIndex].metadata = metadata;
        _setSchema(files[fileIndex].sheets[sheetIndex]);

        delete files[fileIndex].sheets[sheetIndex].spectra;
    }

    function updateSheetOrientation(fileIndex, sheetIndex, orientation, spectra, attributes) {
        files[fileIndex].sheets[sheetIndex].orientation = orientation;
        setSheetAttributes(fileIndex, sheetIndex, attributes);
        setSheetSpectra(fileIndex, sheetIndex, spectra);

        Esis.updateJoinCounts();

        return files[fileIndex].sheets[sheetIndex];
    }

    function updateSheetType(fileIndex, sheetIndex, type) {
        var sheet = files[fileIndex].sheets[sheetIndex];
        sheet.type = type;
        
        if( type == 'metadata' ) {
            if( sheet.spectra ) {
                sheet.metadata = sheet.spectra;
                delete sheet.spectra;
            }
        } else {
            if( sheet.metadata ) {
                sheet.spectra = sheet.metadata;
                delete sheet.metadata;
            }
        }

        Esis.updateJoinCounts();

        return sheet;
    }

    function updateSheetJoin(fileIndex, sheetIndex, join) {
        var sheet = files[fileIndex].sheets[sheetIndex];
        sheet.join = join;

        // set the join index
        sheet.joinIndex = {};
        for( var i = 0; i < sheet.metadata.length; i++ ) {
            if( sheet.metadata[i][join] === undefined ) continue;

            sheet.joinIndex[sheet.metadata[i][join]] = i;
        }

        Esis.updateJoinCounts();

        return sheet;
    }

    function _setSchema(sheet) {
        var attributes = {};
        var data = {};
        var c = 0, sp;

        var items = sheet.spectra ? sheet.spectra : sheet.metadata;

        for( var i = 0; i < items.length; i++ ) {   

            for( var key in items[i] ) {

                if( key == 'datapoints' ) {
                    for( var j = 0; j < items[i].datapoints.length; j++ ) {
                        if( !data[items[i].datapoints[j].key] ) data[items[i].datapoints[j].key] = 1;
                    }
                    continue;
                }

                if( !attributes[key] ) attributes[key] = 1;
            }
            c++;
        }

        sheet.schema = {
            metadata : {},
            data : {}
        };

        for( var key in attributes ) processAttrName(key, 'metadata', sheet.schema);
        for( var key in data ) processAttrName(key, 'data', sheet.schema);
    }

    function processAttrName(key, type, schema) {
        var original = key;
        var parts = key.split(' ');

        parts[0] = parts[0].trim();
        if( parts[0].match(/.*__d$/) ) {
            parts[0] = parts[0].replace(/__d$/, '');
            type = 'data';
        }

        key = parts[0];
        schema[type][key] = {
            original : original
        }

        if( parts.length > 1 ) {
            parts.splice(0, 1);
            parts = parts.join(' ').trim();
            if( parts.match(/.*\(.*\).*/) ) {
                parts = parts.split('(');
                parts.splice(0, 1);
                parts = parts.join('(').split(')');
                parts.splice(parts.length-1, 1);
                schema[type][key].units = parts.join(')');
            }
        }
    }

    function setSheetAttributes(fileIndex, sheetIndex, attributes) {
        files[fileIndex].sheets[sheetIndex].attributes = attributes;
    }

    function get(fileIndex) {
        if( fileIndex !== undefined ) return files[fileIndex];
        return files;
    }

    function getSheet(fileIndex, sheetIndex) {
        return files[fileIndex].sheets[sheetIndex];
    }

    return {
        add : add,
        get : get,
        updateSheetType : updateSheetType,
        updateSheetOrientation : updateSheetOrientation,
        setSheetAttributes : setSheetAttributes,
        setSheetSpectra : setSheetSpectra,
        setSheetMetadata : setSheetMetadata,
        updateSheetJoin : updateSheetJoin,
        addSheet : addSheet,
        getSheet : getSheet
    }

})();