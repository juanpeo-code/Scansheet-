/**
 * Google Apps Script Web App Bridge
 * Ready-to-copy code for the user
 */

export const APPS_SCRIPT_CODE = `/**
 * ====================================================================
 * ScanSheet - Google Apps Script Backend Bridge
 * Appends scanned barcode serial numbers & timestamps to Google Sheets
 * ====================================================================
 */

// OPTIONAL: If this script is bound to your Sheet (Extensions > Apps Script),
// you can leave SPREADSHEET_ID empty. If standalone, paste your Sheet ID below:
// (Your Sheet ID is found in the URL: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit)
const SPREADSHEET_ID = ""; // e.g. "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
const SHEET_NAME = "Scans";

function doPost(e) {
  // Use ScriptLock to prevent concurrent write collisions
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const serialNumber = (payload.serialNumber || payload.serial || "").toString().trim();
    if (!serialNumber) {
      return sendJsonResponse({
        status: "error",
        message: "Missing 'serialNumber' in request payload."
      });
    }

    // Access the Spreadsheet
    let ss;
    if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    if (!ss) {
      return sendJsonResponse({
        status: "error",
        message: "Could not open Google Sheet. Make sure SPREADSHEET_ID is set or script is bound to a Sheet."
      });
    }

    // Locate target sheet named "Scans", fallback to first tab
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }

    // If sheet is empty, auto-create headers in Row 1
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Serial Number"]);
      sheet.getRange("A1:B1").setFontWeight("bold").setBackground("#f1f5f9");
    }

    // Get formatted timestamp using the spreadsheet's timezone
    const now = new Date();
    const timeZone = ss.getSpreadsheetTimeZone() || "GMT";
    const formattedTimestamp = Utilities.formatDate(now, timeZone, "yyyy-MM-dd HH:mm:ss");

    // Append row: Column A = Timestamp, Column B = Serial Number (prefixed with ' to preserve leading zeroes)
    sheet.appendRow([formattedTimestamp, "'" + serialNumber]);

    const newRowNumber = sheet.getLastRow();

    return sendJsonResponse({
      status: "success",
      message: "Scan recorded successfully.",
      row: newRowNumber,
      timestamp: formattedTimestamp,
      serialNumber: serialNumber
    });

  } catch (error) {
    return sendJsonResponse({
      status: "error",
      message: error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

// GET endpoint for easy health check and URL testing
function doGet(e) {
  return sendJsonResponse({
    status: "ok",
    message: "ScanSheet Web App is active and ready to accept POST requests.",
    timestamp: new Date().toISOString()
  });
}

function sendJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
