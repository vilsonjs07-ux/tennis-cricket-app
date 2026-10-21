import { Match, Player, Team } from '../types/cricket';

const STORAGE_KEYS = {
  ACTIVE_MATCH_ID: 'gullyscore_active_match_id',
  MATCHES: 'gullyscore_matches_v1',
  TEAMS: 'gullyscore_teams_v1',
  PLAYERS: 'gullyscore_players_v1',
  SETTINGS: 'gullyscore_settings_v1',
};

// Default sample teams for first time users
export const DEFAULT_TEAMS: Team[] = [
  {
    id: 'team_strikers',
    name: 'Gully Strikers',
    shortName: 'GS',
    emoji: '⚡',
    color: '#10B981', // Turf emerald
    players: [
      { id: 'p_virat', name: 'Virat S.', jerseyNumber: 18, role: 'batter', isCaptain: true },
      { id: 'p_rohit', name: 'Rohit K.', jerseyNumber: 45, role: 'batter' },
      { id: 'p_surya', name: 'Surya Y.', jerseyNumber: 63, role: 'all_rounder' },
      { id: 'p_hardik', name: 'Hardik P.', jerseyNumber: 33, role: 'all_rounder' },
      { id: 'p_rishabh', name: 'Rishabh P.', jerseyNumber: 17, role: 'wicketkeeper', isWicketkeeper: true },
      { id: 'p_bumrah', name: 'Jasprit B.', jerseyNumber: 93, role: 'bowler' },
    ],
  },
  {
    id: 'team_blasters',
    name: 'Terrace Blasters',
    shortName: 'TB',
    emoji: '🔥',
    color: '#F59E0B', // Amber flame
    players: [
      { id: 'p_babar', name: 'Aarav B.', jerseyNumber: 56, role: 'batter', isCaptain: true },
      { id: 'p_rizwan', name: 'Kabir R.', jerseyNumber: 16, role: 'wicketkeeper', isWicketkeeper: true },
      { id: 'p_shami', name: 'Dev S.', jerseyNumber: 11, role: 'bowler' },
      { id: 'p_siraj', name: 'Ishaan M.', jerseyNumber: 73, role: 'bowler' },
      { id: 'p_kuldeep', name: 'Arjun K.', jerseyNumber: 23, role: 'bowler' },
      { id: 'p_jadeja', name: 'Rishi J.', jerseyNumber: 8, role: 'all_rounder' },
    ],
  },
  {
    id: 'team_kings',
    name: 'Street Kings',
    shortName: 'SK',
    emoji: '👑',
    color: '#8B5CF6', // Royal purple
    players: [
      { id: 'p_k1', name: 'Sameer K.', jerseyNumber: 7, role: 'all_rounder', isCaptain: true },
      { id: 'p_k2', name: 'Aditya P.', jerseyNumber: 10, role: 'batter' },
      { id: 'p_k3', name: 'Nikhil R.', jerseyNumber: 12, role: 'bowler' },
      { id: 'p_k4', name: 'Tanmay V.', jerseyNumber: 99, role: 'wicketkeeper', isWicketkeeper: true },
    ],
  },
];

export const storage = {
  // Matches
  getMatches(): Match[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load matches from localStorage', e);
      return [];
    }
  },

  saveMatches(matches: Match[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    } catch (e) {
      console.error('Failed to save matches to localStorage', e);
    }
  },

  saveMatch(match: Match): void {
    const matches = this.getMatches();
    const index = matches.findIndex(m => m.id === match.id);
    if (index >= 0) {
      matches[index] = match;
    } else {
      matches.unshift(match);
    }
    this.saveMatches(matches);
  },

  getMatch(id: string): Match | undefined {
    return this.getMatches().find(m => m.id === id);
  },

  deleteMatch(id: string): void {
    const matches = this.getMatches().filter(m => m.id !== id);
    this.saveMatches(matches);
    if (this.getActiveMatchId() === id) {
      this.setActiveMatchId(null);
    }
  },

  // Active Match
  getActiveMatchId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_MATCH_ID);
  },

  setActiveMatchId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MATCH_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_MATCH_ID);
    }
  },

  // Teams
  getTeams(): Team[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
      if (data) {
        return JSON.parse(data);
      }
      // Seed default teams if empty
      this.saveTeams(DEFAULT_TEAMS);
      return DEFAULT_TEAMS;
    } catch (e) {
      console.error('Failed to load teams', e);
      return DEFAULT_TEAMS;
    }
  },

  saveTeams(teams: Team[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    } catch (e) {
      console.error('Failed to save teams', e);
    }
  },

  addTeam(team: Team): void {
    const teams = this.getTeams();
    const idx = teams.findIndex(t => t.id === team.id);
    if (idx >= 0) {
      teams[idx] = team;
    } else {
      teams.push(team);
    }
    this.saveTeams(teams);
  },

  // Export / Import
  exportAllData(): string {
    const data = {
      matches: this.getMatches(),
      teams: this.getTeams(),
      version: '1.0',
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.matches && Array.isArray(data.matches)) {
        this.saveMatches(data.matches);
      }
      if (data.teams && Array.isArray(data.teams)) {
        this.saveTeams(data.teams);
      }
      return true;
    } catch (e) {
      console.error('Invalid import data', e);
      return false;
    }
  },
};
