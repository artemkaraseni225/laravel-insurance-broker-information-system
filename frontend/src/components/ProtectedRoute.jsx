import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../services/api';

/**
 * Restricts a route to an authenticated user and, optionally, to specific roles.
 * The backend is the source of truth for the user's role.
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const rolesKey = useMemo(() => allowedRoles.join(','), [allowedRoles]);
  const [status, setStatus] = useState(() =>
    localStorage.getItem('auth_token') ? 'checking' : 'unauthenticated',
  );

  useEffect(() => {
    let isCurrent = true;
    const token = localStorage.getItem('auth_token');

    if (!token) {
      return undefined;
    }

    async function checkAccess() {
      try {
        const { data } = await api.get('/me');
        const roleValue = data.user?.role;
        const role = String(
          typeof roleValue === 'string' ? roleValue : roleValue?.name ?? data.user?.role_name ?? '',
        ).trim().toLowerCase();
        const permittedRoles = rolesKey ? rolesKey.split(',') : [];

        if (!isCurrent) return;

        setStatus(
          permittedRoles.length === 0 || permittedRoles.includes(role)
            ? 'authorized'
            : 'forbidden',
        );
      } catch (error) {
        if (!isCurrent) return;

        // An expired or invalid Sanctum token must not keep the user logged in.
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
        }
        setStatus('unauthenticated');
      }
    }

    checkAccess();

    return () => {
      isCurrent = false;
    };
  }, [rolesKey]);

  if (status === 'checking') {
    return <p className="p-4 text-center">Загрузка...</p>;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (status === 'forbidden') {
    return (
      <div className="p-6 text-center text-destructive">
        У вас нет доступа к этой странице.
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
