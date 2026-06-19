import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import Tag from '../components/Tag';
import Modal from '../components/Modal';
import { patientsAPI, servicesAPI } from '../api/services';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [patientASupprimer, setPatientASupprimer] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: '', prenom: '', date_naissance: '',
    genre: 'M', telephone: '', email: '',
    adresse: '', allergies: '', assurance: '',
    numero_assurance: '', groupe_sanguin: 'A+',
  });

  useEffect(() => {
    chargerPatients();
    chargerServices();
  }, [search, serviceFilter]);

  const chargerPatients = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (serviceFilter) params.service = serviceFilter;
      const res = await patientsAPI.liste(params);
      setPatients(res.data.results || res.data);
    } catch (err) {
      console.error('Erreur chargement patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const chargerServices = async () => {
    try {
      const res = await servicesAPI.liste();
      setServices(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await patientsAPI.creer(form);
      setShowModal(false);
      setForm({
        nom: '', prenom: '', date_naissance: '',
        genre: 'M', telephone: '', email: '',
        adresse: '', allergies: '', assurance: '',
        numero_assurance: '', groupe_sanguin: 'A+',
      });
      chargerPatients();
    } catch (err) {
      console.error('Erreur:', err.response?.data);
      alert('Erreur: ' + JSON.stringify(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const handleSupprimer = async () => {
    if (!patientASupprimer) return;
    try {
      await patientsAPI.supprimer(patientASupprimer.id);
      setShowConfirmDelete(false);
      setPatientASupprimer(null);
      chargerPatients();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const getServiceTag = (serviceNom) => {
    const map = {
      'Cardiologie': 'cardio', 'Pédiatrie': 'pedi',
      'Orthopédie': 'ortho', 'Neurologie': 'neuro',
      'Dermatologie': 'dermato',
    };
    return map[serviceNom] || 'medgen';
  };

  const getInitials = (prenom, nom) => {
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  };

  const AVATARS = [
    'from-indigo-400 to-purple-600',
    'from-pink-400 to-red-400',
    'from-sky-400 to-cyan-300',
    'from-emerald-400 to-teal-300',
    'from-amber-400 to-orange-500',
    'from-violet-400 to-purple-500',
  ];

  return (
    <Layout title="Gestion des Patients">

      {/* Filtres */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 mb-5 flex-wrap">
        <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 w-64">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Nom, prénom…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
        >
          <option value="">Tous les services</option>
          {services.map((s) => (
            <option key={s.id} value={s.nom}>{s.nom}</option>
          ))}
        </select>
        <button
          onClick={() => setShowModal(true)}
          className="ml-auto bg-green text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-green/30"
        >
          ＋ Enregistrer patient
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-2xl mb-2">⏳</div>
            Chargement des patients...
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-2xl mb-2">🏨</div>
            Aucun patient trouvé
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-[10px] uppercase tracking-wide bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">N° Dossier</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Médecin traitant</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p, i) => {
                const avatar = AVATARS[i % AVATARS.length];
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatar} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                          {getInitials(p.prenom, p.nom)}
                        </div>
                        <div>
                          <div className="font-semibold text-navy">{p.prenom} {p.nom}</div>
                          <div className="text-[11px] text-gray-400">
                            {p.genre === 'M' ? 'Homme' : 'Femme'} · {p.age} ans
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy text-[12.5px]">
                      #P-{String(p.id).padStart(6, '0')}
                    </td>
                    <td className="px-4 py-3">
                      {p.service_nom ? (
                        <Tag type={getServiceTag(p.service_nom)}>{p.service_nom}</Tag>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {p.medecin_traitant_nom || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.telephone}</td>
                    <td className="px-4 py-3">
                      <Badge type="confirmed">Actif</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => navigate(`/dossier/${p.id}`)}
                          className="px-2.5 py-1 border border-gray-200 rounded-md text-[11px] font-semibold bg-white hover:bg-gray-50"
                        >
                          📋 Dossier
                        </button>
                        <button
                          onClick={() => navigate('/rendezvous')}
                          className="px-2.5 py-1 border border-green rounded-md text-[11px] font-semibold text-green bg-green/10 hover:bg-green/20"
                        >
                          📅 RDV
                        </button>
                        <button
                          onClick={() => {
                            setPatientASupprimer(p);
                            setShowConfirmDelete(true);
                          }}
                          className="px-2.5 py-1 border border-red-200 rounded-md text-[11px] font-semibold text-red-500 bg-red-50 hover:bg-red-100"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {patients.length > 0 && (
          <div className="flex items-center px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {patients.length} patient(s) trouvé(s)
            </span>
          </div>
        )}
      </div>

      {/* Modal Nouveau Patient */}
      {showModal && (
        <Modal
          title="Enregistrer un nouveau patient"
          icon="🏨"
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          submitLabel={saving ? "⏳ Enregistrement..." : "✓ Enregistrer le patient"}
        >
          <div className="text-sm font-bold text-navy border-b border-gray-100 pb-2.5 mb-4">
            👤 Informations personnelles
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label="Nom *" value={form.nom} onChange={(v) => setForm({...form, nom: v})} placeholder="NGONO" />
            <FormField label="Prénom *" value={form.prenom} onChange={(v) => setForm({...form, prenom: v})} placeholder="Mireille" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <FormField label="Date de naissance *" value={form.date_naissance} onChange={(v) => setForm({...form, date_naissance: v})} type="date" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Sexe</label>
              <select value={form.genre} onChange={(e) => setForm({...form, genre: e.target.value})} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green">
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Groupe sanguin</label>
              <select value={form.groupe_sanguin} onChange={(e) => setForm({...form, groupe_sanguin: e.target.value})} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green">
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label="Téléphone *" value={form.telephone} onChange={(v) => setForm({...form, telephone: v})} placeholder="697 123 456" />
            <FormField label="Email" value={form.email} onChange={(v) => setForm({...form, email: v})} type="email" placeholder="patient@email.com" />
          </div>
          <div className="mb-4">
            <FormField label="Adresse" value={form.adresse} onChange={(v) => setForm({...form, adresse: v})} placeholder="Quartier, Ville" />
          </div>
          <div className="text-sm font-bold text-navy border-b border-gray-100 pb-2.5 mb-4">
            🩺 Informations médicales
          </div>
          <div className="mb-4">
            <label className="text-[11.5px] font-semibold text-navy block mb-1.5">Allergies connues</label>
            <textarea
              value={form.allergies}
              onChange={(e) => setForm({...form, allergies: e.target.value})}
              placeholder="Pénicilline, Aspirine…"
              className="w-full px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green min-h-[60px] resize-y"
            />
          </div>
          <div className="text-sm font-bold text-navy border-b border-gray-100 pb-2.5 mb-4">
            💳 Assurance
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Type d'assurance</label>
              <select value={form.assurance} onChange={(e) => setForm({...form, assurance: e.target.value})} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green">
                <option value="">Aucune</option>
                <option value="CNPS">CNPS</option>
                <option value="Mutuelle">Mutuelle</option>
                <option value="Privée">Privée</option>
              </select>
            </div>
            <FormField label="Numéro police" value={form.numero_assurance} onChange={(v) => setForm({...form, numero_assurance: v})} placeholder="N° 12345" />
          </div>
        </Modal>
      )}

      {/* Modal Confirmation Suppression */}
      {showConfirmDelete && patientASupprimer && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(10,25,47,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={() => setShowConfirmDelete(false)}
        >
          <div
            className="bg-white rounded-2xl w-[440px] max-w-[95vw] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🗑️
              </div>
              <h3 className="font-serif text-lg font-bold text-navy mb-2">
                Supprimer ce patient ?
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                Vous êtes sur le point de supprimer :
              </p>
              <p className="font-bold text-navy mb-4">
                {patientASupprimer.prenom} {patientASupprimer.nom}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-xs text-red-600">
                ⚠️ Cette action est irréversible. Toutes les données associées seront supprimées.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-navy"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSupprimer}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-red-500/30"
                >
                  🗑️ Oui, supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function FormField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11.5px] font-semibold text-navy">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
      />
    </div>
  );
}

export default Patients;