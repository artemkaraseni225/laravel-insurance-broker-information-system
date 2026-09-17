import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

const initialForm = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'customer',
  phone: '',
  address: '',
  date_of_birth: '',
};

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const data = await register(form);
      localStorage.setItem('auth_token', data.token);
      navigate('/');
    } catch (err) {
      // Laravel при 422 возвращает { errors: { field: [message, ...] } }
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        setErrors({ general: ['Не удалось зарегистрироваться'] });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(name) {
    return errors[name]?.[0];
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>Создайте новый аккаунт</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
              {fieldError('name') && <p className="text-sm text-destructive">{fieldError('name')}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              {fieldError('email') && <p className="text-sm text-destructive">{fieldError('email')}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              {fieldError('password') && <p className="text-sm text-destructive">{fieldError('password')}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Подтверждение пароля</Label>
              <Input
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
              {fieldError('phone') && <p className="text-sm text-destructive">{fieldError('phone')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Адрес</Label>
              <Input id="address" name="address" value={form.address} onChange={handleChange} />
              {fieldError('address') && <p className="text-sm text-destructive">{fieldError('address')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Дата рождения</Label>
              <Input
                id="date_of_birth"
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
              />
              {fieldError('date_of_birth') && (
                <p className="text-sm text-destructive">{fieldError('date_of_birth')}</p>
              )}
            </div>

            {errors.general && <p className="text-sm text-destructive">{errors.general[0]}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Отправка...' : 'Зарегистрироваться'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="underline">
                Войти
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default Register;
