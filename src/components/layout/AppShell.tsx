import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Toast } from '@/components/shared/Toast';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';

const navItems = [
  { to: '/game', label: '记分' },
  { to: '/validator', label: '校验' },
  { to: '/history', label: '历史' },
  { to: '/setup', label: '设置' },
];

export function AppShell() {
  const location = useLocation();
  const session = useGameStore((state) => state.session);
  const toastMessage = useUiStore((state) => state.toastMessage);
  const subtitle =
    location.pathname === '/game' && session
      ? `第 ${session.rounds.length + 1} 局`
      : '线下记分 · 进贡指引';

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col lg:max-w-6xl">
      <header className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h1 className="text-lg font-semibold tracking-tight">掼蛋大师</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </p>
      </header>

      <main className="flex-1 px-4 py-4 lg:px-6 lg:py-5">
        <Outlet />
      </main>
      <Toast message={toastMessage} />

      <nav
        className="sticky bottom-0 border-t border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
        aria-label="主导航"
      >
        <ul className="grid grid-cols-4">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    'block px-4 py-3 text-center text-sm font-medium transition-colors',
                    isActive
                      ? 'text-our'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
