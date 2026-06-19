import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import { patientsAPI, rendezvousAPI } from '../api/services';

function DashboardInfirmier() {
  const [patients, setPatients] = useState([]);
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [patRes, rdvRes] = await Promise.all([
        patientsAPI.liste(),
        rendezvousAPI.liste({}),
      ]);
      const patientsData = patRes.data.results || patRes.data;
      const rdvData = rdvRes.data.results || rdvRes.data;
      setPatients(patientsData);
      setTaches(genererTaches(rdvData));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Génère des tâches infirmières à partir des vrais RDV du jour
  const genererTaches = (rdvList) => {
    const aujourdhui = new Date().toISOString().split('T')[0];
    const rdvAujourdhui = rdvList.filter(r =>
      r.date_heure?.startsWith(aujourdhui) && r.statut !== 'annule'
    );

    const taches = [];

    rdvAujourdhui.forEach((rdv) => {
      const heure = new Date(rdv.date_heure).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
      });

      if (rdv.type_rdv === 'urgence') {
        taches.push({
          icon: '🚨',
          titre: `Prise de constantes — ${rdv.patient_nom}`,
          sub: `Urgence · ${rdv.salle || 'Salle non définie'} · Toutes les 30 min`,
          color: 'bg-red-50 border-red-200',
          priorite: 1,
        });
      } else if (rdv.type_rdv === 'chirurgie') {
        taches.push({
          icon: '🩹',
          titre: `Préparation pré-opératoire — ${rdv.patient_nom}`,
          sub: `${heure} · ${rdv.salle || '—'}`,
          color: 'bg-amber-50 border-amber-200',
          priorite: 2,
        });
      } else {
        taches.push({
          icon: '💉',
          titre: `Accueil & constantes — ${rdv.patient_nom}`,
          sub: `${heure} · ${rdv.medecin_nom}`,
          color: 'bg-green/5 border-green/30',
          priorite: 3,
        });
      }
    });

    // Tâche de fin de journée toujours présente
    taches.push({
      icon: '📋',
      titre: 'Rapport de garde — 18h00',
      sub: 'Transmission équipe nuit',
      color: 'bg-blue-50 border-blue-200',
      priorite: 4,
    });

    return taches.sort((a, b) => a.priorite - b.priorite);
  };

  const urgences = taches.filter(t => t.icon === '🚨').length;

  return (
    <Layout title="Mon espace — Infirmerie">
      <div className="bg-gradient-to-br from-[#922b21] to-[#c0392b] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shrink-0">🏥</div>
          <div>
            <h2 className="font-serif text-xl font-bold mb-1">
              Bonjour, {user.nom || 'Infirmier(ère)'}
            </h2>
            <p className="text-sm text-white/60">
              Service Urgences · {taches.length} tâche(s) aujourd'hui
              {urgences > 0 && ` · ${urgences} urgence(s)`}
            </p>
          </div>
          <div className="ml-auto flex gap-6">
            <StatBanner value={patients.length} label="Patients" />
            <StatBanner value={taches.length} label="Tâches" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="font-bold text-navy text-sm">Patients à surveiller</h3>
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
                    <th className="pb-2">Âge</th>
                    <th className="pb-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 5).map((p) => (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {p.prenom?.[0]}{p.nom?.[0]}
                          </div>
                          <span className="font-semibold text-navy text-xs">
                            {p.prenom} {p.nom}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-xs text-gray-500">{p.age} ans</td>
                      <td className="py-2.5">
                        <Badge type="confirmed">Actif</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="font-bold text-navy text-sm">Tâches du jour</h3>
            <span className="text-[11px] text-gray-400">
              Générées depuis les RDV
            </span>
          </div>
          <div className="p-5 space-y-2">
            {loading ? (
              <div className="text-center py-4 text-gray-400 text-sm">⏳ Chargement...</div>
            ) : taches.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">
                Aucune tâche pour aujourd'hui
              </div>
            ) : (
              taches.map((t, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${t.color}`}>
                  <span className="text-lg">{t.icon}</span>
                  <div>
                    <div className="font-semibold text-navy text-sm">{t.titre}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{t.sub}</div>
                  </div>
                </div>
              ))
            )}
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

export default DashboardInfirmier;