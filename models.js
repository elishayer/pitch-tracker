/* Pitch Tracker
 * models.js
 * -------------
 * Contains the models for the Pitch Tracker application:
 * 1) Session
 * 2) Team
 * 3) Plate Appearance
 * 4) Pitch
 */

// require the mongoose module
var mongoose = require('mongoose');
/*
// ---------------------------------------- Session
var SessionSchema = new mongoose.Schema({
	date         : Date,
	user         : mongoose.Schema.Types.ObjectId,
	teams        : {
		home         : mongoose.Schema.Types.ObjectId,
		away         : mongoose.Schema.Types.ObjectId
	},
	innings      : [mongoose.Schema.Types.ObjectId]
});

var Session = mongoose.model('Session', SessionSchema);

// ---------------------------------------- Team
var TeamSchema = new mongoose.Schema({
	name         : String,
	conference   : String,
	players      : [mongoose.Schema.Types.ObjectId]
});

var Team = mongoose.model('Team', TeamSchema);

// ---------------------------------------- Plate Appearance
var PASchema = new mongoose.Schema({
	pitches      : [mongoose.Schema.Types.ObjectId],
	result       : Number,
	hitter       : mongoose.Schema.Types.ObjectId,
	pitcher      : mongoose.Schema.Types.ObjectId
});

var PA = mongoose.model('PA', PASchema);
*/
// ---------------------------------------- Pitch
var PitchSchema = new mongoose.Schema({
	type         : Number,
	velocity     : Number,
	result       : Number,
	xLoc         : Number,
	yLoc         : Number,
	pa           : mongoose.Schema.Types.ObjectId
});

var Pitch = mongoose.model('Pitch', PitchSchema);

// ---------------------------------------- Exports
module.exports = {
	Pitch: Pitch
}