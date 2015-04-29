var fs = require('fs');

var gui = require('nw.gui');
gui.App.setCrashDumpDir('/Users/jrmerz/dev/cstars/EcoSIS/ecosis-data-tool/');

/* Initialize the EcoSIS NS */
var Esis = {};


Esis.schema = require('./schema.json');

// process schema into easy to use data structures
Esis.level1 = {};
Esis.level2 = {};
Esis.schemaAll = {};
Esis.schemaFlat = {};
Esis.schemaTotal = 0;

delete Esis.schema.Location;
for( var key in Esis.schema ) {

  for( var i = Esis.schema[key].length-1; i >= 0; i-- ) {
    if( !Esis.schema[key][i].spectraLevel ) {

      Esis.schema[key].splice(i, 1);
      continue;
    }

    Esis.schema[key][i].category = key;

    if( Esis.schema[key][i].level == 1 ) {
        Esis.schemaTotal++;
        Esis.level1[Esis.schema[key][i].name] = Esis.schema[key][i];
    } else {
        Esis.level2[Esis.schema[key][i].name] = Esis.schema[key][i];
    }

    Esis.schemaAll[Esis.schema[key][i].name] = Esis.schema[key][i];

    var flat = Esis.schema[key][i].name.replace(/ /g,'').toLowerCase();
    Esis.schemaFlat[flat] = Esis.schema[key][i].name;
  }

  if( Esis.schema[key].length == 0 ) {
    delete Esis.schema[key];
  }
}

Esis.showSpectraList = function() {
    $('#list').show();
    $('#attributes').hide();
}

Esis.getScoreClass = function(score) {
    var percent = score / Esis.schemaTotal;

    if( percent < .25 ) return 'label-danger';
    else if( percent < .9 ) return 'label-warning';
    return 'label-success';
}

Esis.parseId = function(id) {
    var parts = id.split('-');
    for( var i = 0; i < parts.length; i++ ) parts[i] = parseInt(parts[i]);
    return parts;
}

Esis.getJoinedMetadata = function(spectra) {
    var metadata = [];

    var files = Esis.files.get();
    for( var i = 0; i < files.length; i++ ) {
        var file = files[i];

        for( var j = 0; j < file.sheets.length; j++ ) {
            if( file.sheets[j].type == 'metadata' ) {
                var joinOn = file.sheets[j].join;
                if( spectra[joinOn] === undefined ) continue;

                var index = file.sheets[j].joinIndex[spectra[joinOn]];
                if( index !== undefined ) metadata.push(file.sheets[j].metadata[index]);
            }
        }
    }

    return metadata;
}


Esis.updateJoinCounts = function() {
    var files = Esis.files.get();

    for( var i = 0; i < files.length; i++ ) {
        var file = files[i];

        for( var j = 0; j < file.sheets.length; j++ ) {
            if( file.sheets[j].type == 'metadata' ) {
                Esis.updateJoinCount(i, j, file.sheets[j].join);
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

        for( var j = 0; j < file.sheets.length; j++ ) {
            var inspectSheet = file.sheets[j];

            if( !inspectSheet.spectra || inspectSheet.type != 'data' ) continue;

            for( var z = 0; z < inspectSheet.spectra.length; z++ ){
                var sp = inspectSheet.spectra[z];
                if( !sp[joinOnAttr] ) continue;

                if( sheet.joinIndex[sp[joinOnAttr]] !== undefined ) {
                    count++;
                }
            }
        }
    }

    sheet.joinedCount = count;
    $('#'+fileIndex+'-'+sheetIndex+'-joincount').text(count);
}

Esis.getAttributeCount = function(spectra) {
    var t = {};

    for( var key in spectra ) t[key] = 1;

    var metadata = Esis.getJoinedMetadata(spectra);

    for( var i = 0; i < metadata.length; i++ ) {
        for( var key in metadata[i] ) t[key] = 1;
    }

    return Object.keys(t).length - 1;
}

Esis.getSpectraScore = function(spectra) {
    var s = 0, key;

    var metadata = Esis.getJoinedMetadata(spectra);

    for( key in Esis.level1 ) {
        if( spectra[key] !== undefined && spectra[key] !== null && spectra[key] !== '' ) {
            s++;
            continue;
        }
        for( var i = 0; i < metadata.length; i++ ) {
            if( metadata[i][key] !== undefined && metadata[i][key] !== null && metadata[i][key] !== '' ) {
                s++;
                continue;
                break;
            }
        }
    }
    return s;
}

Esis.getJoinedSchema = function() {
    // TODO: add global schema of user edits
    var files = Esis.files.get();

    var schema = {}

    for( var i = 0; i < files.length; i++ ) {
        var file = files[i];

        for( var j = 0; j < file.sheets.length; j++ ) {
            var ss = file.sheets[j].schema;

            for( var key in ss.metadata ) {
                Esis.addSchemaKey(schema, 'metadata', key, ss.metadata[key]);
            }

            for( var key in ss.data ) {
                Esis.addSchemaKey(schema, 'data', key, ss.data[key]);
            }
        }
    }

    return schema;
}

Esis.addSchemaKey = function(schema, type, key, value) {
    value.type = type;

    if( !schema[key] ) {
        schema[key] = value;
    } else if( Object.keys(value).length > Object.keys(schema[key]).length) {
        schema[key] = value;
    } else if( type == 'data' && schema[key].type == 'metadata' ) {
        schema[key] = value;
    }
}


Esis.app = (function(){

    var gui = require('nw.gui');

    $(window).on('keypress', function(e){
        if( e.ctrlKey && e.which == 18 ) { // ctrl + r
            window.location.reload();
        } else if ( e.ctrlKey && e.which == 9 ) { // ctrl + i
            gui.Window.get().showDevTools();
        }
    });

    /*
        OSX Copy & Paste Fix:
        https://github.com/nwjs/nw.js/issues/1955
        https://github.com/nwjs/nw.js/issues/2039
    */
    var win = gui.Window.get();
    var nativeMenuBar = new gui.Menu({ type: "menubar" });
    try {
        nativeMenuBar.createMacBuiltin("EcoSIS Data Tool");
        win.menu = nativeMenuBar;
    } catch (ex) {
        console.log(ex.message);
    }

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
