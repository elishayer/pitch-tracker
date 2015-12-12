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

// ---------------------------------------- User
var UserSchema = new mongoose.Schema({
	name         : String,
	password     : String,
	//sessions     : [mongoose.Schema.Types.ObjectId]
});

var User = mongoose.model('User', UserSchema);

// ---------------------------------------- Plate Appearance
var PASchema = new mongoose.Schema({
	game         : mongoose.Schema.Types.ObjectId,
	hitter       : String, //mongoose.Schema.Types.ObjectId,
	pitcher      : String, //mongoose.Schema.Types.ObjectId,
	pitches      : [mongoose.Schema.Types.ObjectId],
	result       : Number,
	start        : Date,
	end          : Date
	// TODO: bases before and/or after the pa
});

var PA = mongoose.model('PA', PASchema);

// ---------------------------------------- Pitch
var PitchSchema = new mongoose.Schema({
	type         : Number,
	velocity     : Number,
	result       : Number,
	xLoc         : Number,
	yLoc         : Number,
	balls        : Number,
	strikes      : Number,
	pitchNum     : Number,
	pa           : mongoose.Schema.Types.ObjectId,
	time         : Date
});

var Pitch = mongoose.model('Pitch', PitchSchema);

// ---------------------------------------- Exports
module.exports = {
	PA: PA,
	Pitch: Pitch,
	User: User
}