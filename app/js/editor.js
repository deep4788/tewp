"use strict";

const controller = require("./js/controller");
const appsettings = require("./js/settings");

//CodeMirror object for editor
var editor;

//Magic starts here
function main() {
    //Load app settings TODO
    var settingsObj = appsettings.getSettings();
    console.log(settingsObj);
    console.log("theme1: " + settingsObj["theme"]);
    console.log("mode1: " + settingsObj["mode"]);
    appsettings.changeSetting("theme", "dummy");
    settingsObj = appsettings.getSettings();
    console.log("theme2: " + settingsObj["theme"]);

    //Set the filename
    $("#opened-file-name").text("[ No File ]");

    //Add click events to new, open and save buttons
    $(".new-file").click(function() { controller.createNewFile(); });
    $(".open-file").click(function() { controller.openFile(); });
    $(".save-file").click(function() { controller.saveFile(); });

    //Create a CodeMirror editor instance for the div element "editor"
    editor = CodeMirror($("#editor")[0], {
            lineNumbers: true,
            theme: "ambiance",
            autofocus: true,
            viewportMargin: Infinity
    });

    //Create an event handler for changing theme
    var themelist = $("#themelist");
    themelist.on("click", "li", { themelist: themelist }, controller.changeTheme);
    //TODO add another event handler to themelist to update the database

    //Set the current date
    var currdate = new Date();
    $("#date-string").text(currdate.toDateString());

    //Create an event handler for the change event in the editor
    editor.on("change", controller.updateWordAndCharacterCount);
    controller.updateWordAndCharacterCount(editor);

    //Put focus on the editor
    editor.focus();
}

$(document).ready(main());
