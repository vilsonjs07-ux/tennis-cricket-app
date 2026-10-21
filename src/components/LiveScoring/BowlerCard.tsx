import React from 'react';
import { BowlerStats } from '../../types/cricket';
import { UserCheck } from 'lucide-react';

interface BowlerCardProps {
  bowler: BowlerStats;
  onChangeBowlerClick: () => void;
}

export const BowlerCard: React.FC<BowlerCardProps> = ({ bowler, onChangeBowlerClick }) => {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38BDF8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem',
          }}
        >
          🎯
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{bowler.playerName}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Econ: <strong style={{ color: '#FFFFFF' }}>{bowler.economy}</strong> • Maidens:{' '}
            <strong>{bowler.maidens}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'right' }}>
          <div
            className="tabular-nums"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}
          >
            {bowler.wickets}/{bowler.runsConceded}
          </div>
          <div className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {bowler.oversFormatted} ov
          </div>
        </div>

        <button
          onClick={onChangeBowlerClick}
          title="Change Bowler"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.7rem',
          }}
        >
          <UserCheck size={13} />
          <span>Change</span>
        </button>
      </div>
    </div>
  );
};
