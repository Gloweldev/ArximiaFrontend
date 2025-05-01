import { useState, useEffect } from 'react';
import api from '@/services/api';

interface User {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get<User>('/reports/user-info');
        setUser(data);
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError('Error al obtener información del usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
