import React, { useState } from 'react';
import { useMatchStore } from '../../store/useMatchStore';
import { Team, Player } from '../../types/cricket';
import { Plus, Users, Shield, Trash2, Edit2, Check, UserPlus } from 'lucide-react';

export const TeamsScreen: React.FC = () => {
  const { savedTeams, addNewTeam, updateTeam } = useMatchStore();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(savedTeams[0]?.id || '');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // New team form
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamEmoji, setNewTeamEmoji] = useState('⚡');
  const [newTeamColor, setNewTeamColor] = useState('#10B981');

  // New player form
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<'batter' | 'bowler' | 'all_rounder' | 'wicketkeeper'>('all_rounder');

  const activeTeam = savedTeams.find(t => t.id === selectedTeamId) || savedTeams[0];

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    const teamId = `team_${Date.now()}`;
    const newTeam: Team = {
      id: teamId,
      name: newTeamName.trim(),
      shortName: newTeamName.substring(0, 3).toUpperCase(),
      emoji: newTeamEmoji,
      color: newTeamColor,
      players: [
        { id: `p_${Date.now()}_1`, name: 'Player 1', isCaptain: true, role: 'all_rounder' },
        { id: `p_${Date.now()}_2`, name: 'Player 2', role: 'batter' },
      ],
    };
    addNewTeam(newTeam);
    setSelectedTeamId(teamId);
    setIsCreatingTeam(false);
    setNewTeamName('');
  };

  const handleAddPlayer = () => {
    if (!activeTeam || !newPlayerName.trim()) return;
    const newP: Player = {
      id: `p_${Date.now()}`,
      name: newPlayerName.trim(),
      jerseyNumber: activeTeam.players.length + 1,
      role: newPlayerRole,
      isWicketkeeper: newPlayerRole === 'wicketkeeper',
    };
    const updated: Team = {
      ...activeTeam,
      players: [...activeTeam.players, newP],
    };
    updateTeam(updated);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (playerId: string) => {
    if (!activeTeam) return;
    const updated: Team = {
      ...activeTeam,
      players: activeTeam.players.filter(p => p.id !== playerId),
    };
    updateTeam(updated);
  };

  return (
    <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800 }}>
            My Teams & Squads
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Manage gully squads, roster, and player roles
          </p>
        </div>

        <button
          onClick={() => setIsCreatingTeam(!isCreatingTeam)}
          className="btn-primary"
          style={{ padding: '8px 12px', fontSize: '0.8rem', width: 'auto' }}
        >
          <Plus size={15} />
          <span>New Team</span>
        </button>
      </div>

      {/* New Team Form Sheet */}
      {isCreatingTeam && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF' }}>Create New Team</div>

          <div className="input-group">
            <label className="input-label">Team Name</label>
            <input
              type="text"
              placeholder="e.g. Street Warriors"
              className="input-field"
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">Emoji / Icon</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['⚡', '🔥', '👑', '🦁', '🦅', '🏏', '🐺', '⭐'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewTeamEmoji(emoji)}
                    style={{
                      background: newTeamEmoji === emoji ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface)',
                      border: `1px solid ${newTeamEmoji === emoji ? '#10B981' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={() => setIsCreatingTeam(false)} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button onClick={handleCreateTeam} className="btn-primary" style={{ flex: 1 }}>
              Save Team
            </button>
          </div>
        </div>
      )}

      {/* Team Selection Pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {savedTeams.map(t => {
          const isSelected = t.id === activeTeam?.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              style={{
                background: isSelected ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg-card)',
                border: `1px solid ${isSelected ? '#10B981' : 'var(--border-subtle)'}`,
                color: isSelected ? '#34D399' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-full)',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <span>{t.emoji}</span>
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Team Squad Card */}
      {activeTeam && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.5rem' }}>{activeTeam.emoji}</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800 }}>
                  {activeTeam.name}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {activeTeam.players.length} Registered Players
                </span>
              </div>
            </div>
          </div>

          {/* Player Roster */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeTeam.players.map((p, idx) => (
              <div
                key={p.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    #{p.jerseyNumber || idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {p.name} {p.isCaptain ? '⭐ (C)' : ''} {p.isWicketkeeper ? '🧤 (WK)' : ''}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {p.role?.replace('_', ' ') || 'Player'}
                    </div>
                  </div>
                </div>

                {activeTeam.players.length > 2 && (
                  <button
                    onClick={() => handleRemovePlayer(p.id)}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}
                    title="Remove player"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Player Box */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
              Add Player to {activeTeam.name}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input
                type="text"
                placeholder="Player name"
                className="input-field"
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 2 }}
              />
              <select
                className="input-field"
                value={newPlayerRole}
                onChange={e => setNewPlayerRole(e.target.value as any)}
                style={{ padding: '8px', fontSize: '0.78rem', flex: 1.5 }}
              >
                <option value="batter">🏏 Batter</option>
                <option value="bowler">🎯 Bowler</option>
                <option value="all_rounder">⚡ All-Rounder</option>
                <option value="wicketkeeper">🧤 Wicketkeeper</option>
              </select>
            </div>
            <button onClick={handleAddPlayer} className="btn-secondary" style={{ width: '100%', padding: '9px', fontSize: '0.82rem' }}>
              <UserPlus size={15} />
              <span>Add Player</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
