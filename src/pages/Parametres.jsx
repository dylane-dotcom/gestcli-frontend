import { useState } from 'react';
import Layout from '../components/Layout';

function Parametres() {
  const [form, setForm] = useState({
    nom_clinique: 'Clinique Sainte-Croix',
    adresse: 'Rue de la Santé, Akwa, Douala',
    telephone: '+237 233 445 566',
    email: 'contact@gestcli.cm',
    horaires: 'Lundi - Samedi : 08h00 - 18h00',
  });

  const [passwordForm, setPasswordForm] = useState({
    ancien: '', nouveau: '', confirmer: '',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Layout title="Paramètres">
      <div className="grid grid-cols-2 gap-5">

        {/* Infos clinique */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="px-6 pt-5 pb-3 border-b border-gray-100">
            <h3 className="font-serif text-base font-bold text-navy">
              🏥 Informations de la clinique
            </h3>
          </div>
          <div className="px-6 py-5 space-y-4">
            <FormField
              label="Nom de la clinique"
              value={form.nom_clinique}
              onChange={(v) => setForm({...form, nom_clinique: v})}
            />
            <FormField
              label="Adresse"
              value={form.adresse}
              onChange={(v) => setForm({...form, adresse: v})}
            />
            <FormField
              label="Téléphone"
              value={form.telephone}
              onChange={(v) => setForm({...form, telephone: v})}
            />
            <FormField
              label="Email"
              value={form.email}
              onChange={(v) => setForm({...form, email: v})}
              type="email"
            />
            <FormField
              label="Horaires d'ouverture"
              value={form.horaires}
              onChange={(v) => setForm({...form, horaires: v})}
            />
            {saved && (
              <div className="p-3 bg-green/10 border border-green/30 rounded-lg text-green text-sm font-semibold">
                ✅ Paramètres enregistrés avec succès !
              </div>
            )}
            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-green text-white rounded-lg text-sm font-semibold shadow-md shadow-green/30"
            >
              💾 Enregistrer les modifications
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {/* Changer mot de passe */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="px-6 pt-5 pb-3 border-b border-gray-100">
              <h3 className="font-serif text-base font-bold text-navy">
                🔐 Changer le mot de passe
              </h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <FormField
                label="Ancien mot de passe"
                value={passwordForm.ancien}
                onChange={(v) => setPasswordForm({...passwordForm, ancien: v})}
                type="password"
                placeholder="••••••••"
              />
              <FormField
                label="Nouveau mot de passe"
                value={passwordForm.nouveau}
                onChange={(v) => setPasswordForm({...passwordForm, nouveau: v})}
                type="password"
                placeholder="••••••••"
              />
              <FormField
                label="Confirmer le mot de passe"
                value={passwordForm.confirmer}
                onChange={(v) => setPasswordForm({...passwordForm, confirmer: v})}
                type="password"
                placeholder="••••••••"
              />
              <button className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-semibold">
                🔐 Mettre à jour le mot de passe
              </button>
            </div>
          </div>

          {/* Infos système */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="px-6 pt-5 pb-3 border-b border-gray-100">
              <h3 className="font-serif text-base font-bold text-navy">
                ⚙️ Informations système
              </h3>
            </div>
            <div className="px-6 py-5 space-y-2 text-sm">
              <InfoRow label="Version" value="GestCli v1.0" />
              <InfoRow label="Frontend" value="React + Vite + Tailwind CSS" />
              <InfoRow label="Backend" value="Django REST Framework" />
              <InfoRow label="Base de données" value="MySQL" />
              <InfoRow label="Authentification" value="JWT (SimpleJWT)" />
              <InfoRow label="Développeurs" value="BILIM M. & DJIAGAM D." />
              <InfoRow label="Année" value="2025-2026 · IUC Génie Logiciel" />
            </div>
          </div>
        </div>
      </div>
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

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-navy">{value}</span>
    </div>
  );
}

export default Parametres;