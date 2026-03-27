import { NavLink, Outlet } from 'react-router';

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/stats', label: 'Stats', icon: '📊' },
];

export function Layout() {
  return (
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto w-full">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-sm">
        <div className="flex justify-around max-w-lg mx-auto py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs font-medium ${isActive ? 'text-primary' : 'text-text-muted'}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
