/* pt-graphics.js
 * Eli Shayer
 * ----------
 * Draws the zone and bases for the pitch tracker application using the d3.js library
 */

// create the zone svg
var zoneSvg = d3.select('#' + ZONE_PARENT)
                .append('svg')
                .attr({
                    width      : ZONE_SIZE,
                    height     : ZONE_SIZE,
                    id         : ZONE_ID,
                    'ng-click' : 'zoneClickListener($event)'
                });

// draw each square defining the zone, outer and inner
zoneSvg.selectAll('rect')
        .data([
            { numBox : 5, buffer : ZONE_BUFFER },
            { numBox : 3, buffer : BOX_SIZE + ZONE_BUFFER, swf : INNER_SWF },
        ])
        .enter()
        .append('rect')
        .attr({
            x              : function(d) { return d.buffer },
            y              : function(d) { return d.buffer },
            width          : function(d) { return d.numBox * BOX_SIZE },
            height         : function(d) { return d.numBox * BOX_SIZE },
            fill           : ZONE_FILL,
            stroke         : ZONE_COLOR,
            'stroke-width' : function(d) { return ZONE_LINE_WIDTH / (d.swf ? d.swf : 1) },
        });

// draw each line providing further detail to the zone
zoneSvg.selectAll('line')
        .data([
            // 3x3 grid in the inner box
            { x1 : 2,   y1 : 1,   x2 : 2,   y2 : 4   }, // vertical left
            { x1 : 3,   y1 : 1,   x2 : 3,   y2 : 4   }, // vertical right
            { x1 : 1,   y1 : 2,   x2 : 4,   y2 : 2   }, // horizontal top
            { x1 : 1,   y1 : 3,   x2 : 4,   y2 : 3   }, // horizontal bottom
            // straight lines from the center of each edge of boxes
            { x1 : 2.5, y1 : 0,   x2 : 2.5, y2 : 1   }, // vertical top
            { x1 : 2.5, y1 : 5,   x2 : 2.5, y2 : 4   }, // vertical bottom
            { x1 : 0  , y1 : 2.5, x2 : 1,   y2 : 2.5 }, // horizontal left
            { x1 : 5  , y1 : 2.5, x2 : 4,   y2 : 2.5 }, // horizontal right
            // diagonal lines
            { x1 : 0,   y1 : 0,   x2 : 1,   y2 : 1   }, // top left
            { x1 : 0,   y1 : 5,   x2 : 1,   y2 : 4   }, // top right
            { x1 : 5,   y1 : 5,   x2 : 4,   y2 : 4   }, // bottom right
            { x1 : 5,   y1 : 0,   x2 : 4,   y2 : 1   }, // bottom left
        ])
        .enter()
        .append('line')
        .attr({
            x1             : function(d) { return d.x1 * BOX_SIZE + ZONE_BUFFER },
            y1             : function(d) { return d.y1 * BOX_SIZE + ZONE_BUFFER },
            x2             : function(d) { return d.x2 * BOX_SIZE + ZONE_BUFFER },
            y2             : function(d) { return d.y2 * BOX_SIZE + ZONE_BUFFER },
            stroke         : ZONE_COLOR,
            'stroke-width' : ZONE_LINE_WIDTH / LINE_SWF
        });

// draw the prospective pitch, that updates with location changes
zoneSvg.append('circle')
        .attr({
            'ng-attr-cx'   : '{{ getPitchX(curr.pitch) }}', // ng-attr-cx to avoid error
            'ng-attr-cy'   : '{{ getPitchY(curr.pitch) }}', // ng-attr-cy to avoid error
            r              : PITCH_RADIUS,
            fill           : PROSPECTIVE_COLOR,
            stroke         : PITCH_STROKE_COLOR,
            'stroke-width' : PITCH_STROKE_WIDTH
        });

// draw all submitted pitches in the current plate appearance within a 'g' wrapper
zoneSvg.append('g')
        .attr('ng-repeat', 'pitch in curr.pa.pitches')
        .append('circle')
        .attr({
            'ng-attr-cx'   : '{{ getPitchX(pitch) }}', // ng-attr-cx to avoid error
            'ng-attr-cy'   : '{{ getPitchY(pitch) }}', // ng-attr-cy to avoid error
            r              : PITCH_RADIUS,
            fill           : '{{ getPitchColor(pitch) }}',
            stroke         : PITCH_STROKE_COLOR,
            'stroke-width' : PITCH_STROKE_WIDTH
        });

// create an svg for the bases
d3.select('#' + BASES_PARENT)
    .append('svg')
    .attr({
        width  : BASES_SVG_SIZE,
        height : BASES_SVG_SIZE
    }) // draw each diamond
    .selectAll('path')
    .data([
        // grass diamond
        { cx : BASES_SVG_SIZE / 2, cy : BASES_SVG_SIZE / 2, r : BASES_SVG_SIZE / 2,
            fill : GRASS_COLOR, ngClass : "false"},
        // first base
        { cx : BASES_SVG_SIZE - BASE_SIZE, cy : BASES_SVG_SIZE / 2, r : BASE_SIZE,
            fill : BASE_COLOR_EMPTY, ngClass : "bases[0]"},
        // second base
        { cx : BASES_SVG_SIZE / 2, cy : BASE_SIZE,          r : BASE_SIZE,
            fill : BASE_COLOR_EMPTY, ngClass : "bases[1]"},
        // third base
        { cx : BASE_SIZE, cy : BASES_SVG_SIZE / 2, r : BASE_SIZE,
            fill : BASE_COLOR_EMPTY, ngClass : "bases[2]"}
    ])
    .enter()
    .append('path')
    .attr({
        d              : function(d) { return 'M' + (d.cx - d.r) + ',' + d.cy + 'l' + d.r + ',' + (-d.r) +
                         'l' + d.r + ',' + d.r + 'l' + (-d.r) + ',' + d.r + 'Z' },
        fill           : function(d) { return d.fill },
        stroke         : 'black',
        'stroke-width' : BASE_STROKE_WIDTH,
        'ng-class'     : function(d) { return '{ occupied : ' + d.ngClass + '}' },
    });
    // TODO: tooltip
