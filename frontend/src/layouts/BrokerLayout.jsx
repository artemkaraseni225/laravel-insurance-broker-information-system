import AppShell from '../components/AppShell';

function BrokerLayout() {
  return <AppShell brand="Insurance Broker" home="/broker/dashboard" fillWorkspace links={[
    { to: '/broker/dashboard', end: true, label: 'Дашборд', icon: 'dashboard' },
    { to: '/broker/applications', label: 'Мои заявки', icon: 'applications' },
  ]} />;
}

export default BrokerLayout;
