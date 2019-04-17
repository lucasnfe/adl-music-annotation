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
    }

    return minAnnotatedPieces;
}

function getPiecesToAnnotate(data) {
    var piecesData = data.pieces;
    var annotationData = data.annotations;

    console.log(data);

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

    document.getElementById('audio-source').src = piecesToAnnotate[currentPiece].audio;
    document.getElementById('audio-controls').addEventListener("canplay", function() {
        // If the audio is ready to be played, update canvas UI
        updatePieceLabel("Piece " + (currentPiece+1) + ": " + piecesToAnnotate[currentPiece].name);

        updateAnnotation();
        updateProgressBar();

        resetAnnotationPoint(annotationStartingPoint);
    });

    document.getElementById('audio-controls').load();
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

function playPiece() {
    var audioControls = document.getElementById('audio-controls');
    if(audioControls.paused)
        audioControls.play();
}

function pausePiece() {
    document.getElementById('audio-controls').pause();
}

function nextPiece() {
    currentPiece += 1;
    if(currentPiece < piecesToAnnotate.length) {
        annotationStartingPoint.x = canvas.width*0.5;
        annotationStartingPoint.y = canvas.height*0.5;

        initAnnotationPoint();
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
