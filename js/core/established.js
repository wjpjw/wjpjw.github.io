// established.js: the permanent in-memory segments and shapes; definitions of shapes 

function Point(x, y) {
    this.x = x;
    this.y = y;
    this.Size = function() {
        return Math.sqrt(x * x + y * y);
    };
    this.KTo = function(another_point) {
        return (another_point.y - y) / (another_point.x - x);
    };
    this.SubVector = function(another_point) {
        return new Point(x - another_point.x, y - another_point.y);
    };
    this.Atan2ForSubVectorTo = function(another_point) {
        return this.SubVector(another_point).Atan2();
    };
    this.Atan2 = function() {
        return Math.atan2(this.y, this.x);
    }
    this.RotatedAngle = function(next_vector) {
        var t1 = this.Atan2();
        var t2 = next_vector.Atan2();
        if (t2 < 0) {
            t2 += Math.PI * 2;
        }
        diff = t2 - t1;
        if (diff > Math.PI) {
            diff -= Math.PI * 2;
        }
        return diff;
    }
}

function Text(position, text) {
    this.position = position;
    this.text = text;
    this.redraw = function() {
        Langui.ctx.font = "30px Arial";
        Langui.ctx.fillText(text, position.x, position.y);
    };
}

function Arc(trace, arrow_state) {
    this.points = trace.slice(0);
    this.redraw = function() {
        Langui.ctx.moveTo(this.points[0].x, this.points[0].y);
        Langui.ctx.fillRect(this.points[0].x, this.points[0].y, 3, 3);
        for (i = 1; i < this.points.length - 3; i++) {
            var xc = (this.points[i].x + this.points[i + 1].x) / 2;
            var yc = (this.points[i].y + this.points[i + 1].y) / 2;
            Langui.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
        }
        // curve through the last two points
        Langui.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, this.points[i + 1].x, this.points[i + 1].y);
        if (arrow_state == 0) {
            Langui.ctx.lineTo(this.points[i + 2].x, this.points[i + 2].y);
            Langui.ctx.fillRect(this.points[i + 2].x, this.points[i + 2].y, 3, 3);
        } else {
            Langui.DrawArrow(this.points[i + 1].x, this.points[i + 1].y, this.points[i + 2].x, this.points[i + 2].y);
        }
        Langui.ctx.stroke();
    };
}

function Curve(trace) {
    this.tr = trace.slice(0);
    this.redraw = function() {
        if (this.tr.length == 0 || this.tr.length == 1) return;
        fp = this.tr[0];
        lp = this.tr[this.tr.length - 1];
        Langui.ctx.moveTo(fp.x, fp.y);
        Langui.ctx.fillRect(fp.x, fp.y, 3, 3);
        trace.forEach(function(element) {
            Langui.ctx.lineTo(element.x, element.y);
        });
        Langui.ctx.fillRect(lp.x, lp.y, 3, 3);
        Langui.ctx.stroke();
    };
}

function Polygon(nr_sides, size, x, y, offset) {
    this.nr_sides = nr_sides;
    this.size = size;
    this.x = x;
    this.y = y;
    this.offset = offset;
    this.redraw = function() {
        if (nr_sides == 4) {
            this.offset = 0;
        }
        Langui.ctx.moveTo(x + size * Math.cos(this.offset), y + size * Math.sin(this.offset));
        for (var i = 1; i <= nr_sides; i += 1) {
            Langui.ctx.lineTo(x + size * Math.cos(this.offset + i * 2 * Math.PI / nr_sides), y + size * Math.sin(this.offset + i * 2 * Math.PI / nr_sides));
        }
        Langui.ctx.stroke();
    };
}

function Rect(x_min, x_max, y_min, y_max) {
    this.x_min = x_min;
    this.x_max = x_max;
    this.y_min = y_min;
    this.y_max = y_max;
    this.width = Math.abs(x_max - x_min);
    this.height = Math.abs(y_max - y_min);
    this.small_edge_size = Math.min(this.width, this.height);
    this.path = new Path2D();
    this.redraw = function() {
        this.path.rect(x_min, y_min, this.width, this.height);
        Langui.ctx.stroke(this.path);
    }
}

function Circle(radius, x, y) {
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.path = new Path2D();
    this.redraw = function() {
        this.path.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        Langui.ctx.stroke(this.path);
    }
};

Langui.memory = []; //stored shapes.
Langui.PushShape = function(shape) {
    Langui.memory.push(shape);
}
Langui.RedrawMemorized = function() {
    Langui.ctx.beginPath();
    Langui.DefaultBrush();
    Langui.memory.forEach(function(shape) {
        shape.redraw();
    });
}