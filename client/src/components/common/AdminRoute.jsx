import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ROLE_LEVEL = { user: 0, staff: 1, admin: 2, superadmin: 3 };

export default function AdminRoute({ children, minRole = 'staff' }) {
  const { user } = useAuthStore();
  const hasAccess = user && ROLE_LEVEL[user.role] >= ROLE_LEVEL[minRole];

  if (!hasAccess) return <Navigate to={user ? '/' : '/login'} replace />;

  // If wrapping a layout (AdminLayout), render children which contains <Outlet />
  // If wrapping a page component, render children directly
  return children ?? <Outlet />;
}