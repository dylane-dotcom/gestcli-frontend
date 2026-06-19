export const KPIS_PHARMACIE = [
  { icon: "💊", iconBg: "bg-green/10", value: "342", label: "Médicaments en stock", sub: "48 références · 3 alertes", trend: "2%", trendUp: true, accent: "bg-green" },
  { icon: "⚠️", iconBg: "bg-red-50", value: "3", label: "Ruptures de stock imminentes", sub: "Commande urgente recommandée", accent: "bg-red-500" },
  { icon: "🧾", iconBg: "bg-amber-50", value: "28", label: "Ordonnances aujourd'hui", sub: "24 délivrées · 4 en attente", accent: "bg-gold" },
];

export const MEDICAMENTS = [
  { nom: "Amoxicilline 500mg", desc: "Antibiotique · Boîte 20 gél.", cat: "medgen", catLabel: "Antibiotique", stock: 12, seuil: 20, pourcent: 30, niveau: "Critique", prix: "850 FCFA", statut: "urgent", statutLabel: "Stock critique", couleur: "bg-red-500" },
  { nom: "Paracétamol 1000mg", desc: "Antalgique · Boîte 16 comp.", cat: "pedi", catLabel: "Antalgique", stock: 245, seuil: 50, pourcent: 90, niveau: "Bon", prix: "320 FCFA", statut: "confirmed", statutLabel: "En stock", couleur: "bg-green" },
  { nom: "Amlodipine 5mg", desc: "Anti-hypertenseur · Boîte 30 comp.", cat: "cardio", catLabel: "Cardio", stock: 18, seuil: 20, pourcent: 45, niveau: "Faible", prix: "1 200 FCFA", statut: "pending", statutLabel: "Stock faible", couleur: "bg-gold" },
  { nom: "Metformine 500mg", desc: "Antidiabétique · Boîte 60 comp.", cat: "ortho", catLabel: "Diabète", stock: 88, seuil: 30, pourcent: 75, niveau: "Bon", prix: "650 FCFA", statut: "confirmed", statutLabel: "En stock", couleur: "bg-blue-500" },
  { nom: "Ibuprofène 400mg", desc: "Anti-inflammatoire · Boîte 24 comp.", cat: "pedi", catLabel: "AINS", stock: 7, seuil: 25, pourcent: 18, niveau: "Critique", prix: "480 FCFA", statut: "urgent", statutLabel: "Stock critique", couleur: "bg-red-500" },
];