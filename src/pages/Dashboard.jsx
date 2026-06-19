import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import useApi from '../hooks/useApi';
import { dashboardAPI } from '../api/services';

function Dashboard() {
  const { data: stats, loading } = useApi(dashboardAPI.stats);
  const navigate = useNavigate();

  return (
    <Layout title="Tableau de bord">

      {/* Bannière */}
      <div className="bg-gradient-to-br from-navy to-[#1e4976] rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-12 h-12 bg-green/20 rounded-full flex items-center justify-center text-2xl animate-pulse shrink-0">
            ❤️
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold mb-1">Bienvenue, Administrateur</h2>
            <p className="text-sm text-white/60">
              Tableau de bord général · GestCli
              {stats?.urgences > 0 && ` · ${stats.urgences} urgences en attente`}
            </p>
          </div>
          <div className="ml-auto flex gap-6">
            <Stat value="94%" label="Occupation" />
            <Stat value="18 min" label="Attente moy." />
            <Stat value="4.8 ⭐" label="Satisfaction" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2 w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard
            icon="🏨" iconBg="bg-green/10"
            value={stats?.total_patients ?? 0}
            label="Patients actifs"
            sub="Total enregistrés"
            trend="8.2%" trendUp
            accentColor="bg-green"
          />
          <KpiCard
            icon="📅" iconBg="bg-blue-50"
            value={stats?.rdv_aujourd_hui ?? 0}
            label="Rendez-vous aujourd'hui"
            sub={`${stats?.rdv_confirmes ?? 0} confirmés`}
            trend="5.1%" trendUp
            accentColor="bg-blue-500"
          />
          <KpiCard
            icon="💊" iconBg="bg-red-50"
            value={stats?.medicaments_critiques ?? 0}
            label="Médicaments critiques"
            sub="Stock sous le seuil"
            accentColor="bg-red-500"
          />
          <KpiCard
            icon="🧾" iconBg="bg-amber-50"
            value={stats?.factures_impayees ?? 0}
            label="Factures impayées"
            sub="En attente de paiement"
            accentColor="bg-gold"
          />
        </div>
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-2 gap-4">

        {/* Statistiques système */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-bold text-navy text-sm mb-4">Statistiques système</h3>
          <div className="space-y-1">
            <StatRow label="Total patients" value={stats?.total_patients ?? 0} color="text-green" />
            <StatRow label="RDV aujourd'hui" value={stats?.rdv_aujourd_hui ?? 0} color="text-blue-500" />
            <StatRow label="RDV confirmés" value={stats?.rdv_confirmes ?? 0} color="text-green" />
            <StatRow label="Urgences actives" value={stats?.urgences ?? 0} color="text-red-500" />
            <StatRow label="Médicaments critiques" value={stats?.medicaments_critiques ?? 0} color="text-amber-500" />
            <StatRow label="Factures impayées" value={stats?.factures_impayees ?? 0} color="text-red-500" />
            <StatRow label="Personnel actif" value={stats?.personnel_total ?? 0} color="text-purple-500" />
          </div>
        </div>

        {/* Actions rapides + état système */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-navy text-sm mb-3">Actions rapides</h3>
            <div className="grid grid-cols-2 gap-2">
              <QuickBtn
                icon="🏨"
                label="Nouveau patient"
                color="bg-green/10 border-green/30 text-green"
                onClick={() => navigate('/patients')}
              />
              <QuickBtn
                icon="📅"
                label="Planifier RDV"
                color="bg-blue-50 border-blue-200 text-blue-700"
                onClick={() => navigate('/rendezvous')}
              />
              <QuickBtn
                icon="🧾"
                label="Facturation"
                color="bg-amber-50 border-amber-200 text-amber-700"
                onClick={() => navigate('/facturation')}
              />
              <QuickBtn
                icon="💊"
                label="Pharmacie"
                color="bg-purple-50 border-purple-200 text-purple-700"
                onClick={() => navigate('/pharmacie')}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-navy text-sm mb-3">État du système</h3>
            <div className="space-y-2">
              <StatusRow label="API Django connectée" ok />
              <StatusRow label="Base de données MySQL active" ok />
              <StatusRow label="JWT Authentication actif" ok />
              <StatusRow label="Serveur React opérationnel" ok />
            </div>
            <button
              onClick={() => navigate('/statistiques')}
              className="w-full mt-4 py-2 bg-navy text-white rounded-lg text-xs font-semibold hover:-translate-y-0.5 transition-transform"
            >
              📊 Voir les statistiques complètes
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-serif text-xl font-bold text-emerald-400">{value}</div>
      <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`font-bold text-sm ${color}`}>{value}</span>
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
      <span className="text-[11px] font-semibold text-center">{label}</span>
    </div>
  );
}

function StatusRow({ label, ok }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-2 h-2 rounded-full ${ok ? 'bg-green animate-pulse' : 'bg-red-500'}`} />
      <span className={ok ? 'text-green font-semibold' : 'text-red-500 font-semibold'}>
        {label} {ok ? '✅' : '❌'}
      </span>
    </div>
  );
}

export default Dashboard;