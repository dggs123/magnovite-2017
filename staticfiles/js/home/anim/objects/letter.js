var anim = anim || {};

/**
 * Depends on
 * {anim.Triangle}
 * {anim.Line}
 */
(function() {
    'use strict';

    var verticeFillStyle = '#03A9F4';
    var verticeRadius = 2;
    var lineStrokeStyle = '#0D88FF';

    /**
     * The Letter object, represents each single letter
     * {arg x} : the top left x coordinate of this shape
     * {arg y} : the top left y coordinate of this shape
     * {arg data} : json object containing data for this shape
     */
    function Letter(x, y, data) {
        var $this = this;

        this.vertices = data.vertices;
        this.edges = [];
        this.external = [];

        this.edgeList = {};
        this.triangles = [];
        data.triangles.forEach(function(triangle) {
            var e01 = triangle[0] + triangle[1];
            var e10 = triangle[1] + triangle[0];

            var e12 = triangle[1] + triangle[2];
            var e21 = triangle[2] + triangle[1];

            var e02 = triangle[0] + triangle[2];
            var e20 = triangle[2] + triangle[0];

            // make sure we dont re-add edges
            if (!(e01 in $this.edgeList || e10 in $this.edgeList)) {
                $this.edges.push([$this.vertices[triangle[0]], $this.vertices[triangle[1]]]);
                $this.edgeList[e01] = true;
            }

            if (!(e12 in $this.edgeList || e21 in $this.edgeList)) {
                $this.edges.push([$this.vertices[triangle[1]], $this.vertices[triangle[2]]]);
                $this.edgeList[e12] = true;
            }

            if (!(e02 in $this.edgeList || e20 in $this.edgeList)) {
                $this.edges.push([$this.vertices[triangle[0]], $this.vertices[triangle[2]]]);
                $this.edgeList[e02] = true;
            }

            var tObj = new anim.Triangle($this.vertices, triangle);
            $this.triangles.push(tObj);

            tObj.delay = Math.random() * 600 + 200;

            // handle external edges
            triangle[3].forEach(function(ext) {
                var p1 = $this.vertices[ext[0]];
                var p2 = $this.vertices[ext[1]];

                // create external lines
                // adding, x and y to make cordinates global
                $this.external.push(new anim.Line(
                    p1[0] + x, p1[1] + y,
                    p2[0] + x, p2[1] + y,
                    ext[2],
                    tObj.getCallback()
                ));
            });
        });

        this.x = x;
        this.y = y;
    }

    Letter.prototype.draw = function(context) {
        var $this = this;

        context.save();
        context.translate(this.x, this.y);

        // draw the triangles
        this.triangles.forEach(function(triangle) {
            triangle.draw(context);
        });

        // draw vertices
        context.fillStyle = verticeFillStyle;
        anim.util.forEachObj(this.vertices, function(name, vertice) {
            context.beginPath();
            context.arc(vertice[0], vertice[1], verticeRadius, 0, Math.PI * 2, false);
            context.closePath();

            context.fill();
        });

        // draw lines
        context.strokeStyle = lineStrokeStyle;
        this.edges.forEach(function(edge) {
            var pointA = edge[0];
            var pointB = edge[1];

            context.beginPath();
            context.moveTo(pointA[0], pointA[1]);
            context.lineTo(pointB[0], pointB[1]);
            context.stroke();
        });

        context.restore();
    };

    /**
     * Checks whether the cordinates are in any of the triangles
     */
    Letter.prototype.containsPoint = function(x, y) {
        var topx = this.x;
        var topy = this.y;
        var contains = false;
        var diffx = x - topx;
        var diffy = y - topy;

        if (diffx < 0 || diffy < 0 ||
            diffx > this.width || diffy > this.height) {
            return false;
        }

        this.triangles.every(function(triangle) {
            if(triangle.containsPoint(diffx, diffy)) {
                contains = true;
                return false;;
            }
            return true;
        });

        return contains;
    }

    anim.Letter = Letter;

})();

