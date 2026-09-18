import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STATUS_LABELS = {
  new: 'Новая',
  in_review: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
};

const FIELD_LABELS = {
  age: 'Возраст',
  property_value: 'Стоимость имущества',
  term_months: 'Срок (мес.)',
  insurance_type: 'Тип страхования',
  tariff_id: 'ID тарифа',
  license_plate: 'Гос. номер ТС',
  vin_or_tech_passport: 'VIN-код или номер техпаспорта',
  engine_volume: 'Объём двигателя',
  driving_experience_years: 'Стаж вождения',
  property_address: 'Адрес имущества',
  property_type: 'Тип недвижимости',
  area_sqm: 'Площадь (кв. м)',
  has_risk_factors: 'Есть риски',
  date_of_birth: 'Дата рождения',
  idnp: 'IDNP',
  personal_data_consent: 'Согласие на обработку персональных данных',
};

const OPTION_LABELS = {
  no_accident_history: 'Без аварий в истории',
  additional_driver: 'Доп. водитель',
  roadside_assistance: 'Помощь на дороге',
  security_system_discount: 'Охранная сигнализация',
  full_coverage: 'Расширенное покрытие',
  dental_addon: 'Стоматология',
  sports_addon: 'Экстремальные виды спорта',
};

function ApplicationDetail({ backPath = '/my-applications' }) {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentViewer, setDocumentViewer] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);

  async function openDocument(document) {
    setError(null);
    setDocumentLoading(true);

    try {
      const response = await api.get(`/documents/${document.id}`, { responseType: 'blob' });
      const documentUrl = URL.createObjectURL(response.data);
      setDocumentViewer({
        name: document.file_name,
        url: documentUrl,
      });
    } catch {
      setError('Не удалось открыть документ');
    } finally {
      setDocumentLoading(false);
    }
  }

  function closeDocument() {
    setDocumentViewer((current) => {
      if (current) {
        URL.revokeObjectURL(current.url);
      }
      return null;
    });
  }

  useEffect(() => {
    api
      .get(`/applications/${id}`)
      .then(({ data }) => setApplication(data.application))
      .catch((err) => {
        if (err.response?.status === 403) {
          setError('Эта заявка вам не принадлежит');
        } else if (err.response?.status === 404) {
          setError('Заявка не найдена');
        } else {
          setError('Не удалось загрузить заявку');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="p-6 text-center text-muted-foreground">Загрузка...</p>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">{error}</p>
        <Link to={backPath} className="text-sm underline">
          ← Назад к списку
        </Link>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const data = application.insurance_data ?? {};
  const paramEntries = Object.entries(data)
    .filter(([key]) => key !== 'options')
    .sort(([left], [right]) => {
      const order = ['age', 'property_value', 'term_months', 'insurance_type', 'tariff_id'];
      const indexLeft = order.indexOf(left);
      const indexRight = order.indexOf(right);

      if (indexLeft !== -1 || indexRight !== -1) {
        return (indexLeft === -1 ? Number.MAX_SAFE_INTEGER : indexLeft) -
          (indexRight === -1 ? Number.MAX_SAFE_INTEGER : indexRight);
      }

      return left.localeCompare(right);
    });
  const selectedOptions = data.options ?? [];

  function formatFieldValue(key, value) {
    if (typeof value === 'boolean') {
      return value ? 'Да' : 'Нет';
    }

    if (key === 'property_type') {
      return value === 'apartment' ? 'Квартира' : value === 'house' ? 'Частный дом' : value;
    }

    if (key === 'date_of_birth' && value) {
      const parsedDate = new Date(value);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('ru-RU');
      }
    }

    return String(value);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <Link to={backPath} className="text-sm underline">
        ← Назад к списку
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Заявка №{application.id}</CardTitle>
          <CardDescription>
            {application.insurance_type?.name}
            {application.tariff?.company ? ` — ${application.tariff.company.name}` : ''}
            {application.tariff ? ` — ${application.tariff.name}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Статус</span>
            <span className="font-medium">
              {STATUS_LABELS[application.status] ?? application.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Стоимость</span>
            <span className="font-medium">{application.calculated_price}</span>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Параметры расчёта</h3>
            <dl className="space-y-1 text-sm">
              {paramEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{FIELD_LABELS[key] ?? key.replace(/_/g, ' ')}</dt>
                  <dd className="text-right">{formatFieldValue(key, value)}</dd>
                </div>
              ))}
              {selectedOptions.length > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Доп. опции</dt>
                  <dd className="text-right">
                    {selectedOptions.map((opt) => OPTION_LABELS[opt] ?? opt).join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Документы</h3>
            {documentLoading && (
              <p className="mb-2 text-sm text-muted-foreground">Открытие документа...</p>
            )}
            {application.documents?.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {application.documents.map((doc) => (
                  <li key={doc.id} className="flex justify-between">
                    <button
                      type="button"
                      className="text-left underline underline-offset-4 hover:text-foreground"
                      onClick={() => openDocument(doc)}
                    >
                      {doc.file_name}
                    </button>
                    <span className="text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Документов нет.</p>
            )}
          </div>

          <Dialog
            open={Boolean(documentViewer)}
            onOpenChange={(open) => {
              if (!open) closeDocument();
            }}
          >
            <DialogContent className="h-[85vh] max-w-5xl">
              <DialogHeader>
                <DialogTitle>{documentViewer?.name}</DialogTitle>
              </DialogHeader>
              {documentViewer && (
                <iframe
                  src={documentViewer.url}
                  title={documentViewer.name}
                  className="h-full min-h-0 w-full rounded-md border"
                />
              )}
            </DialogContent>
          </Dialog>

          <div>
            <h3 className="mb-2 font-medium">История изменений</h3>
            {application.status_history?.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {application.status_history.map((entry) => (
                  <li key={entry.id} className="border-l-2 pl-3">
                    <div>
                      {entry.from_status
                        ? `${STATUS_LABELS[entry.from_status] ?? entry.from_status} → `
                        : ''}
                      {STATUS_LABELS[entry.to_status] ?? entry.to_status}
                    </div>
                    {entry.note && <div className="text-muted-foreground">{entry.note}</div>}
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString('ru-RU')}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Пока нет изменений.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ApplicationDetail;
