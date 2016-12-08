"use strict";

const {shell} = require("electron");
const appsettings = require("./js/settings");
const controller = require("./js/controller");
const gdriveapi = require("./js/gdrive");

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
            indentUnit: 0,
            lineNumbers: true,
            lineWrapping: true,
            theme: appsettings.getSetting("theme"),
            autofocus: true,
            viewportMargin: Infinity,
            extraKeys: {
                "Cmd-N": function() { controller.createNewFile() },
                "Ctrl-N": function() { controller.createNewFile() },
                "Cmd-O": function() { controller.openFile() },
                "Ctrl-O": function() { controller.openFile() },
                "Cmd-S": function() { controller.saveFile() },
                "Ctrl-S": function() { controller.saveFile() }
            }
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

    //Create event handlers for modal done button when dealing with authorizing Google Drive API
    $("#modal-gdrive-auth-done-button").click(function() { gdriveapi.storeToken(); });

    $(document).on("click", "a[href^='http']", function(event) {
        event.preventDefault();
        shell.openExternal(this.href);
    });

    //Attach Enter key to modals for opening and saving a file and also
    //to the done button for Google Drive authorization; enter key
    //  will click open/save/done button on the modal
    $("#open-file-dialog, #save-file-dialog, #auth-gdrive-file-dialog").keypress(function(e) {
        if(e.which === 13) {
            //Prevent default action of closing the form dialog when enter is pressed
            e.preventDefault();

            //Check which modal (open/save/google-authorization) is in focus and take appropriate action
            var elemId = e.target.id;
            if(elemId === "open-file-dialog" || elemId === "select-google-drive-file") {
                controller.setGoogleDriveFileDataToEditor();
            }
            else if(elemId === "save-file-dialog" || elemId === "save-file-dialog-filename") {
                controller.saveDataToGoogleDrive();
            }
            else if(elemId === "auth-gdrive-file-dialog" || elemId === "auth-gdrive-file-dialog-code") {
                gdriveapi.storeToken();
            }
        }
    });

    //Focus on the input text fields when the modals are shown
    $("#save-file-dialog").on("shown.bs.modal", function() {
        $("#save-file-dialog-filename").focus();
    });
    $("#auth-gdrive-file-dialog").on("shown.bs.modal", function() {
        $("#auth-gdrive-file-dialog-code").focus();
    });

    //Put focus back on the editor when the modal has finished being hidden
    $("#open-file-dialog, #save-file-dialog, #auth-gdrive-file-dialog, #confirmation-dialog").on("hidden.bs.modal", function(e) {
        editor.focus();
    });

    //Setup closing timer on confirmation dialog to 1 second
    $("#confirmation-dialog").on("show.bs.modal", function() {
        var confirmModal = $(this);
        clearTimeout(confirmModal.data("hideInterval"));
        confirmModal.data("hideInterval", setTimeout(function() {
            confirmModal.modal("hide");
        }, 1000));
    });

    //Put focus on the editor
    editor.focus();
}

$(document).ready(main());
