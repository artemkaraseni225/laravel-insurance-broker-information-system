import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { register } from '../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AuthNavbar from '@/components/AuthNavbar';

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

  function showUnavailableFeature() {
    toast.info('Функциональность находится в разработке');
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

  const inputClassName = 'rounded-lg focus-visible:border-teal-500 focus-visible:ring-teal-500';

  return (
    <div className="relative min-h-screen bg-muted/40">
      <AuthNavbar activePage="register" />
      <main className="flex min-h-screen items-center justify-center px-4 py-24 sm:px-6">
        <Card className="w-full max-w-[960px] !grid !gap-0 !overflow-hidden rounded-2xl !py-0 shadow-xl md:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-[#07110f] [background-image:radial-gradient(ellipse_at_105%_52%,rgba(20,184,166,0.62),rgba(8,72,68,0.34)_30%,transparent_58%),linear-gradient(125deg,#111816_0%,#07110f_58%,#063a37_100%)] md:block" aria-hidden="true">
          <div className="absolute -right-28 -top-1/4 h-[150%] w-24 rotate-[27deg] bg-gradient-to-b from-transparent via-teal-200/35 to-transparent blur-sm" />
          <div className="absolute -right-16 -top-1/4 h-[150%] w-10 rotate-[27deg] bg-gradient-to-b from-transparent via-cyan-100/55 to-transparent blur-[2px]" />
          <div className="absolute -bottom-1/3 -right-1/2 size-[120%] rounded-full border border-teal-200/20 shadow-[0_0_100px_28px_rgba(20,184,166,0.2)]" />
        </div>

        <section className="flex flex-col justify-center p-8 sm:p-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Регистрация</h1>
              <p className="text-sm text-muted-foreground">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="font-medium text-teal-600 transition-colors hover:text-teal-700 hover:underline">
                  Войти
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Имя"
                  aria-label="Имя"
                  aria-invalid={Boolean(fieldError('name'))}
                  className={inputClassName}
                  required
                />
                {fieldError('name') && <p className="text-sm text-destructive">{fieldError('name')}</p>}
              </div>

              <div className="space-y-1.5">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  aria-label="Email"
                  aria-invalid={Boolean(fieldError('email'))}
                  className={inputClassName}
                  required
                />
                {fieldError('email') && <p className="text-sm text-destructive">{fieldError('email')}</p>}
              </div>

              <div className="space-y-1.5">
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Пароль"
                  aria-label="Пароль"
                  aria-invalid={Boolean(fieldError('password'))}
                  className={inputClassName}
                  required
                />
                {fieldError('password') && <p className="text-sm text-destructive">{fieldError('password')}</p>}
              </div>

              <div className="space-y-1.5">
                <Input
                  id="password_confirmation"
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  placeholder="Подтверждение пароля"
                  aria-label="Подтверждение пароля"
                  className={inputClassName}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Телефон"
                    aria-label="Телефон"
                    aria-invalid={Boolean(fieldError('phone'))}
                    className={inputClassName}
                    required
                  />
                  {fieldError('phone') && <p className="text-sm text-destructive">{fieldError('phone')}</p>}
                </div>

                <div className="space-y-1.5">
                  <Input
                    id="date_of_birth"
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    aria-label="Дата рождения"
                    aria-invalid={Boolean(fieldError('date_of_birth'))}
                    className={inputClassName}
                    required
                  />
                  {fieldError('date_of_birth') && <p className="text-sm text-destructive">{fieldError('date_of_birth')}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Адрес"
                  aria-label="Адрес"
                  aria-invalid={Boolean(fieldError('address'))}
                  className={inputClassName}
                  required
                />
                {fieldError('address') && <p className="text-sm text-destructive">{fieldError('address')}</p>}
              </div>

              {errors.general && <p className="text-sm text-destructive">{errors.general[0]}</p>}

              <Button
                type="submit"
                className="h-11 w-full rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 focus-visible:ring-teal-500"
                disabled={submitting}
              >
                <KeyRound className="size-4" />
                {submitting ? 'Отправка...' : 'Зарегистрироваться'}
              </Button>
            </form>

            <div className="my-7 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">или</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={showUnavailableFeature}
              className="h-11 w-full rounded-lg border-gray-300 bg-white text-foreground hover:bg-gray-50"
            >
              <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.52h3.15c1.84-1.7 2.9-4.2 2.9-7.29Z" />
                <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35L15.3 16.9c-.87.58-1.98.92-3.3.92-2.54 0-4.7-1.72-5.47-4.03H3.27v2.6A9.75 9.75 0 0 0 12 21.75Z" />
                <path fill="#FBBC05" d="M6.53 13.79A5.86 5.86 0 0 1 6.22 12c0-.62.11-1.22.31-1.79v-2.6H3.27A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.02 4.39l3.26-2.6Z" />
                <path fill="#EA4335" d="M12 6.18c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.24 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.73 5.36l3.26 2.6C7.3 7.9 9.46 6.18 12 6.18Z" />
              </svg>
              Войти через Google
            </Button>
          </div>
        </section>
        </Card>
      </main>
    </div>
  );
}

export default Register;
