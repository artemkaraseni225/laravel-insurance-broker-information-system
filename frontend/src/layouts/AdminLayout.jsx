import AppShell from '../components/AppShell';

function AdminLayout() {
  return <AppShell brand="Панель администратора" home="/admin/users" contentClassName="w-full" links={[
    { to: '/admin/users', label: 'Пользователи', icon: 'users' },
    { to: '/admin/statistics', label: 'Статистика', icon: 'statistics' },
    { to: '/admin/create-user', label: 'Создать пользователя', icon: 'create' },
    { to: '/admin/tariffs', label: 'Тарифы', icon: 'tariffs' },
    { to: '/admin/insurance-types', label: 'Типы страхования', icon: 'insurance' },
  ]} />;
}

export default AdminLayout;
