// DOM ready ----------------------------------------------------------
$(document).ready(function() {

	// draw the paper representing the zone
	pt.fn.drawZonePaper();

	// draw the paper representing the bases
	pt.fn.drawBasesPaper();

	// EVENT LISTENERS ------------------------------------------------

	// click on the zone paper
	$('#' + ZONE_ID).click(function(event) {
		var location = pt.fn.getPitchLocation(event.clientX, event.clientY);
		pt.fn.setProspectivePitch(location);
	});

	// event listener for submitting the player input group
	$('#submitPlayers').click(function() {
		var pitcher = $('#pitcherNameInput').val();
		var hitter = $('#hitterNameInput').val();
		if (pitcher && hitter) {
			pt.currentPa.hitter = hitter;
			pt.currentPa.pitcher = pitcher;
			pt.fn.clearMessage();
			pt.fn.nextInputGroup();
		} else {
			pt.fn.setError('You must enter a pitcher and a hitter name');
		}
	});

	// event listener for submitting the pitch input group
	$('#submitPitch').click(function(event) {
		var pitchLocation = pt.fn.getProspectivePitch();
		if (pitchLocation) {
			// collect all relevant from the DOM
			var pitch = {
				type     : $('#pitchTypeInput').val(),
				velocity : $('#pitchVelocityInput').val(),
				xLoc     : pitchLocation.horizontal,
				yLoc     : pitchLocation.vertical,
				result   : $('#pitchResultInput').val()
			}

			// pitch data validation
			if (pitch.type && pitch.velocity && pitch.result) {
				// record data using AJAX to post
				$.ajax({
					type: 'POST',
					data: pitch,
					url: '/api/addpitch',
					dataType: 'JSON'
				}).done(function(response) {
					if (response.msg === '') {
						console.log(response);

					} else {
						alert('Error: ' + response.msg);
					}
				});

				if (/* plate appearance is over*/ true) {
					pt.fn.nextInputGroup();
				}
			} else {
				pt.fn.setError('You must enter the pitch type, velocity, and result');
			}
		} else {
			pt.fn.setError('You must enter a pitch location by clicking on the zone');
		}
	});

	// event listener for submitting the result input group
	$('#submitResult').click(function(event) {
		var result = $('#paResultInput').val();
		if (result) {
			// record data
			pt.fn.nextInputGroup();
		} else {
			pt.fn.setError('You must enter the result of the plate appearance');
		}
	});

	// INITIALIZATION -------------------------------------------------

	pt.currentInputGroup = PLAYER_INPUT_GROUP;

	// set the visible input group and disables all other input groups
	// inital visible input group is the player input group
	pt.fn.setInputGroup(pt.currentInputGroup);
});

// FUNCTIONS ----------------------------------------------------------

/* helper function to convert the x and y coordinates of the click event
 * on the zone into the location of a pitch. Returns a horizontal and a
 * vertical value, each on a [0, 1] scale. The by-the-books strike zone
 * is in the [0.2, 0.8] range
 */
pt.fn.getPitchLocation = function(clientX, clientY) {
	var boundingRect = document.getElementById(ZONE_ID).getBoundingClientRect();
    return {
        horizontal: (clientX - boundingRect.left) / (boundingRect.right - boundingRect.left),
        vertical: (clientY - boundingRect.top) / (boundingRect.bottom - boundingRect.top)
    };
}

// sets the location of the prospective pitch and draws the pitch
pt.fn.setProspectivePitch = function(location) {
	// record the prospective pitch location for model usage
	pt.prospectivePitch.location = location;
	pt.prospectivePitch.raphael = pt.fn.drawProspectivePitch(location);
}

// gets the prospective pitch data
pt.fn.getProspectivePitch = function() {
	return pt.prospectivePitch.location;
}
