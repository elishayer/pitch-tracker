angular.module('ptApp', [])
	.controller('PitchTrackerController', function($scope) {
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
		$scope.view = PLAYER_INPUT_GROUP;

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

				// TODO: create and store a mongo PA object

				// change the input view to the pitch input
				$scope.view = PITCH_INPUT_GROUP;
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
			var boundRect = document.getElementById(ZONE_ID).getBoundingClientRect();
			$scope.curr.pitch.location.horizontal =
				(event.clientX - boundRect.left) / (boundRect.right - boundRect.left);
			$scope.curr.pitch.location.vertical =
				(event.clientY - boundRect.top) / (boundRect.bottom - boundRect.top);
		}

		// get x and y pixel locations based on a pitch location
		$scope.getPitchX = function(pitch) {
			var boundRect = document.getElementById(ZONE_ID).getBoundingClientRect();
			return pitch.location.horizontal * (boundRect.right - boundRect.left);
		}
		$scope.getPitchY = function(pitch) {
			var boundRect = document.getElementById(ZONE_ID).getBoundingClientRect();
			return pitch.location.vertical * (boundRect.bottom - boundRect.top);
		}

		// get the color of a pitch based on its result
		$scope.getPitchColor = function(pitch) {
			switch (pitch.result) {
				case BALL:
					return BALL_COLOR;
				case SWINGING_STRIKE:
				case CALLED_STRIKE:
				case FOUL:
				case FOUL_TIP:
					return STRIKE_COLOR;
				case IN_PLAY:
					return IN_PLAY_COLOR;
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

				// TODO: store pitch into mongo db

				// adjust the number of balls and strikes
				if (pitch.result === BALL) {
					$scope.curr.pa.balls++;
				} else if (pitch.result === CALLED_STRIKE ||
							pitch.result === SWINGING_STRIKE ||
							pitch.result === FOUL_TIP ||
							(pitch.result === FOUL && $scope.curr.pa.strikes < 2)) {
					$scope.curr.pa.strikes++;
				}

				// set the plate appearance result if applicable
				if ($scope.curr.pa.strikes === 3) {
					$scope.submitPaResult(STRIKEOUT);
				} else if ($scope.curr.pa.balls === 4) {
					$scope.submitPaResult(WALK);
				}

				// if the ball was put in play switch to the result input view
				if (pitch.result === IN_PLAY) {
					$scope.view = RESULT_INPUT_GROUP;
				}
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
			// get the pa data
			var pa = {
				hitter  : $scope.curr.pa.hitter,
				pitcher : $scope.curr.pa.pitcher,
				balls   : $scope.curr.pa.balls,
				strikes : $scope.curr.pa.strikes,
				pitches : $scope.curr.pa.pitches,
				result  : result
			};

			// initialize a new plate appearance
			$scope.initializePa();

			// TODO: submit the Pa result to mongo db

			// push the pa into the inning pa array
			$scope.curr.inning.pas.push(pa);

			// determine whether outs need to added
			if (pa.result === STRIKEOUT || pa.result === IN_PLAY_OUT) {
				$scope.incrementOut();
			}

			// propogate base changes as needed
			$scope.advanceBaserunners(pa.hitter, result);

			// reset the view to the player selector
			$scope.view = PLAYER_INPUT_GROUP;
		}

		// advanecs baserunners as needed based on the plate appearance result
		$scope.advanceBaserunners = function(hitter, result) {
			switch(result) {
				case WALK:
				case HIT_BY_PITCH:
					$scope.implementWalk(hitter);
					break;
				case SINGLE:
				case DOUBLE:
				case TRIPLE:
				case HOME_RUN:
					$scope.incrementHit(hitter);
				case IN_PLAY_OUT:
					$scope.implementInPlay(hitter, result);
					break;
			}
		}

		// implements a walk or a hit by pitch
		$scope.implementWalk = function(hitter) {
			if ($scope.bases[FIRST_BASE]) {
				if ($scope.bases[SECOND_BASE]) {
					if ($scope.bases[THIRD_BASE]) {
						$scope.incrementRun($scope.bases[THIRD_BASE])
					}
					$scope.bases[THIRD_BASE] = $scope.bases[SECOND_BASE];
				}
				$scope.bases[SECOND_BASE] = $scope.bases[FIRST_BASE];
			}
			$scope.bases[FIRST_BASE] = hitter;
		}

		// implements ball in play, including asking the user for baserunner advancement
		// uses the fact that the pa result code for a single is 1, double is 2, etc.
		$scope.implementInPlay = function(hitter, result) {
			// if HR score the hitter, otherwise place on base
			if (result === HOME_RUN) {
				for (var base = FIRST_BASE; base <= THIRD_BASE; base++) {
					if ($scope.bases[base]) {
						$scope.incrementRun($scope.bases[base]);
					}
				}
				$scope.incrementRun(hitter);
			} else {
				// if in play, ask the user for advancement data for each occupied base
				for (var base = THIRD_BASE; base >= FIRST_BASE; base--) {
					if ($scope.bases[base]) {
						$scope.enqueueModal($scope.bases[base], base, false);
					}
				}

				// add the hitter to the bases 
				$scope.enqueueModal(hitter, result - 1, true, result !== IN_PLAY_OUT);
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
			if (base === FIRST_BASE) {
				return "first base";
			} else if (base === SECOND_BASE) {
				return "second base";
			} else if (base === THIRD_BASE) {
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
				if (base - 1 === HOME_BASE) {
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
			if ($scope.curr.inning.outs === 3) {
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
				horizontal : -1,
				vertical   : -1
			};
		}

		// generate the message based on the input view and error
		$scope.generateMessage = function() {
			if ($scope.view === PLAYER_INPUT_GROUP) {
				if ($scope.error) {
					return 'There was an error entering the player data';
				} else {
					return 'Enter the pitcher and the hitter';
				}
			} else if ($scope.view === PITCH_INPUT_GROUP) {
				if ($scope.error) {
					return 'There was an error entering the pitch data';
				} else {
					return 'Enter the pitch data';
				}
			} else if ($scope.view === RESULT_INPUT_GROUP) {
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
			return PITCH_TYPE_MAP[type];
		}

		// convert the pitch result to text
		$scope.pitchResultToString = function(result) {
			return PITCH_RESULT_MAP[result];
		}

		// convert the pa result to text
		$scope.paResultToString = function(result) {
			return PA_RESULT_MAP[result];
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

		// initialize the inning, pa, and pitch objects
		$scope.initializeInning();
		$scope.initializePa();
		$scope.initializePitch();
	});
