import React, { useState } from 'react';
import { useMatchStore } from '../../store/useMatchStore';
import { Trophy, BarChart3, Users, Flame, Award, Shield } from 'lucide-react';

interface AggregatePlayerStats {
  id: string;
  name: string;
  teamName: string;
  matches: number;
  inningsBatted: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  highestScore: number;
  timesOut: number;
  average: number;
  strikeRate: number;
  wickets: number;
  legalBallsBowled: number;
  oversBowledFormatted: string;
  runsConceded: number;
  economy: number;
  bestBowlingWickets: number;
  bestBowlingRuns: number;
  momAwards: number;
}

export const StatsScreen: React.FC = () => {
  const { matches } = useMatchStore();
  const [activeTab, setActiveTab] = useState<'batting' | 'bowling' | 'awards'>('batting');

  // Compute player aggregate statistics across all saved matches
  const playerMap: Record<string, AggregatePlayerStats> = {};

  matches.forEach(m => {
    const processInnings = (inn: typeof m.innings1) => {
      if (!inn) return;

      // Batters
      Object.values(inn.batters).forEach(b => {
        if (!playerMap[b.playerId]) {
          playerMap[b.playerId] = {
            id: b.playerId,
            name: b.playerName,
            teamName: inn.battingTeamName,
            matches: 0,
            inningsBatted: 0,
            runs: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            highestScore: 0,
            timesOut: 0,
            average: 0,
            strikeRate: 0,
            wickets: 0,
            legalBallsBowled: 0,
            oversBowledFormatted: '0.0',
            runsConceded: 0,
            economy: 0,
            bestBowlingWickets: 0,
            bestBowlingRuns: 0,
            momAwards: 0,
          };
        }

        const p = playerMap[b.playerId];
        p.inningsBatted += 1;
        p.runs += b.runs;
        p.ballsFaced += b.ballsFaced;
        p.fours += b.fours;
        p.sixes += b.sixes;
        if (b.runs > p.highestScore) {
          p.highestScore = b.runs;
        }
        if (b.isOut) {
          p.timesOut += 1;
        }
      });

      // Bowlers
      Object.values(inn.bowlers).forEach(bw => {
        if (!playerMap[bw.playerId]) {
          playerMap[bw.playerId] = {
            id: bw.playerId,
            name: bw.playerName,
            teamName: inn.bowlingTeamName,
            matches: 0,
            inningsBatted: 0,
            runs: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            highestScore: 0,
            timesOut: 0,
            average: 0,
            strikeRate: 0,
            wickets: 0,
            legalBallsBowled: 0,
            oversBowledFormatted: '0.0',
            runsConceded: 0,
            economy: 0,
            bestBowlingWickets: 0,
            bestBowlingRuns: 0,
            momAwards: 0,
          };
        }

        const p = playerMap[bw.playerId];
        p.wickets += bw.wickets;
        p.legalBallsBowled += bw.legalBallsBowled;
        p.runsConceded += bw.runsConceded;

        if (
          bw.wickets > p.bestBowlingWickets ||
          (bw.wickets === p.bestBowlingWickets && bw.runsConceded < p.bestBowlingRuns)
        ) {
          p.bestBowlingWickets = bw.wickets;
          p.bestBowlingRuns = bw.runsConceded;
        }
      });
    };

    processInnings(m.innings1);
    processInnings(m.innings2);

    // Track Player of the Match
    if (m.result?.manOfTheMatchPlayerId && playerMap[m.result.manOfTheMatchPlayerId]) {
      playerMap[m.result.manOfTheMatchPlayerId].momAwards += 1;
    }
  });

  // Calculate averages and strike rates
  const playersList = Object.values(playerMap).map(p => {
    p.average = p.timesOut > 0 ? Number((p.runs / p.timesOut).toFixed(1)) : p.runs;
    p.strikeRate = p.ballsFaced > 0 ? Number(((p.runs / p.ballsFaced) * 100).toFixed(1)) : 0;
    const overs = Math.floor(p.legalBallsBowled / 6);
    const balls = p.legalBallsBowled % 6;
    p.oversBowledFormatted = `${overs}.${balls}`;
    p.economy = p.legalBallsBowled > 0 ? Number(((p.runsConceded / (p.legalBallsBowled / 6))).toFixed(2)) : 0;
    return p;
  });

  // Top lists
  const topRunScorers = [...playersList].sort((a, b) => b.runs - a.runs).slice(0, 10);
  const topWicketTakers = [...playersList].sort((a, b) => b.wickets - a.wickets).slice(0, 10);
  const topSixHitters = [...playersList].sort((a, b) => b.sixes - a.sixes).slice(0, 10);

  return (
    <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800 }}>
          Player Statistics & Leaderboard
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Aggregated career stats across all gully matches
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {(['batting', 'bowling', 'awards'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
              border: `1px solid ${activeTab === tab ? '#10B981' : 'var(--border-subtle)'}`,
              color: activeTab === tab ? '#34D399' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '9px',
              fontWeight: 800,
              fontSize: '0.78rem',
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {playersList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
          <p style={{ fontSize: '0.85rem' }}>No matches recorded yet. Play a match to see player career stats!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* BATTING LEADERBOARD */}
          {activeTab === 'batting' && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                TOP RUN SCORERS
              </div>

              {/* Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 45px 35px 35px 45px',
                  padding: '8px 12px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textAlign: 'right',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ textAlign: 'left' }}>PLAYER</div>
                <div>RUNS</div>
                <div>HS</div>
                <div>6s</div>
                <div>SR</div>
              </div>

              {topRunScorers.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 45px 35px 35px 45px',
                    alignItems: 'center',
                    padding: '9px 12px',
                    fontSize: '0.84rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.72rem', color: idx < 3 ? 'var(--turf-green)' : 'var(--text-muted)', fontWeight: 800 }}>
                      #{idx + 1}
                    </span>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{p.name}</span>
                  </div>
                  <div className="tabular-nums" style={{ color: 'var(--turf-green)', fontWeight: 800 }}>
                    {p.runs}
                  </div>
                  <div className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {p.highestScore}
                  </div>
                  <div className="tabular-nums" style={{ color: 'var(--gold-six)' }}>
                    {p.sixes}
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {p.strikeRate}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BOWLING LEADERBOARD */}
          {activeTab === 'bowling' && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                TOP WICKET TAKERS
              </div>

              {/* Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 45px 45px 45px 45px',
                  padding: '8px 12px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textAlign: 'right',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ textAlign: 'left' }}>BOWLER</div>
                <div>WKTS</div>
                <div>OVERS</div>
                <div>RUNS</div>
                <div>ECON</div>
              </div>

              {topWicketTakers.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 45px 45px 45px 45px',
                    alignItems: 'center',
                    padding: '9px 12px',
                    fontSize: '0.84rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.72rem', color: idx < 3 ? '#38BDF8' : 'var(--text-muted)', fontWeight: 800 }}>
                      #{idx + 1}
                    </span>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{p.name}</span>
                  </div>
                  <div className="tabular-nums" style={{ color: '#38BDF8', fontWeight: 800 }}>
                    {p.wickets}
                  </div>
                  <div className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {p.oversBowledFormatted}
                  </div>
                  <div className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {p.runsConceded}
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {p.economy}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AWARDS & MVP */}
          {activeTab === 'awards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {playersList
                .filter(p => p.momAwards > 0)
                .sort((a, b) => b.momAwards - a.momAwards)
                .map(p => (
                  <div
                    key={p.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#F59E0B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                        }}
                      >
                        ⭐
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Career: {p.runs} runs • {p.wickets} wickets
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          color: '#FCD34D',
                          background: 'rgba(245, 158, 11, 0.1)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                        }}
                      >
                        {p.momAwards} MVP {p.momAwards === 1 ? 'Award' : 'Awards'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
