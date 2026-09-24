import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
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
  cancelled: 'Отменена',
};

const STATUS_STYLES = {
  approved: 'border-[#BBDCCF] bg-[#EDF8F2] text-[#327155]',
  rejected: 'border-[#E6C7C7] bg-[#FBF0F0] text-[#985252]',
  new: 'border-[#CBDCE7] bg-[#EFF5F8] text-[#47687C]',
  in_review: 'border-[#E7D5A8] bg-[#FCF6E8] text-[#8A6828]',
  cancelled: 'border-[#D6D6D6] bg-[#F4F4F4] text-[#707070]',
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
    <div className="mx-auto w-full max-w-7xl">
      <Card className="!gap-0 overflow-hidden rounded-2xl !py-0 shadow-sm">
        <CardHeader className="flex flex-col gap-5 border-b border-border/70 bg-gradient-to-r from-teal-50/80 to-background px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 shadow-sm">
              <FileText className="size-5" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Мои заявки</CardTitle>
              <CardDescription className="mt-1.5">Отслеживайте статус и переходите к оплате одобренных заявок.</CardDescription>
            </div>
          </div>
          <div className="w-full space-y-1.5 sm:w-52">
            <p className="text-xs font-medium text-muted-foreground">Статус заявки</p>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full rounded-lg bg-white focus:ring-teal-500">
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
          </div>
        </CardHeader>
        <CardContent className="!px-0">
          {loading && <p className="px-6 py-10 text-center text-muted-foreground">Загрузка...</p>}
          {error && <p className="m-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileText className="size-5" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {applications.length === 0 ? 'Заявок пока нет.' : 'Нет заявок с таким статусом.'}
              </p>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="w-full overflow-x-auto">
            <table className="applications-table w-full min-w-[720px] table-fixed text-sm max-sm:text-xs">
              <thead>
                <tr className="border-b border-border/70 bg-muted/50 text-left text-muted-foreground">
                  <th className="w-[8%] px-4 py-3.5 text-xs font-semibold tracking-wider uppercase max-sm:w-[11%] max-sm:px-2">№</th>
                  <th className="w-[17%] px-4 py-3.5 text-xs font-semibold tracking-wider uppercase max-sm:w-[27%] max-sm:px-2">Тип</th>
                  <th className="w-[23%] px-4 py-3.5 text-xs font-semibold tracking-wider uppercase max-sm:hidden">Тариф</th>
                  <th className="w-[14%] px-4 py-3.5 text-right text-xs font-semibold tracking-wider uppercase max-sm:w-[19%] max-sm:px-2">Цена</th>
                  <th className="w-[16%] px-4 py-3.5 text-xs font-semibold tracking-wider uppercase max-sm:w-[22%] max-sm:px-2">Статус</th>
                  <th className="w-[12%] px-4 py-3.5 text-xs font-semibold tracking-wider uppercase max-sm:hidden">Дата</th>
                  <th className="w-[10%] px-4 py-3.5 text-center text-xs font-semibold tracking-wider uppercase max-sm:w-[21%] max-sm:px-2">Действие</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-border/60 transition-colors hover:bg-teal-50/50 last:border-0">
                    <td className="wrap-break-word px-4 py-4 max-sm:px-2">
                      <Link to={`/my-applications/${app.id}`} className="inline-flex h-8 items-center rounded-lg bg-teal-50 px-2.5 text-xs font-semibold tabular-nums text-teal-700 ring-1 ring-inset ring-teal-200 transition-colors hover:bg-teal-100 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500">
                        #{app.id}
                      </Link>
                    </td>
                    <td className="wrap-break-word px-4 py-4 font-medium max-sm:px-2">{app.insurance_type?.name}</td>
                    <td className="wrap-break-word px-4 py-4 text-muted-foreground max-sm:hidden">
                      {app.tariff?.company ? `${app.tariff.company.name} — ` : ''}
                      {app.tariff?.name}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold tabular-nums max-sm:px-2">{app.calculated_price} MDL</td>
                    <td className="px-4 py-4 max-sm:px-2">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium max-sm:px-1.5 max-sm:text-[10px] ${STATUS_STYLES[app.status] ?? 'border-border bg-muted text-muted-foreground'}`}>
                        {STATUS_LABELS[app.status] ?? app.status}
                      </span>
                    </td>
                    <td className="wrap-break-word px-4 py-4 text-muted-foreground max-sm:hidden">{new Date(app.created_at).toLocaleDateString('ru-RU')}</td>
                    <td className="px-4 py-4 text-center max-sm:px-2">
                      {app.policy?.status === 'paid' ? (
                        <span className="text-xs font-medium text-muted-foreground">Оплачено</span>
                      ) : app.status === 'approved' ? (
                        <Link to={`/payment/${app.id}`} className="inline-flex h-8 items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 text-xs font-medium text-white shadow-sm transition-all hover:from-teal-600 hover:to-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 max-sm:px-2 max-sm:text-[10px]">
                          Оплатить
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MyApplications;
