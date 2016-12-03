var fs = require("fs");
var readline = require("readline");
var google = require("googleapis");
var googleAuth = require("google-auth-library");

/*********************/
/* Private Functions */
/*********************/
//TODO remove the comments from here later on
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
function authorize(credentials, fileid, callback) {
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
            callback(oauth2Client, fileid);
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
        console.log("it exists deep");
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
 * @param fileid The id of the file to be read
 */
function getGdriveFileData(auth, fileid) {
    var fileId = fileid;
    var service = google.drive("v3");
    service.files.export({
        auth: auth,
        fileId: fileId,
        mimeType: 'text/plain' }, function(err, response) {
        if(err) {
            return console.error("The API returned an error: " + err);
        }

        //Update the editor with the file content
        editor.setValue(response);
    });
}

/**
 * @brief Lists the files
 *
 * @param auth An authorized OAuth2 client
 * @param fileid The id of the file to be read
 */
function listGdriveFiles(auth, fileid) {
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
            console.log("Files:"); //XXX
            //Clear the list and then re-populate it
            $('#select-google-drive-file').empty();
            for(var i = 0; i < files.length; i++) {
                var file = files[i];
                var fileName = file.name.split("_")[1];
                $('#select-google-drive-file').append($('<option>', {
                    value: file.id,
                    text : file.name
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

//TODO add comment here
function createGdriveFile(auth) {
    var fileMetadata = {
        "name" : "tewpbydeep_projectplan",
        "mimeType": "application/vnd.google-apps.document"
    };
    var media = {
        mimeType: "text/plain",
        body: "hi I am deep and this is a new content" //TODO Here is where the text from the editor will be passed
    };

    var service = google.drive("v3");
    service.files.create({
        auth: auth,
        resource: fileMetadata,
        media: media,
        fields: "id, name" }, function(err, file) {
        if(err) {
            //Handle error
            console.log(err);
        }
        else {
            console.log("File Id: ", file.id);
            console.log("File Id: ", file.name);
        }
    });
}

//TODO add comment here
function updateGdriveFile(auth) {
    var fileMetadata = {
        "name": "My Report",
        "mimeType": "application/vnd.google-apps.spreadsheet"
    };

    fileId = "1UXCR8Z4riHrcxkXovjypbg9YSQEjjiBoxQBfL2iG6TQ"; //This is something we will need to pass in when the user clicks on the save button
    var media = {
        mimeType: "text/csv",
        body: fs.createReadStream("/Users/deep/Desktop/mm.csv")
    };
    var service = google.drive("v3");
    //service.files.create({ auth: auth, resource: fileMetadata, media: media, fields: "id" }, function(err, file) {
    service.files.update({
        auth: auth,
        fileId: fileId,
        resource: fileMetadata,
        media: media,
        fields: "id, name" },
        function(err, file) {
            if(err) {
                //Handle error
                return console.error(err);
            }
            else {
                console.log("File Id:" , file.id);
                console.log("File name:" , file.name);
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
function communicateToGoogleDrive(methodName, fileid) {
    fs.readFile(clientSecretFileLocation, function processClientSecrets(err, content) {
        if(err) {
            return console.error("Error loading client secret file: " + err);
        }

        //Authorize the client with the loaded credentials, then call the Google Drive API
        if(methodName === "listfiles") {
            authorize(JSON.parse(content), fileid, listGdriveFiles);
        }
        else if(methodName === "getfiledata") {
            authorize(JSON.parse(content), fileid, getGdriveFileData);
        }
    });
}

//Export the public functions
module.exports = {
    communicateToGoogleDrive,
}
