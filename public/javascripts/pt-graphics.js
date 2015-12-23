/* pt-graphics.js
 * Eli Shayer
 * ----------
 * Draws the zone and bases for the pitch tracker application using the d3.js library
 */

var ptGraphics = {
    // get the graphics functions 
    drawGraphics: function() {
        // call the zone, bases, and states functions
        for (key in this.fn) {
            console.log(key);
            this.fn[key]();
        }
    },
    // set the constants that are both passed in and specific to graphics
    setConstants: function(constants) {
        ptGraphics.const = constants;

        // zone constants
        ptGraphics.const.ZONE_PARENT = 'zoneParent';
        ptGraphics.const.ZONE_ID = 'zone';
        ptGraphics.const.ZONE_SIZE = document.getElementById(ptGraphics.const.ZONE_PARENT).clientWidth;
        ptGraphics.const.ZONE_BUFFER = ptGraphics.const.ZONE_SIZE / 100;
        ptGraphics.const.BOX_SIZE = (ptGraphics.const.ZONE_SIZE - 2 * ptGraphics.const.ZONE_BUFFER) / 5;
        ptGraphics.const.ZONE_LINE_WIDTH = ptGraphics.const.ZONE_SIZE/ 75;
        ptGraphics.const.INNER_SWF = 2;
        ptGraphics.const.LINE_SWF = 3;
        ptGraphics.const.ZONE_FILL = 'white';
        ptGraphics.const.ZONE_COLOR = 'black';

        // pitch constants
        ptGraphics.const.PITCH_RADIUS = 10;
        ptGraphics.const.PITCH_STROKE_WIDTH = 2;
        ptGraphics.const.BALL_COLOR = 'green';
        ptGraphics.const.STRIKE_COLOR = 'red';
        ptGraphics.const.IN_PLAY_COLOR = 'blue';
        ptGraphics.const.PROSPECTIVE_COLOR = 'yellow';
        ptGraphics.const.PITCH_STROKE_COLOR = 'black';

        // bases constants
        ptGraphics.const.BASES_PARENT = 'basesParent';
        ptGraphics.const.BASES_SVG_SIZE = document.getElementById(ptGraphics.const.BASES_PARENT).clientWidth;
        ptGraphics.const.BASE_SIZE = ptGraphics.const.BASES_SVG_SIZE / 8;
        ptGraphics.const.BASE_STROKE_WIDTH = 2;
        ptGraphics.const.FIRST_BASE = 0;
        ptGraphics.const.SECOND_BASE = 1;
        ptGraphics.const.THIRD_BASE = 2;
        ptGraphics.const.HOME_BASE = 3;
        ptGraphics.const.GRASS_COLOR = 'green';
        ptGraphics.const.BASE_COLOR_EMPTY = 'white';
        ptGraphics.const.BASE_COLOR_OCCUPIED = 'red';

        // state constants
        ptGraphics.const.STATE_PARENT = 'stateParent';
        ptGraphics.const.STATE_SVG_WIDTH = document.getElementById(ptGraphics.const.STATE_PARENT).clientWidth;
        ptGraphics.const.STATE_SVG_HEIGHT = 70;
        ptGraphics.const.STATE_RADIUS = 9;
        ptGraphics.const.STATE_X_PADDING = 8;
        ptGraphics.const.STATE_Y_PADDING = 5;
        ptGraphics.const.STATE_Y_OFFSET = 2;
        ptGraphics.const.STATE_TEXT_OFFSET = 24;
        ptGraphics.const.STATE_STROKE_WIDTH = 3;
        ptGraphics.const.STATE_STROKE = '#888888';
        ptGraphics.const.STATE_FILL = '#dddddd';
    },
    fn: {
        zone: function() {
            // create the zone svg
            var zoneSvg = d3.select('#' + ptGraphics.const.ZONE_PARENT)
                .append('svg')
                .attr({
                    width      : ptGraphics.const.ZONE_SIZE,
                    height     : ptGraphics.const.ZONE_SIZE,
                    id         : ptGraphics.const.ZONE_ID,
                    'ng-click' : 'zoneClickListener($event)'
                });

            // draw each square defining the zone, outer and inner
            zoneSvg.selectAll('rect')
                .data([
                    {
                        numBox : 5,
                        buffer : ptGraphics.const.ZONE_BUFFER
                    },
                    {
                        numBox : 3,
                        buffer : ptGraphics.const.BOX_SIZE + ptGraphics.const.ZONE_BUFFER,
                        swf : ptGraphics.const.INNER_SWF
                    },
                ])
                .enter()
                .append('rect')
                .attr({
                    x              : function(d) { return d.buffer; },
                    y              : function(d) { return d.buffer; },
                    width          : function(d) { return d.numBox * ptGraphics.const.BOX_SIZE; },
                    height         : function(d) { return d.numBox * ptGraphics.const.BOX_SIZE; },
                    fill           : ptGraphics.const.ZONE_FILL,
                    stroke         : ptGraphics.const.ZONE_COLOR,
                    'stroke-width' : function(d) { return ptGraphics.const.ZONE_LINE_WIDTH / (d.swf || 1); },
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
                    x1             : function(d) { return d.x1 * ptGraphics.const.BOX_SIZE + ptGraphics.const.ZONE_BUFFER; },
                    y1             : function(d) { return d.y1 * ptGraphics.const.BOX_SIZE + ptGraphics.const.ZONE_BUFFER; },
                    x2             : function(d) { return d.x2 * ptGraphics.const.BOX_SIZE + ptGraphics.const.ZONE_BUFFER; },
                    y2             : function(d) { return d.y2 * ptGraphics.const.BOX_SIZE + ptGraphics.const.ZONE_BUFFER; },
                    stroke         : ptGraphics.const.ZONE_COLOR,
                    'stroke-width' : ptGraphics.const.ZONE_LINE_WIDTH / ptGraphics.const.LINE_SWF
                });

            // draw the prospective pitch, that updates with location changes
            zoneSvg.append('circle')
                .attr({
                    'ng-attr-cx'   : '{{ getPitchX(curr.pitch) }}', // ng-attr-cx to avoid error
                    'ng-attr-cy'   : '{{ getPitchY(curr.pitch) }}', // ng-attr-cy to avoid error
                    r              : ptGraphics.const.PITCH_RADIUS,
                    fill           : ptGraphics.const.PROSPECTIVE_COLOR,
                    stroke         : ptGraphics.const.PITCH_STROKE_COLOR,
                    'stroke-width' : ptGraphics.const.PITCH_STROKE_WIDTH
                });

            // draw all submitted pitches in the current plate appearance within a 'g' wrapper
            zoneSvg.append('circle')
                .attr({
                    'ng-repeat'    : 'pitch in curr.pa.pitches', // repeat for each pitch in the pa
                    'ng-attr-cx'   : '{{ getPitchX(pitch) }}', // ng-attr-cx to avoid error
                    'ng-attr-cy'   : '{{ getPitchY(pitch) }}', // ng-attr-cy to avoid error
                    r              : ptGraphics.const.PITCH_RADIUS,
                    fill           : '{{ getPitchColor(pitch) }}',
                    stroke         : ptGraphics.const.PITCH_STROKE_COLOR,
                    'stroke-width' : ptGraphics.const.PITCH_STROKE_WIDTH
                });
        },
        bases: function() {
            // create an svg for the bases
            d3.select('#' + ptGraphics.const.BASES_PARENT)
                .append('svg')
                .attr({
                    width  : ptGraphics.const.BASES_SVG_SIZE,
                    height : ptGraphics.const.BASES_SVG_SIZE
                })
                // draw each diamond
                .selectAll('path')
                .data([
                    // grass diamond
                    {
                        cx : ptGraphics.const.BASES_SVG_SIZE / 2,
                        cy : ptGraphics.const.BASES_SVG_SIZE / 2,
                        r  : ptGraphics.const.BASES_SVG_SIZE / 2,
                        fill : ptGraphics.const.GRASS_COLOR,
                        ngClass : "false"
                    },
                    // first base
                    {
                        cx : ptGraphics.const.BASES_SVG_SIZE - ptGraphics.const.BASE_SIZE,
                        cy : ptGraphics.const.BASES_SVG_SIZE / 2,
                        r  : ptGraphics.const.BASE_SIZE,
                        fill : ptGraphics.const.BASE_COLOR_EMPTY,
                        ngClass : "bases[0]"
                    },
                    // second base
                    {
                        cx : ptGraphics.const.BASES_SVG_SIZE / 2,
                        cy : ptGraphics.const.BASE_SIZE,
                        r  : ptGraphics.const.BASE_SIZE,
                        fill : ptGraphics.const.BASE_COLOR_EMPTY,
                        ngClass : "bases[1]"
                    },
                    // third base
                    {
                        cx : ptGraphics.const.BASE_SIZE,
                        cy : ptGraphics.const.BASES_SVG_SIZE / 2,
                        r  : ptGraphics.const.BASE_SIZE,
                        fill : ptGraphics.const.BASE_COLOR_EMPTY,
                        ngClass : "bases[2]"
                    }
                ])
                .enter()
                .append('path')
                .attr({
                    d                 : function(d) { return 'M' + (d.cx - d.r) + ',' + d.cy + 'l' + d.r + ',' + (-d.r) +
                                        'l' + d.r + ',' + d.r + 'l' + (-d.r) + ',' + d.r + 'Z'; },
                    fill              : function(d) { return d.fill; },
                    stroke            : 'black',
                    'stroke-width'    : ptGraphics.const.BASE_STROKE_WIDTH,
                    'ng-class'        : function(d) { return '{ occupied : ' + d.ngClass + '}'; },
                });
                // TODO: tooltip
        },
        states: function() {
            // data for the states display TODO: get the num from constants
            statesData = [
                { type : 'balls',   num : ptGraphics.const.BALLS_PER_BB,    data : 'curr.pa.balls'   },
                { type : 'strikes', num : ptGraphics.const.STRIKES_PER_K,   data : 'curr.pa.strikes' },
                { type : 'outs',    num : ptGraphics.const.OUTS_PER_INNING, data : 'curr.inning.outs'}
            ];

            // create an svg for the states
            var stateSvg = d3.select('#' + ptGraphics.const.STATE_PARENT)
                .append('svg')
                .attr({
                    width  : ptGraphics.const.STATE_SVG_WIDTH,
                    height : ptGraphics.const.STATE_SVG_HEIGHT
                });

            // draw the circles grouped by type
            stateSvg.selectAll('g')
                    .data(statesData)
                    .enter()
                    .append('g')
                    .append('circle')
                    .attr({
                        'ng-repeat'  : function(d) { return 'n in getRange(' + d.num + ')'; },
                        'ng-attr-cx' : function(d) { return '{{ ' + ptGraphics.const.STATE_TEXT_OFFSET + ' + ' + ptGraphics.const.STATE_RADIUS + ' * 2 * (n - 1) + ' + ptGraphics.const.STATE_X_PADDING + ' * n }}'; },
                        cy           : function(d, i) { return ptGraphics.const.STATE_RADIUS * (2 * i + 1) + ptGraphics.const.STATE_Y_PADDING * i; },
                        r            : ptGraphics.const.STATE_RADIUS,
                        stroke       : ptGraphics.const.STATE_STROKE,
                        fill         : ptGraphics.const.STATE_FILL,
                        'ng-class'   : function(d, i) { return '{ ' + d.type + ' : ' + d.data + ' >= n }'; }
                    });

            // place labels by type
            stateSvg.selectAll('text')
                .data(statesData)
                .enter()
                .append('text')
                .attr({
                    x : 0,
                    y : function(d, i) { return ptGraphics.const.STATE_RADIUS * (2 * (i + 1)) + ptGraphics.const.STATE_Y_PADDING * i - ptGraphics.const.STATE_Y_OFFSET; },
                    class : 'state-label'
                })
                // show only the first letter in upper case
                .text(function(d) { return d.type.substring(0, 1).toUpperCase(); });
            
        }
    }
}
