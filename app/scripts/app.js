var fs = require('fs');

var gui = require('nw.gui');
gui.App.setCrashDumpDir('/Users/jrmerz/dev/cstars/EcoSIS/ecosis-data-tool/');

/* Initialize the EcoSIS NS */
var Esis = {
    files : []
};

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