var anim = anim || {};

(function() {
    'use strict';

    /**
     * Modified version of the Line constructor from the
     * book Foundations of HTML5 Animation
     *
     * {args x1, y1, x2, y2} cordinates of the vertices of the line
     * {args direction} if true, collision is taken from right,
     *              else from other side
     * {args callback} gets called when something collides with this line
     */
    function Line (x1, y1, x2, y2, direction, callback) {
        var dy = y2 - y1;
        var dx = x2 - x1;
        var angle = Math.atan2(dy, dx);
        var length = Math.sqrt(dx * dx + dy * dy);

        this.x1 = 0;
        this.y1 = 0;
        this.x2 = length;
        this.y2 = 0;

        if (direction) {
            // assume from right
            this.x = x1;
            this.y = y1;
            this.rotation = angle;
        } else {
            this.x = x2;
            this.y = y2;
            this.x2 = length;
            this.rotation = angle + Math.PI;
        }

        this.lineWidth = 10;
        this.callback = callback;
    }

    Line.prototype.draw = function (context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        context.scale(this.scaleX, this.scaleY);
        context.strokeStyle = '#ff0';
        context.lineWidth = this.lineWidth;
        context.beginPath();
        context.moveTo(this.x1, this.y1);
        context.lineTo(this.x2, this.y2);
        context.closePath();
        context.stroke();
        context.restore();
    };

    Line.prototype.getBounds = function () {
        if (this.rotation === 0) {
            var minX = Math.min(this.x1, this.x2),
                minY = Math.min(this.y1, this.y2),
                maxX = Math.max(this.x1, this.x2),
                maxY = Math.max(this.y1, this.y2);

            return {
                x: this.x + minX,
                y: this.y + minY,
                width: maxX - minX,
                height: maxY - minY
            };
        } else {
            var sin = Math.sin(this.rotation),
                cos = Math.cos(this.rotation),
                x1r = cos * this.x1 + sin * this.y1,
                x2r = cos * this.x2 + sin * this.y2,
                y1r = cos * this.y1 + sin * this.x1,
                y2r = cos * this.y2 + sin * this.x2;

            return {
                x: this.x + Math.min(x1r, x2r),
                y: this.y + Math.min(y1r, y2r),
                width: Math.max(x1r, x2r) - Math.min(x1r, x2r),
                height: Math.max(y1r, y2r) - Math.min(y1r, y2r)
            };
        }
    };

  anim.Line = Line;

})();
