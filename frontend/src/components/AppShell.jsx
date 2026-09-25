import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Calculator,
  FileText,
  LayoutDashboard,
  LogOut,
  PanelsTopLeft,
  Settings2,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import api from '../services/api';

const iconMap = {
  dashboard: LayoutDashboard,
  applications: FileText,
  calculator: Calculator,
  policies: ShieldCheck,
  users: Users,
  statistics: BarChart3,
  create: UserPlus,
  tariffs: Settings2,
  insurance: PanelsTopLeft,
};

const ROLE_LABELS = {
  customer: 'Customer',
  broker: 'Broker',
  admin: 'Admin',
};

function AppShell({ brand, home, links, fillWorkspace = false }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let active = true;

    api
      .get('/me')
      .then(({ data }) => {
        if (active) setCurrentUser(data.user ?? null);
      })
      .catch(() => {
        if (active) setCurrentUser(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const roleValue = typeof currentUser?.role === 'string' ? currentUser.role : currentUser?.role?.name;
  const roleLabel = ROLE_LABELS[String(roleValue ?? '').toLowerCase()] ?? 'Customer';
  const userName = currentUser?.name ?? 'Пользователь';

  async function handleLogout() {
    try {
      await api.post('/logout');
    } catch {
      // Clear the local session even when the token has expired.
    } finally {
      localStorage.removeItem('auth_token');
      navigate('/login', { replace: true });
    }
  }

  const renderNavLink = (link, mobile = false) => {
    const Icon = iconMap[link.icon] || FileText;

    return (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.end}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
            mobile ? 'px-3 py-2' : 'px-3 py-2.5'
          } ${
            isActive
              ? 'bg-primary/10 text-primary shadow-xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`
        }
      >
        <Icon className="size-4 shrink-0" strokeWidth={1.8} />
        <span>{link.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border px-6 py-5">
          <Link to={home} className="flex items-center gap-3 text-sm font-semibold tracking-tight text-foreground">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="size-5" />
            </span>
            <span>{brand}</span>
          </Link>
          <div className="mt-4 border-t border-sidebar-border/70 pt-3">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{userName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-6">{links.map((link) => renderNavLink(link))}</nav>
        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" strokeWidth={1.8} />
            Выйти
          </button>
        </div>
      </aside>

      <div className={fillWorkspace ? 'flex min-h-screen flex-col md:h-screen md:pl-64' : 'md:pl-64'}>
        <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Link to={home} className="flex min-w-0 items-center gap-2 text-sm font-semibold">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="size-4" />
              </span>
              <span className="min-w-0 truncate">{brand}</span>
              <span className="ml-1 min-w-0 truncate text-left">
                <span className="block text-xs font-semibold text-foreground">{userName}</span>
                <span className="block text-[10px] font-normal text-muted-foreground">{roleLabel}</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Выйти"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-3 py-2">
            {links.map((link) => renderNavLink(link, true))}
          </nav>
        </header>
        <main className={fillWorkspace ? 'flex min-h-[calc(100vh-4rem)] min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 md:min-h-0 lg:px-8 lg:py-8' : 'min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8'}>
          <div className={fillWorkspace ? 'flex min-h-0 w-full flex-1 flex-col' : 'mx-auto w-full max-w-7xl'}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
