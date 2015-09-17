// CONSTANTS ----------------------------------------------------------

// constants to convert pitch results
var BALL = 1;
var SWINGING_STRIKE = 2;
var CALLED_STRIKE = 3;
var FOUL = 4;
var FOUL_TIP = 5;
var IN_PLAY = 6;

// constants to convery pa results
var SINGLE = 1;
var DOUBLE = 2;
var TRIPLE = 3;
var HOME_RUN = 4;
var IN_PLAY_OUT = 5;
var ERROR = 6;
var STIRKEOUT = 7;
var WALK = 8;
var HIT_BY_PITCH = 9;

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
var BASE_SIZE = BASES_PAPER_SIZE / 12;
var BASE_STROKE_WIDTH = 5;
var FIRST_BASE = 0;
var SECOND_BASE = 1;
var THIRD_BASE = 2;
var GRASS_COLOR = 'green';
var BASE_COLOR_EMPTY = 'white';
var BASE_COLOR_OCCUPIED = 'red';

// input view constants
var PLAYER_INPUT_GROUP = 0;
var PITCH_INPUT_GROUP = 1;
var RESULT_INPUT_GROUP = 2;
var NUM_INPUT_GROUPS = 3;

// input group classes
var INPUT_ACTIVE = 'ptInputActive';
var INPUT_DISABLED = 'ptInputDisabled';

var INPUT_GROUPS = [
	{
		group: 'player',
		wrapper: '#playerInput',
		inputs: [
			'#pitcherNameInput',
			'#hitterNameInput',
			'#submitPlayers'
		]
	},
	{
		group: 'pitch',
		wrapper: '#pitchInput',
		inputs: [
			'#pitchTypeInput',
			'#pitchVelocityInput',
			'#pitchResultInput',
			'#submitPitch'
		]
	},
	{
		group: 'result',
		wrapper: '#resultInput',
		inputs: [
			'#paResultInput',
			'#submitResult'
		]
	}
]

// message constants
ERROR_COLOR = 'red';
MESSAGE_COLOR_DEFAULT = 'black';
