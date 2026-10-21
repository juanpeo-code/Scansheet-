/**
 * Service to communicate with the Google Apps Script Web App
 */

export interface ScanRecord {
  id: string;
  serialNumber: string;
  format?: string;
  timestamp: string; // ISO string or formatted string
  status: 'synced' | 'pending' | 'failed';
  errorMessage?: string;
  rowNumber?: number;
}

export interface PostResult {
  success: boolean;
  message: string;
  rowNumber?: number;
  data?: unknown;
}

/**
 * Sends a serial number to Google Apps Script Web App
 */
export async function uploadScanToGoogleSheet(
  webAppUrl: string,
  serialNumber: string,
  format?: string
): Promise<PostResult> {
  const cleanUrl = webAppUrl.trim();
  if (!cleanUrl) {
    return {
      success: false,
      message: 'Google Apps Script Web App URL is not configured. Please paste your URL in Settings.'
    };
  }

  if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'Invalid Web App URL. It must start with https://script.google.com/macros/s/.../exec'
    };
  }

  const payload = {
    serialNumber: serialNumber.trim(),
    format: format || 'BARCODE',
    clientTimestamp: new Date().toISOString()
  };

  try {
    // We send payload as text/plain to avoid CORS preflight (OPTIONS) which Google Apps Script rejects.
    // In Apps Script, e.postData.contents captures this JSON payload directly.
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    if (!response.ok && response.status !== 0) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    // Try parsing json
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (data.status === 'success' || data.success === true) {
        return {
          success: true,
          message: data.message || 'Row appended successfully!',
          rowNumber: data.row || data.rowNumber,
          data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Apps script reported an error processing the scan.'
        };
      }
    } catch {
      // If response text was not JSON but request succeeded with 200, it might be an HTML error from Google
      if (text.includes('Script function not found') || text.includes('Exception:')) {
        return {
          success: false,
          message: `Apps Script error: ${text.slice(0, 150)}`
        };
      }
      return {
        success: true,
        message: 'Scan posted to Google Sheet.',
        data: text
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // Provide friendly guidance for common Google Apps Script deployment mistakes
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
      return {
        success: false,
        message: 'Network / CORS issue: Please make sure your Apps Script Web App is deployed with "Who has access: Anyone" and Execute as "Me".'
      };
    }

    return {
      success: false,
      message: `Failed to upload: ${errorMsg}`
    };
  }
}

/**
 * Health check test for the Web App URL
 */
export async function testWebAppConnection(webAppUrl: string): Promise<{ ok: boolean; message: string }> {
  const cleanUrl = webAppUrl.trim();
  if (!cleanUrl) {
    return { ok: false, message: 'URL cannot be empty' };
  }
  if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
    return { ok: false, message: 'URL must start with https://script.google.com/macros/s/' };
  }

  try {
    const res = await fetch(cleanUrl, {
      method: 'GET',
      redirect: 'follow'
    });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (json.status === 'ok' || json.message) {
        return { ok: true, message: `Connected! ${json.message || 'Service is responsive.'}` };
      }
    } catch {
      // If HTML returned
      if (text.includes('Google') || res.ok) {
        return { ok: true, message: 'Google Apps Script endpoint reached successfully.' };
      }
    }
    return { ok: true, message: 'Endpoint is accessible.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      message: `Connection test failed (${msg}). Ensure 'Who has access' is set to 'Anyone'.`
    };
  }
}
