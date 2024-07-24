// utils/avatarUtils.js
export const getAvatar = async (nickname, apikey, size = 50) => {
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
