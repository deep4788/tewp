const jsonfile = require("jsonfile");

/*********************/
/* Private Functions */
/*********************/
var settingsFile = require("electron").remote.getGlobal("sharedObject").settingsFile;

/**
 * @brief This function returns a JSON object of app settings
 *
 * @return A JSON object
 */
function getSettings() {
    try {
        return jsonfile.readFileSync(settingsFile);
    }
    catch(err) {
        console.error("Error while reading from settings file: " + err);
    }
}

/*******************/
/* Public Function */
/*******************/
/**
 * @brief This function gets the setting value for @settingKey
 *
 * @param settingKey The setting name/key
 */
function getSetting(settingKey) {
    var appSettings = getSettings();
    if(appSettings[settingKey] === undefined) {
        console.error("Error while trying to fetch a setting");
    }
    return appSettings[settingKey];
}

/**
 * @brief This function sets the setting for a given
 *  key with the new value
 *
 * @param settingKey The setting name/key
 * @param settingValue The new value for the @settingKey
 */
function setSetting(settingKey, settingValue) {
    var appSettings = getSettings();
    appSettings[settingKey] = settingValue;

    jsonfile.writeFileSync(settingsFile, appSettings);
}

//Export the public functions
module.exports = {
    getSetting,
    setSetting
}
