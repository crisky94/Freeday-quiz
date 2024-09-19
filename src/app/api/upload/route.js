import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import uploadToCloudinary from '@/lib/uploadCloudinary';

export const POST = async (req) => {
  try {
    // Obtener el formData de la solicitud
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha subido ninguna imagen.' },
        { status: 400 }
      );
    }

    // Convertir el archivo a un buffer usando arrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Definir la ruta de la carpeta 'uploads'
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Crear la carpeta 'uploads' si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Definir la ruta completa donde se guardará el archivo
    const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);

    // Guardar el buffer temporalmente en el sistema de archivos
    await fs.promises.writeFile(filePath, buffer);

    // Subir el archivo a Cloudinary
    const uploadedImage = await uploadToCloudinary(filePath);

    // Eliminar el archivo temporal después de la subida
    await fs.promises.unlink(filePath);

    return NextResponse.json({ imageUrl: uploadedImage.url }, { status: 200 });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return NextResponse.json(
      { error: 'Error al subir imagen' },
      { status: 500 }
    );
  }
};

// import formidable from 'formidable';
// import fs from 'fs';
// import path from 'path';
// // Habilitar la lectura de archivos en el servidor
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(req, res) {
//   const form = new formidable.IncomingForm();
//   form.uploadDir = path.join(process.cwd(), '/tmp'); // Directorio temporal para almacenar el archivo subido
//   form.keepExtensions = true; // Mantener las extensiones originales

//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al subir archivo' });
//     }

//     const file = files.image[0];
//     const filePath = file.filepath;

//     try {
//       // Subir el archivo a Cloudinary
//       const result = await uploadToCloudinary(filePath);

//       // Eliminar el archivo temporal
//       fs.unlinkSync(filePath);

//       // Enviar la URL de la imagen de Cloudinary como respuesta
//       res.status(200).json({ imageUrl: result.secure_url });
//     } catch (error) {
//       // Eliminar el archivo temporal en caso de error
//       fs.unlinkSync(filePath);
//       res.status(500).json({ error: 'Error al subir a Cloudinary' });
//     }
//   });
// }
