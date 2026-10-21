/**
 * Generates the complete, self-contained single-file HTML/CSS/JS web application
 * as requested in Part 2 of the prompt.
 */

export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>ScanSheet - Mobile Barcode to Google Sheets</title>
  <meta name="theme-color" content="#0f172a">

  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- HTML5 QR Code Library via CDN -->
  <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>

  <style>
    /* Custom scan target styling & animation */
    @keyframes scanBeam {
      0% { top: 10%; opacity: 0.3; }
      50% { opacity: 1; }
      100% { top: 90%; opacity: 0.3; }
    }
    .animate-scan-beam {
      animation: scanBeam 2s ease-in-out infinite alternate;
    }
    #reader video {
      border-radius: 1rem;
      object-fit: cover !important;
      width: 100% !important;
    }
    #reader {
      border: none !important;
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">

  <!-- Header -->
  <header class="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 py-3">
    <div class="max-w-md mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-2.5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <svg class="w-5 h-5 text-slate-950 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M7 10h10M7 14h10M10 7v10" />
          </svg>
        </div>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            ScanSheet
            <span class="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Live</span>
          </h1>
          <p class="text-xs text-slate-400">Mobile Barcode &rarr; Google Sheet</p>
        </div>
      </div>

      <button id="btn-open-settings" class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition" title="Settings">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">

    <!-- Web App URL Warning Banner (if unconfigured) -->
    <div id="url-alert-banner" class="hidden p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-base">⚠️</span>
        <span>Google Apps Script URL is missing.</span>
      </div>
      <button id="btn-fix-url" class="font-bold underline text-amber-300 hover:text-white">Configure</button>
    </div>

    <!-- Camera Viewport Card -->
    <div class="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
      <!-- HTML5 QR Code Container -->
      <div id="reader" class="w-full aspect-[4/3] bg-black relative flex items-center justify-center overflow-hidden">
        <!-- Placeholder / Loading before camera starts -->
        <div id="camera-placeholder" class="text-center p-6 space-y-3 z-10">
          <div class="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
            <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-slate-300">Camera preview will appear here</p>
          <button id="btn-start-camera" class="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20">
            Start Rear Camera
          </button>
        </div>

        <!-- Scanning Reticle Overlay (active while scanning) -->
        <div id="scan-overlay" class="hidden absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <div class="relative w-[75%] h-[55%] border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <!-- Corner Accents -->
            <div class="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl"></div>
            <div class="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr"></div>
            <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl"></div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br"></div>
            <!-- Laser Scanner Line -->
            <div class="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] animate-scan-beam"></div>
          </div>
        </div>
      </div>

      <!-- Camera Floating Controls -->
      <div class="p-3 bg-slate-900/95 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div class="flex items-center space-x-2">
          <span id="scanner-status-dot" class="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
          <span id="scanner-status-text" class="text-slate-400 font-medium">Ready</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <button id="btn-toggle-pause" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-medium hover:bg-slate-700 transition">
            Pause
          </button>
          <button id="btn-restart-scanner" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-medium hover:bg-slate-700 transition">
            Restart
          </button>
        </div>
      </div>
    </div>

    <!-- Active Scan Result Banner -->
    <div id="result-card" class="hidden p-4 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-850 border border-emerald-500/30 shadow-xl space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Barcode Detected
        </span>
        <span id="result-time" class="text-[11px] text-slate-400">Just now</span>
      </div>

      <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
        <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Serial Number</div>
        <div id="result-serial-text" class="text-lg font-mono font-bold text-white tracking-wide break-all select-all mt-0.5">
          ---
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 pt-1">
        <button id="btn-submit-now" class="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-95">
          <span id="btn-submit-spinner" class="hidden animate-spin">&#9696;</span>
          <span id="btn-submit-label">Upload to Google Sheet</span>
        </button>
        <button id="btn-rescan" class="py-3 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm transition" title="Scan Next">
          Rescan
        </button>
      </div>

      <div id="upload-status-feedback" class="text-center text-xs font-medium pt-1 hidden"></div>
    </div>

    <!-- Quick Mode Toggles -->
    <div class="grid grid-cols-2 gap-3 text-xs">
      <label class="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
        <span class="font-medium text-slate-300">Auto-Upload</span>
        <input type="checkbox" id="toggle-autosubmit" checked class="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500/20 bg-slate-800 border-slate-700">
      </label>
      <label class="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
        <span class="font-medium text-slate-300">Audio Beep</span>
        <input type="checkbox" id="toggle-sound" checked class="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500/20 bg-slate-800 border-slate-700">
      </label>
    </div>

    <!-- Scan History Section -->
    <div class="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          Recent Scans
          <span id="history-count" class="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">0</span>
        </h2>
        <div class="flex items-center space-x-2">
          <button id="btn-clear-history" class="text-[11px] text-slate-500 hover:text-rose-400 transition">Clear</button>
        </div>
      </div>

      <div id="history-list" class="space-y-2 max-h-48 overflow-y-auto pr-1">
        <div id="history-empty" class="text-center py-6 text-slate-500 text-xs">
          No scans yet. Aim your camera at any 1D or 2D barcode.
        </div>
      </div>
    </div>
  </main>

  <!-- Settings & Apps Script Modal -->
  <div id="modal-settings" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h3 class="font-bold text-white text-base">Configuration & Setup</h3>
        <button id="btn-close-settings" class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="p-5 space-y-5 overflow-y-auto text-xs flex-1">
        <!-- URL Setting -->
        <div class="space-y-2">
          <label class="block font-semibold text-slate-200">Google Apps Script Web App URL</label>
          <input type="url" id="input-script-url" placeholder="https://script.google.com/macros/s/.../exec"
                 class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs font-mono">
          <p class="text-[11px] text-slate-400">The deployed Web App endpoint that receives the barcode data and writes to your Google Sheet.</p>
          <div class="flex gap-2 pt-1">
            <button id="btn-save-url" class="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition">Save URL</button>
            <button id="btn-test-url" class="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition">Test Connection</button>
          </div>
          <div id="test-feedback" class="text-[11px] pt-1 hidden"></div>
        </div>

        <!-- Instructions Accordion / Box -->
        <div class="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div class="font-bold text-slate-300">How to deploy in 60 seconds:</div>
          <ol class="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
            <li>Open your Google Sheet (Row 1 headers: <code class="text-emerald-400">Timestamp</code>, <code class="text-emerald-400">Serial Number</code>).</li>
            <li>Click <strong>Extensions &gt; Apps Script</strong>.</li>
            <li>Paste the Google Apps Script code (from Part 1).</li>
            <li>Click <strong>Deploy &gt; New deployment</strong>.</li>
            <li>Select <strong>Web app</strong>. Set <em>Execute as:</em> <strong>Me</strong> and <em>Who has access:</em> <strong>Anyone</strong>.</li>
            <li>Copy the resulting Web App URL and paste it above!</li>
          </ol>
        </div>
      </div>
    </div>
  </div>

  <!-- Audio Synthesizer & Client Logic -->
  <script>
    // Audio Beep
    function playBeep() {
      if (!document.getElementById('toggle-sound').checked) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
        osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (e) {}
    }

    function triggerVibration() {
      if ('vibrate' in navigator) {
        try { navigator.vibrate([60, 40, 80]); } catch(e) {}
      }
    }

    // App State
    let html5QrCode = null;
    let isScanning = false;
    let isPaused = false;
    let currentScannedSerial = null;
    let scanHistory = JSON.parse(localStorage.getItem('scansheet_history') || '[]');

    const inputUrl = document.getElementById('input-script-url');
    const urlBanner = document.getElementById('url-alert-banner');
    const readerDiv = document.getElementById('reader');
    const scanOverlay = document.getElementById('scan-overlay');
    const placeholder = document.getElementById('camera-placeholder');
    const resultCard = document.getElementById('result-card');
    const resultSerialText = document.getElementById('result-serial-text');
    const resultTime = document.getElementById('result-time');
    const submitLabel = document.getElementById('btn-submit-label');
    const submitSpinner = document.getElementById('btn-submit-spinner');
    const uploadFeedback = document.getElementById('upload-status-feedback');
    const historyList = document.getElementById('history-list');
    const historyEmpty = document.getElementById('history-empty');
    const historyCount = document.getElementById('history-count');
    const statusDot = document.getElementById('scanner-status-dot');
    const statusText = document.getElementById('scanner-status-text');

    // Load saved settings
    const savedUrl = localStorage.getItem('scansheet_script_url') || '';
    if (savedUrl) {
      inputUrl.value = savedUrl;
      urlBanner.classList.add('hidden');
    } else {
      urlBanner.classList.remove('hidden');
    }

    // Render history
    function renderHistory() {
      historyCount.textContent = scanHistory.length;
      if (scanHistory.length === 0) {
        historyEmpty.classList.remove('hidden');
        historyList.innerHTML = '';
        historyList.appendChild(historyEmpty);
        return;
      }
      historyEmpty.classList.add('hidden');
      historyList.innerHTML = scanHistory.map(item => \`
        <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
          <div class="truncate mr-2">
            <div class="font-mono font-bold text-white truncate">\${item.serial}</div>
            <div class="text-[10px] text-slate-500">\${new Date(item.timestamp).toLocaleTimeString()} &bull; \${item.status === 'synced' ? 'Uploaded' : item.status}</div>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold \${item.status === 'synced' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
            \${item.status === 'synced' ? '✓ Synced' : 'Failed'}
          </span>
        </div>
      \`).join('');
    }
    renderHistory();

    // Start scanner
    async function startScanner() {
      try {
        if (!html5QrCode) {
          html5QrCode = new Html5Qrcode("reader");
        }
        statusText.textContent = "Starting camera...";
        statusDot.className = "w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse";

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 12,
            qrbox: { width: 260, height: 160 },
            aspectRatio: 1.333333
          },
          onScanSuccess,
          onScanFailure
        );

        isScanning = true;
        isPaused = false;
        placeholder.classList.add('hidden');
        scanOverlay.classList.remove('hidden');
        statusText.textContent = "Scanning active";
        statusDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-400";
      } catch (err) {
        console.error("Camera start failed:", err);
        statusText.textContent = "Camera error";
        statusDot.className = "w-2.5 h-2.5 rounded-full bg-rose-500";
        placeholder.classList.remove('hidden');
        scanOverlay.classList.add('hidden');
        alert("Camera access failed: " + (err.message || err));
      }
    }

    function onScanSuccess(decodedText, decodedResult) {
      if (isPaused) return;

      currentScannedSerial = decodedText;
      playBeep();
      triggerVibration();

      // Pause scanner immediately upon detection
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.pause(true);
        isPaused = true;
      }

      statusText.textContent = "Barcode detected";
      statusDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-400";

      // Show result card
      resultSerialText.textContent = decodedText;
      resultTime.textContent = new Date().toLocaleTimeString();
      resultCard.classList.remove('hidden');
      uploadFeedback.classList.add('hidden');

      // Auto-submit if enabled
      if (document.getElementById('toggle-autosubmit').checked) {
        submitScan(decodedText);
      }
    }

    function onScanFailure(error) {
      // Ignored for high frame rate scanning
    }

    // Submit Scan to Google Apps Script
    async function submitScan(serial) {
      const targetSerial = serial || currentScannedSerial;
      if (!targetSerial) return;

      const webAppUrl = localStorage.getItem('scansheet_script_url') || inputUrl.value.trim();
      if (!webAppUrl) {
        uploadFeedback.className = "text-center text-xs font-medium pt-1 text-amber-400";
        uploadFeedback.textContent = "Please configure your Google Apps Script URL in Settings!";
        uploadFeedback.classList.remove('hidden');
        return;
      }

      submitSpinner.classList.remove('hidden');
      submitLabel.textContent = "Uploading...";
      uploadFeedback.classList.add('hidden');

      try {
        // Send as text/plain to avoid CORS preflight rejection by Google Apps Script
        const response = await fetch(webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ serialNumber: targetSerial }),
          redirect: 'follow'
        });

        const text = await response.text();
        let resData = {};
        try { resData = JSON.parse(text); } catch (e) {}

        const isSuccess = resData.status === 'success' || response.ok;

        if (isSuccess) {
          uploadFeedback.className = "text-center text-xs font-medium pt-1 text-emerald-400";
          uploadFeedback.textContent = "✓ Saved to Google Sheet (Row " + (resData.row || "appended") + ")";
          uploadFeedback.classList.remove('hidden');

          // Log in history
          scanHistory.unshift({
            id: Date.now().toString(),
            serial: targetSerial,
            timestamp: new Date().toISOString(),
            status: 'synced'
          });
          if (scanHistory.length > 50) scanHistory.pop();
          localStorage.setItem('scansheet_history', JSON.stringify(scanHistory));
          renderHistory();
        } else {
          throw new Error(resData.message || "Failed to save row");
        }
      } catch (err) {
        console.error("Upload error:", err);
        uploadFeedback.className = "text-center text-xs font-medium pt-1 text-rose-400";
        uploadFeedback.textContent = "Upload failed: " + err.message;
        uploadFeedback.classList.remove('hidden');

        scanHistory.unshift({
          id: Date.now().toString(),
          serial: targetSerial,
          timestamp: new Date().toISOString(),
          status: 'failed'
        });
        localStorage.setItem('scansheet_history', JSON.stringify(scanHistory));
        renderHistory();
      } finally {
        submitSpinner.classList.add('hidden');
        submitLabel.textContent = "Upload to Google Sheet";
      }
    }

    function resumeScanner() {
      resultCard.classList.add('hidden');
      if (html5QrCode && isPaused) {
        html5QrCode.resume();
        isPaused = false;
        statusText.textContent = "Scanning active";
        statusDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-400";
      }
    }

    // Event listeners
    document.getElementById('btn-start-camera').addEventListener('click', startScanner);
    document.getElementById('btn-rescan').addEventListener('click', resumeScanner);
    document.getElementById('btn-submit-now').addEventListener('click', () => submitScan());

    document.getElementById('btn-toggle-pause').addEventListener('click', () => {
      if (!html5QrCode || !isScanning) return;
      if (isPaused) {
        html5QrCode.resume();
        isPaused = false;
        document.getElementById('btn-toggle-pause').textContent = "Pause";
        statusText.textContent = "Scanning active";
      } else {
        html5QrCode.pause(true);
        isPaused = true;
        document.getElementById('btn-toggle-pause').textContent = "Resume";
        statusText.textContent = "Paused";
      }
    });

    document.getElementById('btn-restart-scanner').addEventListener('click', async () => {
      if (html5QrCode) {
        try { await html5QrCode.stop(); } catch(e) {}
      }
      startScanner();
    });

    // Settings Modal
    const modalSettings = document.getElementById('modal-settings');
    document.getElementById('btn-open-settings').addEventListener('click', () => modalSettings.classList.remove('hidden'));
    document.getElementById('btn-fix-url').addEventListener('click', () => modalSettings.classList.remove('hidden'));
    document.getElementById('btn-close-settings').addEventListener('click', () => modalSettings.classList.add('hidden'));

    document.getElementById('btn-save-url').addEventListener('click', () => {
      const url = inputUrl.value.trim();
      localStorage.setItem('scansheet_script_url', url);
      if (url) {
        urlBanner.classList.add('hidden');
        alert("Google Apps Script URL saved successfully!");
      } else {
        urlBanner.classList.remove('hidden');
      }
      modalSettings.classList.add('hidden');
    });

    document.getElementById('btn-test-url').addEventListener('click', async () => {
      const feedback = document.getElementById('test-feedback');
      const url = inputUrl.value.trim();
      if (!url) {
        feedback.className = "text-[11px] pt-1 text-rose-400";
        feedback.textContent = "Enter a URL first.";
        feedback.classList.remove('hidden');
        return;
      }
      feedback.className = "text-[11px] pt-1 text-amber-300";
      feedback.textContent = "Testing connection...";
      feedback.classList.remove('hidden');

      try {
        const res = await fetch(url, { method: 'GET', redirect: 'follow' });
        feedback.className = "text-[11px] pt-1 text-emerald-400";
        feedback.textContent = "✓ Connected successfully! Web App is live.";
      } catch (err) {
        feedback.className = "text-[11px] pt-1 text-rose-400";
        feedback.textContent = "Connection failed. Ensure 'Who has access: Anyone' is selected in deployment.";
      }
    });

    document.getElementById('btn-clear-history').addEventListener('click', () => {
      if (confirm("Clear scan history?")) {
        scanHistory = [];
        localStorage.removeItem('scansheet_history');
        renderHistory();
      }
    });

    // Auto-start camera if permissions already granted or on click
    window.addEventListener('DOMContentLoaded', () => {
      // Delay slightly for smooth render
      setTimeout(() => {
        startScanner();
      }, 500);
    });
  </script>
</body>
</html>`;
}
