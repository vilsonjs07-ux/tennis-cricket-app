import React from 'react';
import { useMatchStore } from './store/useMatchStore';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { MatchWizard } from './components/MatchWizard/MatchWizard';
import { LiveScoringScreen } from './components/LiveScoring/LiveScoringScreen';
import { ScorecardScreen } from './components/Scorecard/ScorecardScreen';
import { MatchHistoryScreen } from './components/MatchHistory/MatchHistoryScreen';
import { StatsScreen } from './components/Stats/StatsScreen';
import { TeamsScreen } from './components/Teams/TeamsScreen';

export const App: React.FC = () => {
  const { activeTab } = useMatchStore();

  return (
    <div className="app-wrapper">
      <div className="mobile-frame">
        {/* Top Sticky Header */}
        <Header />

        {/* Dynamic Main Content Tab */}
        <main className="main-content">
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'wizard' && <MatchWizard />}
          {activeTab === 'live' && <LiveScoringScreen />}
          {activeTab === 'scorecard' && <ScorecardScreen />}
          {activeTab === 'history' && <MatchHistoryScreen />}
          {activeTab === 'stats' && <StatsScreen />}
          {activeTab === 'teams' && <TeamsScreen />}
        </main>

        {/* Bottom Navigation */}
        <Navbar />
      </div>
    </div>
  );
};

export default App;
