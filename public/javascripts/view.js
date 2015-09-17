/* Pitch Tracker
 * view.js
 * -------------
 * Contains all functions related to manipulating the view
 */

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
    pt.papers.zonePaper = pt.fn.createPaper(ZONE_PARENT, ZONE_ID, ZONE_SIZE);

    // draw outside box
    pt.papers.zonePaper.rect(ZONE_BUFFER, ZONE_BUFFER, ZONE_SIZE - 2 * ZONE_BUFFER, ZONE_SIZE - 2 * ZONE_BUFFER).attr({
        fill: ZONE_FILL,
        stroke: ZONE_COLOR,
        "stroke-width":ZONE_LINE_WIDTH
    });

    // draw inside box (the strike zone)
    pt.papers.zonePaper.rect(ZONE_BUFFER + BOX_SIZE, ZONE_BUFFER + BOX_SIZE, 3 * BOX_SIZE, 3 * BOX_SIZE).attr({
        fill: ZONE_FILL,
        stroke: ZONE_COLOR,
        "stroke-width":(ZONE_LINE_WIDTH / 2)
    });

    // form a 3x3 grid on the interior of the strike zone
    pt.fn.drawZoneLine(pt.papers.zonePaper, 2, 1, 2, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // vertical left
    pt.fn.drawZoneLine(pt.papers.zonePaper, 3, 1, 3, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // vertical right
    pt.fn.drawZoneLine(pt.papers.zonePaper, 1, 2, 4, 2, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // horizontal top
    pt.fn.drawZoneLine(pt.papers.zonePaper, 1, 3, 4, 3, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // horizontal bottom

    // define the outside of the zone with diagonal lines on the corners and straight lines in the middle of the edges
    // perpendicular sides
    pt.fn.drawZoneLine(pt.papers.zonePaper, 2.5, 0, 2.5, 1, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // top middle
    pt.fn.drawZoneLine(pt.papers.zonePaper, 2.5, 5, 2.5, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // bottom middle
    pt.fn.drawZoneLine(pt.papers.zonePaper, 0, 2.5, 1, 2.5, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // middle left
    pt.fn.drawZoneLine(pt.papers.zonePaper, 5, 2.5, 4, 2.5, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // middle right

    // diagonal corners
    pt.fn.drawZoneLine(pt.papers.zonePaper, 0, 0, 1, 1, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // diagonal top left
    pt.fn.drawZoneLine(pt.papers.zonePaper, 0, 5, 1, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // diagonal bottom left
    pt.fn.drawZoneLine(pt.papers.zonePaper, 5, 0, 4, 1, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // diagonal top right
    pt.fn.drawZoneLine(pt.papers.zonePaper, 5, 5, 4, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // diagonal bottom right
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
    pt.papers.basesPaper = pt.fn.createPaper("basesParent", "bases", BASES_PAPER_SIZE);

    // draw basepath diamond
    pt.fn.drawDiamond(pt.papers.basesPaper, BASES_PAPER_SIZE / 2, BASES_PAPER_SIZE / 2, BASES_PAPER_SIZE / 2, GRASS_COLOR);
    pt.bases[FIRST_BASE] = {
        raphael: pt.fn.drawDiamond(pt.papers.basesPaper, BASES_PAPER_SIZE - BASE_SIZE, BASES_PAPER_SIZE / 2, BASE_SIZE, BASE_COLOR_EMPTY),
        occupied: false
    };
    pt.bases[SECOND_BASE] = {
        raphael: pt.fn.drawDiamond(pt.papers.basesPaper, BASES_PAPER_SIZE / 2, BASE_SIZE, BASE_SIZE, BASE_COLOR_EMPTY),
        occupied: false
    };
    pt.bases[THIRD_BASE] = {
        raphael: pt.fn.drawDiamond(pt.papers.basesPaper, BASE_SIZE, BASES_PAPER_SIZE / 2, BASE_SIZE, BASE_COLOR_EMPTY),
        occupied: false
    };
}

// helper function to draw a pitch of a given color and record the
// pitch in the drawnPitches object
// returns the object that was drawn
pt.fn.drawPitch = function(location, color) {
    return pt.papers.zonePaper.circle(location.x, location.y, PITCH_RADIUS).attr({
        fill: color,
        stroke: PITCH_STROKE_COLOR,
        "stroke-width": PITCH_STROKE_WIDTH
    });
}

// a function that converts the [0, 1] location to a pixel location
pt.fn.convertLocation = function(location) {
    return {
        x: ZONE_SIZE * location.horizontal,
        y: ZONE_SIZE * location.vertical
    }
}

// a helper function to determine the appropriate color for a pitch
pt.fn.getColor = function(pitch) {
    if (pitch.result == 'b') {
        return BALL_COLOR;
    } else if (pitch.result == 'p') {
        return IN_PLAY_COLOR;
    } else {
        return STRIKE_COLOR;
    }
}

// function to draw a prospective pitch, colored yellow
pt.fn.drawProspectivePitch = function(location) {
    // remove any earlier prospectivePitch from the zone
    if (pt.prospectivePitch.raphael) {
        pt.prospectivePitch.raphael.remove();
    }
    // draw the new prospectivePitch and return the corresponding variable
    return pt.fn.drawPitch(pt.fn.convertLocation(location), PROSPECTIVE_COLOR);
}

// MESSAGE FUNCTIONS --------------------------------------------------

// set the message, with the default color of black
pt.fn.setMessage = function(text, color) {
    if (!color) {
        color = MESSAGE_COLOR_DEFAULT;
    }
    var $message = $("#message");
    $message.text(text);
    $message.toggle(true);
    $message.css("color", color);
}

// set the message and make it visible
pt.fn.setError = function(errorText, errorLabel) {
    pt.fn.setMessage((errorLabel ? errorLabel : "Error: ") + errorText, ERROR_COLOR);
}

// make the message not visible
pt.fn.clearMessage = function() {
    $("#message").toggle(false);
}

// INPUT GROUP FUNCTIONS ----------------------------------------------

/* sets the activeGroup input group to active and all others to disabled
 * by setting both the wrapper class and individual inputs to disabled
 */
pt.fn.setInputGroup = function(activeGroupIndex) {
    $.each(INPUT_GROUPS, function(index, inputGroup) {
        // cache wrapper and boolean for whether active
        var $wrapper = $(inputGroup.wrapper);
        var active = index === activeGroupIndex;

        // set active/disabled state through wrapper class
        $wrapper.toggleClass(INPUT_ACTIVE, active);
        $wrapper.toggleClass(INPUT_DISABLED, !active);

        // set the child inputs of inactive input groups to disabled
        $.each(inputGroup.inputs, function(index, input) {
            $(input).prop('disabled', !active);
        });
    });
}

// clears the inputs related to the specified by index input group
pt.fn.clearInputGroup = function(index) {
    $.each(INPUT_GROUPS[index].inputs, function(i, input) {
        $(input).val('');
    });
}

// helper function to clear the current input group
pt.fn.clearCurrentInputGroup = function() {
    pt.fn.clearInputGroup(pt.currentInputGroup);
}

// INFO BAR FUNCTIONS -------------------------------------------------
pt.fn.updateBoxScore = function() {

}

// updates the state table with the number of balls, strikes, outs
pt.fn.updateStateTable = function(balls, strikes, outs) {
    console.log('updating state table');
    $('#stateTable #balls').text(balls);
    $('#stateTable #strikes').text(strikes);
    $('#stateTable #outs').text(outs);
}

// updates the player names in the info bar
pt.fn.updatePlayers = function(hitterName, pitcherName) {
    $('#hitter').text(hitterName);
    $('#pitcher').text(pitcherName);
}
