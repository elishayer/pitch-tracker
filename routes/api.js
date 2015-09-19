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

// ---------------------------------------- Functions

// sends an error response, log the location of the error
function sendError(res, err, description) {
	console.log('ERROR! Description: %s. Error: %s', description, err);
	res.status(STATUS_ERROR).send({ msg: err });
}

// ---------------------------------------- AJAX messages

/* POST a new plate appearance */
router.post('/addpa', function(req, res) {
	// TODO: validation
	new req.models.PA(req.body).save(function(err, pa) {
		if (err) {
			sendError(res, err, );
		} else {
			res.status(STATUS_OK).send({
				msg : '',
				pa  : pa.toObject()
			});
		}
	});
});

/* POST the result and the end time of a plate appearance */
router.post('/finalizepa', function(req, res) {
	req.models.PA.findByIdAndUpdate(req.body.pa, { $set: req.body}, { new : true}, function(err, doc) {
		if (err) {
			sendError(res, err);
		} else {
			res.status(STATUS_OK).send({ msg: '' });
		}
	});
});

// ---------------------------------------- Pitch

/* GET pitches, limited to a certain plate appearance if specified */
// TODO: get pitches associated with only a specific plate appearance
router.get('/pitchlist', function(req, res) {
	req.models.Pitch.find({}, function(err, pitches) {
		res.json(pitches);
	});
});

/* POST a new pitch. */
router.post('/addpitch', function(req, res) {
	// TODO: validate pitch
	new req.models.Pitch(req.body).save(function(err, pitch) {
		if (err) {
			sendError(res, err);
		} else {
			// add the new pitch to its plate appearance array of pitches
			req.models.PA.findByIdAndUpdate(pitch.pa, { $push: { "pitches" : pitch } },
			{ safe: true, upsert: true }, function(err, pa) {
				if (err) {
					sendError(res, err);
				} else {
					res.status(STATUS_OK).send({
						msg: '',
						pitch: pitch.toObject()
					});
				}
			});
		}
	});
});

module.exports = router;
