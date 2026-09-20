import { useState } from 'react';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const initialForm = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'broker',
};

function CreateUserAdmin() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      await api.post('/admin/users', form);
      setForm(initialForm);
      setMessage('Пользователь успешно создан.');
    } catch (requestError) {
      const messages = Object.values(requestError.response?.data?.errors ?? {}).flat();
      setError(messages[0] ?? requestError.response?.data?.message ?? 'Не удалось создать пользователя.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Создать пользователя</CardTitle>
          <CardDescription>Создайте новый аккаунт брокера или клиента.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Тип аккаунта</Label>
              <Select value={form.role} onValueChange={(role) => setForm((current) => ({ ...current, role }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="broker">Брокер</SelectItem>
                  <SelectItem value="customer">Пользователь</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" name="password" type="password" minLength="8" value={form.password} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Подтвердите пароль</Label>
              <Input id="password_confirmation" name="password_confirmation" type="password" minLength="8" value={form.password_confirmation} onChange={handleChange} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Создание...' : 'Создать аккаунт'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

export default CreateUserAdmin;
