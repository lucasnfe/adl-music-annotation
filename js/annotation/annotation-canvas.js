// State variables
var drag = false;
var showLabel = true;

// Geometry variables
var circumplexRadius = 225;
var pointRadius = 25;

// Canvas global variables
var context = null;
var canvas = null;
var annotationPoint = null;

var background = new Image();
background.src = "img/circumplex.png";

var labels = new Image();
labels.src = "img/circumplex-labels.png";

var playIcon = new Image();
playIcon.src = "img/play-icon.png";

var ongoingTouches = [];

function AnnotationPoint(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.isEnabled = false;
    this.isPlayed = false;
    return this;
}

function initCanvas() {
    drag = false;

    // Canvas global object
    canvas = document.getElementById("circumplex-canvas");
    if(canvas != null) {
        context = canvas.getContext("2d");

        if (/Mobi|Android/i.test(navigator.userAgent)) {
            canvas.addEventListener("touchstart", handleStart, false);
            canvas.addEventListener("touchmove", handleMove, false);
            canvas.addEventListener("touchend", handleEnd, false);
            canvas.addEventListener("touchcancel", handleEnd, false);

            // Point has to big bigger in mobile platforms, otherwise
            // users can't see where they are clicking.
            pointRadius *= 2.25;
        }
        else {
            canvas.addEventListener('mousedown', mouseDown, false);
            canvas.addEventListener('mouseup', mouseUp, false);
            canvas.addEventListener('mousemove', mouseMove, false);
            canvas.addEventListener ("mouseout", mouseUp, false);
        }

        document.getElementById("body").addEventListener('keypress', keyPress, false);

        annotationPoint = new AnnotationPoint(canvas.width*0.5, canvas.height*0.5, pointRadius)
        annotationPoint.isEnabled = true;
        annotationPoint.isPlayed = true;

        annotationStartingPoint.x = canvas.width*0.5;
        annotationStartingPoint.y = canvas.height*0.5;
    }
}

function resetAnnotationPoint(resetPoint) {
    if(resetPoint == null) {
        annotationPoint.x = canvas.width*0.5;
        annotationPoint.y = canvas.width*0.5;
    }
    else {
        annotationPoint.x = resetPoint.x;
        annotationPoint.y = resetPoint.y;
    }

    annotationPoint.isPlayed = false;
}

function updateCurrentPointPos(mousePos) {
    mousePos.x = mousePos.x - canvas.width*0.5;
    mousePos.y = mousePos.y - canvas.height*0.5;

    var mag = Math.sqrt(mousePos.x*mousePos.x + mousePos.y*mousePos.y);

    if(mag > circumplexRadius) {
        mousePos.x = mousePos.x/mag * circumplexRadius;
        mousePos.y = mousePos.y/mag * circumplexRadius;
    }

    annotationPoint.x = mousePos.x + canvas.width*0.5;
    annotationPoint.y = mousePos.y + canvas.height*0.5;

    updateFeedbackValue();
}


function getMousePosition(x, y) {
    var mouseX = x * canvas.width / canvas.clientWidth;
    var mouseY = y * canvas.height / canvas.clientHeight;
    return {x: mouseX, y: mouseY};
}

function mouseDown(e) {
    e.preventDefault();

    var mousePos = getMousePosition(e.offsetX, e.offsetY);
    var distClickToPoint = Math.sqrt(Math.pow((mousePos.x-annotationPoint.x), 2) +
                                     Math.pow((mousePos.y-annotationPoint.y), 2));

    if(distClickToPoint < annotationPoint.radius) {
        drag = true;
        playPiece();
    }

    updateCurrentPointPos(mousePos);
}

function mouseUp(e) {
    drag = false;
    pausePiece();
}

function mouseMove(e) {
    e.preventDefault();

    if(drag) {
        var mousePos = getMousePosition(e.offsetX, e.offsetY);
        updateCurrentPointPos(mousePos);
    }
}

function handleStart(e) {
    e.preventDefault();

    var rect = e.target.getBoundingClientRect();
    var body = document.getElementById("body");

    var touchX = e.changedTouches[0].pageX - body.scrollLeft - rect.left;
    var touchY = e.changedTouches[0].pageY - body.scrollTop - rect.top;

    var mousePos = getMousePosition(touchX, touchY);

    var distClickToPoint = Math.sqrt(Math.pow((mousePos.x-annotationPoint.x), 2) +
                                     Math.pow((mousePos.y-annotationPoint.y), 2));

    if(distClickToPoint < annotationPoint.radius) {
        drag = true;
        playPiece();
    }

    updateCurrentPointPos(mousePos);
}

function handleMove(e) {
    e.preventDefault();

    if(drag) {
        var rect = e.target.getBoundingClientRect();
        var body = document.getElementById("body");

        var touchX = e.changedTouches[0].pageX - body.scrollLeft - rect.left;
        var touchY = e.changedTouches[0].pageY - body.scrollTop - rect.top;

        var mousePos = getMousePosition(touchX, touchY);
        updateCurrentPointPos(mousePos);
    }
}

function handleEnd(e) {
    mouseUp();
}

function keyPress(e) {
    if(e.key == "l") {
        showLabel = !showLabel;
    }
}

function drawCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw circumplex coordinates
    context.drawImage(background,23, 25, 450, 450);

    // Draw circumplex labels
    if(showLabel)
        context.drawImage(labels,30, 30, 450, 450);

    // Draw annotation point
    if(annotationPoint.isEnabled) {
        context.beginPath();
        context.arc(annotationPoint.x,
                    annotationPoint.y,
                    annotationPoint.radius, 0, 2.0 * Math.PI);

        // Paint circle green when user drops the mouse on the model
        if(drag)
            context.fillStyle = "rgba(80, 127, 80, 0.85)";
        else
            context.fillStyle = "rgba(80, 80, 80, 0.85)";

        context.fill();

        context.drawImage(playIcon, annotationPoint.x-annotationPoint.radius,
                                    annotationPoint.y-annotationPoint.radius,
                                    annotationPoint.radius*2,
                                    annotationPoint.radius*2);
    }
}
