/* constants.js
 * Eli Shayer
 * ------------
 * get constants associated with pitch tracking and graphics
 */

getPtConstants = function() {
	return {
		// constants inherent to baseball rules
		STRIKES_PER_K: 3,
		BALLS_PER_BB: 4,
		OUTS_PER_INNING: 3,
		MIN_INNINGS: 9,

		// constants to convert pitch results
		BALL: 1,
		SWINGING_STRIKE: 2,
		CALLED_STRIKE: 3,
		FOUL: 4,
		FOUL_TIP: 5,
		IN_PLAY: 6,

		// map to convert from pitch result to text
		PITCH_RESULT_MAP: {
			1 : "Ball",
			2 : "Swinging Strike",
			3 : "Called Strike",
			4 : "Foul",
			5 : "Foul Tip",
			6 : "In Play"
		},

		// constants to convert pitch types
		FOUR_SEAM_FAST: 1,
		TWO_SEAM_FAST: 2,
		SINKER: 3,
		CHANGEUP: 4,
		CURVEBALL: 5,
		SLIDER: 6,

		// map to convert from pitch type to text
		PITCH_TYPE_MAP: {
			1 : "4-Seam Fastball",
			2 : "2-Seam Fastball",
			3 : "Sinker",
			4 : "Changeup",
			5 : "Curveball",
			6 : "Slider"
		},

		// constants to convery pa results
		SINGLE: 1,
		DOUBLE: 2,
		TRIPLE: 3,
		HOME_RUN: 4,
		IN_PLAY_OUT: 5,
		ERROR: 6,
		STRIKEOUT: 7,
		WALK: 8,
		HIT_BY_PITCH: 9,

		// map to convert from pa result to text
		PA_RESULT_MAP: {
			1 : "Single",
			2 : "Double",
			3 : "Triple",
			4 : "Home Run",
			5 : "In Play Out(s)",
			6 : "Error",
			7 : "Strikeout",
			8 : "Walk",
			9 : "Hit By Pitch",
		},

		// input view constants
		PLAYER_INPUT_GROUP: 0,
		PITCH_INPUT_GROUP: 1,
		RESULT_INPUT_GROUP: 2,

		// user input constants
		SIGN_IN: 0,
		CREATE_ACCOUNT: 1,
		GUEST_USER: 2,

		// session type constants
		GAME: 0,
		PRACTICE: 1,
		BULLPEN: 2,

		// position constants
		// a map from position to numerical entry
		NUM_TO_POS: {
			1 : 'P',
			2 : 'C',
			3 : '1B',
			4 : '2B',
			5 : '3B',
			6 : 'SS',
			7 : 'LF',
			8 : 'CF',
			9 : 'RF',
			10: 'INF',
			11: 'OF',
			12: 'DH'
		},

		POS_TO_NUM: {
			'P'  : 1,
			'C'  : 2,
			'1B' : 3,
			'2B' : 4,
			'3B' : 5,
			'SS' : 6,
			'LF' : 7,
			'CF' : 8,
			'RF' : 9,
			'INF': 10,
			'OF' : 11,
			'DH' : 12
		}
	}
}