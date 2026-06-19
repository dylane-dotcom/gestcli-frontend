import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import KpiCardSmall from '../components/KpiCardSmall';
import { facturesAPI, patientsAPI } from '../api/services';

function Facturation() {
  const [factures, setFactures] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    patient: '', montant_total: '', part_assurance: 0,
    montant_patient: '', statut: 'en_attente', notes: '',
  });

  useEffect(() => {
    chargerFactures();
    chargerPatients();
  }, []);

  const chargerFactures = async () => {
    setLoading(true);
    try {
      const res = await facturesAPI.liste();
      setFactures(res.data.results || res.data);
    } catch (err) {
      console.error('Erreur chargement factures:', err);
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

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (!form.patient || !form.montant_total) {
        alert('Veuillez remplir Patient et Montant total');
        setSaving(false);
        return;
      }
      await facturesAPI.creer({
        ...form,
        patient: parseInt(form.patient),
        montant_total: parseFloat(form.montant_total),
        part_assurance: parseFloat(form.part_assurance) || 0,
        montant_patient: parseFloat(form.montant_patient) || parseFloat(form.montant_total),
      });
      setShowModal(false);
      setForm({ patient: '', montant_total: '', part_assurance: 0, montant_patient: '', statut: 'en_attente', notes: '' });
      chargerFactures();
    } catch (err) {
      console.error('Erreur:', err.response?.data);
      alert('Erreur: ' + JSON.stringify(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const handleAnnuler = async (facture) => {
    try {
      await facturesAPI.modifier(facture.id, { ...facture, statut: 'annulee' });
      chargerFactures();
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarquerPayee = async (facture) => {
    try {
      await facturesAPI.modifier(facture.id, { ...facture, statut: 'payee' });
      chargerFactures();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatutBadge = (statut) => {
    const map = {
      payee: { type: 'confirmed', label: 'Payée' },
      en_attente: { type: 'pending', label: 'En attente' },
      impayee: { type: 'urgent', label: 'Impayée' },
      annulee: { type: 'completed', label: 'Annulée' },
    };
    return map[statut] || { type: 'pending', label: statut };
  };

  const totalRecettes = factures.filter(f => f.statut === 'payee').reduce((sum, f) => sum + parseFloat(f.montant_patient || 0), 0);
  const impayees = factures.filter(f => f.statut === 'impayee' || f.statut === 'en_attente').length;

  const KPIS = [
    { icon: "💰", iconBg: "bg-amber-50", value: `${totalRecettes.toLocaleString()} FCFA`, label: "Recettes totales", sub: `${factures.filter(f => f.statut === 'payee').length} factures payées`, trend: "12%", trendUp: true, accent: "bg-gold" },
    { icon: "⏳", iconBg: "bg-red-50", value: impayees, label: "Factures impayées", sub: "En attente de paiement", accent: "bg-red-500" },
    { icon: "✅", iconBg: "bg-green/10", value: factures.filter(f => f.statut === 'payee').length, label: "Factures payées", sub: `Sur ${factures.length} total`, accent: "bg-green" },
  ];

  const factureSelectionnee = factures.find(f => f.id === selected);

  return (
    <Layout title="Facturation & Paiements">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {KPIS.map((k, i) => <KpiCardSmall key={i} {...k} />)}
      </div>

      <div className="grid grid-cols-[1fr_1.4fr] gap-4">

        {/* Liste factures */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <h3 className="font-bold text-navy text-sm">Factures récentes</h3>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              ＋ Nouvelle facture
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">⏳ Chargement...</div>
          ) : factures.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-2xl mb-2">🧾</div>
              Aucune facture
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-[10px] uppercase tracking-wide bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2">N° Facture</th>
                  <th className="px-4 py-2">Patient</th>
                  <th className="px-4 py-2">Montant</th>
                  <th className="px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {factures.map((f) => {
                  const statut = getStatutBadge(f.statut);
                  return (
                    <tr
                      key={f.id}
                      onClick={() => setSelected(f.id)}
                      className={`border-b border-gray-100 hover:bg-gray-50 last:border-0 cursor-pointer
                        ${selected === f.id ? 'bg-green/5 border-l-2 border-l-green' : ''}`}
                    >
                      <td className="px-4 py-3 font-bold text-navy">
                        #F-{String(f.id).padStart(4, '0')}
                      </td>
                      <td className="px-4 py-3 font-medium text-sm">{f.patient_nom}</td>
                      <td className={`px-4 py-3 font-bold text-sm
                        ${f.statut === 'payee' ? 'text-green' : f.statut === 'impayee' ? 'text-red-500' : 'text-amber-500'}`}>
                        {parseFloat(f.montant_patient).toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3">
                        <Badge type={statut.type}>{statut.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Aperçu facture */}
        {factureSelectionnee ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green rounded-xl flex items-center justify-center text-lg">🏥</div>
                <div>
                  <div className="font-serif text-base font-bold text-navy">GestCli</div>
                  <div className="text-[11px] text-gray-400">Clinique Sainte-Croix · Douala</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-navy">
                  Facture #F-{String(factureSelectionnee.id).padStart(4, '0')}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(factureSelectionnee.date_emission).toLocaleDateString('fr-FR')}
                </div>
                <div className="mt-1">
                  <Badge type={getStatutBadge(factureSelectionnee.statut).type}>
                    {getStatutBadge(factureSelectionnee.statut).label}
                  </Badge>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 mb-4" />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Émetteur</div>
                <div className="font-bold text-navy text-sm">Clinique Sainte-Croix</div>
                <div className="text-xs text-gray-500 mt-1">Rue de la Santé · Douala</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Patient</div>
                <div className="font-bold text-navy text-sm">{factureSelectionnee.patient_nom}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Dossier #P-{String(factureSelectionnee.patient).padStart(6, '0')}
                </div>
              </div>
            </div>

            {factureSelectionnee.lignes && factureSelectionnee.lignes.length > 0 ? (
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="bg-navy text-white text-[10px] uppercase">
                    <th className="px-3 py-2 text-left rounded-tl-lg">Prestation</th>
                    <th className="px-3 py-2 text-left">Qté</th>
                    <th className="px-3 py-2 text-left rounded-tr-lg">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {factureSelectionnee.lignes.map((l, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="px-3 py-2">{l.prestation}</td>
                      <td className="px-3 py-2">{l.quantite}</td>
                      <td className="px-3 py-2 font-semibold">{parseFloat(l.total).toLocaleString()} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center text-gray-400 text-sm">
                Aucune ligne de facturation détaillée
              </div>
            )}

            <div className="flex flex-col items-end gap-1.5 mb-5 text-sm">
              <div className="flex gap-8">
                <span className="text-gray-400">Montant total</span>
                <span className="font-semibold">{parseFloat(factureSelectionnee.montant_total).toLocaleString()} FCFA</span>
              </div>
              <div className="flex gap-8">
                <span className="text-gray-400">Part assurance</span>
                <span className="font-semibold text-green">-{parseFloat(factureSelectionnee.part_assurance).toLocaleString()} FCFA</span>
              </div>
              <div className="flex gap-8 font-bold text-green border-t-2 border-green pt-2 mt-1">
                <span>Total patient</span>
                <span>{parseFloat(factureSelectionnee.montant_patient).toLocaleString()} FCFA</span>
              </div>
            </div>

            {factureSelectionnee.notes && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-600">
                <span className="font-semibold">Notes : </span>
                {factureSelectionnee.notes}
              </div>
            )}

            <div className="flex justify-end gap-2 flex-wrap">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-navy">
                🖨️ Imprimer
              </button>
              {factureSelectionnee.statut !== 'payee' && factureSelectionnee.statut !== 'annulee' && (
                <button
                  onClick={() => handleMarquerPayee(factureSelectionnee)}
                  className="px-4 py-2 bg-green text-white rounded-lg text-sm font-semibold"
                >
                  💳 Marquer comme payée
                </button>
              )}
              {factureSelectionnee.statut !== 'annulee' && (
                <button
                  onClick={() => {
                    if (window.confirm('Annuler cette facture ?')) {
                      handleAnnuler(factureSelectionnee);
                    }
                  }}
                  className="px-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50"
                >
                  ✕ Annuler
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-gray-300 text-sm min-h-[200px]">
            ← Sélectionne une facture pour l'aperçu
          </div>
        )}
      </div>

      {/* Modal Nouvelle Facture */}
      {showModal && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(10,25,47,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-[580px] max-w-[95vw] max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-navy">🧾 Nouvelle facture</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold text-navy">Patient *</label>
                <select
                  value={form.patient}
                  onChange={(e) => setForm({...form, patient: e.target.value})}
                  className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Montant total (FCFA) *" value={form.montant_total} onChange={(v) => setForm({...form, montant_total: v})} type="number" placeholder="24000" />
                <FormField label="Part assurance (FCFA)" value={form.part_assurance} onChange={(v) => setForm({...form, part_assurance: v})} type="number" placeholder="0" />
              </div>
              <FormField label="Montant à payer par le patient (FCFA) *" value={form.montant_patient} onChange={(v) => setForm({...form, montant_patient: v})} type="number" placeholder="4840" />
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold text-navy">Statut</label>
                <select value={form.statut} onChange={(e) => setForm({...form, statut: e.target.value})} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green">
                  <option value="en_attente">En attente</option>
                  <option value="payee">Payée</option>
                  <option value="impayee">Impayée</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold text-navy">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="Notes sur la facture..."
                  className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green min-h-[60px] resize-y"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-navy">
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green text-white rounded-lg text-sm font-semibold shadow-md shadow-green/30"
              >
                {saving ? "⏳ Enregistrement..." : "✓ Créer la facture"}
              </button>
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

export default Facturation;