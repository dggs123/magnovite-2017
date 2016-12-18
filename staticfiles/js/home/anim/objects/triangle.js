var anim = anim || {};

(function() {
    'use strict';

    // highlight fade speeds
    var fadeInSpeed = 0.01;
    var fadeOutSpeed = 0.005;
    var bumpAlpha = 0.3;

    var colors = [
        {
            fill: '#0F59EB',
            highlight: 'rgba(12, 66, 172, '
        },
        {
            fill: '#0C42AC',
            highlight: 'rgba(3, 44, 126, '
        },
        {
            fill: '#032C7E',
            highlight: 'rgba(21, 100, 255, '
        },
        {
            fill: '#1564FF',
            highlight: 'rgba(15, 89, 235,'
        }
    ];

    function Triangle(vertices, triangle) {
        var $this = this;
        this.cordinates = [
            vertices[triangle[0]],
            vertices[triangle[1]],
            vertices[triangle[2]]
        ];

        var rand = Math.floor(Math.random() * colors.length);
        this.color = colors[rand];

        this.highlightAlpha = 0;
        this.fading = 'null';

        // delay for the fading
        this.delay = 0;
    }

    Triangle.prototype.getCallback = function() {
        var $this = this;

        return function(atom) {
            $this.highlightAlpha = Math.min($this.highlightAlpha + bumpAlpha, 1);
            $this.fading = 'in';

            $this.updateHighlight();
        };
    };

    Triangle.prototype.updateHighlight = function() {
        if (this.fading === 'in') {
            this.highlightAlpha = Math.min(this.highlightAlpha + fadeInSpeed, 1);
        } else if (this.fading === 'out') {
            this.highlightAlpha = Math.max(this.highlightAlpha - fadeOutSpeed, 0);
        }

        if (this.highlightAlpha === 0) {
            this.fading = 'null';
        } else if (this.highlightAlpha === 1) {
            this.fading = 'out';
        }
    };

    Triangle.prototype.draw = function(context) {
        if (this.delay > 0) {
            this.delay -= 15;
            return;
        }

        var cord = this.cordinates;
        context.save();

        context.beginPath();
        context.moveTo(cord[0][0], cord[0][1]);
        context.lineTo(cord[1][0], cord[1][1]);
        context.lineTo(cord[2][0], cord[2][1]);
        context.closePath();

        context.fillStyle = this.color.fill;
        context.fill();

        if (this.highlightAlpha > 0) {
            context.fillStyle = this.color.highlight + this.highlightAlpha + ')';
            context.fill();

            this.updateHighlight();
        }

        context.restore();
    };

    /**
     * Checks if the triangle contains the point
     * x and y should be local cordinates to the letters
     * http://stackoverflow.com/questions/13300904/determine-whether-point-lies-inside-triangle
     */
    Triangle.prototype.containsPoint = function(x, y) {
        var ver1x = this.cordinates[0][0];
        var ver1y = this.cordinates[0][1];
        var ver2x = this.cordinates[1][0];
        var ver2y = this.cordinates[1][1];
        var ver3x = this.cordinates[2][0];
        var ver3y = this.cordinates[2][1];

        var alpha = ((ver2y - ver3y)*(x - ver3x) + (ver3x - ver2x) * (y - ver3y))/
                    ((ver2y - ver3y)*(ver1x - ver3x) + (ver3x - ver2x)*(ver1y - ver3y));
        var beta = ((ver3y - ver1y)*(x - ver3x) + (ver1x - ver3x)*(y - ver3y))/
                    ((ver2y - ver3y)*(ver1x - ver3x) + (ver3x - ver2x)*(ver1y - ver3y));
        var gamma = 1.0 - alpha - beta;

        if (alpha > 0 && beta > 0 && gamma > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    anim.Triangle = Triangle;

})();
