'use client';
import { useState } from 'react';

const apikey = process.env.REACT_APP_API_KEY; // Asegúrate de usar el prefijo REACT_APP_ para las variables de entorno en create-react-app

const useAvatar = () => {
  const [avatar, setAvatar] = useState();

  const avatars = async (nickname) => {
    try {
      const response = await fetch(
        `https://api.multiavatar.com/${nickname}.svg?apikey=${apikey}`
      );
      const svg = await response.text();
      const adjustedSvg = svg.replace('<svg ', '<svg width="50" height="50" ');
      setAvatar(adjustedSvg);
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
    return avatar;
  };

  return { avatar, avatars };
};

export default useAvatar;

export const getAvatar = async (nickname, size = 50) => {
  try {
    const response = await fetch(
      `https://api.multiavatar.com/${nickname}.svg?apikey=${apikey}`
    );
    let svg = await response.text();
    svg = svg.replace('<svg ', `<svg width="${size}" height="${size}" `);
    return svg;
  } catch (error) {
    console.error('Error fetching avatar:', error);
    throw error;
  }
};
