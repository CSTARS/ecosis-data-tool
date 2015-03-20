var XLSX = require('xlsx');
var excel = require('./excel');

exports.run = run;
function run(file, callback) {
    var workbook = XLSX.readFile(file);
    var resp = [], worksheet;

    var sheet_name_list = workbook.SheetNames;
    
    sheet_name_list.forEach(function(y) {
        worksheet = workbook.Sheets[y];
        var arr = excel.sheet_to_array(worksheet);

        // check for badness ... todo, why?
        if( Array.isArray(arr) ) resp.push(arr);
    });

    callback(null, resp);
}