import { Match, Player, Team } from '../types/cricket';

const STORAGE_KEYS = {
  ACTIVE_MATCH_ID: 'gullyscore_active_match_id',
  MATCHES: 'gullyscore_matches_v1',
  TEAMS: 'gullyscore_teams_v1',
  PLAYERS: 'gullyscore_players_v1',
  SETTINGS: 'gullyscore_settings_v1',
};

// Default sample teams is empty so users can start with fresh clean teams
export const DEFAULT_TEAMS: Team[] = [];

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
        const parsed: Team[] = JSON.parse(data);
        // Exclude legacy mock sample teams if previously saved
        return parsed.filter(t => !['team_strikers', 'team_blasters', 'team_kings'].includes(t.id));
      }
      return [];
    } catch (e) {
      console.error('Failed to load teams', e);
      return [];
    }
  },

  clearAllTeams(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.TEAMS);
    } catch (e) {
      console.error('Failed to clear teams', e);
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
