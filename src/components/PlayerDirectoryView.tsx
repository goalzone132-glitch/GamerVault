import React, { useMemo } from 'react';
import { Squad } from '../types';
import { defaultPlayerLabel } from '../utils/storage';
import { CopyButton } from './CopyButton';

interface PlayerDirectoryViewProps {
  squads: Squad[];
  searchQuery: string;
  onToast: (msg: string, isWarning?: boolean) => void;
}

interface FlattenedPlayer {
  squadId: string;
  squadName: string;
  game: string;
  role: string;
  ign: string;
  uid: string;
  phone: string;
  email: string;
  extra: string;
}

export const PlayerDirectoryView: React.FC<PlayerDirectoryViewProps> = ({
  squads,
  searchQuery,
  onToast,
}) => {
  const allPlayers = useMemo<FlattenedPlayer[]>(() => {
    const list: FlattenedPlayer[] = [];
    squads.forEach((sq) => {
      sq.players.forEach((p, idx) => {
        if (
          p.ign.trim() ||
          p.uid.trim() ||
          p.phone.trim() ||
          p.email.trim() ||
          p.extra.trim()
        ) {
          list.push({
            squadId: sq.id,
            squadName: sq.name.trim() || 'Unnamed Squad',
            game: sq.game.trim() || 'Esports',
            role: p.label.trim() || defaultPlayerLabel(idx),
            ign: p.ign.trim(),
            uid: p.uid.trim(),
            phone: p.phone.trim(),
            email: p.email.trim(),
            extra: p.extra.trim(),
          });
        }
      });
    });

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) =>
      [
        item.ign,
        item.uid,
        item.phone,
        item.email,
        item.squadName,
        item.game,
        item.role,
        item.extra,
      ].some((v) => v.toLowerCase().includes(q))
    );
  }, [squads, searchQuery]);

  if (allPlayers.length === 0) {
    return (
      <div className="p-10 text-center bg-[#101626] border border-slate-800 rounded-2xl">
        <p className="text-slate-400">
          {searchQuery.trim()
            ? `No player matches "${searchQuery.trim()}".`
            : 'No filled player profiles yet. Add player IGNs, UIDs, phones, and emails in the Squad Vault.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#101626] border border-slate-800/90 rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100">
            All Saved Esports Players
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono tabular-nums">
            {allPlayers.length} active player{allPlayers.length === 1 ? '' : 's'} across{' '}
            {squads.length} squad{squads.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Desktop High-Density Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#0c101d] text-xs font-medium text-slate-400">
              <th className="py-3 px-4">Player IGN & Role</th>
              <th className="py-3 px-4">Squad & Game</th>
              <th className="py-3 px-4">Game UID</th>
              <th className="py-3 px-4">Phone / WhatsApp</th>
              <th className="py-3 px-4">Email Address</th>
              <th className="py-3 px-4 text-right">Full Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-sm">
            {allPlayers.map((p, i) => (
              <tr
                key={`${p.squadId}_${i}`}
                className="hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-100 truncate">
                        {p.ign || '—'}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {p.role}
                        {p.extra ? ` · ${p.extra}` : ''}
                      </div>
                    </div>
                    {p.ign && (
                      <CopyButton
                        getValue={() => p.ign}
                        label={`${p.ign} IGN`}
                        onToast={onToast}
                      />
                    )}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="text-slate-200 font-medium">{p.squadName}</div>
                  <div className="text-xs text-cyan-300/90">{p.game}</div>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-slate-200">
                      {p.uid || '—'}
                    </span>
                    {p.uid && (
                      <CopyButton
                        getValue={() => p.uid}
                        label={`${p.ign || 'Player'} UID`}
                        onToast={onToast}
                      />
                    )}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-slate-200">
                      {p.phone || '—'}
                    </span>
                    {p.phone && (
                      <CopyButton
                        getValue={() => p.phone}
                        label={`${p.ign || 'Player'} Phone`}
                        onToast={onToast}
                      />
                    )}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200 truncate max-w-[180px]">
                      {p.email || '—'}
                    </span>
                    {p.email && (
                      <CopyButton
                        getValue={() => p.email}
                        label={`${p.ign || 'Player'} Email`}
                        onToast={onToast}
                      />
                    )}
                  </div>
                </td>

                <td className="py-3 px-4 text-right">
                  <CopyButton
                    variant="compact"
                    getValue={() =>
                      [
                        `${p.role} (${p.squadName})`,
                        p.ign ? `IGN: ${p.ign}` : '',
                        p.uid ? `UID: ${p.uid}` : '',
                        p.phone ? `Phone: ${p.phone}` : '',
                        p.email ? `Email: ${p.email}` : '',
                        p.extra ? `Info: ${p.extra}` : '',
                      ]
                        .filter(Boolean)
                        .join('\n')
                    }
                    label={`${p.ign || 'Player'} full details`}
                    buttonText="Copy All"
                    onToast={onToast}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
