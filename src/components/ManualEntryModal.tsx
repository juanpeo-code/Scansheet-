import React, { useState } from 'react';
import { X, Keyboard, UploadCloud, RefreshCw } from 'lucide-react';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (serialNumber: string) => Promise<boolean>;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [serial, setSerial] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) {
      setError('Please enter a serial number.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const success = await onSubmit(serial.trim());
    setIsSubmitting(false);

    if (success) {
      setSerial('');
      onClose();
    } else {
      setError('Failed to submit. Check your Web App URL and internet connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Manual Serial Entry</h3>
              <p className="text-[11px] text-slate-400">For damaged, unscannable barcodes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">
              Serial Number / Barcode Text
            </label>
            <input
              type="text"
              autoFocus
              value={serial}
              onChange={(e) => {
                setSerial(e.target.value);
                setError('');
              }}
              placeholder="e.g. SN-882103948"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-sm uppercase tracking-wide"
            />
            {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !serial.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center space-x-1.5 disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload to Google Sheet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
