import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox } from 'lucide-react';
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
  new: 'border-[#CBDCE7] bg-[#EFF5F8] text-[#47687C]',
  in_review: 'border-[#E7D5A8] bg-[#FCF6E8] text-[#8A6828]',
  approved: 'border-[#BBDCCF] bg-[#EDF8F2] text-[#327155]',
  rejected: 'border-[#E6C7C7] bg-[#FBF0F0] text-[#985252]',
};

const PAGE_SIZE = 6;

function BrokerDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    api
      .get('/broker/applications')
      .then(({ data }) => setApplications(data.applications ?? []))
      .catch(() => setError('Не удалось загрузить заявки'))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(applications.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedApplications = applications.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE,
  );

  async function claimApplication(id) {
    setUpdatingId(id);
    setError(null);

    try {
      await api.post(`/broker/applications/${id}/claim`);
      setApplications((current) => current.filter((application) => application.id !== id));
      navigate('/broker/applications');
    } catch (requestError) {
      setError(
        requestError.response?.status === 403
          ? 'У вас нет доступа к этой заявке'
          : 'Не удалось взять заявку в работу',
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <Card className="!flex min-h-0 flex-1 !gap-0 overflow-hidden rounded-2xl !py-0 shadow-sm">
        <CardHeader className="!flex shrink-0 flex-col gap-5 border-b border-border/70 bg-gradient-to-r from-teal-50/80 to-background px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 shadow-sm">
              <Inbox className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-teal-700 uppercase">Рабочее пространство брокера</p>
              <CardTitle className="mt-1 text-2xl font-bold tracking-tight">Очередь заявок</CardTitle>
              <CardDescription className="mt-1.5">Новые заявки, доступные для обработки: {applications.length}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="!flex min-h-0 flex-1 flex-col !px-0">
          {loading && <p className="px-6 py-10 text-center text-muted-foreground">Загрузка заявок...</p>}
          {error && <p className="m-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

          {!loading && applications.length === 0 && (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Новых заявок пока нет.</p>
            </div>
          )}

          {!loading && applications.length > 0 && (
            <div className="hidden min-h-0 flex-1 overflow-y-auto xl:block">
            <Table className="w-full table-fixed text-xs">
              <TableHeader>
                <TableRow className="border-border/70 bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[6%] px-2 py-2.5 text-[11px] font-semibold tracking-wider uppercase">Заявка</TableHead>
                  <TableHead className="w-[20%] px-2 py-2.5 text-[11px] font-semibold tracking-wider uppercase">Клиент</TableHead>
                  <TableHead className="w-[14%] px-2 py-2.5 text-[11px] font-semibold tracking-wider uppercase">Страхование</TableHead>
                  <TableHead className="w-[18%] px-2 py-2.5 text-[11px] font-semibold tracking-wider uppercase">Тариф</TableHead>
                  <TableHead className="w-[12%] px-2 py-2.5 text-[11px] font-semibold tracking-wider uppercase">Стоимость</TableHead>
                  <TableHead className="w-[14%] px-2 py-2.5 text-[11px] font-semibold tracking-wider uppercase">Статус</TableHead>
                  <TableHead className="w-[16%] px-2 py-2.5 text-right text-[11px] font-semibold tracking-wider uppercase">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApplications.map((application) => {
                  const isUpdating = updatingId === application.id;

                  return (
                    <TableRow key={application.id} className="border-border/60 transition-colors hover:bg-teal-50/50">
                      <TableCell className="px-2 py-2.5">#{application.id}</TableCell>
                      <TableCell className="px-2 py-2.5">
                        <div className="truncate font-medium" title={application.customer?.name ?? 'Без имени'}>{application.customer?.name ?? 'Без имени'}</div>
                        <div className="mt-0.5 truncate text-[11px] text-muted-foreground" title={application.customer?.email ?? 'Email не указан'}>
                          {application.customer?.email ?? 'Email не указан'}
                        </div>
                      </TableCell>
                      <TableCell className="truncate px-2 py-2.5 font-medium" title={application.insurance_type?.name ?? '—'}>{application.insurance_type?.name ?? '—'}</TableCell>
                      <TableCell className="px-2 py-2.5">
                        <div className="truncate" title={application.tariff?.name ?? '—'}>{application.tariff?.name ?? '—'}</div>
                        <div className="mt-0.5 truncate text-[11px] text-muted-foreground" title={application.tariff?.company?.name ?? ''}>
                          {application.tariff?.company?.name ?? ''}
                        </div>
                      </TableCell>
                      <TableCell className="px-2 py-2.5 font-semibold tabular-nums">{application.calculated_price} MDL</TableCell>
                      <TableCell className="px-2 py-2.5">
                        <Badge className={STATUS_STYLES[application.status]}>
                          {STATUS_LABELS[application.status] ?? application.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 py-2.5">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => claimApplication(application.id)}
                            disabled={isUpdating}
                            className="h-7 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-2 text-xs text-white hover:from-teal-600 hover:to-teal-700 focus-visible:ring-teal-500"
                          >
                            Взять в работу
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}

          {!loading && applications.length > 0 && (
            <div className="min-h-0 flex-1 overflow-y-auto p-4 xl:hidden">
              <div className="grid gap-3 sm:grid-cols-2">
                {paginatedApplications.map((application) => {
                  const isUpdating = updatingId === application.id;

                  return (
                    <div key={application.id} className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p>#{application.id}</p>
                          <p className="mt-1 truncate text-sm font-medium" title={application.customer?.name ?? 'Без имени'}>{application.customer?.name ?? 'Без имени'}</p>
                          <p className="mt-0.5 break-all text-xs text-muted-foreground">{application.customer?.email ?? 'Email не указан'}</p>
                        </div>
                        <Badge className={STATUS_STYLES[application.status]}>
                          {STATUS_LABELS[application.status] ?? application.status}
                        </Badge>
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-muted/50 p-2">
                          <dt className="text-muted-foreground">Страхование</dt>
                          <dd className="mt-1 font-medium">{application.insurance_type?.name ?? '—'}</dd>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <dt className="text-muted-foreground">Стоимость</dt>
                          <dd className="mt-1 font-semibold tabular-nums">{application.calculated_price} MDL</dd>
                        </div>
                      </dl>
                      <p className="mt-3 truncate text-xs text-muted-foreground" title={application.tariff?.company ? `${application.tariff.company.name} — ${application.tariff?.name ?? ''}` : application.tariff?.name ?? '—'}>
                        {application.tariff?.company ? `${application.tariff.company.name} — ` : ''}{application.tariff?.name ?? '—'}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => claimApplication(application.id)}
                        disabled={isUpdating}
                        className="mt-3 h-8 w-full rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-xs text-white hover:from-teal-600 hover:to-teal-700 focus-visible:ring-teal-500"
                      >
                        Взять в работу
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && applications.length > 0 && (
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/70 px-4 py-3">
              <span className="text-xs text-muted-foreground">Страница {activePage} из {totalPages}</span>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setCurrentPage(() => Math.max(1, activePage - 1))} disabled={activePage === 1} className="h-8 rounded-lg">
                  Назад
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setCurrentPage(() => Math.min(totalPages, activePage + 1))} disabled={activePage === totalPages} className="h-8 rounded-lg">
                  Вперёд
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default BrokerDashboard;
