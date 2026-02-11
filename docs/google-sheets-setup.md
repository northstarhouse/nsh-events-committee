# Connect Events Committee Dashboard to Google Sheets

This app can read/write form data to a Google Sheet using an Apps Script web app.
Sheet to use:
`https://docs.google.com/spreadsheets/d/1Bo6K4HLhB6COMYZSL1ofnrC5SVpmF1MbuRRVItHo8oY/edit#gid=0`

## 1) Create the Apps Script
1. Open the sheet.
2. Go to `Extensions` -> `Apps Script`.
3. Replace the default code with the script below.

```javascript
const SPREADSHEET_ID = '1Bo6K4HLhB6COMYZSL1ofnrC5SVpmF1MbuRRVItHo8oY';
const SHEET_NAME = 'EventForms';
const HEADERS = ['eventId', 'formType', 'dataJson', 'updatedAt'];

function doGet(e) {
  return jsonOutput_(handleRequest_(e));
}

function doPost(e) {
  return jsonOutput_(handleRequest_(e));
}

function handleRequest_(e) {
  const params = e && e.parameter ? e.parameter : {};
  const body = e && e.postData && e.postData.contents
    ? JSON.parse(e.postData.contents)
    : {};

  const action = params.action || body.action || '';
  if (action === 'getFormData') {
    const eventId = params.eventId || body.eventId || '';
    const formType = params.formType || body.formType || '';
    return { success: true, data: getFormData_(eventId, formType) };
  }

  if (action === 'saveFormData') {
    const eventId = body.eventId || '';
    const formType = body.formType || '';
    const data = body.data || {};
    saveFormData_(eventId, formType, data);
    return { success: true };
  }

  return { success: false, error: 'Unknown action' };
}

function getFormData_(eventId, formType) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return {};

  const rows = values.slice(1);
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const row = rows[i];
    if (String(row[0]) === String(eventId) && String(row[1]) === String(formType)) {
      try {
        return JSON.parse(row[2] || '{}');
      } catch (err) {
        return {};
      }
    }
  }
  return {};
}

function saveFormData_(eventId, formType, data) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1);
  const payload = [
    String(eventId),
    String(formType),
    JSON.stringify(data || {}),
    new Date().toISOString(),
  ];

  let rowIndex = -1;
  rows.forEach((row, index) => {
    if (String(row[0]) === String(eventId) && String(row[1]) === String(formType)) {
      rowIndex = index + 2;
    }
  });

  if (rowIndex === -1) {
    sheet.appendRow(payload);
  } else {
    sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([payload]);
  }
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const existingHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = existingHeaders.some((value) => value);
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }

  return sheet;
}

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 2) Deploy the web app
1. Click `Deploy` -> `New deployment`.
2. Select `Web app`.
3. Set:
   - `Execute as`: **Me**
   - `Who has access`: **Anyone**
4. Click `Deploy` and copy the Web App URL (ends with `/exec`).

## 3) Configure the app
Create a `.env` file and add:
`VITE_GOOGLE_SCRIPT_URL=<your web app URL>`

## 4) Rebuild and deploy
Rebuild the site and push to GitHub Pages so the env var is baked into the build output.
