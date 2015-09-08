// gloval variable
var pitchTracker = {};

// DOM ready --------------------------
$(document).ready(function() {
	
	// populate the school list on page load
	populateSchoolTable();
});



// Functions --------------------------

// populate the schools table
function populateSchoolTable() {

	// empty content string
	var tableContent = '';

	// jQuery AJAX call to get JSON
	$.getJSON('/schools/schoollist', function(data) {
		$.each(data, function() {
			tableContent += '<tr>';
			tableContent += '<td>' + this.school + '</td>';
			tableContent += '<td><a href="#" rel="' + this._id + '">delete</a></td>';
			tableContent += '</tr>';
		});

		// insert the table content into the schools table
		$('#schoolList table tbody').html(tableContent);
	});
}