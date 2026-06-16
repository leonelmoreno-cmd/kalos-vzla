import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { CatalogPage } from './pages/CatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { ProductListPage } from './pages/admin/ProductListPage';
import { ProductEditPage } from './pages/admin/ProductEditPage';
import { OrderListPage } from './pages/admin/OrderListPage';

export default function App() {
  return (
    <Routes>
      {/* Storefront */}
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success" element={<OrderSuccessPage />} />
      </Route>

      {/* Admin */}
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/new" element={<ProductEditPage />} />
        <Route path="products/:id" element={<ProductEditPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
