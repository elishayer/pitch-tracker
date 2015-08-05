/* pt-model.js
 * -----------
 * A model for the pitch tracker data
 */

// the model object containing all information from this session
var Model = {};

// an array to hold all pitches
Model.plateAppearances = [];

// counters
var paCount = 0;
var ballCount = 0;
var strikeCount = 0;

// get the session date and put it in the model data
var date = new Date();
var sessionDate = (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear();
Model.date = sessionDate;

// an object to hold functions and temporary data for the pt-mmodel
var ptModel = {};

// Takes an event and the boundingRect from the paper element, and converts the
// data into a location object, which has a horizontal and vertical component.
// Each are in the [0, 1] range, with (0.5, 0.5) representing middle-middle.
// Horizontal is increasing to the right, vertical is increasing to the bottom.
// The strike zone is (0.2, 0.8) in each dimension
ptModel.getPitchLocation = function(event) {
	var boundingRect = document.getElementById('paper').getBoundingClientRect();
    return {
        horizontal: (event.clientX - boundingRect.left) / (boundingRect.right - boundingRect.left),
        vertical: (event.clientY - boundingRect.top) / (boundingRect.bottom - boundingRect.top)
    };
}

// initialize prospectivePitch to null, indicating that there is currently no
// prospectivePitch drawn or recorded. This variable represents only location.
ptModel.prospectivePitch = null;

// A function to set a prospective pitch. Overwrites any previous value.
ptModel.setProspectivePitch = function(location) {
	this.prospectivePitch = location;
}

// returns the current prospective pitch
ptModel.getProspectivePitch = function() {
	return this.prospectivePitch;
}

// submits the current prospective pitch by pushing it into the array of pitches
// and setting prospectivePitch to null to indicate there is no current prospectivePitch
ptModel.submitPitch = function(pitch) {
	if (this.prospectivePitch) {
		pitch.location = this.prospectivePitch;
		Model.plateAppearances[paCount].pitches.push(this.prospectivePitch);
		if (pitch.result == "b") {
			ballCount++;
		} else if (pitch.result == "ss" || pitch.result == "cs" || pitch.result == "ft" || (pitch.result == "f" && strikeCount < 2)) {
			strikeCount++;
		}
		this.prospectivePitch = null;
	}
}

// sets the players involved in a plate appearance and initialize the pitch variable for the pa
ptModel.setPlayers = function(pitcher, hitter) {
	Model.plateAppearances.push({});
	Model.plateAppearances[paCount].pitcher = pitcher;
	Model.plateAppearances[paCount].hitter = hitter;
	Model.plateAppearances[paCount].pitches = [];
}

// returns the count as a string in the from "b-s"
ptModel.getCount = function() {
	return ballCount + "-" + strikeCount;
}

// sets the result of the plate appearance and prepares for the next pa
ptModel.setPaResult = function(paResult) {
	Model.plateAppearances[paCount++].result = paResult;
	ballCount = strikeCount = 0;
}
