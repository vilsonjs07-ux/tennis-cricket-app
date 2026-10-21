import { create } from 'zustand';
import {
  DismissalType,
  ExtraType,
  InningsState,
  Match,
  MatchResult,
  MatchSettings,
  Player,
  Team,
} from '../types/cricket';
import {
  calculateMatchResult,
  changeBowler,
  createInitialInnings,
  DEFAULT_GULLY_RULES,
  DEFAULT_TENNIS_CRICKET_RULES,
  recordDelivery,
  ScoreInput,
  swapStrike,
  undoLastDelivery as engineUndo,
} from '../engine/scoringEngine';
import { storage } from '../services/storage';

export type AppTab = 'home' | 'wizard' | 'live' | 'scorecard' | 'history' | 'stats' | 'teams' | 'rules';

interface MatchStoreState {
  activeTab: AppTab;
  currentMatch: Match | null;
  matches: Match[];
  savedTeams: Team[];
  
  // Wizard state
  wizardStep: number;
  wizardSettings: Partial<MatchSettings>;
  wizardTeamA: Partial<Team>;
  wizardTeamB: Partial<Team>;
  
  // App navigation
  setActiveTab: (tab: AppTab) => void;
  setWizardStep: (step: number) => void;
  updateWizardSettings: (settings: Partial<MatchSettings>) => void;
  updateWizardTeamA: (team: Partial<Team>) => void;
  updateWizardTeamB: (team: Partial<Team>) => void;
  
  // Match Lifecycle
  initNewMatchWizard: () => void;
  finalizeMatchSetup: (settings: MatchSettings, teamA: Team, teamB: Team) => void;
  recordToss: (winnerTeamId: string, choice: 'bat' | 'bowl') => void;
  startFirstInnings: (strikerId: string, nonStrikerId: string, bowlerId: string) => void;
  startSecondInnings: (strikerId: string, nonStrikerId: string, bowlerId: string) => void;
  
  // Live Scoring
  scoreBall: (input: ScoreInput) => { isOverEnded: boolean; isInningsEnded: boolean; isMatchEnded: boolean };
  setBowler: (bowlerId: string) => void;
  swapBattersStrike: () => void;
  undoDelivery: () => void;
  endMatchManually: () => void;
  
  // Storage & Management
  loadMatchById: (id: string) => void;
  deleteMatchById: (id: string) => void;
  addNewTeam: (team: Team) => void;
  updateTeam: (team: Team) => void;
}

export const useMatchStore = create<MatchStoreState>((set, get) => {
  // Initial load from local persistence
  const savedMatches = storage.getMatches();
  const savedTeams = storage.getTeams();
  const activeId = storage.getActiveMatchId();
  const activeMatch = activeId ? savedMatches.find(m => m.id === activeId) || null : null;

  return {
    activeTab: activeMatch && activeMatch.status !== 'completed' ? 'live' : 'home',
    currentMatch: activeMatch,
    matches: savedMatches,
    savedTeams,
    
    wizardStep: 1,
    wizardSettings: {
      title: 'Tennis Premier League Match',
      format: 't10',
      date: new Date().toISOString().split('T')[0],
      location: 'Turf Ground',
      ballType: 'tennis_heavy',
      playersPerTeam: 8,
      oversPerInnings: 8,
      inningsPerTeam: 1,
      rules: { ...DEFAULT_TENNIS_CRICKET_RULES },
    },
    wizardTeamA: {
      name: 'Royal Strikers',
      shortName: 'RS',
      emoji: '⚡',
      color: '#10B981',
      players: savedTeams[0]?.players || [],
    },
    wizardTeamB: {
      name: 'Thunder Titans',
      shortName: 'TT',
      emoji: '🔥',
      color: '#3B82F6',
      players: savedTeams[1]?.players || [],
    },

    setActiveTab: (tab: AppTab) => set({ activeTab: tab }),
    setWizardStep: (step: number) => set({ wizardStep: step }),

    updateWizardSettings: (settings: Partial<MatchSettings>) =>
      set(state => ({ wizardSettings: { ...state.wizardSettings, ...settings } })),

    updateWizardTeamA: (team: Partial<Team>) =>
      set(state => ({ wizardTeamA: { ...state.wizardTeamA, ...team } })),

    updateWizardTeamB: (team: Partial<Team>) =>
      set(state => ({ wizardTeamB: { ...state.wizardTeamB, ...team } })),

    initNewMatchWizard: () => {
      const teams = get().savedTeams;
      set({
        wizardStep: 1,
        activeTab: 'wizard',
        wizardSettings: {
          title: `Match #${get().matches.length + 1} - Tennis Cup`,
          format: 't10',
          date: new Date().toISOString().split('T')[0],
          location: 'Cricket Ground',
          ballType: 'tennis_heavy',
          playersPerTeam: 8,
          oversPerInnings: 8,
          inningsPerTeam: 1,
          rules: { ...DEFAULT_TENNIS_CRICKET_RULES },
        },
        wizardTeamA: teams[0] ? { ...teams[0] } : { name: 'Royal Strikers', emoji: '⚡', color: '#10B981', players: [] },
        wizardTeamB: teams[1] ? { ...teams[1] } : { name: 'Thunder Titans', emoji: '🔥', color: '#3B82F6', players: [] },
      });
    },

    finalizeMatchSetup: (settings: MatchSettings, teamA: Team, teamB: Team) => {
      const matchId = `match_${Date.now()}`;
      const newMatch: Match = {
        id: matchId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'toss',
        settings,
        teamA,
        teamB,
        currentInningsNumber: 1,
      };

      storage.saveMatch(newMatch);
      storage.setActiveMatchId(matchId);

      set(state => ({
        currentMatch: newMatch,
        matches: [newMatch, ...state.matches.filter(m => m.id !== matchId)],
        activeTab: 'live',
      }));
    },

    recordToss: (winnerTeamId: string, choice: 'bat' | 'bowl') => {
      const match = get().currentMatch;
      if (!match) return;

      const updated: Match = {
        ...match,
        tossWinnerTeamId: winnerTeamId,
        tossChoice: choice,
        updatedAt: Date.now(),
      };

      storage.saveMatch(updated);
      set({ currentMatch: updated });
    },

    startFirstInnings: (strikerId: string, nonStrikerId: string, bowlerId: string) => {
      const match = get().currentMatch;
      if (!match) return;

      // Determine batting & bowling team from toss
      const isTeamAWinner = match.tossWinnerTeamId === match.teamA.id;
      const battingFirstIsTeamA =
        (isTeamAWinner && match.tossChoice === 'bat') ||
        (!isTeamAWinner && match.tossChoice === 'bowl');

      const battingTeam = battingFirstIsTeamA ? match.teamA : match.teamB;
      const bowlingTeam = battingFirstIsTeamA ? match.teamB : match.teamA;

      const innings1 = createInitialInnings(
        1,
        battingTeam,
        bowlingTeam,
        strikerId,
        nonStrikerId,
        bowlerId,
        match.settings.rules
      );

      const updated: Match = {
        ...match,
        status: 'innings1',
        currentInningsNumber: 1,
        innings1,
        updatedAt: Date.now(),
      };

      storage.saveMatch(updated);
      set({ currentMatch: updated });
    },

    startSecondInnings: (strikerId: string, nonStrikerId: string, bowlerId: string) => {
      const match = get().currentMatch;
      if (!match || !match.innings1) return;

      const target = match.innings1.totalRuns + 1;
      const battingTeam = match.innings1.battingTeamId === match.teamA.id ? match.teamB : match.teamA;
      const bowlingTeam = match.innings1.battingTeamId === match.teamA.id ? match.teamA : match.teamB;

      const innings2 = createInitialInnings(
        2,
        battingTeam,
        bowlingTeam,
        strikerId,
        nonStrikerId,
        bowlerId,
        match.settings.rules,
        target
      );

      const updated: Match = {
        ...match,
        status: 'innings2',
        currentInningsNumber: 2,
        innings2,
        updatedAt: Date.now(),
      };

      storage.saveMatch(updated);
      set({ currentMatch: updated });
    },

    scoreBall: (input: ScoreInput) => {
      const match = get().currentMatch;
      if (!match) throw new Error('No active match');

      const currentInningsNum = match.currentInningsNumber;
      const currentInnings = currentInningsNum === 1 ? match.innings1 : match.innings2;
      if (!currentInnings) throw new Error('Innings not started');

      const battingTeam = currentInnings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
      const bowlingTeam = currentInnings.battingTeamId === match.teamA.id ? match.teamB : match.teamA;

      const { nextState, isOverEnded, isInningsEnded } = recordDelivery(
        currentInnings,
        input,
        match.settings.rules,
        battingTeam.players,
        bowlingTeam.players
      );

      let nextStatus = match.status;
      let matchResult: MatchResult | undefined = match.result;
      let isMatchEnded = false;

      if (currentInningsNum === 1) {
        if (isInningsEnded) {
          nextStatus = 'innings_break';
        }
      } else {
        // 2nd innings
        if (isInningsEnded) {
          nextStatus = 'completed';
          isMatchEnded = true;
          matchResult = calculateMatchResult(
            match.teamA,
            match.teamB,
            match.innings1!,
            nextState,
            match.tossWinnerTeamId!,
            match.tossChoice!
          );
        }
      }

      const updatedMatch: Match = {
        ...match,
        status: nextStatus,
        result: matchResult,
        updatedAt: Date.now(),
        ...(currentInningsNum === 1 ? { innings1: nextState } : { innings2: nextState }),
      };

      storage.saveMatch(updatedMatch);

      set(state => ({
        currentMatch: updatedMatch,
        matches: state.matches.map(m => (m.id === updatedMatch.id ? updatedMatch : m)),
      }));

      return { isOverEnded, isInningsEnded, isMatchEnded };
    },

    setBowler: (bowlerId: string) => {
      const match = get().currentMatch;
      if (!match) return;

      const innNum = match.currentInningsNumber;
      const inn = innNum === 1 ? match.innings1 : match.innings2;
      if (!inn) return;

      const bowlingTeam = inn.battingTeamId === match.teamA.id ? match.teamB : match.teamA;
      const updatedInn = changeBowler(inn, bowlerId, bowlingTeam.players, match.settings.rules);

      const updatedMatch: Match = {
        ...match,
        updatedAt: Date.now(),
        ...(innNum === 1 ? { innings1: updatedInn } : { innings2: updatedInn }),
      };

      storage.saveMatch(updatedMatch);
      set({ currentMatch: updatedMatch });
    },

    swapBattersStrike: () => {
      const match = get().currentMatch;
      if (!match) return;

      const innNum = match.currentInningsNumber;
      const inn = innNum === 1 ? match.innings1 : match.innings2;
      if (!inn) return;

      const updatedInn = swapStrike(inn);
      const updatedMatch: Match = {
        ...match,
        updatedAt: Date.now(),
        ...(innNum === 1 ? { innings1: updatedInn } : { innings2: updatedInn }),
      };

      storage.saveMatch(updatedMatch);
      set({ currentMatch: updatedMatch });
    },

    undoDelivery: () => {
      const match = get().currentMatch;
      if (!match) return;

      const innNum = match.currentInningsNumber;
      const currentInn = innNum === 1 ? match.innings1 : match.innings2;
      if (!currentInn || currentInn.deliveries.length === 0) return;

      const battingTeam = currentInn.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
      const bowlingTeam = currentInn.battingTeamId === match.teamA.id ? match.teamB : match.teamA;

      // Reconstruct original initial state
      const targetRuns = innNum === 2 ? match.innings1!.totalRuns + 1 : undefined;
      const firstDelivery = currentInn.deliveries[0];
      const initialInn = createInitialInnings(
        innNum,
        battingTeam,
        bowlingTeam,
        firstDelivery.strikerId,
        firstDelivery.nonStrikerId,
        firstDelivery.bowlerId,
        match.settings.rules,
        targetRuns
      );

      const undoneInn = engineUndo(
        initialInn,
        currentInn,
        match.settings.rules,
        battingTeam.players,
        bowlingTeam.players
      );

      const updatedMatch: Match = {
        ...match,
        status: innNum === 1 ? 'innings1' : 'innings2',
        result: undefined, // Clear completed result if undid winning ball
        updatedAt: Date.now(),
        ...(innNum === 1 ? { innings1: undoneInn } : { innings2: undoneInn }),
      };

      storage.saveMatch(updatedMatch);
      set(state => ({
        currentMatch: updatedMatch,
        matches: state.matches.map(m => (m.id === updatedMatch.id ? updatedMatch : m)),
      }));
    },

    endMatchManually: () => {
      const match = get().currentMatch;
      if (!match) return;

      const inn1 = match.innings1;
      const inn2 = match.innings2;

      let result: MatchResult;
      if (inn1 && inn2) {
        result = calculateMatchResult(
          match.teamA,
          match.teamB,
          inn1,
          inn2,
          match.tossWinnerTeamId || match.teamA.id,
          match.tossChoice || 'bat'
        );
      } else {
        result = {
          isTie: false,
          isDraw: false,
          isAbandoned: true,
          marginText: 'Match Concluded Manually',
          summary: 'Match ended early by scorer',
        };
      }

      const updatedMatch: Match = {
        ...match,
        status: 'completed',
        result,
        updatedAt: Date.now(),
      };

      storage.saveMatch(updatedMatch);
      set(state => ({
        currentMatch: updatedMatch,
        matches: state.matches.map(m => (m.id === updatedMatch.id ? updatedMatch : m)),
      }));
    },

    loadMatchById: (id: string) => {
      const match = storage.getMatch(id);
      if (match) {
        storage.setActiveMatchId(id);
        set({
          currentMatch: match,
          activeTab: match.status === 'completed' ? 'scorecard' : 'live',
        });
      }
    },

    deleteMatchById: (id: string) => {
      storage.deleteMatch(id);
      set(state => ({
        matches: state.matches.filter(m => m.id !== id),
        currentMatch: state.currentMatch?.id === id ? null : state.currentMatch,
        activeTab: state.currentMatch?.id === id ? 'home' : state.activeTab,
      }));
    },

    addNewTeam: (team: Team) => {
      storage.addTeam(team);
      set(state => ({
        savedTeams: [...state.savedTeams.filter(t => t.id !== team.id), team],
      }));
    },

    updateTeam: (team: Team) => {
      storage.addTeam(team);
      set(state => ({
        savedTeams: state.savedTeams.map(t => (t.id === team.id ? team : t)),
      }));
    },
  };
});
