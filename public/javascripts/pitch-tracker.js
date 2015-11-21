// gloval variable for the pitch tracker application
var pt = {};

// an object to contain functions
pt.fn = {};

// paper container within the view
pt.papers = {};

// bases container within the view
pt.bases = [];

// the current plate appearance data object
pt.currentPa = {};

// the prospective pitch object for both the model and view
pt.prospectivePitch = {};

// holds the number of runs per game for 9 innings
pt.innings = [
	[0, 0],	[0, 0],	[0, 0],	[0, 0],	[0, 0],	[0, 0],	[0, 0],	[0, 0],	[0, 0]
];

// states for inning, outs
pt.currInning = {
	num : 1,
	top : true
}
pt.outs   = 0; 
