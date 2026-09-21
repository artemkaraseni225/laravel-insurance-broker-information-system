import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const emptyForm = {
  insurance_type_id: '',
  company_id: '',
  name: '',
  description: '',
  base_price: '',
  status: 'active',
};

function TariffsAdmin() {
  const [tariffs, setTariffs] = useState([]);
  const [types, setTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function loadAll() {
    setLoading(true);
    Promise.all([
      api.get('/admin/tariffs'),
      api.get('/admin/insurance-types'),
      api.get('/admin/insurance-companies'),
    ])
      .then(([tariffsRes, typesRes, companiesRes]) => {
        setTariffs(tariffsRes.data.tariffs);
        setTypes(typesRes.data.insurance_types);
        setCompanies(companiesRes.data.companies);
      })
      .catch(() => setError('Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(tariff) {
    setEditingId(tariff.id);
    setForm({
      insurance_type_id: String(tariff.insurance_type?.id ?? ''),
      company_id: tariff.company?.id ? String(tariff.company.id) : '',
      name: tariff.name,
      description: tariff.description ?? '',
      base_price: tariff.base_price,
      status: tariff.status,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      ...form,
      insurance_type_id: Number(form.insurance_type_id),
      company_id: form.company_id ? Number(form.company_id) : null,
      base_price: Number(form.base_price),
    };

    try {
      if (editingId) {
        await api.put(`/admin/tariffs/${editingId}`, payload);
      } else {
        await api.post('/admin/tariffs', payload);
      }

      cancelEdit();
      loadAll();
    } catch (err) {
      const messages = Object.values(err.response?.data?.errors ?? {}).flat();
      setError(messages[0] ?? 'Не удалось сохранить тариф');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setError(null);

    try {
      await api.delete(`/admin/tariffs/${id}`);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Не удалось удалить');
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Редактировать тариф' : 'Новый тариф'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Тип страхования</Label>
              <Select
                value={form.insurance_type_id}
                onValueChange={(v) => setForm({ ...form, insurance_type_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Компания</Label>
              <Select
                value={form.company_id}
                onValueChange={(v) => setForm({ ...form, company_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Без компании" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Название тарифа</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input id="description" name="description" value={form.description} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="base_price">Базовая цена (за год)</Label>
              <Input
                id="base_price"
                name="base_price"
                type="number"
                step="0.01"
                value={form.base_price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="w-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="inactive">Неактивен</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardContent className="flex gap-2 pt-0">
            <Button type="submit" disabled={submitting}>
              {editingId ? 'Сохранить' : 'Создать'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Отмена
              </Button>
            )}
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Тарифы</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground">Загрузка...</p>}
          {!loading && tariffs.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border/70">
            <table className="crm-table w-full">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">Тип</th>
                  <th className="py-2">Компания</th>
                  <th className="py-2">Название</th>
                  <th className="py-2">Цена</th>
                  <th className="py-2">Статус</th>
                  <th className="py-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {tariffs.map((tariff) => (
                  <tr key={tariff.id} className="border-b last:border-0">
                    <td className="py-2">{tariff.insurance_type?.name}</td>
                    <td className="py-2">{tariff.company?.name ?? '—'}</td>
                    <td className="py-2">{tariff.name}</td>
                    <td className="py-2">{tariff.base_price}</td>
                    <td className="py-2">{tariff.status === 'active' ? 'Активен' : 'Неактивен'}</td>
                    <td className="py-2 flex gap-2">
                      <button type="button" className="underline" onClick={() => startEdit(tariff)}>
                        Изменить
                      </button>
                      <button
                        type="button"
                        className="text-destructive underline"
                        onClick={() => handleDelete(tariff.id)}
                      >
                        Удалить
                      </button>
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

export default TariffsAdmin;
