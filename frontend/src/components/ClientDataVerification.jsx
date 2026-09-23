import { useState } from 'react';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const TYPE_FIELDS = {
  auto: [
    { key: 'brand', applicationKey: 'car_brand', label: 'Марка' },
    { key: 'model', applicationKey: 'car_model', label: 'Модель' },
    { key: 'year', label: 'Год выпуска' },
    { key: 'license_plate', label: 'Гос. номер ТС' },
    { key: 'vin_or_tech_passport', label: 'VIN-код или номер техпаспорта' },
    { key: 'engine_volume', label: 'Объём двигателя' },
    { key: 'vehicle_value', applicationKey: 'insurance_sum', label: 'Стоимость автомобиля' },
    { key: 'driving_experience_years', label: 'Стаж вождения' },
    { key: 'idnp', label: 'IDNP' },
    { key: 'had_accidents', label: 'Были аварии' },
    { key: 'accidents_description', label: 'Описание аварий' },
  ],
  property: [
    { key: 'property_address', clientKeys: ['property_address', 'address'], label: 'Адрес объекта' },
    { key: 'property_type', label: 'Тип недвижимости' },
    { key: 'area_sqm', label: 'Площадь' },
    { key: 'property_value', label: 'Стоимость имущества' },
    { key: 'idnp', label: 'IDNP' },
    { key: 'has_risk_factors', label: 'Есть факторы риска' },
    { key: 'has_wooden_floors', label: 'Деревянные перекрытия' },
    { key: 'has_stove_heating', label: 'Печное отопление' },
  ],
  health: [
    { key: 'date_of_birth', label: 'Дата рождения' },
    { key: 'idnp', label: 'IDNP' },
    { key: 'health_notes', label: 'Сведения о здоровье' },
  ],
};

function isMissing(value) {
  return value === null || value === undefined || value === '';
}

function formatValue(key, value) {
  if (isMissing(value)) return 'Не указано';
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';

  if (key === 'property_type') {
    return value === 'apartment' ? 'Квартира' : value === 'house' ? 'Частный дом' : String(value);
  }

  if (key === 'date_of_birth') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleDateString('ru-RU');
  }

  return String(value);
}

function valuesMatch(left, right) {
  if (typeof left === 'number' || typeof right === 'number') {
    return Number(left) === Number(right);
  }

  return String(left).trim().toLocaleLowerCase() === String(right).trim().toLocaleLowerCase();
}

function errorMessage(error) {
  const status = error.response?.status;

  if (status === 422) {
    const validationErrors = error.response?.data?.errors;
    const firstError = validationErrors && Object.values(validationErrors).flat()[0];
    return firstError || 'Проверьте сообщение: оно обязательно и не должно превышать 2000 символов.';
  }
  if (status === 429) return 'Слишком много запросов к AI. Подождите немного и попробуйте снова.';
  if (status === 503) return 'AI-сервис временно недоступен. Попробуйте позднее.';
  if (error.message === 'Invalid AI response') return 'AI вернул неполный ответ. Попробуйте ещё раз.';
  if (!error.response) return 'Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.';
  return 'Не удалось извлечь данные из сообщения. Попробуйте ещё раз.';
}

function ClientDataVerification({ insuranceTypeCode, applicationData }) {
  const [message, setMessage] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fields = TYPE_FIELDS[insuranceTypeCode] ?? [];

  if (fields.length === 0) return null;

  async function extractData() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError('Вставьте сообщение клиента, чтобы извлечь данные.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/applications/parse-text', {
        insurance_type: insuranceTypeCode,
        message: trimmedMessage,
      });

      if (!response.data?.data || typeof response.data.data !== 'object') {
        throw new Error('Invalid AI response');
      }

      setExtractedData(response.data.data);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Вставьте сообщение клиента, чтобы сравнить извлечённые AI данные с данными заявки. Заявка не будет изменена.
      </p>

      <div className="space-y-2">
        <label htmlFor="client-message" className="text-sm font-medium">Сообщение клиента</label>
        <Textarea
          id="client-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Вставьте сообщение клиента…"
          disabled={loading}
          maxLength={2000}
          className="min-h-32 resize-y"
        />
        <p className="text-xs text-muted-foreground">{message.length}/2000</p>
      </div>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <Button type="button" onClick={extractData} disabled={loading} aria-busy={loading}>
        {loading && <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        {loading ? 'Извлекаем данные…' : 'Извлечь данные'}
      </Button>

      {extractedData && (
        <div className="space-y-2">
          <h3 className="font-medium">Результат проверки</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Поле</TableHead>
                <TableHead>Данные заявки</TableHead>
                <TableHead>Данные клиента</TableHead>
                <TableHead>Результат</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => {
                const applicationValue = applicationData?.[field.applicationKey ?? field.key];
                const clientValue = (field.clientKeys ?? [field.key])
                  .map((key) => extractedData[key])
                  .find((value) => !isMissing(value));
                const canCompare = !isMissing(applicationValue) && !isMissing(clientValue);
                const matches = canCompare && valuesMatch(applicationValue, clientValue);

                return (
                  <TableRow key={field.key}>
                    <TableCell className="whitespace-normal font-medium">{field.label}</TableCell>
                    <TableCell className="whitespace-normal">{formatValue(field.key, applicationValue)}</TableCell>
                    <TableCell className="whitespace-normal">{formatValue(field.key, clientValue)}</TableCell>
                    <TableCell className="whitespace-normal">
                      {canCompare ? (
                        <span className={matches ? 'text-emerald-700' : 'text-amber-700'}>
                          {matches ? '✓ Совпадает' : '⚠ Не совпадает'}
                        </span>
                      ) : 'Не указано'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default ClientDataVerification;
