/* Pitch Tracker
 * api.js
 * -------------
 * Defines all GET and POST methods used in the Pitch Tracker,
 * serving as a RESTful API
 */

var express = require('express');
var router = express.Router();

// ---------------------------------------- Plate Appearance

/* POST a new plate appearance */
router.post('/addpa', function(req, res) {
	console.log('adding a pa');
	var pa = new req.models.PA({
		// start date by default
		// TODO: game by id
		// TODO: pitcher by id
		// TODO: hitter by id
	});
	console.log('pa created');
	pa.save(function(err, pa) {
		if (err) {
			return console.error(err);
		} else {
			res.send((err === null) ? { msg: '', id: pa._id } : { msg: 'error: ' + err });
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
			return console.error(err);
		} else {
			// TODO: add pitch to the pitches array of the corresponding pa

		}
	});
});

/* DELETE a pitch. */
router.delete('/deletepitch/:id', function(req, res) {
	// TODO: delete pitch and update corresponding plate appearance
});

module.exports = router;
