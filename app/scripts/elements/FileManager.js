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

    function onFileImported(err, resp) {
        this.setImporting(false);

        if( err ) {
            this.currentFile.error = err;
            return console.log(err);
        }
        
        this.currentFile.tables = resp;
        this.currentFile.formats = [];
        this.currentFile.spectra = [];


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

        this.files.push(this.currentFile);
        this.redrawFiles();

        this.fire('data-update', this.files);
    }

    return {
        select : select,
        onFileImported : onFileImported
    }

})();