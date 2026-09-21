import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusLabels = { new: 'Новые', in_review: 'На рассмотрении', approved: 'Одобрены', rejected: 'Отклонены' };
const statusColors = ['#0f766e', '#3b82f6', '#65a30d', '#dc2626'];
const formatCurrency = (value) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'MDL', maximumFractionDigits: 0 }).format(value);

function AdminStatistics() {
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/admin/statistics')
      .then(({ data }) => { if (active) setStatistics(data); })
      .catch(() => { if (active) setError('Не удалось загрузить статистику'); });
    return () => { active = false; };
  }, []);

  if (error) return <p className="page-shell text-destructive">{error}</p>;
  if (!statistics) return <p className="page-shell text-muted-foreground">Загрузка статистики...</p>;

  const statusData = Object.entries(statistics.status_counts).map(([key, total]) => ({ name: statusLabels[key] ?? key, total }));

  return (
    <main className="page-shell max-w-7xl">
      <div className="page-header"><p className="page-eyebrow">Обзор страхового портфеля</p><h1 className="page-title">Статистика</h1><p className="page-description">Ключевые показатели заявок и собранных премий.</p></div>
      <section className="grid gap-4 sm:grid-cols-2">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Всего заявок</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold tracking-tight">{statistics.total_applications}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Собранные премии</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold tracking-tight">{formatCurrency(statistics.collected_premiums)}</p></CardContent></Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Заявки по статусам</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="total" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={3}>{statusData.map((entry, index) => <Cell key={entry.name} fill={statusColors[index]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle>Заявки по типам страхования</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={statistics.applications_by_type} layout="vertical" margin={{ left: 12, right: 12 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={110} /><Tooltip /><Bar dataKey="total" name="Заявки" fill="#0f766e" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Собранные премии по месяцам</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={statistics.monthly_premiums} margin={{ left: 12, right: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="label" /><YAxis tickFormatter={(value) => `${value / 1000}k`} /><Tooltip formatter={(value) => formatCurrency(value)} /><Line type="monotone" dataKey="amount" name="Премии" stroke="#0f766e" strokeWidth={3} dot={{ r: 4, fill: '#0f766e' }} /></LineChart></ResponsiveContainer></CardContent></Card>
      </section>
    </main>
  );
}

export default AdminStatistics;