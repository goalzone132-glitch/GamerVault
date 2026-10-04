import React, { useState } from 'react';
import {
  ChevronDown,
  ClipboardPaste,
  Trash2,
  Zap,
  Sparkles,
} from 'lucide-react';
import {
  PlayerSlot,
  Squad,
  SQUAD_MODES,
  SquadMode,
} from '../types';
import {
  createBlankPlayer,
  defaultPlayerLabel,
  formatSquadForTournament,
  parsePlayerMessage,
} from '../utils/storage';
import { CopyButton } from './CopyButton';

interface SquadCardProps {
  squad: Squad;
  onUpdate: (updated: Squad) => void;
  onDeleteRequest: (squad: Squad) => void;
  onModeReduceConfirm: (
    squad: Squad,
    newMode: SquadMode,
    lostCount: number,
    onConfirm: () => void
  ) => void;
  onOpenQuickFill: (squadId: string) => void;
  onToast: (msg: string, isWarning?: boolean) => void;
}

export const SquadCard: React.FC<SquadCardProps> = ({
  squad,
  onUpdate,
  onDeleteRequest,
  onModeReduceConfirm,
  onOpenQuickFill,
  onToast,
}) => {
  const [activePasteIndex, setActivePasteIndex] = useState<number | null>(null);
  const [pasteBuffer, setPasteBuffer] = useState('');

  const filledPlayersCount = squad.players.filter(
    (p) => p.ign.trim() || p.uid.trim() || p.phone.trim() || p.email.trim()
  ).length;

  const updateField = <K extends keyof Squad>(key: K, val: Squad[K]) => {
    onUpdate({
      ...squad,
      [key]: val,
      updatedAt: new Date().toISOString(),
    });
  };

  const updatePlayer = (index: number, patch: Partial<PlayerSlot>) => {
    const nextPlayers = squad.players.map((p, idx) =>
      idx === index ? { ...p, ...patch } : p
    );
    updateField('players', nextPlayers);
  };

  const handleModeChange = (newMode: SquadMode) => {
    const targetCount = SQUAD_MODES[newMode].count;
    const lostCount = squad.players
      .slice(targetCount)
      .filter(
        (p) =>
          p.ign.trim() ||
          p.uid.trim() ||
          p.phone.trim() ||
          p.email.trim() ||
          p.extra.trim()
      ).length;

    const applyModeChange = () => {
      const nextPlayers = [...squad.players];
      while (nextPlayers.length < targetCount) {
        nextPlayers.push(createBlankPlayer(nextPlayers.length));
      }
      nextPlayers.length = targetCount;
      onUpdate({
        ...squad,
        mode: newMode,
        players: nextPlayers,
        updatedAt: new Date().toISOString(),
      });
    };

    if (lostCount === 0) {
      applyModeChange();
    } else {
      onModeReduceConfirm(squad, newMode, lostCount, applyModeChange);
    }
  };

  const handleApplySmartPaste = (playerIdx: number) => {
    if (!pasteBuffer.trim()) {
      onToast('Paste your teammate message first', true);
      return;
    }
    const parsed = parsePlayerMessage(pasteBuffer);
    const current = squad.players[playerIdx];
    updatePlayer(playerIdx, {
      ign: parsed.ign || current.ign,
      uid: parsed.uid || current.uid,
      phone: parsed.phone || current.phone,
      email: parsed.email || current.email,
      extra: parsed.extra || current.extra,
    });
    setPasteBuffer('');
    setActivePasteIndex(null);
    onToast(`Auto-filled details for ${current.label || defaultPlayerLabel(playerIdx)}`);
  };

  const formatSinglePlayer = (p: PlayerSlot, idx: number): string => {
    const lines = [`${p.label.trim() || defaultPlayerLabel(idx)}`];
    if (p.ign.trim()) lines.push(`IGN: ${p.ign.trim()}`);
    if (p.uid.trim()) lines.push(`UID: ${p.uid.trim()}`);
    if (p.phone.trim()) lines.push(`Phone: ${p.phone.trim()}`);
    if (p.email.trim()) lines.push(`Email: ${p.email.trim()}`);
    if (p.extra.trim()) lines.push(`Info: ${p.extra.trim()}`);
    return lines.join('\n');
  };

  return (
    <article className="bg-[#101626] border border-slate-800/90 rounded-2xl overflow-hidden transition-colors">
      {/* Squad Header */}
      <div className="p-4 sm:p-6 border-b border-slate-800/70">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={squad.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Squad Name (e.g., Team Alpha)"
                aria-label="Squad name"
                autoComplete="off"
                className="w-full bg-transparent text-lg sm:text-xl font-bold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-b focus:border-cyan-400 truncate"
              />
            </div>
            {/* Clean unboxed metadata with typographic separators (Zero-Pill Rule) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1.5 font-mono tabular-nums">
              <span className="text-cyan-300/90 font-sans font-medium">
                {squad.game.trim() || 'No game set'}
              </span>
              {squad.tag?.trim() && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Tag: {squad.tag.trim()}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{SQUAD_MODES[squad.mode].label}</span>
              <span aria-hidden="true">·</span>
              <span>
                {filledPlayersCount}/{squad.players.length} ready
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <CopyButton
              getValue={() => squad.name}
              label="Squad name"
              onToast={onToast}
            />
            <button
              type="button"
              onClick={() => onOpenQuickFill(squad.id)}
              title="Open in Tournament Quick-Fill Mode"
              className="hidden sm:inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 hover:border-cyan-400/50 text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick-Fill</span>
            </button>
            <button
              type="button"
              onClick={() => updateField('collapsed', !squad.collapsed)}
              aria-label={squad.collapsed ? 'Expand squad' : 'Collapse squad'}
              aria-expanded={!squad.collapsed}
              className="min-w-[44px] min-h-[44px] rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-150 ${
                  squad.collapsed ? '-rotate-90' : 'rotate-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Body */}
      {!squad.collapsed && (
        <div>
          {/* Squad Meta Configuration Bar */}
          <div className="p-4 sm:p-6 bg-[#0c101d] border-b border-slate-800/70 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Esports Title / Game
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  list="esports-games-list"
                  value={squad.game}
                  onChange={(e) => updateField('game', e.target.value)}
                  placeholder="Free Fire MAX, PUBG Mobile..."
                  autoComplete="off"
                  className="w-full min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                />
                <CopyButton
                  getValue={() => squad.game}
                  label="Game name"
                  onToast={onToast}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Team / Clan Tag
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={squad.tag || ''}
                  onChange={(e) => updateField('tag', e.target.value)}
                  placeholder="e.g., PSX, TX, APX"
                  autoComplete="off"
                  className="w-full min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none font-mono"
                />
                <CopyButton
                  getValue={() => squad.tag || ''}
                  label="Team tag"
                  onToast={onToast}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Tournament Roster Size
              </label>
              <select
                value={squad.mode}
                onChange={(e) => handleModeChange(e.target.value as SquadMode)}
                aria-label="Tournament Roster Size"
                className="w-full min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none cursor-pointer"
              >
                {(Object.keys(SQUAD_MODES) as SquadMode[]).map((k) => (
                  <option key={k} value={k}>
                    {SQUAD_MODES[k].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Player Roster List — Divided cleanly by hairline borders (Zero nested cards) */}
          <div className="divide-y divide-slate-800/80">
            {squad.players.map((player, idx) => {
              const isPasteOpen = activePasteIndex === idx;
              return (
                <section key={idx} className="p-4 sm:p-6">
                  {/* Player Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                      <span className="font-mono tabular-nums text-xs text-slate-400 select-none">
                        0{idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={player.label}
                        onChange={(e) =>
                          updatePlayer(idx, { label: e.target.value })
                        }
                        placeholder={defaultPlayerLabel(idx)}
                        aria-label={`Player ${idx + 1} role or slot title`}
                        className="bg-transparent border-b border-dashed border-cyan-500/40 focus:border-cyan-400 text-cyan-300 font-semibold text-sm sm:text-base py-1 px-1 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActivePasteIndex(isPasteOpen ? null : idx);
                          setPasteBuffer('');
                        }}
                        className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-800 hover:border-cyan-400/50 bg-slate-900/80 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Smart Paste Message</span>
                      </button>

                      <CopyButton
                        variant="compact"
                        getValue={() => formatSinglePlayer(player, idx)}
                        label={`${player.label || defaultPlayerLabel(idx)} info`}
                        buttonText="Copy Player"
                        onToast={onToast}
                      />
                    </div>
                  </div>

                  {/* Smart Paste Box for WhatsApp / Messenger text */}
                  {isPasteOpen && (
                    <div className="mb-4 p-3.5 rounded-xl bg-[#090d16] border border-cyan-500/40">
                      <p className="text-xs text-slate-300 mb-2">
                        Paste your teammate&apos;s WhatsApp or Discord message below (e.g.,{' '}
                        <span className="font-mono text-cyan-300">
                          IGN: TX•RAFI, UID: 5829104921, Phone: 01712345678, Mail: rafi@gmail.com
                        </span>
                        ) to auto-fill all fields:
                      </p>
                      <textarea
                        rows={3}
                        value={pasteBuffer}
                        onChange={(e) => setPasteBuffer(e.target.value)}
                        placeholder="Paste raw player text message here..."
                        className="w-full bg-[#101626] border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none mb-2.5"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActivePasteIndex(null)}
                          className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplySmartPaste(idx)}
                          className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Extract & Fill Fields</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Player Data Grid: IGN, UID, Phone, Email, Extra */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* 1. In-Game Name (IGN) */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        In-Game Name (IGN)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={player.ign}
                          onChange={(e) =>
                            updatePlayer(idx, { ign: e.target.value })
                          }
                          placeholder="e.g., PSX•TANVIR"
                          autoComplete="off"
                          spellCheck={false}
                          className="w-full min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                        />
                        <CopyButton
                          getValue={() => player.ign}
                          label="IGN"
                          onToast={onToast}
                        />
                      </div>
                    </div>

                    {/* 2. Game UID / Player ID */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Game UID / Character ID
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={player.uid}
                          onChange={(e) =>
                            updatePlayer(idx, { uid: e.target.value })
                          }
                          placeholder="e.g., 2849105732"
                          autoComplete="off"
                          spellCheck={false}
                          className="w-full min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-100 placeholder:text-slate-600 focus:outline-none"
                        />
                        <CopyButton
                          getValue={() => player.uid}
                          label="UID"
                          onToast={onToast}
                        />
                      </div>
                    </div>

                    {/* 3. WhatsApp / Phone */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        WhatsApp / Phone Number
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          value={player.phone}
                          onChange={(e) =>
                            updatePlayer(idx, { phone: e.target.value })
                          }
                          placeholder="e.g., 01715-892341"
                          autoComplete="off"
                          className="w-full min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-100 placeholder:text-slate-600 focus:outline-none"
                        />
                        <CopyButton
                          getValue={() => player.phone}
                          label="Phone"
                          onToast={onToast}
                        />
                      </div>
                    </div>

                    {/* 4. Email / Gmail Address */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Email / Gmail Address
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={player.email}
                          onChange={(e) =>
                            updatePlayer(idx, { email: e.target.value })
                          }
                          placeholder="e.g., player@gmail.com"
                          autoComplete="off"
                          spellCheck={false}
                          className="w-full min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                        />
                        <CopyButton
                          getValue={() => player.email}
                          label="Email"
                          onToast={onToast}
                        />
                      </div>
                    </div>

                    {/* 5. Discord / NID / Extra Info */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">
                        Discord Tag / Real Name / NID / Extra (Optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={player.extra}
                          onChange={(e) =>
                            updatePlayer(idx, { extra: e.target.value })
                          }
                          placeholder="e.g., Discord: user#1234, Real Name, NID..."
                          autoComplete="off"
                          className="w-full min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                        />
                        <CopyButton
                          getValue={() => player.extra}
                          label="Extra info"
                          onToast={onToast}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          {/* Squad Footer Actions */}
          <div className="p-4 sm:p-6 bg-[#0c101d] border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <CopyButton
                variant="button"
                getValue={() => formatSquadForTournament(squad, 'whatsapp')}
                label="Full squad sheet"
                buttonText="Copy All Squad Info"
                onToast={onToast}
                className="bg-cyan-500/15 border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/25"
              />
              <CopyButton
                variant="button"
                getValue={() => formatSquadForTournament(squad, 'uids_only')}
                label="IGN & UID list"
                buttonText="Copy IGNs & UIDs"
                onToast={onToast}
              />
              <CopyButton
                variant="button"
                getValue={() => formatSquadForTournament(squad, 'discord')}
                label="Discord format"
                buttonText="Copy for Discord"
                onToast={onToast}
              />
            </div>

            <button
              type="button"
              onClick={() => onDeleteRequest(squad)}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Squad</span>
            </button>
          </div>
        </div>
      )}
    </article>
  );
};
