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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-card/80">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/calculator" className="text-sm font-semibold tracking-tight">
            Insurance Broker
          </Link>
          <Link to="/calculator" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Калькулятор
          </Link>
        </nav>
      </header>
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/20 px-4 py-8 sm:px-6">
        <Card className="w-full max-w-sm shadow-md">
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
              <Button type="submit" className="h-10 w-full" disabled={submitting}>
                {submitting ? 'Вход...' : 'Войти'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Нет аккаунта?{' '}
                  <Link to="/register" className="font-medium text-primary underline underline-offset-4">
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
