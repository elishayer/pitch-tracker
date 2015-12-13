/* pt-admin.js
 * Eli Shayer
 * -----------
 * Administrator control of the pitch tracker application
 */

angular.module('ptAdminApp', []).controller('PTAdminController', function($scope, $http) {
	// constants
	$scope.tabs = [ 'Users', 'Teams' ];

	// edit variables
	$scope.edit = {
		user : {
			active   : false,
			index    : null,
			name     : '',
			password : '',
		}
	};

	// new object variables
	$scope.new = {
		user : false
	};

	// error variables
	$scope.error = {
		user : null
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
	// initialize the section variables
	$scope.users = [];
	$scope.teams = [];

	// get the content for the section variables
	$http.get('/admin/user/list').then(function(response) {
		$scope.users = response.data;
		$scope.closeUserForm();
	}, function(response) {
		$scope.error.user = 'ERROR: ' + response.data.msg;
	});

	// ---------------------------------------------------- Users
	// delete a user
	$scope.deleteUser = function(index) {
		// get the user information
		var user = $scope.users[index];

		// delete the user
		$http.delete('/admin/user/delete/' + user._id).then(function(response) {
			// update the users list by splicing out the deleted user
			$scope.users.splice(index, 1);
			$scope.closeUserForm();
		}, function(response) {
			$scope.error.user = 'ERROR: ' + response.data.msg;
		});
	}

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

	// submit the user form to either edit a user or create a user
	$scope.submitUserForm = function() {
		if ($scope.new.user) {
			var user = { name : $scope.edit.user.name, password : $scope.edit.user.password };
			$http.post('admin/user/create', user).then(function(response) {
				$scope.users.push(response.data.user);
				$scope.closeUserForm();
			}, function(response) {
				$scope.error.user = 'ERROR: ' + response.data.msg;
			});
		} else {
			var original = $scope.users[$scope.edit.user.index];
			var edited = $scope.edit.user;
			if (original.name !== edited.name || original.password !== edited.password) {
				// edit the user, submitted the new name and password
				var data = { name : edited.name, password : edited.password };
				
				$http.post('/admin/user/edit/' + original._id, data).then(function(response) {
					// update the data locally and close the form
					$scope.users[$scope.edit.user.index] = response.data.user;
					$scope.closeUserForm();
				}, function(response) {
					$scope.error.user = 'ERROR: ' + response.data.msg;
				});
			} else {
				console.log('Error set');
				$scope.error.user = 'ERROR: You must change the name and/or password in order to submit an edit';
			}
		}
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
	$scope.isEditActive = function(index) {
		return $scope.edit.user.active && index === $scope.edit.user.index;
	}
});
