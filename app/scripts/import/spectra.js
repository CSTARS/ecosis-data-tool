var cp = require('child_process');

exports.run = run;
function run(file, callback) {
    var cmd = 'java -jar '+__dirname+'/../../lib/SpectraToJson.jar '+file.replace(/(["\s'$`\\])/g,'\\$1');
    console.log('Running: '+cmd);
    cp.exec(cmd,
        { encoding: 'utf8',
          timeout: 1000*60,
          killSignal: 'SIGKILL'
        },
        function (error, stdout, stderr) {
            if( error != null ) {
                return callback(error);
            } else if ( stderr.length > 0 ) {
                return callback(stderr);
            }
            transform(stdout, callback);
        }
    );
}

function transform(json, callback) {
    try {
        json = JSON.parse(json);
    } catch (e) {
        return callback(e);
    }

    // remove nulls
    removeNulls(json);

    // convert wvls & measurement arrays into spectra objects
    var spectra = createSpectra(json);

    // arrays appear to be all fubar.  if empty, remove.  if value == 1,
    // set as value, if value == number of spectra, set for each, otherwise ignore
    handleArrays(spectra);

    callback(null, spectra);
}


function removeNulls(json) {
    for( var key in json ) {
        if( json[key] === null ) delete json[key];
    }
}

function createSpectra(json) {
    var measurements = json.measurements;
    var wavelengths = json.wvls[0];

    delete json.measurements;
    delete json.wvls;

    var str = JSON.stringify(json);
    var spectra = [];

    for( var i = 0; i < measurements.length; i++ ) {
        var sp = JSON.parse(str);
        sp.datapoints = [];

        for( var j = 0; j < wavelengths.length; j++ ) {
            sp.datapoints.push({
                key : wavelengths[j]+'',
                value : measurements[i][j]+''
            });
        }

        spectra.push(sp);
    }

    return spectra;
}

function handleArrays(spectra) {
    for( var i = 0; i < spectra.length; i++ ) {
        var sp = spectra[i];

        for( var key in sp) {
            if( key == 'datapoints' ) continue;
            if( !Array.isArray(sp[key]) ) continue;

            if( sp[key].length == 0 ) {
                delete sp[key];
            } else if ( sp[key].length == spectra.length ) {
                sp[key] = sp[key][i];
            } else if ( sp[key].length == 1) {
                sp[key] = sp[key][0];
            } else {
                delete sp[key]
            }
        }

    }
}