import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'admin', label: 'Admin', icon: '⚙️' },
  { id: 'medecin', label: 'Médecin', icon: '🩺' },
  { id: 'secretaire', label: 'Secrétaire', icon: '📋' },
  { id: 'pharmacien', label: 'Pharmacien', icon: '💊' },
  { id: 'infirmier', label: 'Infirmier', icon: '🏥' },
  { id: 'caissier', label: 'Caissier', icon: '💳' },
];

function Login() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      const routes = {
        admin: '/dashboard',
        medecin: '/dashboard/medecin',
        secretaire: '/dashboard/secretaire',
        pharmacien: '/dashboard/pharmacien',
        infirmier: '/dashboard/infirmier',
        caissier: '/dashboard/caissier',
      };
      navigate(routes[user.role] || '/dashboard');
    } catch (err) {
      setError("Identifiants incorrects. Vérifiez votre nom d'utilisateur et mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* Côté gauche */}
      <div className="bg-navy flex flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="w-20 h-20 bg-green rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg shadow-green/40">
          🏥
        </div>
        <h1 className="font-serif text-4xl font-bold mb-2">GestCli</h1>
        <p className="text-sm text-white/50 uppercase tracking-widest mb-10">
          Système de Gestion Clinique
        </p>

        <div className="space-y-4 w-full max-w-sm">
          <Feature icon="🏨" title="Dossiers Patients" text="Gestion complète des patients et historiques" />
          <Feature icon="📅" title="Rendez-vous" text="Planification intelligente avec alertes" />
          <Feature icon="💊" title="Pharmacie & Stock" text="Suivi des médicaments et alertes" />
          <Feature icon="🧾" title="Facturation" text="Génération de factures et paiements" />
        </div>
      </div>

      {/* Côté droit */}
      <div className="flex flex-col justify-center items-center p-12 bg-white">
        <div className="w-full max-w-sm">
          <h2 className="font-serif text-2xl font-bold text-navy mb-1">Connexion</h2>
          <p className="text-gray-400 text-sm mb-8">Accédez à votre espace selon votre rôle</p>

          {/* Sélecteur de rôle */}
          <div className="grid grid-cols-3 gap-2 mb-7">
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
                  ${selectedRole === role.id
                    ? 'border-green bg-green/10'
                    : 'border-gray-200 hover:border-green'}`}
              >
                <span className="text-2xl">{role.icon}</span>
                <span className="text-xs font-semibold text-navy">{role.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-navy mb-2">
                Identifiant
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: admin"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-green"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-navy mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-green"
              />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green text-white rounded-lg font-bold shadow-lg shadow-green/30 hover:-translate-y-0.5 transition-transform disabled:opacity-50"
            >
              {loading ? '⏳ Connexion en cours...' : '🔐 Se connecter à GestCli'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-7">
            Clinique Sainte-Croix · Douala, Cameroun<br />
            <span className="text-green font-semibold">v1.0</span> · © 2026 GestCli · IUC Génie Logiciel
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
      <div className="w-10 h-10 bg-green/15 rounded-lg flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div className="text-sm">
        <div className="font-semibold text-white">{title}</div>
        <div className="text-white/60 text-xs">{text}</div>
      </div>
    </div>
  );
}

export default Login;