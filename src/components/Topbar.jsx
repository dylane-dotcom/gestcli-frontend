import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientsAPI, rendezvousAPI, medicamentsAPI } from '../api/services';

function Topbar({ title }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const handleSearch = async (val) => {
    setSearch(val);
    if (val.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setLoadingSearch(true);
    try {
      const res = await patientsAPI.liste({ search: val });
      const patients = res.data.results || res.data;
      setResults(patients.map(p => ({
        type: 'patient',
        label: `${p.prenom} ${p.nom}`,
        sub: `Patient · #P-${String(p.id).padStart(6, '0')}`,
        icon: '🏨',
        id: p.id,
      })));
      setShowResults(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleNotifs = async () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs) {
      try {
        const [rdvRes, medRes] = await Promise.all([
          rendezvousAPI.liste({}),
          medicamentsAPI.liste({ critique: 'true' }),
        ]);
        const rdvList = rdvRes.data.results || rdvRes.data;
        const medList = medRes.data.results || medRes.data;

        const newNotifs = [];
        const urgences = rdvList.filter(r => r.type_rdv === 'urgence' && r.statut !== 'annule');
        if (urgences.length > 0) {
          newNotifs.push({
            icon: '🚨',
            title: `${urgences.length} urgence(s) active(s)`,
            sub: 'Rendez-vous urgents en attente',
            color: 'bg-red-50 border-red-200',
          });
        }
        if (medList.length > 0) {
          newNotifs.push({
            icon: '💊',
            title: `${medList.length} médicament(s) en stock critique`,
            sub: 'Commande urgente recommandée',
            color: 'bg-amber-50 border-amber-200',
          });
        }
        const planifies = rdvList.filter(r => r.statut === 'planifie');
        if (planifies.length > 0) {
          newNotifs.push({
            icon: '📅',
            title: `${planifies.length} RDV non confirmés`,
            sub: 'En attente de confirmation',
            color: 'bg-blue-50 border-blue-200',
          });
        }
        if (newNotifs.length === 0) {
          newNotifs.push({
            icon: '✅',
            title: 'Aucune alerte',
            sub: 'Tout est en ordre',
            color: 'bg-green/5 border-green/20',
          });
        }
        setNotifs(newNotifs);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 z-40">

      {/* Titre */}
      <h1 className="font-serif text-base font-bold text-navy shrink-0">{title}</h1>

      {/* Barre de recherche */}
      <div className="relative flex-1 max-w-sm ml-4">
        <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            onFocus={() => search.length >= 2 && setShowResults(true)}
            className="bg-transparent text-sm outline-none w-full text-navy placeholder-gray-400"
          />
          {loadingSearch && <span className="text-xs text-gray-400">⏳</span>}
        </div>

        {/* Résultats */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
            {results.slice(0, 5).map((r, i) => (
              <div
                key={i}
                onMouseDown={() => {
                  navigate(`/dossier/${r.id}`);
                  setShowResults(false);
                  setSearch('');
                }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
              >
                <span className="text-lg">{r.icon}</span>
                <div>
                  <div className="font-semibold text-navy text-sm">{r.label}</div>
                  <div className="text-[11px] text-gray-400">{r.sub}</div>
                </div>
                <span className="ml-auto text-[10px] text-green font-semibold">
                  Voir dossier →
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Aucun résultat */}
        {showResults && results.length === 0 && search.length >= 2 && !loadingSearch && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-4 text-center text-sm text-gray-400">
            Aucun patient trouvé pour "{search}"
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleNotifs}
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors relative"
          >
            🔔
            {notifs.filter(n => n.icon !== '✅').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {notifs.filter(n => n.icon !== '✅').length}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-navy text-sm">Notifications</span>
                <button
                  onClick={() => setShowNotifs(false)}
                  className="text-gray-400 text-xs hover:text-navy"
                >
                  ✕
                </button>
              </div>
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="text-center py-4 text-gray-400 text-sm">⏳ Chargement...</div>
                ) : (
                  notifs.map((n, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${n.color}`}>
                      <span className="text-lg shrink-0">{n.icon}</span>
                      <div>
                        <div className="font-semibold text-navy">{n.title}</div>
                        <div className="text-gray-500 mt-0.5">{n.sub}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Paramètres */}
        <button
          onClick={() => navigate('/parametres')}
          className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          title="Paramètres"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
}

export default Topbar;