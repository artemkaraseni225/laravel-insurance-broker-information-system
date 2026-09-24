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

function BrokerDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/broker/applications')
      .then(({ data }) => setApplications(data.applications ?? []))
      .catch(() => setError('Не удалось загрузить заявки'))
      .finally(() => setLoading(false));
  }, []);

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
    <main className="space-y-6">
      <Card className="!gap-0 overflow-hidden rounded-2xl !py-0 shadow-sm">
        <CardHeader className="!flex flex-col gap-5 border-b border-border/70 bg-gradient-to-r from-teal-50/80 to-background px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
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
        <CardContent className="!px-0">
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
            <Table className="min-w-[850px] text-sm">
              <TableHeader>
                <TableRow className="border-border/70 bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">Заявка</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">Клиент</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">Страхование</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">Тариф</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">Стоимость</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase">Статус</TableHead>
                  <TableHead className="px-6 py-3.5 text-right text-xs font-semibold tracking-wider uppercase">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => {
                  const isUpdating = updatingId === application.id;

                  return (
                    <TableRow key={application.id} className="border-border/60 transition-colors hover:bg-teal-50/50">
                      <TableCell className="px-6 py-4">
                        <span className="inline-flex h-8 items-center rounded-lg bg-teal-50 px-2.5 text-xs font-semibold tabular-nums text-teal-700 ring-1 ring-inset ring-teal-200">
                          #{application.id}
                        </span>
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
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => claimApplication(application.id)}
                            disabled={isUpdating}
                            className="h-8 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 focus-visible:ring-teal-500"
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
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default BrokerDashboard;
