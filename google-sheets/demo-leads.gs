/**
 * RIMARC AI website: saves form submissions to this Google Sheet.
 *   - Demo form    → tab "Leads"
 *   - Contact form → tab "Contact" (created automatically)
 *
 * The website is static (GitHub Pages), so visitors' browsers send the forms straight here.
 * Because anything in a browser is public, this script does the checking itself:
 * allowed values only, bot trap, minimum fill time, one entry per email/phone per 24 hours,
 * and a cap on entries per hour. Nothing else can be reached through it.
 *
 * Setup / update:
 * 1. Open the sheet → Extensions → Apps Script. Replace everything in Code.gs with this file. Save.
 * 2. First time: Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
 *    Updating: Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy.
 *    (Editing the existing deployment keeps the same /exec URL.)
 */

const LEADS_SHEET = 'Leads';
const CONTACT_SHEET = 'Contact';
const MAX_PER_HOUR = 30; // all submissions together; protects the sheet from floods
const MIN_FILL_MS = 2500; // people need longer than this to fill in the form

const LOCATIONS = ['India', 'USA', 'UK', 'Middle East'];
const PURPOSES = ['Investment', 'Self-use (to live in)', 'Holiday home', 'Both investment and self-use'];
const CONFIGURATIONS = [
  'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom',
  'Ocean View Residence (lower levels, closest to the sea)',
  'Sky Penthouse (4–5 Bedroom)', 'Retail / Shop', 'Not sure yet',
];
const DIAL_CODES = ['+91', '+1', '+44', '+971', '+966', '+974', '+968', '+973', '+965'];

const NAME_RE = /^[\p{L}][\p{L}\p{M} .'-]{1,79}$/u;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Bots: filled the hidden field, or submitted faster than a person can.
    if (d.company_website || typeof d.elapsed_ms !== 'number' || d.elapsed_ms < MIN_FILL_MS) {
      return reply_({ ok: false, error: 'Please try submitting the form again.' });
    }
    if (!underHourlyCap_()) {
      return reply_({ ok: false, error: 'We are receiving a lot of requests. Please try again in a little while.' });
    }

    if (d.type === 'contact') return saveContact_(d);
    return saveDemo_(d);
  } catch (err) {
    return reply_({ ok: false, error: 'Something went wrong. Please try again.' });
  }
}

function saveDemo_(d) {
  const name = text_(d.full_name, 80);
  const email = text_(d.email, 254).toLowerCase();
  const digits = String(d.phone_number || '').replace(/[^0-9]/g, '').replace(/^0+/, '');
  const phone = String(d.dial_code || '') + digits;

  if (!NAME_RE.test(name)) return reply_({ ok: false, error: 'Please enter your full name.' });
  if (!EMAIL_RE.test(email)) return reply_({ ok: false, error: 'Please enter a valid email.' });
  if (DIAL_CODES.indexOf(d.dial_code) < 0 || digits.length < 6 || phone.length > 16) {
    return reply_({ ok: false, error: 'Please enter a valid phone number.' });
  }
  if (LOCATIONS.indexOf(d.location) < 0 || PURPOSES.indexOf(d.purpose) < 0 || CONFIGURATIONS.indexOf(d.configuration) < 0) {
    return reply_({ ok: false, error: 'Please check the form and try again.' });
  }
  if (d.consent !== true) return reply_({ ok: false, error: 'Please agree to be contacted about the demo.' });

  return withLock_(function () {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LEADS_SHEET);
    // One entry per email or phone every 24 hours (columns: C = email, D = phone).
    if (seenInLastDay_(sheet, [[3, email], [4, phone]])) {
      return reply_({ ok: true, message: "We've already received your request today. Our team will be in touch." });
    }
    sheet.appendRow([new Date(), safe_(name), safe_(email), "'" + phone, d.location, d.purpose, d.configuration, 'Yes', 'rimarcai.com demo form']);
    return reply_({ ok: true, message: "Thanks! We've received your details. Our team will contact you shortly to set up your demo." });
  });
}

function saveContact_(d) {
  const name = text_(d.full_name, 80);
  const email = text_(d.email, 254).toLowerCase();
  const company = text_(d.company, 120);
  const message = text_(d.message, 2000);

  if (!NAME_RE.test(name)) return reply_({ ok: false, error: 'Please enter your full name.' });
  if (!EMAIL_RE.test(email)) return reply_({ ok: false, error: 'Please enter a valid email.' });
  if (message.length < 10) return reply_({ ok: false, error: 'Please write a little more.' });
  if (d.consent !== true) return reply_({ ok: false, error: 'Please agree to be contacted.' });

  return withLock_(function () {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONTACT_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(CONTACT_SHEET);
      sheet.appendRow(['Submitted at (IST)', 'Full name', 'Email', 'Company', 'Message', 'Consent', 'Source']);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }
    if (seenInLastDay_(sheet, [[3, email]])) {
      return reply_({ ok: true, message: "We've already received your message today. We'll reply soon." });
    }
    sheet.appendRow([new Date(), safe_(name), safe_(email), safe_(company), safe_(message), 'Yes', 'rimarcai.com contact form']);
    return reply_({ ok: true, message: "Thanks! We'll reply within one working day." });
  });
}

/** True if any of the [column, value] pairs appears in a row from the last 24 hours. */
function seenInLastDay_(sheet, checks) {
  const last = sheet.getLastRow();
  if (last < 2) return false;
  const first = Math.max(2, last - 499); // the most recent 500 rows are plenty for one day
  const rows = sheet.getRange(first, 1, last - first + 1, 5).getValues();
  const since = Date.now() - 24 * 60 * 60 * 1000;
  return rows.some(function (r) {
    const when = r[0] instanceof Date ? r[0].getTime() : 0;
    if (when < since) return false;
    return checks.some(function (c) {
      return String(r[c[0] - 1]).replace(/^'/, '').toLowerCase() === String(c[1]).toLowerCase();
    });
  });
}

function underHourlyCap_() {
  const cache = CacheService.getScriptCache();
  const key = 'count-' + Math.floor(Date.now() / 3600000);
  const n = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(n), 3700);
  return n <= MAX_PER_HOUR;
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function text_(value, max) {
  return String(value == null ? '' : value).normalize('NFKC').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Stops text that starts with = + - @ from being run as a spreadsheet formula. */
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
