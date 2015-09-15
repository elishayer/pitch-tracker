/* Pitch Tracker
 * api.js
 * -------------
 * Defines all GET and POST methods used in the Pitch Tracker,
 * serving as a RESTful API
 */

var express = require('express');
var router = express.Router();

// ---------------------------------------- Pitch

// pitches collection constant
var PITCH_COLLECTION = 'pitches';

/* GET all pitches. */
router.get('/pitchlist', function(req, res) {
	req.models.Pitch.find({}, function(err, pitches) {
		console.log(pitches);
	});
});

/* POST a new pitch. */
router.post('/addpitch', function(req, res) {
	var pitch = new req.models.Pitch({
		type       : req.body.type,
		velocity   : req.body.velocity,
		result     : req.body.result,
		xLoc       : req.body.xLoc,
		yLoc       : req.body.yLoc
	});
	pitch.save(function(err, pitch) {
		if (err) {
			return console.error(err);
		}
	});
});

/* DELETE a pitch. */
router.delete('/deletepitch/:id', function(req, res) {
	var db = req.db;
	var collection = db.get(PITCH_COLLECTION);
	var pitchToDelete = req.params.id;
	collection.remove({ '_id' : pitchToDelete }, function (err) {
		res.send((err === null) ? { msg: '' } : { msg: 'error: ' + err });
	});
});

module.exports = router;
