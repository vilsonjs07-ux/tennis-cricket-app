import React from 'react';
import { InningsState } from '../../types/cricket';
import { ArrowLeftRight } from 'lucide-react';

interface CreaseBattersProps {
  innings: InningsState;
  onSwapStrike: () => void;
}

export const CreaseBatters: React.FC<CreaseBattersProps> = ({ innings, onSwapStrike }) => {
  const striker = innings.batters[innings.currentStrikerId];
  const nonStriker = innings.batters[innings.currentNonStrikerId];

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
          BATTERS ON CREASE
        </span>
        <button
          onClick={onSwapStrike}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 8px',
            color: 'var(--turf-green)',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ArrowLeftRight size={12} />
          <span>Swap Strike</span>
        </button>
      </div>

      {/* Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 45px 35px 35px 45px',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textAlign: 'right',
          paddingBottom: 2,
        }}
      >
        <div style={{ textAlign: 'left' }}>BATTER</div>
        <div>R</div>
        <div>B</div>
        <div>4s</div>
        <div>SR</div>
      </div>

      {/* Striker Row */}
      {striker && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 45px 35px 35px 45px',
            alignItems: 'center',
            background: 'rgba(16, 185, 129, 0.08)',
            borderLeft: '3px solid var(--turf-green)',
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.86rem',
            fontWeight: 700,
            textAlign: 'right',
          }}
        >
          <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🏏</span>
            <span style={{ color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {striker.playerName} *
            </span>
          </div>
          <div className="tabular-nums" style={{ color: '#FFFFFF', fontWeight: 800 }}>
            {striker.runs}
          </div>
          <div className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {striker.ballsFaced}
          </div>
          <div className="tabular-nums" style={{ color: 'var(--turf-green)' }}>
            {striker.fours}
          </div>
          <div className="tabular-nums" style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            {striker.strikeRate}
          </div>
        </div>
      )}

      {/* Non-Striker Row */}
      {nonStriker && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 45px 35px 35px 45px',
            alignItems: 'center',
            padding: '6px 8px',
            fontSize: '0.86rem',
            fontWeight: 600,
            textAlign: 'right',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ opacity: 0.4 }}>🏏</span>
            <span style={{ color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {nonStriker.playerName}
            </span>
          </div>
          <div className="tabular-nums" style={{ color: '#E2E8F0', fontWeight: 700 }}>
            {nonStriker.runs}
          </div>
          <div className="tabular-nums">{nonStriker.ballsFaced}</div>
          <div className="tabular-nums">{nonStriker.fours}</div>
          <div className="tabular-nums" style={{ fontSize: '0.78rem' }}>
            {nonStriker.strikeRate}
          </div>
        </div>
      )}
    </div>
  );
};
