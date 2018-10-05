
function main() {
    var select1_1 = document.getElementById('inputGroupSelect1-01');
    select1_1.addEventListener("input", function (event) {
        enableNextButton();
    });

    var select1_2 = document.getElementById('inputGroupSelect1-02');
    select1_2.addEventListener("input", function (event) {
        enableNextButton();
    });

    var description1 = document.getElementById('inputGroupDescription1');
    description1.addEventListener("input", function (event) {
        enableNextButton();
    });

    var select2_1 = document.getElementById('inputGroupSelect2-01');
    select2_1.addEventListener("input", function (event) {
        enableNextButton();
    });

    var select2_2 = document.getElementById('inputGroupSelect2-02');
    select2_2.addEventListener("input", function (event) {
        enableNextButton();
    });

    var description2 = document.getElementById('inputGroupDescription2');
    description2.addEventListener("input", function (event) {
        enableNextButton();
    });
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
