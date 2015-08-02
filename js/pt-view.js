/* view.js
 * -------------
 * Controls the view of the pitch tracker
 */

// constants
var SIZE = box.clientWidth;          // height and width of paper
var BUFFER = SIZE / 100;
var BOX_SIZE = (SIZE - 2 * BUFFER) / 5;
var LINE_WIDTH = SIZE / 75;
var PITCH_RADIUS = 10;

// color constants
var BOX_FILL = "white"
var BOX_COLOR = "black";
var BALL_COLOR = "green";
var STRIKE_COLOR = "red";
var IN_PLAY_COLOR = "blue";
var PROSPECTIVE_COLOR = "yellow";

// input possibilities and constants
var inputViews = {
    player: {
        view: "#playerInput",
        focus: "#pitcherNameInput"
    },
    pitch: {
        view: "#pitchInput",
        focus: "#pitchTypeInput"
    },
    result: {
        view: "#resultInput",
        focus: "#paResultSelector"
    }
};
var PLAYER_INPUT_VIEW = "player";
var PITCH_INPUT_VIEW = "pitch";
var RESULT_INPUT_VIEW = "result";

// initialize the current view to the player input view
var currentInputView = PLAYER_INPUT_VIEW;

// global variable for the paper
var paper = null;

// refreshes the pitch tracker zone
refreshGraphics = function() {
    // get the box div from the DOM
    var box = document.getElementById("box");

    // create paper
    paper = Raphael("box", SIZE, SIZE);

    // set id of the paper to "paper"
    box.children[0].id = "paper";

    // create main boxes
    var outside = paper.rect(BUFFER, BUFFER, SIZE - 2 * BUFFER, SIZE - 2 * BUFFER).attr({
        fill: BOX_FILL,
        stroke: BOX_COLOR,
        "stroke-width":LINE_WIDTH,
    });
    var inside = paper.rect(BUFFER + BOX_SIZE, BUFFER + BOX_SIZE, 3 * BOX_SIZE, 3 * BOX_SIZE).attr({
        fill: BOX_FILL,
        stroke: BOX_COLOR,
        "stroke-width":(LINE_WIDTH / 2)
    });

    // helper function to get the location of the nth zone
    function zone(n) {
        return BUFFER + n * BOX_SIZE;
    }

    // helper function to draw a one directional line through the Raphael path function
    function drawLine(paper, x0, y0, x1, y1, strokeColor, strokeWidth) {
        return paper.path("M" + zone(x0) + "," + zone(y0) + "L" + zone(x1) + "," + zone(y1)).attr({
            stroke: strokeColor,
            "stroke-width":strokeWidth
        });
    }

    // form a 3x3 grid on the interior of the strike zone
    drawLine(paper, 2, 1, 2, 4, BOX_COLOR, LINE_WIDTH / 3); // vertical left
    drawLine(paper, 3, 1, 3, 4, BOX_COLOR, LINE_WIDTH / 3); // vertical right
    drawLine(paper, 1, 2, 4, 2, BOX_COLOR, LINE_WIDTH / 3); // horizontal top
    drawLine(paper, 1, 3, 4, 3, BOX_COLOR, LINE_WIDTH / 3); // horizontal bottom

    // define the outside of the zone with diagonal lines on the corners and straight lines in the middle of the edges
    // perpendicular sides
    drawLine(paper, 2.5, 0, 2.5, 1, BOX_COLOR, LINE_WIDTH / 3); // top middle
    drawLine(paper, 2.5, 5, 2.5, 4, BOX_COLOR, LINE_WIDTH / 3); // bottom middle
    drawLine(paper, 0, 2.5, 1, 2.5, BOX_COLOR, LINE_WIDTH / 3); // middle left
    drawLine(paper, 5, 2.5, 4, 2.5, BOX_COLOR, LINE_WIDTH / 3); // middle right

    // diagonal corners
    drawLine(paper, 0, 0, 1, 1, BOX_COLOR, LINE_WIDTH / 3); // diagonal top left
    drawLine(paper, 0, 5, 1, 4, BOX_COLOR, LINE_WIDTH / 3); // diagonal bottom left
    drawLine(paper, 5, 0, 4, 1, BOX_COLOR, LINE_WIDTH / 3); // diagonal top right
    drawLine(paper, 5, 5, 4, 4, BOX_COLOR, LINE_WIDTH / 3); // diagonal bottom right

    // attach listeners to the newly drawn objects
    attachListeners();
}

// on the initial load and any subsequent resize, refreshes the zone
window.onload = refreshGraphics;

// initialize the view to show the player inputs
setInputView(PLAYER_INPUT_VIEW);

// global variable to keep track of pitches in the view
drawnPitches = {}
drawnPitches.prospectivePitch = null;
drawnPitches.finalizedPitches = [];

// object for pitch tracker view functions
ptViewFunctions = {};

// helper function to draw a pitch of a given color and record the
// pitch in the drawnPitches object
// returns the object that was drawn
ptViewFunctions.drawPitch = function(location, color) {
    return paper.circle(location.x, location.y, PITCH_RADIUS).attr({
        fill: color,
        stroke: "black",
        "stroke-width": 2
    });
}

// a function that converts the [0, 1] location to a pixel location
ptViewFunctions.convertLocation = function(location) {
    return {
        x: SIZE * location.horizontal,
        y: SIZE * location.vertical
    }
}

// a helper function to determine the appropriate color for a pitch
ptViewFunctions.getColor = function(pitch) {
    if (pitch.result == 'b') {
        return BALL_COLOR;
    } else if (pitch.result == 'p') {
        return IN_PLAY_COLOR;
    } else {
        return STRIKE_COLOR;
    }
}

// function to draw a prospective pitch, colored yellow
ptViewFunctions.drawProspectivePitch = function(location) {
    // remove any earlier prospectivePitch from the paper
    if (drawnPitches.prospectivePitch) {
        drawnPitches.prospectivePitch.remove();
    }
    // draw the new prospectivePitch and store the corresponding variable
    drawnPitches.prospectivePitch = ptViewFunctions.drawPitch(ptViewFunctions.convertLocation(location), PROSPECTIVE_COLOR);
}

// function to submit the current prospective pitch
ptViewFunctions.submitPitch = function(pitch) {
    if (!drawnPitches.prospectivePitch) {
        ptViewFunctions.drawProspectivePitch(pitch.location);
    }
    drawnPitches.prospectivePitch.attr({fill:ptViewFunctions.getColor(pitch)});
    drawnPitches.finalizedPitches.push({
        raphael: drawnPitches.prospectivePitch,
        pitch: pitch
    });
    ptViewFunctions.incrementTablePitch(pitch);
    drawnPitches.prospectivePitch = null;
}

// set the message, with the default color of black
ptViewFunctions.setMessage = function(text, color) {
    if (!color) {
        color = "black";
    }
    var $message = $("#message");
    $message.text(text);
    $message.toggle(true);
    $message.css("color", color);
}

// set the message and make it visible
ptViewFunctions.setError = function(errorText) {
    ptViewFunctions.setMessage("Error: " + errorText, "red");
}

// make the error message not visible
ptViewFunctions.noError = function() {
    $("#message").toggle(false);
}

// helper function to create a td element with text as its contents and append it the row
ptViewFunctions.incrementRow = function(row, text, rowClass) {
    var entry = document.createElement("td");
    entry.innerText = text;
    if (rowClass) {
        entry.className = rowClass;
    }
    row.appendChild(entry);
}

// function to add a row to the table with the information about pitch
ptViewFunctions.incrementTablePitch = function(pitch) {
    var row = document.createElement("tr");
    ptViewFunctions.incrementRow(row, drawnPitches.finalizedPitches.length);
    ptViewFunctions.incrementRow(row, pitch.velocity);
    ptViewFunctions.incrementRow(row, pitch.type);
    ptViewFunctions.incrementRow(row, pitch.result);
    ptViewFunctions.incrementRow(row, ptModel.getCount());
    $("#pitchesTable").append(row);
}

// adds a full width, centered result row to the table
ptViewFunctions.incrementTableResult = function(result) {
    $("#pitchesTable").append('<tr><td colspan="5" style="text-align: center;">Result: ' + result + '</td></tr>');
}

// ends the pa by adding to the table and clearing the pitches from the paper
ptViewFunctions.endPa = function(result) {
    ptViewFunctions.incrementTableResult(result);
    ptViewFunctions.clearPitches();
}

// clear all pitches from drawnPitches
ptViewFunctions.clearPitches = function() {
    // removes each pitch from the paper
    drawnPitches.finalizedPitches.forEach(function(pitch) {
        pitch.raphael.remove();
    });
    // empties the array
    drawnPitches.finalizedPitches = [];
    // if there is a prospective pitch, removes from the paper and nulls it out
    if (drawnPitches.prospectivePitch) {
        drawnPitches.prospectivePitch.raphael.remove();
        drawnPitches.prospectivePitch = null;
    }
}
