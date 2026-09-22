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
    <div className="mx-auto w-full max-w-7xl sm:p-6 lg:p-8">
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
            <p className="empty-state">
              {applications.length === 0 ? 'Заявок пока нет.' : 'Нет заявок с таким статусом.'}
            </p>
          )}

          {filtered.length > 0 && (
            <div className="w-full overflow-hidden rounded-lg border border-border/70">
            <table className="applications-table w-full table-fixed text-sm max-sm:text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="w-[8%] px-3 py-3 text-xs font-semibold tracking-wider uppercase max-sm:w-[11%] max-sm:px-2">№</th>
                  <th className="w-[17%] px-3 py-3 text-xs font-semibold tracking-wider uppercase max-sm:w-[27%] max-sm:px-2">Тип</th>
                  <th className="w-[23%] px-3 py-3 text-xs font-semibold tracking-wider uppercase max-sm:hidden">Тариф</th>
                  <th className="w-[14%] px-3 py-3 text-right text-xs font-semibold tracking-wider uppercase max-sm:w-[19%] max-sm:px-2">Цена</th>
                  <th className="w-[16%] px-3 py-3 text-xs font-semibold tracking-wider uppercase max-sm:w-[22%] max-sm:px-2">Статус</th>
                  <th className="w-[12%] px-3 py-3 text-xs font-semibold tracking-wider uppercase max-sm:hidden">Дата</th>
                  <th className="w-[10%] px-3 py-3 text-center text-xs font-semibold tracking-wider uppercase max-sm:w-[21%] max-sm:px-2">Действие</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b last:border-0">
                    <td className="wrap-break-word px-3 py-3 max-sm:px-2">
                      <Link to={`/my-applications/${app.id}`} className="font-medium text-primary underline underline-offset-4">
                        {app.id}
                      </Link>
                    </td>
                    <td className="wrap-break-word px-3 py-3 max-sm:px-2">{app.insurance_type?.name}</td>
                    <td className="wrap-break-word px-3 py-3 max-sm:hidden">
                      {app.tariff?.company ? `${app.tariff.company.name} — ` : ''}
                      {app.tariff?.name}
                    </td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums max-sm:px-2">{app.calculated_price} MDL</td>
                    <td className="px-3 py-3 max-sm:px-2">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium max-sm:px-1.5 max-sm:text-[10px] ${STATUS_STYLES[app.status] ?? 'border-border bg-muted text-muted-foreground'}`}>
                        {STATUS_LABELS[app.status] ?? app.status}
                      </span>
                    </td>
                    <td className="wrap-break-word px-3 py-3 max-sm:hidden">{new Date(app.created_at).toLocaleDateString('ru-RU')}</td>
                    <td className="px-3 py-3 text-center max-sm:px-2">
                      {app.policy?.status === 'paid' ? (
                        <span className="text-xs font-medium text-muted-foreground">Оплачено</span>
                      ) : app.status === 'approved' ? (
                        <Link to={`/payment/${app.id}`} className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground shadow-xs transition-colors hover:bg-[#0D665F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-sm:px-2 max-sm:text-[10px]">
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
