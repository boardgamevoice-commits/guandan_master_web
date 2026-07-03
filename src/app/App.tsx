import { Navigate, Route, Routes } from 'react-router-dom';
import { GamePage } from '@/pages/GamePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SetupPage } from '@/pages/SetupPage';
import { AppShell } from '@/components/layout/AppShell';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/game" replace />} />
        <Route path="setup" element={<SetupPage />} />
        <Route path="game" element={<GamePage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
    </Routes>
  );
}
