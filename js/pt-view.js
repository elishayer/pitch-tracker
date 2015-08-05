/* view.js
 * -------------
 * Controls the view of the pitch tracker
 */

// constants
var ZONE_SIZE= document.getElementById("zoneParent").clientWidth;          // height and width of paper
var BUFFER = ZONE_SIZE/ 100;
var BOX_SIZE= (ZONE_SIZE - 2 * BUFFER) / 5;
var LINE_WIDTH = ZONE_SIZE/ 75;
var PITCH_RADIUS = 10;

// color constants
var BOX_FILL = "white";
var BOX_COLOR = "black";
var BALL_COLOR = "green";
var STRIKE_COLOR = "red";
var IN_PLAY_COLOR = "blue";
var PROSPECTIVE_COLOR = "yellow";

// object for pitch tracker view functions
var ptView = {};

// global variable to keep track of pitches in the view
ptView.drawnPitches = {}
ptView.drawnPitches.prospectivePitch = null;
ptView.drawnPitches.finalizedPitches = [];


// input possibilities and constants
ptView.inputViews = {
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
ptView.currentInputView = PLAYER_INPUT_VIEW;

// global variables for the papers
ptView.zone = null;
ptView.bases = null;

// on the initial load draws the Raphael graphics
window.onload = function() {
    // helper function to get the location of the nth zone
    function zoneLoc(n) {
        return BUFFER + n * BOX_SIZE;
    }

    // helper function to draw a one directional line through the Raphael path function
    function drawLine(paper, x0, y0, x1, y1, strokeColor, strokeWidth) {
        return paper.path("M" + x0 + "," + y0 + "L" + x1 + "," + y1).attr({
            stroke: strokeColor,
            "stroke-width":strokeWidth
        });
    }

    // helper function to draw lines in terms of zone locations
    function drawZoneLine(paper, x0, y0, x1, y1, strokeColor, strokeWidth) {
        drawLine(paper, zoneLoc(x0), zoneLoc(y0), zoneLoc(x1), zoneLoc(y1), strokeColor, strokeWidth);
    }

    // helper function to create a paper in the DOM, set its id, and return the paper
    function createPaper(domId, paperId, size) {
        var elem = document.getElementById(domId);
        var paper = Raphael(domId, size, size);
        elem.children[0].id = paperId;
        return paper;
    }

    // create the zone paper object
    ptView.zone = createPaper("zoneParent", "zone", ZONE_SIZE);

    // create main boxes
    ptView.zone.rect(BUFFER, BUFFER, ZONE_SIZE- 2 * BUFFER, ZONE_SIZE- 2 * BUFFER).attr({
        fill: BOX_FILL,
        stroke: BOX_COLOR,
        "stroke-width":LINE_WIDTH
    });
    ptView.zone.rect(BUFFER + BOX_SIZE, BUFFER + BOX_SIZE, 3 * BOX_SIZE, 3 * BOX_SIZE).attr({
        fill: BOX_FILL,
        stroke: BOX_COLOR,
        "stroke-width":(LINE_WIDTH / 2)
    });

    // form a 3x3 grid on the interior of the strike zone
    drawZoneLine(ptView.zone, 2, 1, 2, 4, BOX_COLOR, LINE_WIDTH / 3); // vertical left
    drawZoneLine(ptView.zone, 3, 1, 3, 4, BOX_COLOR, LINE_WIDTH / 3); // vertical right
    drawZoneLine(ptView.zone, 1, 2, 4, 2, BOX_COLOR, LINE_WIDTH / 3); // horizontal top
    drawZoneLine(ptView.zone, 1, 3, 4, 3, BOX_COLOR, LINE_WIDTH / 3); // horizontal bottom

    // define the outside of the zone with diagonal lines on the corners and straight lines in the middle of the edges
    // perpendicular sides
    drawZoneLine(ptView.zone, 2.5, 0, 2.5, 1, BOX_COLOR, LINE_WIDTH / 3); // top middle
    drawZoneLine(ptView.zone, 2.5, 5, 2.5, 4, BOX_COLOR, LINE_WIDTH / 3); // bottom middle
    drawZoneLine(ptView.zone, 0, 2.5, 1, 2.5, BOX_COLOR, LINE_WIDTH / 3); // middle left
    drawZoneLine(ptView.zone, 5, 2.5, 4, 2.5, BOX_COLOR, LINE_WIDTH / 3); // middle right

    // diagonal corners
    drawZoneLine(ptView.zone, 0, 0, 1, 1, BOX_COLOR, LINE_WIDTH / 3); // diagonal top left
    drawZoneLine(ptView.zone, 0, 5, 1, 4, BOX_COLOR, LINE_WIDTH / 3); // diagonal bottom left
    drawZoneLine(ptView.zone, 5, 0, 4, 1, BOX_COLOR, LINE_WIDTH / 3); // diagonal top right
    drawZoneLine(ptView.zone, 5, 5, 4, 4, BOX_COLOR, LINE_WIDTH / 3); // diagonal bottom right

    // enter the bases paper into the DOM
    ptView.bases = createPaper("basesParent", "bases", 200);

    // attach listeners to the newly drawn objects
    attachListeners();
}

// helper function to draw a pitch of a given color and record the
// pitch in the drawnPitches object
// returns the object that was drawn
ptView.drawPitch = function(location, color) {
    return ptView.zone.circle(location.x, location.y, PITCH_RADIUS).attr({
        fill: color,
        stroke: "black",
        "stroke-width": 2
    });
}

// a function that converts the [0, 1] location to a pixel location
ptView.convertLocation = function(location) {
    return {
        x: ZONE_SIZE* location.horizontal,
        y: ZONE_SIZE* location.vertical
    }
}

// a helper function to determine the appropriate color for a pitch
ptView.getColor = function(pitch) {
    if (pitch.result == 'b') {
        return BALL_COLOR;
    } else if (pitch.result == 'p') {
        return IN_PLAY_COLOR;
    } else {
        return STRIKE_COLOR;
    }
}

// function to draw a prospective pitch, colored yellow
ptView.drawProspectivePitch = function(location) {
    // remove any earlier prospectivePitch from the zone
    if (ptView.drawnPitches.prospectivePitch) {
        ptView.drawnPitches.prospectivePitch.remove();
    }
    // draw the new prospectivePitch and store the corresponding variable
    ptView.drawnPitches.prospectivePitch = ptView.drawPitch(ptView.convertLocation(location), PROSPECTIVE_COLOR);
}

// function to submit the current prospective pitch
ptView.submitPitch = function(pitch) {
    if (!drawnPitches.prospectivePitch) {
        ptView.drawProspectivePitch(pitch.location);
    }
    drawnPitches.prospectivePitch.attr({fill:ptView.getColor(pitch)});
    drawnPitches.finalizedPitches.push({
        raphael: drawnPitches.prospectivePitch,
        pitch: pitch
    });
    ptView.incrementTablePitch(pitch);
    drawnPitches.prospectivePitch = null;
}

// set the message, with the default color of black
ptView.setMessage = function(text, color) {
    if (!color) {
        color = "black";
    }
    var $message = $("#message");
    $message.text(text);
    $message.toggle(true);
    $message.css("color", color);
}

// set the message and make it visible
ptView.setError = function(errorText) {
    ptView.setMessage("Error: " + errorText, "red");
}

// make the message not visible
ptView.clearMessage = function() {
    $("#message").toggle(false);
}

// helper function to create a td element with text as its contents and append it the row
ptView.incrementRow = function(row, text, rowClass) {
    var entry = document.createElement("td");
    entry.innerText = text;
    if (rowClass) {
        entry.className = rowClass;
    }
    row.appendChild(entry);
}

// function to add a row to the table with the information about pitch
ptView.incrementTablePitch = function(pitch) {
    var row = document.createElement("tr");
    ptView.incrementRow(row, drawnPitches.finalizedPitches.length);
    ptView.incrementRow(row, pitch.velocity);
    ptView.incrementRow(row, pitch.type);
    ptView.incrementRow(row, pitch.result);
    ptView.incrementRow(row, ptModel.getCount());
    $("#pitchesTable").append(row);
}

// adds a full width, centered result row to the table
ptView.incrementTableResult = function(result) {
    $("#pitchesTable").append('<tr><td colspan="5" style="text-align: center;">Result: ' + result + '</td></tr>');
}

// ends the pa by adding to the table and clearing the pitches from the zone
ptView.endPa = function(result) {
    ptView.incrementTableResult(result);
    ptView.clearPitches();
}

// clear all pitches from drawnPitches
ptView.clearPitches = function() {
    // removes each pitch from the zone
    drawnPitches.finalizedPitches.forEach(function(pitch) {
        pitch.raphael.remove();
    });
    // empties the array
    drawnPitches.finalizedPitches = [];
    // if there is a prospective pitch, removes from the zone and nulls it out
    if (drawnPitches.prospectivePitch) {
        drawnPitches.prospectivePitch.raphael.remove();
        drawnPitches.prospectivePitch = null;
    }
}

// returns the focus to the top input/selector of the current input view
ptView.refocus = function() {
    $(ptView.inputViews[ptView.currentInputView].focus).focus();
}

// sets the single input view that is specified by id to visisble
ptView.setInputView = function(view) {
    for (var inputView in ptView.inputViews) {
        // guard against properties being added to the Array object type
        if (ptView.inputViews.hasOwnProperty(inputView)) {
            // if the inputView is the selected view
            if (inputView == view) {
                // update and show the currentInputView
                currentInputView = view;
                $(ptView.inputViews[inputView].view).toggle(true);
                // focus on the relevant selector or input
                ptView.refocus();
            } else {
                // don't show the non-selected input views
                $(ptView.inputViews[inputView].view).toggle(false);
            }
        }
    }
}

// initialize the view to show the player inputs
ptView.setInputView(PLAYER_INPUT_VIEW);
