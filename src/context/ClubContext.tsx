import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/services/api';

interface TokenPayload {
  userId: string;
  role: string;
  clubPrincipal: string;
}

interface Club {
  id: string;
  name: string;
}

interface ClubContextType {
  activeClub: string;
  clubs: string[];
  clubNames: Record<string, string>;
  setActiveClub: (clubId: string) => void;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeClub, setActiveClubState] = useState<string>('');
  const [clubs, setClubsState] = useState<string[]>([]);
  const [clubNames, setClubNames] = useState<Record<string, string>>({});

  // Función para setear el club activo y persistirlo en localStorage
  const setActiveClub = (clubId: string) => {
    setActiveClubState(clubId);
    localStorage.setItem('activeClub', clubId);
  };
  
  const fetchUserClubs = async () => {
    try {
      // Nota: se usa GET y no se envía ningún parámetro, ya que el backend usará el id del usuario del token
      const res = await api.get<Club[]>('/users/clubs');
      const clubList = res.data;
      const clubIds = clubList.map((club) => club.id);
      setClubsState(clubIds);
      const names = clubList.reduce((acc: Record<string, string>, club: Club) => {
        acc[club.id] = club.name;
        return acc;
      }, {});
      setClubNames(names);
    } catch (error) {
      console.error('Error al obtener los clubes del usuario:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const clubPrincipal = decoded.clubPrincipal;
        const savedActiveClub = localStorage.getItem('activeClub');
        
        // Establecer el club activo
        setActiveClubState(savedActiveClub || clubPrincipal);
        
        // Obtener la lista de clubes
        fetchUserClubs();
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
  }, [localStorage.getItem('token')]); // Se ejecuta cuando cambia el token

  return (
    <ClubContext.Provider value={{ activeClub, clubs, clubNames, setActiveClub }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};
