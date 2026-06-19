import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardRouter() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'admin';

  useEffect(() => {
    const routes = {
      admin: '/dashboard',
      medecin: '/dashboard/medecin',
      secretaire: '/dashboard/secretaire',
      pharmacien: '/dashboard/pharmacien',
      infirmier: '/dashboard/infirmier',
      caissier: '/dashboard/caissier',
    };
    navigate(routes[role] || '/dashboard', { replace: true });
  }, []);

  return null;
}

export default DashboardRouter;