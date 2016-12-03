"use strict";

const controller = require("./js/controller");
const appsettings = require("./js/settings");
//const googleDrive  = require("./js/gdrive");

//CodeMirror object for editor
var editor;

//Magic starts here
function main() {
    //Load the settings
    controller.loadSettings();

    //Add click events to new, open and save buttons
    $(".new-file").click(function() { controller.createNewFile(); });
    $(".open-file").click(function() { controller.openFile(); });
    $(".save-file").click(function() { controller.saveFile(); });

    //Create a CodeMirror editor instance for the div element "editor"
    editor = CodeMirror($("#editor")[0], {
            lineNumbers: true,
            theme: appsettings.getSetting("theme"),
            autofocus: true,
            viewportMargin: Infinity
    });

    //Create an event handler for changing theme
    var themelist = $("#themelist");
    themelist.on("click", "li", { themelist: themelist }, controller.changeTheme);

    //Create an event handler for changing mode
    $(".select-mode").on("click", controller.changeMode);

    //Set the current date
    var currdate = new Date();
    $("#date-string").text(currdate.toDateString());

    //Create an event handler for the change event in the editor
    editor.on("change", controller.updateWordAndCharacterCount);
    controller.updateWordAndCharacterCount(editor);

    //Create event handlers for modal open and save buttons when dealing with Google Drive API
    $("#modal-open-button").click(function() { controller.setGoogleDriveFileDataToEditor(); });
    $("#modal-save-button").click(function() { controller.saveDataToGoogleDrive(); });

    //Put focus on the editor
    editor.focus();
}

$(document).ready(main());
