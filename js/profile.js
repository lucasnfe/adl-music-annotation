var genderSelect       = null;
var ageSelect          = null;
var countrySelect      = null;
var musicianshipSelect = null;

function updatePiecesLabels(piecesStr) {
    var pieces = piecesStr.split("@")
    for (var i = 0; i < pieces.length - 1; i++) {
        var checkbox = document.createElement("div");
        checkbox.classList.add("custom-control");
        checkbox.classList.add("custom-checkbox");

        var input = document.createElement("input");
        input.classList.add("custom-control-input");
        input.setAttribute("type", "checkbox");
        input.id = "knownPieceCheck" + i;
        checkbox.appendChild(input);

        var label = document.createElement("label");
        label.classList.add("custom-control-label");
        label.innerHTML = "Piece " + (i+1) + ": " + pieces[i];
        label.setAttribute("for", input.id);
        checkbox.appendChild(label);

        document.getElementById("knownPiecesCheckboxes").appendChild(checkbox);
    }
}

function addCheckEventListenners() {
    genderSelect.addEventListener("change", function (event) {
        enableNextButton();
    });

    ageSelect.addEventListener("change", function (event) {
        enableNextButton();
    });

    countrySelect.addEventListener("change", function (event) {
        enableNextButton();
    });

    musicianshipSelect.addEventListener("change", function (event) {
        enableNextButton();
    });
}

function enableNextButton() {
    var submitButton = document.getElementById('submitButton');
    submitButton.disabled = !validateProfileForm();
    console.log(validateProfileForm());
}

function validateProfileForm() {
    return genderSelect.value != "" && ageSelect.value != "" && countrySelect.value != "" && getMusicianshipValue() != "";
}

function getMusicianshipValue() {
    for(var i = 1; i <= 5; i++) {
        if($("#musicianshipCheck" + i).is(':checked') == true) {
            return i;
        }
    }

    return "";
}

function updatePiecesCount(data) {
    var piecesData = data.pieces;
    var annotationData = data.annotations;

    if(piecesData != null) {
        var piecesAnnCount = getPiecesAnnotationCount(piecesData, annotationData);

        var annotation = {};

        annotation.answer1_1 = sessionStorage.getItem("answer1_1");
        annotation.answer1_2 = sessionStorage.getItem("answer1_2");
        annotation.answer1_3 = sessionStorage.getItem("answer1_3");

        annotation.answer2_1 = sessionStorage.getItem("answer2_1");
        annotation.answer2_2 = sessionStorage.getItem("answer2_2");
        annotation.answer2_3 = sessionStorage.getItem("answer2_3");

        annotation.gender = genderSelect.value;
        annotation.age = ageSelect.value;
        annotation.country = countrySelect.value;
        annotation.musicianship = getMusicianshipValue();

        var piecesStr = sessionStorage.getItem("pieces");
        var pieces = piecesStr.split("@");

        // var countStr = sessionStorage.getItem("count");
        // var count = countStr.split("@");

        var valenceStr = sessionStorage.getItem("valence");
        var valence = valenceStr.split("@");

        var arousalStr = sessionStorage.getItem("arousal");
        var arousal = arousalStr.split("@");

        for (var i = 0; i < pieces.length - 1; i++) {
            var count = piecesAnnCount[pieces[i]];

            annotation.isKnown = $('#knownPieceCheck' + i).is(':checked');
            annotation.valence = JSON.parse("[" + valence[i].substring(0, valence[i].length - 2) + "]");
            annotation.arousal = JSON.parse("[" + arousal[i].substring(0, arousal[i].length - 2) + "]");

            savePieceAnnotation(pieces[i], count, annotation);
        }

        nextPage("final.html")
    }
}

function submitProfileForm() {
    downloadPieces(updatePiecesCount);
}

function main() {
    genderSelect       = document.getElementById('genderSelect');
    ageSelect          = document.getElementById('ageSelect');
    countrySelect      = document.getElementById('countrySelect');
    musicianshipSelect = document.getElementById('musicianshipSelect');

    var piecesStr = sessionStorage.getItem("names");
    if(piecesStr != null) {
        updatePiecesLabels(piecesStr);
    }

    addCheckEventListenners();
}
