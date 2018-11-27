
function main() {
    // Valence Example 1
    var select1_1 = document.getElementById('inputGroupSelect1-01');
    var answer1_1 = sessionStorage.getItem("answer1_1");
    if (answer1_1 != null) {
        select1_1.value = answer1_1;
    }

    select1_1.addEventListener("change", function (event) {
        enableNextButton();
    });

    // Arousal Example 1
    var select1_2 = document.getElementById('inputGroupSelect1-02');
    var answer1_2 = sessionStorage.getItem("answer1_2");
    if (answer1_2 != null) {
        select1_2.value = answer1_2;
    }

    select1_2.addEventListener("change", function (event) {
        enableNextButton();
    });

    // Description Example 1
    var description1 = document.getElementById('inputGroupDescription1');
    var answer1_3 = sessionStorage.getItem("answer1_3");
    if (answer1_3 != null) {
        description1.value = answer1_3;
    }

    description1.addEventListener("change", function (event) {
        enableNextButton();
    });

    // Valence Example 2
    var select2_1 = document.getElementById('inputGroupSelect2-01');
    var answer2_1 = sessionStorage.getItem("answer2_1");
    if (answer2_1 != null) {
        select2_1.value = answer2_1;
    }

    select2_1.addEventListener("change", function (event) {
        enableNextButton();
    });

    // Arousal Example 2
    var select2_2 = document.getElementById('inputGroupSelect2-02');
    var answer2_2 = sessionStorage.getItem("answer2_2");
    if (answer2_2 != null) {
        select2_2.value = answer2_2;
    }

    select2_2.addEventListener("change", function (event) {
        enableNextButton();
    });

    // Description Example 2
    var description2 = document.getElementById('inputGroupDescription2');
    var answer2_3 = sessionStorage.getItem("answer2_3");
    if (answer2_3 != null) {
        description2.value = answer2_3;
    }

    description2.addEventListener("change", function (event) {
        enableNextButton();
    });

    enableNextButton();
}

function enableNextButton() {
    var nextButton = document.getElementById('next-button');
    nextButton.disabled = !validateExampleForm();
}

function submitExampleForm() {
    var answer1_1 = document.getElementById('inputGroupSelect1-01').value;
    sessionStorage.setItem("answer1_1", answer1_1);

    var answer1_2 = document.getElementById('inputGroupSelect1-02').value;
    sessionStorage.setItem("answer1_2", answer1_2);

    var answer1_3 = document.getElementById('inputGroupDescription1').value;
    sessionStorage.setItem("answer1_3", answer1_3);

    var answer2_1 = document.getElementById('inputGroupSelect2-01').value;
    sessionStorage.setItem("answer2_1", answer2_1);

    var answer2_2 = document.getElementById('inputGroupSelect2-02').value;
    sessionStorage.setItem("answer2_2", answer2_2);

    var answer2_3 = document.getElementById('inputGroupDescription2').value;
    sessionStorage.setItem("answer2_3", answer2_3);
}

function validateExampleForm() {
    var select1_1 = document.getElementById('inputGroupSelect1-01');
    var select1_2 = document.getElementById('inputGroupSelect1-02');
    var description1 = document.getElementById('inputGroupDescription1');

    var example1Input = validadeSingleExample(select1_1, select1_2, description1);

    var select2_1 = document.getElementById('inputGroupSelect2-01');
    var select2_2 = document.getElementById('inputGroupSelect2-02');
    var description2 = document.getElementById('inputGroupDescription2');

    var example2Input = validadeSingleExample(select2_1, select2_2, description2);

    return example1Input && example2Input;
}

function validadeSingleExample(select1, select2, description) {
    return select1.value != "Choose..." && select2.value != "Choose..." && description.value != "";
}
