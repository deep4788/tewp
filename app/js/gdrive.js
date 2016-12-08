var fs = require("fs");
var readline = require("readline");

const {dialog} = require("electron").remote;
var google = require("googleapis");
var googleAuth = require("google-auth-library");

/*********************************/
/* Private functions and objects */
/*********************************/
//If modifying these scopes, delete previously saved credentials at ~/.credentials/google-drive-nodejs-tewp-project.json
var SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file"
];
var clientSecretFileLocation = require("electron").remote.getGlobal("sharedClientSecretFileLocationObject").clientSecretFileLocation;
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + "/.credentials/";
var TOKEN_PATH = TOKEN_DIR + "google-drive-nodejs-tewp-project.json";
var oauth2Client;

//Bootstrap modal options
var modalOptions = {
    "backdrop": "static",
    "keyboard": "true"
}

/**
 * @brief Create an OAuth2 client with the given credentials, and then
 *  execute the given callback function.
 *
 * @param credentials The authorization client credentials
 * @param fileDataObj The file object containing file's metadata
 * @param callback The callback to call with the authorized client
 */
function authorize(credentials, fileDataObj, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    //Check if we have previously stored a token
    fs.readFile(TOKEN_PATH, function(err, token) {
        if(err) {
            getNewToken(oauth2Client);
        }
        else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client, fileDataObj);
        }
    });
}

/**
 * @brief Get token after prompting dialog for user authorization
 *
 * @param oauth2Client The OAuth2 client to get token for
 */
function getNewToken(oauth2Client) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES
    });

    //Add the returned authorization url to the modal dialog
    $("#authorization-url-anchor").attr("href", authUrl)

    //Pop-up the modal dialog to ask for user input for authorizing Google Drive API
    $("#auth-gdrive-file-dialog").modal(modalOptions);
}

/**
 * @brief Get the file data and update the editor
 *
 * @param auth An authorized OAuth2 client
 * @param fileDataObj The file object containing file's metadata
 */
function getGdriveFileData(auth, fileDataObj) {
    var fileId = fileDataObj.fileid;
    var service = google.drive("v3");
    service.files.export({
        auth: auth,
        fileId: fileId,
        mimeType: "text/plain" }, function(err, response) {
        if(err) {
            dialog.showErrorBox("Google Drive returned an error: ", err.message);
            return console.error("The API returned an error: " + err);
        }

        //Update the editor with the file content
        editor.setValue(response.substring(1));
    });
}

/**
 * @brief Lists the files
 *
 * @param auth An authorized OAuth2 client
 * @param fileDataObj The file object containing file's metadata
 */
function listGdriveFiles(auth, _) {
    var service = google.drive("v3");
    service.files.list({
        auth: auth,
        pageSize: 1000,
        orderBy: "modifiedTime desc",
        q: "name contains 'tewpbydeep_'",
        fields: "files(id, name)" }, function(err, response) {
        if(err) {
            dialog.showErrorBox("Google Drive returned an error: ", err.message);
            return console.error("The API returned an error: " + err);
        }
        var files = response.files;
        if(files.length === 0) {
            console.log("No files found in your Google Drive");
        }
        else {
            //Clear the list and then re-populate it
            $("#select-google-drive-file").empty();
            for(var i = 0; i < files.length; i++) {
                var file = files[i];
                var fileName = file.name.split("_")[1];
                $("#select-google-drive-file").append($("<option>", {
                    value: file.id,
                    text : fileName
                }));
            }

            //Once the files options elements are added to the select element, open the modal dialog
            $(".error-message").hide();
            $("#open-file-dialog").modal(modalOptions);
        }
    });
}

/**
 * @brief Create a new file
 *
 * @param auth An authorized OAuth2 client
 * @param fileDataObj The file object containing file's metadata
 */
function createGdriveFile(auth, fileDataObj) {
    var fileMetadata = {
        "name" : "tewpbydeep_" + fileDataObj.filename,
        "mimeType": "application/vnd.google-apps.document"
    };
    var media = {
        mimeType: "text/plain",
        body: editor.getValue()
    };

    var service = google.drive("v3");
    service.files.create({
        auth: auth,
        resource: fileMetadata,
        media: media,
        fields: "id, name" }, function(err, file) {
        if(err) {
            dialog.showErrorBox("Google Drive returned an error: ", err.message);
            return console.error(err);
        }
        else {
            //Show dialog message for confirmation
            dialog.showMessageBox({ type: "info", message: "The file has been created! :)", buttons: ["OK"] });

            //Update the settings
            appsettings.setSetting("filename", fileDataObj.filename);
            appsettings.setSetting("fileid", file.id);
        }
    });
}

/**
 * @brief Update the file content
 *
 * @param auth An authorized OAuth2 client
 * @param fileDataObj The file object containing file's metadata
 */
function updateGdriveFile(auth, fileDataObj) {
    var fileMetadata = {
        "mimeType": "application/vnd.google-apps.document"
    };
    var media = {
        mimeType: "text/plain",
        body: editor.getValue()
    };

    var service = google.drive("v3");
    service.files.update({
        auth: auth,
        fileId: fileDataObj.fileid,
        resource: fileMetadata,
        media: media,
        fields: "id, name" }, function(err, file) {
        if(err) {
            dialog.showErrorBox("Google Drive returned an error: ", err.message);
            return console.error(err);
        }
        else {
            //Show dialog message for confirmation
            dialog.showMessageBox({ type: "info", message: "The file has been updated! :)", buttons: ["OK"] });

            console.log("File Id:" , file.id);
        }
    });
}

/*******************/
/* Public Function */
/*******************/
/**
 * @brief Store token to disk be used in later program executions.
 */
function storeToken() {
    var code = $("#auth-gdrive-file-dialog-code").val();
    if(code === "") {
        $("#auth-gdrive-file-dialog-code").css("border", "2px solid red");
        $(".error-message").text("Required field.").show();
        return;
    }

    //Get new token and store it
    oauth2Client.getToken(code, function(err, token) {
        if(err) {
            $("#auth-gdrive-file-dialog-code").val("").focus();
            $(".error-message").text("Error while trying to retrieve access token. Please enter correct code.").show();
            return console.error("Error while trying to retrieve access token", err);
        }
        oauth2Client.credentials = token;

        //Hide the modal dialog
        $("#auth-gdrive-file-dialog").modal("hide");

        //Store the token
        try {
            fs.mkdirSync(TOKEN_DIR);
        }
        catch(err) {
            if(err.code !== "EEXIST") {
                throw err;
            }
        }
        fs.writeFile(TOKEN_PATH, JSON.stringify(token));
        dialog.showMessageBox({ type: "info", message: "Authorization token stored to " + TOKEN_PATH + ". You can now use Google Drive services", buttons: ["OK"] });
    });
}

/**
 * @brief External function to help communicate with this module
 *
 * @param methodName Internal function to be called using this method name
 * @param fileid The optional file ID that some internal functions need
 */
function communicateToGoogleDrive(methodName, fileDataObj) {
    fs.readFile(clientSecretFileLocation, function processClientSecrets(err, content) {
        if(err) {
            dialog.showErrorBox("Error loading client's secret file: ", err.message);
            return console.error("Error loading client secret file: " + err);
        }

        //Authorize the client and then call the Google Drive API
        if(methodName === "listfiles") {
            authorize(JSON.parse(content), fileDataObj, listGdriveFiles);
        }
        else if(methodName === "getfiledata") {
            authorize(JSON.parse(content), fileDataObj, getGdriveFileData);
        }
        else if(methodName === "createnewfile") {
            authorize(JSON.parse(content), fileDataObj, createGdriveFile);
        }
        else if(methodName === "updatefile") {
            authorize(JSON.parse(content), fileDataObj, updateGdriveFile);
        }
    });
}

//Export the public functions
module.exports = {
    storeToken,
    communicateToGoogleDrive
}
