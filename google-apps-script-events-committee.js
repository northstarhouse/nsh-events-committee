/**
 * North Star House Events Committee - Shared Form Data API
 *
 * Deploy as Web App:
 * 1) Extensions -> Apps Script (bound to a Google Sheet)
 * 2) Paste this file
 * 3) Deploy -> New deployment -> Web app
 * 4) Execute as: Me
 * 5) Who has access: Anyone
 * 6) Copy the /exec URL into VITE_GOOGLE_SCRIPT_URL
 */

const FORM_DATA_SHEET = 'EventFormData';
const FORM_HEADERS = ['eventId', 'formType', 'dataJson', 'updatedAt'];

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = params.action || '';

    if (action === 'getFormData') {
      const eventId = String(params.eventId || '').trim();
      const formType = String(params.formType || '').trim();
      if (!eventId || !formType) {
        return jsonOut({ success: false, error: 'Missing eventId or formType' });
      }
      const data = getFormData(eventId, formType);
      return jsonOut({ success: true, data });
    }

    return jsonOut({ success: false, error: 'Unknown action' });
  } catch (err) {
    return jsonOut({ success: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action || '';

    if (action === 'saveFormData') {
      const eventId = String(body.eventId || '').trim();
      const formType = String(body.formType || '').trim();
      const data = body.data && typeof body.data === 'object' ? body.data : {};
      if (!eventId || !formType) {
        return jsonOut({ success: false, error: 'Missing eventId or formType' });
      }
      saveFormData(eventId, formType, data);
      return jsonOut({ success: true });
    }

    return jsonOut({ success: false, error: 'Unknown action' });
  } catch (err) {
    return jsonOut({ success: false, error: String(err) });
  }
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(FORM_DATA_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(FORM_DATA_SHEET);
  }

  const headerValues = sheet.getRange(1, 1, 1, FORM_HEADERS.length).getValues()[0];
  const needsHeaders = headerValues.every((v) => v === '');
  if (needsHeaders) {
    sheet.getRange(1, 1, 1, FORM_HEADERS.length).setValues([FORM_HEADERS]);
    sheet.getRange(1, 1, 1, FORM_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getFormData(eventId, formType) {
  const sheet = getOrCreateSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};

  const values = sheet.getRange(2, 1, lastRow - 1, FORM_HEADERS.length).getValues();
  for (let i = values.length - 1; i >= 0; i -= 1) {
    const row = values[i];
    if (String(row[0]) === eventId && String(row[1]) === formType) {
      const json = String(row[2] || '');
      if (!json) return {};
      try {
        return JSON.parse(json);
      } catch (_err) {
        return {};
      }
    }
  }
  return {};
}

function saveFormData(eventId, formType, data) {
  const sheet = getOrCreateSheet_();
  const lastRow = sheet.getLastRow();
  const now = new Date().toISOString();
  const dataJson = JSON.stringify(data || {});

  if (lastRow < 2) {
    sheet.appendRow([eventId, formType, dataJson, now]);
    return;
  }

  const values = sheet.getRange(2, 1, lastRow - 1, FORM_HEADERS.length).getValues();
  for (let i = 0; i < values.length; i += 1) {
    const row = values[i];
    if (String(row[0]) === eventId && String(row[1]) === formType) {
      sheet.getRange(i + 2, 1, 1, FORM_HEADERS.length).setValues([[eventId, formType, dataJson, now]]);
      return;
    }
  }

  sheet.appendRow([eventId, formType, dataJson, now]);
}

function jsonOut(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
