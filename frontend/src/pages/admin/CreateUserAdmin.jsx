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
  phone: '',
  address: '',
  date_of_birth: '',
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
      const payload = { ...form };
      if (payload.role === 'broker') {
        delete payload.phone;
        delete payload.address;
        delete payload.date_of_birth;
      }

      await api.post('/admin/users', payload);
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
              <Select
                value={form.role}
                onValueChange={(role) => setForm((current) => ({
                  ...current,
                  role,
                  ...(role === 'broker'
                    ? { phone: '', address: '', date_of_birth: '' }
                    : {}),
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="broker">Брокер</SelectItem>
                  <SelectItem value="customer">Клиент</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.role === 'customer' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input id="address" name="address" value={form.address} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Дата рождения</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}
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
