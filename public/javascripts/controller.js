// DOM ready ----------------------------------------------------------
$(document).ready(function() {

	// draw the paper representing the zone
	pt.fn.drawZonePaper();

	// draw the paper representing the bases
	pt.fn.drawBasesPaper();

	// EVENT LISTENERS ------------------------------------------------

	// click on the zone paper
	$('#' + ZONE_ID).click(function(event) {
		pt.fn.setProspectivePitch(pt.fn.getPitchLocation(event.clientX, event.clientY));
	});

	// event listener for submitting the player input group
	pt.fn.attachInputGroupEventListeners(PLAYER_INPUT_GROUP, pt.fn.submitPlayers);

	// event listener for submitting the pitch input group
	pt.fn.attachInputGroupEventListeners(PITCH_INPUT_GROUP, pt.fn.submitPitch);

	// event listener for submitting the result input group
	pt.fn.attachInputGroupEventListeners(RESULT_INPUT_GROUP, pt.fn.submitResult);

	// INITIALIZATION -------------------------------------------------

	pt.currentInputGroup = PLAYER_INPUT_GROUP;

	// set the visible input group and disables all other input groups
	// inital visible input group is the player input group
	pt.fn.setInputGroup(pt.currentInputGroup);
});

// EVENT LISTENERS ----------------------------------------------------

// attaches event listeners to each member of the input group
pt.fn.attachInputGroupEventListeners = function(inputGroupIndex, listener) {
	var inputGroup = INPUT_GROUPS[inputGroupIndex];
	$.each(inputGroup.inputs, function(index, input) {
		$(input).keypress(function(event) {
			if (event.keyCode === ENTER_KEYCODE) {
				listener();
			}
		})
	});
	$(inputGroup.button).click(listener);
}

// event listener for submitting the players
pt.fn.submitPlayers = function() {
	var data = {
		pitcher : $('#pitcherNameInput').val(),
		hitter  : $('#hitterNameInput').val(),
		start   : pt.fn.now()
	};
	// basic validation
	if (data.pitcher && data.hitter) {
		pt.fn.post('/api/addpa', data, function(response) {
			// initialize the plate appearance
			pt.fn.initializePa(response.pa._id, response.pa.hitter, response.pa.pitcher);

			// update the view with the new pa data
			pt.fn.updatePlayers(response.pa.hitter, response.pa.pitcher);

			pt.fn.clearMessage();
			pt.fn.setInputGroup(PITCH_INPUT_GROUP);
		});
	} else {
		pt.fn.setError('You must enter a pitcher and a hitter name', 'Error: ');
	}
}

pt.fn.submitPitch = function() {
	var pitchLocation = pt.fn.getProspectivePitch();
	if (pitchLocation) {
		// collect all relevant from the DOM
		var pitch = {
			type     : $('#pitchTypeInput').val(),
			velocity : $('#pitchVelocityInput').val(),
			xLoc     : pitchLocation.horizontal,
			yLoc     : pitchLocation.vertical,
			strikes  : pt.currentPa.strikes,
			balls    : pt.currentPa.balls,
			pitchNum : pt.currentPa.pitchNum,
			result   : parseInt($('#pitchResultInput').val()),
			pa       : pt.currentPa.id
		}

		// basic pitch data validation
		if (pitch.type && pitch.velocity && pitch.result) {
			// record data using AJAX to post
			pt.fn.post('/api/addpitch', pitch, function(response) {
				// set the prospective pitch color and store the pitch
				pt.currentPa.pitches.push(pt.prospectivePitch.raphael.attr({
					fill: pt.fn.getColor(pitch)
				}));
				pt.prospectivePitch = {};

				// update current plate appearance data
				pt.fn.updateCurrentPa(pitch.result);

				// update the states table
				pt.fn.updateStateTable();

				if (pitch.result === IN_PLAY) {
					pt.fn.setInputGroup(RESULT_INPUT_GROUP);
				} else if (pt.currentPa.result) {
					pt.fn.finalizePa(pt.currentPa.result);
				}

				// add to the current pa table. +1 adjustment to 1 index
				pt.fn.appendPaTableRow(pitch.strikes + pitch.balls + 1, pitch.velocity,
					pitch.type, pitch.result);

				// reset the message
				pt.fn.clearMessage();

				// set the input group again to the pitch input (clears contents)
				pt.fn.setInputGroup(PITCH_INPUT_GROUP);
			});
		} else {
			pt.fn.setError('You must enter the pitch type, velocity, and result', 'Error: ');
		}
	} else {
		pt.fn.setError('You must enter a pitch location by clicking on the zone', 'Error: ');
	}
}

pt.fn.submitResult = function(event) {
	var result = parseInt($('#paResultInput').val());
	if (result) {
		pt.fn.finalizePa(result);
		pt.fn.setInputGroup(PLAYER_INPUT_GROUP);
	} else {
		pt.fn.setError('You must enter the result of the plate appearance', 'Error: ');
	}
}

//  HELPER FUNCTIONS --------------------------------------------------

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

// helper function to initialize the currentPa for a new plate appearance
pt.fn.initializePa = function(id, hitter, pitcher) {
	pt.currentPa = {
		id       : id,
		hitter   : hitter,
		pitcher  : pitcher,
		pitches  : [],
		strikes  : 0,
		balls    : 0,
		pitchNum : 0,
		result   : null
	}
}

// helper function to update the currentPa based upon the most recent pitch
pt.fn.updateCurrentPa = function(pitchResult) {
	// increment pitchNum, balls, and strikes as needed
	pt.currentPa.pitchNum++;
	if (pitchResult === BALL) {
		pt.currentPa.balls++;
	} else if (pitchResult === SWINGING_STRIKE ||
		       pitchResult === CALLED_STRIKE ||
	           pitchResult === FOUL_TIP ||
	          (pitchResult === FOUL && pt.currentPa.strikes < 2)) {
		pt.currentPa.strikes++;
	}

	// set result as needed based on balls, strikes, and pitch result
	if (pt.currentPa.balls === 4) {
		pt.currentPa.result = WALK;
	} else if (pt.currentPa.strikes === 3) {
		pt.currentPa.result = STRIKEOUT;
	}
}

// helper function for date generateion, UTC format for standardization
pt.fn.now = function() {
	return new Date().toUTCString();
}

// helper function for POST requests
pt.fn.post = function(url, data, callbackSuccess, callbackFailure) {
	console.log('POSTing to %s', url);
	$.ajax({
		type       : 'POST',
		data       : data,
		url        : url,
		dataType   : 'JSON',
		statusCode : {
			200: callbackSuccess,
			500: (callbackFailure ? callbackFailure : function(response) {
				console.log('Error occured: ');
				console.log(response);
				pt.fn.setError(JSON.parse(response.responseText).msg);
			})
		}
	});
}

// ends an inning
pt.fn.finalizeInning = function() {
	// outs back to zero
	pt.outs = 0;

	// increment inning if the bottom just ended
	pt.currInning.num += (!pt.currInning.top);

	// flip top/bottom
	pt.currInning.top = !pt.currInning.top;

	// set each base to empty
	$.each(pt.bases, function(i, base) {
		base.player = null;
	});
	
}

// increments the outs and makes correspdoning state changes
pt.fn.incrementOuts = function() {
	// add an out
	pt.outs++;

	// if the half-inning is over
	if (pt.outs === 3) {
		pt.fn.finalizeInning();
	}
}

// helper function to finalize a plate appearance
pt.fn.finalizePa = function(paResult) {
	pt.fn.post('api/finalizepa', {
		pa     : pt.currentPa.id,
		result : paResult,
		end    : pt.fn.now()
	}, function(response) {
		// remove the pitches from the previous plate appearance
		$.each(pt.currentPa.pitches, function(index, pitch) {
			pitch.remove();
		});

		// update the out state or base state as appropriate
		if (paResult === IN_PLAY_OUT || paResult === STRIKEOUT) {
			pt.fn.incrementOuts();
		} else {
			pt.fn.advanceBaserunners(paResult);
		}

		// initialize a new plate appearance, update the states and pa tables
		pt.fn.initializePa();
		pt.fn.updateStateTable();
		pt.fn.clearPaTable();
		pt.fn.updateBases();
		pt.fn.updateBoxScore();

		// set input group
		pt.fn.setInputGroup(PLAYER_INPUT_GROUP);
	})
}

// advance the baserunners
pt.fn.advanceBaserunners = function(paResult) {
	if (paResult === WALK || paResult === HIT_BY_PITCH) {
		pt.fn.implementWalk();
	} else if (paResult === SINGLE || paResult === DOUBLE ||
			paResult === TRIPLE || paResult === HOME_RUN) {
		pt.fn.implementHit(paResult);
	}
}

// implements a hit
pt.fn.implementHit = function(numBases) {
	// move players forward according to the number of bases hit
	// TODO: allow this to be entered by the user (i.e. take two bases on a single)
	for (base = THIRD_BASE; base >= FIRST_BASE; base--) {
		if (pt.bases[base].player) {
			if (base + numBases >= HOME_BASE) {
				pt.fn.incrementRun(pt.bases[base].player);
				pt.bases[base].player = null;
			} else {
				pt.bases[base + numBases].player = pt.bases[base].player;
				pt.bases[base].player = null;
			}
		}
	}

	// if HR score the hitter, otherwise place on base (one offset adjustment)
	if (numBases === HOME_RUN) {
		pt.fn.incrementRun(pt.currentPa.hitter);
	} else {
		pt.bases[numBases - 1].player = pt.currentPa.hitter;
	}
}

// implements a walk or a hit by pitch
pt.fn.implementWalk = function() {
	if (pt.bases[FIRST_BASE].player) {
		if (pt.bases[SECOND_BASE].player) {
			if (pt.bases[THIRD_BASE].player) {
				pt.fn.incrementRun(pt.bases[THIRD_BASE].player)
			}
			pt.bases[THIRD_BASE].player = pt.bases[SECOND_BASE].player;
		}
		pt.bases[SECOND_BASE].player = pt.bases[FIRST_BASE].player;
	}
	pt.bases[FIRST_BASE].player = pt.currentPa.hitter;
}

// score a run
pt.fn.incrementRun = function(player) {
	// bool math means top -> 0, !top -> 1 as desired
	pt.innings[pt.currInning.num - 1][!pt.currInning.top * 1]++;
}
