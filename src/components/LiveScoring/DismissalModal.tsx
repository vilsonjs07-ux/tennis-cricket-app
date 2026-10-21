import React, { useState } from 'react';
import { DismissalType, InningsState, Player, Team } from '../../types/cricket';
import { ScoreInput } from '../../engine/scoringEngine';
import { X, ShieldAlert, Check, Ban } from 'lucide-react';

interface DismissalModalProps {
  isOpen: boolean;
  onClose: () => void;
  innings: InningsState;
  battingTeam: Team;
  bowlingTeam: Team;
  onConfirmWicket: (input: ScoreInput) => void;
}

export const DismissalModal: React.FC<DismissalModalProps> = ({
  isOpen,
  onClose,
  innings,
  battingTeam,
  bowlingTeam,
  onConfirmWicket,
}) => {
  if (!isOpen) return null;

  const strikerId = innings.currentStrikerId;
  const nonStrikerId = innings.currentNonStrikerId;

  const [dismissedId, setDismissedId] = useState<string>(strikerId);
  const [dismissalType, setDismissalType] = useState<DismissalType>('bowled');
  const [fielderId, setFielderId] = useState<string>('');
  const [runsBeforeOut, setRunsBeforeOut] = useState<number>(0);
  const [incomingPlayerId, setIncomingPlayerId] = useState<string>('');

  const alreadyBattedIds = Object.keys(innings.batters);
  const availableBatters = battingTeam.players.filter(p => !alreadyBattedIds.includes(p.id));

  const handleConfirm = () => {
    const isLastWicket = availableBatters.length === 0;
    if (!isLastWicket && !incomingPlayerId) {
      alert('Please select the incoming next batter.');
      return;
    }

    const input: ScoreInput = {
      wicket: {
        dismissalType,
        dismissedPlayerId: dismissedId,
        fielderPlayerId: fielderId || undefined,
        runsBeforeDismissal: runsBeforeOut,
        incomingPlayerId: incomingPlayerId || undefined,
      },
    };

    onConfirmWicket(input);
    onClose();
  };

  // Official Cricket Dismissals (EXCEPT LBW)
  const dismissalOptions: { type: DismissalType; label: string; desc?: string }[] = [
    { type: 'bowled', label: '🎯 Clean Bowled', desc: 'Ball hits the stumps' },
    { type: 'caught', label: '🧤 Caught (Outfield)', desc: 'Fielder catch' },
    { type: 'caught_behind', label: '🧤 Caught Behind', desc: 'Keeper catch' },
    { type: 'caught_and_bowled', label: '🏏 Caught & Bowled', desc: 'Return catch by bowler' },
    { type: 'stumped', label: '⚡ Stumped', desc: 'Keeper stumping' },
    { type: 'run_out', label: '🏃 Run Out', desc: 'Direct hit / bails broken' },
    { type: 'hit_wicket', label: '💥 Hit Wicket', desc: 'Dislodged bails with bat/body' },
    { type: 'retired_hurt', label: '🚑 Retired Hurt', desc: 'Injury / illness' },
    { type: 'retired_out', label: '🚪 Retired Out', desc: 'Tactical retirement' },
    { type: 'obstructing_field', label: '🚫 Obstructing Field', desc: 'Field obstruction' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={18} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800 }}>
              Record Wicket Dismissal
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tennis Cricket No LBW Badge */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 10px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.74rem',
            color: '#FCA5A5',
          }}
        >
          <Ban size={14} color="#EF4444" />
          <span>
            <strong>Tennis Cricket Convention:</strong> LBW is disabled as per official tournament rules.
          </span>
        </div>

        {/* 1. Who is Out? */}
        <div className="input-group">
          <label className="input-label">Dismissed Batter</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => setDismissedId(strikerId)}
              style={{
                background: dismissedId === strikerId ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-card)',
                border: `1px solid ${dismissedId === strikerId ? '#EF4444' : 'var(--border-subtle)'}`,
                color: dismissedId === strikerId ? '#F87171' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              🏏 Striker: {innings.batters[strikerId]?.playerName}
            </button>
            <button
              type="button"
              onClick={() => setDismissedId(nonStrikerId)}
              style={{
                background: dismissedId === nonStrikerId ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-card)',
                border: `1px solid ${dismissedId === nonStrikerId ? '#EF4444' : 'var(--border-subtle)'}`,
                color: dismissedId === nonStrikerId ? '#F87171' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              🏃 Non-Striker: {innings.batters[nonStrikerId]?.playerName}
            </button>
          </div>
        </div>

        {/* 2. Dismissal Type Grid */}
        <div className="input-group">
          <label className="input-label">Dismissal Type (Official Laws)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {dismissalOptions.map(opt => (
              <button
                key={opt.type}
                type="button"
                onClick={() => setDismissalType(opt.type)}
                style={{
                  background: dismissalType === opt.type ? 'rgba(239, 68, 68, 0.18)' : 'var(--bg-card)',
                  border: `1px solid ${dismissalType === opt.type ? '#EF4444' : 'var(--border-subtle)'}`,
                  color: dismissalType === opt.type ? '#FFFFFF' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 10px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Fielder (if caught, run out, or stumped) */}
        {(dismissalType === 'caught' || dismissalType === 'run_out' || dismissalType === 'stumped' || dismissalType === 'caught_behind') && (
          <div className="input-group">
            <label className="input-label">Fielder / Catcher / Wicketkeeper</label>
            <select
              className="input-field"
              value={fielderId}
              onChange={e => setFielderId(e.target.value)}
            >
              <option value="">-- Select Fielder (or Unassisted) --</option>
              {bowlingTeam.players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isWicketkeeper ? '(WK)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 4. Runs before run out */}
        {dismissalType === 'run_out' && (
          <div className="input-group">
            <label className="input-label">Runs Completed Before Run Out</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 1, 2, 3].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRunsBeforeOut(r)}
                  style={{
                    flex: 1,
                    background: runsBeforeOut === r ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)',
                    border: `1px solid ${runsBeforeOut === r ? '#10B981' : 'var(--border-subtle)'}`,
                    color: runsBeforeOut === r ? '#34D399' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Incoming Next Batter */}
        {availableBatters.length > 0 ? (
          <div className="input-group">
            <label className="input-label">Incoming Next Batter</label>
            <select
              className="input-field"
              value={incomingPlayerId}
              onChange={e => setIncomingPlayerId(e.target.value)}
            >
              <option value="">-- Select Next Batter --</option>
              {availableBatters.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              fontSize: '0.8rem',
              color: '#FCA5A5',
              marginBottom: 12,
            }}
          >
            ⚠️ No more batters available. Innings will conclude All Out!
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          className="btn-primary"
          style={{
            background: 'linear-gradient(135deg, #B91C1C, #EF4444)',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
            marginTop: 8,
          }}
        >
          <Check size={18} />
          <span>Confirm Dismissal</span>
        </button>
      </div>
    </div>
  );
};
