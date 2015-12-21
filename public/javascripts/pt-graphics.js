/* pt-graphics.js
 * Eli Shayer
 * ----------
 * Draws the zone and bases for the pitch tracker application using the d3.js library
 */

var ptGraphics = {
    // get the graphics functions 
    callFunctions: function() {
        // call the zone, bases, and states functions
        for (key in this.fn) {
            if (key !== 'const') {
                this.fn[key]();
            }
        }
    },
    // set the constants that are both passed in and specific to graphics
    setConstants: function(constants) {
        this.fn.const = constants;

        // zone constants
        this.fn.const.ZONE_PARENT = 'zoneParent';
        this.fn.const.ZONE_ID = 'zone';
        this.fn.const.ZONE_SIZE = document.getElementById(this.fn.const.ZONE_PARENT).clientWidth;
        this.fn.const.ZONE_BUFFER = this.fn.const.ZONE_SIZE / 100;
        this.fn.const.BOX_SIZE = (this.fn.const.ZONE_SIZE - 2 * this.fn.const.ZONE_BUFFER) / 5;
        this.fn.const.ZONE_LINE_WIDTH = this.fn.const.ZONE_SIZE/ 75;
        this.fn.const.INNER_SWF = 2;
        this.fn.const.LINE_SWF = 3;
        this.fn.const.ZONE_FILL = 'white';
        this.fn.const.ZONE_COLOR = 'black';

        // pitch constants
        this.fn.const.PITCH_RADIUS = 10;
        this.fn.const.PITCH_STROKE_WIDTH = 2;
        this.fn.const.BALL_COLOR = 'green';
        this.fn.const.STRIKE_COLOR = 'red';
        this.fn.const.IN_PLAY_COLOR = 'blue';
        this.fn.const.PROSPECTIVE_COLOR = 'yellow';
        this.fn.const.PITCH_STROKE_COLOR = 'black';

        // bases constants
        this.fn.const.BASES_PARENT = 'basesParent';
        this.fn.const.BASES_SVG_SIZE = document.getElementById(this.fn.const.BASES_PARENT).clientWidth;
        this.fn.const.BASE_SIZE = this.fn.const.BASES_SVG_SIZE / 8;
        this.fn.const.BASE_STROKE_WIDTH = 2;
        this.fn.const.FIRST_BASE = 0;
        this.fn.const.SECOND_BASE = 1;
        this.fn.const.THIRD_BASE = 2;
        this.fn.const.HOME_BASE = 3;
        this.fn.const.GRASS_COLOR = 'green';
        this.fn.const.BASE_COLOR_EMPTY = 'white';
        this.fn.const.BASE_COLOR_OCCUPIED = 'red';

        // state constants
        this.fn.const.STATE_PARENT = 'stateParent';
        this.fn.const.STATE_SVG_WIDTH = document.getElementById(this.fn.const.STATE_PARENT).clientWidth;
        this.fn.const.STATE_SVG_HEIGHT = 70;
        this.fn.const.STATE_RADIUS = 9;
        this.fn.const.STATE_X_PADDING = 8;
        this.fn.const.STATE_Y_PADDING = 5;
        this.fn.const.STATE_Y_OFFSET = 2;
        this.fn.const.STATE_TEXT_OFFSET = 24;
        this.fn.const.STATE_STROKE_WIDTH = 3;
        this.fn.const.STATE_STROKE = '#888888';
        this.fn.const.STATE_FILL = '#dddddd';
    },
    fn: {
        zone: function(constants) {
            console.log(this);
            // create the zone svg
            var zoneSvg = d3.select('#' + this.const.ZONE_PARENT)
                .append('svg')
                .attr({
                    width      : this.const.ZONE_SIZE,
                    height     : this.const.ZONE_SIZE,
                    id         : this.const.ZONE_ID,
                    'ng-click' : 'zoneClickListener($event)'
                });

            // draw each square defining the zone, outer and inner
            zoneSvg.selectAll('rect')
                .data([
                    { numBox : 5, buffer : this.const.ZONE_BUFFER },
                    { numBox : 3, buffer : this.const.BOX_SIZE + this.const.ZONE_BUFFER, swf : this.const.INNER_SWF },
                ])
                .enter()
                .append('rect')
                .attr({
                    x              : function(d) { return d.buffer; },
                    y              : function(d) { return d.buffer; },
                    width          : function(d) { return d.numBox * this.const.BOX_SIZE; },
                    height         : function(d) { return d.numBox * this.const.BOX_SIZE; },
                    fill           : this.const.ZONE_FILL,
                    stroke         : this.const.ZONE_COLOR,
                    'stroke-width' : function(d) { return this.const.ZONE_LINE_WIDTH / (d.swf ? d.swf : 1); },
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
                    x1             : function(d) { return d.x1 * this.const.BOX_SIZE + this.const.ZONE_BUFFER; },
                    y1             : function(d) { return d.y1 * this.const.BOX_SIZE + this.const.ZONE_BUFFER; },
                    x2             : function(d) { return d.x2 * this.const.BOX_SIZE + this.const.ZONE_BUFFER; },
                    y2             : function(d) { return d.y2 * this.const.BOX_SIZE + this.const.ZONE_BUFFER; },
                    stroke         : this.const.ZONE_COLOR,
                    'stroke-width' : this.const.ZONE_LINE_WIDTH / this.const.LINE_SWF
                });

            // draw the prospective pitch, that updates with location changes
            zoneSvg.append('circle')
                .attr({
                    'ng-attr-cx'   : '{{ getPitchX(curr.pitch) }}', // ng-attr-cx to avoid error
                    'ng-attr-cy'   : '{{ getPitchY(curr.pitch) }}', // ng-attr-cy to avoid error
                    r              : this.const.PITCH_RADIUS,
                    fill           : this.const.PROSPECTIVE_COLOR,
                    stroke         : this.const.PITCH_STROKE_COLOR,
                    'stroke-width' : this.const.PITCH_STROKE_WIDTH
                });

            // draw all submitted pitches in the current plate appearance within a 'g' wrapper
            zoneSvg.append('circle')
                .attr({
                    'ng-repeat'    : 'pitch in curr.pa.pitches', // repeat for each pitch in the pa
                    'ng-attr-cx'   : '{{ getPitchX(pitch) }}', // ng-attr-cx to avoid error
                    'ng-attr-cy'   : '{{ getPitchY(pitch) }}', // ng-attr-cy to avoid error
                    r              : this.const.PITCH_RADIUS,
                    fill           : '{{ getPitchColor(pitch) }}',
                    stroke         : this.const.PITCH_STROKE_COLOR,
                    'stroke-width' : this.const.PITCH_STROKE_WIDTH
                });
        },
        bases: function() {
            // create an svg for the bases
            d3.select('#' + this.const.BASES_PARENT)
                .append('svg')
                .attr({
                    width  : this.const.BASES_SVG_SIZE,
                    height : this.const.BASES_SVG_SIZE
                })
                // draw each diamond
                .selectAll('path')
                .data([
                    // grass diamond
                    { cx : this.const.BASES_SVG_SIZE / 2, cy : this.const.BASES_SVG_SIZE / 2, r : this.const.BASES_SVG_SIZE / 2,
                        fill : this.const.GRASS_COLOR, ngClass : "false"},
                    // first base
                    { cx : this.const.BASES_SVG_SIZE - this.const.BASE_SIZE, cy : this.const.BASES_SVG_SIZE / 2, r : this.const.BASE_SIZE,
                        fill : this.const.BASE_COLOR_EMPTY, ngClass : "bases[0]"},
                    // second base
                    { cx : this.const.BASES_SVG_SIZE / 2, cy : this.const.BASE_SIZE,          r : this.const.BASE_SIZE,
                        fill : this.const.BASE_COLOR_EMPTY, ngClass : "bases[1]"},
                    // third base
                    { cx : this.const.BASE_SIZE, cy : this.const.BASES_SVG_SIZE / 2, r : this.const.BASE_SIZE,
                        fill : this.const.BASE_COLOR_EMPTY, ngClass : "bases[2]"}
                ])
                .enter()
                .append('path')
                .attr({
                    d                 : function(d) { return 'M' + (d.cx - d.r) + ',' + d.cy + 'l' + d.r + ',' + (-d.r) +
                                        'l' + d.r + ',' + d.r + 'l' + (-d.r) + ',' + d.r + 'Z'; },
                    fill              : function(d) { return d.fill; },
                    stroke            : 'black',
                    'stroke-width'    : this.const.BASE_STROKE_WIDTH,
                    'ng-class'        : function(d) { return '{ occupied : ' + d.ngClass + '}'; },
                });
                // TODO: tooltip
        },
        states: function() {
            // data for the states display TODO: get the num from constants
            statesData = [
                { type : 'balls',   num : this.const.BALLS_PER_BB,    data : 'curr.pa.balls'   },
                { type : 'strikes', num : this.const.STRIKES_PER_K,   data : 'curr.pa.strikes' },
                { type : 'outs',    num : this.const.OUTS_PER_INNING, data : 'curr.inning.outs'}
            ];

            // create an svg for the states
            var stateSvg = d3.select('#' + this.const.STATE_PARENT)
                .append('svg')
                .attr({
                    width  : this.const.STATE_SVG_WIDTH,
                    height : this.const.STATE_SVG_HEIGHT
                });

            // draw the circles grouped by type
            stateSvg.selectAll('g')
                    .data(statesData)
                    .enter()
                    .append('g')
                    .append('circle')
                    .attr({
                        'ng-repeat'  : function(d) { return 'n in getRange(' + d.num + ')'; },
                        'ng-attr-cx' : function(d) { return '{{ ' + this.const.STATE_TEXT_OFFSET + ' + ' + this.const.STATE_RADIUS + ' * 2 * (n - 1) + ' + this.const.STATE_X_PADDING + ' * n }}'; },
                        cy           : function(d, i) { return this.const.STATE_RADIUS * (2 * i + 1) + this.const.STATE_Y_PADDING * i; },
                        r            : this.const.STATE_RADIUS,
                        stroke       : this.const.STATE_STROKE,
                        fill         : this.const.STATE_FILL,
                        'ng-class'   : function(d, i) { return '{ ' + d.type + ' : ' + d.data + ' >= n }'; }
                    });

            // place labels by type
            stateSvg.selectAll('text')
                .data(statesData)
                .enter()
                .append('text')
                .attr({
                    x : 0,
                    y : function(d, i) { return this.const.STATE_RADIUS * (2 * (i + 1)) + this.const.STATE_Y_PADDING * i - this.const.STATE_Y_OFFSET; },
                    class : 'state-label'
                })
                // show only the first letter in upper case
                .text(function(d) { return d.type.substring(0, 1).toUpperCase(); });
            
        }
    }
}


