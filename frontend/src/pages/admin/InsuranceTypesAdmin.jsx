import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  useEffect(loadTypes, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(type) {
    setEditingId(type.id);
    setForm({
      name: type.name,
      code: type.code,
      description: type.description ?? '',
      status: type.status,
    });
    setWarning(null);
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
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Редактировать тип страхования' : 'Новый тип страхования'}</CardTitle>
          <CardDescription>
            Калькулятор и форма заявки на фронте захардкоржены только под auto/property/health —
            для нового типа страхования нужно будет доработать код.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
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
            {warning && <p className="text-sm text-amber-600">{warning}</p>}
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
          <CardTitle>Типы страхования</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground">Загрузка...</p>}
          {!loading && types.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">Код</th>
                  <th className="py-2">Название</th>
                  <th className="py-2">Статус</th>
                  <th className="py-2">Тарифов</th>
                  <th className="py-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {types.map((type) => (
                  <tr key={type.id} className="border-b last:border-0">
                    <td className="py-2">{type.code}</td>
                    <td className="py-2">{type.name}</td>
                    <td className="py-2">{type.status === 'active' ? 'Активен' : 'Неактивен'}</td>
                    <td className="py-2">{type.tariffs_count}</td>
                    <td className="py-2 flex gap-2">
                      <button
                        type="button"
                        className="text-destructive underline"
                        onClick={() => handleDelete(type.id)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default InsuranceTypesAdmin;
