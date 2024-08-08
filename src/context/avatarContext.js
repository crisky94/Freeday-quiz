// AvatarContext.js
'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

const apikey = process.env.REACT_APP_API_KEY; // Asegúrate de usar el prefijo REACT_APP_ para las variables de entorno en create-react-app

const AvatarContext = createContext();

export const AvatarProvider = ({ children }) => {
  const [avatarCache, setAvatarCache] = useState({});

  const fetchAvatar = useCallback(
    async (nickname) => {
      if (avatarCache[nickname]) {
        return avatarCache[nickname];
      }
      try {
        const response = await fetch(
          `https://api.multiavatar.com/${nickname}.svg?apikey=${apikey}`
        );
        const svg = await response.text();
        const adjustedSvg = svg.replace(
          '<svg ',
          '<svg width="50" height="50" '
        );
        setAvatarCache((prevCache) => ({
          ...prevCache,
          [nickname]: adjustedSvg,
        }));
        return adjustedSvg;
      } catch (error) {
        console.error('Error fetching avatar:', error);
        return null;
      }
    },
    [avatarCache]
  );

  return (
    <AvatarContext.Provider value={{ fetchAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => useContext(AvatarContext);
