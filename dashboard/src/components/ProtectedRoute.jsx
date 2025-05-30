import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const role = localStorage.getItem('role');
  const isAuthenticated = localStorage.getItem('valid') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />; // Or to a "not authorized" page
  }

  return <Outlet />;
};

export default ProtectedRoute;