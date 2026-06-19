import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { personnelAPI } from '../api/services';

const ONGLETS = ["Tout le personnel", "Médecins", "Infirmiers", "Administratif"];

const ROLE_FILTER = {
  "Tout le personnel": null,
  "Médecins": "medecin",
  "Infirmiers": "infirmier",
  "Administratif": ["secretaire", "caissier", "pharmacien", "admin"],
};

const AVATARS = [
  'from-indigo-400 to-purple-600',
  'from-pink-400 to-red-400',
  'from-sky-400 to-cyan-300',
  'from-emerald-400 to-teal-300',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-green-600',
  'from-rose-400 to-pink-500',
];

function Personnel() {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState(0);
  const [showModalPersonnel, setShowModalPersonnel] = useState(false);
  const [showModalProfil, setShowModalProfil] = useState(false);
  const [showModalPlanning, setShowModalPlanning] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);

  useEffect(() => {
    chargerPersonnel();
  }, []);

  const chargerPersonnel = async () => {
    setLoading(true);
    try {
      const res = await personnelAPI.liste();
      setPersonnel(res.data.results || res.data);
    } catch (err) {
      console.error('Erreur chargement personnel:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = personnel.filter(p => {
    const filtre = ROLE_FILTER[ONGLETS[onglet]];
    if (!filtre) return true;
    if (Array.isArray(filtre)) return filtre.includes(p.role);
    return p.role === filtre;
  });

  const getRoleLabel = (role) => {
    const map = {
      admin: 'Administrateur',
      medecin: 'Médecin',
      secretaire: 'Secrétaire',
      pharmacien: 'Pharmacien',
      infirmier: 'Infirmier(ère)',
      caissier: 'Caissier',
    };
    return map[role] || role;
  };

  const getInitials = (first, last) => {
    if (!first && !last) return 'AD';
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  };

  return (
    <Layout title="Personnel Médical">

      {/* Onglets + bouton */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {ONGLETS.map((o, i) => (
            <button
              key={i}
              onClick={() => setOnglet(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${onglet === i
                  ? 'bg-navy text-white font-semibold'
                  : 'text-gray-600 hover:text-navy'}`}
            >
              {o}
              <span className="ml-1.5 text-[10px] opacity-60">
                ({personnel.filter(p => {
                  const filtre = ROLE_FILTER[o];
                  if (!filtre) return true;
                  if (Array.isArray(filtre)) return filtre.includes(p.role);
                  return p.role === filtre;
                }).length})
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModalPersonnel(true)}
          className="bg-green text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-green/30 hover:-translate-y-0.5 transition-transform"
        >
          ＋ Ajouter personnel
        </button>
      </div>

      {/* Grille */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">⏳</div>
          Chargement du personnel...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">👨‍⚕️</div>
          Aucun membre du personnel trouvé
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <StaffCard
              key={p.id}
              data={p}
              avatar={AVATARS[i % AVATARS.length]}
              initials={getInitials(p.first_name, p.last_name)}
              roleLabel={getRoleLabel(p.role)}
              onVoirProfil={() => {
                setSelectedPersonnel(p);
                setShowModalProfil(true);
              }}
              onPlanning={() => {
                setSelectedPersonnel(p);
                setShowModalPlanning(true);
              }}
            />
          ))}
        </div>
      )}

      {/* ── Modal Ajouter Personnel ── */}
      {showModalPersonnel && (
        <ModalOverlay onClose={() => setShowModalPersonnel(false)}>
          <ModalHeader
            title="Ajouter un membre du personnel"
            icon="👨‍⚕️"
            onClose={() => setShowModalPersonnel(false)}
          />
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-500">
              Pour ajouter un membre du personnel, utilisez l'interface d'administration Django :
            </p>
            
            <a  href="http://127.0.0.1:8000/admin/core/utilisateur/add/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-green/10 border border-green/30 rounded-xl hover:bg-green/20 transition-colors"
            >
              <span className="text-2xl">🔗</span>
              <div>
                <div className="font-semibold text-navy text-sm">
                  Ouvrir l'admin Django
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Créer un nouvel utilisateur avec son rôle
                </div>
              </div>
            </a>
            <p className="text-xs text-gray-400">
              💡 Après création, revenez ici et actualisez la page pour voir le nouveau membre.
            </p>
          </div>
          <ModalFooter
            onClose={() => setShowModalPersonnel(false)}
            showSubmit={false}
          />
        </ModalOverlay>
      )}

      {/* ── Modal Voir Profil ── */}
      {showModalProfil && selectedPersonnel && (
        <ModalOverlay onClose={() => setShowModalProfil(false)}>
          <ModalHeader
            title="Profil du personnel"
            icon="👤"
            onClose={() => setShowModalProfil(false)}
          />
          <div className="px-6 py-5">
            <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${AVATARS[0]} flex items-center justify-center text-white text-xl font-bold`}>
                {getInitials(selectedPersonnel.first_name, selectedPersonnel.last_name)}
              </div>
              <div>
                <div className="font-bold text-navy text-lg">
                  {selectedPersonnel.first_name} {selectedPersonnel.last_name}
                </div>
                <div className="text-sm text-gray-500">
                  {getRoleLabel(selectedPersonnel.role)}
                </div>
                {selectedPersonnel.specialite && (
                  <div className="text-sm text-green font-semibold">
                    {selectedPersonnel.specialite}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <InfoRow label="Username" value={selectedPersonnel.username} />
              <InfoRow label="Email" value={selectedPersonnel.email || '—'} />
              <InfoRow label="Téléphone" value={selectedPersonnel.telephone || '—'} />
              <InfoRow label="Rôle" value={getRoleLabel(selectedPersonnel.role)} />
              <InfoRow label="Spécialité" value={selectedPersonnel.specialite || '—'} />
            </div>
          </div>
          <ModalFooter
            onClose={() => setShowModalProfil(false)}
            showSubmit={false}
          />
        </ModalOverlay>
      )}

      {/* ── Modal Planning ── */}
      {showModalPlanning && selectedPersonnel && (
        <ModalOverlay onClose={() => setShowModalPlanning(false)}>
          <ModalHeader
            title={`Planning — ${selectedPersonnel.first_name} ${selectedPersonnel.last_name}`}
            icon="📅"
            onClose={() => setShowModalPlanning(false)}
          />
          <div className="px-6 py-5">
            <div className="grid grid-cols-7 gap-1 mb-3">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(j => (
                <div
                  key={j}
                  className="text-center text-xs font-semibold text-gray-400 py-1"
                >
                  {j}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {['Matin (08h-12h)', 'Après-midi (14h-18h)', 'Garde (18h-08h)'].map(
                (periode, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-36 text-xs text-gray-500 shrink-0">{periode}</div>
                    <div className="flex gap-1 flex-1">
                      {[0, 1, 2, 3, 4, 5, 6].map(j => (
                        <div
                          key={j}
                          className={`flex-1 h-8 rounded-md text-xs flex items-center justify-center font-semibold
                            ${j < 5 && i < 2
                              ? 'bg-green/15 text-green border border-green/30'
                              : j === 5 && i === 0
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-gray-50 text-gray-300 border border-gray-200'}`}
                        >
                          {j < 5 && i < 2 ? '✓' : j === 5 && i === 0 ? '½' : '—'}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green/30"></div>
                Disponible
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-100"></div>
                Partiel
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-gray-100"></div>
                Repos
              </div>
            </div>
          </div>
          <ModalFooter
            onClose={() => setShowModalPlanning(false)}
            showSubmit={false}
          />
        </ModalOverlay>
      )}
    </Layout>
  );
}

function StaffCard({ data, avatar, initials, roleLabel, onVoirProfil, onPlanning }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center hover:-translate-y-1 hover:shadow-lg transition-all">
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatar} flex items-center justify-center text-white text-xl font-bold mx-auto mb-3`}>
        {initials}
      </div>
      <div className="font-bold text-navy text-sm">
        {(data.first_name + ' ' + data.last_name).trim() || 'Administrateur'}
      </div>
      <div className="text-xs text-gray-400 mt-0.5">
        {data.specialite || roleLabel}
      </div>
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold mt-2 text-green">
        <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
        En service
      </div>
      <div className="mt-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
          ${data.role === 'admin' ? 'bg-purple-50 text-purple-700' :
            data.role === 'medecin' ? 'bg-blue-50 text-blue-700' :
            data.role === 'pharmacien' ? 'bg-green/10 text-green' :
            data.role === 'infirmier' ? 'bg-red-50 text-red-600' :
            'bg-gray-100 text-gray-600'}`}>
          {roleLabel}
        </span>
      </div>
      {data.email && (
        <div className="text-[10px] text-gray-400 mt-1.5 truncate">{data.email}</div>
      )}
      <div className="flex gap-2 mt-3">
        <button
          onClick={onVoirProfil}
          className="flex-1 py-1.5 border border-gray-200 rounded-lg text-[11px] font-semibold text-navy hover:bg-gray-50"
        >
          Voir profil
        </button>
        <button
          onClick={onPlanning}
          className="flex-1 py-1.5 border border-green rounded-lg text-[11px] font-semibold text-green bg-green/5 hover:bg-green/10"
        >
          Planning
        </button>
      </div>
    </div>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,25,47,0.7)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-[560px] max-w-[95vw] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, icon, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
      <h3 className="font-serif text-lg font-bold text-navy">
        {icon} {title}
      </h3>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
      >
        ✕
      </button>
    </div>
  );
}

function ModalFooter({ onClose, onSubmit, submitLabel = "✓ Enregistrer", showSubmit = true }) {
  return (
    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
      <button
        onClick={onClose}
        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-navy"
      >
        Fermer
      </button>
      {showSubmit && (
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-green text-white rounded-lg text-sm font-semibold shadow-md shadow-green/30"
        >
          {submitLabel}
        </button>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-navy">{value}</span>
    </div>
  );
}

export default Personnel;