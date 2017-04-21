$(document).ready(function() {
    newCanvas();
    $("#clear").click(function() { newCanvas(); });
    $("#arrow").click(function() {
        Langui.arrow_state++;
        if (Langui.arrow_state == 2) {
            Langui.arrow_state = 0;
        }
    });

});

function newCanvas() {
    $("#content").html('<canvas id="canvas" width="' + $(window).width() + '" height="' + ($(window).height()) + '"></canvas>');
    Langui.canvas = document.getElementById("canvas");
    Langui.ctx = Langui.canvas.getContext("2d");
    Langui.SetStrokeColor(red);
    $("#canvas").drawMouse();
}

$.fn.drawMouse = function() {
    var clicked = false;
    var trace = [];
    var t_start;
    var start = function(e) {
        trace = [];
        trace.push(new Point(e.pageX, e.pageY));
        t_start = performance.now();
        clicked = true;
        x = e.pageX;
        y = e.pageY;
        Langui.ctx.beginPath();
        Langui.SetStrokeColor(red);
        Langui.ctx.moveTo(x, y);
    };
    var move = function(e) {
        if (clicked) {
            x = e.pageX;
            y = e.pageY;
            Langui.ctx.lineTo(x, y);
            Langui.ctx.stroke();
            p = trace[trace.length - 1]
            if (p.x != x && p.y != y) {
                trace.push(new Point(x, y));
            }
        }
    };
    var stop = function(e) {
        clicked = false;
        Langui.drawing_time = performance.now() - t_start;
        //clear everything in core memory
        Langui.ClearStrokes();
        //test version of interpret: understand what is drawn
        Langui.Test(trace);
        //redraw shapes in core memory
        Langui.RedrawMemorized();

    };
    $(this).on("mousedown", start);
    $(this).on("mousemove", move);
    $(window).on("mouseup", stop);
};