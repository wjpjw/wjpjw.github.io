// include order: global, everything else, ui
// Basically everything is encapulated in this object or module.
var Langui = {};


function Config(drawing_time_for_circle = 500, closeness_greediness = 0.4, drawing_time_for_curve = 16000, multiplier_length_of_extended_line = 9, pike_width = 4, pike_bar = 1.2, min_edge_len = 10) {
    // A closed polygon or circle has a intersection, but this intersection only qualifies if they are between the first x% and the last x% segments.
    this.closeness_greediness = closeness_greediness;
    // Anything you draw will be considered as a curve if it takes longer than x ms.
    this.drawing_time_for_curve = drawing_time_for_curve;
    // Sometimes you are too lazy to draw a closed shape; x * last segment's length = extended line's length
    this.multiplier_length_of_extended_line = multiplier_length_of_extended_line;
    // Pike width indicates how smooth you draw a circle
    this.pike_width = pike_width;
    // filter out noise below pike_bar(0.4*PI)
    this.pike_bar = pike_bar;
    // edges smaller than this parameter will not be considered as an edge
    this.min_edge_len = min_edge_len;
    // Yep, you can't draw a polygon that fast, it must be a circle
    this.drawing_time_for_circle = drawing_time_for_circle;
}
Langui.overhauled_trace = [];
Langui.config = new Config();
Langui.arrow_state = 0; //0: no arrow, 1: dest side arrow, 2: both sides arrows 




// colors
var cyan = "#0ef",
    red = "#f03",
    black = "#000",
    purple = "#d0d",
    grey = "#123",
    blue = "#12e";