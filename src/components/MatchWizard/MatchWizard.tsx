import React, { useState } from 'react';
import { useMatchStore } from '../../store/useMatchStore';
import { MatchFormat, BallType, Player, Team, MatchSettings } from '../../types/cricket';
import { DEFAULT_TENNIS_CRICKET_RULES } from '../../engine/scoringEngine';
import {
  ChevronRight,
  ChevronLeft,
  Users,
  Settings,
  Trophy,
  Plus,
  Minus,
  Coins,
  Trash2,
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
    clearWizardTeams,
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

  const [step3NewBatter, setStep3NewBatter] = useState('');
  const [step3NewBowler, setStep3NewBowler] = useState('');

  const overs = wizardSettings.oversPerInnings || 6;
  const playersCount = wizardSettings.playersPerTeam || 8;

  const handleOversChange = (delta: number) => {
    navigator?.vibrate?.(15);
    const current = wizardSettings.oversPerInnings || 6;
    const next = Math.min(50, Math.max(1, current + delta));
    updateWizardSettings({
      oversPerInnings: next,
      rules: { ...(wizardSettings.rules || DEFAULT_TENNIS_CRICKET_RULES), oversPerInnings: next },
    });
  };

  const handlePlayersChange = (delta: number) => {
    navigator?.vibrate?.(15);
    const current = wizardSettings.playersPerTeam || 8;
    const next = Math.min(20, Math.max(2, current + delta));
    updateWizardSettings({ playersPerTeam: next });
  };

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

  const handleAddStep3Batter = () => {
    if (!step3NewBatter.trim()) return;
    const isTeamABatting = teamABatsFirst;
    const newP: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: step3NewBatter.trim(),
      role: 'batter',
    };
    if (isTeamABatting) {
      updateWizardTeamA({ players: [...(wizardTeamA.players || []), newP] });
    } else {
      updateWizardTeamB({ players: [...(wizardTeamB.players || []), newP] });
    }
    if (!openingStrikerId) {
      setOpeningStrikerId(newP.id);
    } else if (!openingNonStrikerId && openingStrikerId !== newP.id) {
      setOpeningNonStrikerId(newP.id);
    }
    setStep3NewBatter('');
  };

  const handleAddStep3Bowler = () => {
    if (!step3NewBowler.trim()) return;
    const isTeamABowling = !teamABatsFirst;
    const newP: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: step3NewBowler.trim(),
      role: 'bowler',
    };
    if (isTeamABowling) {
      updateWizardTeamA({ players: [...(wizardTeamA.players || []), newP] });
    } else {
      updateWizardTeamB({ players: [...(wizardTeamB.players || []), newP] });
    }
    if (!openingBowlerId) {
      setOpeningBowlerId(newP.id);
    }
    setStep3NewBowler('');
  };

  const handleStartMatch = () => {
    let finalPlayersA = [...(wizardTeamA.players || [])];
    let finalPlayersB = [...(wizardTeamB.players || [])];
    let strikerId = openingStrikerId;
    let nonStrikerId = openingNonStrikerId;
    let bowlerId = openingBowlerId;

    const battingList = teamABatsFirst ? finalPlayersA : finalPlayersB;
    const bowlingList = teamABatsFirst ? finalPlayersB : finalPlayersA;

    if (!strikerId) {
      if (battingList.length > 0) {
        strikerId = battingList[0].id;
      } else {
        const p1: Player = { id: `p_${Date.now()}_1`, name: 'Batter 1', role: 'batter' };
        battingList.push(p1);
        strikerId = p1.id;
      }
    }

    if (!nonStrikerId) {
      const remainingBatters = battingList.filter(p => p.id !== strikerId);
      if (remainingBatters.length > 0) {
        nonStrikerId = remainingBatters[0].id;
      } else {
        const p2: Player = { id: `p_${Date.now()}_2`, name: 'Batter 2', role: 'batter' };
        battingList.push(p2);
        nonStrikerId = p2.id;
      }
    }

    if (!bowlerId) {
      if (bowlingList.length > 0) {
        bowlerId = bowlingList[0].id;
      } else {
        const b1: Player = { id: `p_${Date.now()}_3`, name: 'Bowler 1', role: 'bowler' };
        bowlingList.push(b1);
        bowlerId = b1.id;
      }
    }

    if (strikerId === nonStrikerId) {
      alert('Striker and Non-Striker must be two different players.');
      return;
    }

    const teamA: Team = {
      id: wizardTeamA.id || 'team_a',
      name: wizardTeamA.name?.trim() || 'Team 1',
      shortName: wizardTeamA.shortName?.trim() || 'T1',
      emoji: wizardTeamA.emoji || '🏏',
      color: wizardTeamA.color || '#10B981',
      players: finalPlayersA,
    };

    const teamB: Team = {
      id: wizardTeamB.id || 'team_b',
      name: wizardTeamB.name?.trim() || 'Team 2',
      shortName: wizardTeamB.shortName?.trim() || 'T2',
      emoji: wizardTeamB.emoji || '⚡',
      color: wizardTeamB.color || '#3B82F6',
      players: finalPlayersB,
    };

    const finalSettings: MatchSettings = {
      title: wizardSettings.title || 'Tennis Cricket Match',
      format: (wizardSettings.format as MatchFormat) || 'custom',
      date: wizardSettings.date || new Date().toISOString().split('T')[0],
      location: wizardSettings.location,
      ballType: (wizardSettings.ballType as BallType) || 'tennis_heavy',
      playersPerTeam: playersCount,
      oversPerInnings: overs,
      inningsPerTeam: 1,
      rules: {
        ...(wizardSettings.rules || DEFAULT_TENNIS_CRICKET_RULES),
        oversPerInnings: overs,
        maxOversPerBowler: Math.max(1, Math.ceil(overs / (playersCount >= 4 ? 4 : 2))),
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
            STEP {wizardStep} OF 3
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800 }}>
            {wizardStep === 1 && 'Match Details'}
            {wizardStep === 2 && 'Teams & Squads'}
            {wizardStep === 3 && 'Toss & Lineup'}
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
            width: `${(wizardStep / 3) * 100}%`,
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

          {/* Overs per Innings with Mobile Stepper */}
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Overs per Innings</label>
              <span style={{ fontSize: '0.82rem', color: 'var(--turf-green)', fontWeight: 800 }}>
                {wizardSettings.oversPerInnings || 6} OVERS
              </span>
            </div>

            {/* Touch Stepper Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => handleOversChange(-1)}
                aria-label="Decrease overs"
                style={{
                  width: 52,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  flexShrink: 0,
                }}
              >
                <Minus size={22} />
              </button>

              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                max="50"
                className="input-field tabular-nums"
                style={{
                  textAlign: 'center',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  height: 48,
                  color: '#34D399',
                  padding: '8px 12px',
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                }}
                value={wizardSettings.oversPerInnings === 0 ? '' : (wizardSettings.oversPerInnings ?? 6)}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '') {
                    updateWizardSettings({ oversPerInnings: 0 });
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      const next = Math.min(50, Math.max(1, num));
                      updateWizardSettings({
                        oversPerInnings: next,
                        rules: { ...(wizardSettings.rules || DEFAULT_TENNIS_CRICKET_RULES), oversPerInnings: next },
                      });
                    }
                  }
                }}
                onBlur={() => {
                  if (!wizardSettings.oversPerInnings || wizardSettings.oversPerInnings < 1) {
                    updateWizardSettings({
                      oversPerInnings: 6,
                      rules: { ...(wizardSettings.rules || DEFAULT_TENNIS_CRICKET_RULES), oversPerInnings: 6 },
                    });
                  }
                }}
              />

              <button
                type="button"
                onClick={() => handleOversChange(1)}
                aria-label="Increase overs"
                style={{
                  width: 52,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  flexShrink: 0,
                }}
              >
                <Plus size={22} />
              </button>
            </div>

            {/* Quick 1-Tap Presets */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {[2, 4, 6, 8, 10, 12, 15, 20].map(ov => (
                <button
                  key={ov}
                  type="button"
                  onClick={() => {
                    navigator?.vibrate?.(15);
                    updateWizardSettings({
                      oversPerInnings: ov,
                      rules: { ...(wizardSettings.rules || DEFAULT_TENNIS_CRICKET_RULES), oversPerInnings: ov },
                    });
                  }}
                  style={{
                    flex: 1,
                    minWidth: 40,
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    background: (wizardSettings.oversPerInnings || 6) === ov ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${(wizardSettings.oversPerInnings || 6) === ov ? '#10B981' : 'var(--border-card)'}`,
                    color: (wizardSettings.oversPerInnings || 6) === ov ? '#34D399' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                  }}
                >
                  {ov} ov
                </button>
              ))}
            </div>
          </div>

          {/* Players per Team with Mobile Stepper */}
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Players per Team</label>
              <span style={{ fontSize: '0.82rem', color: '#38BDF8', fontWeight: 800 }}>
                {wizardSettings.playersPerTeam || 8} PLAYERS
              </span>
            </div>

            {/* Touch Stepper Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => handlePlayersChange(-1)}
                aria-label="Decrease players"
                style={{
                  width: 52,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  flexShrink: 0,
                }}
              >
                <Minus size={22} />
              </button>

              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="2"
                max="20"
                className="input-field tabular-nums"
                style={{
                  textAlign: 'center',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  height: 48,
                  color: '#38BDF8',
                  padding: '8px 12px',
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                }}
                value={wizardSettings.playersPerTeam === 0 ? '' : (wizardSettings.playersPerTeam ?? 8)}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '') {
                    updateWizardSettings({ playersPerTeam: 0 });
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      updateWizardSettings({ playersPerTeam: Math.min(20, Math.max(2, num)) });
                    }
                  }
                }}
                onBlur={() => {
                  if (!wizardSettings.playersPerTeam || wizardSettings.playersPerTeam < 2) {
                    updateWizardSettings({ playersPerTeam: 8 });
                  }
                }}
              />

              <button
                type="button"
                onClick={() => handlePlayersChange(1)}
                aria-label="Increase players"
                style={{
                  width: 52,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  flexShrink: 0,
                }}
              >
                <Plus size={22} />
              </button>
            </div>

            {/* Quick 1-Tap Presets */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {[5, 6, 7, 8, 9, 10, 11].map(pl => (
                <button
                  key={pl}
                  type="button"
                  onClick={() => {
                    navigator?.vibrate?.(15);
                    updateWizardSettings({ playersPerTeam: pl });
                  }}
                  style={{
                    flex: 1,
                    minWidth: 40,
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    background: (wizardSettings.playersPerTeam || 8) === pl ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${(wizardSettings.playersPerTeam || 8) === pl ? '#38BDF8' : 'var(--border-card)'}`,
                    color: (wizardSettings.playersPerTeam || 8) === pl ? '#38BDF8' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                  }}
                >
                  {pl} P
                </button>
              ))}
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
          {/* Quick Clear All Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Enter custom team & player names, or add them on the field!
            </span>
            <button
              type="button"
              onClick={() => {
                clearWizardTeams();
                setNewPlayerNameA('');
                setNewPlayerNameB('');
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
              }}
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
          </div>

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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{ fontSize: '1.3rem' }}>{wizardTeamA.emoji || '🏏'}</span>
                <input
                  type="text"
                  placeholder="Team 1 Name (e.g. Red Warriors)"
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
                    width: '100%',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 8, whiteSpace: 'nowrap' }}>
                {playersA.length} Players
              </span>
            </div>

            {playersA.length === 0 ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, fontStyle: 'italic' }}>
                No players added yet. Add names below, or add them on the fly while scoring!
              </div>
            ) : (
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
            )}

            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Add player name..."
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{ fontSize: '1.3rem' }}>{wizardTeamB.emoji || '⚡'}</span>
                <input
                  type="text"
                  placeholder="Team 2 Name (e.g. Blue Titans)"
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
                    width: '100%',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 8, whiteSpace: 'nowrap' }}>
                {playersB.length} Players
              </span>
            </div>

            {playersB.length === 0 ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, fontStyle: 'italic' }}>
                No players added yet. Add names below, or add them on the fly while scoring!
              </div>
            ) : (
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
            )}

            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Add player name..."
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
              <span>Next: Toss & Lineup</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TOSS & OPENING CREASE */}
      {wizardStep === 3 && (
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

            {/* Quick Add Players in Step 3 */}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Don't see your players? Add them quickly below or start now and add them during the game:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {/* Add Batter */}
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34D399', marginBottom: 4 }}>
                    + Batter to {teamABatsFirst ? (wizardTeamA.name || 'Team 1') : (wizardTeamB.name || 'Team 2')}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input
                      type="text"
                      placeholder="Batter name..."
                      value={step3NewBatter}
                      onChange={e => setStep3NewBatter(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddStep3Batter()}
                      className="input-field"
                      style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddStep3Batter}
                      className="btn-secondary"
                      style={{ padding: '6px 8px', fontSize: '0.74rem', background: '#10B981', color: '#0F172A', fontWeight: 800, flexShrink: 0 }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Add Bowler */}
                <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38BDF8', marginBottom: 4 }}>
                    + Bowler to {teamABatsFirst ? (wizardTeamB.name || 'Team 2') : (wizardTeamA.name || 'Team 1')}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input
                      type="text"
                      placeholder="Bowler name..."
                      value={step3NewBowler}
                      onChange={e => setStep3NewBowler(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddStep3Bowler()}
                      className="input-field"
                      style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddStep3Bowler}
                      className="btn-secondary"
                      style={{ padding: '6px 8px', fontSize: '0.74rem', background: '#38BDF8', color: '#0F172A', fontWeight: 800, flexShrink: 0 }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setWizardStep(2)} className="btn-secondary" style={{ flex: 1 }}>
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
