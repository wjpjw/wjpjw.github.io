Langui.LineSegmentsIntersect = function(p, p2, q, q2) {
    var crossProduct = function(point1, point2) { return point1.x * point2.y - point1.y * point2.x; };
    var subtractPoints = function(point1, point2) {
        var result = {};
        result.x = point1.x - point2.x;
        result.y = point1.y - point2.y;
        return result;
    };
    var equalPoints = function(point1, point2) { return (point1.x == point2.x) && (point1.y == point2.y) };
    if (equalPoints(p, q) || equalPoints(p, q2) || equalPoints(p2, q) || equalPoints(p2, q2)) {
        return false; //important! In Langui project, if consecutive segments are not considered to have a intersection
    }
    var r = subtractPoints(p2, p);
    var s = subtractPoints(q2, q);
    var qminuspxr = crossProduct(subtractPoints(q, p), r);
    var rxs = crossProduct(r, s);
    if (qminuspxr == 0 && rxs == 0) { //colinear
        //  != means XOR
        return ((q.x - p.x < 0) != (q.x - p2.x < 0) != (q2.x - p.x < 0) != (q2.x - p2.x < 0)) ||
            ((q.y - p.y < 0) != (q.y - p2.y < 0) != (q2.y - p.y < 0) != (q2.y - p2.y < 0));
    }
    if (rxs == 0) { //parallel
        return false;
    }
    var u = qminuspxr / rxs;
    var t = crossProduct(subtractPoints(q, p), s) / rxs;
    return (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);
};


//It's not the bottleneck at all.
Langui.DetectionOfSegmentIntersections = function(trace) {
    var get_k = function(p1, p2) {
        return (p2.y - p1.y) / (p2.x - p1.x);
    }
    var get_b = function(p1, k) {
        return p1.y - p1.x * k;
    }
    var get_y = function(x, k, b) {
        return k * x + b;
    }
    var intersection_point = function(k1, b1, k2, b2) {
        var x = (b2 - b1) / (k1 - k2);
        var y = k1 * x + b1;
        return new Point(x, y);
    }
    var get_intersection_point = function(p1, p2, p3, p4) {
        k1 = get_k(p1, p2);
        b1 = get_b(p1, k1);
        k2 = get_k(p3, p4);
        b2 = get_b(p3, k2);
        return intersection_point(k1, b1, k2, b2);
    }
    nr_chosen = Math.ceil(trace.length * Langui.config.closeness_greediness);
    var trace_length = trace.length;
    for (var i = 1; i < nr_chosen; i++) {
        for (var j = 1; j < nr_chosen; j++) {
            if (Langui.LineSegmentsIntersect(trace[i - 1], trace[i], trace[trace_length - 1 - j], trace[trace_length - j])) {
                Langui.overhauled_trace = trace.slice(i, trace_length - j);
                var ip = get_intersection_point(trace[i - 1], trace[i], trace[trace_length - 1 - j], trace[trace_length - j]);
                Langui.overhauled_trace.push(ip);
                return true;
            }
        }
    }
    return false;
};

// Detection of Segment Intersections O(n) space, O(nlogn) time, n=nr_points*greediness. 
// Best DetectionOfSegmentIntersections
// Initialize event queue EQ = all segment endpoints;
// Sort EQ by increasing x and y;
// Initialize sweep line SL to be empty;

// While (EQ is nonempty) {
//     Let E = the next event from EQ;
//     If (E is a left endpoint) {
//         Let segE = E's segment;
//         Add segE to SL;
//         Let segA = the segment Above segE in SL;
//         Let segB = the segment Below segE in SL;
//         If (I = Intersect( segE with segA) exists)
//             return TRUE;   // an Intersect Exists
//         If (I = Intersect( segE with segB) exists)
//             return TRUE;   // an Intersect Exists
//     }
//     Else {  // E is a right endpoint
//         Let segE = E's segment;
//         Let segA = the segment above segE in SL;
//         Let segB = the segment below segE in SL;
//         Delete segE from SL;
//         If (I = Intersect( segA with segB) exists)
//             return TRUE;   // an Intersect Exists
//     }
//     remove E from EQ;
// }