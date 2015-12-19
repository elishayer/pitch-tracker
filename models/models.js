/* Pitch Tracker
 * models.js
 * -------------
 * Contains the models for the Pitch Tracker application:
 *   - Plate Appearance
 *   - Pitch
 *   - User
 *   - Session
 *   - Player
 *   - Team
 */

// require the mongoose module
var mongoose = require('mongoose');

// ---------------------------------------- Player
var PlayerSchema = new mongoose.Schema({
	name         : String,
	team         : mongoose.Schema.Types.ObjectId,
	sessions     : [mongoose.Schema.Types.ObjectId],
	number       : Number,
	position     : [String],
	height       : Number,
	weight       : Number,
	'bat-hand'   : Number,
	'throw-hand' : Number
});

var Player = mongoose.model('Player', PlayerSchema);

// ---------------------------------------- Team
var TeamSchema = new mongoose.Schema({
	school       : String,
	mascot       : String,
	abbreviation : String,
	players      : [mongoose.Schema.Types.ObjectId],
	sessions     : [mongoose.Schema.Types.ObjectId]
});

var Team = mongoose.model('Team', TeamSchema);

// ---------------------------------------- Session
var SessionSchema = new mongoose.Schema({
	date         : Date,
	user         : mongoose.Schema.Types.ObjectId,
	type         : Number,
	teams        : {
		home         : mongoose.Schema.Types.ObjectId,
		away         : mongoose.Schema.Types.ObjectId
	},
	pas          : [mongoose.Schema.Types.ObjectId]
});

var Session = mongoose.model('Session', SessionSchema);

// ---------------------------------------- User
var UserSchema = new mongoose.Schema({
	name         : String,
	password     : String,
	sessions     : [mongoose.Schema.Types.ObjectId]
});

var User = mongoose.model('User', UserSchema);

// ---------------------------------------- Plate Appearance
var PASchema = new mongoose.Schema({
	session      : mongoose.Schema.Types.ObjectId,
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
	PA      : PA,
	Pitch   : Pitch,
	User    : User,
	Session : Session,
	Team    : Team,
	Player  : Player
}