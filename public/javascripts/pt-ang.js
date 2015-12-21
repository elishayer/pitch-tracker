/* pt-ang.js
 * Eli Shayer
 * ----------
 * The Angular module and controller for the pitch tracker application
 * Uses the AngularUI Bootstrap dependency
 */

angular.module('ptApp', ['ui.bootstrap']).controller('ptController', function($scope, $http, $uibModal) {
	// initialize the view, error, and user variables
	// initialize to viewing the login section, no error, empty user
	$scope.view = { section: 'login' };
	$scope.error = null;
	$scope.user = {};

	// initialize the constants
	$scope.const = getPtConstants();

	$scope.sections = {
		login  : {
			text    : 'Sign in, create an account, or log in as a guest',
			show    : function() { return $scope.view.section === 'login'; },
			buttons : [
				{ text : 'Sign In', class: 'primary', url  : '/api/user/login' },
				{ text : 'Create An Account', class: 'success', url  : '/api/user/create' },
				{ text : 'Use as Guest', class: 'warning' }
			],
			fields  : [
				{ name: 'name', type: 'text', value: '' },
				{ name: 'password', type: 'password', value: '' }
			],
			disabled: function() {
				for (var i = 0; i < this.fields.length; i++) {
					if (!this.fields[i].value.length) {
						return true;
					}
				}
				return false;
			},
			submit  : function(index) {
				// index argument refers to index in buttons array
				if (index === 0 || index === 1) {
					// construct the body: a form with input for each field
					var body = '<div class="form-group" ng-repeat="field in data.fields">' +
						'<label for="{{ &#39;accountForm&#39; + field.name }}" ' +
						'ng-bind="field.name"></label>' +
						'<input class="form-control" ' +
						'id="{{ &#39;accountForm&#39; + field.name }}" ' +
						'type="{{ field.type }}" placeholder="{{ field.name }}" ' +
						'ng-model="result[field.name]"</input>';

					// set the modal data to be the fields and disabled helper
					$scope.modal = { fields: this.fields, disabled: this.disabled };
					$scope.openModal(this.buttons[index].text, body, 'Submit', 'Cancel',
						function(result) {
							$http.post($scope.sections.login.buttons[index].url, result).then(
								function(response) {
									// store the user and set the view to session
									$scope.user = response.data.user;
									$scope.util.setSection('session');
								}, function(response) {
									$scope.error = response.data.msg;
								}
							);
						}
					);
				} else {
					// TODO: guest log in (API call)
					$scope.user.name = 'guest';
					$scope.util.setSection('session');
				}
			}
		},
		session: {
			text   : function() {
				return 'Hi ' + $scope.user.name + ', please select a session type:';
			},
			show   : function() { return $scope.view.section === 'session'; },
			buttons: [
				{ text: 'Game' },
				{ text: 'Practice (Pitchers and Hitters)' },
				{ text: 'Bullpen (Pitchers only)' }
			],
			submit : function(index) {
				// set the session type TODO: API call to initialize a session
				$scope.session = index;
				// set the next view (lineup for game or practice, input for bullpen)
				if (index === $scope.const.GAME || index === $scope.const.PRACTICE) {
					$scope.util.setSection('lineup');
				} else {
					$scope.util.setSection('input');
				}
			}
		},
		lineup  : {
			text   : function() { return 'Please enter the lineups.'; },
			show   : function() { return $scope.view.section === 'lineup'; },
			fields : {
				teams    : function() {
					if ($scope.session === $scope.const.GAME) {
						return ['home', 'away'];
					} else {
						return ['home', 'away'];
					}
				},
				positions: ['P', 'C', '1B', '2B', 'SS', '3B', 'LF', 'CF', 'RF', 'DH'],
			},
			setter : function() {
				$http.get('/api/team/list').then(function(response) {
					// store team data
					$scope.sections.lineup.teams = response.data;

					// initialize variables to empty strings
					$scope.sections.lineup.data = {}
					var teams = $scope.sections.lineup.fields.teams();
					var positions = $scope.sections.lineup.fields.positions;
					teams.forEach(function(team) {
						$scope.sections.lineup.data[team] = { lineup: {} };
						positions.forEach(function(position) {
							$scope.sections.lineup.data[team].lineup[position] = {
								player: '',
								hole  : '',
							};
						});
					});

					// initialize the submitted variable to false
					$scope.sections.lineup.teamsSubmitted = false;
				}, function(response) {
					$scope.error = 'Failure to request the list of teams';
				});
			},
			submit : {
				// select which submit method to use
				getMethod: function() {
					// if nothing has been submitted
					if (!$scope.sections.lineup.teamsSubmitted) {
						return this.teams;
					// if team has been submitted but the lineup hasn't
					} else if (!$scope.sections.lineup.lineupsSubmitted) {
						return this.lineups;
					// if the lineup and team have both been submitted
					} else {
						return this.order;
					}
				},
				teams  : function() {
					// get the list of players for each team
					var teams = $scope.sections.lineup.fields.teams();

					// validate for teams being given and being distinct
					var map = {};
					var isFilled = true;
					teams.forEach(function(team) {
						map[team] = $scope.sections.lineup.data[team].team;
						isFilled = isFilled && $scope.sections.lineup.data[team].team;
					});

					if (!isFilled) {
						$scope.error = 'All teams must be entered';
					} else if (!$scope.util.isUnique(map)) {
						$scope.error = 'The teams must be distinct';
					} else {
						$scope.error = null;
						// get the team data and data for the players on the teams
						teams.forEach(function(team) {
							var url = '/api/team/' + $scope.sections.lineup.data[team].team +
								'/players/list';
							$http.get(url).then(function(response) {
								// store the data without overwriting previous keys
								for (key in response.data) {
									$scope.sections.lineup.data[team][key] = response.data[key];	
								}
							}, function(response) {
								$scope.error = 'Failure to request players in the team';
							});
						});
						// mark the teams as submitted so that players can be entered
						$scope.sections.lineup.teamsSubmitted = true;
					}
				},
				lineups: function() {
					var teams = $scope.sections.lineup.fields.teams();
					// validate for no repeats and all positions filled
					// uniqueLineups' value indicates whether the lineup(s) are unique
					// positionsFilled's value indicates whether all positions are filled
					var uniqueLineups = true;
					var positionsFilled = true;

					teams.forEach(function(team) {
						var lineup = $scope.sections.lineup.data[team].lineup;
						// reduce lineup to map from position to name for uniqueness check
						var map = {};
						for (position in lineup) {
							map[position] = lineup[position].player;
							// simultaneous keep track of whether all positions are filled
							positionsFilled = positionsFilled && map[position];
						}
						uniqueLineups = uniqueLineups && $scope.util.isUnique(map);
					});

					if (!positionsFilled) {
						$scope.error = 'All positions in the lineup must be filled';
					} else if (!uniqueLineups) {
						$scope.error = 'Lineups cannot have duplicate players';
					} else {
						// replace the player id with a full player object
						teams.forEach(function(team) {
							var lineup = $scope.sections.lineup.data[team].lineup;
							for (position in lineup) {
								lineup[position].player = $scope.util.findById(
									$scope.sections.lineup.data[team].players,
									lineup[position].player);
							}
						});

						// delete any errors and mark the lineup as submitted
						$scope.error = null;
						$scope.sections.lineup.lineupsSubmitted = true;
					}
				},
				order  : function() {
					// validation that there are no blanks and no duplicates
					var teams = $scope.sections.lineup.fields.teams();

					var uniqueHoles = true;
					var holesFilled = true;

					teams.forEach(function(team) {
						var lineup = $scope.sections.lineup.data[team].lineup;
						// reduce lineup to map from position to hole for uniqueness check
						var map = {};
						for (position in lineup) {
							map[position] = lineup[position].hole;
							// simultaneous keep track of whether all holes are filled
							holesFilled = holesFilled && (map[position] || position === 'P');
						}
						uniqueHoles = uniqueHoles && $scope.util.isUnique(map);
					});

					if (!holesFilled) {
						$scope.error = 'All holes must contain a player';
					} else if (!uniqueHoles) {
						$scope.error = 'There cannot be multiple players in the same hole';
					} else {
						// change the lineup structure
						// previous: map from position to player and hole
						// new: map from hole to array of player and position combinations
						// the array is used so that lineup changes can be recorded
						teams.forEach(function(team) {
							var prev = $scope.sections.lineup.data[team].lineup;
							// initialize the new lineup array
							$scope.lineup = [];
							for (position in prev) {
								// push each position in to the new lineup array
								$scope.lineup.push([{
									player  : prev[position].player,
									position: $scope.const.POS_TO_NUM[position],
									hole    : parseInt(prev[position].hole)
								}]);
							}
							// sort the lineup array by hole order, with the pitcher
							// in the first spot (and thus the ith hitter in the ith index)
							$scope.lineup.sort(function(a, b) {
								if ($scope.const.NUM_TO_POS[a[0].position] === 'P') {
									return -1;
								} else if ($scope.const.NUM_TO_POS[b[0].position] === 'P') {
									return 1;
								} else if (a[0].hole < b[0].hole) {
									return -1;
								} else if (a[0].hole > b[0].hole) {
									return 1;
								} else {
									return 0;
								}
							});
							// change the section to input
							$scope.util.setSection('input');
						});
					}
				}
			},
			getPlayerOptions: function(team, position) {
				// guard against undefined data object
				if ($scope.sections.lineup.data && $scope.sections.lineup.data[team].players) {
					// filter to only the relevant players for each position
					return $scope.sections.lineup.data[team].players.filter(function(player) {
						// anyone can be a DH
						return position === 'DH' ||
							// an exact match to the position
							$scope.util.includes(player.position, $scope.const.POS_TO_NUM[position]) ||
							// 'INF' works for all four infield positions
							($scope.util.includes(player.position, $scope.const.POS_TO_NUM['INF']) &&
 								(position === '1B' || position === '2B' ||
 								 position === '3B' || position === 'SS')) ||
							// 'OF' works for all three outfield positions
							($scope.util.includes(player.position, $scope.const.POS_TO_NUM['OF']) &&
								(position === 'LF' || position === 'CF' || position === 'RF'));
					});
				} else {
					return '';
				}
			},
			// return an array of 1 to 9 for lineup holes
			getLineupHoles  : function() {
				var arr = [];
				for (var i = 1; i <= 9; i++) {
					arr.push(i);
				}
				return arr;
			},
			// gets the table caption depending on the current state of the lineup process
			getTableCaption : function() {
				// if nothing has been submitted
				if (!$scope.sections.lineup.teamsSubmitted) {
					return 'Please select the teams for the session';
				// if team has been submitted but the lineup hasn't
				} else if (!$scope.sections.lineup.lineupsSubmitted) {
					return 'Please select the players for each position';
				// if the lineup and team have both been submitted
				} else {
					return 'Please select which hole each player will occupy';
				}
			},
			// get the text for the button
			getButtonText  : function() {
				// if nothing has been submitted
				if (!$scope.sections.lineup.teamsSubmitted) {
					return 'Submit Teams';
				// if team has been submitted but the lineup hasn't
				} else if (!$scope.sections.lineup.lineupsSubmitted) {
					return 'Submit Lineups';
				// if the lineup and team have both been submitted
				} else {
					return 'Submit Orders';
				}
			}
		},
		input   : {
			show  : function() { return $scope.view.section === 'input'; },
			setter: function() {
				// set the pitch tracker graphics
				ptGraphics.setConstants($scope.const);
				ptGraphics.callFunctions();
			}
		}
	};

	// utility functions
	$scope.util = {
		// get the team name in a textual format
		getTeamName  : function(team) { return team.school + ' ' + team.mascot; },
		// switch the section and call the setter if applicable
		setSection   : function(section) {
			// guard against bad setting call by confirming the section exists
			if ($scope.sections[section]) {
				// clear the error
				$scope.error = null;
				
				// if there is a setter function, call it
				if ($scope.sections[section].setter) {
					$scope.sections[section].setter();
				}

				// change the view after the setter has been called if applicable
				$scope.view.section = section;
			}
		},
		// textual player identifier with name and number
		getPlayerName: function(player) {
			return player.name + ' (' + player.number + ')';
		},
		// test whether an array includes an element
		// converts all to strings for common type
		includes     : function(arr, elem) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] + '' === elem + '') {
					return true;
				}
			}
			return false;
		},
		// predicate method for whether an object contains at most one of each value
		isUnique     : function(obj) {
			var map = {};
			for (key in obj) {
				if (map[obj[key]]) {
					return false;
				} else {
					map[obj[key]] = true;
				}
			}
			return true;
		},
		findById    : function(arr, id) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i]._id === id) {
					return arr[i];
				}
			}
			return null;
		}
	};

	// helper for whether the player data is complete
	$scope.isPlayerDataComplete = function() {
		return $scope.curr.hitter.length && $scope.curr.pitcher.length;
	}

	// listener for submitting the players
	$scope.playerListener = function() {
		if ($scope.isPlayerDataComplete()) {
			// push the input to the curr.pa object
			$scope.curr.pa.hitter = $scope.curr.hitter;
			$scope.curr.pa.pitcher = $scope.curr.pitcher;

			// clear the hitter and pitcher inputs
			$scope.curr.hitter = $scope.curr.pitcher = '';

			// create a mongoDB object for the new pa
			$http.post('/api/addpa', {
				hitter  : $scope.curr.pa.hitter,
				pitcher : $scope.curr.pa.pitcher
			}).then(function(response) {
				// store the mongoDB pa _id for the db object
				$scope.curr.pa._id = response.data.pa;

				// change the input view to the pitch input
				$scope.ptInputView = PITCH_INPUT_GROUP;
			}, function(response) {
				console.log(response);
				$scope.error = true;
			});
		} else {
			$scope.error = true;
		}
	}

	// listener for clicks on the zone, converts the event to a pitch location
	// in the range [0, 1] for both horizontal and vertical components such that
	// (x, y) is a pitch with horizontal component x and vertical component y.
	// (0, 0) is the top left corner and (1, 1) is the bottom right corner, with
	// left-right defined from the catcher perspective.
	$scope.zoneClickListener = function(event) {
		var boundRect = document.getElementById('zone').getBoundingClientRect();
		$scope.curr.pitch.location.horizontal =
			(event.clientX - boundRect.left) / (boundRect.right - boundRect.left);
		$scope.curr.pitch.location.vertical =
			(event.clientY - boundRect.top) / (boundRect.bottom - boundRect.top);
	}

	// get x and y pixel locations based on a pitch location
	$scope.getPitchX = function(pitch) {
		var boundRect = document.getElementById('zone').getBoundingClientRect();
		return pitch.location.horizontal * (boundRect.right - boundRect.left);
	}
	$scope.getPitchY = function(pitch) {
		var boundRect = document.getElementById('zone').getBoundingClientRect();
		return pitch.location.vertical * (boundRect.bottom - boundRect.top);
	}

	// get the color of a pitch based on its result
	$scope.getPitchColor = function(pitch) {
		switch (pitch.result) {
			case $scope.const.BALL:
				return $scope.const.BALL_COLOR;
			case $scope.const.SWINGING_STRIKE:
			case $scope.const.CALLED_STRIKE:
			case $scope.const.FOUL:
			case $scope.const.FOUL_TIP:
				return $scope.const.STRIKE_COLOR;
			case $scope.const.IN_PLAY:
				return $scope.const.IN_PLAY_COLOR;
			default:
				$scope.error = true;
				console.error('Unexpected pitch result');
				return "#ffffff";
		}
	}

	// helper for whether the pitch data is complete
	$scope.isPitchDataComplete = function() {
		return parseInt($scope.curr.pitch.type) &&
			parseInt($scope.curr.pitch.velocity) > 0 &&
			parseInt($scope.curr.pitch.result) &&
			$scope.curr.pitch.location.horizontal >= 0 &&
			$scope.curr.pitch.location.horizontal <= 1 &&
			$scope.curr.pitch.location.vertical >= 0 &&
			$scope.curr.pitch.location.vertical <= 1;
	}

	// listener for submitting a pitch
	$scope.pitchListener = function() {
		if ($scope.isPitchDataComplete()) {
			// get the pitch data from the inputs, ensuring correct typing
			var pitch = {
				location : $scope.curr.pitch.location,
				type     : parseInt($scope.curr.pitch.type),
				velocity : $scope.curr.pitch.velocity,
				result   : parseInt($scope.curr.pitch.result)
			};

			// intialize a new pitch
			$scope.initializePitch();

			// push the pitch into the pa pitch array
			$scope.curr.pa.pitches.push(pitch);

			// store the pitch object in mongoDB
			$http.post('/api/addpitch', {
				pa       : $scope.curr.pa._id,
				type     : pitch.type,
				velocity : pitch.velocity,
				result   : pitch.result,
				xLoc     : pitch.location.horizontal,
				yLoc     : pitch.location.vertical,
				// balls and strikes before the pitch (i.e. first of pa will be 0-0)
				balls    : $scope.curr.pa.balls,
				strikes  : $scope.curr.pa.strikes,
				// first pitch is 1, etc.
				pitchNum : $scope.curr.pa.pitches.length
			}).then(function(response) {
				// adjust the number of balls and strikes
				if (pitch.result === $scope.const.BALL) {
					$scope.curr.pa.balls++;
				} else if (pitch.result === $scope.const.CALLED_STRIKE ||
							pitch.result === $scope.const.SWINGING_STRIKE ||
							pitch.result === $scope.const.FOUL_TIP ||
							(pitch.result === $scope.const.FOUL &&
								$scope.curr.pa.strikes < $scope.const.STRIKES_PER_K - 1)) {
					$scope.curr.pa.strikes++;
				}

				// set the plate appearance result if applicable
				if ($scope.curr.pa.strikes === $scope.const.STRIKES_PER_K) {
					$scope.submitPaResult($scope.const.STRIKEOUT);
				} else if ($scope.curr.pa.balls === $scope.const.BALLS_PER_BB) {
					$scope.submitPaResult($scope.const.WALK);
				}

				// if the ball was put in play switch to the result input view
				if (pitch.result === $scope.const.IN_PLAY) {
					$scope.ptInputView = $scope.const.RESULT_INPUT_GROUP;
				}
			}, function(response) {
				$scope.error = true;
			});
		} else {
			$scope.error = true;
		}
	}

	// helper for whether the pa result data is complete
	$scope.isResultDataComplete = function() {
		return parseInt($scope.curr.pa.result);
	}

	// listener for submitting a pa result
	$scope.resultListener = function() {
		if ($scope.isResultDataComplete()) {
			// submit the result from the input and then clear the input
			$scope.submitPaResult(parseInt($scope.curr.pa.result));
			$scope.curr.pa.result = '0';
		} else {
			$scope.error = true;
		}
	}

	// finalize the plate appearance result
	$scope.submitPaResult = function(result) {
		// the pa data to store in the browser
		var pa = {
			hitter  : $scope.curr.pa.hitter,
			pitcher : $scope.curr.pa.pitcher,
			balls   : $scope.curr.pa.balls,
			strikes : $scope.curr.pa.strikes,
			pitches : $scope.curr.pa.pitches,
			result  : result,
			_id     : $scope.curr.pa._id
		};

		// the subset of the data to send to the datqbase
		var data = {
			result : pa.result,
			_id    : pa._id
		}

		// Submit the PA result to mongoDB
		$http.post('/api/finalizepa', data).then(function(response) {
			// initialize a new plate appearance
			$scope.initializePa();

			// push the pa into the inning pa array
			$scope.curr.inning.pas.push(pa);

			// determine whether outs need to added
			if (pa.result === $scope.const.STRIKEOUT || pa.result === $scope.const.IN_PLAY_OUT) {
				$scope.incrementOut();
			}

			// propogate base changes as needed
			$scope.advanceBaserunners(pa.hitter, result);

			// reset the view to the player selector
			$scope.ptInputView = $scope.const.PLAYER_INPUT_GROUP;
		}, function(response) {
			$scope.error = true;
		});

	}

	// advanecs baserunners as needed based on the plate appearance result
	$scope.advanceBaserunners = function(hitter, result) {
		switch(result) {
			case $scope.const.WALK:
			case $scope.const.HIT_BY_PITCH:
				$scope.implementWalk(hitter);
				break;
			case $scope.const.SINGLE:
			case $scope.const.DOUBLE:
			case $scope.const.TRIPLE:
			case $scope.const.HOME_RUN:
				$scope.incrementHit(hitter);
			case $scope.const.IN_PLAY_OUT:
				$scope.implementInPlay(hitter, result);
				break;
		}
	}

	// implements a walk or a hit by pitch
	$scope.implementWalk = function(hitter) {
		if ($scope.bases[$scope.const.FIRST_BASE]) {
			if ($scope.bases[$scope.const.SECOND_BASE]) {
				if ($scope.bases[$scope.const.THIRD_BASE]) {
					$scope.incrementRun($scope.bases[$scope.const.THIRD_BASE])
				}
				$scope.bases[$scope.const.THIRD_BASE] = $scope.bases[$scope.const.SECOND_BASE];
			}
			$scope.bases[$scope.const.SECOND_BASE] = $scope.bases[$scope.const.FIRST_BASE];
		}
		$scope.bases[$scope.const.FIRST_BASE] = hitter;
	}

	// implements ball in play, including asking the user for baserunner advancement
	// uses the fact that the pa result code for a single is 1, double is 2, etc.
	$scope.implementInPlay = function(hitter, result) {
		// if HR score the hitter, otherwise place on base
		if (result === $scope.const.HOME_RUN) {
			for (var base = $scope.const.FIRST_BASE; base <= $scope.const.THIRD_BASE; base++) {
				if ($scope.bases[base]) {
					$scope.incrementRun($scope.bases[base]);
				}
			}
			$scope.incrementRun(hitter);
		} else {
			// if in play, ask the user for advancement data for each occupied base
			for (var base = $scope.const.THIRD_BASE; base >= $scope.const.FIRST_BASE; base--) {
				if ($scope.bases[base]) {
					$scope.enqueueModal($scope.bases[base], base, false);
				}
			}

			// add the hitter to the bases 
			$scope.enqueueModal(hitter, result - 1, true, result !== $scope.const.IN_PLAY_OUT);
		}
	}

	// enqueue an additional baserunning enquiry to pose to the user via a modal
	$scope.enqueueModal = function(runner, original, isHitter, isHit) {
		// enqueue a baserunning enquiry
		$scope.modalQueue.push({
			runner   : runner,
			original : original,
			isHitter : isHitter,
			isHit    : isHit
		});

		// show the modal, which continues in a chain as required
		$scope.showModal();
	}

	// generate the contents for and show a single modal
	$scope.showModal = function() {
		// set the title and body
		$('#modal-title').text($scope.generateModalTitle());
		$('#modal-body').text($scope.generateModalBody());

		// disabled buttons as appropriate
		//$('.modal-footer > button').prop('disabled', $scope.isModalButtonDisabled);
		// show the modal and require it be closed by clicking a button
		$('#modal').modal({
			backdrop : 'static',
			keyboard : false
		});
	}

	// generate the text for the body of the modal
	$scope.generateModalTitle = function() {
		return $scope.modalQueue[0].runner + "'s Baserunning";
	}

	// generates the text for the body of the modal
	$scope.generateModalBody = function() {
		if ($scope.modalQueue[0].isHitter) {
			if ($scope.modalQueue[0].isHit) {
				return "After getting to " + $scope.baseToString($scope.modalQueue[0].original) +
					" from their hit, what was " + $scope.modalQueue[0].runner + "'s final destination?";
			} else {
				return "The plate appearance led to an out, but did " + $scope.modalQueue[0].runner +
					" end up on a base anyways?";
			}
		} else {
			return "After starting at " + $scope.baseToString($scope.modalQueue[0].original) +
				", what was " +	$scope.modalQueue[0].runner + "'s final destination?";
		}
	}

	// get a textual base, where 0 -> first, ..., 2 -> third
	$scope.baseToString = function(base) {
		if (base === $scope.const.FIRST_BASE) {
			return "first base";
		} else if (base === $scope.const.SECOND_BASE) {
			return "second base";
		} else if (base === $scope.const.THIRD_BASE) {
			return "third base";
		} else {
			console.error('Home base to string');
			return "home base";
		}
	}

	// listener for buttons clicks within the modal
	$('#modal button').click(function(event) {
		var base = parseInt($(this).val());
		// remove the runner from original base unless the hitter,
		// in which case it has not already been placed yet
		if (!$scope.modalQueue[0].isHitter) {
			$scope.bases[$scope.modalQueue[0].original] = null;
		}

		// if the new base is not 0 (an out)
		if (base) {
			// if home base, count the run
			if (base - 1 === $scope.const.HOME_BASE) {
				$scope.incrementRun($scope.modalQueue[0].runner);
			} else {
				// if first, second, third base, place at that base
				$scope.bases[base - 1] = $scope.modalQueue[0].runner;
			}
		} else {
			// if an out, increment the number of outs
			$scope.incrementOut();
		}

		// ensure that the changes in the scope are propogated to the view
		// TODO: do this with a directive instead of jQuery
		$scope.$apply();

		// hide the modal
		$('#modal').modal('hide');
	});

	// listener for the modal being hidden
	$('#modal').on('hidden.bs.modal', function() {
		// remove the first index of the queue
		$scope.modalQueue = $scope.modalQueue.splice(1);

		// if there are additional enqueued enquiries, display the next one
		if ($scope.modalQueue.length) {
			$scope.showModal();
		}
	});

	// records a run
	$scope.incrementRun = function(player) {
		$scope.innings[$scope.curr.inning.num - 1][!$scope.curr.inning.top * 1].runs++;
	}

	// records a run
	$scope.incrementHit = function(player) {
		$scope.innings[$scope.curr.inning.num - 1][!$scope.curr.inning.top * 1].hits++;
	}

	// add an out to the count, and initialize a new inning if necessary
	$scope.incrementOut = function() {
		$scope.curr.inning.outs++;
		if ($scope.curr.inning.outs === $scope.const.OUTS_PER_INNING) {
			$scope.initializeInning();
		}
	}

	// initialize a new half inning
	$scope.initializeInning = function() {
		// if the inning has not yet been initialized, set to top of the 1st
		if ($scope.curr.inning.uninitialized) {
			$scope.curr.inning.num = 1;
			$scope.curr.inning.top = true;
			$scope.curr.inning.uninitialized = false;
		} else {
			// move forward one half inning
			$scope.curr.inning.top = !$scope.curr.inning.top;
			$scope.curr.inning.num += 1 * $scope.curr.inning.top;
		}
		// if it is the top of a new inning add a inning to the model
		if ($scope.curr.inning.top) {
			$scope.innings.push([ {
				runs   : 0,
				hits   : 0,
				errors : 0
			}, {
				runs   : 0,
				hits   : 0,
				errors : 0
			}]);
		}

		$scope.curr.inning.outs = 0;
		$scope.curr.inning.pas = [];

		// reset the bases to being empty
		$scope.bases = [null, null, null];

		// empty the modalQueue
		$scope.modalQueue = [];
	}

	// initialize a new empty curr pa object
	$scope.initializePa = function() {
		$scope.curr.pa.hitter = $scope.curr.pa.pitcher = '';
		$scope.curr.pa.balls = $scope.curr.pa.strikes = 0;
		$scope.curr.pa.pitches = [];
		$scope.curr.pa.result = '0';
	}

	// initialize a new empty curr pitch object
	$scope.initializePitch = function() {
		$scope.curr.pitch.type = $scope.curr.pitch.result = '0';
		$scope.curr.pitch.velocity = '';
		$scope.curr.pitch.location = {
			horizontal : -1, // data outside the legitimate [0, 1] range
			vertical   : -1
		};
	}

	// generate the message based on the input view and error
	$scope.generateMessage = function() {
		if ($scope.ptInputView === $scope.const.PLAYER_INPUT_GROUP) {
			if ($scope.error) {
				return 'There was an error entering the player data';
			} else {
				return 'Enter the pitcher and the hitter';
			}
		} else if ($scope.ptInputView === $scope.const.PITCH_INPUT_GROUP) {
			if ($scope.error) {
				return 'There was an error entering the pitch data';
			} else {
				return 'Enter the pitch data';
			}
		} else if ($scope.ptInputView === $scope.const.RESULT_INPUT_GROUP) {
			if ($scope.error) {
				return 'There was an error entering the plate appearance result data';
			} else {
				return 'Enter the plate appearance result';
			}
		} else {
			$scope.error = true;
			return 'The view is in an unknown state.';
		}
	}

	// convert the pitch type to text
	$scope.pitchTypeToString = function(type) {
		return $scope.const.PITCH_TYPE_MAP[type];
	}

	// convert the pitch result to text
	$scope.pitchResultToString = function(result) {
		return $scope.const.PITCH_RESULT_MAP[result];
	}

	// convert the pa result to text
	$scope.paResultToString = function(result) {
		return $scope.const.PA_RESULT_MAP[result];
	}

	// get an array of inning numbers to display
	$scope.getInningNums = function() {
		// if in extra innings, extend to that higher
		var numInnings = Math.max($scope.const.MIN_INNINGS, $scope.curr.inning.num);

		return $scope.getRange(numInnings);
	}

	// get a range defined by min, max, and step in an array
	$scope.getRange = function(max, min, step) {
		// default min and step size are both 1
		min = min || 1;
		step = step || 1;
		var range = [];
		for (var i = min; i <= max; i += step) {
			range.push(i);
		}
		return range;
	}

	// predicate method for whether a cell is active
	$scope.isInningActive = function(num, top) {
		return $scope.curr.inning.num === num && $scope.curr.inning.top === top;
	}

	// generates the text for each inning
	$scope.generateInningText = function(num, top) {
		// no text if the the half inning has not occured yet
		if (num > $scope.curr.inning.num || 
				(num === $scope.curr.inning.num && $scope.curr.inning.top && !top) ||
				// or if the current inning does not have any runs
				(num === $scope.curr.inning.num && top === $scope.curr.inning.top &&
				$scope.innings[num - 1][!top * 1].runs === 0)) {
			return '';
		} else {
			return $scope.innings[num - 1][!top * 1].runs;
		}
	}

	// loop across all innings to generate game totals for a general key
	$scope.gameTotals = function(isTop, key) {
		var sum = 0;
		for (var i = 0; i < $scope.innings.length; i++) {
			sum += $scope.innings[i][!isTop * 1][key];
		}
		return sum;
	}

	// ------------------------------------------------ initialization
	$scope.mode = 'game'; // TODO: multiple modes: game, bp, pitching only, etc.
	$scope.error = false; // true if an error is to be displayed
	$scope.message;
	$scope.curr = {
		hitter  : '',
		pitcher : '',
		inning  : { uninitialized: true },
		pa      : {},
		pitch   : {}
	};
	$scope.innings = [];
	$scope.modalQueue = [];
	$scope.ptInputView = $scope.const.PLAYER_INPUT_GROUP;

	// initialize the inning, pa, and pitch objects
	$scope.initializeInning();
	$scope.initializePa();
	$scope.initializePitch();


	// ---------------------------------------------------- Modal
	// TODO: refactor common code between here and admin
	// a helper to open a modal. The tempalte is made from the header, body and buttons
	// resolve gives the local variables of the modal, if any are given
	// closeBtn and dismissBtn give the text for each button, if one is to exist at all
	// cbSuccess and cbFailure are callbacks based on modal selection
	$scope.openModal = function(header, body, closeBtn, dismissBtn, cbSuccess, cbFailure) {
		// construct the template from the arguments
		template = '';
		template += '<div class="modal-header"><h3 class="modal-title">' + header + '</h3></div>';
		template += '<div class="modal-body">';
		// if the body contains a tag paste directly, otherwise wrap in a <p> tag
		template += (body[0] === '<' ? body : ('<p>' + body + '</p>')) + '</div>';
		template += '<div class="modal-footer">';
		template += '<button class="btn btn-success" type="button" ng-click="close(result)">' +
			(closeBtn || 'close') + '</button>';
		if (dismissBtn) {
			template += '<button class="btn btn-danger" type="button" ng-click="dismiss()">' +
				dismissBtn + '</button>';
		}
		template += '</div>';

		var options = {
			animation  : true,
			template   : template,
			backdrop   : 'static',
			controller : 'ModalInstanceCtrl',
			resolve    : {
				data : function() {
					return $scope.modal;
				}
			}
		}

		$uibModal.open(options).result.then(cbSuccess, cbFailure);
	};

	// gets a safe way to display text through the ng-bind directive
	// assumes that even entries are text and odd entries are variables
	$scope.getSafeText = function(arr) {
		// get a copy of the array to prevent overwriting
		arr = arr.slice();

		// wrap even entries in single quotes
		for (var i = 0; i < arr.length; i += 2) {
			arr[i] = '&#39;' + arr[i] + '&#39;';
		}
		return '<span ng-bind="' + arr.join(' + ') + '"></span>';
	}
});

// the modal controller, which simply takes either a 'yes' or 'no' and sends the proper response
angular.module('ptApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, data) {
	$scope.data = data;
	$scope.result = {};
	$scope.close = function(result) { $uibModalInstance.close(result); }
	$scope.dismiss = function() { $uibModalInstance.dismiss(); }
});