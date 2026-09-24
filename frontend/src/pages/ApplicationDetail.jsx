import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, History, ShieldCheck, Sparkles } from 'lucide-react';
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

const STATUS_STYLES = {
  approved: 'border-[#BBDCCF] bg-[#EDF8F2] text-[#327155]',
  rejected: 'border-[#E6C7C7] bg-[#FBF0F0] text-[#985252]',
  new: 'border-[#CBDCE7] bg-[#EFF5F8] text-[#47687C]',
  in_review: 'border-[#E7D5A8] bg-[#FCF6E8] text-[#8A6828]',
  cancelled: 'border-[#D6D6D6] bg-[#F4F4F4] text-[#707070]',
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
    return (
      <div className="flex min-h-72 items-center justify-center px-4 py-10">
        <div className="flex flex-col items-center text-center text-muted-foreground">
          <span className="flex size-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <FileText className="size-5 animate-pulse" />
          </span>
          <p className="mt-4 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-72 w-full max-w-xl items-center px-4 py-10">
        <div className="w-full rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center shadow-sm">
          <p className="text-destructive">{error}</p>
          <Link to={backPath} className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50 hover:text-teal-800">
            <ArrowLeft className="size-4" />
            Назад к списку
          </Link>
        </div>
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
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Link to={backPath} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50 hover:text-teal-800">
        <ArrowLeft className="size-4" />
        Назад к списку
      </Link>

      <Card className="!gap-0 overflow-hidden rounded-2xl !py-0 shadow-sm">
        <CardHeader className="!flex flex-col gap-5 border-b border-border/70 bg-gradient-to-r from-teal-50/80 to-background px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 shadow-sm">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <CardTitle className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight">
                Заявка
                <span className="inline-flex h-8 items-center rounded-lg bg-teal-50 px-2.5 text-sm font-semibold tabular-nums text-teal-700 ring-1 ring-inset ring-teal-200">
                  #{application.id}
                </span>
              </CardTitle>
              <CardDescription className="mt-1.5">
                {application.insurance_type?.name}
                {application.tariff?.company ? ` — ${application.tariff.company.name}` : ''}
                {application.tariff ? ` — ${application.tariff.name}` : ''}
              </CardDescription>
            </div>
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
                  className="h-10 rounded-lg border-teal-200 bg-teal-50/80 text-teal-800 shadow-none transition-colors hover:border-teal-300 hover:bg-teal-100 focus-visible:ring-teal-500"
                >
                  {riskAnalysisLoading && (
                    <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {!riskAnalysisLoading && <Sparkles className="size-4" />}
                  {riskAnalysisLoading ? 'Выполняется анализ...' : 'Выполнить AI-анализ'}
                </Button>
              )}
              {showClientDataVerification && (
                <Button 
                  type="button" variant="outline" onClick={() => setClientDataVerificationOpen(true)}
                  className="h-10 rounded-lg border-teal-200 bg-teal-50/80 text-teal-800 shadow-none transition-colors hover:border-teal-300 hover:bg-teal-100 focus-visible:ring-teal-500"
                >
                  Выполнить AI проверку данных клиента
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-6">
          {riskAnalysisError && (
            <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{riskAnalysisError}</p>
          )}
          <div className="grid overflow-hidden rounded-xl border border-border/70 sm:grid-cols-2">
            <div className="border-b border-border/70 bg-muted/30 px-5 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Статус</p>
              <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[application.status] ?? 'border-border bg-muted text-muted-foreground'}`}>
                {STATUS_LABELS[application.status] ?? application.status}
              </span>
            </div>
            <div className="bg-muted/30 px-5 py-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Стоимость</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{application.calculated_price}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-5">
            <h3 className="mb-4 font-semibold">Параметры расчёта</h3>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {paramEntries.map(([key, value]) => (
                <div key={key} className="rounded-lg bg-muted/50 px-3 py-2.5">
                  <dt className="text-xs text-muted-foreground">{FIELD_LABELS[key] ?? key.replace(/_/g, ' ')}</dt>
                  <dd className="mt-1 break-words font-medium">{formatFieldValue(key, value)}</dd>
                </div>
              ))}
              {selectedOptions.length > 0 && (
                <div className="rounded-lg bg-muted/50 px-3 py-2.5 sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Доп. опции</dt>
                  <dd className="mt-1 font-medium">
                    {selectedOptions.map((opt) => OPTION_LABELS[opt] ?? opt).join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <FileText className="size-4 text-teal-700" />
              Документы
            </h3>
            {documentLoading && (
              <p className="mb-3 text-sm text-muted-foreground">Открытие документа...</p>
            )}
            {application.documents?.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {application.documents.map((doc) => (
                  <li key={doc.id} className="flex flex-col gap-2 rounded-lg bg-muted/50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      className="text-left font-medium text-teal-700 transition-colors hover:text-teal-800 hover:underline"
                      onClick={() => openDocument(doc)}
                    >
                      {doc.file_name}
                    </button>
                    <span className="text-xs text-muted-foreground">
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
            <DialogContent className="h-[85vh] max-w-5xl rounded-2xl">
              <DialogHeader>
                <DialogTitle>{documentViewer?.name}</DialogTitle>
              </DialogHeader>
              {documentViewer && (
                <iframe
                  src={documentViewer.url}
                  title={documentViewer.name}
                  className="h-full min-h-0 w-full rounded-xl border"
                />
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={riskAnalysisOpen} onOpenChange={setRiskAnalysisOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle>AI-анализ риска</DialogTitle>
              </DialogHeader>
              {riskAnalysis && (
                <div className="space-y-5 text-sm">
                  <p className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-muted-foreground">
                    Результат носит рекомендательный характер и не изменяет статус заявки, тариф или стоимость.
                  </p>

                  <section className="rounded-xl border border-border/70 p-4">
                    <h3 className="mb-3 font-medium">Уровень риска</h3>
                    <div
                      className={`inline-flex rounded-full border px-3 py-1 font-medium ${
                        RISK_LEVEL_STYLES[riskAnalysis.risk_level] ?? 'border-border bg-muted text-foreground'
                      }`}
                    >
                      {RISK_LEVEL_LABELS[riskAnalysis.risk_level] ?? riskAnalysis.risk_level}
                    </div>
                  </section>

                  <section className="rounded-xl border border-border/70 p-4">
                    <h3 className="mb-3 font-medium">Факторы риска</h3>
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

                  <section className="rounded-xl border border-border/70 p-4">
                    <h3 className="mb-3 font-medium">Рекомендация для брокера</h3>
                    <p className="rounded-lg bg-muted/50 p-3 text-muted-foreground">
                      {riskAnalysis.recommendation}
                    </p>
                  </section>

                  <section className="flex items-center justify-between rounded-xl border border-border/70 p-4">
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
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-4xl">
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

          <div className="rounded-xl border border-border/70 bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <History className="size-4 text-teal-700" />
              История изменений
            </h3>
            {application.status_history?.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {application.status_history.map((entry) => (
                  <li key={entry.id} className="border-l-2 border-teal-300 pl-4">
                    <div className="font-medium">
                      {entry.from_status
                        ? `${STATUS_LABELS[entry.from_status] ?? entry.from_status} → `
                        : ''}
                      {STATUS_LABELS[entry.to_status] ?? entry.to_status}
                    </div>
                    {entry.note && <div className="mt-1 text-muted-foreground">{entry.note}</div>}
                    <div className="mt-1 text-xs text-muted-foreground">
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
