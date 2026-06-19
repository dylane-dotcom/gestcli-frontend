import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { servicesAPI, patientsAPI } from '../api/services';

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalAjouter, setShowModalAjouter] = useState(false);
  const [showModalModifier, setShowModalModifier] = useState(false);
  const [showModalPatients, setShowModalPatients] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [patientsService, setPatientsService] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nom: '', description: '', tarif_consultation: '', salle: '', actif: true,
  });

  const [formModifier, setFormModifier] = useState({
    nom: '', description: '', tarif_consultation: '', salle: '', actif: true,
  });

  useEffect(() => {
    chargerServices();
  }, []);

  const chargerServices = async () => {
    setLoading(true);
    try {
      const res = await servicesAPI.liste();
      setServices(res.data.results || res.data);
    } catch (err) {
      console.error('Erreur chargement services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAjouter = async () => {
    setSaving(true);
    try {
      if (!form.nom || !form.tarif_consultation) {
        alert('Veuillez remplir le nom et le tarif');
        setSaving(false);
        return;
      }
      await servicesAPI.creer({
        ...form,
        tarif_consultation: parseFloat(form.tarif_consultation),
      });
      setShowModalAjouter(false);
      setForm({ nom: '', description: '', tarif_consultation: '', salle: '', actif: true });
      chargerServices();
    } catch (err) {
      console.error('Erreur:', err.response?.data);
      alert('Erreur: ' + JSON.stringify(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const handleModifier = async () => {
    setSaving(true);
    try {
      await servicesAPI.modifier(selectedService.id, {
        ...formModifier,
        tarif_consultation: parseFloat(formModifier.tarif_consultation),
      });
      setShowModalModifier(false);
      chargerServices();
    } catch (err) {
      console.error('Erreur:', err.response?.data);
      alert('Erreur: ' + JSON.stringify(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const ouvrirModifier = (service) => {
    setSelectedService(service);
    setFormModifier({
      nom: service.nom,
      description: service.description || '',
      tarif_consultation: service.tarif_consultation,
      salle: service.salle || '',
      actif: service.actif,
    });
    setShowModalModifier(true);
  };

  const ouvrirPatients = async (service) => {
    setSelectedService(service);
    setShowModalPatients(true);
    try {
      const res = await patientsAPI.liste({ service: service.nom });
      setPatientsService(res.data.results || res.data);
    } catch (err) {
      console.error('Erreur:', err);
      setPatientsService([]);
    }
  };

  const COULEURS = [
    'border-t-blue-500', 'border-t-green', 'border-t-gold',
    'border-t-purple-600', 'border-t-red-500', 'border-t-cyan-500',
    'border-t-pink-500', 'border-t-orange-500',
  ];

  const ICONES = ['❤️', '👶', '🦴', '🧠', '🚨', '🔬', '💊', '🏥'];

  return (
    <Layout title="Services Médicaux">

      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-gray-500">
          {services.length} service(s) actif(s)
        </p>
        <button
          onClick={() => setShowModalAjouter(true)}
          className="bg-green text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-green/30 hover:-translate-y-0.5 transition-transform"
        >
          ＋ Nouveau service
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">⏳</div>
          Chargement des services...
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">🏢</div>
          Aucun service médical
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {services.map((s, i) => (
            <ServiceCard
              key={s.id}
              service={s}
              icon={ICONES[i % ICONES.length]}
              border={COULEURS[i % COULEURS.length]}
              onModifier={() => ouvrirModifier(s)}
              onVoirPatients={() => ouvrirPatients(s)}
            />
          ))}
        </div>
      )}

      {/* ── Modal Ajouter Service ── */}
      {showModalAjouter && (
        <ModalOverlay onClose={() => setShowModalAjouter(false)}>
          <ModalHeader
            title="Nouveau service médical"
            icon="🏢"
            onClose={() => setShowModalAjouter(false)}
          />
          <div className="px-6 py-5 space-y-4">
            <FormField
              label="Nom du service *"
              value={form.nom}
              onChange={(v) => setForm({...form, nom: v})}
              placeholder="Cardiologie"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Description du service..."
                className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green min-h-[80px] resize-y"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Tarif consultation (FCFA) *"
                value={form.tarif_consultation}
                onChange={(v) => setForm({...form, tarif_consultation: v})}
                type="number"
                placeholder="15000"
              />
              <FormField
                label="Salle"
                value={form.salle}
                onChange={(v) => setForm({...form, salle: v})}
                placeholder="Salle 2"
              />
            </div>
          </div>
          <ModalFooter
            onClose={() => setShowModalAjouter(false)}
            onSubmit={handleAjouter}
            submitLabel={saving ? "⏳ Enregistrement..." : "✓ Créer le service"}
          />
        </ModalOverlay>
      )}

      {/* ── Modal Modifier Service ── */}
      {showModalModifier && selectedService && (
        <ModalOverlay onClose={() => setShowModalModifier(false)}>
          <ModalHeader
            title={`Modifier — ${selectedService.nom}`}
            icon="✏️"
            onClose={() => setShowModalModifier(false)}
          />
          <div className="px-6 py-5 space-y-4">
            <FormField
              label="Nom du service *"
              value={formModifier.nom}
              onChange={(v) => setFormModifier({...formModifier, nom: v})}
              placeholder="Cardiologie"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-navy">Description</label>
              <textarea
                value={formModifier.description}
                onChange={(e) => setFormModifier({...formModifier, description: e.target.value})}
                className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm outline-none focus:border-green min-h-[80px] resize-y"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Tarif consultation (FCFA)"
                value={formModifier.tarif_consultation}
                onChange={(v) => setFormModifier({...formModifier, tarif_consultation: v})}
                type="number"
              />
              <FormField
                label="Salle"
                value={formModifier.salle}
                onChange={(v) => setFormModifier({...formModifier, salle: v})}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="actif"
                checked={formModifier.actif}
                onChange={(e) => setFormModifier({...formModifier, actif: e.target.checked})}
                className="w-4 h-4"
              />
              <label htmlFor="actif" className="text-sm font-semibold text-navy">
                Service actif
              </label>
            </div>
          </div>
          <ModalFooter
            onClose={() => setShowModalModifier(false)}
            onSubmit={handleModifier}
            submitLabel={saving ? "⏳ Modification..." : "✓ Enregistrer les modifications"}
          />
        </ModalOverlay>
      )}

      {/* ── Modal Voir Patients ── */}
      {showModalPatients && selectedService && (
        <ModalOverlay onClose={() => setShowModalPatients(false)}>
          <ModalHeader
            title={`Patients — ${selectedService.nom}`}
            icon="🏨"
            onClose={() => setShowModalPatients(false)}
          />
          <div className="px-6 py-5">
            {patientsService.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">🏨</div>
                Aucun patient dans ce service
              </div>
            ) : (
              <div className="space-y-2">
                {patientsService.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {p.prenom?.[0]}{p.nom?.[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-navy text-sm">
                        {p.prenom} {p.nom}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {p.genre === 'M' ? 'Homme' : 'Femme'} · {p.age} ans · {p.telephone}
                      </div>
                    </div>
                    <div className="ml-auto text-[11px] font-semibold text-navy">
                      #P-{String(p.id).padStart(6, '0')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ModalFooter
            onClose={() => setShowModalPatients(false)}
            showSubmit={false}
          />
        </ModalOverlay>
      )}
    </Layout>
  );
}

function ServiceCard({ service, icon, border, onModifier, onVoirPatients }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 border-t-4 ${border} p-5 hover:-translate-y-1 hover:shadow-lg transition-all`}>
      <div className="text-3xl mb-3">{icon}</div>
      <div className="font-bold text-navy text-base mb-1">{service.nom}</div>
      <div className="text-xs text-gray-400 leading-relaxed mb-4">
        {service.description || 'Aucune description'}
      </div>
      {service.salle && (
        <div className="text-xs text-gray-400 mb-2">📍 {service.salle}</div>
      )}
      <div className="text-xs font-bold text-green mb-4">
        Consultation : {parseFloat(service.tarif_consultation).toLocaleString()} FCFA
      </div>
      <div className="flex gap-2">
        <button
          onClick={onModifier}
          className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-navy hover:bg-gray-50"
        >
          ✏️ Modifier
        </button>
        <button
          onClick={onVoirPatients}
          className="flex-1 py-1.5 bg-green/10 border border-green rounded-lg text-xs font-semibold text-green hover:bg-green/20"
        >
          👥 Voir patients
        </button>
      </div>
    </div>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,25,47,0.7)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-[540px] max-w-[95vw] max-h-[90vh] overflow-y-auto shadow-2xl"
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
      <h3 className="font-serif text-lg font-bold text-navy">{icon} {title}</h3>
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

export default Services;