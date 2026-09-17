import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
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

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await login(form);
      localStorage.setItem('auth_token', data.token);
      navigate(data.user?.role?.name === 'broker' ? '/broker/dashboard' : '/');
    } catch (err) {
      setError('Неверный email или пароль');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/calculator" className="font-semibold">
            Insurance Broker
          </Link>
          <Link to="/calculator" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Калькулятор
          </Link>
        </nav>
      </header>
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Вход</CardTitle>
            <CardDescription>Войдите в свой аккаунт</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Вход...' : 'Войти'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Нет аккаунта?{' '}
                <Link to="/register" className="underline">
                  Зарегистрироваться
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}

export default Login;
