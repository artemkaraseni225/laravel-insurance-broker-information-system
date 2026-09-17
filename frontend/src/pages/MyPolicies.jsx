import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '../services/api';

function MyPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/policies')
      .then(({ data }) => setPolicies(data.policies ?? []))
      .catch(() => setError('Не удалось загрузить полисы'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Мои полисы</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground">Загрузка...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && policies.length === 0 && (
            <p className="text-muted-foreground">Оплаченных полисов пока нет.</p>
          )}
          {!loading && !error && policies.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">ID полиса</th>
                  <th className="py-2">Номер полиса</th>
                  <th className="py-2">Тип страхования</th>
                  <th className="py-2">Премия</th>
                  <th className="py-2">Статус</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link to={`/policies/${policy.id}`} className="font-medium underline">
                        {policy.id}
                      </Link>
                    </td>
                    <td className="py-2">{policy.policy_number}</td>
                    <td className="py-2">{policy.application?.insurance_type?.name ?? '—'}</td>
                    <td className="py-2">{policy.premium} MDL</td>
                    <td className="py-2 font-medium text-green-600">Оплачено</td>
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

export default MyPolicies;