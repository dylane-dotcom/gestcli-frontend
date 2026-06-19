import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Ajoute le token access à chaque requête ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Renouvelle automatiquement le token si expiré ──
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà en train de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Si déjà en train de rafraîchir, met la requête en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      // Si pas de refresh token → déconnexion
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        // Demande un nouveau access token
        const response = await axios.post(
          'http://127.0.0.1:8000/api/auth/token/refresh/',
          { refresh: refreshToken }
        );

        const newAccessToken = response.data.access;

        // Sauvegarde le nouveau token
        localStorage.setItem('access_token', newAccessToken);

        // Met à jour le header par défaut
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // Traite les requêtes en attente
        processQueue(null, newAccessToken);

        // Relance la requête originale
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Si le refresh token est aussi expiré → déconnexion propre
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;