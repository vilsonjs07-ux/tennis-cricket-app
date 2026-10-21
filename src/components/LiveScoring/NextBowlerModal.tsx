import React, { useState } from 'react';
import { InningsState, Player, Team } from '../../types/cricket';
import { Check, UserPlus } from 'lucide-react';

interface NextBowlerModalProps {
  isOpen: boolean;
  onSelectBowler: (bowlerId: string) => void;
  innings: InningsState;
  bowlingTeam: Team;
  allowConsecutive: boolean;
}

export const NextBowlerModal: React.FC<NextBowlerModalProps> = ({
  isOpen,
  onSelectBowler,
  innings,
  bowlingTeam,
  allowConsecutive,
}) => {
  if (!isOpen) return null;

  const previousBowlerId = innings.previousBowlerId || innings.currentBowlerId;
  const [selectedBowlerId, setSelectedBowlerId] = useState<string>('');

  const eligibleBowlers = bowlingTeam.players.map(player => {
    const isConsecutive = player.id === previousBowlerId;
    const isDisallowed = !allowConsecutive && isConsecutive && bowlingTeam.players.length > 2;
    const stats = innings.bowlers[player.id];
    return {
      player,
      isDisallowed,
      overs: stats ? stats.oversFormatted : '0.0',
      wickets: stats ? stats.wickets : 0,
      runs: stats ? stats.runsConceded : 0,
    };
  });

  const handleConfirm = () => {
    if (!selectedBowlerId) {
      alert('Please select the bowler for the upcoming over.');
      return;
    }
    onSelectBowler(selectedBowlerId);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-sheet" style={{ padding: '24px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--turf-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
            }}
          >
            <UserPlus size={24} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
            Over Completed! 🎯
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Select the bowler to bowl Over {Math.floor(innings.legalDeliveries / 6) + 1}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {eligibleBowlers.map(({ player, isDisallowed, overs, wickets, runs }) => {
            const isSelected = selectedBowlerId === player.id;
            return (
              <button
                key={player.id}
                type="button"
                disabled={isDisallowed}
                onClick={() => setSelectedBowlerId(player.id)}
                style={{
                  background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                  border: `1px solid ${isSelected ? '#10B981' : 'var(--border-subtle)'}`,
                  opacity: isDisallowed ? 0.4 : 1,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: isDisallowed ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {player.name} {isDisallowed ? '(Bowled Last Over)' : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Figures: {wickets}/{runs} ({overs} ov)
                  </div>
                </div>

                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? '#10B981' : 'var(--border-card)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSelected ? '#10B981' : 'transparent',
                  }}
                >
                  {isSelected && <Check size={14} color="#FFFFFF" />}
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={handleConfirm} className="btn-primary">
          <span>Start Next Over</span>
        </button>
      </div>
    </div>
  );
};
