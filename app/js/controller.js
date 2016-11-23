//This function updates the word and character counts
var updateWordAndCharacterCount = function(editor) {
    var charactersCount = 0;
    var wordsCount = 0;

    //Loop over each line in the editor and process the text
    editor.eachLine(function(line) {
        var text = line.text;
        charactersCount += text.length;
        text = text.trim();
        if(text.length > 0) {
            wordsCount += (text.match(/\s+/g)||[]).length + 1;
        }
    });

    //Update the counts
    $("#characters-length").text(charactersCount);
    $("#words-length").text(wordsCount);
};

//This function changes the theme of the editor
function changeTheme(event) {
    editor.setOption("theme", $(this).text());

    //Find the li element with class = disabled
    var currDisabledLi = event.data.themelist.find(".disabled")
    currDisabledLi.removeClass("disabled");
    $(this).addClass("disabled");
}

function createNewFile() {
    console.log("new button is clicked");
    editor.setValue("");
    editor.focus();
}

//function openFile() {
//
//}
//
//function saveFile() {
//
//}

//Export the internal functions
module.exports = {
    changeTheme,
    updateWordAndCharacterCount,
    createNewFile
}
