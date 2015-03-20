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

    function updateSheetOrientation(fileIndex, sheetIndex, orientation, spectra, attributes) {
        files[fileIndex].sheets[sheetIndex].orientation = orientation;
        setSheetAttributes(fileIndex, sheetIndex, attributes);
        setSheetSpectra(fileIndex, sheetIndex, spectra);

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

        return sheet;
    }

    function updateSheetJoin(fileIndex, sheetIndex, join) {
        files[fileIndex].sheets[sheetIndex].join = join;
        Esis.updateJoinCounts();

        return files[fileIndex].sheets[sheetIndex];
    }

    function _setSchema(sheet) {
        var attributes = {};
        var data = {};
        var c = 0, sp;

        for( var i = 0; i < sheet.spectra.length; i++ ) {   

            for( var key in sheet.spectra[i] ) {

                if( key == 'datapoints' ) {
                    for( var j = 0; j < sheet.spectra[i].datapoints.length; j++ ) {
                        if( !data[sheet.spectra[i].datapoints[j].key] ) data[sheet.spectra[i].datapoints[j].key] = 1;
                    }
                    continue;
                }

                if( !attributes[key] ) attributes[key] = 1;
            }
            c++;
        }

        sheet.schema = {
            metadata : [],
            data : []
        };

        for( var key in attributes ) sheet.schema.metadata.push(key);
        for( var key in data ) sheet.schema.data.push(key);
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
        addSheet : addSheet,
        getSheet : getSheet
    }

})();