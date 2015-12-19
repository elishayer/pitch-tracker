/* pt-admin.js
 * Eli Shayer
 * -----------
 * Administrator control of the pitch tracker application
 */

angular.module('ptAdminApp', ['ui.bootstrap']).controller('PTAdminController', function($scope, $http, $uibModal) {
	// ---------------------------------------------------- Tab Data
	/* The following comment describes the data for each tab:
	name......the singular, lowercase tab name, which also gives the data type
	fields....the fields in an element of the data type, corresponding to the Mongoose model
	[
		name......the name of the field as given in the Mongoose Schema
		abbr......the text to display in the table header (optional, default is name)
		type......the input type, or select for a dropdown (optional, default is 'text')
		options...if type is select, a callback returning the data for the options
		value.....if type is select, the key to get the value from the option data
		text......if type is select, the key to get the text to display from the option data
		multiple..if type is select, whether to choose multiple inputs (optional, default is false)
		transform.a callback to display the text (optional, default is the identity function)
	]
	getName...gets the name of an element of this type
	methods...object containing the delete, create, and edit method specifications
		delete....delete an existing piece of data of this type
			success...a callback to be executed upon a successful deletion request
		create....create a new piece of data of this type
			success...a callback to be executed upon a successful creation request
			title.....an array containing the contents needed for the modal title
			body......an array containing the contents needed for the modal body
		edit......edit an existing piece of data of this type
			success...a callback to be executed upon a successful edit request
			title.....an array containing the contents needed for the modal title
			body......an array containing the contents needed for the modal body
	forms.....other forms besides the default
	[
		title.....the title of the form
		inputs....the inputs for the form
		[
			type......the type of the input
			id........the id of the input
		]
		submit....the submission callback
		btn.......data related to the submit button
			class.....the class of the button
			text......the text on the button
			glyph.....the glyphicon class of the button
	]
	displays..the displays to show in the table that aren't fields
	[
		name......the name of the field as given in the Mongoose Schema
		text......the text to display on the button
		glyph.....the glyphicon class for the button
	]
	*/
	$scope.tabs = [
		{
			name     : 'user',
			fields   : [ { name: 'name' }, { name: 'password' } ],
			getName  : function(user) { return user.name; },
			methods  : {
				delete : {},
				create : {
					title : ['Are you sure you want to create a new user named ', 'data.name', '?'],
					body  : ['This will create a user named ', 'data.name', ' with password ', 'data.password', '.']
				},
				edit   : {
					title : ['Are you sure you want to edit the account of ', 'data.name', '?'],
					body  : ['This will change the account information associated with ', 'data.name', '.']
				}
			},
		},
		{
			name     : 'team',
			fields   : [ { name: 'school' }, { name: 'mascot' }, { name: 'abbreviation' } ],
			getName  : function(team) { return 'the ' + team.school + ' ' + team.mascot; },
			methods  : {
				delete : {},
				create : {
					title : ['Are you sure you want to create a new team called the ', 'data.school', ' ', 'data.mascot', '?'],
					body  : ['This will create the ', 'data.school', ' ', 'data.mascot', ' team.']
				},
				edit   : {
					title : ['Are you sure you want to edit ', 'data.school', '?'],
					body  : ['This will change the information associated with ', 'data.school', '.']
				}
			},
			displays : [ {
				name  : 'players',
				text  : function(team) {
					var numPlayers = team.players.length;
					return numPlayers + ' player' + (numPlayers === 1 ? '' : 's');
				},
				glyph : 'list',
				// display a list of the players associated with the team
				click : function(team) {
					$http.get('/admin/team/' + team._id + '/players').then(function(response) {
						$scope.modal = {
							team    : team,
							players : response.data
						};
						// construct the header and body of the modal
						var header = ['The ', 'data.team.school', ' ', 'data.team.mascot'];
						var body;
						if ($scope.modal.players.length) {
							header.push(' consist of the following player' +
								($scope.modal.players.length === 1 ? '' : 's') + ':');
							body = '<ul><li ng-repeat="player in data.players" ng-bind="player.name"></li><ul>';
						} else {
							header.push(' have no players.');
							body = 'Add players in the "Players" tab.';
						}
						// open the modal wih only a close option and no responses
						$scope.openModal($scope.getSafeText(header), body, 'Close');
					}, function(response) {
						$scope.error.general = 'ERROR: ' + response.msg;
					});
				}
			} ]
		},
		{
			name     : 'player',
			fields   : [ {name: 'name' },
				{ name: 'team', type: 'select', options: function() {
					return $scope.data.team;
				}, value: '_id', text: 'school', transform: function(_id) {
					var i = $scope.search($scope.data.team, function(team) {
						return team._id === _id;
					});
					return i === SENTINAL ? 'None' : $scope.data.team[i].abbreviation;
				}},
				{ name: 'number', abbr: '#', type: 'number' },
				{ name: 'position', abbr: 'pos', type: 'select', options: function() {
					return $scope.positions;
				}, value: 'value', text: 'text', multiple: true, transform: function(pos) {
					// local copy, replace number with abbreviation, then join with '/'
					var pos = pos.slice();
					for (var i = 0; i < pos.length; i++) {
						pos[i] = $scope.positions[pos[i] - 1].abbr
					}
					return pos.join('/');
				} },
				{ name: 'height', abbr: 'h', type: 'number', transform: function(height) {
					var feet = Math.floor(height / 12);
					var inches = height - 12 * feet;
					return feet + "'" + inches + '"';
				} },
				{ name: 'weight', abbr: 'w', type: 'number' },
				{ name: 'bat-hand', abbr: 'bat', type: 'select', options: function() {
					return $scope.handedness;
				}, value: 'value', text: 'text', transform: function(hand) {
					return $scope.handedness[hand].text[0];
				} },
				{ name: 'throw-hand', abbr: 'throw', type: 'select', options: function() {
					return $scope.handedness;
				}, value: 'value', text: 'text', transform: function(hand) {
					return $scope.handedness[hand].text[0];
				} }, ],
			getName  : function(player) { return player.name; },
			methods  : {
				delete : {
					// remove the deleted player data from the local team data
					// get the team, then the player, then splice out the player
					success  : function(player) {
						if (player.team) {
							var teamIndex = $scope.search($scope.data.team, function(team) {
								return team._id === player.team;
							});
							if (teamIndex !== SENTINAL) {
								var playerIndex = $scope.search(
										$scope.data.team[teamIndex].players, function(p) {
									return p === player._id;
								});
								if (playerIndex !== SENTINAL) {
									$scope.data.team[teamIndex].players.splice(playerIndex, 1);
								}
							}
						}
					}
				},
				create : {
					success : function(player) {
						// add the new player to the local team data
						var teamIndex = $scope.search($scope.data.team, function(team) {
							return team._id === player.team;
						});
						$scope.data.team[teamIndex].players.push(player);
					},
					title   : ['Are you sure you want to create a new player named ', 'data.name', '?'],
					body    : ['This will create a player named ', 'data.name', ' and add them to the specified team.'],
				},
				edit   : {
					title   : ['Are you sure you want to edit ', 'data.name', '?'],
					body    : ['This will change the data associated with ', 'data.name', '.']
				}
			},
			forms    : [
				{
					title  : 'roster-upload',
					inputs : [
						{ type : 'file', 'id' : 'roster-upload-file' }
					],
					// submit a roster file to the server
					submit : function(tab) {
						$scope.error.player = null;
						var fileInput = document.getElementById('roster-upload-file');
						var file = fileInput.files[0];
						var headers;
						if (!fileInput.files.length) {
							$scope.error.player = 'No file is selected';
						} else if (file.name.search(/\.csv/) !== file.name.length - 4) {
							$scope.error.player = 'The file must have .csv extension';
						} else {
							reader = new FileReader();
							// the callback upon loading the file
							reader.onloadend = function(event) {
								$http.post('/admin/team/roster/' + headers.team, {
									data    : event.target.result,
									headers : headers
								}).then(function(response) {
									// push each new player into the local player data
									// and the appropriate team data
									var teamIndex = $scope.search($scope.data.team, function(team) {
										return team._id === headers.team;
									});
									for (var i = 0; i < response.data.players.length; i++) {
										$scope.data.player.push(response.data.players[i]);
										$scope.data.team[teamIndex].players.push(response.data.players[i]);
									}
								}, function(response) {
									$scope.error.player = 'ERROR: ' + response.data.msg;
								});
							}

							// set the data to be used in the modal, then ask for the user to
							// give the header names that correspond to each 
							$scope.modal = {
								fields     : tab.fields,
								teams      : $scope.data.team,
								capitalize : $scope.capitalize
							};
							// construct the body of the modal
							var body = '<table class="table"><thead><tr>';
							body += '<th>Field</th><th>.csv Header</th></tr></thead><tbody>';
							body += '<tr><td>Team</td>';
							body += '<td><select class="form-control" ng-model="result.team">';
							body += '<option ng-repeat="team in data.teams" ng-bind="team.school"';
							body += ' value="{{ team._id }}"</option></select></td></tr>';
							body += '<tr ng-repeat="field in data.fields" '
							body += 'ng-if="field.name !== &#39;team&#39;">';
							body += '<td ng-bind="data.capitalize(field.name)"></td>';
							body += '<td><input class="form-control" type="text" ng-model="result[field.name]"</td>';
							body += '</td></tbody></table>';
							$scope.openModal('Enter the header correspondance for the .csv',
								body, 'Submit', 'Cancel', function(result) {
									// store the header results given by the user
									headers = result;
									// read the files
									reader.readAsBinaryString(fileInput.files[0]);
								}
							);
						}
					},
					button : {
						class : 'btn-success',
						text  : 'Upload',
						glyph : 'upload'
					}
				},
				{
					title  : 'delete-all-players',
					submit : function(tab) {
						// confirm in a modal that the deletion is desired
						$scope.openModal('Are you sure you want to delete all players?',
							'THIS IS A DRASTIC DECISION. ARE YOU ABSOLUTELY SURE?', 'Yes', 'No', function(result) {
								$scope.openModal('I am double checking. You REALLY want to delete all players?',
									'Really, please do not mess this up.', 'Yes', 'No', function(result) {
										$http.delete('/admin/player/delete/all').then(function(response) {
											// remove all players locally
											$scope.data.player = [];
											$scope.data.team.forEach(function() {
												team.players = [];
											});
										}, function(response) {
											$scope.error.player = 'ERROR: ' + response.msg;
										});
									}
								);
							}
						);
					},
					button : {
						class : 'btn-warning',
						text  : 'Delete All',
						glyph : 'warning-sign'
					}
				}
			],
		},
	];

	// initialize scope edit, new, error, data, and sort variables
	$scope.edit = {};
	$scope.new = {};
	$scope.error = { general: null };
	$scope.data = {};
	$scope.sort = {};

	$scope.tabs.forEach(function(tab) {
		// initialize the edit variable including blank strings for each field
		// and sort variable as zero for all fields
		var edit = { active : false, index  : null };
		$scope.sort[tab.name] = {};
		tab.fields.forEach(function(field) {
			edit[field.name] = '';
			$scope.sort[tab.name][field.name] = 0;
		});

		// set the edit, new, and error variables
		$scope.edit[tab.name] = edit;
		$scope.new[tab.name] = false;
		$scope.error[tab.name] = null;
	});

	// the current tab, a setter function, and a predicate isActiveTab function
	$scope.currTab = 0;
	$scope.setTab = function(tab) {
		$scope.currTab = tab;
	}
	$scope.isActiveTab = function(tab) {
		return $scope.tabs[$scope.currTab].name === tab;
	}

	// ---------------------------------------------------- Initialize
	$scope.tabs.forEach(function(tab) {
		// get the list of all data for the data type
		$http.get('/admin/' + tab.name + '/list').then(function(response) {
			$scope.data[tab.name] = response.data;
		}, function(response) {
			$scope.error[tab.name] = 'ERROR: ' + response.data.msg;
		});
	});

	// ---------------------------------------------------- Model types
	// create the methods that apply to each tab, and add them to the tab object
	$scope.tabs.forEach(function(tab) {
		// open the form for editing an existing object
		tab.openEditForm = function(index) {
			// get object information
			var obj = $scope.data[tab.name][index];

			// set the edit information
			$scope.edit[tab.name].active = true;
			$scope.edit[tab.name].index = index;
			tab.fields.forEach(function(field) {
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
			return $scope.search(tab.fields, function(field) {
				var val = $scope.edit[tab.name][field.name];
				 return typeof val === 'string' && !val.length ||
						typeof val === 'number' && val < 0 ||
						typeof val === 'object' && (!val || !val.length);
			}) === SENTINAL;
		}

		// open the form for creating a new object
		tab.openCreateForm = function() {
			$scope.new[tab.name] = true;
		}

		// close the form by resetting the edit and new fields
		tab.closeForm = function() {
			$scope.edit[tab.name].active = false;
			$scope.edit[tab.name].index = null;
			tab.fields.forEach(function(field) {
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
				$scope.openModal($scope.getSafeText(['Are you sure you want to delete ' + tab.getName(obj) + '?']),
					$scope.getSafeText(['If you proceed, all data associated with ' + tab.getName(obj) + ' will be deleted.']),
					'yes', 'no', function() {
						// delete the object
						$http.delete('/admin/' + tab.name + '/delete/' + obj._id).then(function(response) {
							// splice out the deleted object and close the form
							$scope.data[tab.name].splice(index, 1);
							// do anything specified in the tab success callback
							if (tab.methods.delete.success) {
								tab.methods.delete.success(obj);
							}
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
			// create the object containing all data from the form, push to the modal
			var obj = {};
			tab.fields.forEach(function(field) {
				obj[field.name] = $scope.edit[tab.name][field.name];
			});
			$scope.modal = obj;

			// if there is a creation method and the form is open for creation
			if (tab.methods.create && $scope.new[tab.name]) {
				// confirm in a modal that the creation is desired
				$scope.openModal($scope.getSafeText(tab.methods.create.title),
					$scope.getSafeText(tab.methods.create.body), 'yes', 'no', function() {
						$http.post('/admin/' + tab.name + '/create', obj).then(function(response) {
							// add the new object to the local array and close the form
							$scope.data[tab.name].push(response.data[tab.name]);
							// do anything specified in the tab success callback
							if (tab.methods.create.success) {
								tab.methods.create.success(response.data[tab.name]);
							}
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
					$scope.openModal($scope.getSafeText(tab.methods.edit.title),
						$scope.getSafeText(tab.methods.edit.body), 'yes', 'no', function() {
							// get the url and post the edit request
							var url = '/admin/' + tab.name + '/edit/' + original._id;
							$http.post(url, obj).then(function(response) {
								// update the local list wih the edit
								$scope.data[tab.name][$scope.edit[tab.name].index] = response.data[tab.name];
								// do anything specified in the tab success callback
								if (tab.methods.edit.success) {
									tab.methods.edit.success(response.data[tab.name]);
								}
								tab.closeForm();
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
			if (Object.keys(obj).length > 3) {
				console.log([key, original[key], obj[key]]);
			}
			if (original[key] !== obj[key]) {
				return true;
			}
		}
		return false;
	}

	// transforms the input based on callback, else the identity function
	$scope.transform = function(str, transform) {
		if (transform) {
			return transform(str);
		} else {
			return str;
		}
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

	// iterate through array in a search and return the index
	$scope.search = function(arr, isMatch) {
		for (var i = 0; i < arr.length; i++) {
			if (isMatch(arr[i])) {
				return i;
			}
		}
		return SENTINAL;
	}

	// sorts the data for a tab by a field so long as editing is not ongoing
	$scope.sortByField = function(tab, field) {
		if (!$scope.edit[tab.name].active) {
			// if first sort ascending, otherwise switch from the previous
			if (!$scope.sort[tab.name][field.name]) {
				$scope.sort[tab.name][field.name] = 1;
			} else {
				$scope.sort[tab.name][field.name] *= -1;
			}
			// reset all other fields in the tab to 0
			for (var i = 0; i < tab.fields.length; i++) {
				if (tab.fields[i].name !== field.name) {
					$scope.sort[tab.name][tab.fields[i].name] = 0;
				}
			}

			$scope.data[tab.name].sort(function(a, b) {
				var a = a[field.name];
				var b = b[field.name];
				if (typeof a === 'string') {
					// ignore case
					a = a.toUpperCase();
					b = b.toUpperCase();
				}
				if (a < b) return -1 * $scope.sort[tab.name][field.name];
				if (a > b) return 1 * $scope.sort[tab.name][field.name];
				return 0;
			});
		}
	}

	// chooses the sort glyphicon based on the tab and field
	$scope.getSortGlyphicon = function(tab, field) {
		switch($scope.sort[tab.name][field.name]) {
			case 1: return 'glyphicon-sort-by-attributes';
			case -1: return 'glyphicon-sort-by-attributes-alt';
			default: return 'glyphicon-sort';
		}
	}

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

	// ---------------------------------------------------- Constants
	var SENTINAL = -1;

	$scope.handedness = [
		{ value: 0, text: 'Right'},
		{ value: 1, text: 'Left'},
		{ value: 2, text: 'Switch'}
	];

	$scope.positions = [
		{ value: 1, text: 'Pitcher', abbr: 'P' },
		{ value: 2, text: 'Catcher', abbr: 'C' },
		{ value: 3, text: 'First Baseman', abbr: '1B' },
		{ value: 4, text: 'Second Baseman', abbr: '2B' },
		{ value: 5, text: 'Third Baseman', abbr: '3B' },
		{ value: 6, text: 'Short Stop', abbr: 'SS' },
		{ value: 7, text: 'Left Fielder', abbr: 'LF' },
		{ value: 8, text: 'Center Fielder', abbr: 'CF' },
		{ value: 9, text: 'Right Fielder', abbr: 'RF' },
		{ value: 10, text: 'Infielder', abbr: 'INF' },
		{ value: 11, text: 'Outfielder', abbr: 'OF' },
	];

	// ---------------------------------------------------- Modal
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
});

// the modal controller, which simply takes either a 'yes' or 'no' and sends the proper response
angular.module('ptAdminApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, data) {
	$scope.data = data;
	$scope.result = {};
	$scope.close = function(result) { $uibModalInstance.close(result); }
	$scope.dismiss = function() { $uibModalInstance.dismiss(); }
});
