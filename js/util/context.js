//Some drawing basics

Langui.SetStrokeColor = function(color = "#000") {
    Langui.ctx.strokeStyle = color;
};
Langui.SetStrokeWidth = function(width = 1) {
    Langui.ctx.lineWidth = width;
};
Langui.ClearStrokes = function() {
    Langui.ctx.clearRect(0, 0, $(window).width(), $(window).height());
};
Langui.DefaultBrush = function() {
    Langui.SetStrokeColor(black);
    Langui.SetStrokeWidth(1);
};
Langui.DrawSegment = function(pointa, pointb, size = 1, color = cyan) {
    Langui.ctx.beginPath();
    Langui.SetStrokeWidth(size);
    Langui.SetStrokeColor(color);
    Langui.ctx.moveTo(pointa.x, pointa.y);
    Langui.ctx.lineTo(pointb.x, pointb.y);
    Langui.ctx.stroke();
};
Langui.DrawRect = function(rect, size = 1, color = black) {
    Langui.ctx.beginPath();
    Langui.SetStrokeWidth(size);
    Langui.SetStrokeColor(color);
    Langui.ctx.moveTo(rect.x_min, rect.y_min);
    Langui.ctx.lineTo(rect.x_max, rect.y_min);
    Langui.ctx.lineTo(rect.x_max, rect.y_max);
    Langui.ctx.lineTo(rect.x_min, rect.y_max);
    Langui.ctx.lineTo(rect.x_min, rect.y_min);
    Langui.ctx.stroke();
};
// Create input to enter text on canvas
// Large input, good for eyes
Langui.CreateInput = function(position) {
    if (Langui.input != null) {
        Langui.input.destroy();
        Langui.input = null;
    }
    var on_submit = function() {
        Langui.PushShape(new Text(position, Langui.input.value()));
        Langui.input._renderCanvas.style.visibility = "hidden";
        Langui.input.destroy();
        Langui.input = null;
    };
    Langui.input = new CanvasInput({
        canvas: Langui.canvas,
        x: position.x - 12,
        y: position.y - 35,
        fontSize: 28,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 325,
        padding: 8,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 3,
        boxShadow: '1px 1px 0px #fff',
        innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
        placeHolder: 'Hit enter key to submit!',
        onsubmit: on_submit
    });
    Langui.input.focus();
};

//Not good looking, should be replaced!
Langui.DrawArrow = function(fromx, fromy, tox, toy) {
    var getBack = function(len, x1, y1, x2, y2) {
        return x2 - (len * (x2 - x1) / (Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2))));
    };
    var headlen = 10.0;
    var back = 4.0;
    var angle1 = Math.PI / 13.0;
    var angle2 = Math.atan2(toy - fromy, tox - fromx);
    var diff1 = angle2 - angle1;
    var diff2 = angle2 + angle1;
    var xx = getBack(back, fromx, fromy, tox, toy);
    var yy = getBack(back, fromy, fromx, toy, tox);
    Langui.ctx.moveTo(fromx, fromy);
    Langui.ctx.lineTo(tox, toy);
    Langui.ctx.moveTo(xx, yy);
    Langui.ctx.lineTo(xx - headlen * Math.cos(diff1), yy - headlen * Math.sin(diff1));
    Langui.ctx.moveTo(xx, yy);
    Langui.ctx.lineTo(xx - headlen * Math.cos(diff2), yy - headlen * Math.sin(diff2));
}