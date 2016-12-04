const {dialog} = require("electron").remote;
var fs = require("fs");
var readline = require("readline");
var google = require("googleapis");
var googleAuth = require("google-auth-library");

/*********************/
/* Private Functions */
/*********************/
var clientSecretFileLocation = require("electron").remote.getGlobal("sharedClientSecretFileLocationObject").clientSecretFileLocation;

//If modifying these scopes, delete previously saved credentials at ~/.credentials/google-drive-nodejs-tewp-project.json
var SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file"
];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + "/.credentials/";
var TOKEN_PATH = TOKEN_DIR + "google-drive-nodejs-tewp-project.json";

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, fileDataObj, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    //Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if(err) {
            getNewToken(oauth2Client, callback);
        }
        else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client, fileDataObj);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *  client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES
    });
    console.log("Authorize this app by visiting this url: ", authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Enter the code from that page here: ", function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if(err) {
                return console.error("Error while trying to retrieve access token", err);
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    }
    catch(err) {
        if(err.code !== "EEXIST") {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log("Token stored to " + TOKEN_PATH);
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
        mimeType: 'text/plain' }, function(err, response) {
        if(err) {
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
            return console.error("The API returned an error: " + err);
        }
        var files = response.files;
        if(files.length === 0) {
            console.log("No files found in your Google Drive");
        }
        else {
            //Clear the list and then re-populate it
            $('#select-google-drive-file').empty();
            for(var i = 0; i < files.length; i++) {
                var file = files[i];
                var fileName = file.name.split("_")[1];
                $('#select-google-drive-file').append($('<option>', {
                    value: file.id,
                    text : fileName
                }));
            }
            var modalOptions = {
                "backdrop": "static",
                "keyboard": "true"
            }

            //Once the files options elements are added to the select element, open the modal dialog
            $('#open-file-dialog').modal(modalOptions);
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
            console.error(err);
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
 * @brief External function to help communicate with this module
 *
 * @param methodName Internal function to be called using this method name
 * @param fileid The optional file ID that some internal functions need
 */
function communicateToGoogleDrive(methodName, fileDataObj) {
    fs.readFile(clientSecretFileLocation, function processClientSecrets(err, content) {
        if(err) {
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
    communicateToGoogleDrive,
}
