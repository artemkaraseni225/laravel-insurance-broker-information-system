import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../services/api';

const navLinkClass = ({ isActive }) =>
  `text-sm transition-colors hover:text-foreground ${
    isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
  }`;

function AdminLayout() {
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
        <nav className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/admin/users" className="font-semibold">
            Панель администратора
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <NavLink to="/admin/users" className={navLinkClass}>
              Пользователи
            </NavLink>
            <NavLink to="/admin/tariffs" className={navLinkClass}>
              Тарифы
            </NavLink>
            <NavLink to="/admin/insurance-types" className={navLinkClass}>
              Типы страхования
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

export default AdminLayout;
