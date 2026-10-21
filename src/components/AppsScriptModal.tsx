import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Code2, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { APPS_SCRIPT_CODE } from '../utils/googleAppsScriptCode';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUrl?: (url: string) => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'instructions' | 'sheet_format'>('code');

  if (!isOpen) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                Part 1: Google Apps Script Bridge
              </h3>
              <p className="text-[11px] text-slate-400">Backend script deployed to Google Sheets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 text-xs">
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-3 font-semibold border-b-2 transition ${
              activeTab === 'code'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            doPost(e) Script Code
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`py-3 px-3 font-semibold border-b-2 transition ${
              activeTab === 'instructions'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            60-Second Deployment Guide
          </button>
          <button
            onClick={() => setActiveTab('sheet_format')}
            className={`py-3 px-3 font-semibold border-b-2 transition ${
              activeTab === 'sheet_format'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sheet Layout (Row 2+)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">
                  Copy and paste this into <strong>Extensions &gt; Apps Script</strong> inside your Google Sheet:
                </span>
                <button
                  onClick={copyCode}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-emerald-500/10 active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Apps Script Code'}</span>
                </button>
              </div>

              {/* Code display block */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-emerald-300/90 overflow-x-auto leading-relaxed max-h-[50vh]">
                <pre>{APPS_SCRIPT_CODE}</pre>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-400 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Pro-Tip:</strong> If you open Apps Script directly from your sheet (<code className="text-slate-300">Extensions &gt; Apps Script</code>), it is automatically bound so you can leave <code className="text-slate-300">SPREADSHEET_ID = ""</code>. It will automatically detect your active spreadsheet!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Step-by-Step Deployment
                </h4>
                
                <ol className="space-y-3 text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                    <div>
                      <strong>Open your Google Sheet</strong>: Ensure Row 1 has headers (Column A = <code className="text-emerald-400">Timestamp</code>, Column B = <code className="text-emerald-400">Serial Number</code>). Tab can be named <code className="text-emerald-400">Scans</code> or keep the default name.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                    <div>
                      In the top menu, click <strong>Extensions &gt; Apps Script</strong>. A new browser tab opens with the code editor.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                    <div>
                      Delete any default code in <code className="text-slate-300">Code.gs</code>, paste the code from Tab 1, and press <strong>Save</strong> (disk icon or Ctrl/Cmd + S).
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                    <div>
                      Click the blue <strong>Deploy</strong> button (top right) &gt; <strong>New deployment</strong>.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">5</span>
                    <div>
                      Click the gear icon next to "Select type" and choose <strong>Web app</strong>.
                      <div className="mt-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] space-y-1">
                        <div>&bull; <strong>Execute as:</strong> <span className="font-bold underline">Me (your email)</span></div>
                        <div>&bull; <strong>Who has access:</strong> <span className="font-bold underline text-amber-300">Anyone</span> (Crucial! Allows your phone's browser to send scans without OAuth token hassles)</div>
                      </div>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">6</span>
                    <div>
                      Click <strong>Deploy</strong>, grant permissions when prompted by Google, and copy the <strong>Web App URL</strong> ending in <code className="text-emerald-400">/exec</code>.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">7</span>
                    <div>
                      Paste this URL into this web application's <strong>Settings</strong>. You're ready to scan!
                    </div>
                  </li>
                </ol>
              </div>

              {/* Crucial CORS Note */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-300 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-[11px]">
                  <div className="font-semibold text-white">Why "Who has access: Anyone"?</div>
                  <p className="text-slate-400 leading-relaxed">
                    Google Apps Script Web Apps require "Anyone" permission for anonymous mobile browser POST calls to bypass Google account login redirects. Our client sends standard <code className="text-slate-300">text/plain</code> JSON payloads so no CORS preflight blocks the upload.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sheet_format' && (
            <div className="space-y-3">
              <p className="text-slate-300 leading-relaxed">
                Here is exactly how your Google Sheet will look as scans arrive:
              </p>

              {/* Mock Google Sheet Preview */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 shadow-inner">
                {/* Sheet Title Bar */}
                <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                    My Inventory Google Sheet &bull; Tab: "Scans"
                  </span>
                  <span className="text-slate-400 text-[10px]">Auto-Appends Sequential Rows</span>
                </div>

                {/* Table Mockup */}
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
                      <th className="py-2 px-3 w-12 text-center text-slate-500">Row</th>
                      <th className="py-2 px-3 border-r border-slate-700/60 text-emerald-300">A (Date / Timestamp)</th>
                      <th className="py-2 px-3 text-emerald-300">B (Serial Number)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    <tr className="bg-slate-900/60 font-semibold text-slate-200">
                      <td className="py-2 px-3 text-center text-slate-600">1</td>
                      <td className="py-2 px-3 border-r border-slate-800">Timestamp</td>
                      <td className="py-2 px-3">Serial Number</td>
                    </tr>
                    <tr className="bg-emerald-950/20 text-emerald-200">
                      <td className="py-2 px-3 text-center text-slate-600">2</td>
                      <td className="py-2 px-3 border-r border-slate-800">2026-10-20 04:58:12</td>
                      <td className="py-2 px-3 font-bold">SN-98234-A71</td>
                    </tr>
                    <tr className="bg-slate-950/40">
                      <td className="py-2 px-3 text-center text-slate-600">3</td>
                      <td className="py-2 px-3 border-r border-slate-800">2026-10-20 04:58:35</td>
                      <td className="py-2 px-3 font-bold">SN-98234-A72</td>
                    </tr>
                    <tr className="bg-slate-950/40">
                      <td className="py-2 px-3 text-center text-slate-600">4</td>
                      <td className="py-2 px-3 border-r border-slate-800">2026-10-20 04:59:01</td>
                      <td className="py-2 px-3 font-bold">SN-98234-A73</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-400 text-[11px]">
                The script automatically prepends an apostrophe <code className="text-emerald-400">'</code> in Google Sheets so serial numbers with leading zeroes (e.g. <code className="text-slate-300">00048192</code>) are preserved as raw text strings without number truncating!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <a
            href="https://script.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            Open Google Apps Script <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
