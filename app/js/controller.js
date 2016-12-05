const fs = require("fs");

const {dialog} = require("electron").remote;
const gdriveapi = require("./gdrive");
const appsettings = require("./settings");

/*********************/
/* Private Functions */
/*********************/
//This function reads the file content into the editor
function readFileContentsIntoEditor(filename) {
    fs.readFile(filename, function(err, data) {
        if(err) {
            dialog.showErrorBox("File Save Error: ", err.message);
            return console.error("Error while reading file \"" + filename + "\": " + err);
        }
        editor.setValue(data.toString());
    });
}

//This function writes the editor content into a file
function writeEditorContentsToFile(filename) {
    fs.writeFile(filename, editor.getValue(), function(err) {
        if(err) {
            dialog.showErrorBox("File Write Error: ", err.message);
            return console.error("Error while writing to file \"" + filename + "\": " + err);
        }
    });
}

//This function disables the buttons
function disableAllButtons() {
    $(".new-file").prop("disabled", true);
    $(".open-file").prop("disabled", true);
    $(".save-file").prop("disabled", true);
    $(".dropdown-toggle").prop("disabled", true);
    $(".select-mode").prop("disabled", true);
}

//This function enables the buttons
function enableAllButtons() {
    $(".new-file").prop("disabled", false);
    $(".open-file").prop("disabled", false);
    $(".save-file").prop("disabled", false);
    $(".dropdown-toggle").prop("disabled", false);
    $(".select-mode").prop("disabled", false);
}

/*******************/
/* Public Function */
/*******************/
//This function loads the settings; last saved settings
var loadSettings = function loadSettings() {
    $("#themelist #" + appsettings.getSetting("theme")).addClass("disabled");
    $("#opened-file-name").text(appsettings.getSetting("filename"));

    var mode = appsettings.getSetting("mode");
    $(".select-mode #current-editor-mode").text(mode);
    if(mode === "local") {
        //Load the last opened file in the editor
        if(appsettings.getSetting("filelocation") !== "") {
            readFileContentsIntoEditor(appsettings.getSetting("filelocation"));
        }
    }
    else {
        //Load the Google Drive file in the editor
        var fileid = appsettings.getSetting("fileid");
        if(fileid !== "") {
            gdriveapi.communicateToGoogleDrive("getfiledata", { "fileid": fileid, "filename": "" });
        }
    }
}

//This function updates the word and character counts
var updateWordAndCharacterCount = function updateWordAndCharacterCount(editor) {
    //var charactersCount = 0;
    var wordsCount = 0;

    //Loop over each line in the editor and process the text
    editor.eachLine(function(line) {
        var text = line.text;
        //charactersCount += text.length;
        text = text.trim();
        if(text.length > 0) {
            wordsCount += (text.match(/\s+/g)||[]).length + 1;
        }
    });

    //Update the counts
    //$("#characters-length").text(charactersCount);
    $("#words-length").text(wordsCount);
};

//This function changes the mode: local or gdocs
var changeMode = function changeMode() {
    var currText = $(".select-mode #current-editor-mode").text();
    $(".select-mode #current-editor-mode").text(currText == "local" ? "gdocs" : "local");
    $(this).blur();

    //Update the settings
    appsettings.setSetting("mode", $(".select-mode #current-editor-mode").text());

    //Set all other settings to empty
    createNewFile();
}

//This function changes the theme of the editor
var changeTheme = function changeTheme(event) {
    //Set the theme option of the editor
    editor.setOption("theme", $(this).text());

    //Find the li element with class = disabled
    var currDisabledLi = event.data.themelist.find(".disabled")
    currDisabledLi.removeClass("disabled");
    $(this).addClass("disabled");

    //Update the settings
    appsettings.setSetting("theme", $(this).text());
}

//Create a new file
var createNewFile = function createNewFile() {
    //Empty the editor
    editor.setValue("");

    //Clear the filename label
    $("#opened-file-name").text("[ No File ]");

    //Put focus back on the editor
    editor.focus();

    //Update the settings for filename and filelocation
    appsettings.setSetting("fileid", "");
    appsettings.setSetting("filename", "[ No File ]");
    appsettings.setSetting("filelocation", "");
}

//Opens the file
var openFile = function openFile() {
    //Check if the mode is local or gdocs
    if(appsettings.getSetting("mode") === "local") {
        //Disable all the buttons
        disableAllButtons();

        dialog.showOpenDialog({properties: ["openFile"]}, function(filename) {
            if(typeof filename !== "undefined") {
                readFileContentsIntoEditor(filename[0]);

                //Set the filename
                var justFileName = filename[0].split("/");
                $("#opened-file-name").text(justFileName[justFileName.length-1]);

                //Update the settings
                appsettings.setSetting("filename", justFileName[justFileName.length-1]);
                appsettings.setSetting("filelocation", filename[0]);
            }

            //Enable all the buttons
            enableAllButtons();

            //Put focus back on the editor
            editor.focus();
        });
    }
    else {
        //Talk to Google Drive module to list the files in the open dialog modal
        gdriveapi.communicateToGoogleDrive("listfiles", { "fileid": "", "filename": "" });
    }
}

//Saves the file
var saveFile = function saveFile() {
    //Check if the mode is local or gdocs
    if(appsettings.getSetting("mode") === "local") {
        //Disable all the buttons
        disableAllButtons();

        dialog.showSaveDialog(function(filename) {
            if(typeof filename !== "undefined") {
                writeEditorContentsToFile(filename);

                //Set the filename
                var justFileName = filename.split("/");
                $("#opened-file-name").text(justFileName[justFileName.length-1]);

                //Update the settings
                appsettings.setSetting("filename", justFileName[justFileName.length-1]);
                appsettings.setSetting("filelocation", filename);

                //Show message to the user that the file has been saved
                dialog.showMessageBox({ message: "The file has been saved! :)", buttons: ["OK"] });
            }
            //Enable all the buttons
            enableAllButtons();
        });
    }
    else {
        var fileid = appsettings.getSetting("fileid");
        if(fileid === "") {
            var modalOptions = {
                "backdrop": "static",
                "keyboard": "true"
            }
            $("#save-file-dialog").modal(modalOptions);
        }
        else {
            gdriveapi.communicateToGoogleDrive("updatefile", { "fileid": fileid, "filename": "" });
        }
    }

    //Put focus back on the editor
    editor.focus();
}

//Set the editor content to the Google Drive selected file data
function setGoogleDriveFileDataToEditor() {
    //Get the name and id of the file user has selected
    var nameOfSelectedFile = $("#select-google-drive-file :selected").text();
    var idOfSelectedFile = $("#select-google-drive-file :selected").attr("value");

    //Talk to Google Drive module and update the editor
    gdriveapi.communicateToGoogleDrive("getfiledata", { "fileid": idOfSelectedFile, "filename": "" });
    $("#open-file-dialog").modal("hide");

    //Update the editor opened file name label
    $("#opened-file-name").text(nameOfSelectedFile);

    //Update the settings
    appsettings.setSetting("filename", nameOfSelectedFile);
    appsettings.setSetting("fileid", idOfSelectedFile);
}

function saveDataToGoogleDrive() {
    //Get the filename entered
    var filename = $("#save-file-dialog-filename").val();

    //Talk to Google Drive module and create the file
    gdriveapi.communicateToGoogleDrive("createnewfile", { "fileid": "", "filename": filename } );
    $("#save-file-dialog").modal("hide");

    //Update the editor opened file name label
    $("#opened-file-name").text(filename);
}

//Export the public functions
module.exports = {
    loadSettings,
    changeMode,
    changeTheme,
    updateWordAndCharacterCount,
    createNewFile,
    openFile,
    saveFile,
    setGoogleDriveFileDataToEditor,
    saveDataToGoogleDrive
}
