"use strict";

const controller = require('./js/controller');

//CodeMirror object for editor
var editor;

//Magic starts here
function main() {
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

    //Set the current date
    var currdate = new Date();
    $("#date-string").text(currdate.toDateString());

    //Create an event handler for the change event in the editor
    editor.on("change", controller.updateWordAndCharacterCount);
    controller.updateWordAndCharacterCount(editor);

    //Put the cursor at the end of the document
    editor.execCommand("goDocEnd");
}

$(document).ready(main());

/*TODO
 * - add event like mouse-over or (something like that) on buttons to change color when mouse-over/hover
 *
 *
 *
 */
