"use strict";

//Load Electron related modules
const electron = require("electron");
const app = electron.app;  //Module to control application life
const BrowserWindow = electron.BrowserWindow;  //Module to create native browser window
//const Tray = electron.Tray;  //Module to add icons and context menus to the system"s notification area TODO

//Load other necessary useful modules
const jsonfile = require("jsonfile")
const path = require("path");
const url = require("url");

//Configure default settings for the app and save the settings
var settingsFile = app.getPath("userData") + "/settings.json";
global.sharedObject = { settingsFile: settingsFile };
jsonfile.readFile(settingsFile, function(err, obj) {
    if(err) {
        //Settings file does not exist, so create it
        var settingsJson = {
            theme: "ambiance",
            mode: "local",
            filename: "[ No File ]",
            filelocation: ""
        };
        jsonfile.writeFile(settingsFile, settingsJson, function(err) {
            if(err) {
                console.error("Error while writing to settings file: " + err);
            }
        });
    }
});

//Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected
let mainWindow;

function createWindow() {
    //const appIcon = new Tray("./icon256.png") TODO add app icon

    //Create the browser window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        maximizable: false,
        title: "tewp",
        backgroundColor: "#3b3a36"
    });

    //Load the index.html of the app
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    //Open the DevTools, NOTE: this is only for development purpose
    mainWindow.webContents.openDevTools();

    //Emitted when the window is closed
    mainWindow.on("closed", function() {
        //Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element
        mainWindow = null;
    });
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
