// Firebase configuration
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

function downloadPieces(onLibraryDownloaded) {
    firebase.app().database().ref().once('value')
        .then(function (snap) {
             onLibraryDownloaded(snap.val());
        });
}

function savePieceAnnotation(pieceId, count, annotation) {
    // for(i = 0; i < piecesToAnnotate.length; i++) {
        var annotationId = pieceId + "_" + (count + 1).toString();
        firebase.database().ref('annotations/' + annotationId).set({
            valence : annotation.valence,
            arousal: annotation.arousal,
            ex1_valence: annotation.answer1_1,
            ex1_arousal: annotation.answer1_2,
            ex1_description: annotation.answer1_3,
            ex2_valence: annotation.answer2_1,
            ex2_arousal: annotation.answer2_2,
            ex2_arousal: annotation.answer2_3,
            isKnown: annotation.isKnown,
            gender: annotation.gender,
            age: annotation.age,
            country: annotation.country,
            musicianship: annotation.musicianship,
        });
    // }
}
