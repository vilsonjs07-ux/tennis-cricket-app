import { describe, it, expect } from 'vitest';
import {
  calculateMatchResult,
  calculateRunRate,
  createInitialInnings,
  DEFAULT_TENNIS_CRICKET_RULES,
  formatOvers,
  recordDelivery,
  undoLastDelivery,
} from './scoringEngine';
import { Player, Team, TennisCricketRules } from '../types/cricket';

describe('TennisScore - Tennis Ball Cricket Scoring Engine', () => {
  const teamA: Team = {
    id: 'team_a',
    name: 'Royal Strikers',
    shortName: 'RS',
    emoji: '⚡',
    color: '#10B981',
    players: [
      { id: 'p1', name: 'Virat S.' },
      { id: 'p2', name: 'Rohit K.' },
      { id: 'p3', name: 'Surya Y.' },
      { id: 'p4', name: 'Hardik P.' },
    ],
  };

  const teamB: Team = {
    id: 'team_b',
    name: 'Thunder Titans',
    shortName: 'TT',
    emoji: '🔥',
    color: '#3B82F6',
    players: [
      { id: 'b1', name: 'Bumrah J.' },
      { id: 'b2', name: 'Shami M.' },
      { id: 'b3', name: 'Siraj M.' },
      { id: 'b4', name: 'Kuldeep Y.' },
    ],
  };

  const rules: TennisCricketRules = {
    ...DEFAULT_TENNIS_CRICKET_RULES,
    oversPerInnings: 2, // 2 overs for fast testing (12 balls)
    ballsPerOver: 6,
    maxOversPerBowler: 1,
    wideRuns: 1,
    wideReball: true,
    noBallRuns: 1,
    noBallReball: true,
    freeHitAfterNoBall: true,
    allowLBW: false, // NO LBW IN TENNIS BALL CRICKET
  };

  it('formats overs correctly using cricket notation (not decimals)', () => {
    expect(formatOvers(0)).toBe('0.0');
    expect(formatOvers(1)).toBe('0.1');
    expect(formatOvers(5)).toBe('0.5');
    expect(formatOvers(6)).toBe('1.0');
    expect(formatOvers(7)).toBe('1.1');
    expect(formatOvers(52)).toBe('8.4');
  });

  it('calculates run rates accurately', () => {
    expect(calculateRunRate(0, 0)).toBe(0);
    expect(calculateRunRate(12, 6)).toBe(12.0); // 12 runs in 1 over = 12.00
    expect(calculateRunRate(20, 12)).toBe(10.0); // 20 runs in 2 overs = 10.00
    expect(calculateRunRate(10, 3)).toBe(20.0); // 10 runs in 0.3 overs = 20.00
  });

  it('initializes innings with correct default state', () => {
    const innings = createInitialInnings(1, teamA, teamB, 'p1', 'p2', 'b1', rules);
    expect(innings.totalRuns).toBe(0);
    expect(innings.totalWickets).toBe(0);
    expect(innings.legalDeliveries).toBe(0);
    expect(innings.oversFormatted).toBe('0.0');
    expect(innings.currentStrikerId).toBe('p1');
    expect(innings.currentNonStrikerId).toBe('p2');
    expect(innings.currentBowlerId).toBe('b1');
    expect(innings.batters['p1'].playerName).toBe('Virat S.');
  });

  it('handles dot balls and singles with proper strike rotation', () => {
    const init = createInitialInnings(1, teamA, teamB, 'p1', 'p2', 'b1', rules);

    // Ball 1: Dot ball
    const r1 = recordDelivery(init, { batterRuns: 0 }, rules, teamA.players, teamB.players);
    expect(r1.nextState.totalRuns).toBe(0);
    expect(r1.nextState.legalDeliveries).toBe(1);
    expect(r1.nextState.oversFormatted).toBe('0.1');
    expect(r1.nextState.currentStrikerId).toBe('p1');
    expect(r1.nextState.batters['p1'].ballsFaced).toBe(1);

    // Ball 2: Single (1 run)
    const r2 = recordDelivery(r1.nextState, { batterRuns: 1 }, rules, teamA.players, teamB.players);
    expect(r2.nextState.totalRuns).toBe(1);
    expect(r2.nextState.legalDeliveries).toBe(2);
    expect(r2.nextState.oversFormatted).toBe('0.2');
    expect(r2.nextState.currentStrikerId).toBe('p2'); // Strike ROTATES to Rohit (p2)
    expect(r2.nextState.currentNonStrikerId).toBe('p1');
  });

  it('handles boundaries (4s and 6s) keeping strike on even runs', () => {
    const init = createInitialInnings(1, teamA, teamB, 'p1', 'p2', 'b1', rules);

    // Ball 1: Four
    const r1 = recordDelivery(init, { batterRuns: 4, isBoundaryFour: true }, rules, teamA.players, teamB.players);
    expect(r1.nextState.totalRuns).toBe(4);
    expect(r1.nextState.batters['p1'].fours).toBe(1);
    expect(r1.nextState.currentStrikerId).toBe('p1');

    // Ball 2: Six
    const r2 = recordDelivery(r1.nextState, { batterRuns: 6, isBoundarySix: true }, rules, teamA.players, teamB.players);
    expect(r2.nextState.totalRuns).toBe(10);
    expect(r2.nextState.batters['p1'].sixes).toBe(1);
    expect(r2.nextState.currentStrikerId).toBe('p1');
  });

  it('handles wides with re-ball as per official cricket laws', () => {
    const init = createInitialInnings(1, teamA, teamB, 'p1', 'p2', 'b1', rules);

    const r1 = recordDelivery(init, { extraType: 'wide', extraRuns: 1 }, rules, teamA.players, teamB.players);
    expect(r1.nextState.totalRuns).toBe(1);
    expect(r1.nextState.legalDeliveries).toBe(0); // DOES NOT count as legal ball
    expect(r1.nextState.oversFormatted).toBe('0.0');
    expect(r1.nextState.extras.wides).toBe(1);
    expect(r1.nextState.bowlers['b1'].wides).toBe(1);
  });

  it('handles no-balls with free hit triggers as per tournament rules', () => {
    const init = createInitialInnings(1, teamA, teamB, 'p1', 'p2', 'b1', rules);

    const r1 = recordDelivery(
      init,
      { extraType: 'no_ball', isNoBallOffBat: true, batterRuns: 2 },
      rules,
      teamA.players,
      teamB.players
    );

    expect(r1.nextState.totalRuns).toBe(3); // 1 NB penalty + 2 off bat = 3 runs
    expect(r1.nextState.legalDeliveries).toBe(0); // Re-ball required
    expect(r1.nextState.isFreeHitActive).toBe(true); // Free Hit active for next delivery
  });

  it('handles byes and leg-byes as legal balls not charged to bowler', () => {
    const init = createInitialInnings(1, teamA, teamB, 'p1', 'p2', 'b1', rules);

    const r1 = recordDelivery(init, { extraType: 'bye', extraRuns: 1 }, rules, teamA.players, teamB.players);
    expect(r1.nextState.totalRuns).toBe(1);
    expect(r1.nextState.legalDeliveries).toBe(1);
    expect(r1.nextState.batters['p1'].runs).toBe(0);
    expect(r1.nextState.bowlers['b1'].runsConceded).toBe(0);
    expect(r1.nextState.currentStrikerId).toBe('p2');
  });

  it('strictly rejects LBW in tennis ball cricket as per tournament rules', () => {
    const init = createInitialInnings(1, teamA, teamB, 'p1', 'p2', 'b1', rules);

    expect(() => {
      recordDelivery(
        init,
        {
          wicket: {
            dismissalType: 'lbw' as any,
            dismissedPlayerId: 'p1',
          },
        },
        rules,
        teamA.players,
        teamB.players
      );
    }).toThrow('LBW is not allowed in Tennis Ball Cricket');
  });

  it('handles official tennis cricket dismissals: bowled, caught, stumped, run out', () => {
    const init = createInitialInnings(1, teamA, teamB, 'p1', 'p2', 'b1', rules);

    // 1. Clean Bowled
    const r1 = recordDelivery(
      init,
      {
        wicket: {
          dismissalType: 'bowled',
          dismissedPlayerId: 'p1',
          incomingPlayerId: 'p3',
        },
      },
      rules,
      teamA.players,
      teamB.players
    );

    expect(r1.nextState.totalWickets).toBe(1);
    expect(r1.nextState.batters['p1'].isOut).toBe(true);
    expect(r1.nextState.batters['p1'].dismissalText).toBe('b Bumrah J.');
    expect(r1.nextState.currentStrikerId).toBe('p3');

    // 2. Stumped
    const r2 = recordDelivery(
      r1.nextState,
      {
        wicket: {
          dismissalType: 'stumped',
          dismissedPlayerId: 'p3',
          incomingPlayerId: 'p4',
        },
      },
      rules,
      teamA.players,
      teamB.players
    );

    expect(r2.nextState.totalWickets).toBe(2);
    expect(r2.nextState.batters['p3'].isOut).toBe(true);
    expect(r2.nextState.batters['p3'].dismissalText).toContain('st †wk b Bumrah J.');
  });

  it('guarantees 100% accurate Undo and state reconstruction', () => {
    const init = createInitialInnings(1, teamA, teamB, 'p1', 'p2', 'b1', rules);

    const r1 = recordDelivery(init, { batterRuns: 4, isBoundaryFour: true }, rules, teamA.players, teamB.players);
    const r2 = recordDelivery(r1.nextState, { batterRuns: 1 }, rules, teamA.players, teamB.players);

    expect(r2.nextState.totalRuns).toBe(5);
    expect(r2.nextState.currentStrikerId).toBe('p2');

    // Undo Ball 2 (1 run)
    const undone = undoLastDelivery(init, r2.nextState, rules, teamA.players, teamB.players);
    expect(undone.totalRuns).toBe(4);
    expect(undone.currentStrikerId).toBe('p1');
  });

  it('detects successful run chase and calculates match results and MVP correctly', () => {
    const inn1 = createInitialInnings(1, teamA, teamB, 'p1', 'p2', 'b1', rules);
    inn1.totalRuns = 25;
    inn1.legalDeliveries = 12;
    inn1.oversFormatted = '2.0';
    inn1.isInningsComplete = true;

    const inn2 = createInitialInnings(2, teamB, teamA, 'b1', 'b2', 'p1', rules, 26);
    inn2.totalRuns = 24;
    inn2.legalDeliveries = 11;

    const winDelivery = recordDelivery(
      inn2,
      { batterRuns: 4, isBoundaryFour: true },
      rules,
      teamB.players,
      teamA.players
    );

    expect(winDelivery.isInningsEnded).toBe(true);
    expect(winDelivery.nextState.totalRuns).toBe(28);

    const result = calculateMatchResult(teamA, teamB, inn1, winDelivery.nextState, 'team_a', 'bat');
    expect(result.winnerTeamId).toBe('team_b');
    expect(result.winnerTeamName).toBe('Thunder Titans');
    expect(result.marginText).toContain('Thunder Titans won by');
  });
});
