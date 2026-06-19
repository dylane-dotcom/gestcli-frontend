import api from './axios';

// ── AUTH ──
export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
};

// ── DASHBOARD ──
export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats/'),
};

// ── PATIENTS ──
export const patientsAPI = {
  liste: (params) => api.get('/patients/', { params }),
  detail: (id) => api.get(`/patients/${id}/`),
  creer: (data) => api.post('/patients/', data),
  modifier: (id, data) => api.put(`/patients/${id}/`, data),
  supprimer: (id) => api.delete(`/patients/${id}/`),
  dossier: (id) => api.get(`/patients/${id}/dossier/`),
};

// ── RENDEZ-VOUS ──
export const rendezvousAPI = {
  liste: (params) => api.get('/rendezvous/', { params }),
  creer: (data) => api.post('/rendezvous/', data),
  modifier: (id, data) => api.put(`/rendezvous/${id}/`, data),
  supprimer: (id) => api.delete(`/rendezvous/${id}/`),
};

// ── MÉDICAMENTS ──
export const medicamentsAPI = {
  liste: (params) => api.get('/medicaments/', { params }),
  creer: (data) => api.post('/medicaments/', data),
  modifier: (id, data) => api.put(`/medicaments/${id}/`, data),
  supprimer: (id) => api.delete(`/medicaments/${id}/`),
};

// ── FACTURES ──
export const facturesAPI = {
  liste: (params) => api.get('/factures/', { params }),
  detail: (id) => api.get(`/factures/${id}/`),
  creer: (data) => api.post('/factures/', data),
  modifier: (id, data) => api.put(`/factures/${id}/`, data),
};

// ── PERSONNEL ──
export const personnelAPI = {
  liste: (params) => api.get('/personnel/', { params }),
};

// ── SERVICES ──
export const servicesAPI = {
  liste: () => api.get('/services/'),
  creer: (data) => api.post('/services/', data),
  modifier: (id, data) => api.put(`/services/${id}/`, data),
  supprimer: (id) => api.delete(`/services/${id}/`),
};

// __ORDONNANCE__
export const ordonnancesAPI = {
  liste: (params) => api.get('/ordonnances/', { params }),
  creer: (data) => api.post('/ordonnances/', data),
  delivrer: (id) => api.post(`/ordonnances/${id}/delivrer/`),
};