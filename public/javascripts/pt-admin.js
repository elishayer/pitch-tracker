/* pt-admin.js
 * Eli Shayer
 * -----------
 * Administrator control of the pitch tracker application
 */

angular.module('ptAdminApp', ['ui.bootstrap']).controller('PTAdminController', function($scope, $http, $uibModal) {
	// constants
	$scope.tabs = [
		{
			name    : 'user',
			fields  : [ 'name', 'password' ],
			getName : function(user) { return user.name; }
		},
		{
			name    : 'team',
			fields  : [ 'school', 'abbreviation', 'mascot' ],
			getName : function(team) { return 'the' + team.school + ' ' + team.mascot; }
		},
		{
			name    : 'player',
			fields  : [ 'TODO' ],
			getName : function(player) { return player.name; }
		}
	];

	// initialize scope edit, new, error, and data variables
	$scope.edit = {};
	$scope.new = {};
	$scope.error = {};
	$scope.data = {};

	for (var i = 0; i < $scope.tabs.length; i++) {
		// initialize the edit variable including blank strings for each field
		var edit = { active : false, index  : null };
		for (var j = 0; j < $scope.tabs[i].fields.length; j++) {
			edit[$scope.tabs[i].fields[j]] = '';
		}

		// set the edit, new, and error variables
		$scope.edit[$scope.tabs[i].name] = edit;
		$scope.new[$scope.tabs[i].name] = false;
		$scope.error[$scope.tabs[i].name] = null;
	}

	// the current tab, a setter function, and a predicate isActiveTab function
	$scope.currTab = 0;
	$scope.setTab = function(tab) {
		$scope.currTab = tab;
	}
	$scope.isActiveTab = function(tab) {
		return $scope.tabs[$scope.currTab].name === tab;
	}

	// ---------------------------------------------------- Initialize
	$scope.tabs.forEach(function(val, i) {
		// get the list of all data for the data type
		$http.get('/admin/' + $scope.tabs[i].name + '/list').then(function(response) {
			$scope.data[$scope.tabs[i].name] = response.data;
		}, function(response) {
			$scope.error[$scope.tabs[i].name] = 'ERROR: ' + response.data.msg;
		});
	});

	// ---------------------------------------------------- Model types
	// helper function to capitalize a word
	capitalize = function(str) {
		return str[0].toUpperCase() + str.slice(1);
	}

	// create the methods that apply to each tab
	$scope.tabs.forEach(function(tab, i) {
		// open the form for editing an existing object
		$scope['edit' + capitalize(tab.name)] = function(index) {
			// get object information
			var obj = $scope.data[tab.name][index];

			// set the edit information
			$scope.edit[tab.name].active = true;
			$scope.edit[tab.name].index = index;
			tab.fields.forEach(function(field, j) {
				$scope.edit[tab.name][field] = obj[field];
			});
		}

		// open the form for creating a new object
		$scope['create' + capitalize(tab.name)] = function() {
			$scope.new[tab.name] = true;
		}

		// close the form by resetting the edit and new fields
		$scope['close' + capitalize(tab.name) + 'Form'] = function() {
			$scope.edit[tab.name].active = false;
			$scope.edit[tab.name].index = null;
			tab.fields.forEach(function(field, j) {
				$scope.edit[tab.name][field] = '';
			});
			$scope.new[tab.name] = false;
			$scope.error[tab.name] = false;
		}

		// determines whether an object is currently active
		$scope['is' + capitalize(tab.name) + 'Active'] = function(index) {
			return $scope.edit[tab.name].active && index === $scope.edit[tab.name].index;
		}

		$scope['delete' + capitalize(tab.name)] = function(index) {
			// get the object to be deleted
			var obj = $scope.data[tab.name][index];

			// confirm in a modal that the deletion is really wanted
			$scope.openModal('Are you sure you want to delete <b>' + tab.getName(obj) + '</b>?',
				'If you proceed, all data associated with <b>' + tab.getName(obj) + '</b> will be deleted',
				function() {
					// delete the object
					$http.delete('/admin/' + tab.name + '/delete/' + obj._id).then(function(response) {
						// splice out the deleted object and close the form
						$scope.data[tab.name].splice(index, 1);
						$scope['close' + capitalize(tab.name) + 'Form']();
					}, function() {
						$scope.error[tab.name] = 'ERROR: ' + response.data.msg;
					});
				});
		}
	});

	// ---------------------------------------------------- Users
	// submit the user form to either edit a user or create a user
	$scope.submitUserForm = function() {
		if ($scope.new.user) {
			var user = { name : $scope.edit.user.name, password : $scope.edit.user.password };

			// confirm in a modal that the creation is really wanted
			$scope.openModal('Are you sure you want to create ' + user.name + '?',
				'This will create a new account with name ' + user.name + ' and password ' + user.password,
				function() {
					// create the user
					$http.post('admin/user/create', user).then(function(response) {
						$scope.data.user.push(response.data.user);
						$scope.closeUserForm();
					}, function(response) {
						$scope.error.user = 'ERROR: ' + response.data.msg;
					});
				}, $scope.closeUserForm);
		} else {
			var original = $scope.data.user[$scope.edit.user.index];
			var edited = $scope.edit.user;
			if (original.name !== edited.name || original.password !== edited.password) {
				// edit the user, submitted the new name and password
				var user = { name : edited.name, password : edited.password };

				// confirm in a modal that the edit is really wanted
				$scope.openModal('Are you sure you want to edit ' + user.name + "'s profile?",
					'This will edit the account to have name ' + user.name + ' and password ' + user.password,
					function() {
						// edit the user
						$http.post('/admin/user/edit/' + original._id, user).then(function(response) {
							// update the user list locally and close the form
							$scope.data.user[$scope.edit.user.index] = response.data.user;
							$scope.closeUserForm();
						}, function(response) {
							$scope.error.user = 'ERROR: ' + response.data.msg;
						});
					}, $scope.closeUserForm);
			} else {
				$scope.error.user = 'ERROR: You must change the name and/or password in order to submit an edit';
			}
		}
	}

	// ---------------------------------------------------- Teams
	// submit the team form. Currently just adding new teams. TODO: editing
	$scope.submitTeamForm = function() {
		if ($scope.new.team) {
			var team = {
				school       : $scope.edit.team.school,
				abbreviation : $scope.edit.team.abbreviation,
				mascot       : $scope.edit.team.mascot
			}

			// confirm in a modal that the team creation is really wanted
			$scope.openModal('Are you sure you want to create ' + team.school + '?',
				'This will create the ' + team.school + ' ' + team.mascot + ' with abbreviation ' + team.abbreviation,
				function() {
					// create the team
					$http.post('admin/team/create', team).then(function(response) {
						$scope.data.team.push(response.data.team);
						$scope.closeTeamForm();
					}, function(response) {
						$scope.error.team = 'ERROR: ' + response.data.msg;
					});
				}, $scope.closeTeamForm);
		} else {
			var original = $scope.data.team[$scope.edit.team.index];
			var edited = $scope.edit.team;
			if (original.school !== edited.school || original.abbreviation !== edited.abbreviation || original.mascot !== edited.mascot) {
				// edit the team, submitted the new data
				var team = { school : edited.school, abbreviation : edited.abbreviation, mascot: edited.mascot };

				// confirm in a modal that the edit is really wanted
				$scope.openModal('Are you sure you want to edit the data associated with' + team.school + "?",
					'This will edit the team to be the ' + team.school + ' ' + team.mascot + ' (' + team.abbreviation + ').',
					function() {
						// edit the team
						$http.post('/admin/team/edit/' + original._id, team).then(function(response) {
							// update the team list locally and close the form
							$scope.data.team[$scope.edit.team.index] = response.data.team;
							$scope.closeTeamForm();
						}, function(response) {
							$scope.error.team = 'ERROR: ' + response.data.msg;
						});
					}, $scope.closeTeamForm);
			} else {
				$scope.error.team = 'ERROR: You must change the school, mascot, and/or abbreviation in order to submit an edit';
			}
		}
	}

	// ---------------------------------------------------- Modal
	// a helper to open a modal. The tempalte is made from the header, body and buttons
	// cbSuccess and cbFailure are callbacks based on modal selection
	$scope.openModal = function(header, body, cbSuccess, cbFailure) {
		// construct the template from the arguments
		template = '';
		template += '<div class="modal-header"><h3 class="modal-title">' + header + '</h3></div>';
		template += '<div class="modal-body"><p>' + body + '</p></div>';
		template += '<div class="modal-footer">';
		template += '<button class="btn btn-success" type="button" ng-click="yes()">Yes</button>';
		template += '<button class="btn btn-danger" type="button" ng-click="no()">No</button>';
		template += '</div>';

		var modalInstance = $uibModal.open({
			animation  : true,
			template   : template,
			backdrop   : 'static',
			controller : 'ModalInstanceCtrl'
		});

		modalInstance.result.then(cbSuccess, cbFailure);
	};
});

// the modal controller, which simply takes either a 'yes' or 'no' and sends the proper response
angular.module('ptAdminApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {
	$scope.yes = function () { $uibModalInstance.close(); }
	$scope.no = function () { $uibModalInstance.dismiss(); }
});
