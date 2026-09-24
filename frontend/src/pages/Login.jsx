import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { login } from '../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AuthNavbar from '@/components/AuthNavbar';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function showUnavailableFeature() {
    toast.info('Функциональность находится в разработке');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await login(form);
      localStorage.setItem('auth_token', data.token);
      const role = data.user?.role?.name;
      navigate(
        role === 'admin' ? '/admin/users' : role === 'broker' ? '/broker/dashboard' : '/',
      );
    } catch {
      setError('Неверный email или пароль');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-muted/40">
      <AuthNavbar activePage="login" />
      <main className="flex min-h-screen items-center justify-center px-4 py-24 sm:px-6">
        <Card className="w-full max-w-[960px] !grid !gap-0 !overflow-hidden rounded-2xl !py-0 shadow-xl md:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-[#07110f] [background-image:radial-gradient(ellipse_at_105%_52%,rgba(20,184,166,0.62),rgba(8,72,68,0.34)_30%,transparent_58%),linear-gradient(125deg,#111816_0%,#07110f_58%,#063a37_100%)] md:block" aria-hidden="true">
          <div className="absolute -right-28 -top-1/4 h-[150%] w-24 rotate-[27deg] bg-gradient-to-b from-transparent via-teal-200/35 to-transparent blur-sm" />
          <div className="absolute -right-16 -top-1/4 h-[150%] w-10 rotate-[27deg] bg-gradient-to-b from-transparent via-cyan-100/55 to-transparent blur-[2px]" />
          <div className="absolute -bottom-1/3 -right-1/2 size-[120%] rounded-full border border-teal-200/20 shadow-[0_0_100px_28px_rgba(20,184,166,0.2)]" />
        </div>

        <section className="flex min-h-[560px] flex-col justify-center p-8 sm:p-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Авторизация</h1>
              <p className="text-sm text-muted-foreground">
                Нет аккаунта?{' '}
                <Link to="/register" className="font-medium text-teal-600 transition-colors hover:text-teal-700 hover:underline">
                  Зарегистрироваться
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Логин / Электронная почта"
                aria-label="Логин или электронная почта"
                className="rounded-lg focus-visible:border-teal-500 focus-visible:ring-teal-500"
                required
              />
              <Input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Пароль"
                aria-label="Пароль"
                className="rounded-lg focus-visible:border-teal-500 focus-visible:ring-teal-500"
                required
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                className="h-11 w-full rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 focus-visible:ring-teal-500"
                disabled={submitting}
              >
                <KeyRound className="size-4" />
                {submitting ? 'Вход...' : 'Войти'}
              </Button>
            </form>

            <button
              type="button"
              onClick={showUnavailableFeature}
              className="mt-5 block w-full text-center text-sm text-teal-600 hover:underline"
            >
              Забыли пароль?
            </button>

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

export default Login;
