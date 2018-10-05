
function main() {
    document.getElementById("completion-code").innerHTML = generateCompletionCode();
}

function generateCompletionCode() {
    return Math.floor(Math.random() * 999999999);
}
