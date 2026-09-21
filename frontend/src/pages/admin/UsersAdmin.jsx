import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function loadUsers() {
    setLoading(true);
    api
      .get('/users')
      .then(({ data }) => setUsers(data.users))
      .catch(() => setError('Не удалось загрузить пользователей'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let active = true;

    api
      .get('/users')
      .then(({ data }) => {
        if (active) setUsers(data.users);
      })
      .catch(() => {
        if (active) setError('Не удалось загрузить пользователей');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleToggleStatus(user) {
    setError(null);
    setBusyId(user.id);

    const newStatus = user.status === 'active' ? 'blocked' : 'active';

    try {
      await api.patch(`/admin/users/${user.id}/status`, { status: newStatus });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Не удалось изменить статус');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Удалить пользователя «${user.name}»?`)) return;

    setError(null);
    setBusyId(user.id);

    try {
      await api.delete(`/admin/users/${user.id}`);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Не удалось удалить пользователя');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page-shell max-w-6xl">
      <div className="page-header">
        <p className="page-eyebrow">Управление доступом</p>
        <h1 className="page-title">Пользователи</h1>
        <p className="page-description">Управляйте статусами, ролями и доступом пользователей системы.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Пользователи</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="empty-state">Загрузка пользователей...</p>}
          {error && <p className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

          {!loading && users.length > 0 && (
            <Table className="crm-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead><TableHead>Email</TableHead><TableHead>Роль</TableHead><TableHead>Статус</TableHead><TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      {u.role?.name === 'broker' ? 'Брокер' : u.role?.name === 'customer' ? 'Пользователь' : 'Администратор'}
                    </TableCell>
                    <TableCell><Badge variant={u.status === 'active' ? 'secondary' : 'destructive'}>{u.status === 'active' ? 'Активен' : 'Заблокирован'}</Badge></TableCell>
                    <TableCell>
                      {u.role?.name !== 'admin' && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={u.status === 'active' ? 'destructive' : 'default'}
                            disabled={busyId === u.id}
                            onClick={() => handleToggleStatus(u)}
                          >
                            {u.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === u.id}
                            onClick={() => handleDelete(u)}
                          >
                            Удалить
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && !error && users.length === 0 && <p className="empty-state">Пользователей пока нет.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default UsersAdmin;
