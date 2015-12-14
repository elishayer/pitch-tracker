/* pt-admin.js
 * Eli Shayer
 * -----------
 * Administrator control of the pitch tracker application
 */

angular.module('ptAdminApp', ['ui.bootstrap']).controller('PTAdminController', function($scope, $http, $uibModal) {
	// constants
	$scope.tabs = [ 'Users', 'Teams', 'Players' ];

	// edit variables
	$scope.edit = {
		user : {
			active   : false,
			index    : null,
			name     : '',
			password : '',
		},
		team : {
			active       : false,
			index        : null,
			school       : '',
			abbreviation : '',
			mascot       : ''
		},
		player : {
			active       : false,
			index        : null,
			// TODO
		}
	};

	// new object variables
	$scope.new = {
		user   : false,
		team   : false,
		player : false,
	};

	// error variables
	$scope.error = {
		user   : null,
		team   : null,
		player : null,
	}

	// the current tab, a setter function, and a predicate isActiveTab function
	$scope.currTab = 0;
	$scope.setTab = function(tab) {
		$scope.currTab = tab;
	}
	$scope.isActiveTab = function(tab) {
		return $scope.tabs[$scope.currTab] === tab;
	}

	// ---------------------------------------------------- Initialize
	// get the list of all users
	$http.get('/admin/user/list').then(function(response) {
		$scope.users = response.data;
		$scope.closeUserForm();
	}, function(response) {
		$scope.error.user = 'ERROR: ' + response.data.msg;
	});

	// get the list of all teams
	$http.get('/admin/team/list').then(function(response) {
		$scope.teams = response.data;
	}, function(response) {
		$scope.error.team = 'ERROR: ' + response.data.msg;
	});

	// ---------------------------------------------------- Users
	// set up the edit form for a specific user
	$scope.editUser = function(index) {
		// get the user information
		var user = $scope.users[index];

		// set the edit information
		$scope.edit.user = {
			active   : true,
			index    : index,
			name     : user.name,
			password : user.password,
		}
	}

	$scope.createUser = function() {
		$scope.new.user = true;
	}

	// end a user edit or new user creation by reseting the edit.user and new.user data
	$scope.closeUserForm = function() {
		$scope.edit.user = {
			active   : false,
			index    : null,
			name     : '',
			password : '',
		}
		$scope.new.user = false;
		$scope.error.user = null;
	}

	// determines whether a user is actively being edited
	$scope.isUserActive = function(index) {
		return $scope.edit.user.active && index === $scope.edit.user.index;
	}
	
	// delete a user
	$scope.deleteUser = function(index) {
		// get the user information
		var user = $scope.users[index];

		// confirm in a modal that the deletion is really wanted
		$scope.openModal('Are you sure you want to delete ' + user.name + '?',
			'You will delete all information associated with ' + user.name,
			[
				{type: 'success', click: 'yes', fn: function(instance) {instance.close(); }, text: 'Yes' },
				{type: 'danger', click: 'no', fn: function(instance) {instance.dismiss(); }, text: 'No' },
			], function() {
				// delete the user
				$http.delete('/admin/user/delete/' + user._id).then(function(response) {
					// update the users list by splicing out the deleted user
					$scope.users.splice(index, 1);
					$scope.closeUserForm();
				}, function(response) {
					$scope.error.user = 'ERROR: ' + response.data.msg;
				});
			});
	}

	// submit the user form to either edit a user or create a user
	$scope.submitUserForm = function() {
		if ($scope.new.user) {
			var user = { name : $scope.edit.user.name, password : $scope.edit.user.password };

			// confirm in a modal that the creation is really wanted
			$scope.openModal('Are you sure you want to create ' + user.name + '?',
				'This will create a new account with name ' + user.name + ' and password ' + user.password,
				[
					{type: 'success', click: 'yes', fn: function(instance) {instance.close(); }, text: 'Yes' },
					{type: 'danger', click: 'no', fn: function(instance) {instance.dismiss(); }, text: 'No' },
				], function() {
					// create the user
					$http.post('admin/user/create', user).then(function(response) {
						$scope.users.push(response.data.user);
						$scope.closeUserForm();
					}, function(response) {
						$scope.error.user = 'ERROR: ' + response.data.msg;
					});
				}, $scope.closeUserForm);
		} else {
			var original = $scope.users[$scope.edit.user.index];
			var edited = $scope.edit.user;
			if (original.name !== edited.name || original.password !== edited.password) {
				// edit the user, submitted the new name and password
				var user = { name : edited.name, password : edited.password };

				// confirm in a modal that the edit is really wanted
				$scope.openModal('Are you sure you want to edit ' + user.name + "'s profile?",
					'This will edit the account to have name ' + user.name + ' and password ' + user.password,
					[
						{type: 'success', click: 'yes', fn: function(instance) {instance.close(); }, text: 'Yes' },
						{type: 'danger', click: 'no', fn: function(instance) {instance.dismiss(); }, text: 'No' },
					], function() {
						// edit the user
						$http.post('/admin/user/edit/' + original._id, user).then(function(response) {
							// update the user list locally and close the form
							$scope.users[$scope.edit.user.index] = response.data.user;
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
	// open the team form for editing
	$scope.editTeam = function(index) {
		// get the team information
		var team = $scope.teams[index];

		// set the edit information
		$scope.edit.team = {
			active       : true,
			index        : index,
			school       : team.school,
			abbreviation : team.abbreviation,
			mascot       : team.mascot,
		}
	}

	// open the team form for creation of a new team
	$scope.createTeam = function() {
		$scope.new.team = true;
	}

	// close the team form by reseting the edit data
	$scope.closeTeamForm = function() {
		$scope.edit.team = {
			active       : false,
			index        : null,
			school       : '',
			abbreviation : '',
			mascot       : ''
		}
		$scope.new.team = false;
		$scope.error.team = null;
	}

	// determines whether a team is active
	$scope.isTeamActive = function(index) {
		return $scope.edit.team.active && index === $scope.edit.team.index;
	}

	// delete a team
	$scope.deleteTeam = function(index) {
		// get the team information
		var team = $scope.teams[index];

		// confirm in a modal that the deletion is really wanted
		$scope.openModal('Are you sure you want to delete ' + team.school + '?',
			'You will delete all information associated with ' + team.school,
			[
				{type: 'success', click: 'yes', fn: function(instance) {instance.close(); }, text: 'Yes' },
				{type: 'danger', click: 'no', fn: function(instance) {instance.dismiss(); }, text: 'No' },
			], function() {
				// delete the team
				$http.delete('/admin/team/delete/' + team._id).then(function(response) {
					// update the teams list by splicing out the deleted team
					$scope.teams.splice(index, 1);
					$scope.closeTeamForm();
				}, function(response) {
					$scope.error.team = 'ERROR: ' + response.data.msg;
				});
			});
	}

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
				[
					{type: 'success', click: 'yes', fn: function(instance) {instance.close(); }, text: 'Yes' },
					{type: 'danger', click: 'no', fn: function(instance) {instance.dismiss(); }, text: 'No' },
				], function() {
					// create the team
					$http.post('admin/team/create', team).then(function(response) {
						$scope.teams.push(response.data.team);
						$scope.closeTeamForm();
					}, function(response) {
						$scope.error.team = 'ERROR: ' + response.data.msg;
					});
				}, $scope.closeTeamForm);
		} else {
			var original = $scope.teams[$scope.edit.team.index];
			var edited = $scope.edit.team;
			if (original.school !== edited.school || original.abbreviation !== edited.abbreviation || original.mascot !== edited.mascot) {
				// edit the team, submitted the new data
				var team = { school : edited.school, abbreviation : edited.abbreviation, mascot: edited.mascot };

				// confirm in a modal that the edit is really wanted
				$scope.openModal('Are you sure you want to edit the data associated with' + team.school + "?",
					'This will edit the team to be the ' + team.school + ' ' + team.mascot + ' (' + team.abbreviation + ').',
					[
						{type: 'success', click: 'yes', fn: function(instance) {instance.close(); }, text: 'Yes' },
						{type: 'danger', click: 'no', fn: function(instance) {instance.dismiss(); }, text: 'No' },
					], function() {
						// edit the team
						$http.post('/admin/team/edit/' + original._id, team).then(function(response) {
							// update the team list locally and close the form
							$scope.teams[$scope.edit.team.index] = response.data.team;
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
	// a helper to open a modal. The tempalte is made from the heaer, body and buttons
	// resolve is the variables to use as locals in the modal
	// cbSuccess and cbFailure are callbacks based on modal selection
	$scope.openModal = function(header, body, buttons, cbSuccess, cbFailure) {
		// construct the template from the arguments and form the resolve object
		template = '';
		var resolve = {};
		template += '<div class="modal-header"><h3 class="modal-title">' + header + '</h3></div>';
		template += '<div class="modal-body"><p>' + body + '</p></div>';
		template += '<div class="modal-footer">';
		// add buttons to the template and actions to the resolve object
		for (var i = 0; i < buttons.length; i++) {
			template += '<button class="btn btn-' + buttons[i].type + '" type="button"';
			template += ' ng-click="' + buttons[i].click + '()">' + buttons[i].text + '</button>';
			resolve[buttons[i].click] = buttons[i].fn;
		}
		template += '</div>';

		var modalInstance = $uibModal.open({
			animation  : true,
			template   : template,
			backdrop   : 'static',
			controller : 'ModalInstanceCtrl',
			resolve    : {
				functions : function () {
					return resolve;
				}
			}
		});

		modalInstance.result.then(cbSuccess, cbFailure);
	};
});

angular.module('ptAdminApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, functions) {
	$scope.yes = function () {
		functions['yes']($uibModalInstance);
	}

	$scope.no = function () {
		functions['no']($uibModalInstance);
	}
});
