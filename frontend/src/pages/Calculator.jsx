import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
      { key: 'no_accident_history', label: 'Без аварий в истории (-10%)' },
      { key: 'additional_driver', label: 'Доп. водитель (+15%)' },
      { key: 'roadside_assistance', label: 'Помощь на дороге (+20%)' },
    ],
  },
  property: {
    options: [
      { key: 'security_system_discount', label: 'Есть охранная сигнализация (скидка 8%)' },
      { key: 'full_coverage', label: 'Расширенное покрытие (+25%)' },
    ],
  },
  health: {
    options: [
      { key: 'dental_addon', label: 'Стоматология (+15%)' },
      { key: 'sports_addon', label: 'Экстремальные виды спорта (+10%)' },
    ],
  },
};

function Calculator() {
  const [isGuest, setIsGuest] = useState(() => !localStorage.getItem('auth_token'));
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    setIsGuest(!localStorage.getItem('auth_token'));
  }, []);

  const [typeCode, setTypeCode] = useState('');
  const [tariffId, setTariffId] = useState('');
  const [age, setAge] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [termMonths, setTermMonths] = useState('12');
  const [options, setOptions] = useState({});

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Состояние подачи заявки — отдельно от расчёта цены
  const [files, setFiles] = useState([]);
  const [application, setApplication] = useState(null);
  const [applicationError, setApplicationError] = useState(null);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadErrors, setUploadErrors] = useState([]);

  useEffect(() => {
    api
      .get('/insurance-types')
      .then(({ data }) => setInsuranceTypes(data.data))
      .catch(() => setError('Не удалось загрузить типы страхования'))
      .finally(() => setLoadingTypes(false));
  }, []);

  const selectedType = insuranceTypes.find((t) => t.code === typeCode);
  const fieldsConfig = TYPE_FIELDS[typeCode];

  function resetApplicationState() {
    setApplication(null);
    setApplicationError(null);
    setFiles([]);
    setUploadedCount(0);
  }

  function handleFilesSelected(e) {
    const newFiles = Array.from(e.target.files);
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
      options: selectedOptions,
    };

    if (typeCode === 'auto' || typeCode === 'health') {
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
    setApplicationError(null);
    setSubmittingApplication(true);

    try {
      const { data } = await api.post('/applications', buildPayload());
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
    <div className="min-h-screen bg-muted/40">
      {isGuest && (
        <header className="border-b bg-background">
          <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link to="/calculator" className="font-semibold">
              Insurance Broker
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Войти
              </Link>
              <Link to="/register" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Регистрация
              </Link>
            </div>
          </nav>
        </header>
      )}

      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Калькулятор страховки</CardTitle>
            <CardDescription>Выбери тип страхования и параметры</CardDescription>
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

            {(typeCode === 'auto' || typeCode === 'health') && (
              <div className="space-y-2">
                <Label htmlFor="age">Возраст</Label>
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
                <Label htmlFor="property_value">Стоимость имущества (в долларах $)</Label>
                <Input
                  id="property_value"
                  type="number"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
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
              <div className="rounded-md border bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">Итоговая стоимость</p>
                <p className="text-2xl font-bold">{result.calculated_price}</p>
              </div>
            )}

              {result && (
                <div className="space-y-3 border-t pt-4">
                  {!application && (
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
                      <p className="text-sm text-green-600">
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
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={handleSubmitApplication}
                      disabled={submittingApplication}
                    >
                      {submittingApplication ? 'Отправка заявки...' : 'Подать заявку'}
                    </Button>
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
      </main>
    </div>
  );
}

export default Calculator;
