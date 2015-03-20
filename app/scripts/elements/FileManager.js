var FileManager = (function(){

    var importer = require('./scripts/import/index.js');
    var tableParser = require('./scripts/parser/tableParser.js');

    function select(file) {
        this.currentFile = {
            name : file
        };
        this.setImporting(true);
        
        setTimeout(function(){
            importer.run(file, this.onFileImported.bind(this));
        }.bind(this), 100);
    }

    function onFileImported(err, resp, parser) {
        this.setImporting(false);

        if( err ) {
            this.currentFile.error = err;
            return console.log(err);
        }

        this.currentFile.parser = parser;

        if( parser == 'spectra' ) {

            this.currentFile.tables = [[]];
            this.currentFile.formats = [];
            this.currentFile.spectra = resp;
            this.currentFile.schema = [];

            // fake the sheet parameter, like with csv
            for( var i = 0; i < resp.length; i++ ) {
                resp[i].__info = {sheet:0};
            }

        } else {

            this.currentFile.tables = resp;
            this.currentFile.formats = [];
            this.currentFile.spectra = [];
            this.currentFile.schema = [];

            for( var i = 0; i < this.currentFile.tables.length; i++ ) {
                this.currentFile.formats.push({
                    orientation : 'row',
                    type : 'data' 
                });

                var spectra = tableParser.run(this.currentFile.tables[i], 'row');
                for( var j = 0; j < spectra.length; j++ ) {
                    spectra[j].__info = {
                        sheet : i
                    }
                    this.currentFile.spectra.push(spectra[j]);
                }
            }
        }
        
        Esis.files.push(this.currentFile);

        if( parser = 'spectra' ) {
            this.setAttributeList(Esis.files.length - 1, 0);
        } else {
            var fileIndex = Esis.files.length -1;
            for( var i = 0; i < Esis.files[fileIndex].tables.length; i++ ) {
                this.setAttributeList(Esis.files.length - 1, i);
            }
        }

        this.redrawFiles();

        this.fire('data-update', Esis.files);
    }

    function changeOrientation(e) {
        this.setImporting(true);

        setTimeout(function(){
            var ele = $(e.currentTarget);
            var parts = ele.attr('id').split('-');

            var file = parseInt(parts[0]);
            var sheetIndex = parseInt(parts[1]);

            var sheet = Esis.files[file].tables[sheetIndex];
            var orientation = ele.val();

            Esis.files[file].formats[sheetIndex].orientation = orientation;

            // remove all current spectra
            this.removeSpectra(file, sheetIndex);

            var spectra = tableParser.run(sheet, orientation);
            for( var j = 0; j < spectra.length; j++ ) {
                spectra[j].__info = {
                    sheet : sheetIndex
                }
                this.currentFile.spectra.push(spectra[j]);
            }

            this.setAttributeList(file, sheetIndex);

            // TODO: no DOM stuff here...
            $(this).find('.'+file+'-'+sheetIndex+'-scount').html(Esis.files[file].schema[sheetIndex].spectraCount);
            $(this).find('.'+file+'-'+sheetIndex+'-mcount').html(Esis.files[file].schema[sheetIndex].metadata.length);

            this.setImporting(false);
            this.fire('data-update', Esis.files);
        }.bind(this), 100);
    }

    function setAttributeList(index, sheetIndex) {
        var file = Esis.files[index];

        var attributes = {};
        var data = {};
        var c = 0;
        for( var i = 0; i < file.spectra.length; i++ ) {
            if( file.spectra[i].__info.sheet != sheetIndex ) continue;

            for( var key in file.spectra[i] ) {
                if( key == '__info' ) continue;

                if( key == 'datapoints' ) {
                    for( var j = 0; j < file.spectra[i].datapoints.length; j++ ) {
                        if( !data[file.spectra[i].datapoints[j].key] ) data[file.spectra[i].datapoints[j].key] = 1;
                    }
                    continue;
                }

                if( !attributes[key] ) attributes[key] = 1;
            }

            c++;
        }

        file.schema[sheetIndex] = {
            spectraCount : c,
            metadata : [],
            data : []
        };

        for( var key in attributes ) file.schema[sheetIndex].metadata.push(key);
        for( var key in data ) file.schema[sheetIndex].data.push(key);
    }

    function removeSpectra(fileIndex, sheetIndex) {
        var file = Esis.files[fileIndex];

        for( var i = file.spectra.length-1; i >= 0; i-- ) {
            if( sheetIndex == file.spectra[i].__info.sheet ) {
                file.spectra.splice(i, 1);
            }
        }
    }

    return {
        select : select,
        onFileImported : onFileImported,
        changeOrientation : changeOrientation,
        setAttributeList : setAttributeList,
        removeSpectra : removeSpectra
    }

})();