import React, { useState, useEffect } from 'react';
import { Check, Copy, ArrowRight, UploadCloud, RefreshCw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScanResultCardProps {
  serialNumber: string;
  format?: string;
  timestamp: string;
  autoSubmit: boolean;
  isSubmitting: boolean;
  uploadStatus: 'idle' | 'success' | 'error';
  uploadMessage?: string;
  rowNumber?: number;
  onSubmit: () => void;
  onRescan: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({
  serialNumber,
  format,
  timestamp,
  autoSubmit,
  isSubmitting,
  uploadStatus,
  uploadMessage,
  rowNumber,
  onSubmit,
  onRescan,
}) => {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(autoSubmit ? 2 : null);

  // Trigger celebration confetti on initial detection
  useEffect(() => {
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#059669', '#38bdf8'],
      });
    } catch {
      // Ignore if confetti fails
    }
  }, [serialNumber]);

  // Handle auto-submit countdown
  useEffect(() => {
    if (!autoSubmit || uploadStatus !== 'idle') {
      setCountdown(null);
      return;
    }

    setCountdown(1);
    const timer = setTimeout(() => {
      onSubmit();
      setCountdown(null);
    }, 900);

    return () => clearTimeout(timer);
  }, [autoSubmit, serialNumber, uploadStatus, onSubmit]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(serialNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Meta Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Detected Barcode
          </span>
          {format && (
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {format.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Serial Number Display Box */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 relative group">
        <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
          Extracted Serial / String
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="font-mono text-xl sm:text-2xl font-extrabold text-white tracking-wide break-all select-all pr-2">
            {serialNumber}
          </div>
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition shrink-0"
            title="Copy serial number"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Auto-Submit Progress or Upload Status Message */}
      {countdown !== null && uploadStatus === 'idle' && (
        <div className="flex items-center justify-between text-xs px-1 text-slate-400">
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            Auto-uploading to Google Sheet...
          </span>
          <button
            onClick={() => setCountdown(null)}
            className="text-[11px] underline text-slate-400 hover:text-white"
          >
            Cancel auto-upload
          </button>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <div className="font-semibold">{uploadMessage || 'Saved to Google Sheet!'}</div>
              {rowNumber && (
                <div className="text-[11px] text-emerald-400/80">
                  Appended to Row #{rowNumber} (Timestamp in Col A, Serial in Col B)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-rose-200">Upload Issue</div>
            <div className="text-[11px] text-rose-300/90 leading-tight">
              {uploadMessage || 'Could not reach your Google Apps Script endpoint.'}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        {uploadStatus !== 'success' ? (
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Writing to Row 2+...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Submit to Sheet</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onRescan}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <span>Scan Next Barcode</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onRescan}
          className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition"
        >
          {uploadStatus === 'success' ? 'Done' : 'Discard / Rescan'}
        </button>
      </div>
    </div>
  );
};
