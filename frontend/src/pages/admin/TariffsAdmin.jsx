import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  useEffect(() => {
    let active = true;

    Promise.all([
      api.get('/admin/tariffs'),
      api.get('/admin/insurance-types'),
      api.get('/admin/insurance-companies'),
    ])
      .then(([tariffsRes, typesRes, companiesRes]) => {
        if (!active) return;
        setTariffs(tariffsRes.data.tariffs);
        setTypes(typesRes.data.insurance_types);
        setCompanies(companiesRes.data.companies);
      })
      .catch(() => {
        if (active) setError('Не удалось загрузить данные');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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
    <div className="w-full space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/70 px-6 py-5">
          <CardTitle>{editingId ? 'Редактировать тариф' : 'Новый тариф'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4 px-6 sm:grid-cols-2 xl:grid-cols-3">
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
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="inactive">Неактивен</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive sm:col-span-2 xl:col-span-3">{error}</p>}
          </CardContent>
          <CardContent className="flex flex-wrap gap-2 px-6 pt-0">
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

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b border-border/70 px-5 py-4">
          <CardTitle>Тарифы</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 !px-0">
          {loading && <p className="px-5 pb-5 text-muted-foreground">Загрузка...</p>}
          {!loading && tariffs.length > 0 && (
            <Table className="min-w-[48rem] text-sm">
              <TableHeader>
                <TableRow className="border-border/70 bg-muted/50 hover:bg-muted/50">
                  <TableHead className="min-w-52 px-5">Тип</TableHead>
                  <TableHead className="min-w-44 px-4">Компания</TableHead>
                  <TableHead className="min-w-44 px-4">Название</TableHead>
                  <TableHead className="px-4">Цена</TableHead>
                  <TableHead className="px-4">Статус</TableHead>
                  <TableHead className="px-5 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariffs.map((tariff) => (
                  <TableRow key={tariff.id}>
                    <TableCell className="px-5 py-3 font-medium"><span className="block whitespace-normal break-words">{tariff.insurance_type?.name ?? '—'}</span></TableCell>
                    <TableCell className="px-4 py-3"><span className="block whitespace-normal break-words">{tariff.company?.name ?? '—'}</span></TableCell>
                    <TableCell className="px-4 py-3"><span className="block whitespace-normal break-words">{tariff.name}</span></TableCell>
                    <TableCell className="px-4 py-3 font-semibold tabular-nums">{tariff.base_price}</TableCell>
                    <TableCell className="px-4 py-3"><Badge variant={tariff.status === 'active' ? 'secondary' : 'outline'}>{tariff.status === 'active' ? 'Активен' : 'Неактивен'}</Badge></TableCell>
                    <TableCell className="px-5 py-3">
                      <div className="flex min-w-40 flex-wrap justify-end gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => startEdit(tariff)} aria-label={`Изменить тариф ${tariff.name}`}><Pencil />Изменить</Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(tariff.id)} aria-label={`Удалить тариф ${tariff.name}`}><Trash2 />Удалить</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && !error && tariffs.length === 0 && <p className="empty-state mx-5 mb-5">Тарифов пока нет.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default TariffsAdmin;
