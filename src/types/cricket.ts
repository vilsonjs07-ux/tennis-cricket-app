// TennisScore - Professional Tennis Ball Cricket Scoring Engine & Models
// Follows all official cricket laws except LBW rule (No LBW in Tennis Ball Cricket)

export type MatchFormat = 't10' | 't12' | 't15' | 't20' | 'tournament' | 'bilateral' | 'custom';

export type BallType = 'tennis_heavy' | 'tennis_light' | 'tape_ball' | 'rubber';

export type DismissalType =
  | 'bowled'
  | 'caught'
  | 'caught_behind'
  | 'caught_and_bowled'
  | 'run_out'
  | 'stumped'
  | 'hit_wicket'
  | 'retired_hurt'
  | 'retired_out'
  | 'obstructing_field'
  | 'timed_out';
  // NOTE: LBW (Leg Before Wicket) is explicitly disabled in Tennis Ball Cricket

export type ExtraType = 'none' | 'wide' | 'no_ball' | 'bye' | 'leg_bye' | 'penalty';

export interface Player {
  id: string;
  name: string;
  jerseyNumber?: number;
  role?: 'batter' | 'bowler' | 'all_rounder' | 'wicketkeeper';
  isCaptain?: boolean;
  isWicketkeeper?: boolean;
  avatarColor?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  color: string;
  players: Player[];
}

export interface TennisCricketRules {
  oversPerInnings: number; // e.g. 8, 10, 12, 20
  ballsPerOver: number; // 6 legal balls
  maxOversPerBowler: number; // e.g. 2 overs in 10-over match
  allowConsecutiveOvers: boolean; // false: bowlers must alternate overs (official law)
  
  // Standard Cricket Extras
  wideRuns: number; // default 1
  wideReball: boolean; // default true (wide must be re-bowled)
  noBallRuns: number; // default 1
  noBallReball: boolean; // default true (no-ball must be re-bowled)
  freeHitAfterNoBall: boolean; // default true (Free hit delivery following a no-ball)
  allowByes: boolean; // default true (official cricket law)
  allowLegByes: boolean; // default true (official cricket law)
  
  // Tennis Ball Specific Convention
  allowLBW: boolean; // FALSE: Tennis ball cricket has NO LBW
  powerplayOvers: number; // e.g. 2 overs (fielding restrictions)
  
  // Wicket Limits
  maxWickets?: number; // default playersPerTeam - 1 (all out)
}

// Backwards compatibility alias
export type GullyRules = TennisCricketRules;

export interface MatchSettings {
  title: string;
  format: MatchFormat;
  date: string;
  location?: string;
  ballType: BallType;
  playersPerTeam: number;
  oversPerInnings: number;
  inningsPerTeam: number; // default 1
  rules: TennisCricketRules;
}

export interface WicketDetail {
  dismissalType: DismissalType;
  dismissedPlayerId: string;
  dismissedPlayerName: string;
  bowlerPlayerId?: string;
  bowlerPlayerName?: string;
  fielderPlayerId?: string;
  fielderPlayerName?: string;
  runsBeforeDismissal: number; // for run-outs: runs completed before run-out
}

export interface DeliveryEvent {
  id: string;
  matchId: string;
  inningsNumber: 1 | 2;
  overNumber: number; // 0-indexed over count (0 = 1st over)
  ballInOver: number; // 1-indexed ball in current over (1 to 6)
  legalBallNumber: number; // overall legal ball in innings
  isLegalDelivery: boolean;
  
  bowlerId: string;
  bowlerName: string;
  strikerId: string;
  strikerName: string;
  nonStrikerId: string;
  nonStrikerName: string;
  
  batterRuns: number; // runs made by striker (0, 1, 2, 3, 4, 6)
  extraType: ExtraType;
  extraRuns: number; // runs from extras (wide=1, no-ball=1, byes=X, etc.)
  totalRuns: number; // batterRuns + extraRuns
  
  isBoundaryFour: boolean;
  isBoundarySix: boolean;
  isDotBall: boolean;
  isFreeHit: boolean; // was this delivery bowled as a Free Hit?
  willBeFreeHitNext: boolean; // did this delivery trigger a Free Hit next?
  isPowerplay: boolean;
  
  wicket?: WicketDetail;
  
  // State changes
  strikeRotated: boolean;
  newStrikerId: string;
  newNonStrikerId: string;
  
  commentary: string;
  timestamp: number;
}

export interface BatterStats {
  playerId: string;
  playerName: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissalText?: string;
  dismissalType?: DismissalType;
  bowlerName?: string;
  fielderName?: string;
  battingPosition: number;
}

export interface BowlerStats {
  playerId: string;
  playerName: string;
  legalBallsBowled: number; // for overs calculation
  oversFormatted: string; // e.g. "2.4"
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  dots: number;
  wides: number;
  noBalls: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  teamRuns: number;
  legalBalls: number;
  oversFormatted: string;
  playerOutName: string;
  playerOutId: string;
}

export interface OverSummary {
  overNumber: number; // 0-indexed
  bowlerId: string;
  bowlerName: string;
  runsConceded: number;
  wicketsTaken: number;
  balls: DeliveryEvent[];
  isMaiden: boolean;
  totalAtEndOfOver: number;
  wicketsAtEndOfOver: number;
}

export interface InningsState {
  inningsNumber: 1 | 2;
  battingTeamId: string;
  battingTeamName: string;
  bowlingTeamId: string;
  bowlingTeamName: string;
  
  totalRuns: number;
  totalWickets: number;
  legalDeliveries: number;
  oversFormatted: string; // e.g. "8.4"
  currentOverLegalDeliveries: number;
  
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
  previousBowlerId?: string;
  
  batters: Record<string, BatterStats>;
  bowlers: Record<string, BowlerStats>;
  battingOrder: string[];
  
  deliveries: DeliveryEvent[];
  undoneDeliveries: DeliveryEvent[]; // for Redo
  fallOfWickets: FallOfWicket[];
  oversSummaries: OverSummary[];
  
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    penalties: number;
    total: number;
  };
  
  isInningsComplete: boolean;
  completionReason?: 'overs_complete' | 'all_out' | 'target_reached' | 'declared';
  targetRuns?: number; // for 2nd innings
  runsNeeded?: number; // for 2nd innings
  ballsRemaining?: number; // for 2nd innings
  requiredRunRate?: number; // for 2nd innings
  currentRunRate: number;
  isFreeHitActive: boolean;
}

export interface MatchResult {
  winnerTeamId?: string;
  winnerTeamName?: string;
  isTie: boolean;
  isDraw: boolean;
  isAbandoned: boolean;
  marginText: string; // e.g. "Royal Strikers won by 14 runs" or "won by 4 wickets"
  summary: string;
  manOfTheMatchPlayerId?: string;
  manOfTheMatchName?: string;
  manOfTheMatchReason?: string;
  bestBatterName?: string;
  bestBatterStat?: string;
  bestBowlerName?: string;
  bestBowlerStat?: string;
}

export interface Match {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: 'setup' | 'toss' | 'innings1' | 'innings_break' | 'innings2' | 'completed' | 'abandoned';
  
  settings: MatchSettings;
  teamA: Team;
  teamB: Team;
  
  tossWinnerTeamId?: string;
  tossChoice?: 'bat' | 'bowl';
  
  currentInningsNumber: 1 | 2;
  innings1?: InningsState;
  innings2?: InningsState;
  
  result?: MatchResult;
  isCloudSynced?: boolean;
  shareToken?: string;
}
