import React from 'react';
import { useMatchStore } from '../store/useMatchStore';

export const Header: React.FC = () => {
  const { currentMatch, activeTab, setActiveTab } = useMatchStore();

  const isLive = currentMatch && (currentMatch.status === 'innings1' || currentMatch.status === 'innings2' || currentMatch.status === 'innings_break');

  return (
    <header className="top-header">
      <div className="logo-badge" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
        <span style={{ fontSize: '1.4rem' }}>🏏</span>
        <span>
          Tennis Cricket<span className="highlight"> Pro</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isLive && activeTab !== 'live' && (
          <button
            onClick={() => setActiveTab('live')}
            className="live-badge"
            style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', borderColor: 'rgba(16, 185, 129, 0.3)', cursor: 'pointer' }}
          >
            <span className="live-pulse-dot" style={{ backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span>LIVE MATCH</span>
          </button>
        )}

        {isLive && activeTab === 'live' && (
          <div className="live-badge">
            <span className="live-pulse-dot" />
            <span>LIVE</span>
          </div>
        )}
      </div>
    </header>
  );
};
