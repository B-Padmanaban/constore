import { Routes, Route, Navigate } from 'react-router-dom';
import Layout      from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute     from './components/common/AdminRoute';

import HomePage          from './pages/HomePage';
import ProductsPage      from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage          from './pages/CartPage';
import CheckoutPage      from './pages/CheckoutPage';
import OrdersPage        from './pages/OrdersPage';
import OrderDetailPage   from './pages/OrderDetailPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import ProfilePage       from './pages/ProfilePage';
import NotFoundPage      from './pages/NotFoundPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts  from './pages/admin/AdminProducts';
import AdminOrders    from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSettings  from './pages/admin/AdminSettings';

export default function App() {
  return (
    <Routes>
      {/* PUBLIC + USER ROUTES */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products"       element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="login"          element={<LoginPage />} />
        <Route path="register"       element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="cart"        element={<CartPage />} />
          <Route path="checkout"    element={<CheckoutPage />} />
          <Route path="orders"      element={<OrdersPage />} />
          <Route path="orders/:id"  element={<OrderDetailPage />} />
          <Route path="profile"     element={<ProfilePage />} />
        </Route>
      </Route>

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <AdminRoute minRole="staff">
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminRoute minRole="admin">      <AdminDashboard /> </AdminRoute>} />
        <Route path="products" element={<AdminRoute minRole="admin">    <AdminProducts />  </AdminRoute>} />
        <Route path="orders"   element={<AdminRoute minRole="staff">    <AdminOrders />    </AdminRoute>} />
        <Route path="customers"element={<AdminRoute minRole="admin">    <AdminCustomers /> </AdminRoute>} />
        <Route path="settings" element={<AdminRoute minRole="superadmin"><AdminSettings />  </AdminRoute>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}