import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STATUS_LABELS = {
  new: 'Новая',
  in_review: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
};

const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  in_review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

const FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'in_review', label: 'На рассмотрении' },
  { value: 'approved', label: 'Одобренные' },
  { value: 'rejected', label: 'Отклонённые' },
];

function BrokerApplications() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/broker/my-applications')
      .then(({ data }) => setApplications(data.applications ?? []))
      .catch(() => setError('Не удалось загрузить ваши заявки'))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    setUpdatingId(id);
    setError(null);

    try {
      const { data } = await api.patch(`/broker/applications/${id}/status`, { status });
      setApplications((current) =>
        current.map((application) =>
          application.id === id ? data.application : application,
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.status === 403
          ? 'У вас нет доступа к этой заявке'
          : 'Не удалось изменить статус заявки',
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const visibleApplications =
    filter === 'all' ? applications : applications.filter(({ status }) => status === filter);

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">Рабочее пространство брокера</p>
        <h1 className="text-3xl font-semibold tracking-tight">Мои заявки</h1>
        <p className="text-muted-foreground">Заявки, которые вы взяли в работу.</p>
      </div>

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Заявки в работе</CardTitle>
            <CardDescription>{applications.length} заявок назначено вам</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Фильтр по статусу">
            {FILTERS.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={filter === value ? 'default' : 'outline'}
                onClick={() => setFilter(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="py-8 text-center text-muted-foreground">Загрузка заявок...</p>}
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

          {!loading && visibleApplications.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              {applications.length === 0 ? 'Вы ещё не взяли заявки в работу.' : 'Нет заявок с таким статусом.'}
            </p>
          )}

          {!loading && visibleApplications.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заявка</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Страхование</TableHead>
                  <TableHead>Тариф</TableHead>
                  <TableHead>Стоимость</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Решение</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleApplications.map((application) => {
                  const canDecide = ['new', 'in_review'].includes(application.status);
                  const isUpdating = updatingId === application.id;

                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        <Link to={`/broker/applications/${application.id}`} className="underline">
                          №{application.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>{application.customer?.name ?? 'Без имени'}</div>
                        <div className="text-xs text-muted-foreground">
                          {application.customer?.email ?? 'Email не указан'}
                        </div>
                      </TableCell>
                      <TableCell>{application.insurance_type?.name ?? '—'}</TableCell>
                      <TableCell>
                        <div>{application.tariff?.name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">
                          {application.tariff?.company?.name ?? ''}
                        </div>
                      </TableCell>
                      <TableCell>{application.calculated_price} MDL</TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[application.status]}>
                          {STATUS_LABELS[application.status] ?? application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canDecide ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => updateStatus(application.id, 'approved')}
                              disabled={isUpdating}
                            >
                              Одобрить
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(application.id, 'rejected')}
                              disabled={isUpdating}
                            >
                              Отклонить
                            </Button>
                          </div>
                        ) : (
                          <span className="block text-right text-sm text-muted-foreground">Решение принято</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default BrokerApplications;
