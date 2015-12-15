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
			fields  : [ { name: 'name', abbr: 'name' }, { name: 'password', abbr: 'password'} ],
			getName : function(user) { return user.name; },
			methods : {
				delete : {},
				create : {
					getTitle : function(user) { return 'Are you sure you want to create a new user named ' + user.name + '?'; },
					getBody  : function(user) { return 'This will create a user named ' + user.name + ' with password ' + user.password + '.'; },
				},
				edit   : {
					getTitle : function(user) { return 'Are you sure you want to edit ' + user.name + "'s account?"; },
					getBody  : function(user) { return 'This will change the account information associated with ' + user.name + '.'; }
				}
			}
		},
		{
			name    : 'team',
			fields  : [ { name: 'school', abbr: 'school' }, { name: 'mascot', abbr: 'mascot' },
			 	{ name: 'abbreviation', abbr: 'abbreviation'} ],
			getName : function(team) { return 'the ' + team.school + ' ' + team.mascot; },
			methods : {
				delete : {},
				create : {
					getTitle : function(team) { return 'Are you sure you want to create a new team called the ' + team.school + ' ' + team.mascot + '?'; },
					getBody  : function(team) { return 'This will create a team from the ' + team.school + '.'; },
				},
				edit   : {
					getTitle : function(team) { return 'Are you sure you want to edit ' + team.school + '?'; },
					getBody  : function(team) { return 'This will change the information associated with ' + team.school + '.'; }
				}
			}
		},
		{
			name    : 'player',
			fields  : [ {name: 'name', abbr: 'name' }, {name: 'team', abbr: 'team', type: 'select' },
				{ name: 'number', abbr: '#', type: 'number' }, { name: 'position', abbr: 'pos' },
				{ name: 'height', abbr: 'h' }, { name: 'weight', abbr: 'w', type: 'number' },
				{ name: 'year', abbr: 'year'}, { name: 'bat-hand', abbr: 'bat'},
				{ name: 'throw-hand', abbr: 'throw' } ],
			getName : function(player) { return player.name; },
			methods : {
				delete : {},
				create : {
					getTitle : function(player) { return 'Are you sure you want to create a new player named ' + player.name + '?'; },
					getBody  : function(player) { return 'This will create a player named ' + player.name + ' on the ' + player.team + ' team.'; },
				},
				edit   : {
					getTitle : function(player) { return 'Are you sure you want to edit ' + player.name + '?'; },
					getBody  : function(player) { return 'This will change the data associated with ' + player.name + '.'; }
				}
			}
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
			edit[$scope.tabs[i].fields[j].name] = '';
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
	$scope.tabs.forEach(function(tab, i) {
		// get the list of all data for the data type
		$http.get('/admin/' + tab.name + '/list').then(function(response) {
			$scope.data[tab.name] = response.data;
		}, function(response) {
			$scope.error[tab.name] = 'ERROR: ' + response.data.msg;
		});
	});

	// ---------------------------------------------------- Model types
	// create the methods that apply to each tab, and add them to the tab object
	$scope.tabs.forEach(function(tab, i) {
		// open the form for editing an existing object
		tab.openEditForm = function(index) {
			// get object information
			var obj = $scope.data[tab.name][index];

			// set the edit information
			$scope.edit[tab.name].active = true;
			$scope.edit[tab.name].index = index;
			tab.fields.forEach(function(field, j) {
				$scope.edit[tab.name][field.name] = obj[field.name];
			});
		}

		// predicate method for whether the form is currently open
		tab.isFormOpen = function() {
			return $scope.edit[tab.name].active || $scope.new[tab.name];
		}

		// predicate method for whether the form is complete,
		// meaning that every input is not empty
		tab.isFormComplete = function() {
			for (var i = 0; i < tab.fields.length; i++) {
				if (!$scope.edit[tab.name][tab.fields[i].name].length) {
					return false;
				}
			}
			return true;
		}

		// open the form for creating a new object
		tab.openCreateForm = function() {
			$scope.new[tab.name] = true;
		}

		// close the form by resetting the edit and new fields
		tab.closeForm = function() {
			$scope.edit[tab.name].active = false;
			$scope.edit[tab.name].index = null;
			tab.fields.forEach(function(field, j) {
				$scope.edit[tab.name][field.name] = '';
			});
			$scope.new[tab.name] = false;
			$scope.error[tab.name] = false;
		}

		// determines whether an object is currently active
		tab.isActive = function(index) {
			return $scope.edit[tab.name].active && index === $scope.edit[tab.name].index;
		}

		if (tab.methods.delete) {
			tab.delete = function(index) {
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
							tab.closeForm();
						}, function(response) {
							$scope.error[tab.name] = 'ERROR: ' + response.data.msg;
						});
					}
				);
			}
		}

		// a method to listen to the form being submitted
		// this is used both for creating new data and editing existing data
		tab.submitForm = function() {
			// create the object containing all data from the form
			var obj = {};
			tab.fields.forEach(function(field, j) {
				obj[field.name] = $scope.edit[tab.name][field.name];
			});

			// if there is a creation method and the form is open for creation
			if (tab.methods.create && $scope.new[tab.name]) {
				// confirm in a modal that the creation is desired
				$scope.openModal(tab.methods.create.getTitle(obj),
					tab.methods.create.getBody(obj), function() {
						$http.post('/admin/' + tab.name + '/create', obj).then(function(response) {
							// add the new object to the local array and close the form
							$scope.data[tab.name].push(response.data[tab.name]);
							tab.closeForm();
						}, function(response) {
							// display the error
							$scope.error[tab.name] = 'ERROR: ' + response.data.msg;
						});
					}
				);
			// if there is an edit method and the form is open for editing
			} else if (tab.methods.edit && $scope.edit[tab.name].active) {
				// get the original version of the object being edited
				var original = $scope.data[tab.name][$scope.edit[tab.name].index];
				// if the edits change the content of the object
				if ($scope.isEditSubstantive(original, obj)) {
					// confirm that the edit is desired at the url
					$scope.openModal(tab.methods.edit.getTitle(obj),
						tab.methods.edit.getBody(obj), function() {
							// get the url and post the edit request
							var url = '/admin/' + tab.name + '/edit/' + original._id;
							$http.post(url, obj).then(function(response) {
								// update the local list wih the edit
								$scope.data[tab.name][$scope.edit[tab.name].index] = response.data[tab.name];
							}, function(response) {
								// display any error that occurs
								$scope.error[tab.name] = 'ERROR: ' + response.data.msg;
							});
						}
					);
				} else {
					// note that a substantive edit must be made for an edit to go through
					$scope.error[tab.name] = 'You must change something about ' + tab.getName(obj) + ' for an edit to occur.';
				}
			}
		}
	});

	// ---------------------------------------------------- Helper Function
	// helper function to determine whether changes have been made
	$scope.isEditSubstantive = function(original, obj) {
		for (key in obj) {
			if (original[key] !== obj[key]) {
				return true;
			}
		}
		return false;
	}

	// Split at hyphens into separate words, and capitalize each word
	$scope.capitalize = function(str) {
		var words = str.split('-')
		for (var i = 0; i < words.length; i++) {
			words[i] = words[i][0].toUpperCase() + words[i].slice(1);	
		}
		return words.join(' ');
	}

	// pluralize the passed in string (add an 's' to the end)
	// this works with current needs but should be more robust
	$scope.pluralize = function(str) {
		return str + 's';
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
