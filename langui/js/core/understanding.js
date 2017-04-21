// understanding.js: major routine
Langui.Flashback = function(trace, color = cyan, closed = false) {
    if (trace.length == 0 || trace.length == 1) return;
    Langui.ctx.beginPath();
    Langui.SetStrokeColor(color);
    fp = trace[0];
    Langui.ctx.moveTo(fp.x, fp.y);
    Langui.ctx.fillRect(fp.x, fp.y, 3, 3);
    trace.forEach(function(element) {
        Langui.SetStrokeColor(color);
        Langui.ctx.lineTo(element.x, element.y);
        Langui.ctx.fillRect(element.x, element.y, 3, 3);
    });
    if (closed) {
        Langui.ctx.lineTo(fp.x, fp.y);
    }
    Langui.ctx.stroke();
};



Langui.Test = function(trace) {
    if (trace.length == 1) {
        Langui.CreateInput(trace[0]);
    }
    if (trace.length == 0 || trace.length == 1) return;
    Langui.Flashback(trace);
    // extended line : yep, it's needed; someone is too lazy to complete a drawing.
    pt2 = trace[trace.length - 2];
    pt = trace[trace.length - 1];
    p_extended = new Point(pt.x + Langui.config.multiplier_length_of_extended_line * (pt.x - pt2.x), pt.y + Langui.config.multiplier_length_of_extended_line * (pt.y - pt2.y));
    trace.push(p_extended);
    Langui.DrawSegment(pt, p_extended, 1, red);
    // check if it is closed
    var is_closed = Langui.Closedshape(trace);
    //console.log("Is it a closed shape? " + is_closed);
    // show overhauled trace
    Langui.Flashback(Langui.overhauled_trace, blue, true);

    if (is_closed) {
        // check its frame, which decides its position and size
        Langui.Frame(Langui.overhauled_trace);
        // How many corners? 
        Langui.Cornerness(Langui.overhauled_trace);
        var size = Langui.frame.small_edge_size / 2;
        var x = Langui.frame.x_min + Langui.frame.width / 2;
        var y = Langui.frame.y_min + Langui.frame.height / 2;
        if (Langui.corner_number == 0) {
            Langui.PushShape(new Circle(size, x, y));
        } else if (Langui.corner_number == 4) {
            if (Langui.around_45_degree) {
                Langui.PushShape(new Polygon(Langui.corner_number, size, x, y, 0));
            } else {
                Langui.PushShape(new Rect(Langui.frame.x_min, Langui.frame.x_max, Langui.frame.y_min, Langui.frame.y_max));
            }
        } else {
            Langui.PushShape(new Polygon(Langui.corner_number, size, x, y, Math.PI / 2));
        }
    } else {
        if (Langui.drawing_time > Langui.config.drawing_time_for_curve) {
            Langui.PushShape(new Curve(trace));
        } else {
            var points = [trace[0], trace[Math.floor(trace.length / 6)], trace[Math.floor(trace.length / 3)], trace[Math.floor(trace.length / 2)], trace[trace.length - 3], trace[trace.length - 2]];
            Langui.PushShape(new Arc(points, Langui.arrow_state));
        }
    }
};

// calculate each dot's cornerness, which indicates how cornered it is.
// I use dump algorithm because here exists no bottleneck.
Langui.Cornerness = function(trace) {
    if (Langui.drawing_time < Langui.config.drawing_time_for_circle) {
        Langui.corner_number = 0;
        return;
    }
    var edge_vectors = []; //edge_vectors[i]: k of edge trace[i],trace[i+1]
    var rotate_angles = []; //the atan2 diff between adjacent edges 
    var cornerness = [];
    for (var i = 1; i < trace.length; i++) {
        edge_vectors.push(trace[i].SubVector(trace[i - 1]));
    }

    var theta = 0;
    for (var i = 0; i < 4; i++) {
        theta += edge_vectors[i].Atan2();
    }
    theta = theta / 4;
    console.log("Initial direction:" + theta);
    if (theta > 0.4 && theta < 0.7 || (theta > 2.1 && theta < 2.8)) {
        Langui.around_45_degree = true;
    } else {
        Langui.around_45_degree = false;
    }

    for (var i = 0; i < edge_vectors.length; i++) {
        var cur_len = edge_vectors[i].Size();
        var nr_insert = cur_len / 2 - 1;
        for (var j = 0; j < nr_insert; j++) {
            rotate_angles.push(0);
        }
        var next = i + 1;
        if (i == edge_vectors.length - 1) {
            next = 0;
        }
        rotate_angles.push(Math.abs(edge_vectors[i].RotatedAngle(edge_vectors[next])));
    }
    //console.log("rotate_angles: " + rotate_angles);
    for (var i = 0; i < rotate_angles.length; i++) {
        var sum = rotate_angles[i];
        for (var j = 0; j < Langui.config.pike_width; j++) {
            next = j + i;
            if (next >= rotate_angles.length) next -= rotate_angles.length;
            sum += rotate_angles[next];
        }
        for (var j = 0; j < Langui.config.pike_width; j++) {
            prev = i - j;
            if (prev < 0) prev += rotate_angles.length;
            sum += rotate_angles[prev];
        }
        if (sum < Langui.config.pike_bar) {
            sum = 0;
        }
        cornerness.push(sum);
    }
    //console.log("cornerness: " + cornerness);
    var zero_segments_count = 0;
    var in_zero_segment = false;
    var zero_count = 0;
    for (var i = 0; i < cornerness.length; i++) {
        if (cornerness[i] == 0) {
            if (!in_zero_segment) {
                in_zero_segment = true;
                zero_count = 0;
            }
            zero_count++;
        } else {
            if (in_zero_segment) {
                in_zero_segment = false;
                if (zero_count > Langui.config.min_edge_len) {
                    zero_segments_count++;
                    console.log("len:" + zero_count);
                }
            }
        }
    }
    // It's almost impossible that cornerness[0~10] and cornerness[len-10~len-1] are consecutive
    // So I left this special case out. 
    //console.log("zero segments number: " + zero_segments_count);
    Langui.corner_number = zero_segments_count;
    if (Langui.corner_number == 2 || Langui.corner_number == 1) {
        Langui.corner_number = 3;
    }
};

// determine if the drawing trace is a closed shape or a curve/line. 
Langui.Closedshape = function(trace) {
    console.log("drawing time:" + Langui.drawing_time + " ms");
    if (Langui.drawing_time > Langui.config.drawing_time_for_curve) { //1600 ms
        return false;
    }
    // var t0 = performance.now();
    var is_closed = Langui.DetectionOfSegmentIntersections(trace);
    //var t1 = performance.now();
    //console.log("Call to Closedshape took " + (t1 - t0) + " milliseconds.")
    return is_closed;
};

// put the trace in the smallest square frame, the framesize indicates the size of the shape.
Langui.Frame = function(trace) {
    var clone = trace.slice(0);
    clone.sort(function(a, b) {
        if (a.x < b.x) { return -1; }
        if (b.x < a.x) { return 1; }
        return 0;
    });
    x_min = clone[0].x;
    x_max = clone[clone.length - 1].x;
    clone.sort(function(a, b) {
        if (a.y < b.y) { return -1; }
        if (b.y < a.y) { return 1; }
        return 0;
    });
    y_min = clone[0].y;
    y_max = clone[clone.length - 1].y;
    Langui.frame = new Rect(x_min, x_max, y_min, y_max);
    //Langui.DrawRect(Langui.frame, 1, black);
};

// understand the drawing trace
Langui.Interpret = function(trace) {
    var t0 = performance.now();

    var t1 = performance.now();
    //    console.log("It took " + (t1 - t0) + " milliseconds.")
};