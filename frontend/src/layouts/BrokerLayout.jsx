import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../services/api';

const navLinkClass = ({ isActive }) =>
  `text-sm transition-colors hover:text-foreground ${
    isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
  }`;

function BrokerLayout() {
  const navigate = useNavigate();

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

  return (
    <>
      <header className="border-b bg-background">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/broker/dashboard" className="font-semibold">
            Insurance Broker
          </Link>
          <div className="flex items-center gap-4">
            <NavLink to="/broker/dashboard" end className={navLinkClass}>
              Дашборд
            </NavLink>
            <NavLink to="/broker/applications" className={navLinkClass}>
              Мои заявки
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Выйти
            </button>
          </div>
        </nav>
      </header>
      <Outlet />
    </>
  );
}

export default BrokerLayout;
