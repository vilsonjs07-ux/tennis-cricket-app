import React, { useState } from 'react';
import { InningsState, Team } from '../../types/cricket';
import { useMatchStore } from '../../store/useMatchStore';
import { Check, UserPlus, Plus, X } from 'lucide-react';

interface NextBowlerModalProps {
  isOpen: boolean;
  onSelectBowler: (bowlerId: string) => void;
  onClose?: () => void;
  innings: InningsState;
  bowlingTeam: Team;
  allowConsecutive: boolean;
}

export const NextBowlerModal: React.FC<NextBowlerModalProps> = ({
  isOpen,
  onSelectBowler,
  onClose,
  innings,
  bowlingTeam,
  allowConsecutive,
}) => {
  if (!isOpen) return null;

  const { addPlayerToCurrentMatch } = useMatchStore();
  const previousBowlerId = innings.previousBowlerId || innings.currentBowlerId;
  const [selectedBowlerId, setSelectedBowlerId] = useState<string>('');
  const [newBowlerName, setNewBowlerName] = useState<string>('');

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

  const handleAddNewBowler = () => {
    if (!newBowlerName.trim()) return;
    const added = addPlayerToCurrentMatch(bowlingTeam.id, newBowlerName.trim(), 'bowler');
    if (added) {
      setSelectedBowlerId(added.id);
      setNewBowlerName('');
    }
  };

  const handleConfirm = () => {
    let finalBowlerId = selectedBowlerId;
    if (!finalBowlerId && newBowlerName.trim()) {
      const added = addPlayerToCurrentMatch(bowlingTeam.id, newBowlerName.trim(), 'bowler');
      if (added) {
        finalBowlerId = added.id;
        setSelectedBowlerId(added.id);
        setNewBowlerName('');
      }
    }

    if (!finalBowlerId) {
      alert('Please select or add the bowler for the upcoming over.');
      return;
    }
    onSelectBowler(finalBowlerId);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ padding: '24px 20px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        )}
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
            Select Bowler 🎯
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Bowling Team: <strong style={{ color: '#FFFFFF' }}>{bowlingTeam.name}</strong> • Over {Math.floor(innings.legalDeliveries / 6) + 1}
          </p>
        </div>

        {/* Existing Bowlers List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
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

        {/* ➕ Add New Bowler While Bowling */}
        <div
          style={{
            marginBottom: 16,
            padding: '12px',
            background: 'rgba(56, 189, 248, 0.06)',
            border: '1px dashed rgba(56, 189, 248, 0.4)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38BDF8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} />
            <span>Add New Bowler to {bowlingTeam.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder="Enter bowler name..."
              className="input-field"
              value={newBowlerName}
              onChange={e => setNewBowlerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddNewBowler()}
              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
            />
            <button
              type="button"
              onClick={handleAddNewBowler}
              className="btn-secondary"
              style={{ padding: '8px 14px', whiteSpace: 'nowrap', fontSize: '0.8rem', background: '#38BDF8', color: '#0F172A', fontWeight: 800 }}
            >
              Add & Select
            </button>
          </div>
        </div>

        <button onClick={handleConfirm} className="btn-primary">
          <span>Start Next Over</span>
        </button>
      </div>
    </div>
  );
};
