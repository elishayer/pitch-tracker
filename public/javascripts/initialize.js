// helper function to create a paper in the DOM, set its id, and return the paper
createPaper = function(domId, paperId, size) {
    var elem = document.getElementById(domId);
    var paper = Raphael(domId, size, size);
    elem.children[0].id = paperId;
    return paper;
}

// helper function to draw a one directional line through the Raphael path function
drawLine = function(paper, x0, y0, x1, y1, strokeColor, strokeWidth) {
    return paper.path("M" + x0 + "," + y0 + "L" + x1 + "," + y1).attr({
        stroke: strokeColor,
        "stroke-width":strokeWidth
    });
}

// helper function to get the location of the nth zone
zoneLoc = function(n) {
    return ZONE_BUFFER + n * BOX_SIZE;
}

// helper function to draw lines in terms of zone locations
drawZoneLine = function(paper, x0, y0, x1, y1, strokeColor, strokeWidth) {
    drawLine(paper, zoneLoc(x0), zoneLoc(y0), zoneLoc(x1), zoneLoc(y1), strokeColor, strokeWidth);
}

// Draws the raphael.js paper representing the zone
drawZonePaper = function() {

    // create the zone paper object
    var zonePaper = createPaper(ZONE_PARENT, ZONE_ID, ZONE_SIZE);

    // draw outside box
    zonePaper.rect(ZONE_BUFFER, ZONE_BUFFER, ZONE_SIZE - 2 * ZONE_BUFFER, ZONE_SIZE - 2 * ZONE_BUFFER).attr({
        fill: ZONE_FILL,
        stroke: ZONE_COLOR,
        "stroke-width":ZONE_LINE_WIDTH
    });

    // draw inside box (the strike zone)
    zonePaper.rect(ZONE_BUFFER + BOX_SIZE, ZONE_BUFFER + BOX_SIZE, 3 * BOX_SIZE, 3 * BOX_SIZE).attr({
        fill: ZONE_FILL,
        stroke: ZONE_COLOR,
        "stroke-width":(ZONE_LINE_WIDTH / 2)
    });

    // form a 3x3 grid on the interior of the strike zone
    drawZoneLine(zonePaper, 2, 1, 2, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // vertical left
    drawZoneLine(zonePaper, 3, 1, 3, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // vertical right
    drawZoneLine(zonePaper, 1, 2, 4, 2, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // horizontal top
    drawZoneLine(zonePaper, 1, 3, 4, 3, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // horizontal bottom

    // define the outside of the zone with diagonal lines on the corners and straight lines in the middle of the edges
    // perpendicular sides
    drawZoneLine(zonePaper, 2.5, 0, 2.5, 1, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // top middle
    drawZoneLine(zonePaper, 2.5, 5, 2.5, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // bottom middle
    drawZoneLine(zonePaper, 0, 2.5, 1, 2.5, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // middle left
    drawZoneLine(zonePaper, 5, 2.5, 4, 2.5, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // middle right

    // diagonal corners
    drawZoneLine(zonePaper, 0, 0, 1, 1, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // diagonal top left
    drawZoneLine(zonePaper, 0, 5, 1, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // diagonal bottom left
    drawZoneLine(zonePaper, 5, 0, 4, 1, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // diagonal top right
    drawZoneLine(zonePaper, 5, 5, 4, 4, ZONE_COLOR, ZONE_LINE_WIDTH / 3); // diagonal bottom right

    // cache the canvas object
    var $canvas = $(zonePaper.canvas)

    // record the location of zone clicks
    $canvas.attr('ng-click', "zoneClickListener($event)");
    
    // draw the prospective pitch, if one exists
    zonePaper.circle(200, 200, PITCH_RADIUS).attr({
        "ng-show"      : "{{ curr.pitch.location.horizontal > 0 && curr.pitch.location.vertical > 0 }}",
        cx             : "{{ getPitchX() }}",
        cy             : "{{ getPitchY() }}",
        fill           : PROSPECTIVE_COLOR,
        stroke         : PITCH_STROKE_COLOR,
        "stroke-width" : PITCH_STROKE_WIDTH
    });
}

// draws a diamond based on the center and "radius" using a svg-style path
drawDiamond = function(paper, centerX, centerY, width, fill) {
    return paper.path("M" + (centerX - width) + "," + centerY + "l" + width + "," + (-width) + "l" + width + "," + width + "l" + (-width) + "," + width + "Z").attr({
        fill: fill,
        stroke: "black",
        "stroke-width": BASE_STROKE_WIDTH
    });
}

// function to draw the bases paper using raphael.js
drawBasesPaper = function() {
    // enter the bases paper into the DOM
    basesPaper = createPaper("basesParent", "bases", BASES_PAPER_SIZE);

    // initialize bases array
    var bases = [];

    // draw basepath diamond
    drawDiamond(basesPaper, BASES_PAPER_SIZE / 2, BASES_PAPER_SIZE / 2, BASES_PAPER_SIZE / 2, GRASS_COLOR);
    bases[FIRST_BASE] = {
        raphael : drawDiamond(basesPaper, BASES_PAPER_SIZE - BASE_SIZE, BASES_PAPER_SIZE / 2, BASE_SIZE, BASE_COLOR_EMPTY),
        player  : null
    };
    bases[SECOND_BASE] = {
        raphael : drawDiamond(basesPaper, BASES_PAPER_SIZE / 2, BASE_SIZE, BASE_SIZE, BASE_COLOR_EMPTY),
        player  : null
    };
    bases[THIRD_BASE] = {
        raphael : drawDiamond(basesPaper, BASE_SIZE, BASES_PAPER_SIZE / 2, BASE_SIZE, BASE_COLOR_EMPTY),
        player  : null
    };
}

// draw the paper representing the zone
drawZonePaper();

// draw the paper representing the bases
drawBasesPaper();