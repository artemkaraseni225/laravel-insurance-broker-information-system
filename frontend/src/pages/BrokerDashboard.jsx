import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <main className="space-y-8">
      <div className="page-header">
        <p className="page-eyebrow">Рабочее пространство брокера</p>
        <h1 className="page-title">Заявки клиентов</h1>
        <p className="page-description">Проверьте заявки и примите решение по каждой из них.</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Очередь заявок</CardTitle>
            <CardDescription>Новые заявки, доступные для обработки: {applications.length}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="empty-state">Загрузка заявок...</p>}
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

          {!loading && applications.length === 0 && (
            <p className="empty-state">Новых заявок пока нет.</p>
          )}

          {!loading && applications.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заявка</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Страхование</TableHead>
                  <TableHead>Тариф</TableHead>
                  <TableHead>Стоимость</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => {
                  const isUpdating = updatingId === application.id;

                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">№{application.id}</TableCell>
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
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => claimApplication(application.id)}
                            disabled={isUpdating}
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
