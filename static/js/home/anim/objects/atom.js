var anim = anim || {};

(function() {
    'use strict';

    // colors
    var taggedColor = '#4fe400';
    var taggedHighlight = 'rgba(0, 255, 0, ';

    var normalColor = '#0F6EAB';
    var normalHighlight = 'rgba(53, 223, 255, ';

    var id = 1;
    var minRadius = 7 * anim.scale;
    var varRadius = 3 * anim.scale;
    var maxSpeed = 0.7;
    var weight = 5;

    var mCanvas;

    /**
     * Initializes an atom object with random cordinates,
     * and random velocity
     * {arg canvas} : canvas element DOM node
     * {Constructor}
     */
    function Atom(canvas, delay, letters) {
        this.id = id++;
        mCanvas = canvas;

        this.bounds = {
            left: 0,
            right: canvas.width,
            top: 0,
            bottom: canvas.height
        };

        this.radius = Math.random() * varRadius + minRadius;
        this.mass = this.radius * weight;
        this.color = normalColor;
        this.highlightColor = normalHighlight;
        this.highlightAlpha = 0;

        // Makes sure that atom coordinates are not inside the letters
        var x, y;
        var invalid = false;
        while(true) {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
            letters.every(function(letter) {
                if (letter.containsPoint(x, y)) {
                    invalid = true;
                    return false;
                }
                return true;
            });
            if (!invalid) {
                break;
            } else {
                invalid = false;
            }
        }
        this.x = x;
        this.y = y;

        this.vx = Math.random() * maxSpeed;
        this.vy = Math.random() * maxSpeed;
        this.vx *= Math.round(Math.random()) * -1;
        this.vy *= Math.round(Math.random()) * -1;

        if (Math.random() * 10 > 5) {
            this.vx *= -1;
        }

        if (Math.random() * 10 > 5) {
            this.vy *= -1;
        }

        this.delay = delay;
    }

    Atom.prototype.randomise = function() {
        this.x = Math.random() * mCanvas.width;
        this.y = Math.random() * mCanvas.height;
        this.vx = Math.random() * maxSpeed;
        this.vy = Math.random() * maxSpeed;

        this.vx *= Math.round(Math.random()) * -1;
        this.vy *= Math.round(Math.random()) * -1;
    };

    /**
     * Marks this atom as tagged
     */
    Atom.prototype.tag = function(bool) {
        if (bool) {
            this.tagged = true;
            this.color = taggedColor;
            this.highlightColor = taggedHighlight;
        } else {
            this.tagged = false;
            this.color = normalColor;
            this.highlightColor = normalHighlight;
        }
    };

    Atom.prototype.isTagged = function() {
        return !!this.tagged;
    };

    /**
     * Updates the atoms state at each step.
     * Atoms bounce off the bounds
     *
     * {arg context} : the 2d canvas context object
     */
    Atom.prototype.update = function(context) {
        var rand, dir;

        this.x += this.vx;
        this.y += this.vy;

        // check vertical bounds
        if (this.x + this.radius > this.bounds.right) {
            this.x = this.bounds.right - this.radius;
            this.vx *= -1;
        } else if (this.x - this.radius < this.bounds.left) {
            this.x = this.bounds.left + this.radius;
            this.vx *= -1;
        }

        // check horizontal bounds
        if (this.y + this.radius > this.bounds.bottom) {
            this.y = this.bounds.bottom - this.radius;
            this.vy *= -1;
        } else if (this.y - this.radius < this.bounds.top) {
            this.y = this.bounds.top + this.radius;
            this.vy *= -1;
        }
    };

    /**
     * Draws this object on the screen
     * {arg context} : 2d canvas context object
     */
    Atom.prototype.draw = function(context) {
        if (this.delay > 0) {
            this.delay -= 15;
            return;
        }

        context.save();

        context.translate(this.x, this.y);

        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2, false);
        context.closePath();

        context.fillStyle = this.color;
        context.fill();

        // do the highlight
        if (this.highlightAlpha > 0) {
            context.fillStyle = this.highlightColor + this.highlightAlpha + ')';
            context.fill();

            this.highlightAlpha = Math.max(this.highlightAlpha - 0.0010, 0);
        }

        context.restore();
    };

    /**
     * Rotates the cordinate system
     */
    function rotate (x, y, sin, cos, reverse) {
        return {
            x: (reverse) ? (x * cos + y * sin) : (x * cos - y * sin),
            y: (reverse) ? (y * cos - x * sin) : (y * cos + x * sin)
        };
    }

    /**
     * Checks if {this} atom collides with {arg atomB}
     * and take appropriate actions
     * Straight from the book
     *
     * {arg atomB} : instance of class {Atom} to check against
     */
    Atom.prototype.collide = function(atomB) {
        var vx, vy;
        var absorption = -0.01;

        var dx = atomB.x - this.x;
        var dy = atomB.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist && dist < atomB.radius + this.radius) {
            var angle = Math.atan2(dy, dx);
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);

            // find rotated position and velocities
            var pos0 = {x: 0, y: 0};
            var pos1 = rotate(dx, dy, sin, cos, true);
            var vel0 = rotate(this.vx, this.vy, sin, cos, true);
            var vel1 = rotate(atomB.vx, atomB.vy, sin, cos, true);

            //collision reaction
            var vxTotal = vel0.x - vel1.x;
            vel0.x = ((this.mass - atomB.mass) * vel0.x + 2 * atomB.mass * vel1.x) /
                        (this.mass + atomB.mass);
            vel1.x = vxTotal + vel0.x;

            //update position
            pos0.x += vel0.x;
            pos1.x += vel1.x;

            //rotate positions back
            var pos0F = rotate(pos0.x, pos0.y, sin, cos, false);
            var pos1F = rotate(pos1.x, pos1.y, sin, cos, false);

            //adjust positions to actual screen positions
            atomB.x = this.x + pos1F.x;
            atomB.y = this.y + pos1F.y;
            this.x = this.x + pos0F.x;
            this.y = this.y + pos0F.y;

            //rotate velocities back
            var vel0F = rotate(vel0.x, vel0.y, sin, cos, false);
            var vel1F = rotate(vel1.x, vel1.y, sin, cos, false);

            // update velocities
            this.vx = vel0F.x;
            this.vy = vel0F.y;
            atomB.vx = vel1F.x;
            atomB.vy = vel1F.y;

            // adjust alphas
            this.highlightAlpha = Math.min(this.highlightAlpha + 0.4, 1);
            atomB.highlightAlpha = Math.min(atomB.highlightAlpha + 0.4, 1);
        }

        this.clamp();
        atomB.clamp();
    };

    /**
     * Have the Atom collide with a {anim.Line} object
     * Straight from the book
     * Returns: did collision happen
     */
    Atom.prototype.collideLine = function(line) {
        var bounds = line.getBounds();

        if (this.x + this.radius > bounds.x && this.x - this.radius < bounds.x + bounds.width &&
            this.y + this.radius > bounds.y && this.y - this.radius < bounds.y + bounds.height) {
            var cos = Math.cos(line.rotation),
                sin = Math.sin(line.rotation),

            //get position of ball, relative to line
            x1 = this.x - line.x,
            y1 = this.y - line.y,

            //rotate coordinates and velocity
            y2 = cos * y1 - sin * x1;
            var vy1 = cos * this.vy - sin * this.vx;

            // collision happens
            if (y2 > -this.radius && y2 < vy1) {
                //rotate coordinates and vel
                var x2 = cos * x1 + sin * y1,
                vx1 = cos * this.vx + sin * this.vy;

                y2 = -this.radius;
                vy1 *= -1;

                //rotate everything back
                x1 = cos * x2 - sin * y2;
                y1 = cos * y2 + sin * x2;
                this.vx = cos * vx1 - sin * vy1;
                this.vy = cos * vy1 + sin * vx1;
                this.x = line.x + x1;
                this.y = line.y + y1;

                // callback with the atom which collided passed in
                if (line.callback) {
                    line.callback(this);
                }

                return true;
            }
        }

        return false;
    };

    /**
     * Clamps the atoms speed to maxSpeed
     */
    Atom.prototype.clamp = function() {
        if (this.vx > maxSpeed) {
            this.vx = maxSpeed;
        }

        if (this.vy > maxSpeed) {
            this.vy = maxSpeed;
        }
    };

    // external interface
    anim.Atom = Atom;

})();
