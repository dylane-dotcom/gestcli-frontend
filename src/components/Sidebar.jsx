import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { patientsAPI, rendezvousAPI, medicamentsAPI } from '../api/services';

const NAV_ITEMS = {
  admin: [
    { section: 'Principal', items: [
      { path: '/dashboard', icon: '📊', label: 'Tableau de bord' },
      { path: '/patients', icon: '🏨', label: 'Patients', badgeKey: 'patients' },
      { path: '/rendezvous', icon: '📅', label: 'Rendez-vous', badgeKey: 'rdv', badgeColor: 'bg-gold' },
      { path: '/dossier', icon: '🩺', label: 'Dossier Médical' },
      { path: '/pharmacie', icon: '💊', label: 'Pharmacie', badgeKey: 'medicaments', badgeColor: 'bg-red-500' },
    ]},
    { section: 'Gestion', items: [
      { path: '/personnel', icon: '👨‍⚕️', label: 'Personnel' },
      { path: '/facturation', icon: '🧾', label: 'Facturation' },
      { path: '/services', icon: '🏢', label: 'Services médicaux' },
      { path: '/statistiques', icon: '📈', label: 'Statistiques' },
    ]},
  ],
  medecin: [
    { section: 'Principal', items: [
      { path: '/dashboard/medecin', icon: '📊', label: 'Tableau de bord' },
      { path: '/patients', icon: '🏨', label: 'Mes patients', badgeKey: 'patients' },
      { path: '/rendezvous', icon: '📅', label: 'Mes rendez-vous', badgeKey: 'rdv', badgeColor: 'bg-gold' },
      { path: '/dossier', icon: '🩺', label: 'Dossier Médical' },
    ]},
  ],
  secretaire: [
    { section: 'Principal', items: [
      { path: '/dashboard/secretaire', icon: '📊', label: 'Tableau de bord' },
      { path: '/patients', icon: '🏨', label: 'Patients', badgeKey: 'patients' },
      { path: '/rendezvous', icon: '📅', label: 'Rendez-vous', badgeKey: 'rdv', badgeColor: 'bg-gold' },
    ]},
  ],
  pharmacien: [
    { section: 'Principal', items: [
      { path: '/dashboard/pharmacien', icon: '📊', label: 'Tableau de bord' },
      { path: '/pharmacie', icon: '💊', label: 'Pharmacie', badgeKey: 'medicaments', badgeColor: 'bg-red-500' },
    ]},
  ],
  infirmier: [
    { section: 'Principal', items: [
      { path: '/dashboard/infirmier', icon: '📊', label: 'Tableau de bord' },
      { path: '/patients', icon: '🏨', label: 'Patients', badgeKey: 'patients' },
      { path: '/dossier', icon: '🩺', label: 'Dossier Médical' },
    ]},
  ],
  caissier: [
    { section: 'Principal', items: [
      { path: '/dashboard/caissier', icon: '📊', label: 'Tableau de bord' },
      { path: '/facturation', icon: '🧾', label: 'Facturation' },
    ]},
  ],
};

const ROLE_LABELS = {
  admin: 'Administrateur',
  medecin: 'Médecin',
  secretaire: 'Secrétaire',
  pharmacien: 'Pharmacien',
  infirmier: 'Infirmier(ère)',
  caissier: 'Caissier',
};

const ROLE_AVATARS = {
  admin: 'AD',
  medecin: 'MD',
  secretaire: 'SC',
  pharmacien: 'PH',
  infirmier: 'IN',
  caissier: 'CA',
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role') || 'admin';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const sections = NAV_ITEMS[role] || NAV_ITEMS.admin;

  const [badges, setBadges] = useState({
    patients: null, rdv: null, medicaments: null
  });

  useEffect(() => {
    chargerBadges();
  }, []);

  const chargerBadges = async () => {
    try {
      const [patientsRes, rdvRes, medRes] = await Promise.all([
        patientsAPI.liste(),
        rendezvousAPI.liste({}),
        medicamentsAPI.liste({ critique: 'true' }),
      ]);
      setBadges({
        patients: (patientsRes.data.results || patientsRes.data).length,
        rdv: (rdvRes.data.results || rdvRes.data).length,
        medicaments: (medRes.data.results || medRes.data).length,
      });
    } catch (err) {
      console.error('Erreur badges:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getDashboardPath = () => {
    const paths = {
      admin: '/dashboard',
      medecin: '/dashboard/medecin',
      secretaire: '/dashboard/secretaire',
      pharmacien: '/dashboard/pharmacien',
      infirmier: '/dashboard/infirmier',
      caissier: '/dashboard/caissier',
    };
    return paths[role] || '/dashboard';
  };

  // Génère les initiales depuis le vrai nom de l'utilisateur
  const getInitials = () => {
  if (user?.nom && user.nom.trim()) {
    const parts = user.nom.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.nom.slice(0, 2).toUpperCase();
  }
  if (user?.username) {
    return user.username.slice(0, 2).toUpperCase();
  }
  return ROLE_AVATARS[role] || 'GC';
};

  return (
    <nav className="fixed left-0 top-0 w-64 h-screen bg-navy flex flex-col z-50 overflow-y-auto">

      {/* Logo */}
      <div
        className="p-5 border-b border-white/10 cursor-pointer"
        onClick={() => navigate(getDashboardPath())}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green to-emerald-600 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-green/30">
            🏥
          </div>
          <div>
            <div className="font-serif text-lg font-bold text-white">GestCli</div>
            <div className="text-[10px] text-green uppercase tracking-widest">
              Clinique Moderne
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {sections.map((section) => (
        <div key={section.section} className="px-3 pt-4 pb-1">
          <div className="text-[9px] font-semibold uppercase tracking-widest text-white/30 px-2 mb-1">
            {section.section}
          </div>
          {section.items.map((item) => {
            const active = location.pathname === item.path;
            const badgeValue = item.badgeKey ? badges[item.badgeKey] : null;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium mb-0.5 transition-colors relative
                  ${active
                    ? 'bg-green/20 text-green'
                    : 'text-white/55 hover:bg-white/5 hover:text-white'}`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-green rounded-r" />
                )}
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
                {badgeValue !== null && badgeValue > 0 && (
                  <span className={`ml-auto text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full min-w-5 text-center ${item.badgeColor || 'bg-green'}`}>
                    {badgeValue}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Système */}
      <div className="px-3 pt-4 pb-1">
        <div className="text-[9px] font-semibold uppercase tracking-widest text-white/30 px-2 mb-1">
          Système
        </div>
        <div
  onClick={() => navigate('/parametres')}
  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium mb-0.5 transition-colors relative
    ${location.pathname === '/parametres'
      ? 'bg-green/20 text-green'
      : 'text-white/55 hover:bg-white/5 hover:text-white'}`}
>
  {location.pathname === '/parametres' && (
    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-green rounded-r" />
  )}
  <span className="text-base w-5 text-center">⚙️</span>
  <span>Paramètres</span>
</div>
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium text-white/55 hover:bg-white/5 hover:text-white"
        >
          <span className="text-base w-5 text-center">🚪</span>
          <span>Déconnexion</span>
        </div>
      </div>

      {/* Footer utilisateur — affiche le VRAI nom connecté */}
      <div className="mt-auto p-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 bg-white/5 rounded-lg px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {getInitials()}
          </div>
          <div className="leading-tight overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">
              {user?.nom  || user?.username || ROLE_LABELS[role]}
            </div>
            <div className="text-[10px] text-white/40">
              {ROLE_LABELS[role]}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;