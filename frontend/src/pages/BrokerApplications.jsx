import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
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
  cancelled: 'Отменена',
};

const STATUS_STYLES = {
  new: 'border-[#CBDCE7] bg-[#EFF5F8] text-[#47687C]',
  in_review: 'border-[#E7D5A8] bg-[#FCF6E8] text-[#8A6828]',
  approved: 'border-[#BBDCCF] bg-[#EDF8F2] text-[#327155]',
  rejected: 'border-[#E6C7C7] bg-[#FBF0F0] text-[#985252]',
  cancelled: 'border-[#D6D6D6] bg-[#F4F4F4] text-[#707070]',
};

const FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'in_review', label: 'На рассмотрении' },
  { value: 'approved', label: 'Одобренные' },
  { value: 'rejected', label: 'Отклонённые' },
  { value: 'cancelled', label: 'Отмененные' },
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
    filter === 'all'
      ? applications.filter(({ status }) => status !== 'cancelled')
      : applications.filter(({ status }) => status === filter);

  return (
    <main className="space-y-6">
      <Card className="!gap-0 overflow-hidden rounded-2xl !py-0 shadow-sm">
        <CardHeader className="!flex flex-col gap-5 border-b border-border/70 bg-gradient-to-r from-teal-50/80 to-background px-6 py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 shadow-sm">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-teal-700 uppercase">Рабочее пространство брокера</p>
                <CardTitle className="mt-1 text-2xl font-bold tracking-tight">Мои заявки</CardTitle>
                <CardDescription className="mt-1.5">{applications.filter(({ status }) => status !== 'cancelled').length} заявок назначено вам. Нажмите на номер заявки для просмотра деталей.</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Фильтр по статусу">
              {FILTERS.map(({ value, label }) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={filter === value ? 'default' : 'outline'}
                  onClick={() => setFilter(value)}
                  className={filter === value ? 'h-8 rounded-full bg-teal-600 px-3 text-white hover:bg-teal-700 focus-visible:ring-teal-500' : 'h-8 rounded-full border-border bg-white px-3 text-foreground hover:border-teal-300 hover:bg-teal-50'}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="!px-0">
          {loading && <p className="px-6 py-10 text-center text-muted-foreground">Загрузка заявок...</p>}
          {error && <p className="m-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

          {!loading && visibleApplications.length === 0 && (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileText className="size-5" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {applications.length === 0 ? 'Вы ещё не взяли заявки в работу.' : 'Нет заявок с таким статусом.'}
              </p>
            </div>
          )}

          {!loading && visibleApplications.length > 0 && (
            <Table className="min-w-[900px] text-sm">
              <TableHeader>
                <TableRow className="border-border/70 bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">Заявка</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">Клиент</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">Страхование</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">Тариф</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">Стоимость</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">Статус</TableHead>
                  <TableHead className="px-6 py-3.5 text-right text-xs font-semibold tracking-wider uppercase">Решение</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleApplications.map((application) => {
                  const canDecide = ['new', 'in_review'].includes(application.status);
                  const isUpdating = updatingId === application.id;

                  return (
                    <TableRow key={application.id} className="border-border/60 transition-colors hover:bg-teal-50/50">
                      <TableCell className="px-6 py-4">
                        <Link to={`/broker/applications/${application.id}`} className="inline-flex h-8 items-center rounded-lg bg-teal-50 px-2.5 text-xs font-semibold tabular-nums text-teal-700 ring-1 ring-inset ring-teal-200 transition-colors hover:bg-teal-100 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500">
                          #{application.id}
                        </Link>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="font-medium">{application.customer?.name ?? 'Без имени'}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {application.customer?.email ?? 'Email не указан'}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium">{application.insurance_type?.name ?? '—'}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div>{application.tariff?.name ?? '—'}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {application.tariff?.company?.name ?? ''}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-semibold tabular-nums">{application.calculated_price} MDL</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className={STATUS_STYLES[application.status]}>
                          {STATUS_LABELS[application.status] ?? application.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {canDecide ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => updateStatus(application.id, 'approved')}
                              disabled={isUpdating}
                              className="h-8 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 focus-visible:ring-teal-500"
                            >
                              Одобрить
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(application.id, 'rejected')}
                              disabled={isUpdating}
                              className="h-8 rounded-lg"
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
