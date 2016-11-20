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

//Magic starts here
function main() {
    //Create a CodeMirror editor instance for the div element "editor"
    editor = CodeMirror($("#editor")[0], {
            value: "write text here ...",
            lineNumbers: true,
            theme: "ambiance",
            autofocus: true,
            viewportMargin: Infinity

    });

    //Create an event handler for changing theme
    var themelist = $("#themelist");
    themelist.on("click", "li", { themelist: themelist }, changeTheme);

    //Set the current date
    var currdate = new Date();
    $("#date-string").text(currdate.toDateString());

    //Create and event handler for the change event in the editor
    editor.on("change", updateWordAndCharacterCount);
    updateWordAndCharacterCount(editor);

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
