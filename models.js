/* Pitch Tracker
 * models.js
 * -------------
 * Contains the models for the Pitch Tracker application:
 * 1) Session
 * 2) Team
 * 3) Plate Appearance
 * 4) Pitch
 *
 * TODO:
 * Player, Game, Inning, Half-Inning
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
*/
// ---------------------------------------- Plate Appearance
var PASchema = new mongoose.Schema({
	game         : mongoose.Schema.Types.ObjectId,
	hitter       : mongoose.Schema.Types.ObjectId,
	pitcher      : mongoose.Schema.Types.ObjectId,
	pitches      : [mongoose.Schema.Types.ObjectId],
	result       : Number,
	start        : Date,
	end          : Date
});

var PA = mongoose.model('PA', PASchema);

// ---------------------------------------- Pitch
var PitchSchema = new mongoose.Schema({
	type         : Number,
	velocity     : Number,
	result       : Number,
	xLoc         : Number,
	yLoc         : Number,
	pa           : mongoose.Schema.Types.ObjectId,
	date         : { type: Date, default: Date.now }
});

var Pitch = mongoose.model('Pitch', PitchSchema);

// ---------------------------------------- Exports
module.exports = {
	PA: PA,
	Pitch: Pitch
}