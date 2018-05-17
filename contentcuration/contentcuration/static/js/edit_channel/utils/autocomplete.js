var Models = require("edit_channel/models");

function addAutocomplete(element, values, callback, appendTo){

	element.autocomplete({
      source: values,
      minLength: 0,
      select: function( event, ui ) {
        callback(ui.item);
        return false;
      },
      appendTo: appendTo,
      messages: {
          noResults: '',
          results: function() {}
      }
    });
}

module.exports = {
	addAutocomplete : addAutocomplete
}