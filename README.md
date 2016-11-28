# tewp: Text Editor with Powers

`tewp`: A unique and powerful text editor with magical powers written using Electron <http://electron.atom.io/>.

Installation
------------
```sh
# Install dependencies
$ npm install

# Run the app using npm
$ npm start

# Run the app using electron
$ electron .
```

Create and Activate the Google Drive API
----------------------------------------
TODO: update this section and add more

Step 1: Turn on the Drive API

- Use this wizard to create or select a project in the Google Developers Console and automatically turn on the API. Click Continue, then Go to credentials.
- On the Add credentials to your project page, click the Cancel button.
- At the top of the page, select the OAuth consent screen tab. Select an Email address, enter a Product name if not already set, and click the Save button.
- Select the Credentials tab, click the Create credentials button and select OAuth client ID.
- Select the application type Other, enter the name "Drive API Quickstart", and click the Create button.
- Click OK to dismiss the resulting dialog.
- Click the file download (Download JSON) button to the right of the client ID.
- Move this file to your working directory and rename it client_secret.json.

Source: https://developers.google.com/drive/v3/web/quickstart/nodejs


Screenshot
----------
![](static/images/appImage.png)

Author
------
Deep Aggarwal  
deep.uiuc@gmail.com  
Date Started: 11/18/2016  
