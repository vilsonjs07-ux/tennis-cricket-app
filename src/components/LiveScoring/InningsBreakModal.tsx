import React, { useState } from 'react';
import { InningsState, Match } from '../../types/cricket';
import { useMatchStore } from '../../store/useMatchStore';
import { Trophy, Play, Plus } from 'lucide-react';

interface InningsBreakModalProps {
  isOpen: boolean;
  match: Match;
  innings1: InningsState;
  onStartSecondInnings: (strikerId: string, nonStrikerId: string, bowlerId: string) => void;
}

export const InningsBreakModal: React.FC<InningsBreakModalProps> = ({
  isOpen,
  match,
  innings1,
  onStartSecondInnings,
}) => {
  if (!isOpen) return null;

  const { addPlayerToCurrentMatch } = useMatchStore();
  const target = innings1.totalRuns + 1;
  const chasingTeam = innings1.battingTeamId === match.teamA.id ? match.teamB : match.teamA;
  const defendingTeam = innings1.battingTeamId === match.teamA.id ? match.teamA : match.teamB;

  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');

  const [newChasePlayer, setNewChasePlayer] = useState('');
  const [newDefendPlayer, setNewDefendPlayer] = useState('');

  const handleAddChasePlayer = () => {
    if (!newChasePlayer.trim()) return;
    const added = addPlayerToCurrentMatch(chasingTeam.id, newChasePlayer.trim(), 'batter');
    if (added) {
      if (!strikerId) setStrikerId(added.id);
      else if (!nonStrikerId) setNonStrikerId(added.id);
      setNewChasePlayer('');
    }
  };

  const handleAddDefendPlayer = () => {
    if (!newDefendPlayer.trim()) return;
    const added = addPlayerToCurrentMatch(defendingTeam.id, newDefendPlayer.trim(), 'bowler');
    if (added) {
      setBowlerId(added.id);
      setNewDefendPlayer('');
    }
  };

  const handleStart = () => {
    if (!strikerId || !nonStrikerId || !bowlerId) {
      alert('Please select both opening batters and the opening bowler for the chase.');
      return;
    }
    if (strikerId === nonStrikerId) {
      alert('Striker and Non-Striker must be two different players.');
      return;
    }

    onStartSecondInnings(strikerId, nonStrikerId, bowlerId);
  };

  const totalOvers = match.settings.oversPerInnings || match.settings.rules.oversPerInnings || 6;

  return (
    <div className="modal-overlay">
      <div className="modal-sheet" style={{ padding: '24px 20px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
            }}
          >
            <Trophy size={28} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FCD34D', letterSpacing: '0.5px' }}>
            INNINGS BREAK
          </span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, marginTop: 2 }}>
            Target: {target} Runs
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            {innings1.battingTeamName} finished at{' '}
            <strong style={{ color: '#FFFFFF' }}>
              {innings1.totalRuns}/{innings1.totalWickets}
            </strong>{' '}
            in {innings1.oversFormatted} overs.
          </p>
        </div>

        {/* Chase Target Callout */}
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: 18,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#6EE7B7' }}>
            {chasingTeam.name} needs{' '}
            <strong style={{ color: '#FFFFFF', fontSize: '1rem' }}>{target} runs</strong> from{' '}
            <strong>{totalOvers * 6} balls</strong> ({totalOvers} ov) to win!
          </div>
        </div>

        {/* Select 2nd Innings Openers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Opening Striker ({chasingTeam.name})</label>
            <select className="input-field" value={strikerId} onChange={e => setStrikerId(e.target.value)}>
              <option value="">-- Select Striker --</option>
              {chasingTeam.players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Opening Non-Striker ({chasingTeam.name})</label>
            <select className="input-field" value={nonStrikerId} onChange={e => setNonStrikerId(e.target.value)}>
              <option value="">-- Select Non-Striker --</option>
              {chasingTeam.players
                .filter(p => p.id !== strikerId)
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Quick Add Batter to Chasing Team */}
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder={`Add batter to ${chasingTeam.name}...`}
              className="input-field"
              value={newChasePlayer}
              onChange={e => setNewChasePlayer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddChasePlayer()}
              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
            />
            <button
              type="button"
              onClick={handleAddChasePlayer}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            >
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="input-group" style={{ marginBottom: 0, marginTop: 6 }}>
            <label className="input-label">Opening Bowler ({defendingTeam.name})</label>
            <select className="input-field" value={bowlerId} onChange={e => setBowlerId(e.target.value)}>
              <option value="">-- Select Bowler --</option>
              {defendingTeam.players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Add Bowler to Defending Team */}
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder={`Add bowler to ${defendingTeam.name}...`}
              className="input-field"
              value={newDefendPlayer}
              onChange={e => setNewDefendPlayer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddDefendPlayer()}
              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
            />
            <button
              type="button"
              onClick={handleAddDefendPlayer}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        <button onClick={handleStart} className="btn-primary">
          <Play size={18} />
          <span>Start 2nd Innings (Chase)</span>
        </button>
      </div>
    </div>
  );
};
