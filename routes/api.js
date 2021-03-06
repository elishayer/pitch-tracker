/* Pitch Tracker
 * api.js
 * -------------
 * Defines all GET and POST methods used in the Pitch Tracker,
 * serving as a RESTful API
 */

var express = require('express');
var router = express.Router();

// ---------------------------------------- HTTP Status Codes
var STATUS_OK = 200;
var STATUS_CLIENT_ERR = 400;
var STATUS_UNAUTHORIZED = 401;
var STATUS_SERVER_ERR = 500;

// ---------------------------------------- Helper Functions

// sends an error response, log the location of the error
function sendError(res, err, status) {
	console.log('Error: ' + err);
	res.status(status).send({ msg: err });
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
	},
	'/user/create' : {
		name     : 'string',
		password : 'string',
	},
	'/user/login' : {
		name     : 'string',
		password : 'string',
	},
	'/team/list' : {}
}

/*
 * middleware to validate objects by ensuring that each desired key is contained
 * in the object, and that the type of each value matches expectation
 */
/*
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
		res.status(STATUS_CLIENT_ERR).send({
			msg: 'The following data is missing: ' + missingKeys.join(', ')
		});
	}

	// if the number of keys in the body does not match that of the validation object
	if (Object.keys(req.body).length !== validationKeys.length) {
		res.status(STATUS_CLIENT_ERR).send({
			msg: 'The number of elements in the request does not match expectation'
		});
	}

	// otherwise, proceed to the next relevant router function
	next();
 });*/

// ---------------------------------------- Plate appearances

/* POST a new plate appearance */
router.post('/addpa', function(req, res) {
	new req.models.PA(req.body).save(function(err, pa) {
		if (err) {
			res.status(STATUS_SERVER_ERR).send({msg: err});
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
			res.status(STATUS_SERVER_ERR).send({msg: err});
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
			res.status(STATUS_SERVER_ERR).send({msg: err});
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
					res.status(STATUS_SERVER_ERR).send({msg: err});
				} else {
					res.status(STATUS_OK).send({ msg: '' });
				}
			});
		}
	});
});

// ---------------------------------------- User
/* POST a new user */
router.post('/user/create', function(req, res) {
	// only one user for each name
	req.models.User.findOne({ name: req.body.name }, function(err, user) {
		if (err) {
			res.status(STATUS_SERVER_ERR).send({msg: err});
		} else if (user) {
			res.status(STATUS_CLIENT_ERR).send({msg: req.body.name + ' has been taken'});
		} else {
			// create a user
			new req.models.User(req.body).save(function(err, user) {
				if (err) {
					res.status(STATUS_SERVER_ERR).send({msg: err});
				} else {
					// set the session and return the user
					req.session.user = user;
					res.status(STATUS_OK).send({
						msg  : '',
						user : user
					});
				}
			});
		}
	});
});

/* POST in order to log in */
router.post('/user/login', function(req, res) {
	var query = { name: req.body.name, password: req.body.password};
	req.models.User.findOne(query, function(err, user) {
		if (err) {
			res.status(STATUS_SERVER_ERR).send({msg: err});
		} else if (!user) {
			// if the login attempt failed (no such user found)
			res.status(STATUS_UNAUTHORIZED).send({msg: 'Incorrect username or password'});
		} else {
			// set the session and return the user
			req.session.user = user;
			res.status(STATUS_OK).send({
				msg  : '',
				user : user
			});
		}
	});
});

// ---------------------------------------- Team
/* GET the list of all teams. */
router.get('/team/list', function(req, res) {
	req.models.Team.find({}, function(err, teams) {
		if (err) {
			res.status(STATUS_SERVER_ERR).send({msg: err});
		} else {
			res.status(STATUS_OK).json(teams);
		}
	});
});

/* GET information about a team and its players. */
router.get('/team/:id/players/list', function(req, res) {
	req.models.Team.findById(req.params.id, function(err, team) {
		if (err) {
			res.status(STATUS_SERVER_ERR).send({msg: err});
		} else {
			// get the full players data for each player id
			var players = [];
			for (var i = 0; i < team.players.length; i++) {
				req.models.Player.findById(team.players[i], function(err, player) {
					if (err) {
						res.status(STATUS_SERVER_ERR).send({msg: err});
					} else {
						players.push(player);
						if (players.length === team.players.length) {
							res.status(STATUS_OK).send({
								team   : team,
								players: players
							});
						}
					}
				});
			}
		}
	});
});

module.exports = router;
