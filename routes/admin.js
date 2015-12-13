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
					// set the session user
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


module.exports = router;
