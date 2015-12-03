/* Pitch Tracker
 * api.js
 * -------------
 * Defines all GET and POST methods used in the Pitch Tracker,
 * serving as a RESTful API
 */

var express = require('express');
var router = express.Router();

// ---------------------------------------- Constants
var STATUS_OK = 200;
var STATUS_ERROR = 500;

// ---------------------------------------- Helper Functions

// sends an error response, log the location of the error
function sendError(res, err) {
	console.log('Error: ' + err);
	res.status(STATUS_ERROR).send({ msg: err });
}

// gets the current time in standardized UTC form
function getTime() {
	return new Date().toUTCString();
}

// ---------------------------------------- Validation

// a map from api reference to validation object
validationMap = {
	'/addpa' : {
		pitcher : 'string',
		hitter  : 'string'
	},
	'/finalizepa' : {
		result : 'number',
		_id    : 'string'
	},
	'/addpitch' : {
		pa       : 'string',
		type     : 'number',
		velocity : 'number',
		result   : 'number',
		xLoc     : 'number',
		yLoc     : 'number',
		balls    : 'number',
		strikes  : 'number',
		pitchNum : 'number'
	}
}

/*
 * middleware to validate objects by ensuring that each desired key is contained
 * in the object, and that the type of each value matches expectation
 */

router.use(function(req, res, next) {
	// get the validation object
	var validationObj = validationMap[req.url];

	// array of missing keys
	var missingKeys = [];
	
	// get the keys of the validation object
	var validationKeys = Object.keys(validationObj);

	for (var i = 0; i < validationKeys.length; i++) {
		if (!req.body.hasOwnProperty(validationKeys[i]) ||
			typeof req.body[validationKeys[i]] !== validationObj[validationKeys[i]]) {
			missingKeys.push(validationKeys[i]);
		}
	}

	// if keys are missing send an error
	if (missingKeys.length) {
		sendError(res, 'The following data is missing: ' + missingKeys.join(', '));

	// if the number of keys in the body does not match that of the validation object
	} else if(Object.keys(req.body).length !== validationKeys.length) {
		sendError(res, 'The number of elements in the data does not match the expected number of elements');

	// otherwise, proceed to the next relevant router function
	} else {
		next();
	}
 });

// ---------------------------------------- Plate appearances

/* POST a new plate appearance */
router.post('/addpa', function(req, res) {
	new req.models.PA(req.body).save(function(err, pa) {
		if (err) {
			sendError(res, err);
		} else {
			res.status(STATUS_OK).send({
				msg : '',
				pa  : pa._id
			});
		}
	});
});

/* POST the result a plate appearance and set the end time */
router.post('/finalizepa', function(req, res) {
	// set the result and the end time of the pa
	var update = { $set : { result : req.body.result, end : getTime() } };

	req.models.PA.findByIdAndUpdate(req.body._id, update, function(err, doc) {
		if (err) {
			sendError(res, err);
		} else {
			res.status(STATUS_OK).send({ msg: '' });
		}
	});
});

// ---------------------------------------- Pitch

/* POST a new pitch. */
router.post('/addpitch', function(req, res) {
	// add a time to the pitch
	req.body.time = getTime();

	new req.models.Pitch(req.body).save(function(err, pitch) {
		if (err) {
			sendError(res, err);
		} else {
			// push the pitch id into the pa's array of pitches
			var update = { $push: { "pitches" : pitch } };

			// if it is the first pitch of the pa, set as the pa's start time
			if (pitch.pitchNum === 1) {
				update.$set = { "start" : req.body.time };
			}

			// add the new pitch to its plate appearance array of pitches
			req.models.PA.findByIdAndUpdate(pitch.pa, update, function(err, pa) {
				if (err) {
					sendError(res, err);
				} else {
					res.status(STATUS_OK).send({ msg: '' });
				}
			});
		}
	});
});

module.exports = router;
