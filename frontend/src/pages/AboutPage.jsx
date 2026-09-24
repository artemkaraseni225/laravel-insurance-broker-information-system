import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  CarFront,
  FileText,
  HeartPulse,
  House,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import AuthNavbar from '@/components/AuthNavbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const insuranceTypes = [
  {
    title: 'ОСАГО и автострахование',
    description: 'Подберите покрытие для автомобиля и получите прозрачный расчёт стоимости.',
    icon: CarFront,
  },
  {
    title: 'Страхование имущества',
    description: 'Защитите дом, квартиру и ценное имущество от непредвиденных рисков.',
    icon: House,
  },
  {
    title: 'Страхование здоровья',
    description: 'Выберите подходящую программу заботы о здоровье для себя и близких.',
    icon: HeartPulse,
  },
];

const steps = [
  {
    title: 'Заявка',
    description: 'Расскажите о том, что хотите застраховать, в простой форме.',
    icon: FileText,
  },
  {
    title: 'AI-анализ риска',
    description: 'Система помогает оценить риски и подобрать оптимальные условия.',
    icon: Sparkles,
  },
  {
    title: 'Одобрение брокером',
    description: 'Специалист проверяет предложение и отвечает на ваши вопросы.',
    icon: BadgeCheck,
  },
  {
    title: 'Полис',
    description: 'Получите готовый полис и управляйте им в личном кабинете.',
    icon: ShieldCheck,
  },
];

function AboutPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <AuthNavbar activePage="about" />

      <main>
        <section className="flex min-h-[60vh] items-center bg-gradient-to-br from-teal-400 to-teal-700 px-4 pb-16 pt-28 text-white sm:px-6">
          <div className="mx-auto w-full max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] uppercase text-teal-50/90">
              Insurance Platform
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">О платформе</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/90">
              Помогаем быстро находить страховую защиту с понятными условиями и AI-анализом рисков.
            </p>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight">Наша миссия</h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Мы делаем страхование понятным и доступным: объединяем предложения страховщиков,
              экспертную поддержку брокеров и технологии для более взвешенных решений.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight">Виды страхования</h2>
              <p className="mt-3 text-muted-foreground">Выберите защиту, которая соответствует вашим задачам.</p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {insuranceTypes.map(({ title, description, icon: Icon }) => (
                <Card key={title} className="!gap-0 rounded-2xl !p-6 shadow-md transition-shadow hover:shadow-lg">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 leading-6 text-muted-foreground">{description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight">Как это работает</h2>
              <p className="mt-3 text-muted-foreground">От заявки до полиса — понятный путь в несколько шагов.</p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ title, description, icon: Icon }, index) => (
                <div key={title} className="text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <Icon className="size-5" />
                  </div>
                  <span className="mt-4 inline-flex size-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-16 text-center text-white sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">Готовы начать?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            Создайте аккаунт, чтобы подобрать страховое решение и отправить заявку брокеру.
          </p>
          <Button asChild variant="outline" className="mt-7 h-11 rounded-lg border-white bg-white px-6 text-teal-600 hover:bg-teal-50 hover:text-teal-700">
            <Link to="/register">Зарегистрироваться</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}

export default AboutPage;
