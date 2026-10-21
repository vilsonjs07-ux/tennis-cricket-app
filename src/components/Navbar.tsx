import React from 'react';
import { useMatchStore, AppTab } from '../store/useMatchStore';
import { Home, Radio, FileText, History, BarChart3, Users } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, currentMatch } = useMatchStore();

  const isLiveActive = currentMatch && (currentMatch.status === 'innings1' || currentMatch.status === 'innings2');

  const navItems: { tab: AppTab; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    { tab: 'home', label: 'Home', icon: <Home size={19} /> },
    { tab: 'live', label: 'Scoring', icon: <Radio size={19} />, badge: !!isLiveActive },
    { tab: 'scorecard', label: 'Scorecard', icon: <FileText size={19} /> },
    { tab: 'history', label: 'Matches', icon: <History size={19} /> },
    { tab: 'stats', label: 'Stats', icon: <BarChart3 size={19} /> },
    { tab: 'teams', label: 'Teams', icon: <Users size={19} /> },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`nav-tab ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="nav-icon">{item.icon}</div>
              {item.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -4,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    boxShadow: '0 0 6px #10B981',
                  }}
                />
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
