var FileManager = (function(){

    var importer = require('../import/index.js');
    var tableParser = require('../parse/tableParser.js');

    select : function(file) {
        this.currentFile = {
            name : file
        };
        importer.run(file, this.onFileImported.bind(this));
    },

    onFileImported : function(err, resp) {
        if( err ) {
            this.currentFile.error = err;
            return console.log(err);
        }
        
        this.currentFile.tables = resp;
        this.currentFile.formats = [];


        for( var i = 0; i < this.currentFile.tables.length; i++ ) {
            this.currentFile.formats.push({
                orientation : 'row',
                type : 'data' 
            });

            this.currentFile.spectra = tableParser.run(this.currentFile.tables[i], 'row');
        }

        this.files.push(table);
        this.redrawTables()
    }

})();