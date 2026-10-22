import React, { useState } from 'react';
import { useMatchStore } from '../../store/useMatchStore';
import { ScoreboardBanner } from './ScoreboardBanner';
import { OverTimeline } from './OverTimeline';
import { CreaseBatters } from './CreaseBatters';
import { BowlerCard } from './BowlerCard';
import { ScoringKeypad } from './ScoringKeypad';
import { DismissalModal } from './DismissalModal';
import { NextBowlerModal } from './NextBowlerModal';
import { InningsBreakModal } from './InningsBreakModal';
import { MoreExtrasModal } from './MoreExtrasModal';
import { CelebrationOverlay, CelebrationType } from '../CelebrationOverlay';
import { ScoreInput } from '../../engine/scoringEngine';
import { PlusCircle, FileText, Trophy, ArrowRight } from 'lucide-react';

export const LiveScoringScreen: React.FC = () => {
  const {
    currentMatch,
    scoreBall,
    setBowler,
    swapBattersStrike,
    undoDelivery,
    startSecondInnings,
    endMatchManually,
    setActiveTab,
    initNewMatchWizard,
  } = useMatchStore();

  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
  const [isNextBowlerModalOpen, setIsNextBowlerModalOpen] = useState(false);
  const [isMoreExtrasModalOpen, setIsMoreExtrasModalOpen] = useState(false);
  const [celebration, setCelebration] = useState<CelebrationType>(null);
  const [isScreenAwake, setIsScreenAwake] = useState(false);

  // Keep phone screen awake during match scoring
  React.useEffect(() => {
    let sentinel: any = null;
    const enableWakeLock = async () => {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          sentinel = await (navigator as any).wakeLock.request('screen');
          setIsScreenAwake(true);
        } catch (_) {}
      }
    };
    enableWakeLock();

    return () => {
      if (sentinel) {
        try {
          sentinel.release();
        } catch (_) {}
      }
    };
  }, []);

  if (!currentMatch) {
    return (
      <div style={{ padding: '30px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏏</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
          No Active Match
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          Start a new match to begin scoring deliveries!
        </p>
        <button onClick={initNewMatchWizard} className="btn-primary" style={{ maxWidth: 280, margin: '0 auto' }}>
          <PlusCircle size={20} />
          <span>Start New Match</span>
        </button>
      </div>
    );
  }

  // If match completed, show victory banner and link to result
  if (currentMatch.status === 'completed') {
    return (
      <div style={{ padding: '24px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(13, 21, 39, 0.95))',
            border: '1px solid #10B981',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ fontSize: '3.2rem', marginBottom: 8 }}>🏆</div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34D399', letterSpacing: '1px' }}>
            MATCH CONCLUDED!
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', marginTop: 4 }}>
            {currentMatch.result?.marginText}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            {currentMatch.result?.summary}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
            <button onClick={() => setActiveTab('scorecard')} className="btn-primary">
              <FileText size={18} />
              <span>View Full Scorecard & Share Card</span>
            </button>
            <button onClick={initNewMatchWizard} className="btn-secondary">
              <PlusCircle size={18} />
              <span>Start Another Match</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentInningsNum = currentMatch.currentInningsNumber;
  const innings = currentInningsNum === 1 ? currentMatch.innings1 : currentMatch.innings2;

  if (!innings) {
    return (
      <div style={{ padding: '30px 20px', textAlign: 'center' }}>
        <p>Innings setup pending...</p>
      </div>
    );
  }

  const battingTeam = innings.battingTeamId === currentMatch.teamA.id ? currentMatch.teamA : currentMatch.teamB;
  const bowlingTeam = innings.battingTeamId === currentMatch.teamA.id ? currentMatch.teamB : currentMatch.teamA;
  const currentBowler = innings.bowlers[innings.currentBowlerId] || {
    playerId: innings.currentBowlerId,
    playerName: 'Bowler',
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

  // Handle Score Input
  const handleScore = (input: ScoreInput) => {
    // Check celebration
    if (input.batterRuns === 6 || input.isBoundarySix) {
      setCelebration('six');
    } else if (input.batterRuns === 4 || input.isBoundaryFour) {
      setCelebration('four');
    } else if (input.wicket) {
      setCelebration('wicket');
    }

    const { isOverEnded, isInningsEnded, isMatchEnded } = scoreBall(input);

    if (isMatchEnded) {
      setCelebration('victory');
      return;
    }

    if (isOverEnded && !isInningsEnded) {
      setIsNextBowlerModalOpen(true);
    }
  };

  const isInningsBreak = currentMatch.status === 'innings_break';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: 12, padding: '12px 14px' }}>
      {/* 1. Scoreboard Header */}
      <ScoreboardBanner match={currentMatch} innings={innings} />

      {/* 2. Over Timeline Chips */}
      <OverTimeline innings={innings} ballsPerOver={currentMatch.settings.rules.ballsPerOver} />

      {/* 3. Batters on Crease */}
      <CreaseBatters innings={innings} onSwapStrike={swapBattersStrike} />

      {/* 4. Bowler Figures */}
      <BowlerCard
        bowler={currentBowler}
        onChangeBowlerClick={() => setIsNextBowlerModalOpen(true)}
      />

      {/* 5. Main Scoring Keypad */}
      <ScoringKeypad
        onScore={handleScore}
        onOpenWicketModal={() => setIsWicketModalOpen(true)}
        onUndo={undoDelivery}
        onOpenMoreExtras={() => setIsMoreExtrasModalOpen(true)}
        disabled={isInningsBreak}
      />

      {/* Modals */}
      <DismissalModal
        isOpen={isWicketModalOpen}
        onClose={() => setIsWicketModalOpen(false)}
        innings={innings}
        battingTeam={battingTeam}
        bowlingTeam={bowlingTeam}
        onConfirmWicket={handleScore}
      />

      <NextBowlerModal
        isOpen={isNextBowlerModalOpen}
        onSelectBowler={id => {
          setBowler(id);
          setIsNextBowlerModalOpen(false);
        }}
        onClose={() => setIsNextBowlerModalOpen(false)}
        innings={innings}
        bowlingTeam={bowlingTeam}
        allowConsecutive={currentMatch.settings.rules.allowConsecutiveOvers}
      />

      {isInningsBreak && currentMatch.innings1 && (
        <InningsBreakModal
          isOpen={true}
          match={currentMatch}
          innings1={currentMatch.innings1}
          onStartSecondInnings={(st, nst, bowl) => startSecondInnings(st, nst, bowl)}
        />
      )}

      <MoreExtrasModal
        isOpen={isMoreExtrasModalOpen}
        onClose={() => setIsMoreExtrasModalOpen(false)}
        onScore={handleScore}
        onEndMatchManually={endMatchManually}
      />

      {/* Celebration Confetti & Banner */}
      <CelebrationOverlay type={celebration} onComplete={() => setCelebration(null)} />
    </div>
  );
};
