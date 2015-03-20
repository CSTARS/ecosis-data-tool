var fs = require('fs');

var gui = require('nw.gui');
gui.App.setCrashDumpDir('/Users/jrmerz/dev/cstars/EcoSIS/ecosis-data-tool/');

/* Initialize the EcoSIS NS */
var Esis = {};

Esis.schema = require('./schema.json');
Esis.schemaTotal = Object.keys(Esis.schema).length;

Esis.showSpectraList = function() {
    $('#list').show();
    $('#attributes').hide();
}

Esis.getScoreClass = function(score) {
    var percent = score / Esis.schemaTotal;

    if( percent < .25 ) return 'label-danger';
    else if( percent < 1 ) return 'label-warning';
    return 'label-success';
}

Esis.parseId = function(id) {
    var parts = id.split('-');
    for( var i = 0; i < parts.length; i++ ) parts[i] = parseInt(parts[i]);
    return parts;
}

Esis.updateJoinCounts = function() {
    var files = Esis.files.get();

    for( var i = 0; i < files.length; i++ ) {
        var file = files[i];

        for( var j = 0; j < file.sheets.length; j++ ) {
            if( sheet[i].format == 'metadata' ) {
                Esis.updateJoinCount(i, j, file.formats[j].join);
            }
        }
    }
}

Esis.updateJoinCount = function(fileIndex, sheetIndex, joinOnAttr) {
    var files = Esis.files.get();
    var sheet = Esis.files.getSheet(fileIndex, sheetIndex);
    var count = 0;

    for( var i = 0; i < files.length; i++ ) {
        var file = files[i];
        if( !file.spectra || file.type != 'data' ) continue;

        for( var j = 0; j < file.spectra.length; j++ ) {
            var sp = files.spectra[i];
            if( !sp[joinOnAttr] ) continue;

            var found = false;
            for( var z = 0; z < sheet.metadata.length; z++ ) {
                if( sheet.metadata[z][joinOnAttr] == sp[joinOnAttr] ) {
                    found = true;
                    break;
                }
            }

            if( found ) {
                break;
                count++;
            }
        }
    }

    sheet.joinedCount = count;
}


Esis.getSpectraScore = function(spectra) {
    var s = 0, key;
    for( key in Esis.schema ) {
        if( spectra[key] !== undefined && spectra[key] !== null && spectra[key] !== '' ) s++;
    }
    return s;
}

Esis.app = (function(){

    window.onload = function() {
       $('#list')
            .on('show', function(e){
                document.querySelector('#attributes').setSpectra(e.originalEvent.detail);
                showSpectra();
            }).show();

        $('esis-file-manager').on('file-select', function(){
            $('esis-header')[0].showExport();
        });

        document.querySelector('#attributes').addEventListener('spectra-updated', updateSpectraTable);
    }

    function showSpectra() {
        $('#list').hide();
        $('#attributes').show();
    }

    function updateSpectraTable(e) {
        document.querySelector('#list').onSpectraUpdated(e.detail);
    }

    return {}
})();