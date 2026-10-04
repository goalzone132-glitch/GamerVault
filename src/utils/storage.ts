import {
  FormatOptions,
  PlayerSlot,
  Squad,
  SQUAD_MODES,
  SquadMode,
  TournamentFormatPreset,
} from '../types';

export const STORAGE_KEY = 'gamervault.v1';
const SEEDED_FLAG_KEY = 'gamervault.seeded.v1';

export function generateSquadId(): string {
  return 'sq_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function defaultPlayerLabel(index: number): string {
  if (index === 0) return 'Captain (IGL)';
  if (index === 4) return 'Substitute 1';
  if (index === 5) return 'Substitute 2';
  return `Player ${index + 1}`;
}

export function createBlankPlayer(index: number): PlayerSlot {
  return {
    label: defaultPlayerLabel(index),
    ign: '',
    uid: '',
    phone: '',
    email: '',
    extra: '',
  };
}

export function createPlayersForMode(mode: SquadMode): PlayerSlot[] {
  const count = SQUAD_MODES[mode].count;
  return Array.from({ length: count }, (_, idx) => createBlankPlayer(idx));
}

function safeStr(val: unknown): string {
  if (typeof val === 'string') return val.slice(0, 300);
  if (typeof val === 'number') return String(val);
  return '';
}

export function sanitizeSquad(raw: unknown): Squad | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  const rawPlayers = Array.isArray(s.players) ? s.players.slice(0, 6) : [];
  let mode: SquadMode =
    typeof s.mode === 'string' && s.mode in SQUAD_MODES
      ? (s.mode as SquadMode)
      : 'squad4';

  if (rawPlayers.length > SQUAD_MODES[mode].count) {
    if (rawPlayers.length <= 2) mode = 'duo';
    else if (rawPlayers.length <= 4) mode = 'squad4';
    else if (rawPlayers.length <= 5) mode = 'squad5';
    else mode = 'squad6';
  }

  const targetCount = SQUAD_MODES[mode].count;
  const players: PlayerSlot[] = [];

  for (let i = 0; i < targetCount; i++) {
    const p =
      rawPlayers[i] && typeof rawPlayers[i] === 'object'
        ? (rawPlayers[i] as Record<string, unknown>)
        : {};

    let email = safeStr(p.email);
    let extra = safeStr(p.extra);

    // If migrating from older backup where email was stored inside extra
    if (!email && extra.includes('@') && !extra.includes(' ')) {
      email = extra;
      extra = '';
    }

    players.push({
      label: safeStr(p.label) || defaultPlayerLabel(i),
      ign: safeStr(p.ign),
      uid: safeStr(p.uid),
      phone: safeStr(p.phone),
      email,
      extra,
    });
  }

  return {
    id: safeStr(s.id) || generateSquadId(),
    name: safeStr(s.name),
    tag: safeStr(s.tag),
    game: safeStr(s.game),
    mode,
    collapsed: Boolean(s.collapsed),
    players,
    updatedAt: safeStr(s.updatedAt) || new Date().toISOString(),
  };
}

export const SAMPLE_SQUADS: Squad[] = [
  {
    id: 'sq_sample_ff_1',
    name: 'Phantom Strikers BD',
    tag: 'PSX',
    game: 'Free Fire MAX',
    mode: 'squad5',
    collapsed: false,
    updatedAt: new Date().toISOString(),
    players: [
      {
        label: 'Captain (IGL)',
        ign: 'PSX•TANVIR',
        uid: '2849105732',
        phone: '01715-892341',
        email: 'tanvir.igl@gmail.com',
        extra: 'Discord: tanvir_psx',
      },
      {
        label: 'Player 2 (Rusher)',
        ign: 'PSX•RAFIQ',
        uid: '5910284719',
        phone: '01842-661920',
        email: 'rafiq.ffmax@gmail.com',
        extra: 'Discord: rafiq99',
      },
      {
        label: 'Player 3 (Sniper)',
        ign: 'PSX•NAimul',
        uid: '3847192045',
        phone: '01911-482910',
        email: 'naimul.sniper@gmail.com',
        extra: 'Discord: naimul_awm',
      },
      {
        label: 'Player 4 (Support)',
        ign: 'PSX•SAJID',
        uid: '6728194012',
        phone: '01628-910443',
        email: 'sajid.esports@gmail.com',
        extra: 'Discord: sajid_sup',
      },
      {
        label: 'Substitute 1',
        ign: 'PSX•MAHIN',
        uid: '7819204911',
        phone: '01533-772819',
        email: 'mahin.sub@gmail.com',
        extra: 'Sub / Entry',
      },
    ],
  },
  {
    id: 'sq_sample_pubg_2',
    name: 'Apex Wolves',
    tag: 'APX',
    game: 'PUBG Mobile',
    mode: 'squad4',
    collapsed: true,
    updatedAt: new Date().toISOString(),
    players: [
      {
        label: 'Captain (IGL)',
        ign: 'APX×FARHAN',
        uid: '51829401928',
        phone: '01799-210482',
        email: 'farhan.pubgm@gmail.com',
        extra: 'Discord: farhan#1024',
      },
      {
        label: 'Player 2 (Assaulter)',
        ign: 'APX×SHUVO',
        uid: '52910482910',
        phone: '01814-509281',
        email: 'shuvo.gaming@gmail.com',
        extra: 'Discord: shuvo_op',
      },
      {
        label: 'Player 3 (Flanker)',
        ign: 'APX×ARAFAT',
        uid: '53019284712',
        phone: '01988-341092',
        email: 'arafat.apx@gmail.com',
        extra: 'Discord: arafat_bd',
      },
      {
        label: 'Player 4 (Support)',
        ign: 'APX×TAMIM',
        uid: '54918273645',
        phone: '01671-829104',
        email: 'tamim.squad@gmail.com',
        extra: 'Discord: tamim77',
      },
    ],
  },
];

export function loadSquads(): Squad[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(sanitizeSquad).filter((x): x is Squad => x !== null);
      }
    }
    const alreadySeeded = localStorage.getItem(SEEDED_FLAG_KEY);
    if (!alreadySeeded) {
      localStorage.setItem(SEEDED_FLAG_KEY, '1');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_SQUADS));
      return SAMPLE_SQUADS;
    }
    return [];
  } catch {
    return SAMPLE_SQUADS;
  }
}

export function saveSquads(squads: Squad[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(squads));
    localStorage.setItem(SEEDED_FLAG_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(trimmed);
      return true;
    } catch {
      // Fallback below
    }
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = trimmed;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;font-size:16px';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, trimmed.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function formatSquadForTournament(
  squad: Squad,
  preset: TournamentFormatPreset = 'whatsapp',
  options: FormatOptions = {
    includeIgn: true,
    includeUid: true,
    includePhone: true,
    includeEmail: true,
    includeExtra: true,
    onlyFilledPlayers: false,
  }
): string {
  const players = options.onlyFilledPlayers
    ? squad.players.filter(
        (p) =>
          p.ign.trim() ||
          p.uid.trim() ||
          p.phone.trim() ||
          p.email.trim() ||
          p.extra.trim()
      )
    : squad.players;

  const squadTitle = squad.name.trim() || 'Unnamed Squad';
  const tagPart = squad.tag?.trim() ? ` [${squad.tag.trim()}]` : '';
  const gameTitle = squad.game.trim() || 'Esports';
  const modeLabel = SQUAD_MODES[squad.mode]?.label || squad.mode;

  if (preset === 'uids_only') {
    const lines: string[] = [
      `${squadTitle}${tagPart} — ${gameTitle} (IGN & UID List)`,
    ];
    players.forEach((p, idx) => {
      const slot = p.label.trim() || defaultPlayerLabel(idx);
      const ign = p.ign.trim() || '—';
      const uid = p.uid.trim() || '—';
      lines.push(`${idx + 1}. ${ign} | UID: ${uid} (${slot})`);
    });
    return lines.join('\n');
  }

  if (preset === 'compact') {
    const lines: string[] = [`Team: ${squadTitle}${tagPart} (${gameTitle})`];
    players.forEach((p, idx) => {
      const parts: string[] = [];
      if (options.includeIgn && p.ign.trim()) parts.push(p.ign.trim());
      if (options.includeUid && p.uid.trim()) parts.push(`UID: ${p.uid.trim()}`);
      if (options.includePhone && p.phone.trim()) parts.push(`Ph: ${p.phone.trim()}`);
      if (options.includeEmail && p.email.trim()) parts.push(p.email.trim());
      if (options.includeExtra && p.extra.trim()) parts.push(p.extra.trim());
      const content = parts.length ? parts.join(' | ') : 'Empty Slot';
      lines.push(`${idx + 1}. ${p.label.trim() || defaultPlayerLabel(idx)}: ${content}`);
    });
    return lines.join('\n');
  }

  if (preset === 'csv') {
    const headers = ['Slot'];
    if (options.includeIgn) headers.push('IGN');
    if (options.includeUid) headers.push('UID');
    if (options.includePhone) headers.push('Phone');
    if (options.includeEmail) headers.push('Email');
    if (options.includeExtra) headers.push('Extra');
    const rows = [headers.join(',')];
    players.forEach((p, idx) => {
      const row = [p.label.trim() || defaultPlayerLabel(idx)];
      if (options.includeIgn) row.push(p.ign.trim());
      if (options.includeUid) row.push(p.uid.trim());
      if (options.includePhone) row.push(p.phone.trim());
      if (options.includeEmail) row.push(p.email.trim());
      if (options.includeExtra) row.push(p.extra.trim());
      rows.push(row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','));
    });
    return rows.join('\n');
  }

  if (preset === 'discord') {
    const lines: string[] = [
      `**Team Name:** ${squadTitle}${tagPart}`,
      `**Game / Mode:** ${gameTitle} · ${modeLabel}`,
    ];
    players.forEach((p, idx) => {
      lines.push('');
      lines.push(`**${idx + 1}. ${p.label.trim() || defaultPlayerLabel(idx)}**`);
      if (options.includeIgn && p.ign.trim()) lines.push(`> IGN: \`${p.ign.trim()}\``);
      if (options.includeUid && p.uid.trim()) lines.push(`> UID: \`${p.uid.trim()}\``);
      if (options.includePhone && p.phone.trim())
        lines.push(`> WhatsApp/Phone: \`${p.phone.trim()}\``);
      if (options.includeEmail && p.email.trim())
        lines.push(`> Email: \`${p.email.trim()}\``);
      if (options.includeExtra && p.extra.trim())
        lines.push(`> Info: ${p.extra.trim()}`);
    });
    return lines.join('\n');
  }

  // Default: 'whatsapp' (also backward compatible with original squadText)
  const lines: string[] = [`Squad: ${squadTitle}${tagPart}`];
  if (squad.game.trim()) lines.push(`Game: ${squad.game.trim()}`);
  lines.push(`Mode: ${modeLabel}`);

  players.forEach((p, idx) => {
    lines.push('', p.label.trim() || defaultPlayerLabel(idx));
    if (options.includeIgn && p.ign.trim()) lines.push(`IGN: ${p.ign.trim()}`);
    if (options.includeUid && p.uid.trim()) lines.push(`UID: ${p.uid.trim()}`);
    if (options.includePhone && p.phone.trim()) lines.push(`Phone: ${p.phone.trim()}`);
    if (options.includeEmail && p.email.trim()) lines.push(`Email: ${p.email.trim()}`);
    if (options.includeExtra && p.extra.trim()) lines.push(`Info: ${p.extra.trim()}`);
  });

  return lines.join('\n');
}

/**
 * Smart parser that extracts IGN, UID, Phone, Email, and Extra info
 * from a messy WhatsApp / Messenger / Discord message sent by a teammate.
 */
export function parsePlayerMessage(rawText: string): Partial<PlayerSlot> {
  const result: Partial<PlayerSlot> = {};
  const lines = rawText
    .split(/\r?\n|,|;/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    // Check explicit key: value pairs first
    const kvMatch = line.match(/^([a-zA-Z\s\-_/]+)\s*[:=-]\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim().toLowerCase();
      const val = kvMatch[2].trim();
      if (!val) continue;

      if (
        key.includes('ign') ||
        key.includes('in-game') ||
        key.includes('ingame') ||
        key === 'name' ||
        key.includes('player name') ||
        key.includes('game name')
      ) {
        result.ign = val;
        continue;
      }
      if (
        key.includes('uid') ||
        key.includes('id') ||
        key.includes('character id') ||
        key.includes('player id')
      ) {
        if (!key.includes('discord') && !key.includes('nid')) {
          result.uid = val;
          continue;
        }
      }
      if (
        key.includes('phone') ||
        key.includes('whatsapp') ||
        key.includes('wa') ||
        key.includes('mobile') ||
        key.includes('number') ||
        key.includes('num') ||
        key.includes('contact')
      ) {
        result.phone = val;
        continue;
      }
      if (key.includes('mail') || key.includes('gmail')) {
        result.email = val;
        continue;
      }
      if (
        key.includes('discord') ||
        key.includes('nid') ||
        key.includes('extra') ||
        key.includes('info') ||
        key.includes('device') ||
        key.includes('real name')
      ) {
        result.extra = result.extra ? `${result.extra} | ${key}: ${val}` : `${kvMatch[1].trim()}: ${val}`;
        continue;
      }
    }

    // Fallback pattern recognition on unlabelled tokens
    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch && !result.email) {
      result.email = emailMatch[0];
    }

    // BD / IN / International phone numbers (e.g., +88017..., 017..., 10-11 digits starting with 01 or +)
    const phoneMatch = line.match(/(?:\+?880|0)1[3-9]\d{2}[-\s]?\d{6}\b|\+\d{10,14}\b/);
    if (phoneMatch && !result.phone) {
      result.phone = phoneMatch[0];
    }

    // Game UID (typically 7 to 12 digits, not matching the phone number)
    const digitsMatches = line.match(/\b\d{7,13}\b/g);
    if (digitsMatches) {
      for (const d of digitsMatches) {
        const cleanPhone = (result.phone || '').replace(/\D/g, '');
        if (d !== cleanPhone && !cleanPhone.endsWith(d) && !result.uid) {
          result.uid = d;
        }
      }
    }

    // If line has no email/phone/uid and looks like an IGN
    if (
      !result.ign &&
      !emailMatch &&
      !phoneMatch &&
      !/^\d+$/.test(line) &&
      line.length >= 2 &&
      line.length <= 32
    ) {
      result.ign = line;
    }
  }

  return result;
}
