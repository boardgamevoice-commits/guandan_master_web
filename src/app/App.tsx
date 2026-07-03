import { Navigate, Route, Routes } from 'react-router-dom';
import { GamePage } from '@/pages/GamePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SetupPage } from '@/pages/SetupPage';
import { ValidatorPage } from '@/pages/ValidatorPage';
import { AppShell } from '@/components/layout/AppShell';
import { useGameStore } from '@/stores/gameStore';

function HomeRedirect() {
  const hasSession = useGameStore((state) => Boolean(state.session));
  return <Navigate to={hasSession ? '/game' : '/setup'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomeRedirect />} />
        <Route path="setup" element={<SetupPage />} />
        <Route path="game" element={<GamePage />} />
        <Route path="validator" element={<ValidatorPage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
    </Routes>
  );
}
