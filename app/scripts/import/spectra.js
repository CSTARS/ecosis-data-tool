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

    // TODO: transform to our std json format...

    callback(null, json);
}