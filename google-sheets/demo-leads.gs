/**
 * RIMARC AI website: saves each demo form submission as a row in this Google Sheet.
 *
 * Setup (once):
 * 1. Open the "RIMARC Website Demo Leads" sheet → Extensions → Apps Script.
 * 2. Replace everything in Code.gs with this file, and set SECRET below to a long random value
 *    (the same value as OUTBOUND_WEBHOOK_SECRET on the website server). Save.
 * 3. Deploy → New deployment → type "Web app". Execute as: Me. Who has access: Anyone. Deploy,
 *    allow access, and copy the Web app URL (ends in /exec) into SHEET_WEBHOOK_URL on the server.
 *
 * "Anyone" only means the URL can be called; without the secret, nothing is written.
 */
const SECRET = 'PASTE_THE_SAME_SECRET_AS_OUTBOUND_WEBHOOK_SECRET';
const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (!data || typeof data.secret !== 'string' || data.secret !== SECRET || SECRET.indexOf('PASTE_') === 0) {
      return reply_({ ok: false, error: 'unauthorized' });
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const row = [
      new Date(),
      clean_(data.full_name),
      clean_(data.email),
      clean_(data.phone_number),
      clean_(data.location),
      clean_(data.purpose),
      clean_(data.configuration),
      data.consent === true ? 'Yes' : 'No',
      clean_(data.source),
    ];
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, error: 'bad request' });
  }
}

/** Keeps values short and stops text that starts with = + - @ being run as a formula. */
function clean_(value) {
  const v = String(value == null ? '' : value).slice(0, 300);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
