angular.module('ptApp', [])
	.controller('PitchTrackerController', function($scope) {
		$scope.curr = {
			inning : {
				num      : 1,
				top      : true,
				outs     : 0,
			},
			pa     : {
				hitter   : '',
				pitcher  : '',
				balls    : 0,
				strikes  : 0,
				pitches  : [],
				result   : 0
			},
			pitch  : {
				location : [-Infinity, -Infinity],
				type     : '0',
				velocity : '',
				result   : '0'
			}
		};
		$scope.view = PLAYER_INPUT_GROUP;
		$scope.submitPitch = function() {
			console.log('Submit pitch');
		}
		$scope.submitPlayers = function() {
			console.log('Submit players');
		}
		$scope.submitResult = function() {
			console.log('Submit result');
		}
	});

console.log('Angular connected!');