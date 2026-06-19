import { useState, useEffect } from 'react';

function useApi(apiCall, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiCall()
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Erreur lors du chargement');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, deps);

  return { data, loading, error };
}

export default useApi;