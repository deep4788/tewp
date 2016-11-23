const {dialog} = require('electron').remote;
const fs = require("fs");

/*********************/
/* Private Functions */
/*********************/
function readFileContentsIntoEditor(filename) {
    fs.readFile(filename, function(err, data) {
        if(err) {
            console.log("Error while reading file \"" + filename + "\": " + err);
        }
        editor.setValue(data.toString());
    });
}

/*******************/
/* Public Function */
/*******************/

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

function openFile() {
    //Disable the open button so user cannot open multiple instances of dialog
    $(".open-file").prop('disabled', true);
    dialog.showOpenDialog({properties: ['openFile']}, function(filename) {
        if(typeof filename === "undefined") {
            console.log("deep it is undefinedth");
        }
        else {
            console.log(filename[0]);
            readFileContentsIntoEditor(filename[0]);
        }
        $(".open-file").prop('disabled', false);
    });
}

function saveFile() {
    console.log("save file button is clicked");
}

//Export the internal functions
module.exports = {
    changeTheme,
    updateWordAndCharacterCount,
    createNewFile,
    openFile,
    saveFile
}
