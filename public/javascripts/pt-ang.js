angular.module('ptApp', [])
	.controller('PitchTrackerController', function($scope) {
		$scope.mode = 'game'; // TODO: multiple modes: game, bp, pitching only, etc.
		$scope.error = false; // true if an error is to be displayed
		$scope.message;
		$scope.curr = {
			hitter  : '',
			pitcher : '',
			inning  : {
				num      : 1,
				top      : true,
				outs     : 0,
				pas      : []
			},
			pa      : {
				hitter   : '',
				pitcher  : '',
				balls    : 0,
				strikes  : 0,
				pitches  : [],
				result   : '0'
			},
			pitch   : {
				location : [-Infinity, -Infinity],
				type     : '0',
				velocity : '',
				result   : '0'
			}
		};
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

				// TODO: create and store a mongo PA object

				// change the input view to the pitch input
				$scope.view = PITCH_INPUT_GROUP;
			} else {
				$scope.error = true;
			}
		}

		// helper for whether the pitch data is complete
		$scope.isPitchDataComplete = function() {
			// TODO: get the location
			return parseInt($scope.curr.pitch.type) && parseInt($scope.curr.pitch.velocity) > 0 &&
				parseInt($scope.curr.pitch.result);
		}

		// listener for submitting a pitch
		$scope.pitchListener = function() {
			if ($scope.isPitchDataComplete()) {
				// get the pitch data from the inputs and clear the inputs
				// ensure that all numerical data is typed correctly
				var pitch = {
					location : $scope.curr.pitch.location,
					type     : parseInt($scope.curr.pitch.type),
					velocity : $scope.curr.pitch.velocity,
					result   : parseInt($scope.curr.pitch.result)
				};
				$scope.curr.pitch.type = $scope.curr.pitch.result = '0';
				$scope.curr.pitch.velocity = '';

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
				$scope.submitPaResult($scope.curr.pa.result);
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

			// TODO: submit the Pa result to mongo db

			// push the pa into the inning pa array
			$scope.curr.inning.pas.push(pa);

			// determine whether outs need to added
			if (pa.result === STRIKEOUT || pa.result === IN_PLAY_OUT) {
				$scope.curr.inning.outs++;
			}

			// TODO: bases

			// create an inning if needed
			if ($scope.curr.inning.outs === 3) {
				// TODO: create a new inning
			}

			// initialize a new plate appearance
			$scope.initializePa();

			// reset the view to the player selector
			$scope.view = PLAYER_INPUT_GROUP;
		}

		// initialize a new empty pa object
		$scope.initializePa = function() {
			// reset the pa data
			$scope.curr.pa.hitter = $scope.curr.pa.pitcher = '';
			$scope.curr.pa.balls = $scope.curr.pa.strikes = 0;
			$scope.curr.pa.pitches = [];
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
	});
