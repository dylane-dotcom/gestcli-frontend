export const KPIS_FACTURATION = [
  { icon: "💰", iconBg: "bg-amber-50", value: "1,24M", label: "Recettes du mois (FCFA)", sub: "45 factures · 38 payées", trend: "12%", trendUp: true, accent: "bg-gold" },
  { icon: "⏳", iconBg: "bg-red-50", value: "7", label: "Factures impayées", sub: "Total: 215 000 FCFA en attente", accent: "bg-red-500" },
  { icon: "✅", iconBg: "bg-green/10", value: "38", label: "Factures payées", sub: "Ce mois · Taux: 84%", trend: "5%", trendUp: true, accent: "bg-green" },
];

export const FACTURES = [
  {
    num: "#F-0891", patient: "Mireille Ngono", initials: "MN", avatar: "from-indigo-400 to-purple-600",
    date: "08/06/2026", montant: "4 840 FCFA", statut: "confirmed", statutLabel: "Payée",
    detail: {
      patient: { nom: "Mireille Ngono", id: "#P-001024", tel: "697 123 456", assurance: "CNPS N° 12345" },
      lignes: [
        { prestation: "Consultation cardiologie", date: "08/06/2026", prix: "15 000 FCFA", total: "15 000 FCFA" },
        { prestation: "ECG", date: "08/06/2026", prix: "8 000 FCFA", total: "8 000 FCFA" },
        { prestation: "Amlodipine 5mg × 30", date: "08/06/2026", prix: "1 200 FCFA", total: "1 200 FCFA" },
      ],
      sousTotal: "24 200 FCFA", partCNPS: "-19 360 FCFA", totalPatient: "4 840 FCFA",
    }
  },
  {
    num: "#F-0892", patient: "M. Biyong", initials: "MB", avatar: "from-orange-400 to-red-400",
    date: "07/06/2026", montant: "45 000 FCFA", statut: "urgent", statutLabel: "Impayée",
    detail: {
      patient: { nom: "M. Biyong", id: "#P-001030", tel: "655 001 122", assurance: "Aucune" },
      lignes: [
        { prestation: "Hospitalisation (3 jours)", date: "07/06/2026", prix: "30 000 FCFA", total: "30 000 FCFA" },
        { prestation: "Consultation spécialisée", date: "07/06/2026", prix: "15 000 FCFA", total: "15 000 FCFA" },
      ],
      sousTotal: "45 000 FCFA", partCNPS: "0 FCFA", totalPatient: "45 000 FCFA",
    }
  },
  {
    num: "#F-0893", patient: "Jean Fouda", initials: "JF", avatar: "from-pink-400 to-red-400",
    date: "10/06/2026", montant: "32 000 FCFA", statut: "pending", statutLabel: "En attente",
    detail: {
      patient: { nom: "Jean Fouda", id: "#P-001025", tel: "655 789 012", assurance: "CNPS N° 67890" },
      lignes: [
        { prestation: "Chirurgie orthopédique", date: "10/06/2026", prix: "25 000 FCFA", total: "25 000 FCFA" },
        { prestation: "Médicaments post-op", date: "10/06/2026", prix: "7 000 FCFA", total: "7 000 FCFA" },
      ],
      sousTotal: "32 000 FCFA", partCNPS: "-25 600 FCFA", totalPatient: "6 400 FCFA",
    }
  },
  {
    num: "#F-0894", patient: "Paul Onana", initials: "PO", avatar: "from-emerald-400 to-teal-300",
    date: "05/06/2026", montant: "8 500 FCFA", statut: "confirmed", statutLabel: "Payée",
    detail: {
      patient: { nom: "Paul Onana", id: "#P-001027", tel: "677 001 234", assurance: "CNPS N° 11223" },
      lignes: [
        { prestation: "Consultation neurologie", date: "05/06/2026", prix: "18 000 FCFA", total: "18 000 FCFA" },
        { prestation: "IRM cérébrale", date: "05/06/2026", prix: "-9 500 FCFA", total: "-9 500 FCFA" },
      ],
      sousTotal: "8 500 FCFA", partCNPS: "0 FCFA", totalPatient: "8 500 FCFA",
    }
  },
  {
    num: "#F-0895", patient: "Sandra Nkomo", initials: "SN", avatar: "from-pink-300 to-pink-500",
    date: "04/06/2026", montant: "12 000 FCFA", statut: "confirmed", statutLabel: "Payée",
    detail: {
      patient: { nom: "Sandra Nkomo", id: "#P-001028", tel: "699 334 556", assurance: "Mutuelle N° 5544" },
      lignes: [
        { prestation: "Consultation dermatologie", date: "04/06/2026", prix: "12 000 FCFA", total: "12 000 FCFA" },
      ],
      sousTotal: "12 000 FCFA", partCNPS: "-9 600 FCFA", totalPatient: "2 400 FCFA",
    }
  },
];

export const FACTURE_DETAIL = {
  num: "#F-0891",
  date: "10 Juin 2026",
  statut: "confirmed",
  statutLabel: "Payée",
  patient: { nom: "Mireille Ngono", id: "#P-001024", tel: "697 123 456", assurance: "CNPS N° 12345" },
  lignes: [
    { prestation: "Consultation cardiologie", medecin: "Dr. Kamga", date: "08/06/2026", qte: 1, prix: "15 000 FCFA", total: "15 000 FCFA" },
    { prestation: "ECG", medecin: "Dr. Kamga", date: "08/06/2026", qte: 1, prix: "8 000 FCFA", total: "8 000 FCFA" },
    { prestation: "Amlodipine 5mg × 30", medecin: "Pharmacie", date: "08/06/2026", qte: 1, prix: "1 200 FCFA", total: "1 200 FCFA" },
  ],
  sousTotal: "24 200 FCFA",
  partCNPS: "-19 360 FCFA",
  totalPatient: "4 840 FCFA",
};