import { useAuth } from '../context/AuthContext';

const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) return null;
  return children;
};

export default RoleGuard;
