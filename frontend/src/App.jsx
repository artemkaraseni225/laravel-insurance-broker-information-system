import { Navigate, Routes, Route } from 'react-router-dom';
import BrokerLayout from './layouts/BrokerLayout';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Calculator from './pages/Calculator';
import MyApplications from './pages/MyApplications';
import MyPolicies from './pages/MyPolicies';
import ApplicationDetail from './pages/ApplicationDetail';
import BrokerDashboard from './pages/BrokerDashboard';
import BrokerApplications from './pages/BrokerApplications';
import PaymentPage from './pages/PaymentPage';
import PolicyDetail from "./pages/PolicyDetail";
import InsuranceTypesAdmin from './pages/admin/InsuranceTypesAdmin';
import TariffsAdmin from './pages/admin/TariffsAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';

function App() {
  return (
    <Routes>
      <Route path="/calculator" element={<Calculator />} />
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
        <Route path="policies/:id" element={<PolicyDetail />} />
        <Route path="payment/:policyId" element={<PaymentPage />} />
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
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="tariffs" element={<TariffsAdmin />} />
        <Route path="insurance-types" element={<InsuranceTypesAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/calculator" replace />} />

    </Routes>
  );
}

export default App;
