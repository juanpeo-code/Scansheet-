/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Code2, 
  Keyboard, 
  FileCode, 
  AlertCircle, 
  CheckCircle2, 
  ScanLine,
  ExternalLink
} from 'lucide-react';
import { ScannerView } from './components/ScannerView';
import { ScanResultCard } from './components/ScanResultCard';
import { ScanHistory } from './components/ScanHistory';
import { ConfigModal } from './components/ConfigModal';
import { AppsScriptModal } from './components/AppsScriptModal';
import { ManualEntryModal } from './components/ManualEntryModal';
import { SingleFileExportModal } from './components/SingleFileExportModal';
import { uploadScanToGoogleSheet, ScanRecord } from './utils/sheetService';
import { playScanSound, playSuccessChime, playErrorBuzz, triggerHaptic } from './utils/soundAndHaptics';

export default function App() {
  // Config & State
  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    return localStorage.getItem('scansheet_script_url') || '';
  });
  const [autoSubmit, setAutoSubmit] = useState<boolean>(() => {
    const saved = localStorage.getItem('scansheet_autosubmit');
    return saved !== null ? saved === 'true' : true;
  });
  const [continuousMode, setContinuousMode] = useState<boolean>(() => {
    return localStorage.getItem('scansheet_continuous') === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('scansheet_sound');
    return saved !== null ? saved === 'true' : true;
  });
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('scansheet_haptics');
    return saved !== null ? saved === 'true' : true;
  });

  // Scanner status
  const [isScannerPaused, setIsScannerPaused] = useState<boolean>(false);
  const [activeScan, setActiveScan] = useState<{
    serialNumber: string;
    format: string;
    timestamp: string;
  } | null>(null);

  // Upload status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [lastRowNumber, setLastRowNumber] = useState<number | undefined>(undefined);

  // History
  const [history, setHistory] = useState<ScanRecord[]>(() => {
    try {
      const saved = localStorage.getItem('scansheet_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Modals
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showAppsScriptModal, setShowAppsScriptModal] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Save config changes
  const handleSaveUrl = (url: string) => {
    setWebAppUrl(url);
    localStorage.setItem('scansheet_script_url', url);
  };

  const handleToggleAutoSubmit = (val: boolean) => {
    setAutoSubmit(val);
    localStorage.setItem('scansheet_autosubmit', String(val));
  };

  const handleToggleContinuous = (val: boolean) => {
    setContinuousMode(val);
    localStorage.setItem('scansheet_continuous', String(val));
  };

  const handleToggleSound = (val: boolean) => {
    setSoundEnabled(val);
    localStorage.setItem('scansheet_sound', String(val));
  };

  const handleToggleHaptics = (val: boolean) => {
    setHapticsEnabled(val);
    localStorage.setItem('scansheet_haptics', String(val));
  };

  const saveHistory = (items: ScanRecord[]) => {
    setHistory(items);
    localStorage.setItem('scansheet_history', JSON.stringify(items));
  };

  // Called when camera detects a barcode
  const handleBarcodeDetected = useCallback((decodedText: string, formatName: string) => {
    // If already processing this scan and paused, skip
    if (isScannerPaused) return;

    if (soundEnabled) playScanSound();
    if (hapticsEnabled) triggerHaptic('light');

    // Pause camera immediately
    setIsScannerPaused(true);

    const now = new Date().toISOString();
    setActiveScan({
      serialNumber: decodedText,
      format: formatName,
      timestamp: now,
    });
    setUploadStatus('idle');
    setUploadMessage('');
    setLastRowNumber(undefined);
  }, [isScannerPaused, soundEnabled, hapticsEnabled]);

  // Submit scan to Google Apps Script Web App
  const handleSubmitScan = useCallback(async () => {
    if (!activeScan) return;

    if (!webAppUrl) {
      setUploadStatus('error');
      setUploadMessage('Please configure your Google Apps Script URL first.');
      setShowConfigModal(true);
      return;
    }

    setIsSubmitting(true);
    setUploadMessage('');

    const res = await uploadScanToGoogleSheet(
      webAppUrl,
      activeScan.serialNumber,
      activeScan.format
    );

    setIsSubmitting(false);

    const record: ScanRecord = {
      id: Date.now().toString(),
      serialNumber: activeScan.serialNumber,
      format: activeScan.format,
      timestamp: activeScan.timestamp,
      status: res.success ? 'synced' : 'failed',
      errorMessage: res.success ? undefined : res.message,
      rowNumber: res.rowNumber,
    };

    // Update history
    saveHistory([record, ...history.slice(0, 99)]);

    if (res.success) {
      setUploadStatus('success');
      setUploadMessage(res.message);
      setLastRowNumber(res.rowNumber);

      if (soundEnabled) playSuccessChime();
      if (hapticsEnabled) triggerHaptic('success');

      // If continuous mode is enabled, auto-rescan after 1.5s
      if (continuousMode) {
        setTimeout(() => {
          handleRescan();
        }, 1600);
      }
    } else {
      setUploadStatus('error');
      setUploadMessage(res.message);

      if (soundEnabled) playErrorBuzz();
      if (hapticsEnabled) triggerHaptic('error');
    }
  }, [activeScan, webAppUrl, history, soundEnabled, hapticsEnabled, continuousMode]);

  // Rescan / Dismiss current result
  const handleRescan = () => {
    setActiveScan(null);
    setUploadStatus('idle');
    setUploadMessage('');
    setIsScannerPaused(false);
  };

  // Retry an existing failed record
  const handleRetryHistoryItem = async (item: ScanRecord) => {
    if (!webAppUrl) {
      setShowConfigModal(true);
      return;
    }

    setRetryingId(item.id);
    const res = await uploadScanToGoogleSheet(webAppUrl, item.serialNumber, item.format);
    setRetryingId(null);

    const updated = history.map(h => {
      if (h.id === item.id) {
        return {
          ...h,
          status: (res.success ? 'synced' : 'failed') as 'synced' | 'failed',
          errorMessage: res.success ? undefined : res.message,
          rowNumber: res.rowNumber || h.rowNumber,
        };
      }
      return h;
    });

    saveHistory(updated);

    if (res.success && soundEnabled) playSuccessChime();
  };

  // Submit manual serial entry
  const handleManualSubmit = async (serial: string): Promise<boolean> => {
    if (!webAppUrl) {
      setShowConfigModal(true);
      return false;
    }

    const res = await uploadScanToGoogleSheet(webAppUrl, serial, 'MANUAL');

    const record: ScanRecord = {
      id: Date.now().toString(),
      serialNumber: serial,
      format: 'MANUAL',
      timestamp: new Date().toISOString(),
      status: res.success ? 'synced' : 'failed',
      errorMessage: res.success ? undefined : res.message,
      rowNumber: res.rowNumber,
    };

    saveHistory([record, ...history.slice(0, 99)]);

    if (res.success) {
      if (soundEnabled) playSuccessChime();
      if (hapticsEnabled) triggerHaptic('success');
      return true;
    } else {
      if (soundEnabled) playErrorBuzz();
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white pb-12">
      
      {/* Top Navbar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3.5 sm:px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <ScanLine className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight">ScanSheet</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Mobile
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">Barcode &rarr; Google Sheet</p>
            </div>
          </div>

          {/* Quick Action Nav Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setShowAppsScriptModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-semibold"
              title="Google Apps Script Bridge (Part 1)"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Apps Script</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Part 2: Download Standalone Single-File HTML"
            >
              <FileCode className="w-4 h-4 text-teal-400" />
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition relative"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              {!webAppUrl && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-3.5 sm:px-4 py-4 space-y-4">
        
        {/* Unconfigured Web App URL Prompt */}
        {!webAppUrl && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="leading-snug">Google Apps Script URL is not set.</span>
            </div>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition text-[11px] shrink-0"
            >
              Configure Now
            </button>
          </div>
        )}

        {/* Live Barcode Camera Scanner */}
        <section aria-label="Barcode Camera Viewfinder">
          <ScannerView
            onScan={handleBarcodeDetected}
            isPaused={isScannerPaused}
            onTogglePause={() => setIsScannerPaused(!isScannerPaused)}
          />
        </section>

        {/* Active Scan Result Card (Shown when barcode detected) */}
        {activeScan && (
          <section aria-label="Detected Scan Details">
            <ScanResultCard
              serialNumber={activeScan.serialNumber}
              format={activeScan.format}
              timestamp={activeScan.timestamp}
              autoSubmit={autoSubmit}
              isSubmitting={isSubmitting}
              uploadStatus={uploadStatus}
              uploadMessage={uploadMessage}
              rowNumber={lastRowNumber}
              onSubmit={handleSubmitScan}
              onRescan={handleRescan}
            />
          </section>
        )}

        {/* Quick Mode & Entry Bar */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition active:scale-98"
          >
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Manual Entry</span>
          </button>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
            <span className="font-semibold text-slate-300">Auto-Submit</span>
            <input
              type="checkbox"
              checked={autoSubmit}
              onChange={(e) => handleToggleAutoSubmit(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500/20 cursor-pointer"
            />
          </label>
        </div>

        {/* Information Callout Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Target: Row 2+ Sequential Logging
            </span>
            <button
              onClick={() => setShowAppsScriptModal(true)}
              className="text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              View Guide <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Row 1 contains <code className="text-slate-300 font-mono">Timestamp</code> and <code className="text-slate-300 font-mono">Serial Number</code>. Each scan lands automatically in Column A &amp; Column B from Row 2 downwards.
          </p>
        </div>

        {/* Scan History Log */}
        <section aria-label="Scan History Log">
          <ScanHistory
            history={history}
            onClearHistory={() => saveHistory([])}
            onRetryItem={handleRetryHistoryItem}
            isRetryingId={retryingId}
          />
        </section>

      </main>

      {/* Modals */}
      <AppsScriptModal
        isOpen={showAppsScriptModal}
        onClose={() => setShowAppsScriptModal(false)}
      />

      <ConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        webAppUrl={webAppUrl}
        onSaveUrl={handleSaveUrl}
        autoSubmit={autoSubmit}
        onToggleAutoSubmit={handleToggleAutoSubmit}
        continuousMode={continuousMode}
        onToggleContinuousMode={handleToggleContinuous}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        hapticsEnabled={hapticsEnabled}
        onToggleHaptics={handleToggleHaptics}
        onOpenAppsScript={() => {
          setShowConfigModal(false);
          setShowAppsScriptModal(true);
        }}
      />

      <ManualEntryModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSubmit={handleManualSubmit}
      />

      <SingleFileExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

    </div>
  );
}
