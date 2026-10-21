import React from 'react';
import { useMatchStore } from '../store/useMatchStore';
import { PlusCircle, PlayCircle, Trophy, Users, History, BarChart2, ShieldCheck, ArrowRight, Ban, Flame } from 'lucide-react';

interface HomeScreenProps {
  onOpenRules: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenRules }) => {
  const { currentMatch, matches, initNewMatchWizard, setActiveTab, loadMatchById } = useMatchStore();

  const isLiveActive = currentMatch && (currentMatch.status === 'innings1' || currentMatch.status === 'innings2' || currentMatch.status === 'innings_break');
  const recentCompleted = matches.filter(m => m.status === 'completed').slice(0, 3);

  const totalMatchesCount = matches.length;
  const totalRunsCount = matches.reduce((sum, m) => {
    return sum + (m.innings1?.totalRuns || 0) + (m.innings2?.totalRuns || 0);
  }, 0);

  return (
    <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F1F38 0%, #081121 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
          padding: '22px 20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34D399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <ShieldCheck size={12} />
            <span>TENNIS BALL CRICKET</span>
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Ban size={12} />
            <span>NO LBW RULE</span>
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.85rem',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            lineHeight: 1.15,
            color: '#FFFFFF',
            marginBottom: 6,
          }}
        >
          Tennis<span style={{ color: 'var(--turf-green)' }}>Score</span> Pro
        </h1>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            marginBottom: 18,
            lineHeight: 1.4,
          }}
        >
          Official Cricket Laws • No LBW • Tournament Ready for T10, T12, T20 Tennis Ball Matches.
        </p>

        {/* Primary CTA */}
        <button
          onClick={initNewMatchWizard}
          className="btn-primary"
          style={{ fontSize: '1.02rem', padding: '15px 20px' }}
        >
          <PlusCircle size={20} />
          <span>Start Tennis Match</span>
        </button>
      </div>

      {/* Continue In-Progress Match Card (if active) */}
      {isLiveActive && currentMatch && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(13, 21, 39, 0.9))',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="live-pulse-dot" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34D399', letterSpacing: '0.5px' }}>
                MATCH IN PROGRESS
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {currentMatch.settings.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                {currentMatch.currentInningsNumber === 1
                  ? currentMatch.innings1?.battingTeamName
                  : currentMatch.innings2?.battingTeamName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                vs {currentMatch.currentInningsNumber === 1
                  ? currentMatch.innings1?.bowlingTeamName
                  : currentMatch.innings2?.bowlingTeamName}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  color: '#FFFFFF',
                }}
              >
                {currentMatch.currentInningsNumber === 1
                  ? `${currentMatch.innings1?.totalRuns || 0}/${currentMatch.innings1?.totalWickets || 0}`
                  : `${currentMatch.innings2?.totalRuns || 0}/${currentMatch.innings2?.totalWickets || 0}`}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {currentMatch.currentInningsNumber === 1
                  ? `${currentMatch.innings1?.oversFormatted || '0.0'} ov`
                  : `${currentMatch.innings2?.oversFormatted || '0.0'} ov (Target: ${currentMatch.innings2?.targetRuns})`}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('live')}
            className="btn-primary"
            style={{ padding: '10px 14px', fontSize: '0.9rem' }}
          >
            <PlayCircle size={18} />
            <span>Resume Scoring</span>
          </button>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MATCHES</div>
          <div
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--turf-green)',
              marginTop: 2,
            }}
          >
            {totalMatchesCount}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL RUNS</div>
          <div
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--gold-six)',
              marginTop: 2,
            }}
          >
            {totalRunsCount}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RULES</div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#38BDF8',
              marginTop: 2,
            }}
          >
            No LBW 🚫
          </div>
        </div>
      </div>

      {/* Quick Nav Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <button
          onClick={() => setActiveTab('teams')}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Teams & Squads</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>11-player rosters</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Player Stats</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Runs, Wickets, SR</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(139, 92, 246, 0.12)',
              color: '#8B5CF6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <History size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Match History</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Past scorecards</div>
          </div>
        </button>

        <button
          onClick={onOpenRules}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ban size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Rules (No LBW)</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Official Tennis Laws</div>
          </div>
        </button>
      </div>

      {/* Recent Matches Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800 }}>
            Recent Matches
          </h2>
          {matches.length > 0 && (
            <button
              onClick={() => setActiveTab('history')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--turf-green)',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {recentCompleted.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px dashed var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '24px 16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎾</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
              No matches recorded yet
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Tap "Start Tennis Match" to set up your teams, toss, and score your first tournament game!
            </p>
            <button onClick={initNewMatchWizard} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              Create Match
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentCompleted.map(m => (
              <div
                key={m.id}
                onClick={() => loadMatchById(m.id)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {m.settings.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.settings.date}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.1rem' }}>{m.teamA.emoji || '⚡'}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{m.teamA.name}</span>
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                    {m.innings1 ? `${m.innings1.totalRuns}/${m.innings1.totalWickets}` : '-'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.1rem' }}>{m.teamB.emoji || '🔥'}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{m.teamB.name}</span>
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                    {m.innings2 ? `${m.innings2.totalRuns}/${m.innings2.totalWickets}` : '-'}
                  </div>
                </div>

                {m.result && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: 8,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--turf-green)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Trophy size={13} />
                    <span>{m.result.marginText}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
