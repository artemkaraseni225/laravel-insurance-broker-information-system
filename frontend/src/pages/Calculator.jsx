import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CarFront,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  House,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AuthNavbar from '@/components/AuthNavbar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Захардкоженные опции формы на тип страхования — соответствуют
// тому, что реально понимает CalculatorService на бэке (неделя 4).
const TYPE_FIELDS = {
  auto: {
    options: [
      { key: 'no_accident_history', label: 'Без аварий в истории (-10% от цены)' },
      { key: 'additional_driver', label: 'Доп. водитель (+15% к цене)' },
      { key: 'roadside_assistance', label: 'Помощь на дороге (+20% к цене)' },
    ],
  },
  property: {
    options: [
      { key: 'security_system_discount', label: 'Есть охранная сигнализация (-8% от цены)' },
      { key: 'full_coverage', label: 'Расширенное покрытие (+25% к цене)' },
    ],
  },
  health: {
    options: [
      { key: 'dental_addon', label: 'Стоматология (+15% к цене)' },
      { key: 'sports_addon', label: 'Экстремальные виды спорта (+10% к цене)' },
    ],
  },
};

// Доп. поля полной заявки — доступны только авторизованным клиентам
const ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

const EXTENDED_FIELDS = {
  auto: [
    { key: 'license_plate', label: 'Гос. номер ТС', type: 'text' },
    { key: 'vin_or_tech_passport', label: 'VIN-код или номер техпаспорта', type: 'text' },
    { key: 'engine_volume', label: 'Объём двигателя (см³)', type: 'number' },
    { key: 'driving_experience_years', label: 'Стаж вождения (лет)', type: 'number' },
    { key: 'idnp', label: 'IDNP (персональный код)', type: 'text' },
  ],
  property: [
    { key: 'property_address', label: 'Точный адрес (город, улица, дом, квартира)', type: 'text' },
    {
      key: 'property_type',
      label: 'Тип недвижимости',
      type: 'select',
      options: [
        { value: 'apartment', label: 'Квартира' },
        { value: 'house', label: 'Частный дом' },
      ],
    },
    { key: 'area_sqm', label: 'Площадь (кв. м)', type: 'number' },
    { key: 'idnp', label: 'IDNP (персональный код)', type: 'text' },
    { key: 'has_risk_factors', label: 'Есть деревянные перекрытия или печное отопление', type: 'checkbox' },
  ],
  health: [
    { key: 'date_of_birth', label: 'Точная дата рождения', type: 'date' },
    { key: 'idnp', label: 'IDNP / номер паспорта', type: 'text' },
  ],
};

const INSURANCE_PRESENTATION = {
  auto: {
    title: 'Автострахование',
    description: 'Защитите автомобиль и рассчитайте покрытие за пару минут.',
    icon: CarFront,
    tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  },
  property: {
    title: 'Страхование недвижимости',
    description: 'Спокойствие для дома, квартиры и важных вещей.',
    icon: House,
    tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  },
  health: {
    title: 'Медицинское страхование',
    description: 'Поддержка здоровья с понятными условиями и расчётом.',
    icon: HeartPulse,
    tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  },
};

function Calculator() {
  const calculatorRef = useRef(null);
  // Своя независимая проверка авторизации — в проекте нет общего
  // AuthContext, ProtectedRoute тоже сам стучится на /me при каждом
  // монтировании, делаем так же для единообразия
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      setAuthChecked(true);
      return;
    }

    api
      .get('/me')
      .then(({ data }) => setCurrentUser(data.user))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('auth_token');
        }
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [typeCode, setTypeCode] = useState('');
  const [tariffId, setTariffId] = useState('');
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [age, setAge] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [insuranceSum, setInsuranceSum] = useState('');
  const [termMonths, setTermMonths] = useState('12');
  const [options, setOptions] = useState({});

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Состояние подачи заявки — отдельно от расчёта цены
  const [showExtendedForm, setShowExtendedForm] = useState(false);
  const [extendedData, setExtendedData] = useState({});
  const [files, setFiles] = useState([]);
  const [application, setApplication] = useState(null);
  const [applicationError, setApplicationError] = useState(null);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [customerApplications, setCustomerApplications] = useState([]);
  const [customerPolicies, setCustomerPolicies] = useState([]);
  const [customerDataLoading, setCustomerDataLoading] = useState(false);

  useEffect(() => {
    api
      .get('/insurance-types')
      .then(({ data }) => setInsuranceTypes(data.data))
      .catch(() => setError('Не удалось загрузить типы страхования'))
      .finally(() => setLoadingTypes(false));
  }, []);

  useEffect(() => {
    if (currentUser?.role?.name !== 'customer') return;

    let active = true;
    setCustomerDataLoading(true);

    Promise.all([api.get('/applications'), api.get('/policies')])
      .then(([applicationsResponse, policiesResponse]) => {
        if (!active) return;
        setCustomerApplications(applicationsResponse.data.applications ?? []);
        setCustomerPolicies(policiesResponse.data.policies ?? []);
      })
      .finally(() => {
        if (active) setCustomerDataLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser]);

  const selectedType = insuranceTypes.find((t) => t.code === typeCode);
  const fieldsConfig = TYPE_FIELDS[typeCode];
  const recentApplications = customerApplications.slice(0, 4);
  const activeApplications = customerApplications.filter((item) => !['rejected', 'approved'].includes(item.status));
  const pendingApplications = customerApplications.filter((item) => item.status === 'in_review');
  const pendingPayments = customerApplications.filter(
    (item) => item.status === 'approved' && item.policy?.status !== 'paid',
  );

  function scrollToCalculator(code = '') {
    if (code) handleTypeChange(code);
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resetApplicationState() {
    setApplication(null);
    setApplicationError(null);
    setFiles([]);
    setUploadedCount(0);
    setUploadErrors([]);
    setShowExtendedForm(false);
    setExtendedData({});
  }

  function handleExtendedChange(key, value) {
    setExtendedData((prev) => ({ ...prev, [key]: value }));
  }

  function getInvalidDocuments(fileList) {
    return Array.from(fileList).filter((file) => {
      const name = file.name.toLowerCase();
      const extension = name.includes('.') ? name.split('.').pop() : '';
      return !ALLOWED_DOCUMENT_EXTENSIONS.includes(extension);
    });
  }

  function handleFilesSelected(e) {
    const newFiles = Array.from(e.target.files);
    const invalidFiles = getInvalidDocuments(newFiles);

    if (invalidFiles.length > 0) {
      setApplicationError('Некоторые файлы имеют неподходящий формат. Разрешены только PDF, JPG, JPEG, PNG.');
      e.target.value = '';
      return;
    }

    setApplicationError(null);
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = ''; // сбрасываем инпут, чтобы можно было выбрать те же файлы ещё раз при необходимости
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleTypeChange(code) {
    setTypeCode(code);
    setTariffId('');
    setOptions({});
    setInsuranceSum('');
    setResult(null);
    resetApplicationState();
  }

  function toggleOption(key, checked) {
    setOptions((prev) => ({ ...prev, [key]: checked }));
  }

  function buildPayload() {
    const selectedOptions = Object.entries(options)
      .filter(([, checked]) => checked)
      .map(([key]) => key);

    const payload = {
      insurance_type: typeCode,
      tariff_id: Number(tariffId),
      term_months: Number(termMonths),
      insurance_sum: typeCode === 'health' ? 250000 : Number(insuranceSum),
      options: selectedOptions,
    };

    if (typeCode === 'auto') {
      payload.age = Number(age);
      payload.car_brand = carBrand;
      payload.car_model = carModel;
    }

    if (typeCode === 'health') {
      payload.age = Number(age);
    }

    if (typeCode === 'property') {
      payload.property_value = Number(propertyValue);
    }

    return payload;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    resetApplicationState();
    setSubmitting(true);

    try {
      const { data } = await api.post('/calculator/quote', buildPayload());
      setResult(data);
    } catch (err) {
      if (err.response?.status === 422) {
        const messages = Object.values(err.response.data.errors ?? {}).flat();
        setError(messages[0] ?? 'Проверьте введённые данные');
      } else {
        setError('Не удалось рассчитать стоимость');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitApplication() {
    const invalidFiles = getInvalidDocuments(files);

    if (invalidFiles.length > 0) {
      setApplicationError('Файл имеет неподходящий формат. Разрешены только PDF, JPG, JPEG, PNG.');
      return;
    }

    setApplicationError(null);
    setSubmittingApplication(true);

    const extendedPayload = {
      personal_data_consent: !!extendedData.personal_data_consent,
    };

    for (const field of EXTENDED_FIELDS[typeCode] ?? []) {
      const value = extendedData[field.key];

      if (field.type === 'number') {
        extendedPayload[field.key] = value !== undefined && value !== '' ? Number(value) : value;
      } else if (field.type === 'checkbox') {
        extendedPayload[field.key] = !!value;
      } else {
        extendedPayload[field.key] = value;
      }
    }

    if (!extendedPayload.personal_data_consent) {
      setApplicationError('Необходимо согласие на обработку персональных данных.');
      setSubmittingApplication(false);
      return;
    }

    try {
      const { data } = await api.post('/applications', { ...buildPayload(), ...extendedPayload });
      setApplication(data.application);

      if (files.length > 0) {
        setUploadingDocuments(true);
        let uploaded = 0;
        const failedFiles = [];

        for (const file of files) {
          const formData = new FormData();
          formData.append('document', file);

          try {
            await api.post(`/applications/${data.application.id}/documents`, formData);
            uploaded += 1;
          } catch (uploadErr) {
            const reason =
              Object.values(uploadErr.response?.data?.errors ?? {}).flat()[0] ||
              uploadErr.response?.data?.message ||
              `ошибка ${uploadErr.response?.status ?? 'сети'}`;
            failedFiles.push(`${file.name}: ${reason}`);
          }
        }

        setUploadedCount(uploaded);
        setUploadErrors(failedFiles);
        setUploadingDocuments(false);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setApplicationError('unauthenticated');
      } else if (err.response?.status === 403) {
        setApplicationError('Заявки может подавать только клиент.');
      } else if (err.response?.status === 422) {
        const messages = Object.values(err.response.data.errors ?? {}).flat();
        setApplicationError(messages[0] ?? 'Проверьте данные заявки');
      } else {
        setApplicationError('Не удалось подать заявку');
      }
    } finally {
      setSubmittingApplication(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {!currentUser && authChecked && (
        <AuthNavbar activePage="calculator" />
      )}

      <main className={`relative bg-[radial-gradient(circle_at_15%_0%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_32%),radial-gradient(circle_at_90%_12%,color-mix(in_oklch,var(--accent)_75%,transparent),transparent_28%)] px-4 sm:px-6 lg:px-8 ${
        !currentUser && authChecked ? 'pb-8 pt-24 sm:pb-12 sm:pt-28 lg:pb-12' : 'py-8 sm:py-12 lg:py-12'
      }`}>
        <div className="mx-auto max-w-7xl space-y-16">
          <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-card/80 px-6 py-10 shadow-sm sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="max-w-xl">
                <p className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                  <Sparkles className="size-4" /> InsureFlow
                </p>
                <h1 className="max-w-lg text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                  Страхование стало проще
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Рассчитайте стоимость страхования, отправьте заявку брокеру и управляйте своими полисами в одном месте.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button type="button" size="lg" onClick={() => scrollToCalculator()}>
                    Рассчитать стоимость <ArrowRight className="size-4" />
                  </Button>
                  {currentUser?.role?.name === 'customer' && (
                    <Link to="/my-applications" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                      Посмотреть мои заявки
                    </Link>
                  )}
                </div>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><LockKeyhole className="size-4 text-primary" /> Понятные условия</span>
                  <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Поддержка брокера</span>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md lg:justify-self-end">
                <div className="relative aspect-[1.1] overflow-hidden rounded-3xl border border-primary/15 bg-primary/4.5 p-5 shadow-inner sm:p-8">
                  <div className="absolute inset-x-10 top-8 h-24 rounded-full bg-primary/10 blur-2xl" />
                  <div className="absolute right-8 top-7 flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-card text-primary shadow-sm"><ShieldCheck className="size-7" /></div>
                  <div className="absolute bottom-12 left-8 flex size-20 items-center justify-center rounded-3xl border border-sky-200 bg-sky-50 text-sky-700 shadow-sm dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300"><CarFront className="size-10" /></div>
                  <div className="absolute bottom-10 right-12 flex size-24 items-center justify-center rounded-3xl border border-amber-200 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300"><House className="size-12" /></div>
                  <div className="absolute left-1/2 top-1/2 flex size-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-primary/20 bg-card text-primary shadow-lg"><FileText className="size-10" /></div>
                  <div className="absolute bottom-5 left-1/2 h-px w-3/4 -translate-x-1/2 bg-primary/15" />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="page-header">
              <p className="page-eyebrow">Быстрый старт</p>
              <h2 className="page-title">Выберите тип страхования</h2>
              <p className="page-description">Рассчитайте ориентировочную стоимость и создайте заявку.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {Object.entries(INSURANCE_PRESENTATION).map(([code, item]) => {
                const Icon = item.icon;
                const available = insuranceTypes.some((type) => type.code === code);

                return (
                  <Card key={code} className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-md">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className={`mb-6 flex size-14 items-center justify-center rounded-2xl ${item.tone}`}>
                        <Icon className="size-7" strokeWidth={1.7} />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="mt-2 min-h-12 leading-6">{item.description}</CardDescription>
                      <Button type="button" variant="outline" className="mt-7 w-full justify-between" disabled={!available} onClick={() => scrollToCalculator(code)}>
                        {available ? 'Рассчитать' : 'Недоступно'} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {currentUser?.role?.name === 'customer' && (
            <>
              <section className="space-y-6">
                <div className="page-header">
                  <p className="page-eyebrow">Ваше пространство</p>
                  <h2 className="page-title">Всё важное под рукой</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Активные заявки', value: activeApplications.length, icon: FileText },
                    { label: 'Ожидают решения', value: pendingApplications.length, icon: Clock3 },
                    { label: 'Активные полисы', value: customerPolicies.length, icon: BadgeCheck },
                    { label: 'Ожидают оплаты', value: pendingPayments.length, icon: BriefcaseBusiness },
                  ].map(({ label, value, icon: Icon }) => (
                    <Card key={label} className="border-border/80 shadow-xs">
                      <CardContent className="flex items-center gap-4 p-5">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
                        <div className="min-w-0"><p className="text-2xl font-semibold tracking-tight">{customerDataLoading ? '—' : value}</p><p className="truncate text-sm text-muted-foreground">{label}</p></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div><CardTitle>Последние заявки</CardTitle><CardDescription>Следите за статусом обращений к брокеру.</CardDescription></div>
                    <Link to="/my-applications" className="shrink-0 text-sm font-medium text-primary hover:underline">Все заявки</Link>
                  </CardHeader>
                  <CardContent>
                    {customerDataLoading ? <p className="empty-state">Загрузка заявок...</p> : recentApplications.length === 0 ? (
                      <div className="empty-state flex-col gap-3"><FileText className="size-8 text-primary/60" /><div><p className="font-medium text-foreground">У вас пока нет заявок</p><p className="mt-1">Начните с расчёта подходящего покрытия.</p></div><Button type="button" size="sm" onClick={() => scrollToCalculator()}>Создать заявку</Button></div>
                    ) : (
                      <div className="divide-y divide-border/70">
                        {recentApplications.map((item) => {
                          const status = { new: 'Новая', in_review: 'На рассмотрении', approved: 'Одобрена', rejected: 'Отклонена' }[item.status] ?? item.status;
                          const amount = item.insurance_data?.insurance_sum ?? item.insurance_data?.property_value ?? '—';
                          return <Link key={item.id} to={`/my-applications/${item.id}`} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 hover:text-primary"><div className="min-w-0"><p className="truncate font-medium text-foreground">{item.insurance_type?.name ?? 'Страхование'}</p><p className="mt-1 text-xs text-muted-foreground">Заявка №{item.id} · {item.created_at ? new Date(item.created_at).toLocaleDateString('ru-RU') : 'Дата не указана'}</p></div><div className="flex shrink-0 items-end gap-3"><div className="text-right"><p className="text-sm font-medium text-foreground">{item.calculated_price ?? '—'} MDL</p><p className="mt-1 text-xs text-muted-foreground">Сумма: {amount}</p></div><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{status}</span><ArrowRight className="hidden size-4 text-muted-foreground sm:block" /></div></Link>;
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="bg-primary text-primary-foreground shadow-md">
                  <CardContent className="flex h-full flex-col justify-between gap-8 p-6 sm:p-7"><div><span className="mb-5 flex size-11 items-center justify-center rounded-xl bg-white/15"><CheckCircle2 className="size-5" /></span><h3 className="text-xl font-semibold">Всё под контролем</h3><p className="mt-2 text-sm leading-6 text-primary-foreground/75">От первого расчёта до готового полиса в одном понятном пространстве.</p></div><div className="space-y-3 text-sm"><span className="flex items-center gap-3"><Sparkles className="size-4" /> Онлайн-расчёт</span><span className="flex items-center gap-3"><BriefcaseBusiness className="size-4" /> Работа с брокером</span><span className="flex items-center gap-3"><BadgeCheck className="size-4" /> Управление полисами</span></div></CardContent>
                </Card>
              </section>
            </>
          )}

          <section ref={calculatorRef} className="scroll-mt-8">
            <div className="mb-6 page-header"><p className="page-eyebrow">Точный расчёт</p><h2 className="page-title">Рассчитайте стоимость</h2><p className="page-description">Укажите несколько параметров, чтобы получить ориентировочную стоимость покрытия.</p></div>
            <Card className="mx-auto w-full max-w-2xl shadow-md">
          <CardHeader>
            <CardTitle>Калькулятор страховки</CardTitle>
            <CardDescription>Выберите тип страхования и параметры</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Тип страхования</Label>
              <Select value={typeCode} onValueChange={handleTypeChange} disabled={loadingTypes}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingTypes ? 'Загрузка...' : 'Выберите тип'} />
                </SelectTrigger>
                <SelectContent>
                  {insuranceTypes.map((type) => (
                    <SelectItem key={type.code} value={type.code}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedType && (
              <div className="space-y-2">
                <Label>Тариф</Label>
                <Select value={tariffId} onValueChange={setTariffId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тариф" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedType.tariffs.map((tariff) => (
                      <SelectItem key={tariff.id} value={String(tariff.id)}>
                        {tariff.company ? `${tariff.company.name} — ` : ''}
                        {tariff.name} — от {tariff.base_price} / год
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {typeCode === 'auto' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="car_brand">Марка</Label>
                  <Input
                    id="car_brand"
                    value={carBrand}
                    onChange={(e) => setCarBrand(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="car_model">Модель</Label>
                  <Input
                    id="car_model"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurance_sum">Оценочная стоимость автомобиля (MDL)</Label>
                  <Input
                    id="insurance_sum"
                    type="number"
                    min="1"
                    value={insuranceSum}
                    onChange={(e) => setInsuranceSum(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Ваш возраст (лет)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {typeCode === 'health' && (
              <div className="space-y-2">
                <Label htmlFor="age">Возраст (лет)</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
            )}

            {typeCode === 'property' && (
              <div className="space-y-2">
                <Label htmlFor="insurance_sum">Оценочная стоимость имущества (MDL)</Label>
                <Input
                  id="insurance_sum"
                  type="number"
                  min="1"
                  value={insuranceSum}
                  onChange={(e) => {
                    setInsuranceSum(e.target.value);
                    setPropertyValue(e.target.value);
                  }}
                  required
                />
              </div>
            )}

            {typeCode && (
              <div className="space-y-2">
                <Label htmlFor="term_months">Срок (мес.)</Label>
                <Input
                  id="term_months"
                  type="number"
                  min="1"
                  max="60"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                  required
                />
              </div>
            )}

            {fieldsConfig && (
              <div className="space-y-2">
                <Label>Доп. опции</Label>
                {fieldsConfig.options.map((option) => (
                  <div key={option.key} className="flex items-center gap-2">
                    <Checkbox
                      id={option.key}
                      checked={!!options[option.key]}
                      onCheckedChange={(checked) => toggleOption(option.key, checked)}
                    />
                    <Label htmlFor={option.key} className="font-normal">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {result && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                <p className="text-sm text-muted-foreground">Итоговая стоимость</p>
                <p className="text-3xl font-semibold tracking-tight text-primary">{result.calculated_price}</p>
              </div>
            )}

            {result && (
              <div className="space-y-3 border-t pt-4">
                {!application && !showExtendedForm && authChecked && (
                  <>
                    {!currentUser && (
                      <p className="text-sm text-muted-foreground">
                        Чтобы оформить полноценную заявку, нужно{' '}
                          <Link to="/login" className="font-medium text-primary underline underline-offset-4">
                          войти
                        </Link>{' '}
                        или{' '}
                        <Link to="/register" className="font-medium text-primary underline underline-offset-4">
                          зарегистрироваться
                        </Link>
                        .
                      </p>
                    )}
                    {currentUser && currentUser.role?.name !== 'customer' && (
                      <p className="text-sm text-muted-foreground">
                        Заявки может подавать только клиент.
                      </p>
                    )}
                    {currentUser && currentUser.role?.name === 'customer' && (
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => setShowExtendedForm(true)}
                      >
                        Оформить заявку
                      </Button>
                    )}
                  </>
                )}

                {!application && showExtendedForm && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Для полноценной заявки нужно немного больше деталей:
                    </p>

                    {(EXTENDED_FIELDS[typeCode] ?? []).map((field) => (
                      <div key={field.key} className="space-y-2">
                        {field.type === 'checkbox' ? (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={field.key}
                              checked={!!extendedData[field.key]}
                              onCheckedChange={(checked) => handleExtendedChange(field.key, checked)}
                            />
                            <Label htmlFor={field.key} className="font-normal">
                              {field.label}
                            </Label>
                          </div>
                        ) : (
                          <>
                            <Label htmlFor={field.key}>{field.label}</Label>
                            {field.type === 'select' ? (
                              <Select
                                value={extendedData[field.key] ?? ''}
                                onValueChange={(value) => handleExtendedChange(field.key, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите" />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={field.key}
                                type={field.type}
                                value={extendedData[field.key] ?? ''}
                                onChange={(e) => handleExtendedChange(field.key, e.target.value)}
                                required={!field.optional}
                              />
                            )}
                          </>
                        )}
                      </div>
                    ))}

                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-3">
                      <Checkbox
                        id="personal_data_consent"
                        checked={!!extendedData.personal_data_consent}
                        onCheckedChange={(checked) => handleExtendedChange('personal_data_consent', checked)}
                      />
                      <Label htmlFor="personal_data_consent" className="font-normal">
                        Я согласен на обработку персональных данных
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documents">Прикрепить документы (необязательно)</Label>
                      <Input
                        id="documents"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFilesSelected}
                      />
                      {files.length > 0 && (
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {files.map((file, index) => (
                            <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2">
                              <span className="truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-destructive underline"
                              >
                                убрать
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}

                {applicationError === 'unauthenticated' ? (
                  <p className="text-sm text-destructive">
                    Войдите в аккаунт, чтобы подать заявку —{' '}
                    <Link to="/login" className="underline">
                      вход
                    </Link>{' '}
                    /{' '}
                    <Link to="/register" className="underline">
                      регистрация
                    </Link>
                    .
                  </p>
                ) : (
                  applicationError && <p className="text-sm text-destructive">{applicationError}</p>
                )}

                {application ? (
                  <div className="space-y-1">
                    <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                      Заявка №{application.id} создана, статус: {application.status}.
                      {uploadingDocuments && ' Загружаем документы...'}
                      {!uploadingDocuments && files.length > 0 && ` Загружено документов: ${uploadedCount} из ${files.length}.`}
                    </p>
                    {uploadErrors.length > 0 && (
                      <ul className="text-sm text-destructive">
                        {uploadErrors.map((msg) => (
                          <li key={msg}>{msg}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  showExtendedForm && (
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleSubmitApplication}
                      disabled={submittingApplication}
                    >
                      {submittingApplication ? 'Отправка заявки...' : 'Отправить заявку'}
                    </Button>
                  )
                )}
              </div>
            )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={submitting || !typeCode || !tariffId}>
                {submitting ? 'Считаем...' : 'Рассчитать'}
              </Button>
            </CardFooter>
          </form>
        </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Calculator;
