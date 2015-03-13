var fs = require('fs');

/* Initialize the EcoSIS NS */
var Esis = {
    files : []
};

Esis.schema = require('./schema.json');

window.onload = function() {
   $('#list')
        .on('show', showSpectra)
        .show();
}

function showSpectra(e) {
    $('#list').hide();
    $('#attributes').show();
}

Esis.showSpectraList = function() {
    $('#list').show();
    $('#attributes').hide();
}