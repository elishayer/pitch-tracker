/* constants.js
 * Eli Shayer
 * ------------
 * get constants associated with pitch tracking and graphics
 */

// constants inherent to baseball rules
var STRIKES_PER_K = 3;
var BALLS_PER_BB = 4;
var OUTS_PER_INNING = 3;
var MIN_INNINGS = 9;

// constants to convert pitch results
var BALL = 1;
var SWINGING_STRIKE = 2;
var CALLED_STRIKE = 3;
var FOUL = 4;
var FOUL_TIP = 5;
var IN_PLAY = 6;

// map to convert from pitch result to text
var PITCH_RESULT_MAP = {
	1 : "Ball",
	2 : "Swinging Strike",
	3 : "Called Strike",
	4 : "Foul",
	5 : "Foul Tip",
	6 : "In Play"
}

// constants to convert pitch types
var FOUR_SEAM_FAST = 1;
var TWO_SEAM_FAST = 2;
var SINKER = 3;
var CHANGEUP = 4;
var CURVEBALL = 5;
var SLIDER = 6;

// map to convert from pitch type to text
var PITCH_TYPE_MAP = {
	1 : "4-Seam Fastball",
	2 : "2-Seam Fastball",
	3 : "Sinker",
	4 : "Changeup",
	5 : "Curveball",
	6 : "Slider"
}

// constants to convery pa results
var SINGLE = 1;
var DOUBLE = 2;
var TRIPLE = 3;
var HOME_RUN = 4;
var IN_PLAY_OUT = 5;
var ERROR = 6;
var STRIKEOUT = 7;
var WALK = 8;
var HIT_BY_PITCH = 9;

// map to convert from pa result to text
var PA_RESULT_MAP = {
	1 : "Single",
	2 : "Double",
	3 : "Triple",
	4 : "Home Run",
	5 : "In Play Out(s)",
	6 : "Error",
	7 : "Strikeout",
	8 : "Walk",
	9 : "Hit By Pitch",
}

// zone constants
var ZONE_PARENT = 'zoneParent';
var ZONE_ID = 'zone';
var ZONE_SIZE = document.getElementById(ZONE_PARENT).clientWidth;
var ZONE_BUFFER = ZONE_SIZE / 100;
var BOX_SIZE = (ZONE_SIZE - 2 * ZONE_BUFFER) / 5;
var ZONE_LINE_WIDTH = ZONE_SIZE/ 75;
var INNER_SWF = 2;
var LINE_SWF = 3;
var ZONE_FILL = 'white';
var ZONE_COLOR = 'black';

// pitch constants
var PITCH_RADIUS = 10;
var PITCH_STROKE_WIDTH = 2;
var BALL_COLOR = 'green';
var STRIKE_COLOR = 'red';
var IN_PLAY_COLOR = 'blue';
var PROSPECTIVE_COLOR = 'yellow';
var PITCH_STROKE_COLOR = 'black';

// bases constants
var BASES_PARENT = 'basesParent';
var BASES_SVG_SIZE = document.getElementById(BASES_PARENT).clientWidth;
var BASE_SIZE = BASES_SVG_SIZE / 8;
var BASE_STROKE_WIDTH = 2;
var FIRST_BASE = 0;
var SECOND_BASE = 1;
var THIRD_BASE = 2;
var HOME_BASE = 3;
var GRASS_COLOR = 'green';
var BASE_COLOR_EMPTY = 'white';
var BASE_COLOR_OCCUPIED = 'red';

// state constants
var STATE_PARENT = 'stateParent';
var STATE_SVG_WIDTH = document.getElementById(STATE_PARENT).clientWidth;
var STATE_SVG_HEIGHT = 70;
var STATE_RADIUS = 9;
var STATE_X_PADDING = 8;
var STATE_Y_PADDING = 5;
var STATE_Y_OFFSET = 2;
var STATE_TEXT_OFFSET = 24;
var STATE_STROKE_WIDTH = 3;
var STATE_STROKE = '#888888';
var STATE_FILL = '#dddddd';

// input view constants
var PLAYER_INPUT_GROUP = 0;
var PITCH_INPUT_GROUP = 1;
var RESULT_INPUT_GROUP = 2;

// user input constants
var SIGN_IN = 0;
var CREATE_ACCOUNT = 1;
var GUEST_USER = 2;

// session type constants
var GAME = 0;
var PRACTICE = 1;
var BULLPEN = 2;

// position constants
// a map from position to numerical entry
var NUMBER_TO_POSITON = {
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
}
var POSITION_TO_NUMBER = {
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
	'OF' : 11
}
