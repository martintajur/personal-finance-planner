# Personal Financial Planner

By using a [Google Spreadsheet](https://docs.google.com/spreadsheets/d/1h3oX9NNmmeBPXflMe4DWCF5pNWQ7ptew3PbxfMUF1aI/edit), you can list your recurring or one-time expenses and incomes, and get a detailed forecast of your projected cash balance after every transaction.

![screenshot](https://raw.githubusercontent.com/martintajur/personal-finance-planner/master/screenshot-sheets.png "Screenshot")
![screenshot](https://raw.githubusercontent.com/martintajur/personal-finance-planner/master/screenshot.png "Screenshot")

## Set up

The setup might look scary but in reality it should not take more than 7 minutes of your time.

### 1. Grab a copy of this repository

Download it to your computer into some folder.

### 2. Grab a copy of The Spreadsheet

Grab a copy of the [Google Spreadsheet template](https://docs.google.com/spreadsheets/d/1h3oX9NNmmeBPXflMe4DWCF5pNWQ7ptew3PbxfMUF1aI/edit) and fill it in with your data. Be sure to check the sharing settings so that it is not shared with the public internet (unless you're fine with that.)

### 3. Create a new project on Google Developer Console

In order to access the spreadsheet you must create a new project for authentication purposes on the [Google Developer Console](https://console.developers.google.com/project).

### 4. Enable Drive API

In Google Developer Console, under "APIs and auth › APIs", enable Drive API for your newly created project.

### 5. Create new Client ID

In Google Developer Console, under "APIs and auth › Credentials", create new Client ID. Choose the __Service account__ for the application type, and download the JSON file with credentials. Copy this file to the repository folder and rename it to `credentials.json`.

### 6. Point the script to your spreadsheet

Create a `config.json` file in the repository folder with the following contents. Be sure to replace the long hash with the hash of your copy of the financial planning spreadsheet — you can grab the correct hash from the URL while editing the sheet):
```json
{
	"spreadsheetId": "19MK19rjmadjnqqqlmmcnv039qk324343lmvvvxpzzs2",
	"minimumCashReserve": 10000
}
```

### 7. Make your spreadsheet readable the credentials you created

Open __Sharing__ from the spreadsheet on Google Spreadsheets, and add a collaborator to your sheet, taking the email address from the `credentials.json` that is listed as the `"client_email"` in the file. It is usually something like `932744480205-263o7dkmddd9dmqmkc9333@developer.gserviceaccount.com`

### 8. Install dependencies

Execute `npm install` in the repository folder.

### 9. You're all set!

The script will execute using the `npm start` command.