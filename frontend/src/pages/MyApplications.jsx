import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_LABELS = {
  new: 'Новая',
  in_review: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
};

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api
      .get('/applications')
      .then(({ data }) => setApplications(data.applications))
      .catch(() => setError('Не удалось загрузить список заявок'))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    statusFilter === 'all'
      ? applications
      : applications.filter((app) => app.status === statusFilter);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Мои заявки</CardTitle>
            <CardDescription>Список поданных заявок на страхование</CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-45">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground">Загрузка...</p>}
          {error && <p className="text-destructive">{error}</p>}

          {!loading && !error && filtered.length === 0 && (
            <p className="text-muted-foreground">
              {applications.length === 0 ? 'Заявок пока нет.' : 'Нет заявок с таким статусом.'}
            </p>
          )}

          {filtered.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">№</th>
                  <th className="py-2">Тип</th>
                  <th className="py-2">Тариф</th>
                  <th className="py-2">Цена</th>
                  <th className="py-2">Статус</th>
                  <th className="py-2">Дата</th>
                  <th className="py-2">Действие</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link to={`/my-applications/${app.id}`} className="underline">
                        {app.id}
                      </Link>
                    </td>
                    <td className="py-2">{app.insurance_type?.name}</td>
                    <td className="py-2">
                      {app.tariff?.company ? `${app.tariff.company.name} — ` : ''}
                      {app.tariff?.name}
                    </td>
                    <td className="py-2">{app.calculated_price}</td>
                    <td className="py-2">{STATUS_LABELS[app.status] ?? app.status}</td>
                    <td className="py-2">{new Date(app.created_at).toLocaleDateString('ru-RU')}</td>
                    <td className="py-2">
                      {app.status === 'approved' ? (
                        <Link to={`/payment/${app.id}`} className="underline">
                          Оплатить
                        </Link>
                      ) : (
                        '-'
                      )}
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

export default MyApplications;
