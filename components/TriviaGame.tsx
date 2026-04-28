'use client';

import { useGame } from '@/hooks/useGame';
import WelcomeScreen    from './screens/WelcomeScreen';
import LoginScreen      from './screens/LoginScreen';
import HomeScreen       from './screens/HomeScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import BuilderScreen    from './screens/BuilderScreen';
import GameScreen       from './screens/GameScreen';
import ResultsScreen    from './screens/ResultsScreen';
import QuitModal        from './modals/QuitModal';
import ClearModal       from './modals/ClearModal';
import AddQuestionModal from './modals/AddQuestionModal';
import Confetti         from './Confetti';

export default function TriviaGame() {
  const g = useGame();

  return (
    <div className="app">
      {/* Language toggle — always visible */}
      <button className="lang-btn" onClick={g.toggleLang}>
        {g.lang === 'en' ? 'عربي' : 'English'}
      </button>

      {/* Screens — only one active at a time */}
      {g.screen === 'welcome'     && <WelcomeScreen    g={g} />}
      {g.screen === 'login'       && <LoginScreen       g={g} />}
      {g.screen === 'home'        && <HomeScreen        g={g} />}
      {g.screen === 'leaderboard' && <LeaderboardScreen g={g} />}
      {g.screen === 'builder'     && <BuilderScreen     g={g} />}
      {g.screen === 'game'        && <GameScreen        g={g} />}
      {g.screen === 'results'     && <ResultsScreen     g={g} />}

      {/* Modals — rendered outside screen flow */}
      <QuitModal        g={g} />
      <ClearModal       g={g} />
      <AddQuestionModal g={g} />

      {/* Confetti — layered above everything on results */}
      <Confetti active={g.confettiActive} color={g.confettiColor} />
    </div>
  );
}
