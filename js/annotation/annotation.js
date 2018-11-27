var annotationStartingPoint = {x: 0.0, y: 0.0}
var annotationDuration = 15;

function main() {
    downloadPieces(getPiecesToAnnotate);

    initController();
    initCanvas();

    setStep1Modal();
}

function updateAnnotation() {
    if(drag) {
        updateProgressBar();
        annotateEmotion();
    }

    drawCanvas();

    requestAnimationFrame(updateAnnotation);
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

function updateProgressBar() {
    progressBar = document.getElementById('progress')
    if(progress != null) {

        if(annotationState == 0)
            document.getElementById("progressTitle").innerHTML = "Step 1: Calibration";
        else if (annotationState == 1)
            document.getElementById("progressTitle").innerHTML = "Step 2: Annotation";

        var audioControls = document.getElementById('audio-controls')

        var duration = annotationDuration;
        if (annotationState == 1) {
            duration = piecesToAnnotate[currentPiece].duration;
        }

        var remainingTime = formatSecondsAsTime(audioControls.currentTime);
        var totalTime = formatSecondsAsTime(duration);

        document.getElementById("remainingTime").innerHTML = remainingTime + "/" + totalTime;

        var percentPlayed = Math.ceil((audioControls.currentTime/duration)*100);
        progressBar.style.width = String(percentPlayed) + "%";

        if(percentPlayed >= 100) {
            audioControls.pause();
            document.getElementById("remainingTime").innerHTML = totalTime + "/" + totalTime;

            if (annotationState == 0) {
                annotationStartingPoint.x = annotationPoint.x;
                annotationStartingPoint.y = annotationPoint.y;

                setStep2Modal();
            }
            else {
                setStep3Modal();
            }
        }
    }
}

function updatePieceLabel(pieceName) {
    document.getElementById("piece-name").innerHTML = pieceName;
}

function setStep1Modal() {
    // document.getElementById("annotationStep").innerHTML = "Step 1 - Calibration";
    document.getElementById("modalTitle").innerHTML = "Step 1: Calibration";
    document.getElementById("modalBodyFirstParagraph").innerHTML =
        `While listenning to the first 15 seconds of the piece, set the
        starting point of the annotation.`;

    document.getElementById("modalBodySecondParagraph").innerHTML = ``;
    document.getElementById("modalConfirmationButton").innerHTML = "Start Calibration";

    $('#modalCloseButton').addClass("d-none");

    $('#modalCloseButton').off('click');
    $('#modalConfirmationButton').off('click');

    mouseUp();
    $('#myModal').modal('show');
}

function setStep2Modal() {
    // document.getElementById("annotationStep").innerHTML = "Step 2 - Annotation";
    document.getElementById("modalTitle").innerHTML = "Step 2: Annotation";
    document.getElementById("modalBodyFirstParagraph").innerHTML =
        `Starting from where the annotation point is right now,
         listen to the piece again and annotate it entirelly.`;

    document.getElementById("modalBodySecondParagraph").innerHTML =
        `<b>Keep in mind that emotions in music don't normally
         change very drastically.</b>`;

    document.getElementById("modalConfirmationButton").innerHTML = "Start Annotation";

    $('#modalCloseButton').addClass("d-none");
    $('#modalCloseButton').off('click');

    $('#modalConfirmationButton').off('click');
    $('#modalConfirmationButton').on('click', function (e) {
        annotationState = 1;

        // document.getElementById('audio-controls').currentTime = 0;
        // updateProgressBar();
        initAnnotationPoint();
    });

    mouseUp();
    $('#myModal').modal('show');
}

function setStep3Modal() {
    // document.getElementById("annotationStep").innerHTML = "Step 3 - Confirmation";
    document.getElementById("modalTitle").innerHTML = "Step 3: Confirmation";

    document.getElementById("modalBodySecondParagraph").innerHTML = "";

    document.getElementById("modalCloseButton").innerHTML = "Reannotate this Piece";

    if(currentPiece < piecesToAnnotate.length - 1) {
        document.getElementById("modalBodyFirstParagraph").innerHTML = `
            You finished annotating this piece. Do you want annotate the next piece?`;
        document.getElementById("modalConfirmationButton").innerHTML = "Next Piece";

        $('#modalConfirmationButton').off('click');
        $('#modalConfirmationButton').on('click', function (e) {
            annotationState = 0;
            nextPiece();
        });
    }
    else {
        document.getElementById("modalBodyFirstParagraph").innerHTML = `
            You finished annotating this piece and this was the last one. Do you want to finish the task?`;
        document.getElementById("modalConfirmationButton").innerHTML = "Finish Task";

        $('#modalConfirmationButton').off('click');
        $('#modalConfirmationButton').on('click', function (e) {
            annotationState = 0;
            finishAnnotation();
        });
    }

    $('#modalCloseButton').removeClass("d-none");
    $('#modalCloseButton').on('click', function (e) {
        initAnnotationPoint();
    });

    mouseUp();
    $('#myModal').modal('show');
}
