import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Tag from '../components/Tag';
import Badge from '../components/Badge';
import { patientsAPI, ordonnancesAPI, medicamentsAPI } from '../api/services';
import api from '../api/axios';

const DOT_COLORS = {
  green: 'bg-green/15 border-green',
  blue: 'bg-blue-100 border-blue-500',
  gold: 'bg-amber-100 border-amber-500',
  red: 'bg-red-100 border-red-500',
};

function Dossier() {
  const { patientId } = useParams();
  const [patients, setPatients] = useState([]);
  const [medicaments, setMedicaments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [showConsult, setShowConsult] = useState(false);
  const [showModifier, setShowModifier] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formModifier, setFormModifier] = useState({});

  const [formConsult, setFormConsult] = useState({
    fc: '', ta: '', temp: '', poids: '',
    motif: '', symptomes: '', diagnostic: '',
    traitement: '', examens: '', prochain_rdv: '',
  });

  const [ordonnanceItems, setOrdonnanceItems] = useState([
    { medicament: '', posologie: '', duree: '', instructions: '' }
  ]);

  useEffect(() => {
    chargerPatients();
    medicamentsAPI.liste().then(res => {
      setMedicaments(res.data.results || res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (patientId && patients.length > 0) {
      const p = patients.find(p => p.id === parseInt(patientId));
      if (p) chargerDossier(p);
    }
  }, [patientId, patients]);

  const chargerPatients = async () => {
    setLoadingPatients(true);
    try {
      const res = await patientsAPI.liste();
      const data = res.data.results || res.data;
      setPatients(data);
      if (!patientId && data.length > 0) {
        chargerDossier(data[0]);
      }
    } catch (err) {
      console.error('Erreur chargement patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const chargerDossier = async (patient) => {
    setSelectedPatient(patient);
    setLoading(true);
    setDossier(null);
    setConsultations([]);
    try {
      const res = await api.get(`/patients/${patient.id}/dossier/`);
      setDossier(res.data.dossier);
      setConsultations(res.data.consultations || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setDossier(null);
        setConsultations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const ajouterMedicament = () => {
    setOrdonnanceItems([...ordonnanceItems, { medicament: '', posologie: '', duree: '', instructions: '' }]);
  };

  const supprimerMedicament = (index) => {
    setOrdonnanceItems(ordonnanceItems.filter((_, i) => i !== index));
  };

  const modifierMedicament = (index, field, value) => {
    const updated = [...ordonnanceItems];
    updated[index][field] = value;
    setOrdonnanceItems(updated);
  };

  const handleConsultation = async () => {
    if (!selectedPatient) return;
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!formConsult.motif) {
        alert('Le motif est obligatoire');
        setSaving(false);
        return;
      }

      const consultRes = await api.post('/consultations/', {
        patient: selectedPatient.id,
        medecin: user.id,
        motif: formConsult.motif,
        symptomes: formConsult.symptomes,
        diagnostic: formConsult.diagnostic,
        traitement: formConsult.traitement,
        examens_demandes: formConsult.examens,
        prochain_rdv: formConsult.prochain_rdv || null,
      });

      const itemsValides = ordonnanceItems.filter(item => item.medicament && item.posologie);
      for (const item of itemsValides) {
        await ordonnancesAPI.creer({
          consultation: consultRes.data.id,
          medicament: parseInt(item.medicament),
          posologie: item.posologie,
          duree: item.duree,
          instructions: item.instructions,
        });
      }

      setShowConsult(false);
      setFormConsult({
        fc: '', ta: '', temp: '', poids: '',
        motif: '', symptomes: '', diagnostic: '',
        traitement: '', examens: '', prochain_rdv: '',
      });
      setOrdonnanceItems([{ medicament: '', posologie: '', duree: '', instructions: '' }]);

      setTimeout(() => {
        chargerDossier(selectedPatient);
      }, 500);

    } catch (err) {
      console.error('Erreur:', err.response?.data);
      alert('Erreur: ' + JSON.stringify(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const handleModifierPatient = async () => {
    setSaving(true);
    try {
      await patientsAPI.modifier(selectedPatient.id, formModifier);
      setShowModifier(false);
      chargerPatients();
    } catch (err) {
      console.error('Erreur:', err.response?.data);
      alert('Erreur: ' + JSON.stringify(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const ouvrirModifier = () => {
    setFormModifier({
      nom: selectedPatient.nom,
      prenom: selectedPatient.prenom,
      date_naissance: selectedPatient.date_naissance,
      genre: selectedPatient.genre,
      telephone: selectedPatient.telephone,
      email: selectedPatient.email || '',
      adresse: selectedPatient.adresse || '',
      allergies: selectedPatient.allergies || '',
      antecedents: selectedPatient.antecedents || '',
      assurance: selectedPatient.assurance || '',
      numero_assurance: selectedPatient.numero_assurance || '',
      groupe_sanguin: selectedPatient.groupe_sanguin || 'A+',
    });
    setShowModifier(true);
  };

  const getServiceTag = (nom) => {
    const map = {
      'Cardiologie': 'cardio', 'Pédiatrie': 'pedi',
      'Orthopédie': 'ortho', 'Neurologie': 'neuro',
      'Dermatologie': 'dermato',
    };
    return map[nom] || 'medgen';
  };

  const getInitials = (prenom, nom) => {
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const COULEURS_CONSULT = ['green', 'blue', 'gold', 'red'];

  return (
    <Layout title={selectedPatient
      ? `Dossier — ${selectedPatient.prenom} ${selectedPatient.nom}`
      : 'Dossier Médical'
    }>

      {/* Sélecteur de patient */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-navy shrink-0">
            Sélectionner un patient :
          </span>
          <select
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green"
            onChange={(e) => {
              const p = patients.find(p => p.id === parseInt(e.target.value));
              if (p) chargerDossier(p);
            }}
            value={selectedPatient?.id || ''}
          >
            {loadingPatients ? (
              <option>Chargement...</option>
            ) : patients.length === 0 ? (
              <option>Aucun patient enregistré</option>
            ) : (
              patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.prenom} {p.nom} — #P-{String(p.id).padStart(6, '0')}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">⏳</div>
          Chargement du dossier...
        </div>
      ) : !selectedPatient ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">🩺</div>
          Sélectionnez un patient pour voir son dossier
        </div>
      ) : (
        <>
          {/* En-tête patient */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {getInitials(selectedPatient.prenom, selectedPatient.nom)}
            </div>
            <div>
              <div className="font-serif text-xl font-bold text-navy">
                {selectedPatient.prenom} {selectedPatient.nom}
              </div>
              <div className="text-sm text-gray-400 mt-0.5">
                {selectedPatient.genre === 'M' ? 'Homme' : 'Femme'} · {selectedPatient.age} ans · Groupe {selectedPatient.groupe_sanguin || '—'} · #P-{String(selectedPatient.id).padStart(6, '0')}
              </div>
              <div className="flex gap-2.5 mt-2 items-center flex-wrap">
                {selectedPatient.service_nom && (
                  <Tag type={getServiceTag(selectedPatient.service_nom)}>
                    {selectedPatient.service_nom}
                  </Tag>
                )}
                <Badge type="confirmed">Actif</Badge>
                <span className="text-xs text-gray-600">📞 {selectedPatient.telephone}</span>
                {selectedPatient.medecin_traitant_nom && (
                  <span className="text-xs text-gray-600">
                    Médecin: {selectedPatient.medecin_traitant_nom}
                  </span>
                )}
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={ouvrirModifier}
                className="px-4 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm font-semibold text-navy hover:bg-gray-50"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => setShowConsult(true)}
                className="px-4 py-2 bg-green text-white rounded-lg text-sm font-semibold shadow-md shadow-green/30"
              >
                ＋ Consultation
              </button>
            </div>
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-[1fr_1.2fr] gap-4">
            <div className="space-y-4">

              {/* Informations médicales */}
              <div className="bg-white rounded-2xl border border-gray-200">
                <div className="px-5 pt-4 pb-2">
                  <h3 className="font-bold text-navy text-sm">Informations médicales</h3>
                </div>
                <div className="p-5 space-y-2.5 text-sm">
                  <InfoRow
                    label="Allergies"
                    value={selectedPatient.allergies || '—'}
                    alert={!!selectedPatient.allergies}
                  />
                  <InfoRow label="Antécédents" value={selectedPatient.antecedents || '—'} />
                  <InfoRow label="Groupe sanguin" value={selectedPatient.groupe_sanguin || '—'} />
                  <InfoRow
                    label="Assurance"
                    value={selectedPatient.assurance
                      ? `${selectedPatient.assurance} N° ${selectedPatient.numero_assurance}`
                      : '—'}
                  />
                  <InfoRow label="Email" value={selectedPatient.email || '—'} />
                  <InfoRow label="Adresse" value={selectedPatient.adresse || '—'} />
                </div>
              </div>

              {/* Dossier médical */}
              <div className="bg-white rounded-2xl border border-gray-200">
                <div className="px-5 pt-4 pb-2">
                  <h3 className="font-bold text-navy text-sm">Dossier médical</h3>
                </div>
                <div className="p-5">
                  {dossier ? (
                    <div className="space-y-2 text-sm">
                      <InfoRow
                        label="N° Dossier"
                        value={`#D-${String(dossier.id).padStart(6, '0')}`}
                      />
                      <InfoRow label="Créé le" value={formatDate(dossier.date_creation)} />
                      {dossier.observations && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs font-semibold text-navy mb-1">Observations</div>
                          <div className="text-xs text-gray-600">{dossier.observations}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      <div className="text-2xl mb-2">📋</div>
                      Aucun dossier médical créé
                      <div className="mt-2 text-xs">
                        Ajoutez une consultation pour créer automatiquement le dossier
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Historique consultations */}
            <div className="bg-white rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <h3 className="font-bold text-navy text-sm">
                  Historique des consultations ({consultations.length})
                </h3>
                <span
                  onClick={() => setShowConsult(true)}
                  className="text-xs text-green font-semibold cursor-pointer"
                >
                  ＋ Nouvelle →
                </span>
              </div>
              <div className="p-5">
                {consultations.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <div className="text-3xl mb-2">📋</div>
                    Aucune consultation enregistrée
                    <div className="mt-2 text-xs">
                      Cliquez sur "＋ Consultation" pour ajouter la première
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
                    {consultations.map((c, i) => (
                      <div key={c.id} className="flex gap-4 pb-5 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 shrink-0 z-10 ${DOT_COLORS[COULEURS_CONSULT[i % 4]]}`}>
                          🩺
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-3">
                          <div className="text-[11px] text-gray-400 mb-1">
                            {formatDate(c.date)} · {c.medecin_nom}
                          </div>
                          <div className="text-sm font-bold text-navy mb-1">
                            {c.motif || 'Consultation'}
                          </div>
                          {c.diagnostic && (
                            <div className="text-[12px] text-gray-600 mb-1">
                              <span className="font-semibold">Diagnostic : </span>
                              {c.diagnostic}
                            </div>
                          )}
                          {c.traitement && (
                            <div className="text-[12px] text-gray-600 mb-1">
                              <span className="font-semibold">Traitement : </span>
                              {c.traitement}
                            </div>
                          )}
                          {c.symptomes && (
                            <div className="text-[12px] text-gray-600">
                              <span className="font-semibold">Symptômes : </span>
                              {c.symptomes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Modal Modifier Patient ── */}
      {showModifier && selectedPatient && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(10,25,47,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={() => setShowModifier(false)}
        >
          <div
            className="bg-white rounded-2xl w-[620px] max-w-[95vw] max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-navy">
                ✏️ Modifier — {selectedPatient.prenom} {selectedPatient.nom}
              </h3>
              <button
                onClick={() => setShowModifier(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="text-sm font-bold text-navy border-b border-gray-100 pb-2">
                👤 Informations personnelles
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Nom *" value={formModifier.nom || ''} onChange={(v) => setFormModifier({...formModifier, nom: v})} placeholder="NGONO" />
                <FormField label="Prénom *" value={formModifier.prenom || ''} onChange={(v) => setFormModifier({...formModifier, prenom: v})} placeholder="Mireille" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Date de naissance" value={formModifier.date_naissance || ''} onChange={(v) => setFormModifier({...formModifier, date_naissance: v})} type="date" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-semibold text-navy">Sexe</label>
                  <select
                    value={formModifier.genre || 'M'}
                    onChange={(e) => setFormModifier({...formModifier, genre: e.target.value})}
                    className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-semibold text-navy">Groupe sanguin</label>
                  <select
                    value={formModifier.groupe_sanguin || 'A+'}
                    onChange={(e) => setFormModifier({...formModifier, groupe_sanguin: e.target.value})}
                    className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
                  >
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Téléphone *" value={formModifier.telephone || ''} onChange={(v) => setFormModifier({...formModifier, telephone: v})} placeholder="697 123 456" />
                <FormField label="Email" value={formModifier.email || ''} onChange={(v) => setFormModifier({...formModifier, email: v})} type="email" placeholder="patient@email.com" />
              </div>
              <FormField label="Adresse" value={formModifier.adresse || ''} onChange={(v) => setFormModifier({...formModifier, adresse: v})} placeholder="Quartier, Ville" />

              <div className="text-sm font-bold text-navy border-b border-gray-100 pb-2">
                🩺 Informations médicales
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold text-navy">Allergies</label>
                <textarea
                  value={formModifier.allergies || ''}
                  onChange={(e) => setFormModifier({...formModifier, allergies: e.target.value})}
                  placeholder="Pénicilline, Aspirine…"
                  className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green min-h-[60px] resize-y"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold text-navy">Antécédents médicaux</label>
                <textarea
                  value={formModifier.antecedents || ''}
                  onChange={(e) => setFormModifier({...formModifier, antecedents: e.target.value})}
                  placeholder="HTA, Diabète…"
                  className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green min-h-[60px] resize-y"
                />
              </div>

              <div className="text-sm font-bold text-navy border-b border-gray-100 pb-2">
                💳 Assurance
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-semibold text-navy">Type d'assurance</label>
                  <select
                    value={formModifier.assurance || ''}
                    onChange={(e) => setFormModifier({...formModifier, assurance: e.target.value})}
                    className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
                  >
                    <option value="">Aucune</option>
                    <option value="CNPS">CNPS</option>
                    <option value="Mutuelle">Mutuelle</option>
                    <option value="Privée">Privée</option>
                  </select>
                </div>
                <FormField
                  label="Numéro police"
                  value={formModifier.numero_assurance || ''}
                  onChange={(v) => setFormModifier({...formModifier, numero_assurance: v})}
                  placeholder="N° 12345"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setShowModifier(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-navy"
              >
                Annuler
              </button>
              <button
                onClick={handleModifierPatient}
                className="px-4 py-2 bg-green text-white rounded-lg text-sm font-semibold shadow-md shadow-green/30"
              >
                {saving ? '⏳ Enregistrement...' : '✓ Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Nouvelle Consultation ── */}
      {showConsult && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(10,25,47,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={() => setShowConsult(false)}
        >
          <div
            className="bg-white rounded-2xl w-[680px] max-w-[95vw] max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-navy">
                🩺 Nouvelle consultation — {selectedPatient?.prenom} {selectedPatient?.nom}
              </h3>
              <button
                onClick={() => setShowConsult(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="text-sm font-bold text-navy border-b border-gray-100 pb-2">
                🌡️ Constantes vitales (optionnel)
              </div>
              <div className="grid grid-cols-4 gap-3">
                <FormField label="FC (bpm)" value={formConsult.fc} onChange={(v) => setFormConsult({...formConsult, fc: v})} placeholder="78" />
                <FormField label="TA (mmHg)" value={formConsult.ta} onChange={(v) => setFormConsult({...formConsult, ta: v})} placeholder="120/80" />
                <FormField label="Temp. (°C)" value={formConsult.temp} onChange={(v) => setFormConsult({...formConsult, temp: v})} placeholder="37.2" />
                <FormField label="Poids (kg)" value={formConsult.poids} onChange={(v) => setFormConsult({...formConsult, poids: v})} placeholder="65" />
              </div>

              <div className="text-sm font-bold text-navy border-b border-gray-100 pb-2">
                📋 Consultation
              </div>
              <FormField
                label="Motif *"
                value={formConsult.motif}
                onChange={(v) => setFormConsult({...formConsult, motif: v})}
                placeholder="Contrôle tension artérielle"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormTextarea label="Symptômes" value={formConsult.symptomes} onChange={(v) => setFormConsult({...formConsult, symptomes: v})} placeholder="Décrivez les symptômes..." />
                <FormTextarea label="Diagnostic" value={formConsult.diagnostic} onChange={(v) => setFormConsult({...formConsult, diagnostic: v})} placeholder="Diagnostic médical..." />
              </div>
              <FormTextarea label="Traitement prescrit" value={formConsult.traitement} onChange={(v) => setFormConsult({...formConsult, traitement: v})} placeholder="Médicaments, posologie..." />

              {/* Ordonnance */}
              <div className="text-sm font-bold text-navy border-b border-gray-100 pb-2 flex items-center justify-between">
                <span>💊 Ordonnance</span>
                <button
                  type="button"
                  onClick={ajouterMedicament}
                  className="text-xs text-green font-semibold"
                >
                  ＋ Ajouter un médicament
                </button>
              </div>
              {ordonnanceItems.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-3 space-y-2 relative">
                  {ordonnanceItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => supprimerMedicament(index)}
                      className="absolute top-2 right-2 text-red-500 text-xs"
                    >
                      ✕
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={item.medicament}
                      onChange={(e) => modifierMedicament(index, 'medicament', e.target.value)}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                    >
                      <option value="">Sélectionner un médicament</option>
                      {medicaments.map(m => (
                        <option key={m.id} value={m.id}>{m.nom}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Posologie (ex: 1 cp x3/jour)"
                      value={item.posologie}
                      onChange={(e) => modifierMedicament(index, 'posologie', e.target.value)}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Durée (ex: 7 jours)"
                      value={item.duree}
                      onChange={(e) => modifierMedicament(index, 'duree', e.target.value)}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={item.instructions}
                      onChange={(e) => modifierMedicament(index, 'instructions', e.target.value)}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Examens demandés" value={formConsult.examens} onChange={(v) => setFormConsult({...formConsult, examens: v})} placeholder="Bilan sanguin, ECG..." />
                <FormField label="Prochain RDV" value={formConsult.prochain_rdv} onChange={(v) => setFormConsult({...formConsult, prochain_rdv: v})} type="date" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setShowConsult(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-navy"
              >
                Annuler
              </button>
              <button
                onClick={handleConsultation}
                className="px-4 py-2 bg-green text-white rounded-lg text-sm font-semibold shadow-md shadow-green/30"
              >
                {saving ? '⏳ Enregistrement...' : '✓ Valider la consultation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function InfoRow({ label, value, alert = false }) {
  return (
    <div className="flex justify-between pb-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`font-semibold text-sm ${alert ? 'text-red-500' : 'text-navy'}`}>
        {value}
      </span>
    </div>
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

function FormTextarea({ label, value, onChange, placeholder = '' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11.5px] font-semibold text-navy">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green min-h-[70px] resize-y"
      />
    </div>
  );
}

export default Dossier;