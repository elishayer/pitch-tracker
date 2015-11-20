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

// states for inning, outs
pt.inning = {
	num : 1,
	top : true
}
pt.outs   = 0; 
