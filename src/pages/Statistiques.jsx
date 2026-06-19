import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { dashboardAPI, patientsAPI, rendezvousAPI, facturesAPI, medicamentsAPI } from '../api/services';

function Statistiques() {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [rdvList, setRdvList] = useState([]);
  const [factures, setFactures] = useState([]);
  const [medicaments, setMedicaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerStats();
  }, []);

  const chargerStats = async () => {
    setLoading(true);
    try {
      const [statsRes, patRes, rdvRes, facRes, medRes] = await Promise.all([
        dashboardAPI.stats(),
        patientsAPI.liste(),
        rendezvousAPI.liste({}),
        facturesAPI.liste(),
        medicamentsAPI.liste(),
      ]);
      setStats(statsRes.data);
      setPatients(patRes.data.results || patRes.data);
      setRdvList(rdvRes.data.results || rdvRes.data);
      setFactures(facRes.data.results || facRes.data);
      setMedicaments(medRes.data.results || medRes.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Statistiques">
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">⏳</div>
          Chargement des statistiques...
        </div>
      </Layout>
    );
  }

  const totalRecettes = factures
    .filter(f => f.statut === 'payee')
    .reduce((sum, f) => sum + parseFloat(f.montant_patient || 0), 0);

  const rdvConfirmes = rdvList.filter(r => r.statut === 'confirme').length;
  const rdvAnnules = rdvList.filter(r => r.statut === 'annule').length;
  const rdvPlanifies = rdvList.filter(r => r.statut === 'planifie').length;

  const facturesPayees = factures.filter(f => f.statut === 'payee').length;
  const facturesImpayees = factures.filter(f => f.statut === 'impayee' || f.statut === 'en_attente').length;

  const medCritiques = medicaments.filter(m => m.est_critique).length;

  const genreH = patients.filter(p => p.genre === 'M').length;
  const genreF = patients.filter(p => p.genre === 'F').length;

  return (
    <Layout title="Statistiques">

      {/* KPIs principaux */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon="🏨" value={patients.length} label="Total patients" color="bg-green" />
        <StatCard icon="📅" value={rdvList.length} label="Total rendez-vous" color="bg-blue-500" />
        <StatCard icon="💰" value={`${totalRecettes.toLocaleString()} FCFA`} label="Recettes totales" color="bg-gold" />
        <StatCard icon="💊" value={medicaments.length} label="Médicaments en stock" color="bg-purple-600" />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">

        {/* Statistiques patients */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-serif text-base font-bold text-navy mb-4">👥 Patients</h3>
          <div className="space-y-3">
            <BarStat label="Total patients" value={patients.length} max={patients.length} color="bg-green" />
            <BarStat label="Hommes" value={genreH} max={patients.length} color="bg-blue-500" />
            <BarStat label="Femmes" value={genreF} max={patients.length} color="bg-pink-500" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat label="Hommes" value={`${genreH} (${patients.length ? Math.round(genreH/patients.length*100) : 0}%)`} color="text-blue-500" />
            <MiniStat label="Femmes" value={`${genreF} (${patients.length ? Math.round(genreF/patients.length*100) : 0}%)`} color="text-pink-500" />
          </div>
        </div>

        {/* Statistiques RDV */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-serif text-base font-bold text-navy mb-4">📅 Rendez-vous</h3>
          <div className="space-y-3">
            <BarStat label="Total" value={rdvList.length} max={rdvList.length} color="bg-blue-500" />
            <BarStat label="Confirmés" value={rdvConfirmes} max={rdvList.length} color="bg-green" />
            <BarStat label="Planifiés" value={rdvPlanifies} max={rdvList.length} color="bg-gold" />
            <BarStat label="Annulés" value={rdvAnnules} max={rdvList.length} color="bg-red-500" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat label="Confirmés" value={rdvConfirmes} color="text-green" />
            <MiniStat label="Planifiés" value={rdvPlanifies} color="text-amber-500" />
            <MiniStat label="Annulés" value={rdvAnnules} color="text-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">

        {/* Statistiques facturation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-serif text-base font-bold text-navy mb-4">💰 Facturation</h3>
          <div className="space-y-3">
            <BarStat label="Total factures" value={factures.length} max={factures.length} color="bg-gold" />
            <BarStat label="Payées" value={facturesPayees} max={factures.length} color="bg-green" />
            <BarStat label="Impayées/Attente" value={facturesImpayees} max={factures.length} color="bg-red-500" />
          </div>
          <div className="mt-4 p-3 bg-green/10 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">Recettes totales encaissées</div>
            <div className="font-serif text-xl font-bold text-green">
              {totalRecettes.toLocaleString()} FCFA
            </div>
          </div>
        </div>

        {/* Statistiques pharmacie */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-serif text-base font-bold text-navy mb-4">💊 Pharmacie</h3>
          <div className="space-y-3">
            <BarStat label="Total médicaments" value={medicaments.length} max={medicaments.length} color="bg-purple-600" />
            <BarStat label="Stock OK" value={medicaments.length - medCritiques} max={medicaments.length} color="bg-green" />
            <BarStat label="Stock critique" value={medCritiques} max={medicaments.length} color="bg-red-500" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat label="En stock" value={medicaments.length - medCritiques} color="text-green" />
            <MiniStat label="Critiques" value={medCritiques} color="text-red-500" />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 relative overflow-hidden">
      <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${color}`} />
      <div className="text-2xl mb-3">{icon}</div>
      <div className="font-serif text-2xl font-bold text-navy">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function BarStat({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-bold text-navy">{value}</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <div className={`font-bold text-lg ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

export default Statistiques;