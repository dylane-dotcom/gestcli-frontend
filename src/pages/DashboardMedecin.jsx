import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import { rendezvousAPI, patientsAPI } from '../api/services';

function DashboardMedecin() {
  const [rdvList, setRdvList] = useState([]);
  const [patients, setPatients] = useState([]);
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
      setPatients(patRes.data.results || patRes.data);
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
    <Layout title="Mon espace — Médecin">
      <div className="bg-gradient-to-br from-[#1a5276] to-[#2e86c1] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shrink-0">🩺</div>
          <div>
            <h2 className="font-serif text-xl font-bold mb-1">
              Bonjour, {user.nom || 'Dr. Kamga'}
            </h2>
            <p className="text-sm text-white/60">
              Médecin · {rdvList.length} rendez-vous · {patients.length} patients
            </p>
          </div>
          <div className="ml-auto flex gap-6">
            <StatBanner value={rdvList.length} label="RDV total" />
            <StatBanner value={patients.length} label="Patients" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="font-bold text-navy text-sm">Rendez-vous récents</h3>
            <span
              onClick={() => navigate('/rendezvous')}
              className="text-xs text-green font-semibold cursor-pointer"
            >
              Voir tout →
            </span>
          </div>
          <div className="p-4 space-y-2">
            {loading ? (
              <div className="text-center py-4 text-gray-400 text-sm">⏳ Chargement...</div>
            ) : rdvList.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">
                Aucun rendez-vous
              </div>
            ) : (
              rdvList.slice(0, 5).map((rdv, i) => {
                const statut = getStatutBadge(rdv.statut);
                return (
                  <div key={rdv.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="font-bold text-navy text-sm min-w-[48px]">
                      {formatHeure(rdv.date_heure)}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {rdv.patient_nom?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-navy text-sm">{rdv.patient_nom}</div>
                      <div className="text-[11px] text-gray-400">{rdv.type_rdv} · {rdv.salle || '—'}</div>
                    </div>
                    <Badge type={statut.type}>{statut.label}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="font-bold text-navy text-sm">Mes patients récents</h3>
            <span
              onClick={() => navigate('/patients')}
              className="text-xs text-green font-semibold cursor-pointer"
            >
              Tous →
            </span>
          </div>
          <div className="px-5 pb-4 pt-2">
            {loading ? (
              <div className="text-center py-4 text-gray-400 text-sm">⏳ Chargement...</div>
            ) : patients.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">
                Aucun patient enregistré
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-[10px] uppercase tracking-wide">
                    <th className="pb-2">Patient</th>
                    <th className="pb-2">Téléphone</th>
                    <th className="pb-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 5).map((p) => (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {p.prenom?.[0]}{p.nom?.[0]}
                          </div>
                          <span className="font-semibold text-navy text-xs">
                            {p.prenom} {p.nom}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-xs text-gray-500">{p.telephone}</td>
                      <td className="py-2.5">
                        <Badge type="confirmed">Actif</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => navigate('/dossier')}
                className="flex-1 py-2 bg-green text-white rounded-lg text-xs font-semibold shadow-md shadow-green/30"
              >
                ＋ Consultation
              </button>
              <button
                onClick={() => navigate('/rendezvous')}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-navy"
              >
                📅 Rendez-vous
              </button>
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

export default DashboardMedecin;