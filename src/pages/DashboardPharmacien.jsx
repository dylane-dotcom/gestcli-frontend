import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { medicamentsAPI, ordonnancesAPI } from '../api/services';

function DashboardPharmacien() {
  const [medicaments, setMedicaments] = useState([]);
  const [critiques, setCritiques] = useState([]);
  const [ordonnances, setOrdonnances] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [medRes, critRes, ordRes] = await Promise.all([
        medicamentsAPI.liste(),
        medicamentsAPI.liste({ critique: 'true' }),
        ordonnancesAPI.liste({ statut: 'en_attente' }),
      ]);
      setMedicaments(medRes.data.results || medRes.data);
      setCritiques(critRes.data.results || critRes.data);
      setOrdonnances(ordRes.data.results || ordRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelivrer = async (ordonnanceId) => {
    try {
      await ordonnancesAPI.delivrer(ordonnanceId);
      chargerDonnees();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Erreur lors de la délivrance');
    }
  };

  return (
    <Layout title="Mon espace — Pharmacie">
      <div className="bg-gradient-to-br from-[#1e8449] to-[#117a3e] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shrink-0">💊</div>
          <div>
            <h2 className="font-serif text-xl font-bold mb-1">
              Bonjour, {user.nom || 'Pharmacien'}
            </h2>
            <p className="text-sm text-white/60">
              Pharmacien · {ordonnances.length} ordonnance(s) en attente · {critiques.length} alerte(s) stock
            </p>
          </div>
          <div className="ml-auto flex gap-6">
            <StatBanner value={medicaments.length} label="Médicaments" />
            <StatBanner value={ordonnances.length} label="Ordonnances" />
            <StatBanner value={critiques.length} label="Alertes" color="text-red-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">

        {/* Ordonnances en attente */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="font-bold text-navy text-sm">Ordonnances en attente</h3>
            <span className="text-xs text-gray-400">{ordonnances.length} à traiter</span>
          </div>
          <div className="px-5 pb-4 pt-2">
            {loading ? (
              <div className="text-center py-4 text-gray-400 text-sm">⏳ Chargement...</div>
            ) : ordonnances.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                <div className="text-2xl mb-2">✅</div>
                Aucune ordonnance en attente
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-[10px] uppercase tracking-wide">
                    <th className="pb-2">Patient</th>
                    <th className="pb-2">Médicament</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ordonnances.slice(0, 6).map((o) => (
                    <tr key={o.id} className="border-t border-gray-100">
                      <td className="py-2.5">
                        <div className="font-semibold text-navy text-xs">{o.patient_nom}</div>
                        <div className="text-[10px] text-gray-400">{o.medecin_nom}</div>
                      </td>
                      <td className="py-2.5 text-xs text-gray-500">
                        {o.medicament_nom}
                        <div className="text-[10px] text-gray-400">{o.posologie}</div>
                      </td>
                      <td className="py-2.5">
                        <button
                          onClick={() => handleDelivrer(o.id)}
                          className="px-3 py-1 bg-green text-white rounded-lg text-[11px] font-semibold"
                        >
                          Délivrer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Alertes stock */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="font-bold text-navy text-sm">Alertes stock critiques</h3>
            <span
              onClick={() => navigate('/pharmacie')}
              className="text-xs text-green font-semibold cursor-pointer"
            >
              Gérer stock →
            </span>
          </div>
          <div className="p-5 space-y-3">
            {loading ? (
              <div className="text-center py-4 text-gray-400 text-sm">⏳ Chargement...</div>
            ) : critiques.length === 0 ? (
              <div className="text-center py-4 text-green text-sm font-semibold">
                ✅ Aucune alerte — Stock suffisant
              </div>
            ) : (
              critiques.map((m) => (
                <div key={m.id} className="p-3 rounded-xl border bg-red-50 border-red-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-semibold text-navy text-sm">{m.nom}</div>
                    <span className="text-[11px] font-bold text-red-500">⚠️ Critique</span>
                  </div>
                  <div className="bg-white rounded-full h-1.5 mb-1">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{ width: `${Math.min(Math.round((m.stock_actuel / (m.seuil_alerte * 2)) * 100), 100)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {m.stock_actuel} unités · Seuil: {m.seuil_alerte}
                  </div>
                </div>
              ))
            )}
            <button
              onClick={() => navigate('/pharmacie')}
              className="w-full py-2 bg-green text-white rounded-lg text-xs font-semibold shadow-md shadow-green/30"
            >
              📦 Gérer le stock complet
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatBanner({ value, label, color = 'text-emerald-400' }) {
  return (
    <div className="text-center">
      <div className={`font-serif text-xl font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
    </div>
  );
}

export default DashboardPharmacien;