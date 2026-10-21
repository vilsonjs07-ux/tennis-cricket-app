import React, { useState } from 'react';
import { useMatchStore } from '../../store/useMatchStore';
import { MatchFormat, BallType, Player, Team, MatchSettings } from '../../types/cricket';
import {
  ChevronRight,
  ChevronLeft,
  Users,
  Settings,
  Trophy,
  Plus,
  Coins,
  Shield,
  Ban,
  CheckCircle2,
} from 'lucide-react';

export const MatchWizard: React.FC = () => {
  const {
    wizardStep,
    setWizardStep,
    wizardSettings,
    updateWizardSettings,
    wizardTeamA,
    updateWizardTeamA,
    wizardTeamB,
    updateWizardTeamB,
    finalizeMatchSetup,
    recordToss,
    startFirstInnings,
    setActiveTab,
  } = useMatchStore();

  // Toss & Openers local state for Step 4
  const [isFlipping, setIsFlipping] = useState(false);
  const [tossResult, setTossResult] = useState<'heads' | 'tails' | null>(null);
  const [tossWinner, setTossWinner] = useState<'teamA' | 'teamB'>('teamA');
  const [tossChoice, setTossChoice] = useState<'bat' | 'bowl'>('bat');

  const [openingStrikerId, setOpeningStrikerId] = useState<string>('');
  const [openingNonStrikerId, setOpeningNonStrikerId] = useState<string>('');
  const [openingBowlerId, setOpeningBowlerId] = useState<string>('');

  const [newPlayerNameA, setNewPlayerNameA] = useState('');
  const [newPlayerNameB, setNewPlayerNameB] = useState('');

  const overs = wizardSettings.oversPerInnings || 8;
  const playersCount = wizardSettings.playersPerTeam || 8;

  // Add player to Team A
  const handleAddPlayerA = () => {
    if (!newPlayerNameA.trim()) return;
    const newP: Player = {
      id: `p_a_${Date.now()}`,
      name: newPlayerNameA.trim(),
      jerseyNumber: (wizardTeamA.players?.length || 0) + 1,
      role: 'batter',
    };
    updateWizardTeamA({
      players: [...(wizardTeamA.players || []), newP],
    });
    setNewPlayerNameA('');
  };

  // Add player to Team B
  const handleAddPlayerB = () => {
    if (!newPlayerNameB.trim()) return;
    const newP: Player = {
      id: `p_b_${Date.now()}`,
      name: newPlayerNameB.trim(),
      jerseyNumber: (wizardTeamB.players?.length || 0) + 1,
      role: 'batter',
    };
    updateWizardTeamB({
      players: [...(wizardTeamB.players || []), newP],
    });
    setNewPlayerNameB('');
  };

  // Coin Flip Simulation
  const handleFlipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTossResult(null);

    setTimeout(() => {
      const outcome = Math.random() > 0.5 ? 'heads' : 'tails';
      setTossResult(outcome);
      setIsFlipping(false);
    }, 1200);
  };

  const playersA = wizardTeamA.players || [];
  const playersB = wizardTeamB.players || [];

  const teamAWinsToss = tossWinner === 'teamA';
  const teamABatsFirst =
    (teamAWinsToss && tossChoice === 'bat') || (!teamAWinsToss && tossChoice === 'bowl');

  const battingTeamPlayers = teamABatsFirst ? playersA : playersB;
  const bowlingTeamPlayers = teamABatsFirst ? playersB : playersA;

  const handleStartMatch = () => {
    if (!openingStrikerId || !openingNonStrikerId || !openingBowlerId) {
      alert('Please select both opening batters and the opening bowler.');
      return;
    }
    if (openingStrikerId === openingNonStrikerId) {
      alert('Striker and Non-Striker must be two different players.');
      return;
    }

    const teamA: Team = {
      id: wizardTeamA.id || 'team_a',
      name: wizardTeamA.name || 'Royal Strikers',
      shortName: wizardTeamA.shortName || 'RS',
      emoji: wizardTeamA.emoji || '⚡',
      color: wizardTeamA.color || '#10B981',
      players: playersA,
    };

    const teamB: Team = {
      id: wizardTeamB.id || 'team_b',
      name: wizardTeamB.name || 'Thunder Titans',
      shortName: wizardTeamB.shortName || 'TT',
      emoji: wizardTeamB.emoji || '🔥',
      color: wizardTeamB.color || '#3B82F6',
      players: playersB,
    };

    const finalSettings: MatchSettings = {
      title: wizardSettings.title || 'Tennis Cricket Match',
      format: (wizardSettings.format as MatchFormat) || 't10',
      date: wizardSettings.date || new Date().toISOString().split('T')[0],
      location: wizardSettings.location,
      ballType: (wizardSettings.ballType as BallType) || 'tennis_heavy',
      playersPerTeam: playersCount,
      oversPerInnings: overs,
      inningsPerTeam: 1,
      rules: {
        ...wizardSettings.rules!,
        allowLBW: false, // NO LBW IN TENNIS BALL CRICKET
      },
    };

    finalizeMatchSetup(finalSettings, teamA, teamB);
    const winnerId = tossWinner === 'teamA' ? teamA.id : teamB.id;
    recordToss(winnerId, tossChoice);
    startFirstInnings(openingStrikerId, openingNonStrikerId, openingBowlerId);
  };

  return (
    <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Wizard Step Progress Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--turf-green)', letterSpacing: '0.5px' }}>
            STEP {wizardStep} OF 4
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800 }}>
            {wizardStep === 1 && 'Match Details'}
            {wizardStep === 2 && 'Teams & Squads'}
            {wizardStep === 3 && 'Tennis Cricket Rules'}
            {wizardStep === 4 && 'Toss & Opening Crease'}
          </h2>
        </div>

        <button
          onClick={() => setActiveTab('home')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ height: 4, background: 'var(--bg-card)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${(wizardStep / 4) * 100}%`,
            background: 'linear-gradient(90deg, #059669, #10B981)',
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      {/* STEP 1: MATCH DETAILS */}
      {wizardStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group">
            <label className="input-label">Match / Tournament Title</label>
            <input
              type="text"
              className="input-field"
              value={wizardSettings.title || ''}
              onChange={e => updateWizardSettings({ title: e.target.value })}
              placeholder="e.g. Premier Tennis Cup Match 1, Sunday Derby"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Match Format</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { format: 't10', label: 'T10 (10 ov)', overs: 10 },
                { format: 't12', label: 'T12 (12 ov)', overs: 12 },
                { format: 't20', label: 'T20 (20 ov)', overs: 20 },
                { format: 'custom', label: '8 Overs', overs: 8 },
              ].map(item => (
                <button
                  key={item.format}
                  type="button"
                  onClick={() => {
                    updateWizardSettings({
                      format: item.format as MatchFormat,
                      oversPerInnings: item.overs,
                    });
                  }}
                  style={{
                    background: wizardSettings.format === item.format ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                    border: `1px solid ${wizardSettings.format === item.format ? '#10B981' : 'var(--border-card)'}`,
                    color: wizardSettings.format === item.format ? '#34D399' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="input-group">
              <label className="input-label">Overs per Innings</label>
              <input
                type="number"
                min="1"
                max="50"
                className="input-field tabular-nums"
                value={wizardSettings.oversPerInnings || 8}
                onChange={e => updateWizardSettings({ oversPerInnings: Number(e.target.value) || 8 })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Players per Team</label>
              <input
                type="number"
                min="2"
                max="15"
                className="input-field tabular-nums"
                value={wizardSettings.playersPerTeam || 8}
                onChange={e => updateWizardSettings({ playersPerTeam: Number(e.target.value) || 8 })}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Ground / Stadium Venue</label>
            <input
              type="text"
              className="input-field"
              value={wizardSettings.location || ''}
              onChange={e => updateWizardSettings({ location: e.target.value })}
              placeholder="e.g. City Turf Ground, Stadium Pitch 2"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Ball Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { type: 'tennis_heavy', label: '🎾 Heavy Tennis (Vicky/Cosco)' },
                { type: 'tape_ball', label: '🏏 Tape Ball' },
                { type: 'tennis_light', label: '🟢 Light Tennis' },
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => updateWizardSettings({ ballType: item.type as BallType })}
                  style={{
                    background: wizardSettings.ballType === item.type ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                    border: `1px solid ${wizardSettings.ballType === item.type ? '#10B981' : 'var(--border-card)'}`,
                    color: wizardSettings.ballType === item.type ? '#34D399' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 4px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setWizardStep(2)} className="btn-primary" style={{ marginTop: 10 }}>
            <span>Next: Teams & Squads</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* STEP 2: TEAM SETUP */}
      {wizardStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Team A */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.3rem' }}>{wizardTeamA.emoji || '⚡'}</span>
                <input
                  type="text"
                  value={wizardTeamA.name || ''}
                  onChange={e => updateWizardTeamA({ name: e.target.value })}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    padding: '2px 4px',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {playersA.length} Players
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {playersA.map(p => (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{p.name}</span>
                  <button
                    onClick={() =>
                      updateWizardTeamA({
                        players: playersA.filter(x => x.id !== p.id),
                      })
                    }
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Add player name"
                className="input-field"
                value={newPlayerNameA}
                onChange={e => setNewPlayerNameA(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPlayerA()}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <button onClick={handleAddPlayerA} className="btn-secondary" style={{ padding: '8px 14px' }}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Team B */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.3rem' }}>{wizardTeamB.emoji || '🔥'}</span>
                <input
                  type="text"
                  value={wizardTeamB.name || ''}
                  onChange={e => updateWizardTeamB({ name: e.target.value })}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    padding: '2px 4px',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {playersB.length} Players
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {playersB.map(p => (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{p.name}</span>
                  <button
                    onClick={() =>
                      updateWizardTeamB({
                        players: playersB.filter(x => x.id !== p.id),
                      })
                    }
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Add player name"
                className="input-field"
                value={newPlayerNameB}
                onChange={e => setNewPlayerNameB(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPlayerB()}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <button onClick={handleAddPlayerB} className="btn-secondary" style={{ padding: '8px 14px' }}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button onClick={() => setWizardStep(1)} className="btn-secondary" style={{ flex: 1 }}>
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                if (playersA.length < 2 || playersB.length < 2) {
                  alert('Please add at least 2 players per team.');
                  return;
                }
                setWizardStep(3);
              }}
              className="btn-primary"
              style={{ flex: 2 }}
            >
              <span>Next: Tennis Rules</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TENNIS BALL RULES */}
      {wizardStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Mandatory Tennis Ball Rule Banner: NO LBW */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
                flexShrink: 0,
              }}
            >
              <Ban size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FCA5A5' }}>
                LBW RULE IS DISABLED
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                As per standard Tennis Ball Cricket conventions, Leg Before Wicket (LBW) cannot be given. All other official cricket rules strictly apply.
              </div>
            </div>
          </div>

          {/* Official Rule 1: No-Ball & Free Hit */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid #10B981',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                🚨 Free Hit on No-Balls
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Front foot or waist height overstep grants 1 run penalty + Free Hit next delivery
              </div>
            </div>
            <CheckCircle2 size={20} color="#10B981" />
          </div>

          {/* Official Rule 2: Wide Re-Ball */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid #10B981',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                ↔️ Wide Ball Tramlines & Re-Ball
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                1 run penalty, does not count as legal delivery, re-ball required
              </div>
            </div>
            <CheckCircle2 size={20} color="#10B981" />
          </div>

          {/* Official Rule 3: Bowlers Must Alternate */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid #10B981',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                🔄 Alternating Bowlers per Over
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Official MCC law: Same bowler cannot bowl consecutive overs from either end
              </div>
            </div>
            <CheckCircle2 size={20} color="#10B981" />
          </div>

          {/* Max overs per bowler */}
          <div className="input-group" style={{ marginTop: 6 }}>
            <label className="input-label">Max Overs per Bowler (Quota)</label>
            <input
              type="number"
              min="1"
              max="10"
              className="input-field tabular-nums"
              value={wizardSettings.rules?.maxOversPerBowler || Math.ceil(overs / 4)}
              onChange={e =>
                updateWizardSettings({
                  rules: {
                    ...wizardSettings.rules!,
                    maxOversPerBowler: Number(e.target.value) || 2,
                  },
                })
              }
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button onClick={() => setWizardStep(2)} className="btn-secondary" style={{ flex: 1 }}>
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>
            <button onClick={() => setWizardStep(4)} className="btn-primary" style={{ flex: 2 }}>
              <span>Next: Toss & Openers</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: TOSS & OPENING CREASE */}
      {wizardStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--turf-green)', marginBottom: 12 }}>
              🪙 OFFICIAL MATCH TOSS
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <div
                className={isFlipping ? 'flipping' : ''}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #F59E0B, #B45309)',
                  border: '3px solid #FCD34D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
                }}
              >
                {tossResult ? (tossResult === 'heads' ? '👑' : '⚡') : '🪙'}
              </div>
            </div>

            {tossResult && (
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FCD34D', marginBottom: 12 }}>
                Result: {tossResult.toUpperCase()}!
              </div>
            )}

            <button
              onClick={handleFlipCoin}
              disabled={isFlipping}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 16px', margin: '0 auto 16px' }}
            >
              <Coins size={16} />
              <span>{isFlipping ? 'Flipping...' : 'Flip Coin'}</span>
            </button>

            {/* Who won the toss */}
            <div style={{ textAlign: 'left', marginBottom: 12 }}>
              <label className="input-label">Toss Winner</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setTossWinner('teamA')}
                  style={{
                    background: tossWinner === 'teamA' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface)',
                    border: `1px solid ${tossWinner === 'teamA' ? '#10B981' : 'var(--border-subtle)'}`,
                    color: tossWinner === 'teamA' ? '#34D399' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {wizardTeamA.name}
                </button>
                <button
                  type="button"
                  onClick={() => setTossWinner('teamB')}
                  style={{
                    background: tossWinner === 'teamB' ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-surface)',
                    border: `1px solid ${tossWinner === 'teamB' ? '#38BDF8' : 'var(--border-subtle)'}`,
                    color: tossWinner === 'teamB' ? '#38BDF8' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {wizardTeamB.name}
                </button>
              </div>
            </div>

            {/* Decision */}
            <div style={{ textAlign: 'left' }}>
              <label className="input-label">Decision</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setTossChoice('bat')}
                  style={{
                    background: tossChoice === 'bat' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface)',
                    border: `1px solid ${tossChoice === 'bat' ? '#10B981' : 'var(--border-subtle)'}`,
                    color: tossChoice === 'bat' ? '#34D399' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  🏏 Bat First
                </button>
                <button
                  type="button"
                  onClick={() => setTossChoice('bowl')}
                  style={{
                    background: tossChoice === 'bowl' ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-surface)',
                    border: `1px solid ${tossChoice === 'bowl' ? '#38BDF8' : 'var(--border-subtle)'}`,
                    color: tossChoice === 'bowl' ? '#38BDF8' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  🎯 Bowl First
                </button>
              </div>
            </div>
          </div>

          {/* Openers Selection */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 10 }}>
              🏏 SELECT OPENING BATTERS & BOWLER
            </div>

            {/* Striker */}
            <div className="input-group">
              <label className="input-label">Opening Striker (Facing first ball)</label>
              <select
                className="input-field"
                value={openingStrikerId}
                onChange={e => setOpeningStrikerId(e.target.value)}
              >
                <option value="">-- Select Striker --</option>
                {battingTeamPlayers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isCaptain ? '(C)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Non-Striker */}
            <div className="input-group">
              <label className="input-label">Opening Non-Striker (Runner)</label>
              <select
                className="input-field"
                value={openingNonStrikerId}
                onChange={e => setOpeningNonStrikerId(e.target.value)}
              >
                <option value="">-- Select Non-Striker --</option>
                {battingTeamPlayers
                  .filter(p => p.id !== openingStrikerId)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isCaptain ? '(C)' : ''}
                    </option>
                  ))}
              </select>
            </div>

            {/* Opening Bowler */}
            <div className="input-group">
              <label className="input-label">Opening Bowler</label>
              <select
                className="input-field"
                value={openingBowlerId}
                onChange={e => setOpeningBowlerId(e.target.value)}
              >
                <option value="">-- Select Opening Bowler --</option>
                {bowlingTeamPlayers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setWizardStep(3)} className="btn-secondary" style={{ flex: 1 }}>
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>
            <button
              onClick={handleStartMatch}
              className="btn-primary"
              style={{ flex: 2, padding: '14px' }}
            >
              <span>Start Match Now! 🏏</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
