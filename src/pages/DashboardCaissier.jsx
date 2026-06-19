import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import { facturesAPI } from '../api/services';

function DashboardCaissier() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const res = await facturesAPI.liste();
      setFactures(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const payees = factures.filter(f => f.statut === 'payee');
  const impayees = factures.filter(f => f.statut === 'impayee' || f.statut === 'en_attente');
  const totalRecettes = payees.reduce((sum, f) => sum + parseFloat(f.montant_patient || 0), 0);

  const getStatutBadge = (statut) => {
    const map = {
      payee: { type: 'confirmed', label: 'Payée' },
      en_attente: { type: 'pending', label: 'En attente' },
      impayee: { type: 'urgent', label: 'Impayée' },
      annulee: { type: 'completed', label: 'Annulée' },
    };
    return map[statut] || { type: 'pending', label: statut };
  };

  return (
    <Layout title="Mon espace — Caisse">
      <div className="bg-gradient-to-br from-[#7d6608] to-[#b7950b] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shrink-0">💳</div>
          <div>
            <h2 className="font-serif text-xl font-bold mb-1">
              Bonjour, {user.nom || 'Eric'}
            </h2>
            <p className="text-sm text-white/60">Caissier · {factures.length} factures</p>
          </div>
          <div className="ml-auto flex gap-6">
            <StatBanner value={`${totalRecettes.toLocaleString()} FCFA`} label="Recettes" />
            <StatBanner value={impayees.length} label="Impayées" color="text-red-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="font-bold text-navy text-sm">Factures récentes</h3>
            <span
              onClick={() => navigate('/facturation')}
              className="text-xs text-green font-semibold cursor-pointer"
            >
              Toutes →
            </span>
          </div>
          <div className="px-5 pb-4 pt-2">
            {loading ? (
              <div className="text-center py-4 text-gray-400 text-sm">⏳ Chargement...</div>
            ) : factures.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">
                Aucune facture enregistrée
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-[10px] uppercase tracking-wide">
                    <th className="pb-2">Facture</th>
                    <th className="pb-2">Patient</th>
                    <th className="pb-2">Montant</th>
                    <th className="pb-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {factures.slice(0, 5).map((f) => {
                    const statut = getStatutBadge(f.statut);
                    return (
                      <tr key={f.id} className="border-t border-gray-100">
                        <td className="py-2 font-bold text-navy text-xs">
                          #F-{String(f.id).padStart(4, '0')}
                        </td>
                        <td className="py-2 text-xs">{f.patient_nom}</td>
                        <td className={`py-2 text-xs font-bold ${f.statut === 'payee' ? 'text-green' : 'text-red-500'}`}>
                          {parseFloat(f.montant_patient).toLocaleString()} FCFA
                        </td>
                        <td className="py-2">
                          <Badge type={statut.type}>{statut.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-navy text-sm mb-3">Résumé financier</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-400">Total factures</span>
                <span className="font-bold text-navy">{factures.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-400">Payées</span>
                <span className="font-bold text-green">{payees.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-400">Impayées / En attente</span>
                <span className="font-bold text-red-500">{impayees.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Recettes totales</span>
                <span className="font-bold text-green">
                  {totalRecettes.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-navy text-sm mb-3">Actions caisse</h3>
            <div className="grid grid-cols-2 gap-2">
              <QuickBtn icon="🧾" label="Nouvelle facture" color="bg-green/10 border-green/30 text-green" onClick={() => navigate('/facturation')} />
              <QuickBtn icon="💳" label="Paiements" color="bg-blue-50 border-blue-200 text-blue-700" onClick={() => navigate('/facturation')} />
              <QuickBtn icon="🖨️" label="Imprimer reçu" color="bg-amber-50 border-amber-200 text-amber-700" onClick={() => navigate('/facturation')} />
              <QuickBtn icon="📊" label="Rapport" color="bg-purple-50 border-purple-200 text-purple-700" onClick={() => navigate('/facturation')} />
            </div>
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

function QuickBtn({ icon, label, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer hover:-translate-y-0.5 transition-transform ${color}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[11px] font-semibold text-center leading-tight">{label}</span>
    </div>
  );
}

export default DashboardCaissier;