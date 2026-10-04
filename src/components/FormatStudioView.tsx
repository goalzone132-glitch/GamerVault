import React, { useMemo, useState } from 'react';
import {
  FormatOptions,
  Squad,
  SQUAD_MODES,
  TournamentFormatPreset,
} from '../types';
import { formatSquadForTournament } from '../utils/storage';
import { CopyButton } from './CopyButton';

interface FormatStudioViewProps {
  squads: Squad[];
  selectedSquadId: string;
  onSelectSquad: (id: string) => void;
  onToast: (msg: string, isWarning?: boolean) => void;
}

const PRESETS: {
  id: TournamentFormatPreset;
  label: string;
  desc: string;
}[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp / Messenger Sheet',
    desc: 'Standard multi-line squad registration sheet for WhatsApp & Messenger groups',
  },
  {
    id: 'discord',
    label: 'Discord Registration Markdown',
    desc: 'Formatted with bold titles and code blocks for Discord #register-here channels',
  },
  {
    id: 'compact',
    label: '1-Line Per Player',
    desc: 'Compact single-line roster ideal for lobby check-in or comments',
  },
  {
    id: 'uids_only',
    label: 'IGN + UID Verification Only',
    desc: 'Only player IGNs and Game UIDs (hides phone & email for public channels)',
  },
  {
    id: 'csv',
    label: 'Spreadsheet / CSV Format',
    desc: 'Comma-separated rows for Google Sheets or Excel tournament brackets',
  },
];

export const FormatStudioView: React.FC<FormatStudioViewProps> = ({
  squads,
  selectedSquadId,
  onSelectSquad,
  onToast,
}) => {
  const activeSquad =
    squads.find((s) => s.id === selectedSquadId) || squads[0] || null;

  const [preset, setPreset] = useState<TournamentFormatPreset>('whatsapp');
  const [options, setOptions] = useState<FormatOptions>({
    includeIgn: true,
    includeUid: true,
    includePhone: true,
    includeEmail: true,
    includeExtra: true,
    onlyFilledPlayers: false,
  });

  const previewText = useMemo(() => {
    if (!activeSquad) return '';
    return formatSquadForTournament(activeSquad, preset, options);
  }, [activeSquad, preset, options]);

  if (!activeSquad) {
    return (
      <div className="p-10 text-center bg-[#101626] border border-slate-800 rounded-2xl">
        <p className="text-slate-400">
          Create a squad first to use the Tournament Format Studio.
        </p>
      </div>
    );
  }

  const toggleOption = (key: keyof FormatOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Configuration Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#101626] border border-slate-800/90 rounded-2xl p-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              1. Choose Squad
            </label>
            <select
              value={activeSquad.id}
              onChange={(e) => onSelectSquad(e.target.value)}
              className="w-full min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-100 focus:outline-none cursor-pointer"
            >
              {squads.map((sq) => (
                <option key={sq.id} value={sq.id}>
                  {sq.name || 'Unnamed Squad'} ({SQUAD_MODES[sq.mode].shortLabel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              2. Tournament Platform Format
            </label>
            <div className="space-y-2">
              {PRESETS.map((p) => {
                const active = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                      active
                        ? 'bg-cyan-500/10 border-cyan-400 text-slate-100'
                        : 'bg-[#090d16] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-sm font-semibold">{p.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {preset !== 'uids_only' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                3. Fields to Include (Privacy & Rules Control)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'includeIgn' as const, label: 'In-Game Name' },
                  { key: 'includeUid' as const, label: 'Game UID' },
                  { key: 'includePhone' as const, label: 'Phone / WA' },
                  { key: 'includeEmail' as const, label: 'Email Address' },
                  { key: 'includeExtra' as const, label: 'Discord / Extra' },
                  { key: 'onlyFilledPlayers' as const, label: 'Hide Empty Slots' },
                ].map((item) => {
                  const checked = options[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleOption(item.key)}
                      aria-pressed={checked}
                      className={`min-h-[42px] px-3 py-2 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer whitespace-nowrap truncate ${
                        checked
                          ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-200'
                          : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <span className="font-mono text-[11px] ml-1">
                        {checked ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Live Preview & 1-Tap Copy Column */}
      <div className="lg:col-span-7">
        <div className="bg-[#101626] border border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col h-full">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Ready-to-Paste Tournament Text
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Preview or edit the generated registration message before copying
              </p>
            </div>

            <CopyButton
              variant="button"
              getValue={() => previewText}
              label="Formatted registration sheet"
              buttonText="Copy Formatted Text"
              onToast={onToast}
              className="bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 border-transparent"
            />
          </div>

          <textarea
            readOnly
            value={previewText}
            rows={18}
            aria-label="Formatted tournament registration text"
            className="w-full flex-1 bg-[#090d16] border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-400 resize-y"
          />
        </div>
      </div>
    </div>
  );
};
