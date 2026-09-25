import AppShell from '../components/AppShell';

function CustomerLayout() {
  return <AppShell brand="InsureFlow" home="/" links={[
    { to: '/', end: true, label: 'Калькулятор', icon: 'calculator' },
    { to: '/my-applications', label: 'Мои заявки', icon: 'applications' },
    { to: '/my-policies', label: 'Мои полисы', icon: 'policies' },
  ]} />;
}

export default CustomerLayout;
