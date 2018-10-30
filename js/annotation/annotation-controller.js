// Global state variables
var currentPiece = 0;
var annotationState = 0;
var numberPiecesToAnnotate = 2;

// Global lists to store and control pieces to play
var pieces = [];
var piecesToAnnotate = [];

var annotation = {};

function initController() {
    annotationState = 0;
}

function getPiecesAnnotationCount(piecesData, annotationData) {
    var piecesAnnCount = {};
    for (var key in piecesData) {
        if (piecesData.hasOwnProperty(key)) {
            piecesAnnCount[key] = 0;
        }
    }

    if(annotationData != null) {
        for (var key in annotationData) {
            if (annotationData.hasOwnProperty(key)) {
                var pieceInfo = key.split("_")
                var pieceId = pieceInfo[0]
                var pieceAnnCount = parseInt(pieceInfo[1])

                if(piecesAnnCount.hasOwnProperty(pieceId))
                    piecesAnnCount[pieceId] += 1
             }
         }
    }
    return piecesAnnCount;
}

function getMinAnnotatedPieces(piecesAnnCount, piecesData, amount) {
    var minAnnotatedPieces = [];

    for (var i = 0; i < amount; i++) {
        var minCount = 9999999;
        var minPiece = "";

        // Get minimum count
        for (var key in piecesAnnCount) {
            if (piecesAnnCount.hasOwnProperty(key)) {
                if(piecesAnnCount[key] < minCount) {
                    minCount = piecesAnnCount[key];
                    minPiece = key;
                }
            }
        }

        // Check if piece is included
        var isPieceIncluded = false;
        for (var j = 0; j < minAnnotatedPieces.length; j++) {
            if (minAnnotatedPieces[j].id == minPiece) {
                isPieceIncluded = true;
            }
        }

        if(!isPieceIncluded) {
            piecesData[minPiece].id = minPiece;
            piecesData[minPiece].count = minCount;
            minAnnotatedPieces.push(piecesData[minPiece]);
            delete piecesAnnCount[minPiece];
        }

        piecesAnnCount[minPiece] = null;
    }

    return minAnnotatedPieces;
}

function getPiecesToAnnotate(data) {
    var piecesData = data.pieces;
    var annotationData = data.annotations;

    if(piecesData != null) {

        var piecesAnnCount = getPiecesAnnotationCount(piecesData, annotationData);
        piecesToAnnotate = getMinAnnotatedPieces(piecesAnnCount, piecesData, numberPiecesToAnnotate);

        initAnnotationPoint();
    }
}

function initAnnotationPoint() {
    var measuresAmount = piecesToAnnotate[currentPiece].measures;
    annotation[currentPiece] = {}
    annotation[currentPiece].measuresAmount = measuresAmount;
    annotation[currentPiece].piece = piecesToAnnotate[currentPiece].mscx;
    annotation[currentPiece].valence = new Array(measuresAmount).fill(0);
    annotation[currentPiece].arousal = new Array(measuresAmount).fill(0);

    document.getElementById('audio-source').src = piecesToAnnotate[currentPiece].audio

    document.getElementById('audio-controls').load();
    document.getElementById('audio-controls').currentTime = 0;

    updatePieceLabel("Piece " + (currentPiece+1) + ": " + piecesToAnnotate[currentPiece].name);
}

function annotateEmotion() {
    var labels = document.getElementById("circumplex-labels");

    if(labels != null) {
        var valence = parseFloat(labels.innerHTML.split("<br>")[0].split(": ")[1])
        var arousal = parseFloat(labels.innerHTML.split("<br>")[1].split(": ")[1])

        if(annotation[currentPiece].measuresAmount) {
            currentMeasure = timeToMusicMeasure(annotation[currentPiece].measuresAmount);

            annotation[currentPiece].valence[currentMeasure] = valence;
            annotation[currentPiece].arousal[currentMeasure] = arousal;
        }
    }
}

function pausePiece() {
    document.getElementById('audio-controls').pause();
}

function resetPiece(annotationStartingPoint) {
    annotationState = 1;
    document.getElementById('audio-controls').currentTime = 0;

    resetAnnotationPoint(annotationStartingPoint);
}

function previousPiece() {
    currentPiece -= 1;

    if(currentPiece >= 0) {
        initAnnotationPoint();
        resetAnnotationPoint();
    }
    else {
        currentPiece = 0;
    }
}

function nextPiece() {
    currentPiece += 1;
    if(currentPiece < piecesToAnnotate.length) {
        initAnnotationPoint();
        resetAnnotationPoint();
    }
    else {
        currentPiece = piecesToAnnotate.length - 1;
    }
}

function finishAnnotation() {
    var valenceStr = "";
    for(var i = 0; i < currentPiece + 1; i++) {
        for (var j = 0; j < annotation[i].valence.length; j++) {
            valenceStr += annotation[i].valence[j] + ", ";
        }

        valenceStr += "@"
    }
    sessionStorage.setItem("valence", valenceStr);

    var arousalStr = "";
    for(var i = 0; i < currentPiece + 1; i++) {
        for (var j = 0; j < annotation[i].arousal.length; j++) {
            arousalStr += annotation[i].arousal[j] + ", ";
        }

        arousalStr += "@"
    }
    sessionStorage.setItem("arousal", arousalStr);

    var piecesStr = "";
    for (var i = 0; i < piecesToAnnotate.length; i++) {
        piecesStr += piecesToAnnotate[i].id + "@";
    }
    sessionStorage.setItem("pieces", piecesStr);

    var namesStr = "";
    for (var i = 0; i < piecesToAnnotate.length; i++) {
        namesStr += piecesToAnnotate[i].name + "@";
    }
    sessionStorage.setItem("names", namesStr);

    var countStr = "";
    for (var i = 0; i < piecesToAnnotate.length; i++) {
        countStr += piecesToAnnotate[i].count + "@";
    }
    sessionStorage.setItem("count", countStr);

    nextPage("profile.html")
}

function parseMeasuresAmountFromMusicXML(music_xml) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(music_xml, "text/xml");
    var parts = xmlDoc.getElementsByTagName("Part");

    measuresAmount = 0;
    // for (var i = 0; i < parts.length; i++) {
        // console.log(i);
        measures = xmlDoc.getElementsByTagName("Measure")
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
    // }

    return measuresAmount;
}

function timeToMusicMeasure(measuresAmount) {
    var audioControls = document.getElementById('audio-controls');
    return Math.floor(audioControls.currentTime/audioControls.duration * measuresAmount);
}

function formatSecondsAsTime(secs) {
  var hr  = Math.floor(secs / 3600);
  var min = Math.floor((secs - (hr * 3600))/60);
  var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

  if (min < 10){
    min = "0" + min;
  }
  if (sec < 10){
    sec  = "0" + sec;
  }

  return min + ':' + sec;
}
