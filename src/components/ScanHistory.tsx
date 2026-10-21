import React, { useState } from 'react';
import { ScanRecord } from '../utils/sheetService';
import { Download, Trash2, Check, Clock, AlertTriangle, RefreshCw, Copy } from 'lucide-react';

interface ScanHistoryProps {
  history: ScanRecord[];
  onClearHistory: () => void;
  onRetryItem: (item: ScanRecord) => void;
  isRetryingId?: string | null;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  history,
  onClearHistory,
  onRetryItem,
  isRetryingId,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'synced' | 'failed'>('all');

  const filteredHistory = history.filter(item => {
    if (filter === 'synced') return item.status === 'synced';
    if (filter === 'failed') return item.status === 'failed' || item.status === 'pending';
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const exportToCsv = () => {
    if (history.length === 0) return;
    const header = 'Timestamp,Serial Number,Status,Row Number\n';
    const rows = history.map(h => 
      `"${h.timestamp}","${h.serialNumber.replace(/"/g, '""')}","${h.status}","${h.rowNumber || ''}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scansheet_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3.5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Scan History
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px]">
            {history.length}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {history.length > 0 && (
            <>
              <button
                onClick={exportToCsv}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear all local scan history?')) {
                    onClearHistory();
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
                title="Clear History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      {history.length > 0 && (
        <div className="flex items-center space-x-1 text-[11px]">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setFilter('synced')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'synced' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Synced ({history.filter(h => h.status === 'synced').length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending / Failed ({history.filter(h => h.status !== 'synced').length})
          </button>
        </div>
      )}

      {/* History Items List */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            {history.length === 0 ? 'No scans recorded yet. Aim camera at a barcode.' : 'No scans match this filter.'}
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 transition flex items-center justify-between text-xs group"
            >
              <div className="truncate pr-3 space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-white tracking-wide truncate">
                    {item.serialNumber}
                  </span>
                  {item.format && (
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                      {item.format}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                  {item.rowNumber && (
                    <span className="text-emerald-400/90 font-mono">
                      &bull; Sheet Row #{item.rowNumber}
                    </span>
                  )}
                </div>
                {item.errorMessage && (
                  <div className="text-[10px] text-rose-400 truncate max-w-xs">
                    {item.errorMessage}
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={() => handleCopy(item.id, item.serialNumber)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition"
                  title="Copy serial"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {item.status === 'synced' ? (
                  <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Synced
                  </span>
                ) : (
                  <button
                    onClick={() => onRetryItem(item)}
                    disabled={isRetryingId === item.id}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition flex items-center gap-1"
                    title="Retry upload to Google Sheet"
                  >
                    {isRetryingId === item.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    Retry
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
