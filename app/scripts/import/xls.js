var XLS = require('xlsjs');
var excel = require('./excel.js');

exports.run = run;
function run(file, callback) {
    var workbook = XLS.readFile(file);
    var resp = [], worksheet;

    var sheet_name_list = workbook.SheetNames;

    sheet_name_list.forEach(function(y) {
      worksheet = workbook.Sheets[y];
      resp.push(excel.sheet_to_array(worksheet));
    });

    callback(null, resp);
}
