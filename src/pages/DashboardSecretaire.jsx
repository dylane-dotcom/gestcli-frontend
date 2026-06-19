import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import { rendezvousAPI, patientsAPI } from '../api/services';

function DashboardSecretaire() {
  const [rdvList, setRdvList] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [rdvRes, patRes] = await Promise.all([
        rendezvousAPI.liste({}),
        patientsAPI.liste(),
      ]);
      setRdvList(rdvRes.data.results || rdvRes.data);
      setTotalPatients((patRes.data.results || patRes.data).length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatHeure = (dateHeure) => {
    if (!dateHeure) return '—';
    return new Date(dateHeure).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatutBadge = (statut) => {
    const map = {
      confirme: { type: 'confirmed', label: 'Confirmé' },
      planifie: { type: 'pending', label: 'Planifié' },
      en_cours: { type: 'inprogress', label: 'En cours' },
      termine: { type: 'completed', label: 'Terminé' },
      annule: { type: 'urgent', label: 'Annulé' },
    };
    return map[statut] || { type: 'pending', label: statut };
  };

  return (
    <Layout title="Mon espace — Secrétariat">
      <div className="bg-gradient-to-br from-[#6c3483] to-[#a93226] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shrink-0">📋</div>
          <div>
            <h2 className="font-serif text-xl font-bold mb-1">
              Bonjour, {user.nom || 'Laure'}
            </h2>
            <p className="text-sm text-white/60">Secrétaire médicale</p>
          </div>
          <div className="ml-auto flex gap-6">
            <StatBanner value={rdvList.length} label="RDV gérés" />
            <StatBanner value={totalPatients} label="Patients" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="font-bold text-navy text-sm">Rendez-vous récents</h3>
            <button
              onClick={() => navigate('/rendezvous')}
              className="bg-green text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              ＋ Nouveau RDV
            </button>
          </div>
          <div className="p-4 space-y-2">
            {loading ? (
              <div className="text-center py-4 text-gray-400 text-sm">⏳ Chargement...</div>
            ) : rdvList.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">Aucun rendez-vous</div>
            ) : (
              rdvList.slice(0, 5).map((rdv) => {
                const statut = getStatutBadge(rdv.statut);
                return (
                  <div key={rdv.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="font-bold text-navy text-sm min-w-[48px]">
                      {formatHeure(rdv.date_heure)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-navy text-sm">{rdv.patient_nom}</div>
                      <div className="text-[11px] text-gray-400">{rdv.medecin_nom}</div>
                    </div>
                    <Badge type={statut.type}>{statut.label}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-navy text-sm mb-3">Actions rapides</h3>
            <div className="grid grid-cols-2 gap-2">
              <QuickBtn icon="🏨" label="Enregistrer patient" color="bg-green/10 border-green/30 text-green" onClick={() => navigate('/patients')} />
              <QuickBtn icon="📅" label="Planifier RDV" color="bg-blue-50 border-blue-200 text-blue-700" onClick={() => navigate('/rendezvous')} />
              <QuickBtn icon="🔍" label="Chercher patient" color="bg-amber-50 border-amber-200 text-amber-700" onClick={() => navigate('/patients')} />
              <QuickBtn icon="📋" label="Planning complet" color="bg-purple-50 border-purple-200 text-purple-700" onClick={() => navigate('/rendezvous')} />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-navy text-sm mb-3">Résumé</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-400">Total RDV</span>
                <span className="font-bold text-navy">{rdvList.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-400">Confirmés</span>
                <span className="font-bold text-green">
                  {rdvList.filter(r => r.statut === 'confirme').length}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-400">En attente</span>
                <span className="font-bold text-amber-500">
                  {rdvList.filter(r => r.statut === 'planifie').length}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Total patients</span>
                <span className="font-bold text-navy">{totalPatients}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatBanner({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-serif text-xl font-bold text-emerald-400">{value}</div>
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

export default DashboardSecretaire;