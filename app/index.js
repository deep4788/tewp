"use strict";

//Load core modules
const fs = require("fs");
const path = require("path");
const url = require("url");

//Load Electron related modules
const electron = require("electron");
const app = electron.app;  //Module to control application life
const BrowserWindow = electron.BrowserWindow;  //Module to create native browser window

//Load other necessary modules
const jsonfile = require("jsonfile")

//Load custom modules
var menu = require("./js/menu").menu;

//Configure default settings for the app and save the settings
var settingsFile = app.getPath("userData") + "/settings.json";
global.sharedSettingObj = { settingsFile: settingsFile };
jsonfile.readFile(settingsFile, function(err, obj) {
    if(err) {
        //Settings file does not exist, so create it
        var settingsJson = {
            theme: "ambiance",
            mode: "local",
            fileid: "",
            filename: "[ No File ]",
            filelocation: ""
        };
        jsonfile.writeFile(settingsFile, settingsJson, function(err) {
            if(err) {
                electron.dialog.showErrorBox("Couldn't write to settings file: ", err.message);
                console.error("Error while writing to settings file: " + err);
                process.exit();
            }
        });
    }
});

//Save the client't secret file (with Google Drive credentials) to application data directory
var clientSecretFilePath = app.getPath("userData")+"/client_secret.json";
var clientSecretFileExist = fs.existsSync(clientSecretFilePath);
if(clientSecretFileExist === false) {
    try {
        fs.renameSync(app.getAppPath()+"/client_secret.json", clientSecretFilePath);
    }
    catch(err) {
        electron.dialog.showErrorBox("Couldn't move the client_secret.json file: ", err.message);
        console.error(err);
        process.exit();
    }
}
global.sharedClientSecretFileLocationObject = { clientSecretFileLocation: clientSecretFilePath };

//Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected
let mainWindow;

function createWindow() {
    //Create the browser window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        maximizable: false,
        title: "Tewp",
        backgroundColor: "#3b3a36"
    });

    //Load the index.html of the app
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    //Open the DevTools, NOTE: this is only for development purpose
    //mainWindow.webContents.openDevTools();

    //Emitted when the window is closed
    mainWindow.on("closed", function() {
        //Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element
        mainWindow = null;
    });

    //Create application menu
    menu();
}

//This method will be called when Electron has finished
// initialization and is ready to create browser windows
// Some APIs can only be used after this event occurs
app.on("ready", createWindow);

//Quit when all windows are closed
app.on("window-all-closed", function() {
    //On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if(process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function() {
    //On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if(mainWindow === null) {
        createWindow();
    }
});
