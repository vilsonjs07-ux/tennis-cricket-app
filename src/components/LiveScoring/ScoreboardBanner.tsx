import React from 'react';
import { InningsState, Match } from '../../types/cricket';

interface ScoreboardBannerProps {
  match: Match;
  innings: InningsState;
}

export const ScoreboardBanner: React.FC<ScoreboardBannerProps> = ({ match, innings }) => {
  const isSecondInnings = innings.inningsNumber === 2;
  const maxOvers = match.settings.oversPerInnings || match.settings.rules?.oversPerInnings || 6;

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #0C162B 0%, #08101E 100%)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Turf Glow Accent */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Teams & Innings Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '1rem' }}>{innings.inningsNumber === 1 ? match.teamA.emoji : match.teamB.emoji}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
            {innings.battingTeamName}
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
            }}
          >
            {innings.inningsNumber === 1 ? '1ST INNINGS' : '2ND INNINGS'}
          </span>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Bowling: <strong style={{ color: '#FFFFFF' }}>{innings.bowlingTeamName}</strong>
        </div>
      </div>

      {/* Main Score & Overs Display */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '6px 0 10px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.8rem',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-1px',
              lineHeight: 1,
            }}
          >
            {innings.totalRuns}
          </span>
          <span
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.9rem',
              fontWeight: 700,
              color: 'var(--turf-green)',
            }}
          >
            /{innings.totalWickets}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            {innings.oversFormatted}{' '}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              / {maxOvers} ov
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            CRR: <strong style={{ color: '#FFFFFF' }}>{innings.currentRunRate}</strong>
          </div>
        </div>
      </div>

      {/* Free Hit Alert Banner */}
      {innings.isFreeHitActive && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.25))',
            border: '1px solid #F59E0B',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            animation: 'pulse-dot 1.2s infinite',
          }}
        >
          <span style={{ fontSize: '0.9rem' }}>🚨</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 800, color: '#FDE68A' }}>
            FREE HIT ACTIVE ON NEXT BALL!
          </span>
        </div>
      )}

      {/* 2nd Innings Target / Chase Context */}
      {isSecondInnings && innings.targetRuns && (
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#BAE6FD', fontWeight: 600 }}>
            Target: <strong>{innings.targetRuns}</strong> • Need{' '}
            <strong style={{ color: '#FFFFFF', fontSize: '0.92rem' }}>{innings.runsNeeded}</strong> runs in{' '}
            <strong>{innings.ballsRemaining}</strong> balls
          </div>
          <div style={{ fontSize: '0.78rem', color: '#BAE6FD', fontWeight: 700 }}>
            RRR: {innings.requiredRunRate}
          </div>
        </div>
      )}
    </div>
  );
};
