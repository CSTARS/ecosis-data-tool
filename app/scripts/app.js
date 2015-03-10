var fs = require('fs');

/* Initialize the EcoSIS NS */
var Esis = {};

Esis.schema = require('./schema.json');

window.onload = function() {
   $('#list').show();
}