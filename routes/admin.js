var express = require('express');
var router = express.Router();

// ---------------------------------------- Constants
var STATUS_OK = 200;
var STATUS_ERROR = 500;

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
			res.status(STATUS_OK).send('Successfully deleted ' + team.school);
		}
	});
});

module.exports = router;
