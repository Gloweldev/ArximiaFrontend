// src/components/ClubSelector.tsx
import React from 'react';
import { useClub } from '../context/ClubContext';

export const ClubSelector: React.FC = () => {
  const { activeClub, clubs, setActiveClub } = useClub();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveClub(e.target.value);
  };

  // Se muestra el selector solo si hay más de un club
  if (clubs.length <= 1) return null;

  return (
    <div className="mb-4">
      <label htmlFor="clubSelect" className="block text-gray-700 font-bold mb-2">
        Selecciona un club:
      </label>
      <select
        id="clubSelect"
        value={activeClub}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded"
      >
        {clubs.map((clubId: string) => (
          <option key={clubId} value={clubId}>
            {clubId}
          </option>
        ))}
      </select>
    </div>
  );
};

