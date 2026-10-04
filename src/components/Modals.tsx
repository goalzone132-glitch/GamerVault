import React, { useRef, useState } from 'react';
import { Download, FileCode, Upload, X } from 'lucide-react';
import {
  POPULAR_GAMES,
  Squad,
  SQUAD_MODES,
  SquadMode,
} from '../types';
import {
  copyToClipboard,
  createPlayersForMode,
  generateSquadId,
  sanitizeSquad,
} from '../utils/storage';
import { generateStandaloneHtml } from '../utils/standaloneHtml';

interface NewSquadModalProps {
  defaultGame: string;
  onClose: () => void;
  onCreate: (newSquad: Squad) => void;
  onToast: (msg: string, isWarning?: boolean) => void;
}

export const NewSquadModal: React.FC<NewSquadModalProps> = ({
  defaultGame,
  onClose,
  onCreate,
  onToast,
}) => {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [game, setGame] = useState(defaultGame || 'Free Fire MAX');
  const [mode, setMode] = useState<SquadMode>('squad4');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      onToast('Enter a squad name first', true);
      return;
    }

    const squad: Squad = {
      id: generateSquadId(),
      name: trimmedName,
      tag: tag.trim(),
      game: game.trim(),
      mode,
      collapsed: false,
      players: createPlayersForMode(mode),
      updatedAt: new Date().toISOString(),
    };
    onCreate(squad);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-[#101626] border border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100">Create New Squad</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[40px] min-h-[40px] rounded-lg text-slate-400 hover:text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Squad Name *
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Team Alpha BD"
                className="w-full min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Clan Tag
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g., TX"
                className="w-full min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3.5 py-2 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Esports Game Title
            </label>
            <input
              type="text"
              list="esports-games-list"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              placeholder="Free Fire MAX, PUBG Mobile, Valorant..."
              className="w-full min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_GAMES.slice(0, 6).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGame(g)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    game === g
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                      : 'bg-[#090d16] text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Roster Size / Tournament Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(SQUAD_MODES) as SquadMode[]).map((k) => {
                const selected = mode === k;
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setMode(k)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap truncate ${
                      selected
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200'
                        : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {SQUAD_MODES[k].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] px-4 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-sm font-medium text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[44px] px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-semibold cursor-pointer"
            >
              Create Squad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface BackupModalProps {
  squads: Squad[];
  onImportSquads: (imported: Squad[]) => void;
  onClose: () => void;
  onToast: (msg: string, isWarning?: boolean) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  squads,
  onImportSquads,
  onClose,
  onToast,
}) => {
  const [tab, setTab] = useState<'export' | 'import' | 'github'>('github');
  const [importText, setImportText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const backupJson = JSON.stringify(
    {
      app: 'GamerVault',
      version: 1,
      exportedAt: new Date().toISOString(),
      squads,
    },
    null,
    2
  );

  const standaloneHtml = generateStandaloneHtml(squads);

  const handleDownloadStandaloneHtml = () => {
    try {
      const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      onToast('Downloaded standalone index.html for GitHub!');
    } catch {
      onToast('Download blocked. Use Copy HTML Code instead.', true);
    }
  };

  const handleDownloadFile = () => {
    if (!squads.length) {
      onToast('Nothing to export yet', true);
      return;
    }
    const fileName = `gamervault-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    try {
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      onToast('Backup JSON file downloaded!');
    } catch {
      onToast('Could not download file. Use Copy Backup Code instead.', true);
    }
  };

  const processRawImport = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed)
        ? parsed
        : parsed && Array.isArray(parsed.squads)
        ? parsed.squads
        : null;
      if (!arr) throw new Error('Invalid format');
      const cleaned = arr
        .map(sanitizeSquad)
        .filter((x): x is Squad => x !== null);
      if (!cleaned.length) throw new Error('No squads found');
      onImportSquads(cleaned);
    } catch {
      onToast('Invalid GamerVault backup code or file', true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        processRawImport(reader.result);
      }
    };
    reader.onerror = () => onToast('Could not read that file', true);
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-[#101626] border border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">
            Backup & Restore Vault
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[40px] min-h-[40px] rounded-lg text-slate-400 hover:text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#090d16] border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('github')}
            className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'github'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GitHub HTML
          </button>
          <button
            type="button"
            onClick={() => setTab('export')}
            className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'export'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => setTab('import')}
            className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'import'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Import JSON
          </button>
        </div>

        {tab === 'github' ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              Directly uploading to GitHub Pages? Download this single{' '}
              <span className="font-mono text-cyan-300">index.html</span> file (or copy
              its code). It works 100% standalone on GitHub Pages and mobile browsers
              with zero white screen.
            </p>
            <textarea
              readOnly
              rows={6}
              value={standaloneHtml}
              aria-label="Standalone GitHub index.html code"
              className="w-full bg-[#090d16] border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadStandaloneHtml}
                className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-semibold cursor-pointer whitespace-nowrap"
              >
                <FileCode className="w-4 h-4" />
                <span>Download index.html</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  const ok = await copyToClipboard(standaloneHtml);
                  onToast(
                    ok
                      ? 'Complete index.html code copied! Paste into GitHub.'
                      : 'Copy blocked. Select the text above manually.',
                    !ok
                  );
                }}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-100 cursor-pointer whitespace-nowrap"
              >
                <span>Copy HTML Code</span>
              </button>
            </div>
          </div>
        ) : tab === 'export' ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Copy this backup JSON code to keep in WhatsApp/Notes or download it as a{' '}
              <span className="font-mono text-slate-300">.json</span> file so you never
              lose your squads.
            </p>
            <textarea
              readOnly
              rows={7}
              value={backupJson}
              aria-label="Backup JSON code"
              className="w-full bg-[#090d16] border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  const ok = await copyToClipboard(backupJson);
                  onToast(
                    ok
                      ? 'Backup code copied! Save it in Notes or WhatsApp.'
                      : 'Copy blocked. Select the text above manually.',
                    !ok
                  );
                }}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-semibold cursor-pointer whitespace-nowrap"
              >
                Copy Backup Code
              </button>
              <button
                type="button"
                onClick={handleDownloadFile}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-100 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Save as File</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Paste a GamerVault backup code below or choose a{' '}
              <span className="font-mono text-slate-300">.json</span> backup file.
              Existing squads with matching IDs are updated and new ones are added.
            </p>
            <textarea
              rows={7}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your GamerVault JSON backup code here..."
              aria-label="Paste backup JSON code"
              className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-xl p-3 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!importText.trim()) {
                    onToast('Paste a backup code first', true);
                    return;
                  }
                  processRawImport(importText);
                }}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-semibold cursor-pointer whitespace-nowrap"
              >
                Import Pasted Backup
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-100 cursor-pointer whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                <span>Choose JSON File</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md bg-[#101626] border border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4">
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
        <p className="text-sm text-slate-400">{message}</p>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 min-h-[44px] px-4 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-sm font-medium text-slate-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 min-h-[44px] px-4 py-2 rounded-lg border border-rose-500/40 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-sm font-semibold cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
