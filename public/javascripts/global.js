// gloval variable for the pitch tracker application
var pt = {};

// variables relevant to the view
pt.view = {};

// variables relevant to the model
pt.model = {};

// an object to contain functions
pt.fn = {};

// paper container within the view
pt.view.papers = {};

// bases container within the view
pt.view.bases = [];

// DOM ready --------------------------
$(document).ready(function() {

	// draw the paper representing the zone
	pt.fn.drawZonePaper();

	// draw the paper representing the bases
	pt.fn.drawBasesPaper();

	// event listeners ----------------

	// click on the zone paper
	$("#zone").click(function() {
		console.log("zone clicked");
	});
});

// CONSTANTS --------------------------

// zone constants
var ZONE_SIZE = document.getElementById("zoneParent").clientWidth;
var ZONE_BUFFER = ZONE_SIZE/ 100;
var BOX_SIZE = (ZONE_SIZE - 2 * ZONE_BUFFER) / 5;
var ZONE_LINE_WIDTH = ZONE_SIZE/ 75;
var ZONE_FILL = "white";
var ZONE_COLOR = "black";

// pitch constants
var PITCH_RADIUS = 10;
var PITCH_STROKE_WIDTH = 2;
var BALL_COLOR = "green";
var STRIKE_COLOR = "red";
var IN_PLAY_COLOR = "blue";
var PROSPECTIVE_COLOR = "yellow";

// bases constants
var BASES_PAPER_SIZE = document.getElementById("basesParent").clientWidth;
var BASE_SIZE = BASES_PAPER_SIZE / 12;
var BASE_STROKE_WIDTH = 5;
var FIRST_BASE = 0;
var SECOND_BASE = 1;
var THIRD_BASE = 2;
var GRASS_COLOR = "green";
var BASE_COLOR_EMPTY = "white";
var BASE_COLOR_OCCUPIED = "red";

// input view constants
var PLAYER_INPUT_VIEW = "player";
var PITCH_INPUT_VIEW = "pitch";
var RESULT_INPUT_VIEW = "result";

// FUNCTIONS --------------------------

// helper function to create a paper in the DOM, set its id, and return the paper
pt.fn.createPaper = function(domId, paperId, size) {
    var elem = document.getElementById(domId);
    var paper = Raphael(domId, size, size);
    elem.children[0].id = paperId;
    return paper;
}

// helper function to draw a one directional line through the Raphael path function
pt.fn.drawLine = function(paper, x0, y0, x1, y1, strokeColor, strokeWidth) {
    return paper.path("M" + x0 + "," + y0 + "L" + x1 + "," + y1).attr({
        stroke: strokeColor,
        "stroke-width":strokeWidth
    });
}

// helper function to get the location of the nth zone
pt.fn.zoneLoc = function(n) {
    return ZONE_BUFFER + n * BOX_SIZE;
}

// helper function to draw lines in terms of zone locations
pt.fn.drawZoneLine = function(paper, x0, y0, x1, y1, strokeColor, strokeWidth) {
    pt.fn.drawLine(paper, pt.fn.zoneLoc(x0), pt.fn.zoneLoc(y0), pt.fn.zoneLoc(x1), pt.fn.zoneLoc(y1), strokeColor, strokeWidth);
}

// Draws the raphael.js paper representing the zone
pt.fn.drawZonePaper = function() {

    // create the zone paper object
    pt.view.papers.zonePaper = pt.fn.createPaper("zoneParent", "zone", ZONE_SIZE);

    // draw outside box
    pt.view.papers.zonePaper.rect(ZONE_BUFFER, ZONE_BUFFER, ZONE_SIZE - 2 * ZONE_BUFFER, ZONE_SIZE - 2 * ZONE_BUFFER).attr({
        fill: ZONE_FILL,
        stroke: ZONE_COLOR,
        "stroke-width":ZONE_LINE_WIDTH
    });

    // draw inside box (the strike zone)
    pt.view.papers.zonePaper.rect(ZONE_BUFFER + BOX_SIZE, ZONE_BUFFER + BOX_SIZE, 3 * BOX_SIZE, 3 * BOX_SIZE).attr({
        fill: ZONE_FILL,
        stroke: ZONE_COLOR,
        "stroke-width":(ZONE_LINE_WIDTH / 2)
    });

    // form a 3x3 grid on the interior of the strike zone
    pt.fn.drawZoneLine(pt.view.papers.zonePaper, 2, 1, 2, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // vertical left
    pt.fn.drawZoneLine(pt.view.papers.zonePaper, 3, 1, 3, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // vertical right
    pt.fn.drawZoneLine(pt.view.papers.zonePaper, 1, 2, 4, 2, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // horizontal top
    pt.fn.drawZoneLine(pt.view.papers.zonePaper, 1, 3, 4, 3, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // horizontal bottom

    // define the outside of the zone with diagonal lines on the corners and straight lines in the middle of the edges
    // perpendicular sides
    pt.fn.drawZoneLine(pt.view.papers.zonePaper, 2.5, 0, 2.5, 1, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // top middle
    pt.fn.drawZoneLine(pt.view.papers.zonePaper, 2.5, 5, 2.5, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // bottom middle
    pt.fn.drawZoneLine(pt.view.papers.zonePaper, 0, 2.5, 1, 2.5, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // middle left
    pt.fn.drawZoneLine(pt.view.papers.zonePaper, 5, 2.5, 4, 2.5, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // middle right

    // diagonal corners
    pt.fn.drawZoneLine(pt.view.papers.zonePaper, 0, 0, 1, 1, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // diagonal top left
    pt.fn.drawZoneLine(pt.view.papers.zonePaper, 0, 5, 1, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // diagonal bottom left
    pt.fn.drawZoneLine(pt.view.papers.zonePaper, 5, 0, 4, 1, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // diagonal top right
    pt.fn.drawZoneLine(pt.view.papers.zonePaper, 5, 5, 4, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // diagonal bottom right
}

// draws a diamond based on the center and "radius" using a svg-style path
pt.fn.drawDiamond = function(paper, centerX, centerY, width, fill) {
    return paper.path("M" + (centerX - width) + "," + centerY + "l" + width + "," + (-width) + "l" + width + "," + width + "l" + (-width) + "," + width + "Z").attr({
        fill: fill,
        stroke: "black",
        "stroke-width": BASE_STROKE_WIDTH
    });
}

// function to draw the bases paper using raphael.js
pt.fn.drawBasesPaper = function() {
    // enter the bases paper into the DOM
    pt.view.papers.basesPaper = pt.fn.createPaper("basesParent", "bases", BASES_PAPER_SIZE);

    // draw basepath diamond
    pt.fn.drawDiamond(pt.view.papers.basesPaper, BASES_PAPER_SIZE / 2, BASES_PAPER_SIZE / 2, BASES_PAPER_SIZE / 2, GRASS_COLOR);
    pt.view.bases[FIRST_BASE] = {
        raphael: pt.fn.drawDiamond(pt.view.papers.basesPaper, BASES_PAPER_SIZE - BASE_SIZE, BASES_PAPER_SIZE / 2, BASE_SIZE, BASE_COLOR_EMPTY),
        occupied: false
    };
    pt.view.bases[SECOND_BASE] = {
        raphael: pt.fn.drawDiamond(pt.view.papers.basesPaper, BASES_PAPER_SIZE / 2, BASE_SIZE, BASE_SIZE, BASE_COLOR_EMPTY),
        occupied: false
    };
    pt.view.bases[THIRD_BASE] = {
        raphael: pt.fn.drawDiamond(pt.view.papers.basesPaper, BASE_SIZE, BASES_PAPER_SIZE / 2, BASE_SIZE, BASE_COLOR_EMPTY),
        occupied: false
    };

}