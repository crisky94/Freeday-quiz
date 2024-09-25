import { v2 as cloudinary } from 'cloudinary';
// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY, // Reemplaza con tu cloud_name
  api_key: process.env.API_KEY_CLOUDINARY, // Reemplaza con tu api_key
  api_secret: process.env.API_SECRET_CLOUDINARY, // Reemplaza con tu api_secret
});

export const uploadToCloudinary = (imagePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(imagePath, (error, result) => {
      if (error) {
        reject(error); // Si hay un error, rechaza la promesa
      } else {
        resolve(result); // Si no hay error, resuelve la promesa con el resultado
      }
    });
  });
};

export default uploadToCloudinary;