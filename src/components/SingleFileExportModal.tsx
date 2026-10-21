import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { generateStandaloneHtml } from '../utils/standaloneHtmlGenerator';

interface SingleFileExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SingleFileExportModal: React.FC<SingleFileExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const standaloneHtml = generateStandaloneHtml();

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(standaloneHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scansheet.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Part 2: Standalone Single-File HTML</h3>
              <p className="text-[11px] text-slate-400">Zero-build standalone web app with Tailwind & HTML5-QRCode via CDN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete, Self-Contained Web App</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This file contains all HTML, Tailwind CSS (via CDN), HTML5-QRCode (via CDN), and JavaScript in one single <code className="text-emerald-400">.html</code> file. You can download and double-click to run it, deploy to GitHub Pages, Netlify, Cloudflare Pages, or host on any static server!
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download scansheet.html</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied HTML!' : 'Copy Entire Code'}</span>
            </button>
          </div>
        </div>

        {/* Code Preview */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-[11px] text-slate-300 bg-slate-950">
          <pre className="whitespace-pre-wrap select-all">{standaloneHtml}</pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
