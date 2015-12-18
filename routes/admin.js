var express = require('express');
var router = express.Router();
var parser = require('fast-csv');

// ---------------------------------------- Constants
var STATUS_OK = 200;
var STATUS_ERROR = 500;

// a map from handedness to numerical entry
var HANDEDNESS_MAP = {
	r : 0,
	l : 1,
	s : 2
}

// a map from position to numerical entry
var POSITION_MAP = {
	'p'   : 1,
	'lhp' : 1,
	'rhp' : 1,
	'c'   : 2,
	'1b'  : 3,
	'2b'  : 4,
	'3b'  : 5,
	'ss'  : 6,
	'lf'  : 7,
	'cf'  : 8,
	'rf'  : 9,
	'inf' : 10,
	'of'  : 11
}

// the fields of the player schema required for the roster upload
var ROSTER_FIELDS = ['name', 'number', 'position',
	'height', 'weight', 'bat-hand', 'throw-hand' ];

// ---------------------------------------- Render
/* GET admin page. */
router.get('/', function(req, res, next) {
  res.render('admin', {});
});

// ---------------------------------------- Users
/* GET all users. */
router.get('/user/list', function(req, res, next) {
	req.models.User.find({}, function(err, users) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else {
			res.json(users);
		}
	});
});

/* POST a user. */
router.post('/user/create', function(req, res, next) {
	// only one user for each name
	req.models.User.findOne({ name: req.body.name }, function(err, user) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else if (user) {
			res.status(STATUS_ERROR).send({ msg: req.body.name + ' has already been taken' });
		} else {
			// create a user
			new req.models.User(req.body).save(function(err, user) {
				if (err) {
					res.status(STATUS_ERROR).send({ msg: err });
				} else {
					res.status(STATUS_OK).send({
						msg  : '',
						user : user
					});
				}
			});
		}
	});
});

/* POST a user edit. */
router.post('/user/edit/:id', function(req, res, next) {
	var update = { $set : { name : req.body.name, password : req.body.password } };
	req.models.User.findByIdAndUpdate(req.params.id, update, function(err, user) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else {
			res.status(STATUS_OK).send({
				msg  : '',
				user : user
			});
		}
	});
});

/* DELETE a user */
router.delete('/user/delete/:id', function(req, res, next) {
	req.models.User.findByIdAndRemove(req.params.id, function(err, user) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else {
			res.status(STATUS_OK).send('Successfully deleted ' + user.name);
		}
	});
});

// ---------------------------------------- Teams
/* GET all teams. */
router.get('/team/list', function(req, res, next) {
	req.models.Team.find({}, function(err, teams) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else {
			res.json(teams);
		}
	});
});

/* GET all players associated with a team. */
router.get('/team/:id/players', function(req, res, next) {
	req.models.Team.findById(req.params.id, function(err, team) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else {
			// if no players, return an empty array
			if (!team.players.length) {
				res.status(STATUS_OK).send([]);
			}

			var players = [];
			// for each player find the data associated with their _id
			for (var i = 0; i < team.players.length; i++) {
				req.models.Player.findById(team.players[i], function(err, player) {
					if (err) {
						res.status(STATUS_ERROR).send({ msg: err });
					} else {
						// add the player to the array and return if all player data is found
						players.push(player);
						if (players.length === team.players.length) {
							// return the array of player data
							res.status(STATUS_OK).send(players);
						}
					}
				});
			}
		}
	});
});

/* POST a new team. */
router.post('/team/create', function(req, res, next) {
	// only one team for each school or abbreviation
	var query = { $or: [{ school: req.body.school }, {abbreviation: req.body.abbreviation}] };
	req.models.Team.findOne(query, function(err, team) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else if (team) {
			res.status(STATUS_ERROR).send({ msg: 'The school and/or abbreviation is already taken' });
		} else {
			// create a user
			new req.models.Team(req.body).save(function(err, team) {
				if (err) {
					res.status(STATUS_ERROR).send({ msg: err });
				} else {
					res.status(STATUS_OK).send({
						msg  : '',
						team : team
					});
				}
			});
		}
	});
});

/* POST a full team roster. */
router.post('/team/roster/:id', function(req, res, next) {
	var numPlayers = 0;
	var players = [];
	parser.fromString(req.body.data, {headers: true})
		.validate(function(data) {
			for (var i = 0; i < ROSTER_FIELDS.length; i++) {
				if (!data.hasOwnProperty(req.body.headers[ROSTER_FIELDS[i]])) {
					return false;
				}
			}
			return true;
		}).on('data-invalid', function(data) {
			res.status(STATUS_ERROR).send({
				msg : 'A .csv header was given incorrectly.'
			});
		}).on('data', function(data) {
			numPlayers++;
			var player = { team : req.params.id };
			for (var i = 0; i < ROSTER_FIELDS.length; i++) {
				player[ROSTER_FIELDS[i]] = data[req.body.headers[ROSTER_FIELDS[i]]];
			}

			// map from textual data to numerical data for handedness, position, and height
			player['bat-hand'] = HANDEDNESS_MAP[player['bat-hand'][0].toLowerCase()];
			player['throw-hand'] = HANDEDNESS_MAP[player['throw-hand'][0].toLowerCase()];
			player['position'] = player['position'].split('/');
			for (var i = 0; i < player['position'].length; i++) {
				player['position'][i] = POSITION_MAP[player['position'][i].toLowerCase()];
			}
			// 12 times the number of feet plus the number of inches,
			// under the assumption of height in the form "5-10" or "5'10" 
			player['height'] = parseInt(player['height'].match(/^\d/)) * 12 +
				parseInt(player['height'].match(/\d*$/));
			// save the player to the database
			new req.models.Player(player).save(function(err, player) {
				if (err) {
					res.status(STATUS_ERROR).send({ msg: err });
				} else {
					// push the new player into the players list of their team
					var update = { $push: { 'players' : player } };
					req.models.Team.findByIdAndUpdate(player.team, update, function(err, team) {
						if (err) {
							res.status(STATUS_ERROR).send({ msg: err });
						} else {
							players.push(player);
							if (players.length === numPlayers) {
								res.status(STATUS_OK).send({
									msg     : 'roster successfully uploaded',
									players : players
								});
							}
						}
					});
				}
			});
		});
});

/* POST a team edit. */
router.post('/team/edit/:id', function(req, res, next) {
	var update = { $set : { school : req.body.school, mascot : req.body.mascot, abbreviation : req.body.abbreviation } };
	req.models.Team.findByIdAndUpdate(req.params.id, update, function(err, team) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else {
			res.status(STATUS_OK).send({
				msg  : '',
				team : team
			});
		}
	});
});

/* DELETE a team */
router.delete('/team/delete/:id', function(req, res, next) {
	req.models.Team.findByIdAndRemove(req.params.id, function(err, team) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else {
			if (!team.players.length) {
				res.status(STATUS_OK).send('Successfully deleted ' + team.school);
			}

			// delete all references to this team in each of its players
			var countDeleted = 0;
			var update = { $unset: { team: '' }};
			for (var i = 0; i < team.players.length; i++) {
				req.models.Player.findByIdAndUpdate(team.players[i], update, function(err, player) {
					if (err) {
						res.status(STATUS_ERROR).send({ msg: err });
					} else if (++countDeleted === team.players.length) {
						res.status(STATUS_OK).send('Successfully deleted ' + team.school);
					}
				});
			}
		}
	});
});


// ---------------------------------------- Players
/* GET all players. */
router.get('/player/list', function(req, res, next) {
	req.models.Player.find({}, function(err, players) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else {
			res.json(players);
		}
	});
});

/* POST a new player. */
router.post('/player/create', function(req, res, next) {
	new req.models.Player(req.body).save(function(err, player) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else {
			// push the new player into the players list of their team
			var update = { $push: { 'players' : player } };
			req.models.Team.findByIdAndUpdate(player.team, update, function(err, team) {
				if (err) {
					res.status(STATUS_ERROR).send({ msg: err });
				}
			});

			res.status(STATUS_OK).send({
				msg    : '',
				player : player
			});
		}
	});
});

/* DELETE all players */
router.delete('/player/delete/all', function(req, res, next) {
	req.models.Player.remove({}, function(err, players) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else {
			// remove players from all teams
			req.models.Team.find({}, function(err, teams) {
				var count = 0;
				if (err) {
					res.status(STATUS_ERROR).send({ msg: err });
				} else {
					// set the players array to empty in each team
					var update = { $set : { 'players' : [] } };
					for (var i = 0; i < teams.length; i++) {
						req.models.Team.findByIdAndUpdate(teams[i]._id, update, function(err, team) {
							if (err) {
								res.status(STATUS_ERROR).send({ msg: err });
							} else {
								if (++count === teams.length) {
									res.status(STATUS_OK).send({ msg: 'All players have been deleted' });
								}
							}
						});
					}
				}
			});
		}
	});
});

/* POST a player edit. */
router.post('/player/edit/:id', function(req, res, next) {
	var update = { $set : req.body };
	req.models.Player.findByIdAndUpdate(req.params.id, update, function(err, player) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else {
			res.status(STATUS_OK).send({
				msg    : '',
				player : player
			});
		}
	});
});

/* DELETE a player */
router.delete('/player/delete/:id', function(req, res, next) {
	req.models.Player.findByIdAndRemove(req.params.id, function(err, player) {
		if (err) {
			res.status(STATUS_ERROR).send({ msg: err });
		} else {
			// pull the deleted player from the players list of their team
			var update = { $pull: { 'players' : player._id } };
			req.models.Team.findByIdAndUpdate(player.team, update, function(err, team) {
				if (err) {
					res.status(STATUS_ERROR).send({ msg: err });
				}
			});

			res.status(STATUS_OK).send('Successfully deleted ' + player.name);
		}
	});
});

module.exports = router;
