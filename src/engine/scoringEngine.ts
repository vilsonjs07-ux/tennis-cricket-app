import {
  BatterStats,
  BowlerStats,
  DeliveryEvent,
  DismissalType,
  ExtraType,
  FallOfWicket,
  InningsState,
  MatchResult,
  OverSummary,
  Player,
  Team,
  TennisCricketRules,
  WicketDetail,
} from '../types/cricket';

export const DEFAULT_TENNIS_CRICKET_RULES: TennisCricketRules = {
  oversPerInnings: 8,
  ballsPerOver: 6,
  maxOversPerBowler: 2,
  allowConsecutiveOvers: false, // Bowlers must alternate overs
  wideRuns: 1,
  wideReball: true, // Extra ball bowled
  noBallRuns: 1,
  noBallReball: true, // Extra ball bowled
  freeHitAfterNoBall: true, // Free Hit on no-balls
  allowByes: true,
  allowLegByes: true,
  allowLBW: false, // NO LBW IN TENNIS BALL CRICKET
  powerplayOvers: 2,
};

export const DEFAULT_GULLY_RULES = DEFAULT_TENNIS_CRICKET_RULES;

/**
 * Format legal deliveries into standard cricket over notation (e.g. 17 balls = "2.5")
 */
export function formatOvers(legalBalls: number, ballsPerOver: number = 6): string {
  const overs = Math.floor(legalBalls / ballsPerOver);
  const balls = legalBalls % ballsPerOver;
  return `${overs}.${balls}`;
}

/**
 * Calculate Run Rate
 */
export function calculateRunRate(runs: number, legalBalls: number, ballsPerOver: number = 6): number {
  if (legalBalls === 0) return 0;
  const oversDecimal = legalBalls / ballsPerOver;
  return Number((runs / oversDecimal).toFixed(2));
}

export interface ScoreInput {
  batterRuns?: number;
  isBoundaryFour?: boolean;
  isBoundarySix?: boolean;
  extraType?: ExtraType;
  extraRuns?: number;
  isNoBallOffBat?: boolean;
  wicket?: {
    dismissalType: DismissalType;
    dismissedPlayerId: string;
    fielderPlayerId?: string;
    runsBeforeDismissal?: number;
    incomingPlayerId?: string;
  };
}

/**
 * Initialize an Innings State
 */
export function createInitialInnings(
  inningsNumber: 1 | 2,
  battingTeam: Team,
  bowlingTeam: Team,
  openingStrikerId: string,
  openingNonStrikerId: string,
  openingBowlerId: string,
  rules: TennisCricketRules,
  targetRuns?: number
): InningsState {
  const striker = battingTeam.players.find(p => p.id === openingStrikerId);
  const nonStriker = battingTeam.players.find(p => p.id === openingNonStrikerId);
  const bowler = bowlingTeam.players.find(p => p.id === openingBowlerId);

  const strikerName = striker ? striker.name : 'Striker';
  const nonStrikerName = nonStriker ? nonStriker.name : 'Non-Striker';
  const bowlerName = bowler ? bowler.name : 'Bowler';

  const batters: Record<string, BatterStats> = {
    [openingStrikerId]: {
      playerId: openingStrikerId,
      playerName: strikerName,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
      battingPosition: 1,
    },
    [openingNonStrikerId]: {
      playerId: openingNonStrikerId,
      playerName: nonStrikerName,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
      battingPosition: 2,
    },
  };

  const bowlers: Record<string, BowlerStats> = {
    [openingBowlerId]: {
      playerId: openingBowlerId,
      playerName: bowlerName,
      legalBallsBowled: 0,
      oversFormatted: '0.0',
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      economy: 0,
      dots: 0,
      wides: 0,
      noBalls: 0,
    },
  };

  const totalPossibleBalls = rules.oversPerInnings * rules.ballsPerOver;

  return {
    inningsNumber,
    battingTeamId: battingTeam.id,
    battingTeamName: battingTeam.name,
    bowlingTeamId: bowlingTeam.id,
    bowlingTeamName: bowlingTeam.name,
    totalRuns: 0,
    totalWickets: 0,
    legalDeliveries: 0,
    oversFormatted: '0.0',
    currentOverLegalDeliveries: 0,
    currentStrikerId: openingStrikerId,
    currentNonStrikerId: openingNonStrikerId,
    currentBowlerId: openingBowlerId,
    batters,
    bowlers,
    battingOrder: [openingStrikerId, openingNonStrikerId],
    deliveries: [],
    undoneDeliveries: [],
    fallOfWickets: [],
    oversSummaries: [],
    extras: {
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      penalties: 0,
      total: 0,
    },
    isInningsComplete: false,
    targetRuns,
    runsNeeded: targetRuns ? targetRuns : undefined,
    ballsRemaining: targetRuns ? totalPossibleBalls : undefined,
    requiredRunRate: targetRuns
      ? Number(((targetRuns / totalPossibleBalls) * rules.ballsPerOver).toFixed(2))
      : undefined,
    currentRunRate: 0,
    isFreeHitActive: false,
  };
}

/**
 * Record a delivery and update the entire innings state immutably.
 */
export function recordDelivery(
  state: InningsState,
  input: ScoreInput,
  rules: TennisCricketRules,
  battingPlayers: Player[],
  bowlingPlayers: Player[]
): { nextState: InningsState; event: DeliveryEvent; isOverEnded: boolean; isInningsEnded: boolean } {
  if (state.isInningsComplete) {
    throw new Error('Cannot score on a completed innings.');
  }

  // Clone state
  const next = JSON.parse(JSON.stringify(state)) as InningsState;
  next.undoneDeliveries = []; // Clear redo stack on new action

  const currentStriker = next.batters[next.currentStrikerId];
  const currentNonStriker = next.batters[next.currentNonStrikerId];
  const currentBowler = next.bowlers[next.currentBowlerId];

  let isLegal = true;
  let batterRuns = 0;
  let extraRuns = 0;
  let extraType: ExtraType = input.extraType || 'none';
  let isBoundaryFour = !!input.isBoundaryFour;
  let isBoundarySix = !!input.isBoundarySix;
  let willBeFreeHitNext = false;
  const isFreeHit = next.isFreeHitActive;

  // 1. Process Extras & Runs
  if (extraType === 'wide') {
    isLegal = !rules.wideReball;
    const baseWidePenalty = rules.wideRuns;
    const extraOverWide = input.extraRuns ? Math.max(0, input.extraRuns - baseWidePenalty) : 0;
    extraRuns = baseWidePenalty + extraOverWide;
    next.extras.wides += extraRuns;
    currentBowler.wides += 1;
    currentBowler.runsConceded += extraRuns;
  } else if (extraType === 'no_ball') {
    isLegal = !rules.noBallReball;
    const baseNbPenalty = rules.noBallRuns;
    if (rules.freeHitAfterNoBall) {
      willBeFreeHitNext = true;
    }
    
    if (input.isNoBallOffBat && input.batterRuns) {
      batterRuns = input.batterRuns;
      extraRuns = baseNbPenalty;
      currentStriker.runs += batterRuns;
      currentStriker.ballsFaced += 1;
      if (batterRuns === 4) {
        currentStriker.fours += 1;
        isBoundaryFour = true;
      } else if (batterRuns === 6) {
        currentStriker.sixes += 1;
        isBoundarySix = true;
      }
    } else {
      // Byes or just base penalty
      const byesWithNb = input.extraRuns ? Math.max(0, input.extraRuns - baseNbPenalty) : 0;
      extraRuns = baseNbPenalty + byesWithNb;
      if (byesWithNb > 0) {
        next.extras.byes += byesWithNb;
      }
      currentStriker.ballsFaced += 1;
    }
    next.extras.noBalls += baseNbPenalty;
    currentBowler.noBalls += 1;
    currentBowler.runsConceded += (batterRuns + extraRuns);
  } else if (extraType === 'bye') {
    isLegal = true;
    extraRuns = input.extraRuns ?? 1;
    next.extras.byes += extraRuns;
    currentStriker.ballsFaced += 1;
  } else if (extraType === 'leg_bye') {
    isLegal = true;
    extraRuns = input.extraRuns ?? 1;
    next.extras.legByes += extraRuns;
    currentStriker.ballsFaced += 1;
  } else if (extraType === 'penalty') {
    isLegal = false;
    extraRuns = input.extraRuns ?? 5;
    next.extras.penalties += extraRuns;
  } else {
    // Normal delivery off bat
    isLegal = true;
    batterRuns = input.batterRuns ?? 0;
    currentStriker.runs += batterRuns;
    currentStriker.ballsFaced += 1;

    if (batterRuns === 4 || isBoundaryFour) {
      currentStriker.fours += 1;
      isBoundaryFour = true;
    } else if (batterRuns === 6 || isBoundarySix) {
      currentStriker.sixes += 1;
      isBoundarySix = true;
    } else if (batterRuns === 0) {
      currentBowler.dots += 1;
    }

    currentBowler.runsConceded += batterRuns;
  }

  const isDotBall = isLegal && batterRuns === 0 && extraRuns === 0;
  const totalDeliveryRuns = batterRuns + extraRuns;
  next.totalRuns += totalDeliveryRuns;
  next.extras.total =
    next.extras.wides +
    next.extras.noBalls +
    next.extras.byes +
    next.extras.legByes +
    next.extras.penalties;

  // 2. Process Wicket (Official Cricket Laws, NO LBW in Tennis Ball Cricket)
  let wicketDetail: WicketDetail | undefined = undefined;
  if (input.wicket) {
    const w = input.wicket;

    // Strict validation: Reject LBW if rules disallow LBW
    if ((w.dismissalType as string) === 'lbw' && !rules.allowLBW) {
      throw new Error('LBW is not allowed in Tennis Ball Cricket as per tournament rules.');
    }

    const dismissedPlayer = battingPlayers.find(p => p.id === w.dismissedPlayerId);
    const dismissedBatter = next.batters[w.dismissedPlayerId];
    const fielder = w.fielderPlayerId
      ? bowlingPlayers.find(p => p.id === w.fielderPlayerId)
      : undefined;

    let isBowlerWicket = true;
    let dismissalText = '';

    switch (w.dismissalType) {
      case 'bowled':
        dismissalText = `b ${currentBowler.playerName}`;
        break;
      case 'caught':
        dismissalText = fielder
          ? `c ${fielder.name} b ${currentBowler.playerName}`
          : `c & b ${currentBowler.playerName}`;
        break;
      case 'caught_and_bowled':
        dismissalText = `c & b ${currentBowler.playerName}`;
        break;
      case 'caught_behind':
        dismissalText = fielder
          ? `c †${fielder.name} b ${currentBowler.playerName}`
          : `c †wk b ${currentBowler.playerName}`;
        break;
      case 'stumped':
        dismissalText = fielder
          ? `st †${fielder.name} b ${currentBowler.playerName}`
          : `st †wk b ${currentBowler.playerName}`;
        break;
      case 'hit_wicket':
        dismissalText = `hit wicket b ${currentBowler.playerName}`;
        break;
      case 'run_out':
        isBowlerWicket = false;
        dismissalText = fielder
          ? `run out (${fielder.name})`
          : 'run out';
        break;
      case 'retired_hurt':
        isBowlerWicket = false;
        dismissalText = 'retired hurt';
        break;
      case 'retired_out':
        isBowlerWicket = false;
        dismissalText = 'retired out';
        break;
      case 'obstructing_field':
        isBowlerWicket = false;
        dismissalText = 'obstructing the field';
        break;
      case 'timed_out':
        isBowlerWicket = false;
        dismissalText = 'timed out';
        break;
      default:
        dismissalText = `out (${w.dismissalType})`;
    }

    if (dismissedBatter) {
      dismissedBatter.isOut = true;
      dismissedBatter.dismissalText = dismissalText;
      dismissedBatter.dismissalType = w.dismissalType;
      dismissedBatter.bowlerName = currentBowler.playerName;
      dismissedBatter.fielderName = fielder?.name;
    }

    if (isBowlerWicket) {
      currentBowler.wickets += 1;
    }

    next.totalWickets += 1;

    wicketDetail = {
      dismissalType: w.dismissalType,
      dismissedPlayerId: w.dismissedPlayerId,
      dismissedPlayerName: dismissedPlayer?.name || 'Player',
      bowlerPlayerId: isBowlerWicket ? currentBowler.playerId : undefined,
      bowlerPlayerName: isBowlerWicket ? currentBowler.playerName : undefined,
      fielderPlayerId: fielder?.id,
      fielderPlayerName: fielder?.name,
      runsBeforeDismissal: w.runsBeforeDismissal || 0,
    };

    // Record Fall of Wicket
    const fow: FallOfWicket = {
      wicketNumber: next.totalWickets,
      teamRuns: next.totalRuns,
      legalBalls: next.legalDeliveries + (isLegal ? 1 : 0),
      oversFormatted: formatOvers(next.legalDeliveries + (isLegal ? 1 : 0), rules.ballsPerOver),
      playerOutName: dismissedPlayer?.name || 'Player',
      playerOutId: w.dismissedPlayerId,
    };
    next.fallOfWickets.push(fow);

    // Bring in new batter if available
    if (w.incomingPlayerId) {
      const incoming = battingPlayers.find(p => p.id === w.incomingPlayerId);
      const incomingName = incoming ? incoming.name : 'New Batter';

      next.batters[w.incomingPlayerId] = {
        playerId: w.incomingPlayerId,
        playerName: incomingName,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false,
        battingPosition: Object.keys(next.batters).length + 1,
      };

      next.battingOrder.push(w.incomingPlayerId);

      if (w.dismissedPlayerId === next.currentStrikerId) {
        next.currentStrikerId = w.incomingPlayerId;
      } else if (w.dismissedPlayerId === next.currentNonStrikerId) {
        next.currentNonStrikerId = w.incomingPlayerId;
      }
    }
  }

  // 3. Update Overs and Legal Deliveries
  let isOverEnded = false;
  if (isLegal) {
    next.legalDeliveries += 1;
    next.currentOverLegalDeliveries += 1;
    currentBowler.legalBallsBowled += 1;

    if (next.currentOverLegalDeliveries === rules.ballsPerOver) {
      isOverEnded = true;
      next.currentOverLegalDeliveries = 0;
    }
  }

  // 4. Update Strike Rotation (Standard ICC / MCC Cricket Laws)
  let runsForStrike = 0;
  if (extraType === 'none') {
    runsForStrike = batterRuns;
  } else if (extraType === 'bye' || extraType === 'leg_bye') {
    runsForStrike = extraRuns;
  } else if (extraType === 'wide') {
    runsForStrike = Math.max(0, extraRuns - rules.wideRuns);
  } else if (extraType === 'no_ball') {
    runsForStrike = input.isNoBallOffBat ? batterRuns : Math.max(0, extraRuns - rules.noBallRuns);
  }

  let shouldRotateStrike = runsForStrike % 2 !== 0;

  // On Over End: strike rotates automatically!
  // If odd runs on last ball, strike rotates once for runs, and once for over end!
  if (isOverEnded) {
    shouldRotateStrike = !shouldRotateStrike;
  }

  if (shouldRotateStrike) {
    const temp = next.currentStrikerId;
    next.currentStrikerId = next.currentNonStrikerId;
    next.currentNonStrikerId = temp;
  }

  // 5. Update Rates & Formats
  next.oversFormatted = formatOvers(next.legalDeliveries, rules.ballsPerOver);
  currentBowler.oversFormatted = formatOvers(currentBowler.legalBallsBowled, rules.ballsPerOver);

  // Economy & Strike Rates
  Object.values(next.batters).forEach(b => {
    b.strikeRate = b.ballsFaced > 0 ? Number(((b.runs / b.ballsFaced) * 100).toFixed(1)) : 0;
  });

  Object.values(next.bowlers).forEach(bw => {
    bw.economy = calculateRunRate(bw.runsConceded, bw.legalBallsBowled, rules.ballsPerOver);
  });

  next.currentRunRate = calculateRunRate(next.totalRuns, next.legalDeliveries, rules.ballsPerOver);

  // 6. Free Hit State
  next.isFreeHitActive = willBeFreeHitNext;

  // 7. Generate Commentary
  const currentOverNum = Math.floor((next.legalDeliveries - (isLegal ? 1 : 0)) / rules.ballsPerOver);
  const isPowerplay = currentOverNum < (rules.powerplayOvers || 2);

  const commentary = generateBallCommentary({
    bowlerName: currentBowler.playerName,
    strikerName: currentStriker.playerName,
    batterRuns,
    extraType,
    extraRuns,
    isBoundaryFour,
    isBoundarySix,
    isLegal,
    wicket: wicketDetail,
  });

  // 8. Construct Delivery Event
  const ballInOver = isLegal ? (next.currentOverLegalDeliveries === 0 ? rules.ballsPerOver : next.currentOverLegalDeliveries) : next.currentOverLegalDeliveries;

  const event: DeliveryEvent = {
    id: `ball_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    matchId: '',
    inningsNumber: next.inningsNumber,
    overNumber: currentOverNum,
    ballInOver,
    legalBallNumber: next.legalDeliveries,
    isLegalDelivery: isLegal,
    bowlerId: currentBowler.playerId,
    bowlerName: currentBowler.playerName,
    strikerId: currentStriker.playerId,
    strikerName: currentStriker.playerName,
    nonStrikerId: currentNonStriker.playerId,
    nonStrikerName: currentNonStriker.playerName,
    batterRuns,
    extraType,
    extraRuns,
    totalRuns: totalDeliveryRuns,
    isBoundaryFour,
    isBoundarySix,
    isDotBall,
    isFreeHit,
    willBeFreeHitNext,
    isPowerplay,
    wicket: wicketDetail,
    strikeRotated: shouldRotateStrike,
    newStrikerId: next.currentStrikerId,
    newNonStrikerId: next.currentNonStrikerId,
    commentary,
    timestamp: Date.now(),
  };

  next.deliveries.push(event);

  // Check maiden over if over ended
  if (isOverEnded) {
    const ballsThisOver = next.deliveries.slice(-rules.ballsPerOver);
    const runsInThisOver = ballsThisOver.reduce((sum, b) => sum + b.totalRuns, 0);
    if (runsInThisOver === 0) {
      currentBowler.maidens += 1;
    }

    const overSumm: OverSummary = {
      overNumber: currentOverNum,
      bowlerId: currentBowler.playerId,
      bowlerName: currentBowler.playerName,
      runsConceded: runsInThisOver,
      wicketsTaken: ballsThisOver.filter(b => b.wicket).length,
      balls: ballsThisOver,
      isMaiden: runsInThisOver === 0,
      totalAtEndOfOver: next.totalRuns,
      wicketsAtEndOfOver: next.totalWickets,
    };
    next.oversSummaries.push(overSumm);
    next.previousBowlerId = currentBowler.playerId;
  }

  // 9. Innings Completion Check
  const maxWickets = rules.maxWickets !== undefined
    ? rules.maxWickets
    : Math.max(1, battingPlayers.length - 1);

  const totalMaxLegalBalls = rules.oversPerInnings * rules.ballsPerOver;

  if (next.targetRuns && next.totalRuns >= next.targetRuns) {
    next.isInningsComplete = true;
    next.completionReason = 'target_reached';
  } else if (next.totalWickets >= maxWickets) {
    next.isInningsComplete = true;
    next.completionReason = 'all_out';
  } else if (next.legalDeliveries >= totalMaxLegalBalls) {
    next.isInningsComplete = true;
    next.completionReason = 'overs_complete';
  }

  // Update target chase stats
  if (next.targetRuns) {
    next.runsNeeded = Math.max(0, next.targetRuns - next.totalRuns);
    next.ballsRemaining = Math.max(0, totalMaxLegalBalls - next.legalDeliveries);
    next.requiredRunRate = next.ballsRemaining > 0
      ? calculateRunRate(next.runsNeeded, next.ballsRemaining, rules.ballsPerOver)
      : 0;
  }

  return {
    nextState: next,
    event,
    isOverEnded,
    isInningsEnded: next.isInningsComplete,
  };
}

/**
 * Switch bowler for the new over
 */
export function changeBowler(
  state: InningsState,
  newBowlerId: string,
  bowlingPlayers: Player[],
  rules: TennisCricketRules
): InningsState {
  if (!rules.allowConsecutiveOvers && state.previousBowlerId === newBowlerId && bowlingPlayers.length > 2) {
    throw new Error('Same bowler cannot bowl consecutive overs as per official cricket laws.');
  }

  const next = JSON.parse(JSON.stringify(state)) as InningsState;
  const bowlerPlayer = bowlingPlayers.find(p => p.id === newBowlerId);
  const bowlerName = bowlerPlayer ? bowlerPlayer.name : 'Bowler';

  if (!next.bowlers[newBowlerId]) {
    next.bowlers[newBowlerId] = {
      playerId: newBowlerId,
      playerName: bowlerName,
      legalBallsBowled: 0,
      oversFormatted: '0.0',
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      economy: 0,
      dots: 0,
      wides: 0,
      noBalls: 0,
    };
  }

  next.currentBowlerId = newBowlerId;
  return next;
}

/**
 * Manually swap striker & non-striker
 */
export function swapStrike(state: InningsState): InningsState {
  const next = JSON.parse(JSON.stringify(state)) as InningsState;
  const temp = next.currentStrikerId;
  next.currentStrikerId = next.currentNonStrikerId;
  next.currentNonStrikerId = temp;
  return next;
}

/**
 * Undo last delivery with 100% mathematical recomputation
 */
export function undoLastDelivery(
  initialState: InningsState,
  currentState: InningsState,
  rules: TennisCricketRules,
  battingPlayers: Player[],
  bowlingPlayers: Player[]
): InningsState {
  if (currentState.deliveries.length === 0) {
    return currentState;
  }

  const allDeliveries = [...currentState.deliveries];
  const lastDelivery = allDeliveries.pop()!;

  // Start with clean initial state
  let rebuilt = JSON.parse(JSON.stringify(initialState)) as InningsState;
  rebuilt.undoneDeliveries = [...currentState.undoneDeliveries, lastDelivery];

  // Replay all deliveries up to n-1
  for (const delivery of allDeliveries) {
    const input: ScoreInput = {
      batterRuns: delivery.batterRuns,
      isBoundaryFour: delivery.isBoundaryFour,
      isBoundarySix: delivery.isBoundarySix,
      extraType: delivery.extraType,
      extraRuns: delivery.extraRuns,
      isNoBallOffBat: delivery.extraType === 'no_ball' && delivery.batterRuns > 0,
      wicket: delivery.wicket
        ? {
            dismissalType: delivery.wicket.dismissalType,
            dismissedPlayerId: delivery.wicket.dismissedPlayerId,
            fielderPlayerId: delivery.wicket.fielderPlayerId,
            runsBeforeDismissal: delivery.wicket.runsBeforeDismissal,
          }
        : undefined,
    };

    if (delivery.bowlerId !== rebuilt.currentBowlerId) {
      rebuilt = changeBowler(rebuilt, delivery.bowlerId, bowlingPlayers, rules);
    }

    const res = recordDelivery(rebuilt, input, rules, battingPlayers, bowlingPlayers);
    rebuilt = res.nextState;
  }

  rebuilt.undoneDeliveries = [...currentState.undoneDeliveries, lastDelivery];
  return rebuilt;
}

/**
 * Generate human-friendly professional cricket commentary
 */
function generateBallCommentary(ctx: {
  bowlerName: string;
  strikerName: string;
  batterRuns: number;
  extraType: ExtraType;
  extraRuns: number;
  isBoundaryFour: boolean;
  isBoundarySix: boolean;
  isLegal: boolean;
  wicket?: WicketDetail;
}): string {
  const { bowlerName, strikerName, batterRuns, extraType, extraRuns, isBoundaryFour, isBoundarySix, wicket } = ctx;

  if (wicket) {
    if (wicket.dismissalType === 'bowled') {
      return `WICKET! 🎯 Clean bowled! ${bowlerName} breaks the stumps with a lethal yorker! ${strikerName} walks back.`;
    }
    if (wicket.dismissalType === 'caught') {
      return `WICKET! 🧤 In the air and taken! ${wicket.fielderPlayerName ? `${wicket.fielderPlayerName} takes the catch` : 'Caught!'} off ${bowlerName}.`;
    }
    if (wicket.dismissalType === 'caught_behind') {
      return `WICKET! 🧤 Edged and taken by the keeper! Big appeal and given! ${strikerName} is caught behind.`;
    }
    if (wicket.dismissalType === 'stumped') {
      return `WICKET! ⚡ STUMPED! ${strikerName} steps out, beaten by the dip and keeper whips off the bails!`;
    }
    if (wicket.dismissalType === 'run_out') {
      return `RUN OUT! ⚡ Direct hit! ${wicket.dismissedPlayerName} is caught short of the crease!`;
    }
    if (wicket.dismissalType === 'hit_wicket') {
      return `WICKET! 💥 Hit wicket! ${strikerName} dislodges the bails on the backfoot.`;
    }
    return `WICKET! ${strikerName} is out (${wicket.dismissalType})!`;
  }

  if (isBoundarySix) {
    return `SIX! 🚀 BOOM! What a massive strike over long-on! That heavy tennis ball is out of the stadium!`;
  }
  if (isBoundaryFour) {
    return `FOUR! 🎯 Beautiful timing and placement! Pierces the gap to the boundary rope!`;
  }

  if (extraType === 'wide') {
    return extraRuns > 1
      ? `WIDE BALL! ↔️ Straying wide down the leg side, plus ${extraRuns - 1} extra run(s)! Re-ball required.`
      : `WIDE BALL! ↔️ Outside the tramline. Extra run conceded by ${bowlerName}. Re-ball required.`;
  }
  if (extraType === 'no_ball') {
    return `NO BALL! 🚨 Front foot overstepping by ${bowlerName}! Extra run and FREE HIT coming up!`;
  }
  if (extraType === 'bye') {
    return `BYES! 🏃 ${extraRuns} run(s) taken as ball passes through to the keeper.`;
  }
  if (extraType === 'leg_bye') {
    return `LEG BYES! 🦵 Off the pads, batters complete ${extraRuns} run(s).`;
  }

  if (batterRuns === 0) {
    return `Dot ball. 🛡️ Solid delivery from ${bowlerName}. No run.`;
  }
  if (batterRuns === 1) {
    return `Single. 👟 ${strikerName} pushes into the gap and rotates strike.`;
  }
  if (batterRuns === 2) {
    return `Two runs! 🏃‍♂️💨 Fast running between the wickets by ${strikerName}.`;
  }
  if (batterRuns === 3) {
    return `Three runs! Deep outfield stop saves a boundary, batters complete 3.`;
  }

  return `${batterRuns} runs scored.`;
}

/**
 * Determine Match Result and MVP / Player of the Match
 */
export function calculateMatchResult(
  teamA: Team,
  teamB: Team,
  innings1: InningsState,
  innings2: InningsState,
  _tossWinnerTeamId: string,
  _tossChoice: 'bat' | 'bowl'
): MatchResult {
  const team1 = innings1.battingTeamId === teamA.id ? teamA : teamB;
  const team2 = innings1.battingTeamId === teamA.id ? teamB : teamA;

  const score1 = innings1.totalRuns;
  const wickets1 = innings1.totalWickets;
  const score2 = innings2.totalRuns;
  const wickets2 = innings2.totalWickets;

  let winnerTeamId: string | undefined = undefined;
  let winnerTeamName: string | undefined = undefined;
  let isTie = false;
  let isDraw = false;
  let marginText = '';

  const team2Target = score1 + 1;

  if (score2 >= team2Target) {
    // Team 2 won chasing
    winnerTeamId = team2.id;
    winnerTeamName = team2.name;
    const wicketsRemaining = team2.players.length - 1 - wickets2;
    marginText = `${team2.name} won by ${Math.max(1, wicketsRemaining)} wickets`;
  } else if (innings2.isInningsComplete && score2 < score1) {
    // Team 1 won defending
    winnerTeamId = team1.id;
    winnerTeamName = team1.name;
    const runDiff = score1 - score2;
    marginText = `${team1.name} won by ${runDiff} runs`;
  } else if (innings2.isInningsComplete && score2 === score1) {
    // Tie!
    isTie = true;
    marginText = 'Match Tied! Thrilling finish!';
  } else {
    marginText = 'Match in progress';
  }

  // Calculate MVP / Man of the Match across both innings
  const playerScores: Record<string, { player: Player; points: number; summary: string }> = {};

  const allPlayers = [...teamA.players, ...teamB.players];

  allPlayers.forEach(p => {
    playerScores[p.id] = { player: p, points: 0, summary: '' };
  });

  // Score from innings 1
  Object.values(innings1.batters).forEach(b => {
    if (playerScores[b.playerId]) {
      const batPts = b.runs * 1.0 + b.fours * 1.5 + b.sixes * 2.5 + (b.strikeRate > 150 ? 5 : 0);
      playerScores[b.playerId].points += batPts;
      if (b.runs >= 15) {
        playerScores[b.playerId].summary += `${b.runs} runs (${b.ballsFaced}b) `;
      }
    }
  });

  Object.values(innings1.bowlers).forEach(bw => {
    if (playerScores[bw.playerId]) {
      const bowlPts = bw.wickets * 25 + bw.maidens * 15 + bw.dots * 1.5;
      playerScores[bw.playerId].points += bowlPts;
      if (bw.wickets > 0) {
        playerScores[bw.playerId].summary += `${bw.wickets}/${bw.runsConceded} `;
      }
    }
  });

  // Score from innings 2
  Object.values(innings2.batters).forEach(b => {
    if (playerScores[b.playerId]) {
      const batPts = b.runs * 1.0 + b.fours * 1.5 + b.sixes * 2.5 + (b.strikeRate > 150 ? 5 : 0);
      playerScores[b.playerId].points += batPts;
      if (b.runs >= 15) {
        playerScores[b.playerId].summary += `${b.runs} runs (${b.ballsFaced}b) `;
      }
    }
  });

  Object.values(innings2.bowlers).forEach(bw => {
    if (playerScores[bw.playerId]) {
      const bowlPts = bw.wickets * 25 + bw.maidens * 15 + bw.dots * 1.5;
      playerScores[bw.playerId].points += bowlPts;
      if (bw.wickets > 0) {
        playerScores[bw.playerId].summary += `${bw.wickets}/${bw.runsConceded} `;
      }
    }
  });

  let topMvpPlayer: Player | undefined = undefined;
  let maxPoints = -1;
  let mvpReason = '';

  Object.values(playerScores).forEach(item => {
    if (item.points > maxPoints && item.points > 0) {
      maxPoints = item.points;
      topMvpPlayer = item.player;
      mvpReason = item.summary.trim() || `${Math.round(item.points)} performance points`;
    }
  });

  // Best Batter & Best Bowler across match
  let bestBatter: { name: string; runs: number; balls: number } | null = null;
  [...Object.values(innings1.batters), ...Object.values(innings2.batters)].forEach(b => {
    if (!bestBatter || b.runs > bestBatter.runs) {
      bestBatter = { name: b.playerName, runs: b.runs, balls: b.ballsFaced };
    }
  });

  let bestBowler: { name: string; wickets: number; runs: number } | null = null;
  [...Object.values(innings1.bowlers), ...Object.values(innings2.bowlers)].forEach(bw => {
    if (!bestBowler || bw.wickets > bestBowler.wickets || (bw.wickets === bestBowler.wickets && bw.runsConceded < bestBowler.runs)) {
      bestBowler = { name: bw.playerName, wickets: bw.wickets, runs: bw.runsConceded };
    }
  });

  return {
    winnerTeamId,
    winnerTeamName,
    isTie,
    isDraw,
    isAbandoned: false,
    marginText,
    summary: `${team1.name} ${score1}/${wickets1} (${innings1.oversFormatted} ov) vs ${team2.name} ${score2}/${wickets2} (${innings2.oversFormatted} ov)`,
    manOfTheMatchPlayerId: topMvpPlayer ? (topMvpPlayer as Player).id : undefined,
    manOfTheMatchName: topMvpPlayer ? (topMvpPlayer as Player).name : undefined,
    manOfTheMatchReason: mvpReason,
    bestBatterName: bestBatter ? (bestBatter as { name: string }).name : undefined,
    bestBatterStat: bestBatter ? `${(bestBatter as any).runs} runs (${(bestBatter as any).balls}b)` : undefined,
    bestBowlerName: bestBowler ? (bestBowler as { name: string }).name : undefined,
    bestBowlerStat: bestBowler ? `${(bestBowler as any).wickets}/${(bestBowler as any).runs}` : undefined,
  };
}
