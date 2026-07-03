import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/game', label: '记分' },
  { to: '/history', label: '历史' },
  { to: '/setup', label: '设置' },
];

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h1 className="text-lg font-semibold tracking-tight">掼蛋大师</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          线下记分 · 进贡指引
        </p>
      </header>

      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>

      <nav
        className="sticky bottom-0 border-t border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
        aria-label="主导航"
      >
        <ul className="grid grid-cols-3">
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
