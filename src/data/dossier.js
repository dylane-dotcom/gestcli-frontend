export const PATIENT_DOSSIER = {
  nom: "Mireille Ngono",
  genre: "Femme",
  age: 34,
  groupeSanguin: "A+",
  id: "#P-001024",
  tel: "697 123 456",
  service: "cardio",
  serviceLabel: "Cardiologie",
  medecin: "Dr. Kamga",
  avatar: "from-indigo-400 to-purple-600",
  initials: "MN",
};

export const CONSTANTES = [
  { icon: "❤️", valeur: "78", unite: "bpm", label: "Fréquence cardiaque", statut: "normal", statutLabel: "Normal" },
  { icon: "🩺", valeur: "130/85", unite: "mmHg", label: "Tension artérielle", statut: "warning", statutLabel: "Élevée" },
  { icon: "🌡️", valeur: "37.2", unite: "°C", label: "Température", statut: "normal", statutLabel: "Normal" },
  { icon: "⚖️", valeur: "62", unite: "kg", label: "Poids", statut: "normal", statutLabel: "IMC 22.8" },
];

export const INFOS_MEDICALES = [
  { label: "Allergies", valeur: "Pénicilline, Aspirine", alerte: true },
  { label: "Antécédents", valeur: "HTA, Diabète T2" },
  { label: "Traitement actuel", valeur: "Amlodipine 5mg" },
  { label: "Groupe sanguin", valeur: "A+" },
  { label: "Assurance", valeur: "CNPS N° 12345" },
];

export const ORDONNANCES = [
  { medicament: "Amlodipine 5mg", posologie: "1 comprimé/jour · Matin · 30 jours", medecin: "Dr. Kamga · 01/06/2026", couleur: "border-green bg-green/5" },
  { medicament: "Metformine 500mg", posologie: "2 comprimés/jour · Repas · 60 jours", medecin: "Dr. Kamga · 01/06/2026", couleur: "border-blue-500 bg-blue-50/50" },
];

export const HISTORIQUE = [
  { date: "08 Juin 2026 · 10:30", icon: "🩺", couleur: "green", titre: "Consultation de suivi — Cardiologie",
    desc: "Tension artérielle élevée (130/85). Ajustement du traitement. Renouvellement ordonnance Amlodipine. Prochain contrôle dans 1 mois.",
    tag: "cardio", tagLabel: "Cardiologie" },
  { date: "15 Mai 2026 · 09:00", icon: "💉", couleur: "blue", titre: "Bilan sanguin complet",
    desc: "Glycémie à jeun: 6.2 mmol/L (légèrement élevée). HbA1c: 6.8%. Cholestérol total: 4.5 mmol/L. Résultats satisfaisants.",
    tag: "medgen", tagLabel: "Biologie" },
  { date: "02 Avril 2026 · 14:15", icon: "📋", couleur: "gold", titre: "Consultation initiale — HTA diagnostiquée",
    desc: "Première consultation. HTA diagnostiquée. Mise en place traitement Amlodipine 5mg. Conseils hygiéno-diététiques.",
    tag: "cardio", tagLabel: "Cardiologie" },
  { date: "10 Mars 2026 · 22:45", icon: "🚨", couleur: "red", titre: "Urgence — Douleurs thoraciques",
    desc: "Admission urgences. ECG normal. Douleurs liées au stress. Prescription anxiolytiques. Orientation cardiologie.",
    tag: "dermato", tagLabel: "Urgences" },
];