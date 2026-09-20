import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  useEffect(loadUsers, []);

  async function handleRoleChange(userId, role) {
    setError(null);
    setBusyId(userId);

    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Не удалось сменить роль');
    } finally {
      setBusyId(null);
    }
  }

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

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Пользователи</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground">Загрузка...</p>}
          {error && <p className="text-destructive">{error}</p>}

          {!loading && users.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">Имя</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Роль</th>
                  <th className="py-2">Статус</th>
                  <th className="py-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">
                      <Select
                        value={u.role?.name}
                        onValueChange={(role) => handleRoleChange(u.id, role)}
                        disabled={busyId === u.id}
                      >
                        <SelectTrigger className="w-35">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">customer</SelectItem>
                          <SelectItem value="broker">broker</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2">
                      {u.status === 'active' ? 'Активен' : 'Заблокирован'}
                    </td>
                    <td className="py-2">
                      <Button
                        size="sm"
                        variant={u.status === 'active' ? 'destructive' : 'default'}
                        disabled={busyId === u.id}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UsersAdmin;
