export type SquadMode = 'solo' | 'duo' | 'squad4' | 'squad5' | 'squad6';

export interface PlayerSlot {
  label: string;
  ign: string;
  uid: string;
  phone: string;
  email: string;
  extra: string;
}

export interface Squad {
  id: string;
  name: string;
  tag?: string;
  game: string;
  mode: SquadMode;
  collapsed: boolean;
  players: PlayerSlot[];
  updatedAt?: string;
}

export type ActiveTab = 'squads' | 'quickfill' | 'format' | 'directory';

export type TournamentFormatPreset =
  | 'whatsapp'
  | 'discord'
  | 'compact'
  | 'uids_only'
  | 'csv';

export interface FormatOptions {
  includeIgn: boolean;
  includeUid: boolean;
  includePhone: boolean;
  includeEmail: boolean;
  includeExtra: boolean;
  onlyFilledPlayers: boolean;
}

export const SQUAD_MODES: Record<
  SquadMode,
  { count: number; label: string; shortLabel: string }
> = {
  solo: { count: 1, label: 'Solo (1)', shortLabel: 'Solo' },
  duo: { count: 2, label: 'Duo (2)', shortLabel: 'Duo' },
  squad4: { count: 4, label: 'Squad (4)', shortLabel: '4v4 Squad' },
  squad5: { count: 5, label: 'Squad + Sub (5)', shortLabel: '5 Players' },
  squad6: { count: 6, label: 'Full Roster (6)', shortLabel: '6 Players' },
};

export const POPULAR_GAMES = [
  'Free Fire MAX',
  'Free Fire',
  'PUBG Mobile',
  'BGMI',
  'Valorant',
  'COD Mobile',
  'Mobile Legends',
  'eFootball',
];
