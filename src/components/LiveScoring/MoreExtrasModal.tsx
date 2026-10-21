import React, { useState } from 'react';
import { ScoreInput } from '../../engine/scoringEngine';
import { X, ShieldAlert, Award, PlusCircle, AlertCircle } from 'lucide-react';

interface MoreExtrasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScore: (input: ScoreInput) => void;
  onEndMatchManually: () => void;
}

export const MoreExtrasModal: React.FC<MoreExtrasModalProps> = ({
  isOpen,
  onClose,
  onScore,
  onEndMatchManually,
}) => {
  if (!isOpen) return null;

  const [customRuns, setCustomRuns] = useState<number>(5);

  const handleCustomRuns = (runs: number) => {
    onScore({ batterRuns: runs });
    onClose();
  };

  const handleWideWithRuns = (totalWideRuns: number) => {
    onScore({ extraType: 'wide', extraRuns: totalWideRuns });
    onClose();
  };

  const handleNoBallWithBatRuns = (batRuns: number) => {
    onScore({ extraType: 'no_ball', isNoBallOffBat: true, batterRuns: batRuns });
    onClose();
  };

  const handlePenaltyRuns = (penalty: number) => {
    onScore({ extraType: 'penalty', extraRuns: penalty });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800 }}>
            More Scoring & House Extras
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* 1. Custom Batter Runs (5 runs) */}
        <div style={{ marginBottom: 14 }}>
          <label className="input-label">Rare Batter Runs (Off the Bat)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[5, 7, 8].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => handleCustomRuns(r)}
                className="btn-secondary"
                style={{ fontSize: '0.9rem', padding: '10px' }}
              >
                {r} Runs
              </button>
            ))}
          </div>
        </div>

        {/* 2. Wide with Additional Byes */}
        <div style={{ marginBottom: 14 }}>
          <label className="input-label">Wide + Overthrow / Byes</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[2, 3, 4, 5].map(wRuns => (
              <button
                key={wRuns}
                type="button"
                onClick={() => handleWideWithRuns(wRuns)}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', padding: '10px' }}
              >
                +{wRuns} Wd
              </button>
            ))}
          </div>
        </div>

        {/* 3. No Ball with Boundary */}
        <div style={{ marginBottom: 14 }}>
          <label className="input-label">No-Ball + Bat Runs (Free Hit Next!)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleNoBallWithBatRuns(4)}
              className="btn-secondary"
              style={{ color: '#34D399', fontSize: '0.85rem', padding: '10px' }}
            >
              Nb + 4 Runs
            </button>
            <button
              type="button"
              onClick={() => handleNoBallWithBatRuns(6)}
              className="btn-secondary"
              style={{ color: '#FCD34D', fontSize: '0.85rem', padding: '10px' }}
            >
              Nb + 6 Runs
            </button>
            <button
              type="button"
              onClick={() => handleNoBallWithBatRuns(1)}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '10px' }}
            >
              Nb + 1 Single
            </button>
          </div>
        </div>

        {/* 4. Penalty Runs */}
        <div style={{ marginBottom: 18 }}>
          <label className="input-label">Penalty Runs Awarded</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => handlePenaltyRuns(5)}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '10px' }}
            >
              +5 Penalty Runs
            </button>
            <button
              type="button"
              onClick={() => handlePenaltyRuns(1)}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '10px' }}
            >
              +1 Penalty Run
            </button>
          </div>
        </div>

        {/* Manual match conclusion */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to end or abandon this match early?')) {
                onEndMatchManually();
                onClose();
              }
            }}
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              borderRadius: 'var(--radius-md)',
              padding: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <AlertCircle size={16} />
            <span>End Match Manually</span>
          </button>
        </div>
      </div>
    </div>
  );
};
