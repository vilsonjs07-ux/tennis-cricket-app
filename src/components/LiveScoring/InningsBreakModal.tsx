import React, { useState } from 'react';
import { InningsState, Match, Player, Team } from '../../types/cricket';
import { Trophy, ArrowRight, Play } from 'lucide-react';

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

  const target = innings1.totalRuns + 1;
  const chasingTeam = innings1.battingTeamId === match.teamA.id ? match.teamB : match.teamA;
  const defendingTeam = innings1.battingTeamId === match.teamA.id ? match.teamA : match.teamB;

  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');

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

  return (
    <div className="modal-overlay">
      <div className="modal-sheet" style={{ padding: '24px 20px' }}>
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
            <strong>{match.settings.oversPerInnings * 6} balls</strong> to win!
          </div>
        </div>

        {/* Select 2nd Innings Openers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
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

          <div className="input-group" style={{ marginBottom: 0 }}>
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
        </div>

        <button onClick={handleStart} className="btn-primary">
          <Play size={18} />
          <span>Start 2nd Innings (Chase)</span>
        </button>
      </div>
    </div>
  );
};
