import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import uploadToCloudinary from '@/lib/uploadCloudinary';
// Habilitar la lectura de archivos en el servidor
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), '/tmp'); // Directorio temporal para almacenar el archivo subido
  form.keepExtensions = true; // Mantener las extensiones originales

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al subir archivo' });
    }

    const file = files.image[0];
    const filePath = file.filepath;

    try {
      // Subir el archivo a Cloudinary
      const result = await uploadToCloudinary(filePath);

      // Eliminar el archivo temporal
      fs.unlinkSync(filePath);

      // Enviar la URL de la imagen de Cloudinary como respuesta
      res.status(200).json({ imageUrl: result.secure_url });
    } catch (error) {
      // Eliminar el archivo temporal en caso de error
      fs.unlinkSync(filePath);
      res.status(500).json({ error: 'Error al subir a Cloudinary' });
    }
  });
}
