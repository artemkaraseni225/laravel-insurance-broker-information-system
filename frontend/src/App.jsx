import { Routes, Route } from 'react-router-dom';
import BrokerLayout from './layouts/BrokerLayout';
import CustomerLayout from './layouts/CustomerLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Calculator from './pages/Calculator';
import MyApplications from './pages/MyApplications';
import MyPolicies from './pages/MyPolicies';
import ApplicationDetail from './pages/ApplicationDetail';
import BrokerDashboard from './pages/BrokerDashboard';
import BrokerApplications from './pages/BrokerApplications';
import PaymentPage from './pages/customer/PaymentPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Calculator />} />
        <Route path="my-applications" element={<MyApplications />} />
        <Route path="my-applications/:id" element={<ApplicationDetail />} />
        <Route path="my-policies" element={<MyPolicies />} />
      </Route>
      <Route
        path="/broker"
        element={
          <ProtectedRoute allowedRoles={['broker']}>
            <BrokerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<BrokerDashboard />} />
        <Route path="applications" element={<BrokerApplications />} />
        <Route
          path="applications/:id"
          element={<ApplicationDetail backPath="/broker/applications" />}
        />
      </Route>

      <Route
        path="/customer/payment/:policyId"
        element={<PaymentPage />}
    / >
    </Routes>
  );
}

export default App;
