import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const emptyForm = { name: '', code: '', description: '', status: 'active' };

function InsuranceTypesAdmin() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function loadTypes() {
    setLoading(true);
    api
      .get('/admin/insurance-types')
      .then(({ data }) => setTypes(data.insurance_types))
      .catch(() => setError('Не удалось загрузить типы страхования'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let active = true;

    api
      .get('/admin/insurance-types')
      .then(({ data }) => {
        if (active) setTypes(data.insurance_types);
      })
      .catch(() => {
        if (active) setError('Не удалось загрузить типы страхования');
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

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setSubmitting(true);

    try {
      const { data } = editingId
        ? await api.put(`/admin/insurance-types/${editingId}`, form)
        : await api.post('/admin/insurance-types', form);

      if (data.warning) {
        setWarning(data.warning);
      }

      cancelEdit();
      loadTypes();
    } catch (err) {
      const messages = Object.values(err.response?.data?.errors ?? {}).flat();
      setError(messages[0] ?? 'Не удалось сохранить тип страхования');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setError(null);

    try {
      await api.delete(`/admin/insurance-types/${id}`);
      loadTypes();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Не удалось удалить');
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/70 px-6 py-5">
          <CardTitle>{editingId ? 'Редактировать тип страхования' : 'Новый тип страхования'}</CardTitle>
          <CardDescription>
            Калькулятор и форма заявки на фронте захардкоржены только под auto/property/health —
            для нового типа страхования нужно будет доработать код.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4 px-6 sm:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Код (auto / property / health)</Label>
              <Input id="code" name="code" value={form.code} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input id="description" name="description" value={form.description} onChange={handleChange} />
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
            {warning && <p className="text-sm text-amber-600 sm:col-span-2 xl:col-span-3">{warning}</p>}
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
          <CardTitle>Типы страхования</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 !px-0">
          {loading && <p className="px-5 pb-5 text-muted-foreground">Загрузка...</p>}
          {!loading && types.length > 0 && (
            <Table className="min-w-[40rem] text-sm">
              <TableHeader>
                <TableRow className="border-border/70 bg-muted/50 hover:bg-muted/50">
                  <TableHead className="min-w-28 px-5">Код</TableHead>
                  <TableHead className="min-w-52 px-4">Название</TableHead>
                  <TableHead className="px-4">Статус</TableHead>
                  <TableHead className="px-4 text-center">Тарифов</TableHead>
                  <TableHead className="px-5 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="px-5 py-3 font-medium"><span className="block whitespace-normal break-words">{type.code}</span></TableCell>
                    <TableCell className="px-4 py-3 font-medium"><span className="block whitespace-normal break-words">{type.name}</span></TableCell>
                    <TableCell className="px-4 py-3"><Badge variant={type.status === 'active' ? 'secondary' : 'outline'}>{type.status === 'active' ? 'Активен' : 'Неактивен'}</Badge></TableCell>
                    <TableCell className="px-4 py-3 text-center font-semibold tabular-nums">{type.tariffs_count}</TableCell>
                    <TableCell className="px-5 py-3">
                      <div className="flex min-w-24 justify-end">
                        <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(type.id)} aria-label={`Удалить тип ${type.name}`}><Trash2 />Удалить</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && !error && types.length === 0 && <p className="empty-state mx-5 mb-5">Типов страхования пока нет.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default InsuranceTypesAdmin;
