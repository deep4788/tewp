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

//var changeTheTheme = function() {

//};

//Magic starts here
function main() {
    //Create a CodeMirror editor instance for the div element "editor"
    var editor = CodeMirror(document.getElementById("editor"), {
            value: "write text here ...",
            lineNumbers: true,
            theme: "ambiance",
            autofocus: true
    });

    //Change the editor theme when selected from the dropdown menu
    $("#themelist li").on("click", function() {
        editor.setOption("theme", $(this).text());

        //Find the li element with class = disabled
        //var currDisabledLi = $("#themelist li");
        $("#themelist li").removeClass("disabled");
        $(this).addClass("disabled");
        //console.log($(this).text()); XXX
    });

    //Set the current date
    var currdate = new Date();
    $("#date-string").text(currdate.toDateString());

    //TODO write comment here
    editor.on("change", updateWordAndCharacterCount);
    updateWordAndCharacterCount(editor);

    //editor.goDocEnd;
}



$(document).ready(main());
