const {dialog} = require('electron').remote;
const fs = require("fs");

/*********************/
/* Private Functions */
/*********************/
//This function reads the file content into the editor
function readFileContentsIntoEditor(filename) {
    fs.readFile(filename, function(err, data) {
        if(err) {
            console.error("Error while reading file \"" + filename + "\": " + err);
        }
        editor.setValue(data.toString());
    });
}

//This function writes the editor content into a file
function writeEditorContentsToFile(filename) {
    fs.writeFile(filename, editor.getValue(), function(err) {
        if(err) {
            console.error("Error while writing to file \"" + filename + "\": " + err);
            return;
        }
    });
}

//This function disables the new, open and save buttons
function disableAllButtons() {
    $(".new-file").prop('disabled', true);
    $(".open-file").prop('disabled', true);
    $(".save-file").prop('disabled', true);
}

//This function enables the new, open and save buttons
function enableAllButtons() {
    $(".new-file").prop('disabled', false);
    $(".open-file").prop('disabled', false);
    $(".save-file").prop('disabled', false);
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
    //Set the theme option of the editor
    editor.setOption("theme", $(this).text());

    //Find the li element with class = disabled
    var currDisabledLi = event.data.themelist.find(".disabled")
    currDisabledLi.removeClass("disabled");
    $(this).addClass("disabled");
}

//Create a new file
function createNewFile() {
    //Empty the editor
    editor.setValue("");

    //Put focus back on the editor
    editor.focus();
}

//Opens the file
function openFile() {
    //Disable all the buttons
    disableAllButtons();
    dialog.showOpenDialog({properties: ['openFile']}, function(filename) {
        if(typeof filename !== "undefined") {
            readFileContentsIntoEditor(filename[0]);
        }
        //Enable all the buttons
        enableAllButtons();

        //Put focus back on the editor
        editor.focus();
    });
}

//Saves the file
function saveFile() {
    //Disable all the buttons
    disableAllButtons();
    dialog.showSaveDialog(function(filename) {
        if(typeof filename !== "undefined") {
            writeEditorContentsToFile(filename);
        }
        //Enable all the buttons
        enableAllButtons();
    });
}

//Export the internal functions
module.exports = {
    changeTheme,
    updateWordAndCharacterCount,
    createNewFile,
    openFile,
    saveFile
}
