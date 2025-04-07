
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  
  // Redirect to dashboard if logged in, otherwise to login page
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

export default Index;
