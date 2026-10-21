import React, { useState } from 'react';
import { ScoreInput } from '../../engine/scoringEngine';
import { RotateCcw, MoreHorizontal, ShieldAlert } from 'lucide-react';

interface ScoringKeypadProps {
  onScore: (input: ScoreInput) => void;
  onOpenWicketModal: () => void;
  onUndo: () => void;
  onOpenMoreExtras: () => void;
  disabled?: boolean;
}

export const ScoringKeypad: React.FC<ScoringKeypadProps> = ({
  onScore,
  onOpenWicketModal,
  onUndo,
  onOpenMoreExtras,
  disabled = false,
}) => {
  const [isDebouncing, setIsDebouncing] = useState(false);

  const handleAction = (action: () => void) => {
    if (disabled || isDebouncing) return;
    setIsDebouncing(true);
    action();
    // 250ms debounce window to prevent accidental double-taps
    setTimeout(() => {
      setIsDebouncing(false);
    }, 250);
  };

  return (
    <div className="scoring-grid">
      {/* Row 1: Normal Runs */}
      <button
        onClick={() => handleAction(() => onScore({ batterRuns: 0 }))}
        className="score-btn"
        disabled={disabled}
      >
        <span>0</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>DOT</span>
      </button>

      <button
        onClick={() => handleAction(() => onScore({ batterRuns: 1 }))}
        className="score-btn"
        disabled={disabled}
      >
        <span>1</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RUN</span>
      </button>

      <button
        onClick={() => handleAction(() => onScore({ batterRuns: 2 }))}
        className="score-btn"
        disabled={disabled}
      >
        <span>2</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RUNS</span>
      </button>

      <button
        onClick={() => handleAction(() => onScore({ batterRuns: 3 }))}
        className="score-btn"
        disabled={disabled}
      >
        <span>3</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RUNS</span>
      </button>

      {/* Row 2: Boundaries (Big & Vibrant) */}
      <button
        onClick={() => handleAction(() => onScore({ batterRuns: 4, isBoundaryFour: true }))}
        className="score-btn btn-four"
        style={{ gridColumn: 'span 2', height: 64 }}
        disabled={disabled}
      >
        <span style={{ fontSize: '1.7rem' }}>4</span>
        <span style={{ fontSize: '0.72rem', letterSpacing: '1px', fontWeight: 800 }}>FOUR! 🎯</span>
      </button>

      <button
        onClick={() => handleAction(() => onScore({ batterRuns: 6, isBoundarySix: true }))}
        className="score-btn btn-six"
        style={{ gridColumn: 'span 2', height: 64 }}
        disabled={disabled}
      >
        <span style={{ fontSize: '1.7rem' }}>6</span>
        <span style={{ fontSize: '0.72rem', letterSpacing: '1px', fontWeight: 800 }}>SIX! 🚀</span>
      </button>

      {/* Row 3: Common Extras */}
      <button
        onClick={() => handleAction(() => onScore({ extraType: 'wide', extraRuns: 1 }))}
        className="score-btn btn-wide"
        disabled={disabled}
      >
        <span>Wd</span>
        <span style={{ fontSize: '0.62rem', color: '#7DD3FC' }}>+1 WIDE</span>
      </button>

      <button
        onClick={() => handleAction(() => onScore({ extraType: 'no_ball', extraRuns: 1 }))}
        className="score-btn btn-noball"
        disabled={disabled}
      >
        <span>Nb</span>
        <span style={{ fontSize: '0.62rem', color: '#FCD34D' }}>+1 NO-BALL</span>
      </button>

      <button
        onClick={() => handleAction(() => onScore({ extraType: 'bye', extraRuns: 1 }))}
        className="score-btn btn-bye"
        disabled={disabled}
      >
        <span>1 B</span>
        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>BYE</span>
      </button>

      <button
        onClick={() => handleAction(() => onScore({ extraType: 'leg_bye', extraRuns: 1 }))}
        className="score-btn btn-bye"
        disabled={disabled}
      >
        <span>1 LB</span>
        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>LEG BYE</span>
      </button>

      {/* Row 4: Dismissal, Undo, More Extras */}
      <button
        onClick={() => handleAction(onOpenWicketModal)}
        className="score-btn btn-wicket"
        disabled={disabled}
      >
        <ShieldAlert size={18} />
        <span>WICKET</span>
      </button>

      <button
        onClick={() => handleAction(onUndo)}
        className="score-btn btn-undo"
        title="Undo last delivery"
        disabled={disabled}
      >
        <RotateCcw size={18} />
        <span style={{ fontSize: '0.62rem' }}>UNDO</span>
      </button>

      <button
        onClick={() => handleAction(onOpenMoreExtras)}
        className="score-btn btn-undo"
        title="More Extras and Penalty runs"
        disabled={disabled}
      >
        <MoreHorizontal size={20} />
        <span style={{ fontSize: '0.62rem' }}>MORE</span>
      </button>
    </div>
  );
};
