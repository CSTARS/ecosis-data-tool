var FileManager = (function(){

    var importer = require('./scripts/import/index.js');
    var tableParser = require('./scripts/parser/tableParser.js');

    function select(file, callback) {
        this.setImporting(true);
        
        setTimeout(function(){
            console.log('running importer on: '+file);
            importer.run(file, function(err, resp, parser){
                if( parser == 'zip' ) {
                    this.onZipFileImported(err, resp, parser);
                } else {
                    this.onFileImported(err, resp, file, parser);
                }
                
                if( callback ) callback();
            }.bind(this));
        }.bind(this), 100);
    }

    function onZipFileImported(err, zipResp, parser) {
        for( var i = 0; i < zipResp.files.length; i++ ) {
            if( zipResp.files[i].error ) continue;
            var f = zipResp.files[i];

            this.onFileImported(err, f.tables, f.name.replace(/.*\//, ''), f.parser, zipResp.defaultConfig);
        }
    }

    function onFileImported(err, resp, name, parser, defaultConfig) {
        this.setImporting(false);

        if( err ) {
            return console.log(err);
        }

        this.currentFileIndex = Esis.files.add(name, parser);

        var updateJoins = [];

        if( parser == 'spectra' ) {

            Esis.files.addSheet(this.currentFileIndex, '', '', []);
            Esis.files.setSheetSpectra(this.currentFileIndex, 0, resp);

        } else {

            for( var i = 0; i < resp.length; i++ ) {

                var type = 'data';
                var orientation = 'row';
                var join = '';

                if( defaultConfig && defaultConfig[name] ) {
                    orientation = defaultConfig[name].orientation;
                    type = defaultConfig[name].type;
                    join = defaultConfig[name].join;
                }

                var sheetIndex = Esis.files.addSheet(this.currentFileIndex, type, orientation, resp[i]);
                var parsedTable = tableParser.run(resp[i], orientation);

                if( type == 'data' ) {
                    Esis.files.setSheetSpectra(this.currentFileIndex, sheetIndex, parsedTable.spectra);
                } else if ( type == 'metadata' ) {
                    Esis.files.setSheetMetadata(this.currentFileIndex, sheetIndex, parsedTable.spectra);
                    updateJoins.push([sheetIndex, join]);
                }

                Esis.files.setSheetAttributes(this.currentFileIndex, sheetIndex, parsedTable.attributes);
            }
        }

        for( var i = 0; i < updateJoins.length; i++ ) {
            Esis.files.updateSheetJoin(this.currentFileIndex, updateJoins[i][0], updateJoins[i][1]); 
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
        
                this.createMetadataSelector(fileIndex, sheetIndex);

            } else {

                // remove selector
                $('#'+fileIndex+'-'+sheetIndex+'-fm-metadata-info').remove();

                
                $(this).find('.'+fileIndex+'-'+sheetIndex+'-mcount').html(sheet.schema.metadata.length);
            }

            // TODO: no DOM stuff here...
            $(this).find('.'+fileIndex+'-'+sheetIndex+'-scount').html(sheet.spectra ? sheet.spectra.length : 0);

            this.setImporting(false);
            this.fire('data-update', Esis.files);
        }.bind(this), 100);
    }

    function createMetadataSelector(fileIndex, sheetIndex) {
        var sheet = Esis.files.get(fileIndex).sheets[sheetIndex];
        var selector = this.createJoinSelector(fileIndex, sheetIndex, sheet.attributes, sheet.join || '');
        var ele = $('#'+fileIndex+'-'+sheetIndex+'-format-selector');

        ele.append(
            $('<div style="margin-top: 10px" id="'+fileIndex+'-'+sheetIndex+'-fm-metadata-info">'+
                '<div> Joined to: <span id="'+fileIndex+'-'+sheetIndex+'-joincount">'+(sheet.joinedCount || 0)+'</span></div>' +
                '<div> Join On: '+selector+'</div>' +
              '</div>'
             )
        );
        ele.find('.join-selector').on('change', this.onChangeJoin.bind(this));

        $('.'+fileIndex+'-'+sheetIndex+'-mcount').html(sheet.attributes.length);
    }

    function onChangeJoin(e) {
        var id = $(e.currentTarget).attr('id');
        var parts = id.split('-');
        var fileIndex = parseInt(parts[0]);
        var sheetIndex = parseInt(parts[1]);

        var sheet = Esis.files.updateSheetJoin(fileIndex, sheetIndex, e.currentTarget.value);
        Esis.updateJoinCounts();

        this.fire('data-update', Esis.files);
        
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
        onZipFileImported : onZipFileImported,
        onFileImported : onFileImported,
        changeOrientation : changeOrientation,
        removeSpectra : removeSpectra,
        changeType : changeType,
        onChangeJoin : onChangeJoin,
        createMetadataSelector : createMetadataSelector
    }

})();