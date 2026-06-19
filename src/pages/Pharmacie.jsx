import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import Tag from '../components/Tag';
import Modal from '../components/Modal';
import KpiCardSmall from '../components/KpiCardSmall';
import { medicamentsAPI, ordonnancesAPI } from '../api/services';

function Pharmacie() {
  const [medicaments, setMedicaments] = useState([]);
  const [ordonnancesEnAttente, setOrdonnancesEnAttente] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModifierStock, setShowModifierStock] = useState(false);
  const [medicamentSelectionne, setMedicamentSelectionne] = useState(null);
  const [nouveauStock, setNouveauStock] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [medicamentASupprimer, setMedicamentASupprimer] = useState(null);

  const [form, setForm] = useState({
    nom: '', description: '', categorie: 'autre',
    prix_unitaire: '', stock_actuel: 0, seuil_alerte: 20,
  });

  useEffect(() => {
    chargerMedicaments();
    chargerOrdonnances();
  }, []);

  const chargerMedicaments = async () => {
    setLoading(true);
    try {
      const res = await medicamentsAPI.liste();
      setMedicaments(res.data.results || res.data);
    } catch (err) {
      console.error('Erreur chargement médicaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const chargerOrdonnances = async () => {
    try {
      const res = await ordonnancesAPI.liste({ statut: 'en_attente' });
      const data = res.data.results || res.data;
      setOrdonnancesEnAttente(data.length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await medicamentsAPI.creer(form);
      setShowModal(false);
      setForm({ nom: '', description: '', categorie: 'autre', prix_unitaire: '', stock_actuel: 0, seuil_alerte: 20 });
      chargerMedicaments();
    } catch (err) {
      console.error('Erreur:', err.response?.data);
      alert('Erreur: ' + JSON.stringify(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const handleModifierStock = async () => {
    if (!medicamentSelectionne || nouveauStock === '') return;
    setSaving(true);
    try {
      await medicamentsAPI.modifier(medicamentSelectionne.id, {
        ...medicamentSelectionne,
        stock_actuel: parseInt(nouveauStock),
      });
      setShowModifierStock(false);
      setMedicamentSelectionne(null);
      setNouveauStock('');
      chargerMedicaments();
    } catch (err) {
      console.error('Erreur:', err.response?.data);
      alert('Erreur: ' + JSON.stringify(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const handleSupprimer = async () => {
    if (!medicamentASupprimer) return;
    try {
      await medicamentsAPI.supprimer(medicamentASupprimer.id);
      setShowConfirmDelete(false);
      setMedicamentASupprimer(null);
      chargerMedicaments();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const filtered = medicaments.filter(m =>
    m.nom.toLowerCase().includes(search.toLowerCase())
  );

  const critiques = medicaments.filter(m => m.est_critique).length;

  const KPIS = [
    { icon: "💊", iconBg: "bg-green/10", value: medicaments.length, label: "Médicaments en stock", sub: `${medicaments.length} références · ${critiques} alertes`, accent: "bg-green" },
    { icon: "⚠️", iconBg: "bg-red-50", value: critiques, label: "Ruptures imminentes", sub: "Commande urgente recommandée", accent: "bg-red-500" },
    { icon: "🧾", iconBg: "bg-amber-50", value: ordonnancesEnAttente, label: "Ordonnances en attente", sub: "À délivrer aux patients", accent: "bg-gold" },
  ];

  const getCategorieTag = (cat) => {
    const map = { antibiotique: 'medgen', antalgique: 'pedi', anti_inflammatoire: 'pedi', antidiabetique: 'ortho', antihypertenseur: 'cardio', autre: 'medgen' };
    return map[cat] || 'medgen';
  };

  const getNiveauStock = (m) => {
    const pct = Math.round((m.stock_actuel / (m.seuil_alerte * 2)) * 100);
    if (m.stock_actuel <= m.seuil_alerte * 0.3) return { pct: Math.min(pct, 100), color: 'bg-red-500', label: 'Critique' };
    if (m.stock_actuel <= m.seuil_alerte) return { pct: Math.min(pct, 100), color: 'bg-gold', label: 'Faible' };
    return { pct: Math.min(pct, 100), color: 'bg-green', label: 'Bon' };
  };

  const ouvrirModifierStock = (m) => {
    setMedicamentSelectionne(m);
    setNouveauStock(String(m.stock_actuel));
    setShowModifierStock(true);
  };

  return (
    <Layout title="Pharmacie & Stock">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {KPIS.map((k, i) => <KpiCardSmall key={i} {...k} />)}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 gap-3">
          <h3 className="font-bold text-navy text-sm">Gestion du stock</h3>
          <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 w-52">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none w-full"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-green/30"
          >
            ＋ Ajouter médicament
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-2xl mb-2">⏳</div>
            Chargement des médicaments...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-2xl mb-2">💊</div>
            Aucun médicament trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-[10px] uppercase tracking-wide bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2">Médicament</th>
                  <th className="px-4 py-2">Catégorie</th>
                  <th className="px-4 py-2">Stock actuel</th>
                  <th className="px-4 py-2">Seuil alerte</th>
                  <th className="px-4 py-2">Niveau</th>
                  <th className="px-4 py-2">Prix unit.</th>
                  <th className="px-4 py-2">Statut</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const niveau = getNiveauStock(m);
                  return (
                    <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-navy">{m.nom}</div>
                        <div className="text-[11px] text-gray-400">{m.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Tag type={getCategorieTag(m.categorie)}>
                          {m.categorie.replace('_', ' ')}
                        </Tag>
                      </td>
                      <td className={`px-4 py-3 font-bold ${m.est_critique ? 'text-red-500' : 'text-navy'}`}>
                        {m.stock_actuel} unités
                      </td>
                      <td className="px-4 py-3 text-gray-400">{m.seuil_alerte} unités</td>
                      <td className="px-4 py-3 w-32">
                        <div className="bg-gray-100 rounded-full h-1.5">
                          <div className={`h-full rounded-full ${niveau.color}`} style={{ width: `${niveau.pct}%` }} />
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">{niveau.pct}% — {niveau.label}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-green">
                        {parseFloat(m.prix_unitaire).toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3">
                        <Badge type={m.est_critique ? 'urgent' : 'confirmed'}>
                          {m.est_critique ? 'Critique' : 'En stock'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => ouvrirModifierStock(m)}
                            className="px-2.5 py-1 border border-blue-200 rounded-md text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100"
                          >
                            📦 Stock
                          </button>
                          <button
                            onClick={() => {
                              setMedicamentASupprimer(m);
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
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {filtered.length} médicament(s) · {critiques} alerte(s)
            </span>
          </div>
        )}
      </div>

      {/* Modal Ajouter Médicament */}
      {showModal && (
        <Modal
          title="Ajouter un médicament"
          icon="💊"
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          submitLabel={saving ? "⏳ Enregistrement..." : "✓ Ajouter au stock"}
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label="Nom du médicament *" value={form.nom} onChange={(v) => setForm({...form, nom: v})} placeholder="Amoxicilline 500mg" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Catégorie</label>
              <select value={form.categorie} onChange={(e) => setForm({...form, categorie: e.target.value})} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green">
                <option value="antibiotique">Antibiotique</option>
                <option value="antalgique">Antalgique</option>
                <option value="anti_inflammatoire">Anti-inflammatoire</option>
                <option value="antidiabetique">Antidiabétique</option>
                <option value="antihypertenseur">Antihypertenseur</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <FormField label="Description" value={form.description} onChange={(v) => setForm({...form, description: v})} placeholder="Antibiotique · Boîte 20 gél." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Prix unitaire (FCFA) *" value={form.prix_unitaire} onChange={(v) => setForm({...form, prix_unitaire: v})} type="number" placeholder="850" />
            <FormField label="Stock actuel" value={form.stock_actuel} onChange={(v) => setForm({...form, stock_actuel: parseInt(v)})} type="number" placeholder="0" />
            <FormField label="Seuil d'alerte" value={form.seuil_alerte} onChange={(v) => setForm({...form, seuil_alerte: parseInt(v)})} type="number" placeholder="20" />
          </div>
        </Modal>
      )}

      {/* Modal Modifier Stock rapide */}
      {showModifierStock && medicamentSelectionne && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(10,25,47,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={() => setShowModifierStock(false)}
        >
          <div
            className="bg-white rounded-2xl w-[420px] max-w-[95vw] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-navy">📦 Modifier le stock</h3>
              <button onClick={() => setShowModifierStock(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">✕</button>
            </div>
            <div className="px-6 py-5">
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="font-semibold text-navy text-sm">{medicamentSelectionne.nom}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Stock actuel : {medicamentSelectionne.stock_actuel} unités · Seuil : {medicamentSelectionne.seuil_alerte} unités
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-semibold text-navy">Nouveau stock</label>
                <input
                  type="number"
                  value={nouveauStock}
                  onChange={(e) => setNouveauStock(e.target.value)}
                  className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green"
                  autoFocus
                />
              </div>
              {nouveauStock !== '' && parseInt(nouveauStock) <= medicamentSelectionne.seuil_alerte && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                  ⚠️ Ce stock sera en dessous du seuil d'alerte.
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <QuickStockBtn label="-10" onClick={() => setNouveauStock(String(Math.max(0, parseInt(nouveauStock || 0) - 10)))} />
                <QuickStockBtn label="-5" onClick={() => setNouveauStock(String(Math.max(0, parseInt(nouveauStock || 0) - 5)))} />
                <QuickStockBtn label="+5" onClick={() => setNouveauStock(String(parseInt(nouveauStock || 0) + 5))} />
                <QuickStockBtn label="+10" onClick={() => setNouveauStock(String(parseInt(nouveauStock || 0) + 10))} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setShowModifierStock(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-navy"
              >
                Annuler
              </button>
              <button
                onClick={handleModifierStock}
                className="px-4 py-2 bg-green text-white rounded-lg text-sm font-semibold shadow-md shadow-green/30"
              >
                {saving ? "⏳ Enregistrement..." : "✓ Mettre à jour le stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {showConfirmDelete && medicamentASupprimer && (
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
                Supprimer ce médicament ?
              </h3>
              <p className="font-bold text-navy mb-4">{medicamentASupprimer.nom}</p>
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

function QuickStockBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-navy hover:bg-gray-50"
    >
      {label}
    </button>
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

export default Pharmacie;