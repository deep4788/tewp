const jsonfile = require('jsonfile');

/*********************/
/* Private Functions */
/*********************/
var settingsFile = require('electron').remote.getGlobal('sharedObject').settingsFile;

/*******************/
/* Public Function */
/*******************/

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

/**
 * @brief This function changes the setting for a given
 *  key with the new value
 *
 * @param settingKey The setting name/key
 * @param settingValue The new value for the @settingKey
 */
function changeSetting(settingKey, settingValue) {
    var appSettings = getSettings();
    appSettings[settingKey] = settingValue;

    jsonfile.writeFileSync(settingsFile, appSettings);
}

//Export the public functions
module.exports = {
    getSettings,
    changeSetting
}
