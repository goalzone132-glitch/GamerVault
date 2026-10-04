/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Database,
  FileText,
  Plus,
  Search,
  Shield,
  Users,
  Zap,
  X,
} from 'lucide-react';
import {
  ActiveTab,
  POPULAR_GAMES,
  Squad,
  SQUAD_MODES,
  SquadMode,
} from './types';
import { loadSquads, saveSquads } from './utils/storage';
import { SquadCard } from './components/SquadCard';
import { QuickFillView } from './components/QuickFillView';
import { FormatStudioView } from './components/FormatStudioView';
import { PlayerDirectoryView } from './components/PlayerDirectoryView';
import {
  BackupModal,
  ConfirmModal,
  NewSquadModal,
} from './components/Modals';

export default function App() {
  const [squads, setSquads] = useState<Squad[]>(() => loadSquads());
  const [activeTab, setActiveTab] = useState<ActiveTab>('squads');
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState<string>('ALL');
  const [selectedSquadId, setSelectedSquadId] = useState<string>(
    () => squads[0]?.id || ''
  );

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    isWarning?: boolean;
  } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const triggerToast = (message: string, isWarning = false) => {
    setToast({ message, isWarning });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 1800);
  };

  // Auto-save squads to localStorage
  useEffect(() => {
    const ok = saveSquads(squads);
    if (!ok) {
      triggerToast('Storage is full or blocked by browser settings', true);
    }
  }, [squads]);

  // Close modals on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmState) setConfirmState(null);
        else if (showNewModal) setShowNewModal(false);
        else if (showBackupModal) setShowBackupModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmState, showNewModal, showBackupModal]);

  // Distinct games present across squads for filter bar
  const availableGames = useMemo(() => {
    const set = new Set<string>();
    squads.forEach((s) => {
      if (s.game.trim()) set.add(s.game.trim());
    });
    return Array.from(set);
  }, [squads]);

  // Filtered squads for Squad Vault view
  const filteredSquads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return squads.filter((sq) => {
      if (
        gameFilter !== 'ALL' &&
        sq.game.trim().toLowerCase() !== gameFilter.toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;
      const haystacks = [
        sq.name,
        sq.tag || '',
        sq.game,
        ...sq.players.flatMap((p) => [
          p.label,
          p.ign,
          p.uid,
          p.phone,
          p.email,
          p.extra,
        ]),
      ];
      return haystacks.some((val) => val.toLowerCase().includes(q));
    });
  }, [squads, searchQuery, gameFilter]);

  const totalSavedPlayers = useMemo(() => {
    return squads.reduce(
      (sum, sq) =>
        sum +
        sq.players.filter(
          (p) =>
            p.ign.trim() ||
            p.uid.trim() ||
            p.phone.trim() ||
            p.email.trim() ||
            p.extra.trim()
        ).length,
      0
    );
  }, [squads]);

  const handleUpdateSquad = (updated: Squad) => {
    setSquads((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleCreateSquad = (newSquad: Squad) => {
    setSquads((prev) => [newSquad, ...prev]);
    setSelectedSquadId(newSquad.id);
    setShowNewModal(false);
    setSearchQuery('');
    setGameFilter('ALL');
    setActiveTab('squads');
    triggerToast(`Created "${newSquad.name}"`);
  };

  const handleDeleteRequest = (squad: Squad) => {
    setConfirmState({
      title: 'Delete Squad?',
      message: `Are you sure you want to delete "${
        squad.name.trim() || 'this squad'
      }"? This action cannot be undone.`,
      confirmLabel: 'Delete Squad',
      onConfirm: () => {
        setSquads((prev) => prev.filter((x) => x.id !== squad.id));
        setConfirmState(null);
        triggerToast('Squad deleted');
      },
    });
  };

  const handleModeReduceConfirm = (
    squad: Squad,
    newMode: SquadMode,
    lostCount: number,
    onConfirm: () => void
  ) => {
    setConfirmState({
      title: 'Remove Filled Player Slots?',
      message: `Switching "${
        squad.name.trim() || 'this squad'
      }" to ${SQUAD_MODES[newMode].label} will remove ${lostCount} filled player slot${
        lostCount > 1 ? 's' : ''
      }.`,
      confirmLabel: 'Remove Slots',
      onConfirm: () => {
        onConfirm();
        setConfirmState(null);
      },
    });
  };

  const handleImportSquads = (imported: Squad[]) => {
    setSquads((prev) => {
      const next = [...prev];
      imported.forEach((inc) => {
        const idx = next.findIndex((x) => x.id === inc.id);
        if (idx > -1) next[idx] = inc;
        else next.push(inc);
      });
      return next;
    });
    setShowBackupModal(false);
    triggerToast(
      `Imported ${imported.length} squad${imported.length > 1 ? 's' : ''}`
    );
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-24 md:pb-16">
      {/* Top Bar Contract: Strict 3-Zone Header */}
      <header className="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Title (Single text element in display face) */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('squads');
            }}
            className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-100 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
          >
            GamerVault
          </a>

          {/* Zone 2: 4 Clean Navigation Text Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {[
              { id: 'squads' as const, label: 'Squad Vault' },
              { id: 'quickfill' as const, label: 'Tournament Quick-Fill' },
              { id: 'format' as const, label: 'Format Studio' },
              { id: 'directory' as const, label: 'Player Directory' },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 border-b-2 ${
                    isActive
                      ? 'border-cyan-400 text-cyan-300 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 2 Primary Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowBackupModal(true)}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Backup / Import</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 active:scale-98 text-slate-950 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Squad</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Contextual Workspace Header & Search Bar */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-800/70">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight text-balance">
              {activeTab === 'squads' && 'Esports Squad & Roster Vault'}
              {activeTab === 'quickfill' && 'Tournament Form Quick-Fill'}
              {activeTab === 'format' && 'Tournament Copy Format Studio'}
              {activeTab === 'directory' && 'All Players Directory'}
            </h1>
            {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono tabular-nums">
              <span>
                {squads.length} squad{squads.length === 1 ? '' : 's'} saved
              </span>
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              <span>
                {totalSavedPlayers} player profile{totalSavedPlayers === 1 ? '' : 's'}
              </span>
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              <span className="font-sans">
                1-tap copy for IGN, UID, Phone &amp; Email
              </span>
            </p>
          </div>

          {/* Search Input (shown on Squads & Directory views) */}
          {(activeTab === 'squads' || activeTab === 'directory') && (
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search squad, IGN, UID, phone, mail..."
                aria-label="Search squads or players"
                autoComplete="off"
                className="w-full min-h-[44px] bg-[#101626] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-9 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md text-slate-400 hover:text-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </section>

        {/* Interactive Game Filter Bar (Squads View) */}
        {activeTab === 'squads' && availableGames.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setGameFilter('ALL')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                gameFilter === 'ALL'
                  ? 'bg-cyan-400 text-slate-950 font-semibold'
                  : 'bg-[#101626] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Games ({squads.length})
            </button>
            {availableGames.map((g) => {
              const active = gameFilter.toLowerCase() === g.toLowerCase();
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGameFilter(g)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-cyan-400 text-slate-950 font-semibold'
                      : 'bg-[#101626] border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        )}

        {/* Active View Content */}
        {activeTab === 'squads' && (
          <div className="space-y-5">
            {squads.length === 0 ? (
              <div className="p-12 text-center bg-[#101626] border border-dashed border-slate-800 rounded-2xl space-y-4">
                <p className="text-base text-slate-300 font-medium">
                  No squads saved in your vault yet.
                </p>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Save your team&apos;s IGNs, Game UIDs, WhatsApp numbers, and emails once so
                  you never have to message teammates before a tournament registration.
                </p>
                <button
                  type="button"
                  onClick={() => setShowNewModal(true)}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Squad</span>
                </button>
              </div>
            ) : filteredSquads.length === 0 ? (
              <div className="p-10 text-center bg-[#101626] border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-400 text-sm">
                  No squad or player matches &ldquo;{searchQuery.trim()}&rdquo;.
                </p>
              </div>
            ) : (
              filteredSquads.map((squad) => (
                <SquadCard
                  key={squad.id}
                  squad={squad}
                  onUpdate={handleUpdateSquad}
                  onDeleteRequest={handleDeleteRequest}
                  onModeReduceConfirm={handleModeReduceConfirm}
                  onOpenQuickFill={(sqId) => {
                    setSelectedSquadId(sqId);
                    setActiveTab('quickfill');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onToast={triggerToast}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'quickfill' && (
          <QuickFillView
            squads={squads}
            selectedSquadId={selectedSquadId}
            onSelectSquad={setSelectedSquadId}
            onToast={triggerToast}
          />
        )}

        {activeTab === 'format' && (
          <FormatStudioView
            squads={squads}
            selectedSquadId={selectedSquadId}
            onSelectSquad={setSelectedSquadId}
            onToast={triggerToast}
          />
        )}

        {activeTab === 'directory' && (
          <PlayerDirectoryView
            squads={squads}
            searchQuery={searchQuery}
            onToast={triggerToast}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Tab Bar (Respects 15% Sticky Cap) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#090d16]/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-4 items-center h-14 px-2"
      >
        {[
          { id: 'squads' as const, label: 'Squads', icon: Shield },
          { id: 'quickfill' as const, label: 'Quick-Fill', icon: Zap },
          { id: 'format' as const, label: 'Formats', icon: FileText },
          { id: 'directory' as const, label: 'Players', icon: Users },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[11px] mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Toast Notification Banner */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed left-1/2 bottom-20 md:bottom-8 z-50 -translate-x-1/2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold shadow-xl transition-all duration-150 pointer-events-none max-w-[90vw] text-center ${
          toast
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-3'
        } ${
          toast?.isWarning
            ? 'bg-[#101626] border-rose-500 text-rose-200'
            : 'bg-[#101626] border-cyan-400 text-slate-100'
        }`}
      >
        {toast?.message || ''}
      </div>

      {/* Datalist for popular esports games */}
      <datalist id="esports-games-list">
        {POPULAR_GAMES.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>

      {/* Modals */}
      {showNewModal && (
        <NewSquadModal
          defaultGame={squads[0]?.game || 'Free Fire MAX'}
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateSquad}
          onToast={triggerToast}
        />
      )}

      {showBackupModal && (
        <BackupModal
          squads={squads}
          onImportSquads={handleImportSquads}
          onClose={() => setShowBackupModal(false)}
          onToast={triggerToast}
        />
      )}

      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
