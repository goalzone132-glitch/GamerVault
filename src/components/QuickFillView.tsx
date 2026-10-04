import React, { useMemo, useState } from 'react';
import { Check, Copy, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { Squad, SQUAD_MODES } from '../types';
import { copyToClipboard, defaultPlayerLabel } from '../utils/storage';

interface QuickFillViewProps {
  squads: Squad[];
  selectedSquadId: string;
  onSelectSquad: (id: string) => void;
  onToast: (msg: string, isWarning?: boolean) => void;
}

interface QueueStep {
  id: string;
  group: string;
  fieldLabel: string;
  value: string;
  isMono?: boolean;
}

export const QuickFillView: React.FC<QuickFillViewProps> = ({
  squads,
  selectedSquadId,
  onSelectSquad,
  onToast,
}) => {
  const activeSquad =
    squads.find((s) => s.id === selectedSquadId) || squads[0] || null;

  const [stepIndex, setStepIndex] = useState(0);
  const [copiedCells, setCopiedCells] = useState<Record<string, boolean>>({});
  const [justCopiedId, setJustCopiedId] = useState<string | null>(null);

  const queueSteps = useMemo<QueueStep[]>(() => {
    if (!activeSquad) return [];
    const list: QueueStep[] = [];

    if (activeSquad.name.trim()) {
      list.push({
        id: 'team_name',
        group: 'Team Info',
        fieldLabel: 'Squad Name',
        value: activeSquad.name.trim(),
      });
    }
    if (activeSquad.tag?.trim()) {
      list.push({
        id: 'team_tag',
        group: 'Team Info',
        fieldLabel: 'Team Tag',
        value: activeSquad.tag.trim(),
        isMono: true,
      });
    }

    activeSquad.players.forEach((p, idx) => {
      const slotName = p.label.trim() || defaultPlayerLabel(idx);
      if (p.ign.trim()) {
        list.push({
          id: `p_${idx}_ign`,
          group: slotName,
          fieldLabel: 'In-Game Name (IGN)',
          value: p.ign.trim(),
        });
      }
      if (p.uid.trim()) {
        list.push({
          id: `p_${idx}_uid`,
          group: slotName,
          fieldLabel: 'Game UID',
          value: p.uid.trim(),
          isMono: true,
        });
      }
      if (p.phone.trim()) {
        list.push({
          id: `p_${idx}_phone`,
          group: slotName,
          fieldLabel: 'WhatsApp / Phone',
          value: p.phone.trim(),
          isMono: true,
        });
      }
      if (p.email.trim()) {
        list.push({
          id: `p_${idx}_email`,
          group: slotName,
          fieldLabel: 'Email Address',
          value: p.email.trim(),
        });
      }
      if (p.extra.trim()) {
        list.push({
          id: `p_${idx}_extra`,
          group: slotName,
          fieldLabel: 'Extra / Discord / NID',
          value: p.extra.trim(),
        });
      }
    });

    return list;
  }, [activeSquad]);

  const safeStepIdx =
    queueSteps.length > 0 ? Math.min(stepIndex, queueSteps.length - 1) : 0;
  const currentStep = queueSteps[safeStepIdx] || null;

  const triggerCellCopy = async (
    cellId: string,
    label: string,
    val: string,
    advanceQueue = false
  ) => {
    const trimmed = val.trim();
    if (!trimmed) {
      onToast(`Empty ${label} — nothing to copy`, true);
      return;
    }
    const ok = await copyToClipboard(trimmed);
    if (!ok) {
      onToast('Clipboard blocked. Copy manually.', true);
      return;
    }

    setCopiedCells((prev) => ({ ...prev, [cellId]: true }));
    setJustCopiedId(cellId);
    onToast(`Copied ${label}: ${trimmed}`);

    window.setTimeout(() => {
      setJustCopiedId((curr) => (curr === cellId ? null : curr));
    }, 1000);

    if (advanceQueue && queueSteps.length > 0) {
      setStepIndex((prev) => (prev + 1 < queueSteps.length ? prev + 1 : 0));
    }
  };

  if (!activeSquad) {
    return (
      <div className="p-10 text-center bg-[#101626] border border-slate-800 rounded-2xl">
        <p className="text-slate-400">
          Create a squad first to use Tournament Quick-Fill Mode.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Squad Switcher & Reset Checkmarks Header */}
      <div className="bg-[#101626] border border-slate-800/90 rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Select Squad for Tournament Registration Form
          </label>
          <select
            value={activeSquad.id}
            onChange={(e) => {
              onSelectSquad(e.target.value);
              setStepIndex(0);
              setCopiedCells({});
            }}
            className="w-full sm:max-w-md min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-400 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-100 focus:outline-none cursor-pointer"
          >
            {squads.map((sq) => (
              <option key={sq.id} value={sq.id}>
                {sq.name || 'Unnamed Squad'} — {sq.game || 'No game'} (
                {SQUAD_MODES[sq.mode].shortLabel})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono tabular-nums">
            {Object.keys(copiedCells).length}/{queueSteps.length} fields copied
          </div>
          <button
            type="button"
            onClick={() => {
              setCopiedCells({});
              setStepIndex(0);
              onToast('Reset form progress');
            }}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/80 text-xs font-medium text-slate-300 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        </div>
      </div>

      {/* Sequential Google Form Stepper ("Copy & Next Field") */}
      {currentStep && (
        <div className="bg-[#101626] border border-cyan-500/40 rounded-2xl p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono tabular-nums">
              <span>
                STEP {safeStepIdx + 1} OF {queueSteps.length}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-sans font-semibold text-slate-200">
                {currentStep.group}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-sans text-slate-400">
                {currentStep.fieldLabel}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Ideal for filling multi-box Google Forms one by one
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#090d16] border border-slate-800">
            <div className="min-w-0">
              <div className="text-xs text-slate-400 mb-1">
                {currentStep.group} — {currentStep.fieldLabel}
              </div>
              <div
                className={`text-lg sm:text-2xl font-bold text-slate-100 truncate ${
                  currentStep.isMono ? 'font-mono tabular-nums' : ''
                }`}
              >
                {currentStep.value}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setStepIndex((prev) =>
                    prev > 0 ? prev - 1 : queueSteps.length - 1
                  )
                }
                aria-label="Previous field"
                className="min-w-[44px] min-h-[44px] rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  triggerCellCopy(
                    currentStep.id,
                    `${currentStep.group} ${currentStep.fieldLabel}`,
                    currentStep.value,
                    true
                  )
                }
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 active:scale-98 text-slate-950 font-semibold text-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Copy className="w-4 h-4" />
                <span>Copy & Next Field</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High-Density 1-Tap Copy Grid for All Players */}
      <div className="bg-[#101626] border border-slate-800/90 rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              One-Tap Field Matrix — {activeSquad.name || 'Unnamed Squad'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tap any cell below to immediately copy that player&apos;s IGN, UID,
              Phone, or Email. Copied cells show a checkmark so you never lose track.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {activeSquad.players.map((player, idx) => {
            const slotName = player.label.trim() || defaultPlayerLabel(idx);
            const fields = [
              {
                key: `p_${idx}_ign`,
                label: 'IGN',
                value: player.ign,
                mono: false,
              },
              {
                key: `p_${idx}_uid`,
                label: 'Game UID',
                value: player.uid,
                mono: true,
              },
              {
                key: `p_${idx}_phone`,
                label: 'Phone / WA',
                value: player.phone,
                mono: true,
              },
              {
                key: `p_${idx}_email`,
                label: 'Email / Mail',
                value: player.email,
                mono: false,
              },
              ...(player.extra.trim()
                ? [
                    {
                      key: `p_${idx}_extra`,
                      label: 'Extra Info',
                      value: player.extra,
                      mono: false,
                    },
                  ]
                : []),
            ];

            return (
              <div key={idx} className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-xs text-slate-400">
                      0{idx + 1}.
                    </span>
                    <span className="text-sm font-semibold text-cyan-300">
                      {slotName}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {fields.map((f) => {
                    const hasVal = Boolean(f.value.trim());
                    const isDone = Boolean(copiedCells[f.key]);
                    const isFlash = justCopiedId === f.key;

                    return (
                      <button
                        key={f.key}
                        type="button"
                        disabled={!hasVal}
                        onClick={() =>
                          triggerCellCopy(
                            f.key,
                            `${slotName} ${f.label}`,
                            f.value,
                            false
                          )
                        }
                        className={`min-h-[54px] p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors duration-150 ${
                          !hasVal
                            ? 'bg-[#090d16]/50 border-slate-800/50 text-slate-600 cursor-not-allowed'
                            : isFlash
                            ? 'bg-cyan-400 border-cyan-300 text-slate-950 cursor-pointer'
                            : isDone
                            ? 'bg-emerald-950/30 border-emerald-500/40 hover:border-cyan-400 text-slate-100 cursor-pointer'
                            : 'bg-[#090d16] border-slate-800 hover:border-cyan-400/70 text-slate-100 cursor-pointer'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-[11px] font-medium ${
                              isFlash
                                ? 'text-slate-900'
                                : isDone
                                ? 'text-emerald-300'
                                : 'text-slate-400'
                            }`}
                          >
                            {f.label} {isDone && !isFlash ? '· Copied' : ''}
                          </div>
                          <div
                            className={`text-sm font-semibold truncate mt-0.5 ${
                              f.mono ? 'font-mono tabular-nums' : ''
                            }`}
                          >
                            {hasVal ? f.value : '—'}
                          </div>
                        </div>

                        {hasVal && (
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isFlash
                                ? 'bg-slate-950/20 text-slate-950'
                                : isDone
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800/80 text-cyan-400'
                            }`}
                          >
                            {isDone || isFlash ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
