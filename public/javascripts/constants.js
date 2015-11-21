// CONSTANTS ----------------------------------------------------------

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
var ZONE_BUFFER = ZONE_SIZE/ 100;
var BOX_SIZE = (ZONE_SIZE - 2 * ZONE_BUFFER) / 5;
var ZONE_LINE_WIDTH = ZONE_SIZE/ 75;
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
var BASES_PAPER_SIZE = document.getElementById('basesParent').clientWidth;
var BASE_SIZE = BASES_PAPER_SIZE / 8;
var BASE_STROKE_WIDTH = 2;
var FIRST_BASE = 0;
var SECOND_BASE = 1;
var THIRD_BASE = 2;
var HOME_BASE = 3;
var GRASS_COLOR = 'green';
var BASE_COLOR_EMPTY = 'white';
var BASE_COLOR_OCCUPIED = 'red';

// input group classes
var INPUT_ACTIVE = 'ptInputActive';
var INPUT_DISABLED = 'ptInputDisabled';

// input group constants
var PLAYER_INPUT_GROUP = 0;
var PITCH_INPUT_GROUP = 1;
var RESULT_INPUT_GROUP = 2;
var NUM_INPUT_GROUPS = 3;

var INPUT_GROUPS = [
	{
		group: 'player',
		wrapper: '#playerInput',
		inputs: [
			'#pitcherNameInput',
			'#hitterNameInput',
			'#submitPlayers'
		],
		button: '#submitPlayers'
	},
	{
		group: 'pitch',
		wrapper: '#pitchInput',
		inputs: [
			'#pitchTypeInput',
			'#pitchVelocityInput',
			'#pitchResultInput',
			'#submitPitch'
		],
		button: '#submitPitch'
	},
	{
		group: 'result',
		wrapper: '#resultInput',
		inputs: [
			'#paResultInput',
			'#submitResult'
		],
		button: '#submitResult'
	}
]

// message constants
var ERROR_COLOR = 'red';
var MESSAGE_COLOR_DEFAULT = 'black';

// enter button keycode
var ENTER_KEYCODE = 13;
