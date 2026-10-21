import React, { useState } from 'react';
import { X, Check, Globe, RefreshCw, AlertCircle, Sparkles, Volume2, Smartphone, ShieldCheck } from 'lucide-react';
import { testWebAppConnection } from '../utils/sheetService';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  webAppUrl: string;
  onSaveUrl: (url: string) => void;
  autoSubmit: boolean;
  onToggleAutoSubmit: (val: boolean) => void;
  continuousMode: boolean;
  onToggleContinuousMode: (val: boolean) => void;
  soundEnabled: boolean;
  onToggleSound: (val: boolean) => void;
  hapticsEnabled: boolean;
  onToggleHaptics: (val: boolean) => void;
  onOpenAppsScript: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  webAppUrl,
  onSaveUrl,
  autoSubmit,
  onToggleAutoSubmit,
  continuousMode,
  onToggleContinuousMode,
  soundEnabled,
  onToggleSound,
  hapticsEnabled,
  onToggleHaptics,
  onOpenAppsScript,
}) => {
  const [urlInput, setUrlInput] = useState(webAppUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveUrl(urlInput.trim());
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 800);
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setTestResult({ ok: false, message: 'Please enter a URL first.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testWebAppConnection(urlInput.trim());
    setTesting(false);
    setTestResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Scanner Settings</h3>
              <p className="text-[11px] text-slate-400">Configure Google Sheet connection & scanner behavior</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* Web App URL Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200">
                Google Apps Script Web App URL
              </label>
              <button
                onClick={onOpenAppsScript}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Get Part 1 Code
              </button>
            </div>

            <div className="relative">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setTestResult(null);
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3.5 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs pr-10"
              />
              {urlInput && (
                <button
                  onClick={() => setUrlInput('')}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Deploy your Google Apps Script as a Web App with <strong className="text-slate-300">Who has access: Anyone</strong> and paste the deployed URL ending in <code className="text-emerald-400 font-mono">/exec</code>.
            </p>

            {/* Test Connection Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleTestConnection}
                disabled={testing || !urlInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition flex items-center space-x-1.5 disabled:opacity-40"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Testing Endpoint...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center space-x-1.5 ml-auto"
              >
                {savedFeedback ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{savedFeedback ? 'Saved!' : 'Save URL'}</span>
              </button>
            </div>

            {/* Connection Test Result Feedback */}
            {testResult && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-start space-x-2 mt-2 ${
                  testResult.ok
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}
              >
                {testResult.ok ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">{testResult.ok ? 'Connection Successful' : 'Connection Failed'}</div>
                  <div className="text-[11px] opacity-90 leading-tight mt-0.5">{testResult.message}</div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-3">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider text-slate-400">
              Scanning Preferences
            </h4>

            {/* Auto Submit */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <div className="font-semibold text-white">Auto-Submit upon Scan</div>
                <div className="text-[11px] text-slate-400">Automatically uploads to Google Sheet after barcode is detected</div>
              </div>
              <input
                type="checkbox"
                checked={autoSubmit}
                onChange={(e) => onToggleAutoSubmit(e.target.checked)}
                className="w-5 h-5 rounded-lg text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500/20 cursor-pointer"
              />
            </div>

            {/* Continuous Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <div className="font-semibold text-white">Continuous Scan Mode</div>
                <div className="text-[11px] text-slate-400">Automatically resumes camera 1.5 seconds after each successful scan</div>
              </div>
              <input
                type="checkbox"
                checked={continuousMode}
                onChange={(e) => onToggleContinuousMode(e.target.checked)}
                className="w-5 h-5 rounded-lg text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500/20 cursor-pointer"
              />
            </div>

            {/* Sound Feedback */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-semibold text-white">Audio Beep Feedback</div>
                  <div className="text-[11px] text-slate-400">Synthesized audio chime upon successful barcode lock</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => onToggleSound(e.target.checked)}
                className="w-5 h-5 rounded-lg text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500/20 cursor-pointer"
              />
            </div>

            {/* Vibration Feedback */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Smartphone className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-semibold text-white">Haptic Vibration</div>
                  <div className="text-[11px] text-slate-400">Vibrates the mobile device when barcode is detected</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={hapticsEnabled}
                onChange={(e) => onToggleHaptics(e.target.checked)}
                className="w-5 h-5 rounded-lg text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500/20 cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
