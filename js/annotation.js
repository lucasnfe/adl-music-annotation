// Global state booleans
var showLabel = true;
var drag = false;

// Canvas geometry variables
var circumplexRadius = 200;
var circumplexXLimit = 340;
var circumplexYLimit = 275;

var pointRadius = 25;

var clientX = 0.0;
var clientY = 0.0;

// Canvas global object
var canvas = document.getElementById("circumplex-canvas");
if(canvas != null) {
    var context = canvas.getContext("2d");

    var annotationPoint = new AnnotationPoint(canvas.width*0.5, canvas.height*0.5, pointRadius)
    annotationPoint.isEnabled = true;
    annotationPoint.isPlayed = true;
}

// Audio controls global object
var audioControls = document.getElementById("audio-controls");

// Canvas images
var background = new Image();
background.src = "img/circumplex.png";

var labels = new Image();
labels.src = "img/circumplex-labels.png";

var playIcon = new Image();
playIcon.src = "img/play-icon.png";

// Global lists to store and control pieces to play
var pieces = [];
var piecesToAnnotate = [];

var annotation = {};

var numberPiecesToAnnotate = 3;
var currentPiece = 0;

var firebaseScript = document.createElement('script');
firebaseScript.src = "https://www.gstatic.com/firebasejs/5.0.1/firebase.js";
firebaseScript.onload = function() {
    var config = {
      apiKey: "AIzaSyDW7mMPdDf9OMugsEYF-LOafz6y4fsN8Ss",
      authDomain: "adl-music-annotation.firebaseapp.com",
      databaseURL: "https://adl-music-annotation.firebaseio.com",
      projectId: "adl-music-annotation",
      storageBucket: "adl-music-annotation.appspot.com",
      messagingSenderId: "1030467665544"
    };

    firebase.initializeApp(config);

    // Get a reference to the database service
    var database = firebase.database();
}
document.body.appendChild(firebaseScript);

function AnnotationPoint(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.isEnabled = false;
    this.isPlayed = false;
    return this;
}

function main() {
    downloadPieces(initAnnotationPoint);

    init();
    update();
}

function enableAnnotationPoint(index) {
    annotationPoint.isEnabled = true;
}

function playAnnotationPoint(index) {
    annotationPoint.isPlayed = true;
}

function init() {
    drag = false;

    annotation.answer1_1 = sessionStorage.getItem("answer1_1");
    annotation.answer1_2 = sessionStorage.getItem("answer1_2");
    annotation.answer1_3 = sessionStorage.getItem("answer1_3");

    annotation.answer2_1 = sessionStorage.getItem("answer2_1");
    annotation.answer2_2 = sessionStorage.getItem("answer2_2");
    annotation.answer2_3 = sessionStorage.getItem("answer2_3");

    document.getElementById("annotation-area").addEventListener('mousedown', mouseDown, false);
    document.getElementById("annotation-area").addEventListener('mouseup', mouseUp, false);
    document.getElementById("annotation-area").addEventListener('mousemove', mouseMove, false);
    document.getElementById("body").addEventListener('keypress', keyPress, false);

    audioControls.currentTime = 0;
    updateProgressBar();
}

function resetAnnotationPoint() {
    init();

    console.log("reset!");

    annotationPoint.x = canvas.width*0.5;
    annotationPoint.y = canvas.width*0.5;
    annotationPoint.isPlayed = false;

    audioControls.pause();
}

function getPiecesToAnnotate(piecesData, annotations) {
    var piecesToAnnotate = []

    for (var key in piecesData) {
        if (piecesData.hasOwnProperty(key) && annotations[key] == null) {
            piecesData[key].id = key;
            piecesToAnnotate.push(piecesData[key]);
        }
    }

    return piecesToAnnotate;
}

function initAnnotationPoint(data) {
    var piecesData = data.pieces;
    var annotationData = data.annotations;

    if(piecesData != null) {
        piecesToAnnotate = getPiecesToAnnotate(piecesData, annotationData);

        document.getElementById('audio-source').src = piecesToAnnotate[currentPiece].audio
        document.getElementById('audio-controls').load();

        loadXML(piecesToAnnotate[0].xml, function(xml_string) {
            var measuresAmount = parseMeasuresAmountFromMusicXML(xml_string)
            annotation.measuresAmount = measuresAmount;
            annotation.piece = piecesToAnnotate[0].xml;
            annotation.valence = new Array(measuresAmount).fill(0);
            annotation.arousal = new Array(measuresAmount).fill(0);
        });
    }
}

function update() {
    updateFeedbackValue();
    // updateAnimation();

    if(drag) {
        if(audioControls.paused)
            audioControls.play();

        updateCurrentPointPos();
        updateProgressBar();
        annotateEmotion();
    }

    draw();
    requestAnimationFrame(update);
}

function updateFeedbackValue() {
    if(currentPiece < 0 || currentPiece >= piecesToAnnotate.length)
        return;

    var rect = canvas.getBoundingClientRect();

    var valence = ((annotationPoint.x - canvas.width*0.5)/circumplexRadius);
    var arousal = ((annotationPoint.y - canvas.height*0.5)/circumplexRadius) * -1;

    var labels = document.getElementById("circumplex-labels");
    if(labels) {
        labels.innerHTML = "Valence: " + valence.toFixed(2) + "<br>" + "Arousal: " + arousal.toFixed(2);
    }
}

function updateCurrentPointPos(e) {
    var rect = canvas.getBoundingClientRect();

    var newPosX = clientX - rect.left - canvas.width*0.5;
    var newPosY = clientY - rect.top - canvas.height*0.5;

    if(Math.abs(newPosX) < circumplexXLimit &&
       Math.abs(newPosY) < circumplexYLimit) {

        var mag = Math.sqrt(newPosX*newPosX + newPosY*newPosY);
        if(mag > circumplexRadius) {
            newPosX = newPosX/mag * circumplexRadius;
            newPosY = newPosY/mag * circumplexRadius;
        }

        annotationPoint.x = newPosX + canvas.width*0.5;
        annotationPoint.y = newPosY + canvas.height*0.5;
    }
}

function updateProgressBar() {
    progressBar = document.getElementById('progress')
    if(progress != null) {
        var percentPlayed = Math.ceil((audioControls.currentTime/audioControls.duration)*100);
        progressBar.style.width = String(percentPlayed) + "%";

        if(percentPlayed >= 100) {
            didFinishTask = window.confirm("You finished annotating this piece. Do you want annotate the next piece?");
            if(didFinishTask) {
                saveAnnotation();

                nextPiece();
                resetAnnotationPoint(currentPiece);
            }
            else{
                resetAnnotationPoint(currentPiece);
            }
        }
    }
}

function mouseDown(e) {
    clientX = e.clientX;
    clientY = e.clientY;

    var rect = canvas.getBoundingClientRect();

    var newPosX = clientX - rect.left;
    var newPosY = clientY - rect.top;

    var mag = Math.sqrt(Math.pow((newPosX-annotationPoint.x), 2) +
                        Math.pow((newPosY-annotationPoint.y), 2));

    if(mag < annotationPoint.radius) {
        drag = true;
    }

    updateCurrentPointPos();
}

function mouseUp(e) {
    drag = false;
    audioControls.pause();
}

function mouseMove(e) {
    e.preventDefault();
    clientX = e.clientX;
    clientY = e.clientY;
}

function keyPress(e) {
    if(e.key == "l") {
        showLabel = !showLabel;
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.drawImage(background,0,0, canvas.width, canvas.height);

    if(showLabel)
        context.drawImage(labels,0,0, canvas.width, canvas.height);

    // Draw annotation points
    if(annotationPoint.isEnabled) {
        var pointPosX = annotationPoint.x + 5;
        var pointPosY = annotationPoint.y;

        context.beginPath();
        context.arc(pointPosX,
                    pointPosY,
                    annotationPoint.radius, 0, 2.0 * Math.PI);

        // Paint circle green when user drops the mouse on the model
        if(drag)
            context.fillStyle = "rgba(80, 127, 80, 0.85)";
        else
            // if(points[i].isPlayed)
                // context.fillStyle = "rgba(242, 127, 0, 0.85)";
            // else
                context.fillStyle = "rgba(80, 80, 80, 0.85)";

        context.fill();

        context.drawImage(playIcon, pointPosX-annotationPoint.radius,
                                    pointPosY-annotationPoint.radius,
                                    annotationPoint.radius*2,
                                    annotationPoint.radius*2);

        // context.fillStyle = "rgba(1, 1, 1, 1)";
        // context.fillText(i+1, points[i].x, points[i].y + points[i].radius*0.25);
    }
}

function annotateEmotion() {
    var labels = document.getElementById("circumplex-labels");

    if(labels != null) {
        var valence = parseFloat(labels.innerHTML.split("<br>")[0].split(": ")[1])
        var arousal = parseFloat(labels.innerHTML.split("<br>")[1].split(": ")[1])

        if(annotation.measuresAmount) {
            currentMeasure = timeToMusicMeasure(annotation.measuresAmount);

            annotation.valence[currentMeasure] = valence;
            annotation.arousal[currentMeasure] = arousal;
        }
    }
}

function updatePieceLabel() {
    var labels = document.getElementById("label");
    if(labels) {
        labels.innerHTML = "Piece " + (currentPiece + 1).toString();
    }
}

function previousPiece() {
    currentPiece -= 1;

    if(currentPiece >= 0) {
        updateMotifLabel();
        // annotateEmotion();

        document.getElementById('audio-source').src = piecesToAnnotate[currentPiece].audio
        document.getElementById('audio-controls').load();
        document.getElementById('image').src = piecesToAnnotate[currentPiece].score

    }
    else {
        currentPiece = 0;
        console.log("This is the first video.");
        // updateMotifLabel();
    }
}

function nextPiece() {
    currentPiece += 1;
    console.log(currentPiece);
    console.log(piecesToAnnotate.length);

    if(currentPiece < piecesToAnnotate.length) {
        // updateMotifLabel();
        // annotateEmotion();

        document.getElementById('audio-source').src = piecesToAnnotate[currentPiece].audio
        document.getElementById('audio-controls').load();
    }
    else {
        currentPiece = piecesToAnnotate.length - 1;
        finishAnnotation();
    }
}

function finishAnnotation() {
    // annotateEmotion();
    saveAnnotation();
    nextPage("final.html")
}

function downloadPieces(onLibraryDownloaded) {
    firebase.app().database().ref().once('value')
        .then(function (snap) {
             onLibraryDownloaded(snap.val());
        });
}

function saveAnnotation() {
    // for(i = 0; i < piecesToAnnotate.length; i++) {
        console.log(annotation);

        firebase.database().ref('annotations/' + piecesToAnnotate[currentPiece].id).set({
            valence : annotation.valence,
            arousal: annotation.arousal,
            answer1_1: annotation.answer1_1,
            answer1_2: annotation.answer1_2,
            answer1_3: annotation.answer1_3,
            answer2_1: annotation.answer2_1,
            answer2_2: annotation.answer2_2,
            answer2_3: annotation.answer2_3
        });
    // }
}

function timeToMusicMeasure(measuresAmount) {
    return Math.floor(audioControls.currentTime/audioControls.duration * measuresAmount);
}

function parseMeasuresAmountFromMusicXML(music_xml) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(music_xml, "text/xml");
    var parts = xmlDoc.getElementsByTagName("part");

    measuresAmount = 0;
    for (var i = 0; i < parts.length; i++) {
        measures = parts[i].getElementsByTagName("measure")
        forward_repeat = null
        backward_repeat = null

        for (var j = 0; j < measures.length; j++) {
            measuresAmount += 1;

            repeat = measures[j].getElementsByTagName("repeat")
            if(repeat.length > 0) {
                direction = repeat[0].getAttribute("direction");
                if(direction == "backward") {
                    backward_repeat = measures[j];
                    backward_measure_number = parseInt(backward_repeat.getAttribute("number"));

                    forward_measure_number = 0;
                    if(forward_repeat != null) {
                        forward_measure_number = parseInt(backward_repeat.getAttribute("number"));
                    }

                    measuresAmount += (backward_measure_number - forward_measure_number)
                }
                else if (direction == "forward") {
                    forward_repeat = measures[j];
                }
            }
        }
    }

    return measuresAmount;
}

// if(context != null) {
//     init();
//     update();
// }
