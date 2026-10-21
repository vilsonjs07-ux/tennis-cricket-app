import React, { useState } from 'react';
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
import { GullyRulesGuideModal } from './components/GullyRulesGuideModal';

export const App: React.FC = () => {
  const { activeTab } = useMatchStore();
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  return (
    <div className="app-wrapper">
      <div className="mobile-frame">
        {/* Top Sticky Header */}
        <Header onOpenRules={() => setIsRulesModalOpen(true)} />

        {/* Dynamic Main Content Tab */}
        <main className="main-content">
          {activeTab === 'home' && <HomeScreen onOpenRules={() => setIsRulesModalOpen(true)} />}
          {activeTab === 'wizard' && <MatchWizard />}
          {activeTab === 'live' && <LiveScoringScreen />}
          {activeTab === 'scorecard' && <ScorecardScreen />}
          {activeTab === 'history' && <MatchHistoryScreen />}
          {activeTab === 'stats' && <StatsScreen />}
          {activeTab === 'teams' && <TeamsScreen />}
        </main>

        {/* Bottom Navigation */}
        <Navbar />

        {/* Rules Guide Modal */}
        <GullyRulesGuideModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default App;
