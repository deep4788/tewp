// You can also require other files to run in this process
var editor = CodeMirror(document.getElementById("editor"), {
        value: "write text here ...",
        lineNumbers: true,
        theme: "ambiance"
});

$('#themelist li').on('click', function() {
    console.log($(this).text());
    editor.setOption("theme", $(this).text());
});
