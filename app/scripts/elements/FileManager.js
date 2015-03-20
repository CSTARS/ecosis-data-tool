var FileManager = (function(){

    var importer = require('./scripts/import/index.js');
    var tableParser = require('./scripts/parser/tableParser.js');

    function select(file) {
        this.setImporting(true);
        
        setTimeout(function(){
            importer.run(file, function(err, resp, parser){
                this.onFileImported(err, resp, file, parser)
            }.bind(this));
        }.bind(this), 100);
    }

    function onFileImported(err, resp, name, parser) {
        this.setImporting(false);

        if( err ) {
            this.currentFile.error = err;
            return console.log(err);
        }

        this.currentFileIndex = Esis.files.add(name, parser);

        if( parser == 'spectra' ) {

            Esis.files.addSheet(this.currentFileIndex, '', '', []);
            Esis.files.setSheetSpectra(this.currentFileIndex, 0, resp);

        } else {

            for( var i = 0; i < resp.length; i++ ) {

                var sheetIndex = Esis.files.addSheet(this.currentFileIndex, 'data', 'row', resp[i]);

                var parsedTable = tableParser.run(resp[i], 'row');
                Esis.files.setSheetSpectra(this.currentFileIndex, sheetIndex, parsedTable.spectra);
                Esis.files.setSheetAttributes(this.currentFileIndex, sheetIndex, parsedTable.attributes);
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

            var fileIndex = parseInt(parts[0]);
            var sheetIndex = parseInt(parts[1]);

            var orientation = ele.val();

            var resp = tableParser.run(Esis.files.getSheet(fileIndex, sheetIndex).table, orientation);
            var sheet = Esis.files.updateSheetOrientation(fileIndex, sheetIndex, orientation, resp.spectra, resp.attributes);

            // TODO: no DOM stuff here...
            $(this).find('.'+fileIndex+'-'+sheetIndex+'-scount').html(sheet.spectra ? sheet.spectra.length : 0);
            $(this).find('.'+fileIndex+'-'+sheetIndex+'-mcount').html(sheet.schema.metadata.length);

            this.setImporting(false);
            this.fire('data-update', Esis.files);
        }.bind(this), 100);
    }

    function changeType(e) {
        this.setImporting(true);

        setTimeout(function(){
            var ele = $(e.currentTarget);
            var parts = ele.attr('id').split('-');

            var fileIndex = parseInt(parts[0]);
            var sheetIndex = parseInt(parts[1]);


            var type = ele.val();

            var sheet = Esis.files.updateSheetType(fileIndex, sheetIndex, type);

            if( type == 'metadata' ) {
        

                var selector = this.createJoinSelector(fileIndex, sheetIndex, sheet.attributes, '');

                ele.parent().append(
                    $('<div style="margin-top: 10px">'+
                        '<div> Joined to: <span id="'+fileIndex+'-'+sheetIndex+'-joincount">0</span></div>' +
                        '<div> Join On: '+selector+'</div>' +
                      '</div>'
                     )
                );
                ele.find('.join-selector').on('change', this.onChangeJoin.bind(this));

                $(this).find('.'+fileIndex+'-'+sheetIndex+'-mcount').html(sheet.attributes.length);
            } else {

                // remove selector
                $('#join-selector-'+fileIndex+'-'+sheetIndex).parent().remove();

                
                $(this).find('.'+fileIndex+'-'+sheetIndex+'-mcount').html(sheet.schema.metadata.length);
            }

            // TODO: no DOM stuff here...
            $(this).find('.'+fileIndex+'-'+sheetIndex+'-scount').html(sheet.spectra ? sheet.spectra.length : 0);

            this.setImporting(false);
            this.fire('data-update', Esis.files);
        }.bind(this), 100);
    }

    function onChangeJoin(e) {
        var id = $(e.currentTarget).attr('id');
        var parts = id.split('-');
        var fileIndex = parseInt(parts[0]);
        var sheetIndex = parseInt(parts[1]);

        var sheet = Esis.files.updateSheetJoin(fileIndex, sheetIndex, e.currentTarget.value);
        Esis.updateJoinCounts();
        
        $('#'+fileIndex+'-'+sheetIndex+'-joincount').text(sheet.joinedCount);
    }


    function removeSpectra(fileIndex, sheetIndex) {
        var file = Esis.files[fileIndex];
        var removed = [];

        for( var i = file.spectra.length-1; i >= 0; i-- ) {
            if( sheetIndex == file.spectra[i].__info.sheet ) {
                removed.push(file.spectra.splice(i, 1)[0]);
            }
        }

        return removed;
    }

    return {
        select : select,
        onFileImported : onFileImported,
        changeOrientation : changeOrientation,
        removeSpectra : removeSpectra,
        changeType : changeType,
        onChangeJoin : onChangeJoin
    }

})();