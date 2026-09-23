import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ClientDataVerification from '../components/ClientDataVerification';
import { Button } from '@/components/ui/button';
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
  cancelled: 'Отменена',
};

const FIELD_LABELS = {
  age: 'Возраст',
  car_brand: 'Марка',
  car_model: 'Модель',
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

const RISK_LEVEL_LABELS = {
  LOW: 'Низкий риск',
  MEDIUM: 'Средний риск',
  HIGH: 'Высокий риск',
};

const RISK_LEVEL_STYLES = {
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-800',
  HIGH: 'border-red-200 bg-red-50 text-red-800',
};

function ApplicationDetail({ backPath = '/my-applications', showRiskAnalysis = false, showClientDataVerification = false }) {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentViewer, setDocumentViewer] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [riskAnalysisLoading, setRiskAnalysisLoading] = useState(false);
  const [riskAnalysisError, setRiskAnalysisError] = useState(null);
  const [riskAnalysisOpen, setRiskAnalysisOpen] = useState(false);
  const [clientDataVerificationOpen, setClientDataVerificationOpen] = useState(false);

  async function runRiskAnalysis() {
    setRiskAnalysisError(null);
    setRiskAnalysisLoading(true);

    try {
      const response = await api.get(`/applications/${id}/risk-analysis`);
      setRiskAnalysis(response.data.data);
      setRiskAnalysisOpen(true);
    } catch {
      setRiskAnalysisError('Не удалось выполнить AI-анализ. Попробуйте ещё раз.');
    } finally {
      setRiskAnalysisLoading(false);
    }
  }

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
        <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Заявка №{application.id}</CardTitle>
            <CardDescription>
              {application.insurance_type?.name}
              {application.tariff?.company ? ` — ${application.tariff.company.name}` : ''}
              {application.tariff ? ` — ${application.tariff.name}` : ''}
            </CardDescription>
          </div>
          {(showRiskAnalysis || showClientDataVerification) && (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              {showRiskAnalysis && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={runRiskAnalysis}
                  disabled={riskAnalysisLoading}
                  aria-busy={riskAnalysisLoading}
                  className="bg-green-50/80 hover:bg-green-100 text-green-950 border-green-200/80 shadow-none transition-colors"
                >
                  {riskAnalysisLoading && (
                    <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {riskAnalysisLoading ? 'Выполняется анализ...' : 'Выполнить AI-анализ'}
                </Button>
              )}
              {showClientDataVerification && (
                <Button 
                  type="button" variant="outline" onClick={() => setClientDataVerificationOpen(true)}
                  className="bg-green-50/80 hover:bg-green-100 text-green-950 border-green-200/80 shadow-none transition-colors"
                >
                  Выполнить AI проверку данных клиента
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {riskAnalysisError && (
            <p className="text-sm text-destructive" role="alert">{riskAnalysisError}</p>
          )}
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

          <Dialog open={riskAnalysisOpen} onOpenChange={setRiskAnalysisOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI-анализ риска</DialogTitle>
              </DialogHeader>
              {riskAnalysis && (
                <div className="space-y-5 text-sm">
                  <p className="rounded-md border border-primary/20 bg-primary/5 p-3 text-muted-foreground">
                    Результат носит рекомендательный характер и не изменяет статус заявки, тариф или стоимость.
                  </p>

                  <section>
                    <h3 className="mb-2 font-medium">Уровень риска</h3>
                    <div
                      className={`inline-flex rounded-full border px-3 py-1 font-medium ${
                        RISK_LEVEL_STYLES[riskAnalysis.risk_level] ?? 'border-border bg-muted text-foreground'
                      }`}
                    >
                      {RISK_LEVEL_LABELS[riskAnalysis.risk_level] ?? riskAnalysis.risk_level}
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-2 font-medium">Факторы риска</h3>
                    {riskAnalysis.factors?.length > 0 ? (
                      <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                        {riskAnalysis.factors.map((factor, index) => (
                          <li key={`${factor}-${index}`}>{factor}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Факторы риска не указаны.</p>
                    )}
                  </section>

                  <section>
                    <h3 className="mb-2 font-medium">Рекомендация для брокера</h3>
                    <p className="rounded-md border bg-muted/50 p-3 text-muted-foreground">
                      {riskAnalysis.recommendation}
                    </p>
                  </section>

                  <section className="flex items-center justify-between rounded-md border p-3">
                    <h3 className="font-medium">Качество данных заявки</h3>
                    <span className="text-base font-semibold">
                      {Number.isFinite(Number(riskAnalysis.data_quality_score))
                        ? `${Math.round(Number(riskAnalysis.data_quality_score) * 100)}%`
                        : '—'}
                    </span>
                  </section>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={clientDataVerificationOpen} onOpenChange={setClientDataVerificationOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>AI проверка данных клиента</DialogTitle>
              </DialogHeader>
              {clientDataVerificationOpen && (
                <ClientDataVerification
                  insuranceTypeCode={application.insurance_type?.code}
                  applicationData={data}
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
