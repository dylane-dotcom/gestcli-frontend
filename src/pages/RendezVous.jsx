import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import Tag from '../components/Tag';
import { rendezvousAPI, patientsAPI, personnelAPI } from '../api/services';

function RendezVous() {
  const [rdvList, setRdvList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModifier, setShowModifier] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [rdvASupprimer, setRdvASupprimer] = useState(null);
  const [rdvSelectionne, setRdvSelectionne] = useState(null);
  const [formModifier, setFormModifier] = useState({});
  const [saving, setSaving] = useState(false);
  const [dateSelectionnee, setDateSelectionnee] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [form, setForm] = useState({
    patient: '', medecin: '', date_heure: '',
    type_rdv: 'consultation', statut: 'planifie',
    motif: '', salle: '', duree_minutes: 30,
  });

  useEffect(() => {
    chargerRdv();
    chargerPatients();
    chargerMedecins();
  }, []);

  const chargerRdv = async () => {
    setLoading(true);
    try {
      const res = await rendezvousAPI.liste({});
      setRdvList(res.data.results || res.data);
    } catch (err) {
      console.error('Erreur chargement RDV:', err);
    } finally {
      setLoading(false);
    }
  };

  const chargerPatients = async () => {
    try {
      const res = await patientsAPI.liste();
      setPatients(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const chargerMedecins = async () => {
    try {
      const res = await personnelAPI.liste({ role: 'medecin' });
      setMedecins(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (!form.patient || !form.medecin || !form.date_heure) {
        alert('Veuillez remplir Patient, Médecin et Date');
        setSaving(false);
        return;
      }
      const formData = {
        patient: parseInt(form.patient),
        medecin: parseInt(form.medecin),
        date_heure: form.date_heure.length === 16 ? form.date_heure + ':00' : form.date_heure,
        type_rdv: form.type_rdv,
        statut: form.statut,
        motif: form.motif,
        salle: form.salle,
        duree_minutes: form.duree_minutes,
        service: null,
      };
      await rendezvousAPI.creer(formData);
      setShowModal(false);
      setForm({
        patient: '', medecin: '', date_heure: '',
        type_rdv: 'consultation', statut: 'planifie',
        motif: '', salle: '', duree_minutes: 30,
      });
      chargerRdv();
    } catch (err) {
      console.error('Erreur:', err.response?.data);
      alert('Erreur: ' + JSON.stringify(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const handleModifierRdv = async () => {
    setSaving(true);
    try {
      await rendezvousAPI.modifier(rdvSelectionne.id, {
        ...formModifier,
        date_heure: formModifier.date_heure?.length === 16
          ? formModifier.date_heure + ':00'
          : formModifier.date_heure,
      });
      setShowModifier(false);
      chargerRdv();
    } catch (err) {
      console.error('Erreur:', err.response?.data);
      alert('Erreur: ' + JSON.stringify(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const handleSupprimer = async () => {
    if (!rdvASupprimer) return;
    try {
      await rendezvousAPI.supprimer(rdvASupprimer.id);
      setShowConfirmDelete(false);
      setRdvASupprimer(null);
      chargerRdv();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const ouvrirModifier = (rdv) => {
    setRdvSelectionne(rdv);
    setFormModifier({
      patient: rdv.patient,
      medecin: rdv.medecin,
      date_heure: rdv.date_heure?.slice(0, 16) || '',
      type_rdv: rdv.type_rdv,
      statut: rdv.statut,
      motif: rdv.motif || '',
      salle: rdv.salle || '',
      duree_minutes: rdv.duree_minutes || 30,
      service: null,
    });
    setShowModifier(true);
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

  const getTypeTag = (type) => {
    const map = {
      consultation: { type: 'cardio', label: 'Consultation' },
      suivi: { type: 'pedi', label: 'Suivi' },
      urgence: { type: 'ortho', label: 'Urgence' },
      chirurgie: { type: 'neuro', label: 'Chirurgie' },
    };
    return map[type] || { type: 'medgen', label: type };
  };

  const formatHeure = (dateHeure) => {
    if (!dateHeure) return '—';
    return new Date(dateHeure).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDate = (dateHeure) => {
    if (!dateHeure) return '—';
    return new Date(dateHeure).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short'
    });
  };

  return (
    <Layout title="Rendez-vous">

      {/* Barre supérieure */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-2xl border border-gray-200 px-5 py-3">
        <div>
          <h3 className="font-bold text-navy text-base">
            Planning — {new Date(dateSelectionnee + 'T00:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {rdvList.length} rendez-vous au total
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-green/30 hover:-translate-y-0.5 transition-transform"
        >
          ＋ Nouveau RDV
        </button>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-[210px_1fr] gap-4 items-start">

        {/* Colonne gauche */}
        <div className="space-y-3">

          {/* Calendrier inline */}
          <div className="bg-navy rounded-2xl p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="opacity-60 cursor-pointer text-sm">‹</span>
              <span className="font-serif font-bold text-sm">Juin 2026</span>
              <span className="opacity-60 cursor-pointer text-sm">›</span>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {['L','M','M','J','V','S','D'].map((d, i) => (
                <div key={i} className="text-[9px] text-center text-white/40 font-semibold">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((jour) => {
                const isToday = jour === new Date().getDate();
                return (
                  <div
                    key={jour}
                    className={`h-6 flex items-center justify-center text-[10px] rounded cursor-pointer
                      ${isToday
                        ? 'bg-green text-white font-bold'
                        : 'text-white/65 hover:bg-white/10'}`}
                  >
                    {jour}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Légende */}
          <div className="bg-white rounded-2xl border border-gray-200 p-3">
            <div className="text-xs font-bold text-navy mb-2">Légende</div>
            <div className="space-y-1.5">
              <LegendItem color="bg-green" label="Confirmé" />
              <LegendItem color="bg-gold" label="Planifié" />
              <LegendItem color="bg-blue-500" label="En cours" />
              <LegendItem color="bg-red-500" label="Annulé" />
            </div>
          </div>

          {/* Filtre date */}
          <div className="bg-white rounded-2xl border border-gray-200 p-3">
            <div className="text-xs font-bold text-navy mb-2">Filtrer par date</div>
            <input
              type="date"
              value={dateSelectionnee}
              onChange={(e) => setDateSelectionnee(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-green"
            />
          </div>
        </div>

        {/* Tableau des RDV */}
        <div className="bg-white rounded-2xl border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-2xl mb-2">⏳</div>
              Chargement des rendez-vous...
            </div>
          ) : rdvList.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-2xl mb-2">📅</div>
              Aucun rendez-vous
              <div className="mt-2 text-sm">
                Cliquez sur "＋ Nouveau RDV" pour en planifier un
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-[10px] uppercase tracking-wide bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Heure</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Médecin</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Salle</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rdvList.map((rdv) => {
                    const statut = getStatutBadge(rdv.statut);
                    const typeTag = getTypeTag(rdv.type_rdv);
                    return (
                      <tr key={rdv.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {formatDate(rdv.date_heure)}
                        </td>
                        <td className="px-4 py-3 font-bold text-navy">
                          {formatHeure(rdv.date_heure)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-navy">
                          {rdv.patient_nom}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {rdv.medecin_nom}
                        </td>
                        <td className="px-4 py-3">
                          <Tag type={typeTag.type}>{typeTag.label}</Tag>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {rdv.salle || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge type={statut.type}>{statut.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <ActionBtn onClick={() => ouvrirModifier(rdv)}>✏️</ActionBtn>
                            <ActionBtn onClick={async () => {
                              await rendezvousAPI.modifier(rdv.id, { ...rdv, statut: 'confirme', service: null });
                              chargerRdv();
                            }}>✓</ActionBtn>
                            <ActionBtn onClick={async () => {
                              await rendezvousAPI.modifier(rdv.id, { ...rdv, statut: 'annule', service: null });
                              chargerRdv();
                            }}>✕</ActionBtn>
                            <ActionBtn onClick={() => {
                              setRdvASupprimer(rdv);
                              setShowConfirmDelete(true);
                            }}>🗑️</ActionBtn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {rdvList.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {rdvList.length} rendez-vous au total
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Nouveau RDV ── */}
      {showModal && (
        <ModalRdv
          title="Planifier un rendez-vous"
          form={form}
          setForm={setForm}
          patients={patients}
          medecins={medecins}
          saving={saving}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          submitLabel={saving ? '⏳ Enregistrement...' : '✓ Confirmer le rendez-vous'}
        />
      )}

      {/* ── Modal Modifier RDV ── */}
      {showModifier && rdvSelectionne && (
        <ModalRdv
          title="Modifier le rendez-vous"
          form={formModifier}
          setForm={setFormModifier}
          patients={patients}
          medecins={medecins}
          saving={saving}
          onClose={() => setShowModifier(false)}
          onSubmit={handleModifierRdv}
          submitLabel={saving ? '⏳ Modification...' : '✓ Enregistrer les modifications'}
          showStatut={true}
        />
      )}

      {/* ── Modal Confirmation Suppression ── */}
      {showConfirmDelete && rdvASupprimer && (
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
                Supprimer ce rendez-vous ?
              </h3>
              <p className="text-sm text-gray-500 mb-1">Patient :</p>
              <p className="font-bold text-navy mb-1">{rdvASupprimer.patient_nom}</p>
              <p className="text-sm text-gray-500 mb-4">
                Médecin : {rdvASupprimer.medecin_nom}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-xs text-red-600">
                ⚠️ Cette action est irréversible.
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
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold"
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

function ModalRdv({ title, form, setForm, patients, medecins, saving, onClose, onSubmit, submitLabel, showStatut = false }) {
  return (
    <div
      style={{position:'fixed',inset:0,background:'rgba(10,25,47,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-[580px] max-w-[95vw] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h3 className="font-serif text-lg font-bold text-navy">📅 {title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Patient *</label>
              <select
                value={form.patient || ''}
                onChange={(e) => setForm({...form, patient: e.target.value})}
                className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Médecin *</label>
              <select
                value={form.medecin || ''}
                onChange={(e) => setForm({...form, medecin: e.target.value})}
                className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
              >
                <option value="">Sélectionner un médecin</option>
                {medecins.map(m => (
                  <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Date et heure *</label>
              <input
                type="datetime-local"
                value={form.date_heure || ''}
                onChange={(e) => setForm({...form, date_heure: e.target.value})}
                className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Durée (minutes)</label>
              <select
                value={form.duree_minutes || 30}
                onChange={(e) => setForm({...form, duree_minutes: parseInt(e.target.value)})}
                className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 heure</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Type</label>
              <select
                value={form.type_rdv || 'consultation'}
                onChange={(e) => setForm({...form, type_rdv: e.target.value})}
                className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
              >
                <option value="consultation">Consultation</option>
                <option value="suivi">Suivi</option>
                <option value="urgence">Urgence</option>
                <option value="chirurgie">Chirurgie</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Salle</label>
              <input
                type="text"
                value={form.salle || ''}
                onChange={(e) => setForm({...form, salle: e.target.value})}
                placeholder="Salle 1, Salle 2..."
                className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
              />
            </div>
          </div>
          {showStatut && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Statut</label>
              <select
                value={form.statut || 'planifie'}
                onChange={(e) => setForm({...form, statut: e.target.value})}
                className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
              >
                <option value="planifie">Planifié</option>
                <option value="confirme">Confirmé</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-semibold text-navy">Motif</label>
            <textarea
              value={form.motif || ''}
              onChange={(e) => setForm({...form, motif: e.target.value})}
              placeholder="Décrivez le motif du rendez-vous..."
              className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green min-h-[70px] resize-y"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-navy"
          >
            Annuler
          </button>
          <button
            onClick={onSubmit}
            disabled={saving}
            className="px-4 py-2 bg-green text-white rounded-lg text-sm font-semibold shadow-md shadow-green/30 disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}

function ActionBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-1.5 py-1 border border-gray-200 rounded-md text-[11px] bg-white hover:bg-gray-50"
    >
      {children}
    </button>
  );
}

export default RendezVous;