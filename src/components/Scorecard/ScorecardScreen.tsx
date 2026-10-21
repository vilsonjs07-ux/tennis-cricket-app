import React, { useState } from 'react';
import { useMatchStore } from '../../store/useMatchStore';
import { shareMatchCard, generateShareableText } from '../../services/shareImage';
import { Share2, Download, Copy, Check, Trophy, ExternalLink, Calendar, MapPin, Award } from 'lucide-react';

export const ScorecardScreen: React.FC = () => {
  const { currentMatch, setActiveTab, initNewMatchWizard } = useMatchStore();
  const [selectedInnings, setSelectedInnings] = useState<1 | 2>(1);
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!currentMatch) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🏏</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
          No Match Selected
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4, marginBottom: 16 }}>
          Select a match from Match History or start a new game to view its scorecard.
        </p>
        <button onClick={initNewMatchWizard} className="btn-primary" style={{ maxWidth: 220, margin: '0 auto' }}>
          Start New Match
        </button>
      </div>
    );
  }

  const inn1 = currentMatch.innings1;
  const inn2 = currentMatch.innings2;
  const activeInn = selectedInnings === 1 ? inn1 : inn2;
  const battingTeam = activeInn?.battingTeamId === currentMatch.teamA.id ? currentMatch.teamA : currentMatch.teamB;
  const bowlingTeam = activeInn?.battingTeamId === currentMatch.teamA.id ? currentMatch.teamB : currentMatch.teamA;

  // Handle Share as Image
  const handleShareImage = async () => {
    try {
      setIsSharing(true);
      await shareMatchCard(currentMatch);
    } catch (e) {
      console.error('Error sharing image', e);
    } finally {
      setIsSharing(false);
    }
  };

  // Handle Copy text
  const handleCopyText = async () => {
    try {
      const text = generateShareableText(currentMatch);
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  return (
    <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Match Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0C162A 0%, #08101E 100%)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--turf-green)' }}>
            OFFICIAL SCORECARD
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {currentMatch.settings.date}
          </span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>
          {currentMatch.settings.title}
        </h2>

        {currentMatch.settings.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            <MapPin size={12} />
            <span>{currentMatch.settings.location}</span>
          </div>
        )}

        {/* Winner Banner if match finished */}
        {currentMatch.result && (
          <div
            style={{
              marginTop: 12,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid #10B981',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Trophy size={18} color="#34D399" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34D399' }}>
                {currentMatch.result.marginText}
              </div>
              {currentMatch.result.manOfTheMatchName && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Player of the Match: <strong>{currentMatch.result.manOfTheMatchName}</strong> ({currentMatch.result.manOfTheMatchReason})
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Share Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
          <button
            onClick={handleShareImage}
            disabled={isSharing}
            className="btn-primary"
            style={{ padding: '9px 12px', fontSize: '0.82rem' }}
          >
            <Share2 size={15} />
            <span>{isSharing ? 'Generating...' : 'Export Card (Image)'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="btn-secondary"
            style={{ padding: '9px 12px', fontSize: '0.82rem' }}
          >
            {isCopied ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
            <span>{isCopied ? 'Copied WhatsApp!' : 'Copy WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* Innings Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button
          type="button"
          onClick={() => setSelectedInnings(1)}
          style={{
            background: selectedInnings === 1 ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg-card)',
            border: `1px solid ${selectedInnings === 1 ? '#10B981' : 'var(--border-subtle)'}`,
            color: selectedInnings === 1 ? '#34D399' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '10px',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          1st Inn: {inn1 ? `${inn1.battingTeamName} (${inn1.totalRuns}/${inn1.totalWickets})` : 'Not Played'}
        </button>

        <button
          type="button"
          onClick={() => setSelectedInnings(2)}
          style={{
            background: selectedInnings === 2 ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg-card)',
            border: `1px solid ${selectedInnings === 2 ? '#10B981' : 'var(--border-subtle)'}`,
            color: selectedInnings === 2 ? '#34D399' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '10px',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          2nd Inn: {inn2 ? `${inn2.battingTeamName} (${inn2.totalRuns}/${inn2.totalWickets})` : 'Pending'}
        </button>
      </div>

      {!activeInn ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
          This innings has not started yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Batting Card */}
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
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFFFFF' }}>
                BATTING • {activeInn.battingTeamName}
              </span>
              <span className="tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--turf-green)' }}>
                {activeInn.totalRuns}/{activeInn.totalWickets} ({activeInn.oversFormatted} ov)
              </span>
            </div>

            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 35px 35px 30px 30px 45px',
                padding: '8px 12px',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textAlign: 'right',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ textAlign: 'left' }}>BATTER</div>
              <div>R</div>
              <div>B</div>
              <div>4s</div>
              <div>6s</div>
              <div>SR</div>
            </div>

            {/* Batter Rows */}
            {Object.values(activeInn.batters).map(b => (
              <div
                key={b.playerId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 35px 35px 30px 30px 45px',
                  alignItems: 'center',
                  padding: '9px 12px',
                  fontSize: '0.84rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  textAlign: 'right',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.playerName}</div>
                  <div style={{ fontSize: '0.68rem', color: b.isOut ? '#EF4444' : 'var(--turf-green)' }}>
                    {b.isOut ? (b.dismissalText || 'out') : 'not out'}
                  </div>
                </div>
                <div className="tabular-nums" style={{ fontWeight: 800, color: '#FFFFFF' }}>
                  {b.runs}
                </div>
                <div className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  {b.ballsFaced}
                </div>
                <div className="tabular-nums" style={{ color: 'var(--turf-green)' }}>
                  {b.fours}
                </div>
                <div className="tabular-nums" style={{ color: 'var(--gold-six)' }}>
                  {b.sixes}
                </div>
                <div className="tabular-nums" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {b.strikeRate}
                </div>
              </div>
            ))}

            {/* Extras Summary */}
            <div
              style={{
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>
                Extras (wd {activeInn.extras.wides}, nb {activeInn.extras.noBalls}, b {activeInn.extras.byes}, lb {activeInn.extras.legByes})
              </span>
              <strong className="tabular-nums" style={{ color: '#FFFFFF' }}>
                {activeInn.extras.total}
              </strong>
            </div>
          </div>

          {/* Bowling Card */}
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
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFFFFF' }}>
                BOWLING • {activeInn.bowlingTeamName}
              </span>
            </div>

            {/* Bowling Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 38px 28px 35px 35px 45px',
                padding: '8px 12px',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textAlign: 'right',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ textAlign: 'left' }}>BOWLER</div>
              <div>O</div>
              <div>M</div>
              <div>R</div>
              <div>W</div>
              <div>ECON</div>
            </div>

            {/* Bowler Rows */}
            {Object.values(activeInn.bowlers).map(bw => (
              <div
                key={bw.playerId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 38px 28px 35px 35px 45px',
                  alignItems: 'center',
                  padding: '9px 12px',
                  fontSize: '0.84rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  textAlign: 'right',
                }}
              >
                <div style={{ textAlign: 'left', fontWeight: 700, color: '#FFFFFF' }}>
                  {bw.playerName}
                </div>
                <div className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  {bw.oversFormatted}
                </div>
                <div className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  {bw.maidens}
                </div>
                <div className="tabular-nums" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                  {bw.runsConceded}
                </div>
                <div className="tabular-nums" style={{ color: 'var(--turf-green)', fontWeight: 800 }}>
                  {bw.wickets}
                </div>
                <div className="tabular-nums" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {bw.economy}
                </div>
              </div>
            ))}
          </div>

          {/* Fall of Wickets */}
          {activeInn.fallOfWickets.length > 0 && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>
                FALL OF WICKETS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {activeInn.fallOfWickets.map(fow => (
                  <div
                    key={fow.wicketNumber}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                    }}
                  >
                    <strong style={{ color: '#EF4444' }}>{fow.teamRuns}/{fow.wicketNumber}</strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>
                      ({fow.playerOutName}, {fow.oversFormatted} ov)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ball-by-ball Commentary Feed */}
          {activeInn.deliveries.length > 0 && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>
                BALL-BY-BALL COMMENTARY
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {[...activeInn.deliveries].reverse().map(delivery => (
                  <div
                    key={delivery.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      paddingBottom: 6,
                      fontSize: '0.78rem',
                      display: 'flex',
                      gap: 8,
                    }}
                  >
                    <span
                      className="tabular-nums"
                      style={{
                        fontWeight: 700,
                        color: delivery.wicket ? '#EF4444' : delivery.isBoundaryFour || delivery.isBoundarySix ? 'var(--gold-six)' : 'var(--turf-green)',
                        flexShrink: 0,
                      }}
                    >
                      {delivery.overNumber}.{delivery.ballInOver}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{delivery.commentary}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
